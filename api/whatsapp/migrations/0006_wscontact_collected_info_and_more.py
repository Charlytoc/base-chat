# Generated by Django 5.1.1 on 2024-10-27 01:51

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('whatsapp', '0005_wscontact_age_wscontact_gender_wscontact_language'),
    ]

    operations = [
        migrations.AddField(
            model_name='wscontact',
            name='collected_info',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='wsmessage',
            name='collected_info',
            field=models.TextField(blank=True, null=True),
        ),
    ]
