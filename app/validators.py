from marshmallow import Schema, fields, validate, validates, post_load, ValidationError
from datetime import datetime, time
import re

class ReviewSchema(Schema):
    '''Validate review input'''
    review = fields.Str(required=True, validate=validate.Length(min=10, max=1000))
    rating = fields.Int(required=True, validate=validate.Range(min=1, max=5))


class UserRegistrationSchema(Schema):
    '''Ensure user data meets our standards'''
    username = fields.Str(required=True, validate=[
        validate.Length(min=3, max=50),
        validate.Regexp(r'[a-zA-Z0-9_]+$', error="Username can only contain letters, numbers, and underscores.")
    ])
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))

class AddressSchema(Schema):
    '''Validate address input'''
    street = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    city = fields.Str(required=True, validate=validate.Length(min=1, max=50))
    state = fields.Str(required=True, validate=validate.Length(min=2, max=2))
    zip_code = fields.Str(required=True)
    country = fields.Str(required=True, validate=validate.OneOf(['US', 'CA'], error="Country must be either 'US' or 'CA'"))

    @validates(zip_code)
    def validate_zip_code(self, value):
        '''Validate zip code based on country context.
        This shows how nested schemas can be context-aware.
        '''

        #Since country might not be processed yet, we'll validate format generally.
        us_pattern = re.compile(r'^\d{5}(-\d{4})?$')  # 12345 or 12345-6789
        ca_pattern = re.compile(r'^[A-Z]\d[A-Z]\s?\d[A-Z]\d$')

        if not (us_pattern.match(value) or ca_pattern.match(value)):
            raise ValidationError("Invalid zip code format. Use XXXXX or XXXXX-XXXX for US, and A1A 1A1 for CA.")
        
        @validates('state')
        def validate_state(self, value):
            """Ensure state codes are uppercase and valid"""
            valid_states = {
                'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
                'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
                'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
                'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
                'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
            }
            
            upper_value = value.upper()
            if upper_value not in valid_states:
                raise ValidationError(f"{value} is not a valid US state code")
        
        @post_load
        def normalize_address(self, data, **kwargs):
            """
            Post-processing to ensure consistent formatting.
            This runs after all field validation passes.
            """
            # Ensure state is uppercase
            data['state'] = data['state'].upper()
            
            # Normalize postal code spacing for Canadian codes
            if 'country' in data and data['country'] == 'CA':
                # Ensure Canadian postal codes have the space
                pc = data['postal_code'].replace(' ', '')
                if len(pc) == 6:
                    data['postal_code'] = f"{pc[:3]} {pc[3:]}"
            
            return data
        
class MenuItemSchema(Schema):
    '''Validate menu item input'''
    name = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    description = fields.Str(validate=validate.Length(max=500))
    price = fields.Decimal(required=True, places=2, validate=validate.Range(min=0.01, max=9999.99))
    category = fields.Str(required=True, validate=validate.OneOf([
        'beef', 'pork', 'poultry', 'seafood', 'prepared', 'deli', 'other'
    ]))
    available = fields.Bool(missing=True)
    special_offer = fields.Bool(missing=False)
    special_price = fields.Decimal(places=2, allow_none=True)

    @validates('name')
    def validate_name(self, value):
        if not value.isalpha():
            raise ValidationError("Name must contain only alphabetic characters.")