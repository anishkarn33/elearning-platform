import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from elearning_project.settings.base import env


os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    env("DJANGO_SETTINGS_MODULE", default="elearner_project.settings.local"),
)

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

# Import after asgi app initialization
from websocket.urls import websocket_urlpatterns  # noqa
from websocket.middleware import WebsocketAuthMiddleware  # noqa

application = ProtocolTypeRouter(
    {
        "http": django_asgi_app,
        "websocket": WebsocketAuthMiddleware(URLRouter(websocket_urlpatterns)),
    }
)
