from django.db.models.functions import TruncMonth, TruncQuarter, TruncYear

from .models import Category, Course, User, Teacher, Rating, Student, Purchase, Chapter
from django.db.models import Count
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from django.utils.html import strip_tags
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from django.conf import settings

def load_course(params={}):
    q = Course.objects.filter(publish=True)
    kw = params.get('kw')
    if kw:
        q = q.filter(title__icontains=kw)

    cate_id = params.get('cate_id')
    if cate_id:
        q = q.filter(category_id=cate_id)
    return q

def count_course_by_cate():
    return Category.objects.annotate(count=Count('course__id')).values("id","title","count").order_by('-count')

def count_course_sold_by_cate():
    return Category.objects.filter(course__purchase__isnull=False).annotate(
        count=Count('course__purchase')
    ).values('id', 'title', 'count').order_by('-count')

def course_sales_by_month():
    return Purchase.objects.annotate(month=TruncMonth('create_date')).values('month').annotate(count=Count('id')).order_by('month')

def course_sales_by_quarter():
    return Purchase.objects.annotate(quarter=TruncQuarter('create_date')).values('quarter').annotate(count=Count('id')).order_by('quarter')

def course_sales_by_year():
    return  Purchase.objects.annotate(year=TruncYear('create_date')).values('year').annotate(count=Count('id')).order_by('year')


# teacher function
def group_by_course(purchases):
    grouped = {}
    for purchase in purchases:
        course_title = purchase.course.title
        if course_title not in grouped:
            grouped[course_title] = 0
        grouped[course_title] += purchase.course.price
    return grouped

def get_analytics(user_id):
    try:
        purchases = Purchase.objects.filter(
            course__teacher__user__id=user_id
        ).select_related('course')

        grouped_earnings = group_by_course(purchases)
        data = [{'name': course_title, 'total': total} for course_title, total in grouped_earnings.items()]

        total_revenue = sum(item['total'] for item in data)
        total_sales = purchases.count()
        return {
            'data': data,
            'total_revenue': total_revenue,
            'total_sales': total_sales,
        }
    except Exception as ex:
        return {
            'data': [],
            'total_revenue': 0,
            'total_sales': 0,
        }
def calculate_review(course):
    return Rating.objects.filter(course__in=course).count()
def calculate_student(course):
    return Purchase.objects.filter(course__in=course).count()
def calculate_average_review(course):
    ratings = Rating.objects.filter(course=course)
    quantity_rate = ratings.count()

    if quantity_rate > 0:
        total_rate = sum([r.rate for r in ratings])
        average_review = total_rate / quantity_rate
    else:
        average_review = 0

    return average_review

# Google

def generate_system_token_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
    }

def send_activation_email(user, request):
    current_site = get_current_site(request)
    mail_subject = 'Activate your account'
    activation_link = f"http://{current_site.domain}{reverse('users-activate')}?token={user.activate_token}"
    print(f"Activation link: {activation_link}")
    message = render_to_string('activation_email.html', {
        'user': user,
        'activation_link': activation_link,
    })
    plain_message = strip_tags(message)
    send_mail(
        mail_subject,
        plain_message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
        html_message=message,
    )


