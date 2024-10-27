# Generated by Django 5.1.1 on 2024-10-27 01:34

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('whatsapp', '0002_wscontact_wsconversation_user_contact'),
    ]

    operations = [
        migrations.AddField(
            model_name='wsmessage',
            name='collected_info',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='wsmessage',
            name='reaction',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
