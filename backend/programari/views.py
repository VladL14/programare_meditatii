from rest_framework import viewsets
from .models import Programare
from .serializers import ProgramareSerializer

class ProgramareViewSet(viewsets.ModelViewSet):
    queryset = Programare.objects.all()
    serializer_class = ProgramareSerializer