from __future__ import annotations

from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import permissions, generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import SiteSettings, ProfileAsset, CVAsset, Certification, Skill, Testimonial, ProjectMatch, WorkPatch
from .serializers import (
    SiteSettingsSerializer,
    ProfileAssetSerializer,
    CVAssetSerializer,
    CertificationSerializer,
    SkillSerializer,
    ProjectMatchSerializer,
    WorkPatchSerializer,
    TestimonialCreateSerializer,
    TestimonialSerializer,
)


class SiteSettingsAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        settings_obj = SiteSettings.objects.order_by("-id").first()
        if not settings_obj:
            settings_obj = SiteSettings.objects.create()
        return Response(SiteSettingsSerializer(settings_obj).data)


class ProfileAssetAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        asset = ProfileAsset.objects.order_by("-updated_at", "-id").first()
        if not asset:
            asset = ProfileAsset.objects.create()
        # DRF expects a request context to build absolute URLs for ImageFields
        # However, if it's external (Supabase), it's already an absolute URL.
        # Passing context ensures compatibility in either case.
        return Response(ProfileAssetSerializer(asset, context={'request': request}).data)


class CVAssetAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        asset = CVAsset.objects.order_by("-updated_at", "-id").first()
        if not asset:
            asset = CVAsset.objects.create()
        return Response(CVAssetSerializer(asset, context={'request': request}).data)


class CertificationListAPIView(generics.ListAPIView):
    queryset = Certification.objects.all().order_by("-id")
    serializer_class = CertificationSerializer
    permission_classes = [permissions.AllowAny]

    @method_decorator(cache_page(60 * 15))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context


class SkillListAPIView(generics.ListAPIView):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [permissions.AllowAny]

    @method_decorator(cache_page(60 * 15))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)


class ProjectMatchListAPIView(generics.ListAPIView):
    queryset = ProjectMatch.objects.all()
    serializer_class = ProjectMatchSerializer
    permission_classes = [permissions.AllowAny]

    @method_decorator(cache_page(60 * 15))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)


class WorkPatchListAPIView(generics.ListAPIView):
    queryset = WorkPatch.objects.all()
    serializer_class = WorkPatchSerializer
    permission_classes = [permissions.AllowAny]

    @method_decorator(cache_page(60 * 15))
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)


class TestimonialListCreateView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []

    def get(self, request):
        testimonials = Testimonial.objects.filter(status=Testimonial.Status.APPROVED, is_public=True).order_by(
            "-created_at"
        )[:50]
        return Response(TestimonialSerializer(testimonials, many=True).data, status=200)

    @method_decorator(ratelimit(key="ip", rate="5/h", method="POST", block=True))
    def post(self, request):
        serializer = TestimonialCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(status=Testimonial.Status.PENDING, is_public=False)
        return Response({"message": "Testimonial submitted successfully."}, status=201)

class RunMigrationsAPIView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        from django.core.management import call_command
        import io
        import sys
        
        out = io.StringIO()
        try:
            call_command("migrate", stdout=out)
            return Response({"status": "success", "output": out.getvalue()})
        except Exception as e:
            return Response({"status": "error", "error": str(e)}, status=500)
