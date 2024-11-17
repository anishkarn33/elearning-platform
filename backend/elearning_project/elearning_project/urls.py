"""
URL configuration for elearning_project project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)


# Prefix to be used on all v1 API urls
api_prefix = "api/"


def api_url(url):
    # Prepend a url string with the v1 prefix.
    return api_prefix + url


urlpatterns = (
    [
        path("admin/", admin.site.urls),
        path("", RedirectView.as_view(url="admin/")),
        # API urls
        # API Docs
        re_path(r"api/schema/?$", SpectacularAPIView.as_view(), name="schema"),
        # Optional UI:
        re_path(
            r"api/schema/swagger-ui/?$",
            SpectacularSwaggerView.as_view(url_name="schema"),
            name="swagger-ui",
        ),
        re_path(
            r"api/schema/redoc/?$",
            SpectacularRedocView.as_view(url_name="schema"),
            name="redoc",
        ),
        path(f"{api_prefix}auth/", include("authentication.urls")),
        path(f"{api_prefix}", include("accounts.urls")),
        path(f"{api_prefix}", include("courses.urls")),
        path(f"{api_prefix}", include("chat.urls")),
        path(f"{api_prefix}", include("notifications.urls")),
    ]
    + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
)
