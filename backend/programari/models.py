from django.db import models

class Programare(models.Model):
    nume_elev = models.CharField(max_length=100)
    data = models.DateField()
    ora_inceput = models.TimeField()
    ora_sfarsit = models.TimeField()
    este_blocat = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.nume_elev} ({self.data})"