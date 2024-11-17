from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from accounts.models import User, UserProfile

UserAdmin.list_display += ("user_type",)
UserAdmin.list_filter += ("user_type",)
UserAdmin.fieldsets += (("User Type", {"fields": ("user_type",)}),)
admin.site.register(User, UserAdmin)
admin.site.register(UserProfile)
