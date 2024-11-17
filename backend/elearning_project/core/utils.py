import re
import string
import random
import inflection

from django.core import validators
from django.utils.deconstruct import deconstructible
from django.utils.translation import gettext_lazy as _
from rest_framework.response import Response


def random_username(size=6, chars=string.ascii_uppercase + string.digits):
    return "".join(random.choice(chars) for _ in range(size))


def random_digits(size=6, chars=string.digits):
    return "".join(random.choice(chars) for _ in range(size))


@deconstructible
class UsernameValidator(validators.RegexValidator):
    regex = r"^[\w.]+$"
    message = _(
        "Please enter a valid username. This value may contain only letters and numbers"
    )
    flags = re.ASCII


def success_response(detail, code=200, **kwargs):
    data = {"status": "Success", "detail": detail, "data": {**kwargs}}
    return Response(data, code)


def camelize(data):
    """
    Recursively convert all keys in a dictionary or list to camelCase.
    """
    if isinstance(data, dict):
        # Convert each key to camelCase and recursively apply camelize to each value
        return {
            inflection.camelize(key, False): camelize(value)
            for key, value in data.items()
        }
    elif isinstance(data, list):
        # Recursively apply camelize to each element in the list
        return [camelize(item) for item in data]
    else:
        # Return the data if it's neither a dictionary nor a list (base case)
        return data
