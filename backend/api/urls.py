from django.urls import path
from api import views

urlpatterns = [
    path('', views.home, name='home'),
    path('me/', views.me, name='me'),
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
]
