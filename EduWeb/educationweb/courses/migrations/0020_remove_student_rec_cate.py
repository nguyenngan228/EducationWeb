# Generated by Django 5.0.7 on 2024-09-25 16:32

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0019_student_rec_cate'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='student',
            name='rec_cate',
        ),
    ]
