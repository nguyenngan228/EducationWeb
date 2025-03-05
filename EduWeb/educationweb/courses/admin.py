from django.contrib import admin
from django.template.response import TemplateResponse
from django.utils.safestring import mark_safe
from django.urls import path
from courses import dao
from .models import (Category, Course, Teacher, User,
                     Lesson, Chapter, Student, UserProgress,
                     Purchase, Rating, Comment,
                     Note, QuizQuestion, QuizAnswer)
class CourseAppAdminSite(admin.AdminSite):
    site_header = 'e-course'
    def get_urls(self):
        return [
            path('course-stats/', self.stats_view)
        ] + super().get_urls()
    def stats_view(self,request):
        return TemplateResponse(request,'admin/stats.html',
                                {
                                    'stats': dao.count_course_by_cate(),
                                    'sold':dao.count_course_sold_by_cate(),
                                    'month':dao.course_sales_by_month(),
                                    'quarter':dao.course_sales_by_quarter(),
                                    'year': dao.course_sales_by_year()
                                })


admin_site=CourseAppAdminSite(name='MyCourse')
class CourseAdmin(admin.ModelAdmin):
    readonly_fields = ['thumbnail']

    def thumbnail(self, course):
        if course:
            return mark_safe(
                '<img src="/static/{url}" width="120" />' \
                    .format(url=course.thumbnail.name)
            )


admin_site.register(User)
admin_site.register(Category)
admin_site.register(Course)
admin_site.register(Teacher)
admin_site.register(Chapter)
admin_site.register(Student)
admin_site.register(UserProgress)
admin_site.register(Purchase)
admin_site.register(Rating)
admin_site.register(Comment)
admin_site.register(Note)
admin_site.register(QuizQuestion)
admin_site.register(QuizAnswer)

