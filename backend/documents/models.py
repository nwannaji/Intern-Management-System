from django.db import models
from django.contrib.auth import get_user_model
from applications.models import Application

User = get_user_model()


class DocumentType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    is_required = models.BooleanField(default=True)
    max_file_size = models.IntegerField(default=5242880)  # 5MB in bytes
    allowed_extensions = models.CharField(max_length=200, default='pdf,doc,docx,jpg,jpeg,png')
    
    def __str__(self):
        return self.name
    
    def get_allowed_extensions_list(self):
        return self.allowed_extensions.split(',')


class Document(models.Model):
    application = models.ForeignKey(Application, on_delete=models.CASCADE, related_name='documents')
    document_type = models.ForeignKey(DocumentType, on_delete=models.CASCADE)
    file = models.FileField(upload_to='documents/%Y/%m/')
    file_name = models.CharField(max_length=255)
    file_size = models.IntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    verification_notes = models.TextField(blank=True, null=True)
    
    class Meta:
        # Removed unique_together constraint to allow either/or logic
        # The serializer will enforce one document per application
        pass
    
    def __str__(self):
        return f"{self.application} - {self.document_type.name}"
    
    def get_file_extension(self):
        return self.file_name.split('.')[-1].lower() if '.' in self.file_name else ''
    
    def is_file_size_valid(self):
        return self.file_size <= self.document_type.max_file_size
    
    def is_file_extension_valid(self):
        return self.get_file_extension() in self.document_type.get_allowed_extensions_list()
