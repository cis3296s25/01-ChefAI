# Generated by Django 5.1.7 on 2025-03-29 15:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chef_ai', '0003_rename_ingredients_ingredient'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ingredient',
            name='ingredient_type',
            field=models.CharField(default='other', max_length=50),
        ),
    ]
