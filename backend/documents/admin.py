from django.contrib import admin
from .models import DocumentType, Document


@admin.register(DocumentType)
class DocumentTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_required', 'max_file_size', 'allowed_extensions')
    list_filter = ('is_required',)
    search_fields = ('name', 'description')
    ordering = ('name',)


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ('application', 'document_type', 'file_name', 'file_size', 'is_verified', 'uploaded_at')
    list_filter = ('document_type', 'is_verified', 'uploaded_at')
    search_fields = ('application__applicant__username', 'file_name', 'document_type__name')
    ordering = ('-uploaded_at',)
    readonly_fields = ('uploaded_at', 'file_size')
    
    actions = ['verify_documents', 'unverify_documents']
    
    def verify_documents(self, request, queryset):
        queryset.update(is_verified=True)
    verify_documents.short_description = "Mark selected documents as verified"
    
    def unverify_documents(self, request, queryset):
        queryset.update(is_verified=False)
    unverify_documents.short_description = "Mark selected documents as unverified"
