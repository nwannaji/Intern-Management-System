from rest_framework import serializers
from .models import DocumentType, Document


class DocumentTypeSerializer(serializers.ModelSerializer):
    allowed_extensions_list = serializers.ListField(source='get_allowed_extensions_list', read_only=True)
    
    class Meta:
        model = DocumentType
        fields = ['id', 'name', 'description', 'is_required', 'max_file_size', 
                 'allowed_extensions', 'allowed_extensions_list']
        read_only_fields = ['id']


class DocumentSerializer(serializers.ModelSerializer):
    document_type_name = serializers.CharField(source='document_type.name', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = ['id', 'application', 'document_type', 'document_type_name', 
                 'file', 'file_url', 'file_name', 'file_size', 'uploaded_at', 
                 'is_verified', 'verification_notes']
        read_only_fields = ['id', 'application', 'file_size', 'uploaded_at']
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
        return None
    
    def validate(self, attrs):
        file_obj = attrs.get('file')
        document_type = attrs.get('document_type')
        
        if file_obj and document_type:
            # Check file size
            if file_obj.size > document_type.max_file_size:
                raise serializers.ValidationError({
                    'file': f'File size exceeds maximum allowed size of {document_type.max_file_size} bytes'
                })
            
            # Check file extension
            file_extension = file_obj.name.split('.')[-1].lower() if '.' in file_obj.name else ''
            allowed_extensions = document_type.get_allowed_extensions_list()
            if file_extension not in allowed_extensions:
                raise serializers.ValidationError({
                    'file': f'File extension .{file_extension} is not allowed. Allowed extensions: {", ".join(allowed_extensions)}'
                })
        
        return attrs


class DocumentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['document_type', 'file']
    
    def validate(self, attrs):
        application_id = self.context.get('application_id')
        document_type = attrs.get('document_type')
        
        # Check if any document already exists for this application (either/or logic)
        if Document.objects.filter(application_id=application_id).exists():
            raise serializers.ValidationError("A document has already been uploaded for this application. Please remove the existing document first.")
        
        file_obj = attrs.get('file')
        if file_obj and document_type:
            # Check file size
            if file_obj.size > document_type.max_file_size:
                raise serializers.ValidationError({
                    'file': f'File size exceeds maximum allowed size of {document_type.max_file_size} bytes'
                })
            
            # Check file extension
            file_extension = file_obj.name.split('.')[-1].lower() if '.' in file_obj.name else ''
            allowed_extensions = document_type.get_allowed_extensions_list()
            if file_extension not in allowed_extensions:
                raise serializers.ValidationError({
                    'file': f'File extension .{file_extension} is not allowed. Allowed extensions: {", ".join(allowed_extensions)}'
                })
        
        return attrs
    
    def create(self, validated_data):
        application_id = self.context.get('application_id')
        file_obj = validated_data.pop('file')  # Remove file from validated_data
        document_type = validated_data.get('document_type')
        
        document = Document.objects.create(
            application_id=application_id,
            document_type=document_type,
            file=file_obj,
            file_name=file_obj.name,
            file_size=file_obj.size
        )
        return document
