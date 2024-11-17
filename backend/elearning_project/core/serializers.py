import inflection
from rest_framework.serializers import Serializer
from typing import Generic, TypeVar

T = TypeVar("T")


class SuccessResponseSerializer(Serializer, Generic[T]):
    detail: str
    data: T
    status: str


class ListResponseSerializer(Serializer, Generic[T]):
    results: list[T]
    count: int
    next: str
    previous: str


class SuccessListResponseSerializer(Serializer, Generic[T]):
    detail: str
    data: ListResponseSerializer[T]
    status: str


class CamelCaseSerializerMixin:
    def to_representation(self, instance):
        """
        Override the default `to_representation` method to convert keys to camelCase.
        """
        data = super().to_representation(instance)
        return {inflection.camelize(key, False): value for key, value in data.items()}
