"""
WSGI config for elearning_project project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/wsgi/
"""

import os
from elearning_project.settings.base import env

from django.core.wsgi import get_wsgi_application

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    env("DJANGO_SETTINGS_MODULE", default="elearning_project.settings.local"),
)

application = get_wsgi_application()
