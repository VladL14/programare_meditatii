from rest_framework import serializers
from .models import Programare

class ProgramareSerializer(serializers.ModelSerializer):
    class Meta:
        model = Programare
        fields = '__all__'