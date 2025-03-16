# Generated by Django 5.0.7 on 2025-03-16 14:04

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('courses', '0024_exam_answer_student_exam'),
    ]

    operations = [
        migrations.RenameField(
            model_name='answer',
            old_name='answer_exam',
            new_name='content',
        ),
        migrations.RenameField(
            model_name='exam',
            old_name='question_exam',
            new_name='title',
        ),
        migrations.RemoveField(
            model_name='answer',
            name='question_exam',
        ),
        migrations.AddField(
            model_name='answer',
            name='is_correct',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='exam',
            name='create_date',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        migrations.AddField(
            model_name='exam',
            name='description',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='exam',
            name='teacher',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='exams', to='courses.teacher'),
        ),
        migrations.CreateModel(
            name='Question',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.CharField(max_length=255)),
                ('exam', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='questions', to='courses.exam')),
            ],
        ),
        migrations.AddField(
            model_name='answer',
            name='question',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='courses.question'),
        ),
        migrations.CreateModel(
            name='StudentExam',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('score', models.FloatField(blank=True, null=True)),
                ('status', models.CharField(default='In Progress', max_length=50)),
                ('submit_date', models.DateTimeField(blank=True, null=True)),
                ('exam', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='courses.exam')),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='courses.student')),
            ],
            options={
                'unique_together': {('student', 'exam')},
            },
        ),
        migrations.DeleteModel(
            name='Student_Exam',
        ),
    ]
