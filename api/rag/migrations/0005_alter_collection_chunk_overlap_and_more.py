# Generated by Django 5.1.1 on 2024-10-15 00:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rag', '0004_collection_conversation'),
    ]

    operations = [
        migrations.AlterField(
            model_name='collection',
            name='chunk_overlap',
            field=models.IntegerField(default=200),
        ),
        migrations.AlterField(
            model_name='collection',
            name='chunk_size',
            field=models.IntegerField(default=2000),
        ),
    ]