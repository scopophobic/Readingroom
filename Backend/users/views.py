from rest_framework import generics, status
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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Create the user
        user = serializer.save()
        
        # Generate JWT tokens for the new user
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        
        # Return user data along with tokens
        user_serializer = UserProfileSerializer(user)
        
        return Response({
            'access': str(access),
            'refresh': str(refresh),
            'user': user_serializer.data,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)

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
