from rest_framework.pagination import PageNumberPagination
class CoursePaginator(PageNumberPagination):
    page_size = 10

class TeacherCoursePaginator(PageNumberPagination):
    page_size = 5

class RecommendCoursePaginator(PageNumberPagination):
    page_size = 4