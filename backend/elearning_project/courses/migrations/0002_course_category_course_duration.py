# Generated by Django 5.1.1 on 2024-09-08 17:08

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='course',
            name='category',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
        migrations.AddField(
            model_name='course',
            name='duration',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
