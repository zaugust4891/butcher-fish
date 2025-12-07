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
        
        
class NutritionInfoSchema(Schema):
    """Nested schema for nutritional information"""
    calories = fields.Int(required=True, validate=validate.Range(min=0, max=5000))
    protein_g = fields.Float(validate=validate.Range(min=0))
    fat_g = fields.Float(validate=validate.Range(min=0))
    carbs_g = fields.Float(validate=validate.Range(min=0))
    
    @validates_schema
    def validate_macros(self, data, **kwargs):
        """
        Cross-field validation: ensure macronutrients make sense together.
        This demonstrates how nested schemas can enforce business logic.
        """
        # Calculate expected calories from macros (roughly)
        protein = data.get('protein_g', 0)
        fat = data.get('fat_g', 0)
        carbs = data.get('carbs_g', 0)
        
        expected_calories = (protein * 4) + (fat * 9) + (carbs * 4)
        actual_calories = data.get('calories', 0)
        
        # Allow 20% margin of error
        if abs(expected_calories - actual_calories) > actual_calories * 0.2:
            raise ValidationError(
                f"Calories ({actual_calories}) don't match macronutrients. "
                f"Expected approximately {expected_calories:.0f} calories."
            )
        

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

    # Nested schemas for complex data
    nutrition = fields.Nested(NutritionInfoSchema, allow_none=True)
    
    # List of allergens - demonstrates list validation
    allergens = fields.List(
        fields.Str(validate=validate.OneOf([
            'gluten', 'dairy', 'eggs', 'soy', 'nuts', 'shellfish', 'fish'
        ])),
        validate=validate.Length(max=7)  # Can't have more allergens than we define
    )

    @validates('name')
    def validate_name(self, value):
        if not value.isalpha():
            raise ValidationError("Name must contain only alphabetic characters.")
        
    @validates_schema
    def validate_special_pricing(self, data, **kwargs):
        """
        Conditional validation: if special_offer is True, special_price must be provided
        and must be less than regular price.
        """
        if data.get('special_offer', False):
            special_price = data.get('special_price')
            if special_price is None:
                raise ValidationError(
                    'special_price is required when special_offer is True',
                    field_name='special_price'
                )
            
            regular_price = data.get('price')
            if special_price >= regular_price:
                raise ValidationError(
                    f'Special price ({special_price}) must be less than regular price ({regular_price})',
                    field_name='special_price'
                )
