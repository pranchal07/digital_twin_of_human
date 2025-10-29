from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import VitalRecord, LifestyleRecord, AcademicMetric, Goal, AchievementBadge, ExportRequest

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'avatar_url', 'theme_preference', 'created_at', 'updated_at']
        read_only_fields = ['id', 'username', 'email', 'created_at', 'updated_at']

class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'avatar_url', 'theme_preference']

class VitalRecordSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = VitalRecord
        fields = ['id', 'user', 'user_username', 'heart_rate', 'blood_pressure_systolic',
                  'blood_pressure_diastolic', 'temperature', 'oxygen_saturation', 'timestamp']
        read_only_fields = ['id', 'user', 'timestamp']

class VitalRecordCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalRecord
        fields = ['heart_rate', 'blood_pressure_systolic', 'blood_pressure_diastolic',
                  'temperature', 'oxygen_saturation']

class LifestyleRecordSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = LifestyleRecord
        fields = ['id', 'user', 'user_username', 'sleep_hours', 'stress_level',
                  'diet_quality_score', 'water_intake', 'physical_activity_minutes', 'timestamp']
        read_only_fields = ['id', 'user', 'timestamp']

class LifestyleRecordCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = LifestyleRecord
        fields = ['sleep_hours', 'stress_level', 'diet_quality_score', 
                  'water_intake', 'physical_activity_minutes']

class AcademicMetricSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = AcademicMetric
        fields = ['id', 'user', 'user_username', 'study_hours', 'attendance_percentage',
                  'focus_level', 'assignment_completion_rate', 'timestamp']
        read_only_fields = ['id', 'user', 'timestamp']

class AcademicMetricCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicMetric
        fields = ['study_hours', 'attendance_percentage', 'focus_level', 
                  'assignment_completion_rate']

class GoalSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    progress_percentage = serializers.SerializerMethodField()

    class Meta:
        model = Goal
        fields = ['id', 'user', 'user_username', 'title', 'description', 'target_value',
                  'current_value', 'unit', 'deadline', 'is_completed', 
                  'progress_percentage', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def get_progress_percentage(self, obj):
        return obj.progress_percentage()

class GoalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ['title', 'description', 'target_value', 'current_value', 'unit', 'deadline']

class GoalUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Goal
        fields = ['description', 'current_value', 'is_completed']

class AchievementBadgeSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = AchievementBadge
        fields = ['id', 'user', 'user_username', 'name', 'description', 'icon', 'earned_at']
        read_only_fields = ['id', 'user', 'earned_at']

class ExportRequestSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = ExportRequest
        fields = ['id', 'user', 'user_username', 'format', 'status', 
                  'requested_at', 'completed_at', 'file_url']
        read_only_fields = ['id', 'user', 'status', 'requested_at', 'completed_at', 'file_url']

class ExportRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExportRequest
        fields = ['format']
