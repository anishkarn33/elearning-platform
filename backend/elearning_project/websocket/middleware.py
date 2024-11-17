from django.db import close_old_connections
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from jwt import decode as jwt_decode
from django.conf import settings
from urllib.parse import parse_qs

from .utils import get_user


class WebsocketAuthMiddleware:
    """
    Custom token auth middleware
    """

    def __init__(self, app):
        # Store the ASGI application we were passed
        self.app = app

    async def __call__(self, scope, receive, send):

        # Close old database connections to prevent usage of timed out connections
        close_old_connections()

        # Get the token
        try:
            token = parse_qs(scope["query_string"].decode("utf8"))["token"][0]
        except Exception:
            # user did not give us token
            token = "fake-token"
        # Try to authenticate the user
        try:
            # This will automatically validate the token and raise an error if token is invalid
            UntypedToken(token)
        except (InvalidToken, TokenError):
            # Token is invalid
            # close the connection
            await send({"type": "websocket.close", "code": 1000})
            scope["user"] = await get_user(id=None)
        else:
            #  Then token is valid, decode it
            decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            # Will return a dictionary like -
            # {
            #     "token_type": "access",
            #     "exp": 1568770772,
            #     "jti": "5c15e80d65b04c20ad34d77b6703251b",
            #     "user_id": 6
            #     "name": "Naman Mathur"
            # }

            # Get the user using ID
            scope["user"] = await get_user(id=int(decoded_data["user_id"]))

        # Return the inner application directly and let it run everything else
        return await self.app(scope, receive, send)
