# Generated by Django 5.1.1 on 2024-10-27 09:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('whatsapp', '0008_wsmessage_message_platform_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='wsmessage',
            name='message_platform_id',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
