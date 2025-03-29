from django import forms
from chef_ai.models import Ingredient

class ingredientList(forms.Form):
    
    ingredient_types = Ingredient.objects.values_list('ingredient_type',flat=True).distinct()
    
    for type in ingredient_types:
        ingredients = Ingredient.objects.filter(ingredient_type=type)
        
        choices = [(ingredient.ingredient_name, ingredient.ingredient_name) for ingredient in ingredients]
        field_name = f"{type.upper()}"
        locals()[field_name] = forms.MultipleChoiceField(choices = choices, widget=forms.CheckboxSelectMultiple, required=False)
    
