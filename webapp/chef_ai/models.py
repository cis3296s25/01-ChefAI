from django.db import models

# Create your models here.
class Ingredient(models.Model):
    
    ingredient_name = models.CharField(max_length=75, unique=True, blank=False)
    ingredient_type = models.CharField(max_length=50, default='other')
    