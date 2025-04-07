from django.http import JsonResponse, HttpResponse
from rest_framework import viewsets, generics, parsers, permissions, status
from .models import (Category, Course, Teacher, User,
                     Exam, Chapter, Student, UserProgress,
                     Purchase, StripeCustomer, Rating, Comment,
                     Note, QuizQuestion, QuizAnswer, Question, Answer,
                     StudentExam, StudentAnswer)
from rest_framework.response import Response
from courses import serializers, paginators, perms
from rest_framework.decorators import action
import stripe
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Max, Count
from google.auth.transport import requests
from google.oauth2 import id_token
from .dao import (generate_system_token_for_user, send_activation_email,
                  calculate_review, calculate_student, calculate_average_review, get_analytics,
                  is_all_chapter_completed)
from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth import get_user_model
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import csv
import google.generativeai as genai
from decouple import config
from django.core.cache import cache
from django.views.decorators.cache import cache_page
from django.utils.decorators import method_decorator
from django.core.files.storage import default_storage
import os
import cloudinary
from django.utils import timezone


class UserViewSet(viewsets.ViewSet, generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = serializers.UserSerializer
    parser_classes = [parsers.JSONParser, parsers.MultiPartParser]

    def get_permissions(self):
        if self.action.__eq__('current_user'):
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = self.perform_create(serializer)
        send_activation_email(user, request)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        return serializer.save()

    @action(methods=['get'], detail=False, url_path='activate', url_name='activate')
    def activate_account(self, request):
        token = request.GET.get('token')

        if not token:
            return Response({'error': 'Token is required'}, status=status.HTTP_400_BAD_REQUEST)

        token_cleaned = token.replace('-', '')

        User = get_user_model()
        user = get_object_or_404(User, activate_token=token_cleaned)

        if user.is_active:
            return Response({'message': 'Account already activated'}, status=status.HTTP_400_BAD_REQUEST)

        user.is_active = True
        user.activate_token = None
        user.save()
        return redirect(f'{settings.DOMAIN}active')

    @action(methods=['get'], detail=False)
    def current_user(self, request):
        return Response(serializers.UserSerializer(request.user).data)


class TeacherViewSet(viewsets.ModelViewSet, viewsets.GenericViewSet):
    queryset = Teacher.objects.all()
    serializer_class = serializers.TeacherSerializer
    # permission_classes = [permissions.IsAuthenticated]
    pagination_class = paginators.TeacherCoursePaginator

    @action(methods=['get'], detail=False)
    def get_courses(self, request):
        teacher = Teacher.objects.get(user=request.user)
        courses = Course.objects.filter(teacher_id=teacher.id).order_by('id')
        q = request.query_params.get("q")
        if q:
            courses = courses.filter(title__icontains=q)
        page = self.paginate_queryset(courses)
        if page is not None:
            serializer = serializers.CourseSerializer(page, many=True, context={'request': request})
            return self.get_paginated_response(serializer.data)
        serializer = serializers.TeacherCourseSerializer(courses, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['get'], detail=False)
    def analytics(self, request):
        teacher = Teacher.objects.get(user=request.user)
        analytics_data = get_analytics(teacher.user.id)
        return Response(analytics_data, status=status.HTTP_200_OK)

    @action(methods=['patch'], detail=False)
    def update_teacher(self, request, pk=None):
        user = request.user
        teacher = Teacher.objects.filter(user_id=user.id).first()

        data = request.data.copy()
        user_data = {
            'first_name': data.get('first_name', user.first_name),
            'last_name': data.get('last_name', user.last_name),
            'email': data.get('email', user.email),
            'avatar': data.get('avatar', user.avatar),
            'phoneNumber': data.get('phoneNumber', user.phoneNumber),
            'qualification': data.get('qualification', user.qualification)

        }
        user_serializer = serializers.UserSerializer(user, data=user_data, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
        else:
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        teacher_serializer = serializers.TeacherSerializer(teacher, data=data, partial=True)
        if teacher_serializer.is_valid():
            teacher_serializer.save()
            return Response(teacher_serializer.data, status=status.HTTP_200_OK)
        return Response(teacher_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], detail=False)
    def total_review(self, request):
        teacher = request.query_params.get('teacher_id')
        course = Course.objects.filter(teacher_id=teacher)
        total = calculate_review(course)
        return Response(total, status=status.HTTP_200_OK)

    @action(methods=['get'], detail=False)
    def total_student(self, request):
        teacher = request.query_params.get('teacher_id')
        course = Course.objects.filter(teacher_id=teacher)
        total = calculate_student(course)
        return Response(total, status=status.HTTP_200_OK)


class UserCourseViewSet(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = serializers.UserCourseSerializer
    pagination_class = paginators.CoursePaginator

    def get_queryset(self):
        queryset = Course.objects.filter(publish=True).all()
        q = self.request.query_params.get("q")
        if q:
            queryset = queryset.filter(title__icontains=q)
        cate_id = self.request.query_params.get('category_id')
        if cate_id:
            queryset = queryset.filter(category_id=cate_id)
        queryset = queryset.order_by('id')
        return queryset

    @action(methods=['get'], detail=False)
    def export_csv(self, request):
        # Lấy dữ liệu khóa học được xuất ra CSV
        courses = Course.objects.filter(publish=True).values('id', 'title',
                                                             'category__title',
                                                             'price')  # Truy vấn với tên của category

        # Chuyển dữ liệu thành DataFrame của Pandas
        df = pd.DataFrame(courses)

        # Tạo response cho việc xuất dữ liệu CSV
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="coursesAI.csv"'

        # Ghi DataFrame vào response
        df.to_csv(path_or_buf=response, index=False)

        return response


# @method_decorator(cache_page(60), name='list')
class CategoryViewSet(viewsets.ViewSet, generics.ListAPIView, generics.CreateAPIView):
    queryset = Category.objects.all()
    serializer_class = serializers.CategorySerializer


class CourseViewSet(viewsets.ViewSet, generics.ListAPIView, generics.RetrieveAPIView):
    serializer_class = serializers.CourseSerializer
    pagination_class = paginators.CoursePaginator
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Course.objects.all()
        if self.action == 'list':
            if not self.request.query_params.get('create_chapter'):
                queryset = queryset.filter(publish=True)

        q = self.request.query_params.get("q")
        if q:
            queryset = queryset.filter(title__icontains=q)

        cate_id = self.request.query_params.get('category_id')
        if cate_id:
            queryset = queryset.filter(category_id=cate_id).order_by('id')

        return queryset

    # def get_queryset(self):
    #     cache_key = f"user_courses:{self.request.GET.urlencode()}"
    #
    #     start_time = time.time()  # Bắt đầu đếm thời gian
    #
    #     cached_data = cache.get(cache_key)
    #     if cached_data:
    #         print(f"🔥 Lấy từ cache! Thời gian: {time.time() - start_time} giây")
    #         return cached_data
    #
    #     queryset = Course.objects.filter(publish=True)
    #
    #     q = self.request.query_params.get("q")
    #     if q:
    #         queryset = queryset.filter(title__icontains=q)
    #
    #     cate_id = self.request.query_params.get('category_id')
    #     if cate_id:
    #         queryset = queryset.filter(category_id=cate_id)
    #
    #     queryset = queryset.order_by('id')
    #
    #     # Lưu vào cache trong 5 phút (300 giây)
    #     cache.set(cache_key, queryset, timeout=300)
    #
    #     print(f"⚙️ Lấy từ database! Thời gian: {time.time() - start_time} giây")
    #     return queryset

    def create(self, request, *args, **kwargs):
        request.query_params = request.query_params.copy()
        request.query_params['create_chapter'] = True
        return super().create(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, context={'request': request})
        return Response(serializer.data)

    @action(methods=['get'], detail=True)
    def get_chapter(self, request, pk):
        try:
            course = Course.objects.get(pk=pk)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
        chapters = course.chapters.all()
        return Response(serializers.ChapterSerializer(chapters, many=True).data,
                        status=status.HTTP_200_OK)
    # def get_chapter(self, request, pk):
    #     try:
    #         course = Course.objects.get(pk=pk)
    #     except Course.DoesNotExist:
    #         return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
    #
    #     # Lấy chapters
    #     chapters = course.chapters.all()
    #     chapter_data = serializers.ChapterSerializer(chapters, many=True).data
    #     # Check completed
    #     student = Student.objects.get(user=request.user)
    #     all_completed = is_all_chapter_completed(student, course)
    #
    #     # Nếu đã hoàn thành, thêm Exam vào
    #     if all_completed and hasattr(course, 'exam'):
    #         exam_data = serializers.ExamSerializer(course.exam).data
    #     else:
    #         exam_data = None
    #
    #     return Response({
    #         'chapters': chapter_data,
    #         'exam': exam_data
    #     }, status=status.HTTP_200_OK)

    @action(methods=['post'], detail=False,
            permission_classes=[permissions.IsAuthenticated, perms.IsTeacher])
    def create_course(self, request):
        if request.data.get("category"):
            category = Category.objects.get(title__iexact=request.data.get("category"))
            p = Course.objects.create(teacher=Teacher.objects.get(user=request.user),
                                      category=category,
                                      title=request.data.get('title'),
                                      description=request.data.get('description'),
                                      publish=request.data.get('publish'),
                                      price=request.data.get('price'),
                                      thumbnail=request.data.get('thumbnail'))
            serializer = self.get_serializer(p)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializers.CourseSerializer(status=status.HTTP_400_BAD_REQUEST))

    @action(methods=['patch'], detail=True,
            permission_classes=[permissions.IsAuthenticated, perms.IsTeacher])
    def update_course(self, request, pk=None):
        course = self.get_object()
        data = request.data.copy()
        category_title = data.get("category")
        if category_title:
            try:
                category = Category.objects.get(title__iexact=category_title)
                data['category'] = category.id  # Thay đổi giá trị category
            except Category.DoesNotExist:
                return Response({"detail": "Category not found."}, status=status.HTTP_400_BAD_REQUEST)

        # Cập nhật dữ liệu
        serializer = self.get_serializer(course, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=True, permission_classes=[perms.IsOwner])
    def create_chapter(self, request, pk=None):
        course = self.get_object()
        next_position = Chapter.objects.filter(course=course).count() + 1
        p = Chapter.objects.create(
            title=request.data.get('title'),
            description=request.data.get('description'),
            course=course,
            is_free=request.data.get('is_free'),
            position=next_position,
            video=request.data.get('video'))
        return Response(serializers.ChapterSerializer(p).data, status=status.HTTP_201_CREATED)

    @action(methods=['post'], url_path='comments', detail=True)
    def add_comment(self, request, pk):
        student = Student.objects.get(user=request.user)
        course = self.get_object()
        existing_comment = Comment.objects.filter(student=student, course=course).exists()
        comment = Comment.objects.get(student=student, course=course)

        if existing_comment:
            return Response({"id": comment.id}, status=status.HTTP_200_OK)
        c = Comment.objects.create(student=student, course=course, content=request.data.get('content'))
        return Response(serializers.CommentSerializer(c).data, status=status.HTTP_201_CREATED)

    @action(methods=['post'], url_path='rating', detail=True)
    def add_rating(self, request, pk):
        student = Student.objects.get(user=request.user)
        course = self.get_object()
        existing_rating = Rating.objects.filter(student=student, course=course).exists()
        rating = Rating.objects.get(student=student, course=course)
        if existing_rating:
            return Response({"id": rating.id}, status=status.HTTP_200_OK)
        c = Rating.objects.create(student=student, course=self.get_object(), rate=request.data.get('rate'))
        return Response(serializers.RatingSerializer(c).data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], detail=True)
    def get_comments(self, request, pk):
        l = self.get_object()
        return Response(
            serializers.CommentSerializer(l.comment_set.order_by("-id").all(), many=True,
                                          context={"request": self.request}).data,
            status=status.HTTP_200_OK)

    @action(methods=['get'], detail=True)
    def get_rating(self, request, pk):
        l = self.get_object()
        return Response(
            serializers.RatingSerializer(l.rating_set.order_by("-id").all(), many=True,
                                         context={"request": self.request}).data,
            status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'])
    def get_exam(self, request, pk=None):
        course = self.get_object()
        try:
            exam = course.exam
            serializer = serializers.ExamSerializer(exam)
            return Response(serializer.data)
        except Exam.DoesNotExist:
            return Response({"detail": "No Exam found for this Course."}, status=status.HTTP_404_NOT_FOUND)


class ChapterViewSet(viewsets.ViewSet):
    queryset = Chapter.objects.all()
    serializer_class = serializers.ChapterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        pk = self.kwargs.get('pk')
        try:
            return Chapter.objects.get(pk=pk)
        except Chapter.DoesNotExist:
            raise Response(status=status.HTTP_404_NOT_FOUND)

    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        max_position = Chapter.objects.filter(course=course).aggregate(Max('position'))['position__max']
        if max_position is None:
            max_position = 0
        serializer.save(position=max_position + 1)

    def retrieve(self, request, pk=None):
        try:
            user = request.user
            user_id = user.id
            course_id = request.query_params.get('course_id')
            chapter_id = pk

            is_student = hasattr(user, 'student')
            is_teacher = hasattr(user, 'teacher')

            course = Course.objects.filter(id=course_id).first()
            chapter = Chapter.objects.filter(id=chapter_id).first()
            purchase = None
            user_progress = None

            if is_student:
                try:
                    purchase = Purchase.objects.get(student__user_id=user_id, course_id=course_id)
                except Purchase.DoesNotExist:
                    purchase = None

                if chapter:
                    if not chapter.is_free and not purchase:
                        return Response({"chapter": None}, status=status.HTTP_200_OK)

                    user_progress = UserProgress.objects.filter(student__user_id=user_id, chapter_id=chapter_id).first()

            next_chapter = Chapter.objects.filter(
                course_id=course_id,
                position__gt=chapter.position
            ).order_by('position').first() if chapter else None

            if is_teacher:
                chapter_data = {
                    'id': chapter.id,
                    'title': chapter.title,
                    'description': chapter.description,
                    'position': chapter.position,
                    'is_free': chapter.is_free,
                    'video': chapter.video.url if chapter.video else None,
                } if chapter else None

                response_data = {
                    'chapter': chapter_data,
                    'course': serializers.CourseSerializer(course,
                                                           context={'request': request}).data if course else None
                }
            elif is_student:
                response_data = {
                    'chapter': serializers.ChapterSerializer(chapter).data if chapter else None,
                    'course': serializers.CourseSerializer(course,
                                                           context={'request': request}).data if course else None,
                    'nextChapter': serializers.ChapterSerializer(next_chapter).data if next_chapter else None,
                    'userProgress': serializers.UserProgressSerializer(user_progress).data if user_progress else None,
                    'purchase': serializers.PurchaseSerializer(purchase).data if purchase else None,
                }
            else:
                return Response({"detail": "Not authorized"}, status=status.HTTP_403_FORBIDDEN)

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as ex:
            print(f"Error: {ex}")
            return Response({"detail": str(ex)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(methods=['patch'], detail=True,
            permission_classes=[perms.IsTeacher])
    def update_chapter(self, request, pk):
        chapter = self.get_object()
        data_update = {
            'title': request.data.get('title', chapter.title),
            'description': request.data.get('description', chapter.description),
            'is_free': request.data.get('is_free', chapter.is_free),
            'position': request.data.get('price', chapter.position),
            'video': request.data.get('video', chapter.video)
        }
        serializer = serializers.ChapterSerializer(chapter, data=data_update, partial=True)
        if serializer.is_valid():
            serializer.save()
            updated_data = serializer.data
            return Response(updated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=True)
    def add_note(self, request, pk):
        student = Student.objects.get(user=request.user)
        chapter = self.get_object()
        n = Note.objects.create(student=student, chapter=chapter, content=request.data.get('content'),
                                timestamp=request.data.get('timestamp'))
        return Response(serializers.NoteSerializer(n).data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], detail=True)
    def get_notes(self, request, pk=None):
        chapter = self.get_object()
        student = request.user.student
        notes = Note.objects.filter(chapter=chapter, student=student).order_by("-id")
        return Response(serializers.NoteSerializer(notes, many=True, context={"request": self.request}).data,
                        status=status.HTTP_200_OK)

    @action(methods=['post'], detail=True, permission_classes=[perms.IsTeacher])
    def add_question(self, request, pk=None):
        chapter = self.get_object()
        question_text = request.data.get('question')
        timestamp = request.data.get('timestamp')
        answers = request.data.get('answers', [])

        question = QuizQuestion.objects.create(
            chapter=chapter,
            question=question_text,
            timestamp=timestamp
        )

        correct_answer = None
        for ans in answers:
            is_correct = ans.get('is_correct', False)
            answer = QuizAnswer.objects.create(
                question=question,
                answer=ans['answer'],
                is_correct=is_correct
            )
            if is_correct:
                correct_answer = answer

        if correct_answer:
            question.correct_answer = correct_answer
            question.save()

        return Response(serializers.QuizQuestionSerializer(question).data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], detail=True)
    def get_question(self, request, pk):
        l = self.get_object()
        return Response(
            serializers.QuizQuestionSerializer(l.quiz_questions.order_by("-id").all(), many=True,
                                               context={"request": self.request}).data,
            status=status.HTTP_200_OK)


class StudentViewSet(viewsets.ViewSet, generics.ListAPIView):
    queryset = Student.objects.all()
    serializer_class = serializers.StudentSerializer

    @action(methods=['get'], detail=False, permission_classes=[permissions.IsAuthenticated])
    def get_courses(self, request):
        student = Student.objects.get(user=request.user)
        purchased_courses = Course.objects.filter(purchase__student_id=student.id)
        serializer = serializers.CourseSerializer(purchased_courses, many=True, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['get'], detail=True)
    def get_student(self, request, pk):
        student = self.get_object()
        return Response(serializers.StudentSerializer(student, context={"request": request}).data,
                        status=status.HTTP_200_OK, )

    @action(methods=['post'], detail=True)
    def add_student(self, request, pk):
        user = User.objects.get(pk=pk)
        s = Student.objects.create(user=user, interesting_cate=request.data.get('interesting_cate'))
        return Response(serializers.StudentSerializer(s).data, status=status.HTTP_201_CREATED)

    @action(methods=['get'], detail=False, permission_classes=[permissions.IsAuthenticated])
    def teacher_course(self, request):
        teacher = request.query_params.get('teacher_id')
        course = Course.objects.filter(teacher_id=teacher).annotate(chapter=Count('chapters'))
        for c in course:
            c.review = calculate_average_review(c)
        serializer = serializers.TeacherCourseSerializer(course, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(methods=['patch'], detail=False, permission_classes=[permissions.IsAuthenticated])
    def update_student(self, request, pk=None):
        user = request.user
        student = Student.objects.filter(user_id=user.id).first()

        data = request.data.copy()
        user_data = {
            'first_name': data.get('first_name', user.first_name),
            'last_name': data.get('last_name', user.last_name),
            'email': data.get('email', user.email),
            'avatar': data.get('avatar', user.avatar),
            'phoneNumber': data.get('phoneNumber', user.phoneNumber),
            'qualification': data.get('qualification', user.qualification)
        }
        user_serializer = serializers.UserSerializer(user, data=user_data, partial=True)
        if user_serializer.is_valid():
            user_serializer.save()
        else:
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        student_data = {
            'interesting_cate': data.get('interesting_cate', student.interesting_cate)
        }

        student_serializer = serializers.StudentSerializer(student, data=student_data, partial=True)
        if student_serializer.is_valid():
            student_serializer.save()
            return Response(student_serializer.data, status=status.HTTP_200_OK)
        return Response(student_serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProgressViewSet(viewsets.ViewSet):
    queryset = UserProgress.objects.all()
    serializer_class = serializers.UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return UserProgress.objects.filter(student=user.student)

    @action(methods=['put'], detail=True)
    def update_progress(self, request, pk):
        isCompleted = request.data.get('is_completed')
        student = get_object_or_404(Student, user=request.user)
        user_progress, created = UserProgress.objects.update_or_create(
            student=student,
            chapter_id=pk,
            defaults={
                "is_completed": isCompleted,
            }
        )
        return Response(serializers.UserProgressSerializer(user_progress, context={"request": request}).data,
                        status=status.HTTP_201_CREATED)


class NoteViewSet(viewsets.ModelViewSet):
    queryset = Note.objects.all()
    serializer_class = serializers.NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(student=self.request.user.student)


class RatingViewSet(viewsets.ViewSet, generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Rating.objects.all()
    serializer_class = serializers.RatingSerializer
    permission_classes = [permissions.IsAuthenticated]


class CommentViewSet(viewsets.ViewSet, generics.UpdateAPIView, generics.DestroyAPIView):
    queryset = Comment.objects.all()
    serializer_class = serializers.CommentSerializer
    permission_classes = [permissions.IsAuthenticated]


class QuizQuestionViewSet(viewsets.ViewSet, generics.GenericAPIView):
    queryset = QuizQuestion.objects.all()
    serializer_class = serializers.QuizQuestionSerializer
    permission_classes = [permissions.IsAuthenticated]


class QuizAnswerViewSet(viewsets.ViewSet, generics.GenericAPIView):
    queryset = QuizAnswer.objects.all()
    serializer_class = serializers.QuizAnswerSerializer
    permission_classes = [permissions.IsAuthenticated]


class GoogleLoginViewSet(viewsets.ViewSet):
    @action(methods=['post'], detail=False, url_path='register')
    def register(self, request):
        serializer = serializers.GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data.get('token')
        is_teacher = request.data.get("is_teacher")
        is_student = request.data.get("is_student")
        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(),
                                                  "469431482043-0oe803a69580akpblrkaltvk6dgooqpg.apps.googleusercontent.com",
                                                  clock_skew_in_seconds=10)
            email = idinfo['email']
            user = User(email=email)
            user.username = email
            user.is_student = is_student
            user.is_teacher = is_teacher
            user.is_active = False
            user.set_unusable_password()
            user.save()
            if user.is_teacher == "True":
                Teacher.objects.create(user=user)
            send_activation_email(user, request)

            system_tokens = generate_system_token_for_user(user)
            return Response({"message": "User authenticated", "tokens": system_tokens}, status=status.HTTP_200_OK)
        except ValueError:
            return Response({"error": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['post'], detail=False, url_path='login')
    def login(self, request, *args, **kwargs):
        serializer = serializers.GoogleLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data.get('token')
        try:
            idinfo = id_token.verify_oauth2_token(token, requests.Request(),
                                                  "469431482043-0oe803a69580akpblrkaltvk6dgooqpg.apps.googleusercontent.com",
                                                  clock_skew_in_seconds=10)
            email = idinfo['email']
            user, created = User.objects.get_or_create(email=email)
            system_tokens = generate_system_token_for_user(user)
            return Response({"message": "User authenticated", "tokens": system_tokens}, status=status.HTTP_200_OK)
        except ValueError:
            return Response({"error": "Invalid Google token"}, status=status.HTTP_400_BAD_REQUEST)


stripe.api_key = settings.STRIPE_TEST_SECRET_KEY


class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.all()
    serializer_class = serializers.PurchaseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Purchase.objects.filter(student=user.student)

    @action(methods=['post'], detail=False)
    def create_checkout_session(self, request):
        course_ids = request.data.get('course', [])
        if isinstance(course_ids, int):  # Nếu chỉ có 1 ID khóa học
            course_ids = [course_ids]  # Đưa về danh sách để xử lý chung

        student = get_object_or_404(Student, user=request.user)
        courses = Course.objects.filter(id__in=course_ids)

        # Kiểm tra từng khóa học nếu đã được mua
        for course in courses:
            if Purchase.objects.filter(student=student, course=course).exists():
                return Response({'error': f'You have already purchased the course: {course.title}'},
                                status=status.HTTP_400_BAD_REQUEST)

        # Tìm hoặc tạo StripeCustomer
        stripe_customer, created = StripeCustomer.objects.get_or_create(
            student=student,
            defaults={'stripeCustomerId': stripe.Customer.create(email=request.user.email).id}
        )

        line_items = []
        for course in courses:
            line_items.append({
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': course.title,
                        'description': course.description,
                    },
                    'unit_amount': course.price * 100,
                },
                'quantity': 1,
            })

        try:
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=line_items,
                mode='payment',
                customer=stripe_customer.stripeCustomerId,
                success_url=settings.DOMAIN + 'success?session_id={CHECKOUT_SESSION_ID}',
                cancel_url=settings.DOMAIN + 'cancel',
                metadata={'course_id': ','.join(map(str, course_ids)), 'student_id': student.id},
            )

            return Response({'url': checkout_session.url})
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(methods=['get'], detail=False)
    def payment_success(self, request):
        session_id = request.query_params.get('session_id')
        session = stripe.checkout.Session.retrieve(session_id)

        course_ids = session.metadata['course_id'].split(',')
        student_id = session.metadata['student_id']

        student = get_object_or_404(Student, id=student_id)

        for course_id in course_ids:
            course = get_object_or_404(Course, id=course_id)
            if not Purchase.objects.filter(student=student, course=course).exists():
                Purchase.objects.create(student=student, course=course)

        return Response({'status': 'success', 'course_ids': course_ids})

    @action(methods=['get'], detail=False)
    def get_student(self, request):
        course_id = request.query_params.get('course_id')
        purchases = Purchase.objects.filter(course_id=course_id)
        students = [purchase.student for purchase in purchases]
        serializer = serializers.StudentSerializer(students, many=True)
        return Response({'students': serializer.data}, status=status.HTTP_200_OK)


class GeminiChatViewSet(viewsets.GenericViewSet):
    genai.configure(api_key=config('GEMINI_API_KEY'))

    @action(methods=['POST'], detail=False, url_path='chatgemini', serializer_class=serializers.GeminiChatSerializer)
    def chat_gemini(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            generation_config={
                "temperature": 0,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 500,
                "response_mime_type": "text/plain",
            },
        )
        user_input = f"Answer concisely, up to 3-5 sentences. {serializer.validated_data['message']}"

        # Gửi yêu cầu đến Gemini và nhận phản hồi
        chat_session = model.start_chat(history=[])
        response = chat_session.send_message(user_input)
        model_response = response.text

        # Trả về kết quả từ Gemini AI
        return Response({"response": model_response}, status=status.HTTP_200_OK)


class StripeCustomerViewSet(viewsets.ModelViewSet):
    queryset = StripeCustomer.objects.all()
    serializer_class = serializers.StripeCustomerSerializer
    permission_classes = [permissions.IsAuthenticated]


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    event = None

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        return JsonResponse({'error': 'Invalid payload'})
    except stripe.error.SignatureVerificationError as e:
        return JsonResponse({'error': 'Invalid signature'})

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_checkout_session(session)

    # return Response({'status': 'success'}, status=status.HTTP_200_OK)
    return JsonResponse({'status': 'success'})


def handle_checkout_session(session):
    course_id = session['metadata']['course_id']
    student_id = session['metadata']['student_id']

    student = Student.objects.get(id=student_id)
    course = Course.objects.get(id=course_id)

    Purchase.objects.get_or_create(
        student=student,
        course=course
    )


products_df = pd.read_csv('courses.csv')

# print(products_df)

# Xây dựng vector đặc trưng TF-IDF từ tên sản phẩm
tfidf_vectorizer = TfidfVectorizer(stop_words='english', norm='l2')
tfidf_matrix = tfidf_vectorizer.fit_transform(products_df['title'])
# print("Ma trận TF-IDF (đã chuyển thành dạng array):")
# print(tfidf_matrix.toarray())

# Sử dụng cosine similarity để tính độ tương tự giữa các sản phẩm
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
# print("\nMa trận Cosine Similarity (5 sản phẩm đầu tiên):")
# print(cosine_sim[:5, :5])  # In ra ma trận tương tự cho 5 sản phẩm đầu tiên


class RecommenViewset(viewsets.ViewSet, generics.ListAPIView):
    serializer_class = serializers.UserCourseSerializer
    pagination_class = paginators.RecommendCoursePaginator

    @action(methods=['post'], detail=False, permission_classes=[permissions.IsAuthenticated])
    def course_recommend(self, request):
        try:
            data = request.data
            product_id = data.get('product_id')

            if not product_id or not str(product_id).isdigit():
                return Response({'error': 'Thiếu thông tin sản phẩm hoặc ID không hợp lệ'},
                                status=status.HTTP_400_BAD_REQUEST)

            product_id = int(product_id)
            print(product_id)

            # Tìm chỉ mục của sản phẩm tương ứng với product_id
            product_index = products_df[products_df['id'] == product_id].index

            if product_index.empty:
                return Response({'error': 'Không tìm thấy sản phẩm'}, status=status.HTTP_404_NOT_FOUND)

            product_index = product_index[0]  # Lấy chỉ mục đầu tiên

            similar_scores = list(enumerate(cosine_sim[product_index]))
            similar_scores = sorted(similar_scores, key=lambda x: x[1], reverse=True)
            similar_scores = [score for score in similar_scores if score[1] > 0 and products_df.iloc[score[0]][
                'id'] != product_id]  # Thử lấy 7 sản phẩm tương tự nhất
            if len(similar_scores) == 0.0:
                # Nếu không có sản phẩm tương tự, lấy sản phẩm trong cùng danh mục
                category_title = products_df.iloc[product_index]['category__title']
                same_category_products = products_df[
                    (products_df['category__title'] == category_title) & (products_df['id'] != product_id)]
                recommended_products = same_category_products['id'].tolist()

                queryset = Course.objects.filter(id__in=recommended_products)
                serializer = self.get_serializer(queryset, many=True)
                return Response(serializer.data)

            product_indices = [i[0] for i in similar_scores]

            # Trả về danh sách các sản phẩm tương tự
            recommended_products = products_df.loc[product_indices, ['id', 'title']]
            recommended_products_ids = products_df.loc[product_indices, 'id'].tolist()

            # Kiểm tra kiểu dữ liệu id để đảm bảo là số nguyên
            recommended_products_ids = [int(id) for id in recommended_products_ids]

            queryset = Course.objects.filter(id__in=recommended_products_ids)

            # Sử dụng UserCourseSerializer để tuần tự hóa các sản phẩm
            serializer = self.get_serializer(queryset, many=True)

            # Trả về danh sách các sản phẩm đã được tuần tự hóa
            return Response(serializer.data)

        except Exception as e:
            return Response({'error': 'Có lỗi xảy ra: ' + str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CourseExamViewSet(viewsets.GenericViewSet):
    serializer_class = serializers.ExamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, course_id):
        user = request.user
        try:
            student = user.student
        except:
            return Response({'detail': 'Only students can access this.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({'detail': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Check if completed all chapters
        if is_all_chapter_completed(student, course):
            try:
                exam = course.exam  # OneToOneField nên đơn giản
                serializer = serializers.ExamSerializer(exam)
                return Response(serializer.data)
            except Exam.DoesNotExist:
                return Response({'detail': 'No exam for this course.'}, status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({'detail': 'Complete all chapters to unlock exam.'}, status=status.HTTP_403_FORBIDDEN)


class ExamViewSet(viewsets.ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = serializers.ExamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        teacher = Teacher.objects.get(user=self.request.user)
        course_id = self.request.data.get('course')
        course = get_object_or_404(Course, id=course_id)
        serializer.save(teacher=teacher, course=course)


class StudentExamViewSet(viewsets.ModelViewSet):
    queryset = StudentExam.objects.all()
    serializer_class = serializers.StudentExamSerializer

    def create(self, request, *args, **kwargs):
        student = get_object_or_404(Student, user=request.user)
        exam_id = request.data.get('exam')
        exam = Exam.objects.filter(id__in=exam_id)

        # Tạo StudentExam
        student_exam = StudentExam.objects.create(student=student, exam=exam)
        serializer = self.get_serializer(student_exam)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def exam_status(self, request):
        student = get_object_or_404(Student, user=request.user)
        course_id = request.query_params.get('exam_id')
        if not course_id:
            return Response({'error': 'course_id is required'}, status=status.HTTP_400_BAD_REQUEST)

        exam_id = Exam.objects.filter(course_id=course_id).first()
        student_exam = StudentExam.objects.filter(student=student, exam_id=exam_id).first()
        if not student_exam:
            return Response({'error': 'StudentExam not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(student_exam)
        return Response(serializer.data, status=status.HTTP_200_OK)




class StudentAnswerViewSet(viewsets.ModelViewSet):
    queryset = StudentAnswer.objects.all()
    serializer_class = serializers.StudentAnswerSerializer

    @action(detail=False, methods=['post'])
    def submit_exam(self, request):
        student = get_object_or_404(Student, user=request.user)
        exam_id = request.data.get('exam_id')
        answers = request.data.get('answers')

        if not exam_id or not answers:
            return Response({"error": "Missing exam_id or answers"}, status=status.HTTP_400_BAD_REQUEST)

        # Check Exam tồn tại
        exam = get_object_or_404(Exam, id=exam_id)

        # Tạo hoặc lấy StudentExam
        student_exam, created = StudentExam.objects.get_or_create(student=student, exam=exam)

        # Xóa đáp án cũ nếu có
        student_exam.answers.all().delete()

        correct_count = 0
        total_questions = exam.questions.count()

        for ans in answers:
            try:
                question = Question.objects.get(id=ans['question_id'], exam=exam)
                selected_answer = Answer.objects.get(id=ans['answer_id'], question=question)
            except (Question.DoesNotExist, Answer.DoesNotExist):
                continue  # skip nếu không hợp lệ

            is_correct = selected_answer.is_correct
            if is_correct:
                correct_count += 1

            StudentAnswer.objects.create(
                student_exam=student_exam,
                question=question,
                selected_answer=selected_answer,
                is_correct=is_correct
            )

        # Tính điểm
        score = round((correct_count / total_questions) * 10, 2)
        student_exam.score = score
        student_exam.status = "Completed"
        student_exam.submit_date = timezone.now()
        student_exam.save()

        return Response({
            "message": "Exam submitted successfully",
            "score": score,
            "correct_answers": correct_count,
            "total_questions": total_questions
        }, status=status.HTTP_200_OK)

