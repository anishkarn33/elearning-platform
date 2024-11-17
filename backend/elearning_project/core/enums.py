from enum import IntEnum, StrEnum


class USER_TYPES(IntEnum):
    REGULAR_USER = 1
    INSTRUCTOR = 2
    SUPER_ADMIN = 3


class COURSE_STATUS(StrEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"
