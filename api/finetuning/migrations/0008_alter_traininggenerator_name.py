# Generated by Django 5.1.1 on 2024-11-23 05:16

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('finetuning', '0007_traininggenerator_status'),
    ]

    operations = [
        migrations.AlterField(
            model_name='traininggenerator',
            name='name',
            field=models.CharField(max_length=255),
        ),
    ]
