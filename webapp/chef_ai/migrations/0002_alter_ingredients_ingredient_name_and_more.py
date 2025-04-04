# Generated by Django 5.1.7 on 2025-03-24 02:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chef_ai', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ingredients',
            name='ingredient_name',
            field=models.CharField(max_length=75),
        ),
        migrations.AlterField(
            model_name='ingredients',
            name='ingredient_type',
            field=models.CharField(choices=[('pantry', 'Pantry'), ('spice', 'Spice'), ('protein', 'Protein'), ('vegetable', 'Vegetable'), ('dairy', 'Dairy'), ('grain', 'Grain'), ('oil', 'Oil'), ('fruit', 'Fruit'), ('other', 'Other')], default='other', max_length=50),
        ),
    ]
