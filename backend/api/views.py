from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import json
import os
from supabase import create_client, Client

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_ANON_KEY")
supabase: Client = create_client(url, key)

def home(request):
    return JsonResponse({"message": "Welcome to FitStyle"})

def me(request):
    return JsonResponse({"message": "Implement authentication"})

@csrf_exempt
def register(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    try:
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Enter email and password"}, status=400)

        # Sign up
        user = supabase.auth.sign_up({
            "email": email,
            "password": password
        })

        return JsonResponse({"message": "User registration successful"}, status=201)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)

    try:
        data = json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse({"error": "Enter email and password"}, status=400)

        # Sign in
        session = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        return JsonResponse({"message": "Log in successful"}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)