import json
from channels.generic.websocket import AsyncWebsocketConsumer

from .utils import save_message, serialize_user


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope["url_route"]["kwargs"]["chat_id"]
        self.chat_group_name = "chat_%s" % self.chat_id
        # current authorised user
        self.user = self.scope["user"]

        # Join chat group
        await self.channel_layer.group_add(self.chat_group_name, self.channel_name)

        await self.accept()

    async def disconnect(self, close_code):
        # Leave chat group
        await self.channel_layer.group_discard(self.chat_group_name, self.channel_name)

    # Receive message from WebSocket
    async def receive(self, text_data):
        """
        text_data is raw text data received from the websocket
        so no parsers is used like normal Django views.
        eg. CamelCaseJSONParser or JSONParser etc. will not work.
        so all json data should be in snake_case
        """
        payload = json.loads(text_data)
        action = payload.get("action")
        data = payload.get("data")
        if action == "chat_typing":
            typing_user = None
            if self.user:
                typing_user = await serialize_user(self.user)

            await self.channel_layer.group_send(
                self.chat_group_name,
                {
                    "type": "chat.typing",
                    "data": {"action": action, "data": {"user": typing_user}},
                },
            )
            return
        else:
            # action == 'chat_message'
            chat_group = self.chat_id
            data = {**data, "chat_group": chat_group}

            if self.user:
                data = {**data, "user": self.user}
                data = await save_message(data)

            # Send message to chat group
            await self.channel_layer.group_send(
                self.chat_group_name,
                {
                    "type": "chat.message",
                    "data": {"action": "chat_message", "data": data},
                },
            )

    async def chat_message(self, event):
        # Receive message from chat group
        data = event["data"]
        # Send message to WebSocket
        await self.send(text_data=json.dumps({**data}))

    async def chat_typing(self, event):
        # Rceive user typing
        data = event["data"]
        await self.send(text_data=json.dumps({**data}))
