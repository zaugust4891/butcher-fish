import json
from functools import wraps
from flask import current_app, make_response

#We need flask's global current_app to get the Redis Client, wraps to preserve the function names, and make_response to turn cached bytes into a real Flask response.

# key_builder must be a callable returning a unique Redis key(often just a constant or a lambda that inspects request.args)
def redis_cache(key_builder, ttl=300): #ttl time to live in seconds.
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            #grab the redis client hung on the Flask app in create_app(). Build the cache key (e.g., 'market_all')
            redis_client = current_app.redis_client
            key = key_builder(*args, **kwargs)
            #Cache hit branch: if key exists, return its bytes as JSON without calling the underlying view - we bypass Postgres entirely.
            cached = redis_client.get(key)
            if cached:
                return make_response(
                    cached,
                    200,
                    {'Content-Type': 'application/json'}
                )
            #cache miss: run the real route handler. resp is a Flask Response.
            resp = fn(*args, **kwargs)
            if resp.status_code == 200:
                redis_client.setex(key, ttl, resp.get_data())
                #Only cache successful (HTTP) responses.
                #setex = "SET value and EXpire after N seconds."
                return resp
        return wrapper
    return decorator
    #Return the original response to flask