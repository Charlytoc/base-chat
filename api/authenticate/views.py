from rest_framework.views import APIView
import json
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.contrib.auth import authenticate, login
from .serializers import (
    SignupSerializer,
    LoginSerializer,
    UserSerializer,
    UserProfileSerializer,
    OrganizationSerializer,
)
from .models import Token, Organization, UserProfile
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from api.authenticate.decorators.token_required import token_required
from django.contrib.auth.models import User
from django.views import View
from .decorators.token_required import token_required


@method_decorator(csrf_exempt, name="dispatch")
class SignupAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        return Response(
            {"message": "User created successfully"}, status=status.HTTP_201_CREATED
        )

    def post(self, request):
        serializer = SignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User created successfully"}, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name="dispatch")
class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]
            try:
                user = User.objects.get(email=email)
                user = authenticate(username=user.username, password=password)
            except User.DoesNotExist:
                user = None

            if user is not None:
                login(request, user)
                token, created = Token.get_or_create(user=user, token_type="login")
                return Response(
                    {
                        "message": "Login successful",
                        "token": token.key,
                        "expires_at": token.expires_at,
                    },
                    status=status.HTTP_200_OK,
                )
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@method_decorator(csrf_exempt, name="dispatch")
@method_decorator(token_required, name="dispatch")
class UserView(View):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return JsonResponse(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, *args, **kwargs):
        data = json.loads(request.body)
        # Validate if the username is available
        if (
            User.objects.filter(username=data["username"])
            .exclude(id=request.user.id)
            .exists()
        ):
            return JsonResponse(
                {"error": "username-already-taken"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # validate if the email is available
        if (
            User.objects.filter(email=data["email"])
            .exclude(id=request.user.id)
            .exists()
        ):
            return JsonResponse(
                {"error": "email-already-taken"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.user.username = data["username"]
        request.user.email = data["email"]
        request.user.save()

        if "profile" in data:
            profile = request.user.profile
            if not profile:
                profile = UserProfile.objects.create(
                    user=request.user, **data["profile"]
                )
            serializer = UserProfileSerializer(profile, data=data["profile"])
            if serializer.is_valid():
                serializer.save()

        return JsonResponse(
            {"message": "user-updated-successfully"}, status=status.HTTP_200_OK
        )


@method_decorator(csrf_exempt, name="dispatch")
@method_decorator(token_required, name="dispatch")
class OrganizationView(View):
    def get(self, request):
        organizations = Organization.objects.filter(owner=request.user)
        serializer = OrganizationSerializer(organizations, many=True)
        return JsonResponse(serializer.data, safe=False)

    def post(self, request):
        data = json.loads(request.body)
        serializer = OrganizationSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Organization created successfully"},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
