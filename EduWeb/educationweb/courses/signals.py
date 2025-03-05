from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.db.models import Max
from .models import Chapter

@receiver(pre_save, sender=Chapter)
def set_chapter_position(sender, instance, **kwargs):
    if instance.pk is None:  # Chỉ set position khi tạo mới
        max_position = Chapter.objects.filter(course=instance.course).aggregate(Max('position'))['position__max']
        if max_position is None:
            max_position = 0
        instance.position = max_position + 1
