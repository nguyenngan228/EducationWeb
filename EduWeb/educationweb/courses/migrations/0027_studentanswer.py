# Generated by Django 5.0.7 on 2025-03-16 15:35

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0026_exam_course'),
    ]

    operations = [
        migrations.CreateModel(
            name='StudentAnswer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_correct', models.BooleanField(default=False)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='courses.question')),
                ('selected_answer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='courses.answer')),
                ('student_exam', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='courses.studentexam')),
            ],
        ),
    ]
