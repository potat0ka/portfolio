from django.urls import path

from . import views


urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="auth_register"),
    path("login/", views.LoginView.as_view(), name="auth_login"),
    path("refresh/", views.RefreshView.as_view(), name="auth_refresh"),
    path("logout/", views.LogoutView.as_view(), name="auth_logout"),
]

