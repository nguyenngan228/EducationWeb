# Generated by Django 5.0.7 on 2024-08-29 17:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0014_quizanswer_quizquestion_quizanswer_question'),
    ]

    operations = [
        migrations.AddField(
            model_name='quizanswer',
            name='is_correct',
            field=models.BooleanField(default=False),
        ),
    ]
