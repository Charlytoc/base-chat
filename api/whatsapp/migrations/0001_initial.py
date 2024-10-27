# Generated by Django 5.1.1 on 2024-10-22 17:58

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('ai_layers', '0009_agent_llm'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='WSConversation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('user_number', models.CharField(max_length=30)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('status', models.CharField(choices=[('ACTIVE', 'Active'), ('INACTIVE', 'Inactive')], default='ACTIVE', max_length=8)),
            ],
        ),
        migrations.CreateModel(
            name='WSMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('message_type', models.CharField(choices=[('USER', 'User'), ('ASSISTANT', 'Assistant')], max_length=9)),
                ('conversation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='whatsapp.wsconversation')),
            ],
        ),
        migrations.CreateModel(
            name='WSNumber',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('number', models.CharField(max_length=15)),
                ('platform_id', models.CharField(blank=True, max_length=50, null=True)),
                ('verified', models.BooleanField(default=False)),
                ('certicate_b64', models.TextField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('agent', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='whatsapp_numbers', to='ai_layers.agent')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='whatsapp_numbers', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='wsconversation',
            name='ai_number',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='whatsapp.wsnumber'),
        ),
    ]
