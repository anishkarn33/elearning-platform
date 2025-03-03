# Generated by Django 5.1.1 on 2024-09-08 10:28

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('courses', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='ChatGroup',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('name', models.CharField(max_length=100)),
                ('photo', models.URLField(blank=True, null=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('chat_type', models.CharField(choices=[('group', 'Group'), ('individual', 'Individual')], default='individual', max_length=20)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('removed_at', models.DateTimeField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('is_public', models.BooleanField(default=False)),
                ('is_deleted', models.BooleanField(default=False)),
                ('admin', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='chat_groups_admin', to=settings.AUTH_USER_MODEL)),
                ('course', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='chat_groups', to='courses.course')),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_created_by', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'tb_chat_groups',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ChatMembership',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('last_read', models.DateTimeField(blank=True, null=True)),
                ('unread_messages', models.IntegerField(default=0)),
                ('cleared', models.DateTimeField(blank=True, null=True)),
                ('last_date', models.DateTimeField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=False)),
                ('is_blocked', models.BooleanField(default=False)),
                ('is_suspended', models.BooleanField(default=False)),
                ('is_admin', models.BooleanField(default=False)),
                ('chat_group', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chat_memberships', to='chat.chatgroup')),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_created_by', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='chat_memberships', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'tb_chat_memberships',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddField(
            model_name='chatgroup',
            name='members',
            field=models.ManyToManyField(related_name='chat_groups', through='chat.ChatMembership', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='ChatMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('message_type', models.CharField(choices=[('text', 'Text'), ('image', 'Image'), ('video', 'Video'), ('audio', 'Audio'), ('file', 'File'), ('location', 'Location'), ('contact', 'Contact'), ('sticker', 'Sticker'), ('document', 'Document'), ('other', 'Other')], default='text', max_length=10)),
                ('text', models.TextField(blank=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('removed_at', models.DateTimeField(blank=True, null=True)),
                ('is_deleted_by_sender', models.BooleanField(default=False)),
                ('is_deleted_by_admin', models.BooleanField(default=False)),
                ('chat_group', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='chat_messages', to='chat.chatgroup')),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_created_by', to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='messages', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'tb_chat_messages',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ChatMessageRead',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('read_at', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_created_by', to=settings.AUTH_USER_MODEL)),
                ('message', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='message_reads', to='chat.chatmessage')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='message_reads', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'tb_chat_message_reads',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddField(
            model_name='chatmessage',
            name='reads',
            field=models.ManyToManyField(related_name='read_messages', through='chat.ChatMessageRead', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='MessageFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('url', models.URLField(blank=True, null=True)),
                ('file_type', models.CharField(choices=[('image', 'Image'), ('video', 'Video'), ('audio', 'Audio'), ('document', 'Document'), ('other', 'Other')], default='image', max_length=10)),
                ('file_name', models.CharField(blank=True, default='', max_length=200, null=True)),
                ('thumbnail_url', models.URLField(blank=True, default='', max_length=2000, null=True)),
                ('created_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)s_created_by', to=settings.AUTH_USER_MODEL)),
                ('message', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='files', to='chat.chatmessage')),
            ],
            options={
                'db_table': 'tb_message_files',
                'ordering': ['-created_at'],
            },
        ),
    ]
