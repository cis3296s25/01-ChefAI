from django import forms

OPTIONS = [
    ('butter', 'Butter'),
    ('egg', 'Egg'),
    ('garlic', 'Garlic'),
    ('onion', 'Onion'),
    ('milk', 'Milk'),
    ('sugar', 'Sugar'),
]

class ingredientList(forms.Form):
    choices = forms.MultipleChoiceField(
        choices=OPTIONS,
        widget=forms.CheckboxSelectMultiple,
        required=False,
    )