from rest_framework import permissions
from .models import Teacher



class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and Teacher.objects.filter(user=request.user).exists())

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.teacher.user == request.user


class StudentIsAuthenticated(permissions.IsAuthenticated):
        def has_permission(self, request, view):
            return bool(request.user.is_student and request.user.is_authenticated)