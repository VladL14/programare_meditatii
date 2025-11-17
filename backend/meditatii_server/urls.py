from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from programari.views import ProgramareViewSet

# Creăm router-ul
router = DefaultRouter()
# Îi spunem să gestioneze toate cererile pentru 'programari' folosind ViewSet-ul nostru
router.register(r'programari', ProgramareViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    # Aici includem toate URL-urile generate de router sub prefixul 'api/'
    path('api/', include(router.urls)),
]