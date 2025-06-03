
from django.urls import path, include
from courses import views
from rest_framework import routers




router = routers.DefaultRouter()
router.register('qualifications',views.QualificationViewSet,basename='qualifications')
router.register('categories',views.CategoryViewSet,basename='categories')
router.register('courses',views.CourseViewSet,basename='courses')
router.register('users',views.UserViewSet,basename='users')
router.register('chapters',views.ChapterViewSet,basename='chapters')
router.register('teachers',views.TeacherViewSet,basename='teachers')
router.register('students',views.StudentViewSet,basename='students')
router.register('userprogress',views.UserProgressViewSet,basename='userprogress')
router.register('purchase',views.PurchaseViewSet,basename='purchase')
router.register('stripe',views.StripeCustomerViewSet,basename='stripe')
router.register('rating',views.RatingViewSet,basename='rating')
router.register('comment',views.CommentViewSet,basename='comment')
router.register('note',views.NoteViewSet,basename='note')
router.register('question',views.QuizQuestionViewSet, basename='question')
router.register('answer',views.QuizAnswerViewSet, basename='answer')
router.register('googleauth', views.GoogleLoginViewSet, basename='googleauth'),
router.register('usercourse', views.UserCourseViewSet, basename='usercourse'),
router.register('recommend',views.RecommenViewset,basename='recommend')
router.register('geminichat',views.GeminiChatViewSet,basename='geminichat')
router.register('exams', views.ExamViewSet, basename='exams')
router.register('student_exams', views.StudentExamViewSet, basename='student_exams')
router.register('student_answers', views.StudentAnswerViewSet, basename='student_answers')




urlpatterns = [
    path('',include(router.urls)),
    path('stripe-webhook/', views.stripe_webhook, name='stripe-webhook'),
]