import json
import redis
from functools import wraps
from flask import current_app, make_response, request
from flask_jwt_extended import get_jwt, verify_jwt_in_request_optional

def key_user_cutover(uid: int | str) -> str:
    """Generate a Redis key for user-specific data, e.g., login sessions."""

    return f"{_ns()}:logout_after:{uid}"

def _http_ns() -> str:
    ns = current_app.config.get('REDIS_NAMESPACE', 'app')
    return f"{ns}:http"

# key_builder must be a callable returning a unique Redis key(often just a constant or a lambda that inspects request.args)
def redis_cache(key_builder,  ttl: int = 300, content_type: str = "application/json", vary_by_user: bool = False): #ttl time to live in seconds.
    """Cache a Flask Response body for read-heavy endpoints.
 - key_builder: callable(*args, **kwargs) -> str; if None, derive from request.path + sorted querystring
- ttl: seconds to keep the cache  - vary_by_user: include user id (if any) in the cache key
   - content_type: returned Content-Type for cached hits
   """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            #Build a stable base key
            if key_builder:
                base = key_builder(*args, **kwargs)
            else:
                qs = "&".join(f"{k}={v}" for k, v in sorted(request.args.items()))
                base = f"{request.path}?{qs}" if qs else f"route:{request.path}"
            key = f"{_http_ns()}:{base}"
            if vary_by_user:
                #If vary_by_user is True, append the user ID to the key if available.
                #This allows caching the same route for different users.
                #If the user is not logged in, we still cache it under a generic key.
                try:
                    verify_jwt_in_request_optional()
                    uid = get_jwt().get('sub')
                    if uid:
                        key = f"{key}::u={uid}"
                except Exception:
                    pass             
            cached = redis_client.get(key)
            if cached is not None:
                return make_response(
                    cached,
                    200,
                    {'Content-Type': content_type}
                )
            #If no cache hit, call the original function.
            resp = fn(*args, **kwargs)
            try:
                if getattr(resp, 'status_code', None) == 200:
                    body = resp.get_data(as_text=True) #Get the response body as text.
                    #Store the response body in Redis with the key and TTL.
                    redis_client.setex(key, ttl, body)
            finally:
                #Always return the original response object.
                return resp
        return wrapper
    return decorator
    #Return the original response to flask