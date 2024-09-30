# Generated by Django 5.1.1 on 2024-09-30 20:03

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ai_layers', '0002_agent_is_public_agent_user_alter_agent_act_as_and_more'),
        ('rag', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='collection',
            name='agent',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='ai_layers.agent'),
        ),
    ]
