from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from django.http import JsonResponse
from . import views

router = DefaultRouter()
router.register(r'vitals', views.VitalRecordViewSet, basename='vital')
router.register(r'lifestyle', views.LifestyleRecordViewSet, basename='lifestyle')
router.register(r'academic', views.AcademicMetricViewSet, basename='academic')
router.register(r'goals', views.GoalViewSet, basename='goal')
router.register(r'achievements', views.AchievementBadgeViewSet, basename='achievement')
router.register(r'exports', views.ExportRequestViewSet, basename='export')


# ✅ Test endpoint to confirm server is running
def ping(request):
    return JsonResponse({"status": "ok", "server": "running"})


urlpatterns = [
    path('auth/signup/', views.signup, name='signup'),
    path('auth/login/', views.login, name='login'),
    path('auth/profile/', views.profile, name='profile'),
    path('auth/profile/update/', views.update_profile, name='profile-update'),

    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('analytics/summary/', views.analytics_summary, name='analytics-summary'),

    # ✅ NEW – test endpoint
    path('ping/', ping, name='ping'),

    path('', include(router.urls)),
]
