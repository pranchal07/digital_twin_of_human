from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db import models
from datetime import datetime, timedelta
from drf_spectacular.utils import extend_schema

from .models import VitalRecord, LifestyleRecord, AcademicMetric, Goal, AchievementBadge, ExportRequest
from .serializers import (
    UserRegistrationSerializer, UserProfileSerializer, UserUpdateSerializer,
    VitalRecordSerializer, VitalRecordCreateSerializer,
    LifestyleRecordSerializer, LifestyleRecordCreateSerializer,
    AcademicMetricSerializer, AcademicMetricCreateSerializer,
    GoalSerializer, GoalCreateSerializer, GoalUpdateSerializer,
    AchievementBadgeSerializer,
    ExportRequestSerializer, ExportRequestCreateSerializer
)

User = get_user_model()


@extend_schema(request=UserRegistrationSerializer, responses=UserProfileSerializer)
@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(request=None, responses=UserProfileSerializer)
@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    from django.contrib.auth import authenticate

    username_or_email = request.data.get('username') or request.data.get('email')
    password = request.data.get('password')

    if not username_or_email or not password:
        return Response(
            {'error': 'Please provide username/email and password'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(username=username_or_email, password=password)

    if not user:
        try:
            user_obj = User.objects.get(email=username_or_email)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass

    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': {
                'id': str(user.id),
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'theme_preference': user.theme_preference,
            },
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })

    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@extend_schema(responses=UserProfileSerializer)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)


@extend_schema(request=UserUpdateSerializer, responses=UserProfileSerializer)
@api_view(['PUT', 'PATCH'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = UserUpdateSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(UserProfileSerializer(request.user).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VitalRecordViewSet(viewsets.ModelViewSet):
    serializer_class = VitalRecordSerializer
    permission_classes = [IsAuthenticated]
    queryset = VitalRecord.objects.all()   # ✅ required for schema

    def get_queryset(self):
        queryset = VitalRecord.objects.filter(user=self.request.user)
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return VitalRecordCreateSerializer
        return VitalRecordSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def latest(self, request):
        latest_record = self.get_queryset().first()
        if latest_record:
            serializer = self.get_serializer(latest_record)
            return Response(serializer.data)
        return Response({'message': 'No vital records found'}, status=status.HTTP_404_NOT_FOUND)


class LifestyleRecordViewSet(viewsets.ModelViewSet):
    serializer_class = LifestyleRecordSerializer
    permission_classes = [IsAuthenticated]
    queryset = LifestyleRecord.objects.all()

    def get_queryset(self):
        queryset = LifestyleRecord.objects.filter(user=self.request.user)
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return LifestyleRecordCreateSerializer
        return LifestyleRecordSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AcademicMetricViewSet(viewsets.ModelViewSet):
    serializer_class = AcademicMetricSerializer
    permission_classes = [IsAuthenticated]
    queryset = AcademicMetric.objects.all()

    def get_queryset(self):
        queryset = AcademicMetric.objects.filter(user=self.request.user)
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(timestamp__gte=start_date)
        if end_date:
            queryset = queryset.filter(timestamp__lte=end_date)
        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return AcademicMetricCreateSerializer
        return AcademicMetricSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]
    queryset = Goal.objects.all()

    def get_queryset(self):
        queryset = Goal.objects.filter(user=self.request.user)
        is_completed = self.request.query_params.get('completed')
        if is_completed is not None:
            is_completed = is_completed.lower() == 'true'
            queryset = queryset.filter(is_completed=is_completed)
        return queryset

    def get_serializer_class(self):
        if self.action == 'create':
            return GoalCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return GoalUpdateSerializer
        return GoalSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def active(self, request):
        active_goals = self.get_queryset().filter(is_completed=False)
        serializer = self.get_serializer(active_goals, many=True)
        return Response(serializer.data)


class AchievementBadgeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AchievementBadgeSerializer
    permission_classes = [IsAuthenticated]
    queryset = AchievementBadge.objects.all()

    def get_queryset(self):
        return AchievementBadge.objects.filter(user=self.request.user)


class ExportRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ExportRequestSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'post']
    queryset = ExportRequest.objects.all()

    def get_queryset(self):
        return ExportRequest.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'create':
            return ExportRequestCreateSerializer
        return ExportRequestSerializer

    def perform_create(self, serializer):
        export_request = serializer.save(user=self.request.user)
        self.process_export(export_request)

    def process_export(self, export_request):
        try:
            export_request.status = 'completed'
            export_request.completed_at = timezone.now()
            export_request.file_url = f'/media/exports/{export_request.user.id}/{export_request.format}/export.{export_request.format}'
            export_request.save()
        except Exception:
            export_request.status = 'failed'
            export_request.save()


@extend_schema(responses=dict)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def analytics_summary(request):
    user = request.user
    days = int(request.query_params.get('days', 30))
    start_date = timezone.now() - timedelta(days=days)

    vitals = VitalRecord.objects.filter(user=user, timestamp__gte=start_date)
    vitals_stats = {
        'count': vitals.count(),
        'avg_heart_rate': vitals.aggregate(models.Avg('heart_rate'))['heart_rate__avg'],
        'avg_spo2': vitals.aggregate(models.Avg('oxygen_saturation'))['oxygen_saturation__avg'],
    }

    lifestyle = LifestyleRecord.objects.filter(user=user, timestamp__gte=start_date)
    lifestyle_stats = {
        'count': lifestyle.count(),
        'avg_sleep': lifestyle.aggregate(models.Avg('sleep_hours'))['sleep_hours__avg'],
        'avg_stress': lifestyle.aggregate(models.Avg('stress_level'))['stress_level__avg'],
    }

    academic = AcademicMetric.objects.filter(user=user, timestamp__gte=start_date)
    academic_stats = {
        'count': academic.count(),
        'avg_study_hours': academic.aggregate(models.Avg('study_hours'))['study_hours__avg'],
        'avg_attendance': academic.aggregate(models.Avg('attendance_percentage'))['attendance_percentage__avg'],
    }

    goals = Goal.objects.filter(user=user)
    goals_stats = {
        'total': goals.count(),
        'active': goals.filter(is_completed=False).count(),
        'completed': goals.filter(is_completed=True).count(),
    }

    return Response({
        'period_days': days,
        'vitals': vitals_stats,
        'lifestyle': lifestyle_stats,
        'academic': academic_stats,
        'goals': goals_stats,
    })
