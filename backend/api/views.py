from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

def home(request):
    return JsonResponse({"message": "Welcome to FitStyle"})

def me(request):
    return JsonResponse({"message": "Implement authentication"})