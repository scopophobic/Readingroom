from rest_framework import serializers
from .models import Comment
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class RecursiveField(serializers.Serializer):
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    replies = RecursiveField(many=True, read_only=True)
    parent = serializers.PrimaryKeyRelatedField(queryset=Comment.objects.all(), required=False, allow_null=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'parent', 'content', 'created_at', 'replies']
        read_only_fields = ['user', 'post', 'created_at']

    def validate_parent(self, value):
        if value and value.post != self.context.get('post'):
            raise serializers.ValidationError("Parent comment must belong to the same post")
        return value