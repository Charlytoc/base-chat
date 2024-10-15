# Generated by Django 5.1.1 on 2024-10-14 22:32

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ai_layers', '0008_alter_agent_frequency_penalty_alter_agent_max_tokens_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='agent',
            name='llm',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='ai_layers.languagemodel'),
        ),
    ]
