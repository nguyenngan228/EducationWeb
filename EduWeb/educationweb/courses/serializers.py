from .models import (Category, Course, Teacher, User,
                     Lesson, Student, Chapter, UserProgress,
                     Purchase, StripeCustomer, Rating, Comment,
                     Note, QuizQuestion, QuizAnswer)
from rest_framework import serializers, request


class UserSerializer(serializers.ModelSerializer):

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.avatar:
            if hasattr(instance.avatar, 'url'):
                rep['avatar'] = instance.avatar.url
            else:
                rep['avatar'] = None
        else:
            rep['avatar'] = None
        return rep

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'username', 'password', 'email', 'is_teacher', 'is_student',
                  'phoneNumber', 'avatar', 'qualification', 'is_active']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()

        if validated_data.get('is_teacher', False):
            Teacher.objects.create(user=user)

        return user


class StudentSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Student
        fields = '__all__'


class TeacherSerializer(serializers.ModelSerializer):
    user = UserSerializer()

    class Meta:
        model = Teacher
        fields = '__all__'


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ChapterSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.video:
            rep['video'] = instance.video.url
        return rep

    class Meta:
        model = Chapter
        fields = '__all__'


class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = '__all__'


class TeacherCourseSerializer(serializers.ModelSerializer):
    chapter = serializers.IntegerField(read_only=True)
    review = serializers.FloatField(read_only=True)
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.thumbnail:
            if hasattr(instance.thumbnail, 'url'):
                rep['thumbnail'] = instance.thumbnail.url
            else:
                rep['thumbnail'] = None
        else:
            rep['thumbnail'] = None
        if instance.category:
            rep['category'] = {
                'id': instance.category.id,
                'title': instance.category.title
            }
        else:
            rep['category'] = None
        return rep

    class Meta:
        model = Course
        fields = ['id', 'category', 'teacher', 'publish',
                  'price', 'thumbnail', 'chapter', 'title',
                  'description', 'create_date', 'update_date','review']


class CourseSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    teacher = TeacherSerializer()
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    userProgress = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    is_purchased = serializers.SerializerMethodField()

    def get_userProgress(self, obj):
        request = self.context.get('request', None)
        if request is not None:
            user = request.user
            if user.is_authenticated and hasattr(user, 'student') and self.get_is_purchased(obj):
                return UserProgressSerializer(UserProgress.objects.filter(student=user.student, chapter__course=obj),
                                              many=True).data
        return []

    def get_progress(self, obj):
        request = self.context.get('request', None)
        if request is not None:
            user = request.user
            if user.is_authenticated and hasattr(user, 'student') and self.get_is_purchased(obj):
                return self.calculate_progress(user.id, obj.id)
        return None

    def get_is_purchased(self, obj):
        request = self.context.get('request', None)
        if request is not None:
            user = request.user
            if user.is_authenticated and hasattr(user, 'student'):
                return Purchase.objects.filter(student=user.student, course=obj).exists()
        return False

    def calculate_progress(self, user_id, course_id):
        try:
            student = Student.objects.get(user_id=user_id)
        except Student.DoesNotExist:
            return 0

        published_chapters = Chapter.objects.filter(course_id=course_id)
        published_chapter_ids = published_chapters.values_list('id', flat=True)

        completed_chapters_count = UserProgress.objects.filter(student_id=student,
                                                               chapter_id__in=published_chapter_ids,
                                                               is_completed=True).count()

        total_chapters_count = published_chapters.count()
        if total_chapters_count == 0:
            return 0

        return (completed_chapters_count / total_chapters_count) * 100

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get('request', None)
        if request is not None:
            user = request.user
            rep['thumbnail'] = instance.thumbnail.url
            rep['category'] = {
                'id': instance.category.id,
                'title': instance.category.title
            }
            # if user.is_authenticated and Teacher.objects.filter(user=user).exists():
            #     return {
            #         'id': rep['id'],
            #         'category': rep['category'],
            #         'teacher': rep['teacher'],
            #         'publish': rep['publish'],
            #         'price': rep['price'],
            #         'thumbnail': rep['thumbnail'],
            #         'chapters': rep['chapters'],
            #         'title': rep['title'],
            #         'description': rep['description'],
            #         'create_date': rep['create_date'],
            #         'update_date': rep['update_date']
            #     }
            return rep

    def update(self, instance, validated_data):

        if 'category' in validated_data:
            category = validated_data.pop('category')
            instance.category = category

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

    class Meta:
        model = Course
        fields = ['id', 'category', 'teacher', 'publish',
                  'price', 'thumbnail', 'chapters', 'title',
                  'description', 'create_date', 'update_date', 'userProgress', 'progress', 'is_purchased']

class UserCourseSerializer(serializers.ModelSerializer):
    chapters = ChapterSerializer(many=True, read_only=True)
    category = CategorySerializer()

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get('request', None)
        if request is not None:
            rep['thumbnail'] = instance.thumbnail.url
            rep['category'] = {
                'id': instance.category.id,
                'title': instance.category.title
            }
            return rep
    class Meta:
        model = Course
        fields = ['id', 'category', 'teacher', 'publish',
                  'price', 'title', 'chapters',
                  'description', 'create_date', 'update_date']
class LessonSerializer(serializers.ModelSerializer):
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['resource'] = instance.resource.url
        return rep

    class Meta:
        model = Lesson
        fields = '__all__'


class PurchaseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Purchase
        fields = '__all__'


class StripeCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = StripeCustomer
        fields = '__all__'


class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = '__all__'


class RatingSerializer(serializers.ModelSerializer):
    student = StudentSerializer()

    class Meta:
        model = Rating
        fields = '__all__'


class CommentSerializer(serializers.ModelSerializer):
    student = StudentSerializer()

    class Meta:
        model = Comment
        fields = '__all__'


class NoteSerializer(serializers.ModelSerializer):
    student = StudentSerializer()

    class Meta:
        model = Note
        fields = '__all__'


class QuizAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuizAnswer
        fields = '__all__'


class QuizQuestionSerializer(serializers.ModelSerializer):
    list_answers = QuizAnswerSerializer(many=True, read_only=True, source='answers')

    class Meta:
        model = QuizQuestion
        fields = ['id', 'question', 'timestamp', 'chapter', 'correct_answer', 'list_answers']


class GoogleLoginSerializer(serializers.Serializer):
    token = serializers.CharField()


class GeminiChatSerializer(serializers.Serializer):
    message = serializers.CharField()