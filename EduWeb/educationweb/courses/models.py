from _ast import mod
from django.utils import timezone
import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from cloudinary.models import CloudinaryField


class User(AbstractUser):
    avatar = CloudinaryField('avatar', null=True, blank=True)
    phoneNumber = models.CharField(max_length=255)
    is_teacher = models.BooleanField(default=False)
    is_student = models.BooleanField(default=False)
    qualification = models.CharField(max_length=200)
    activate_token = models.UUIDField(default=uuid.uuid4, editable=False, null=True)
    is_active = models.BooleanField(default=True)




class Teacher(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    def __str__(self):
        return self.user.username






class Category(models.Model):
    title = models.CharField(max_length=150,null=True)

    def __str__(self):
        return self.title

class Student(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    interesting_cate = models.TextField(null=True)

    def __str__(self):
        return self.user.username

class Time(models.Model):
    create_date = models.DateField(auto_now_add=True)
    update_date = models.DateField(auto_now=True)
    class Meta:
        abstract = True

class Common(Time):
    title = models.CharField(max_length=150)
    description = models.TextField(null=True,blank=True)
    create_date = models.DateField(auto_now_add=True)
    update_date = models.DateField(auto_now=True)
    class Meta:
        abstract = True


class Course(Common):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, default=1)
    teacher = models.ForeignKey(Teacher,on_delete=models.CASCADE)
    publish = models.BooleanField(default=False)
    price = models.IntegerField(default=0)
    thumbnail = CloudinaryField('thumbnail',null = True)


    def __str__(self):
        return self.title


class Lesson(models.Model):
    course = models.ForeignKey(Course,on_delete=models.CASCADE)
    title = models.CharField(max_length=150)
    resource = CloudinaryField('resource', resource_type='raw', null=True, blank=True)

    def __str__(self):
        return self.title


class Chapter(Common):
    course = models.ForeignKey(Course,on_delete=models.CASCADE,related_name='chapters')
    video = CloudinaryField('video', resource_type='video', null=True, blank=True)
    position = models.PositiveIntegerField(editable=False)
    is_free = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.pk is None:
            max_position = Chapter.objects.filter(course=self.course).aggregate(models.Max('position'))['position__max']
            if max_position is None:
                max_position = 0
            self.position = max_position + 1
        super().save(*args, **kwargs)
    def __str__(self):
        return self.title

class UserProgress(Time):
    is_completed = models.BooleanField(default=False)
    student = models.ForeignKey(Student,on_delete=models.CASCADE)
    chapter = models.ForeignKey(Chapter,on_delete=models.CASCADE,null=True)
    class Meta:
        unique_together = ('student', 'chapter')





class Purchase(Time):
    student = models.ForeignKey(Student,on_delete=models.CASCADE)
    course = models.ForeignKey(Course,on_delete=models.CASCADE)
    class Meta:
        unique_together = ('student', 'course')


class StripeCustomer(Time):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    stripeCustomerId = models.CharField(max_length=255, unique=True)



class Interaction(Time):
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    class Meta:
        abstract = True
        unique_together = ('student', 'course')

class Rating(Interaction):
    rate = models.IntegerField()



class Comment(Interaction):
    content = models.CharField(max_length=150)


class Note(Time):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE)
    timestamp = models.FloatField()
    content = models.TextField()
    def __str__(self):
        return f"Note at {self.timestamp}s by {self.student.user.username}"

class QuizQuestion(models.Model):
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='quiz_questions')
    question = models.CharField(max_length=255)
    timestamp = models.FloatField()
    correct_answer = models.ForeignKey('QuizAnswer', on_delete=models.SET_NULL, null=True, related_name='correct_for')



class QuizAnswer(models.Model):
    question = models.ForeignKey(QuizQuestion, on_delete=models.CASCADE, related_name='answers')
    answer = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)


class Exam(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE, related_name='exams')
    create_date = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    course = models.OneToOneField(Course, on_delete=models.CASCADE, related_name='exam', null=True, blank=True)

    def __str__(self):
        return self.title

class Question(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE, related_name='questions')
    content = models.CharField(max_length=255)

    def __str__(self):
        return self.content


class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers', null=True, blank=True)
    content = models.CharField(max_length=255)
    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.content} ({'Correct' if self.is_correct else 'Incorrect'})"


class StudentExam(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    score = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=50, default='In Progress')
    submit_date = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = ('student', 'exam')

    def __str__(self):
        return f"{self.student.user.username} - {self.exam.title}"


class StudentAnswer(models.Model):
    student_exam = models.ForeignKey(StudentExam, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    selected_answer = models.ForeignKey(Answer, on_delete=models.CASCADE)
    is_correct = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.selected_answer.is_correct:
            self.is_correct = True
        super().save(*args, **kwargs)




