# Generated by Django 5.1.1 on 2024-10-28 06:20

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('finetuning', '0003_traininggenerator_agent'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='traininggenerator',
            name='generation_model',
        ),
    ]
