from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import User
from .serializers import UserRegisterSerializer, UserProfileSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Simple logout - just return success
            # Token will be removed from client-side storage
            return Response({"message": "Successfully logged out"}, status=200)
        except Exception as e:
            return Response(status=400, data={"error": str(e)})
