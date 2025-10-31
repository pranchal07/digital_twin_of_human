from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

class User(AbstractUser):
    THEME_CHOICES = [
        ('ocean', 'Ocean Blue'),
        ('dark', 'Dark'),
        ('sunset', 'Sunset'),
        ('forest', 'Forest'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    avatar_url = models.URLField(blank=True, null=True)
    theme_preference = models.CharField(max_length=20, choices=THEME_CHOICES, default='ocean')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return self.username


class VitalRecord(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='vital_records')
    heart_rate = models.IntegerField(validators=[MinValueValidator(40), MaxValueValidator(200)])
    blood_pressure_systolic = models.IntegerField(validators=[MinValueValidator(70), MaxValueValidator(200)])
    blood_pressure_diastolic = models.IntegerField(validators=[MinValueValidator(40), MaxValueValidator(130)])
    temperature = models.FloatField(validators=[MinValueValidator(95.0), MaxValueValidator(105.0)])
    oxygen_saturation = models.IntegerField(validators=[MinValueValidator(80), MaxValueValidator(100)])
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'vital_records'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} - Vitals - {self.timestamp.date()}"


class LifestyleRecord(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lifestyle_records')
    sleep_hours = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(24.0)])
    stress_level = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    diet_quality_score = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    water_intake = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(30)], default=8)
    physical_activity_minutes = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(1440)], default=0)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'lifestyle_records'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} - Lifestyle - {self.timestamp.date()}"


class AcademicMetric(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='academic_metrics')
    study_hours = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(24.0)])
    attendance_percentage = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    focus_level = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    assignment_completion_rate = models.FloatField(validators=[MinValueValidator(0.0), MaxValueValidator(100.0)])
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'academic_metrics'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} - Academic - {self.timestamp.date()}"


class Goal(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    target_value = models.FloatField()
    current_value = models.FloatField(default=0.0)
    unit = models.CharField(max_length=50)
    deadline = models.DateField()
    is_completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'goals'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"

    def progress_percentage(self):
        if self.target_value == 0:
            return 0
        return min((self.current_value / self.target_value) * 100, 100)


class AchievementBadge(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, default='trophy')
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'achievement_badges'
        ordering = ['-earned_at']
        unique_together = ['user', 'name']

    def __str__(self):
        return f"{self.user.username} - {self.name}"


class ExportRequest(models.Model):
    FORMAT_CHOICES = [
        ('json', 'JSON'),
        ('csv', 'CSV'),
        ('pdf', 'PDF'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='export_requests')
    format = models.CharField(max_length=10, choices=FORMAT_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    requested_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    file_url = models.URLField(null=True, blank=True)

    class Meta:
        db_table = 'export_requests'
        ordering = ['-requested_at']

    def __str__(self):
        return f"{self.user.username} - {self.format.upper()} Export - {self.status}"
