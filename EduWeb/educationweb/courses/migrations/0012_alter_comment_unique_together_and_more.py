# Generated by Django 5.0.7 on 2024-08-28 13:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0011_alter_chapter_position_and_more'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='comment',
            unique_together={('student', 'course')},
        ),
        migrations.AlterUniqueTogether(
            name='rating',
            unique_together={('student', 'course')},
        ),
    ]
