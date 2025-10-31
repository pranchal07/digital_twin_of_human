from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, VitalRecord, LifestyleRecord, AcademicMetric, Goal, AchievementBadge, ExportRequest

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'theme_preference', 'created_at']
    list_filter = ['theme_preference', 'is_staff', 'is_active']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('avatar_url', 'theme_preference')}),
    )

@admin.register(VitalRecord)
class VitalRecordAdmin(admin.ModelAdmin):
    list_display = ['user', 'heart_rate', 'blood_pressure_systolic', 'temperature', 'timestamp']
    list_filter = ['timestamp', 'user']
    ordering = ['-timestamp']

@admin.register(LifestyleRecord)
class LifestyleRecordAdmin(admin.ModelAdmin):
    list_display = ['user', 'sleep_hours', 'stress_level', 'diet_quality_score', 'timestamp']
    list_filter = ['timestamp', 'user']
    ordering = ['-timestamp']

@admin.register(AcademicMetric)
class AcademicMetricAdmin(admin.ModelAdmin):
    list_display = ['user', 'study_hours', 'attendance_percentage', 'focus_level', 'timestamp']
    list_filter = ['timestamp', 'user']
    ordering = ['-timestamp']

@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ['user', 'title', 'target_value', 'current_value', 'deadline', 'is_completed']
    list_filter = ['is_completed', 'deadline']
    ordering = ['-created_at']

@admin.register(AchievementBadge)
class AchievementBadgeAdmin(admin.ModelAdmin):
    list_display = ['user', 'name', 'earned_at']
    list_filter = ['earned_at']
    ordering = ['-earned_at']

@admin.register(ExportRequest)
class ExportRequestAdmin(admin.ModelAdmin):
    list_display = ['user', 'format', 'status', 'requested_at']
    list_filter = ['format', 'status']
    ordering = ['-requested_at']
