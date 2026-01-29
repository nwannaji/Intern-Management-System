# Either/Or Document Requirement Update

## 🎯 Updated Requirement

Applicants now need to upload **EITHER** a School Recommendation Letter **OR** an NYSC Orientation Camp Letter, but **NOT both**.

### **Key Changes:**
- ✅ **One Document Required:** Applicants must upload exactly one document
- ✅ **Either/Or Logic:** Can choose between Recommendation Letter OR NYSC Letter
- ✅ **No Both Allowed:** System prevents uploading both documents
- ✅ **Auto-Replace:** Uploading a new document replaces the previous one

## 🔧 System Implementation

### **1. Backend Changes**
```sql
-- Document Types (Both Optional)
- School Recommendation Letter (Required: False)
- NYSC Orientation Camp Letter (Required: False)
```

### **2. Validation Logic**
```javascript
// Frontend Validation
const uploadedDocTypes = Object.keys(uploadedFiles);
if (uploadedDocTypes.length === 0) {
  errors.document_required = 'At least one document is required (Recommendation Letter OR NYSC Letter)';
} else if (uploadedDocTypes.length > 1) {
  errors.document_required = 'Only one document is allowed (either Recommendation Letter OR NYSC Letter, not both)';
}
```

### **3. File Handling**
```javascript
// Only process first file, clear existing uploads
const fileToProcess = files[0];
setUploadedFiles({}); // Clear existing
setUploadedFiles({ [matchedDocType.id]: fileToProcess }); // Set new
```

## 📱 Updated User Interface

### **Document Upload Section**
```
Documents

┌─────────────────────────────────────┐
│        📁 Browse Files             │
│     or drag and drop               │
│                                     │
│ Supported formats: pdf,doc,docx... │
│ Max size: 5MB                      │
└─────────────────────────────────────┘

Document Requirements:

⚠️ Important: Only ONE document is required
Please upload EITHER a School Recommendation Letter OR an NYSC Orientation Camp Letter, but not both.

┌─────────────────────────────────────┐
│ Option 1: School Recommendation Letter │
│ Recommendation letter from your school │
│ supporting your application             │
│ Max size: 5MB • Formats: PDF, DOC...   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Option 2: NYSC Orientation Camp Letter │
│ Letter showing completion of 3 weeks   │
│ NYSC orientation camp                  │
│ Max size: 5MB • Formats: PDF, DOC...   │
└─────────────────────────────────────┘

Note: The system will automatically assign your document to the correct category based on the filename.
If you upload a new document, it will replace the previous one.
```

### **Uploaded Document Display**
```
Uploaded Document

✅ Document uploaded successfully. You can replace it by uploading a new file.

📄 school_recommendation.pdf
    Size: 2.3MB • Type: School Recommendation Letter
                                    [Remove]
```

## 🧪 Testing Results

### **Validation Scenarios:**
```
✅ No documents uploaded: PASS
   Error: At least one document is required (Recommendation Letter OR NYSC Letter)

✅ One document uploaded: PASS
   Validation successful

✅ Two documents uploaded: PASS
   Error: Only one document is allowed (either Recommendation Letter OR NYSC Letter, not both)
```

### **File Matching Test:**
```
✅ school_recommendation_letter.pdf → School Recommendation Letter
✅ nysc_orientation_letter.pdf → NYSC Orientation Camp Letter
✅ All other filename patterns working correctly
```

## 🚀 User Experience Flow

### **Scenario 1: Upload School Recommendation Letter**
1. User clicks "Browse Files"
2. Selects `school_recommendation.pdf`
3. System assigns to "School Recommendation Letter"
4. Shows success message
5. User can submit application

### **Scenario 2: Upload NYSC Letter**
1. User clicks "Browse Files"
2. Selects `nysc_orientation.pdf`
3. System assigns to "NYSC Orientation Camp Letter"
4. Shows success message
5. User can submit application

### **Scenario 3: Replace Document**
1. User already has document uploaded
2. User clicks "Browse Files" again
3. Selects new document
4. System replaces old document automatically
5. Shows new document with replacement message

## 📋 Implementation Details

### **File Upload Restrictions:**
- **Single File:** Only first file processed from selection
- **Auto-Clear:** Existing uploads cleared when new file selected
- **Drag & Drop:** Only first file from dropped files processed
- **File Matching:** Smart matching based on filename patterns

### **Validation Rules:**
- **Minimum:** At least one document required
- **Maximum:** Only one document allowed
- **File Types:** PDF, DOC, DOCX, JPG, JPEG, PNG
- **File Size:** Maximum 5MB per file

### **Error Handling:**
- **No Document:** "At least one document is required"
- **Multiple Documents:** "Only one document is allowed"
- **Invalid File:** File-specific validation errors
- **Size Limit:** File size validation errors

## ✅ Benefits

### **For Applicants:**
- ✅ **Simpler Process:** Only need one document
- ✅ **Flexible Choice:** Can choose either recommendation or NYSC letter
- ✅ **Easy Replacement:** Can change document before submission
- ✅ **Clear Requirements:** No confusion about what to upload

### **For Administrators:**
- ✅ **Consistent Review:** Always exactly one document per application
- ✅ **Clear Categories:** Documents properly categorized
- ✅ **Faster Processing:** Less document validation overhead
- ✅ **Better Organization:** Standardized document requirements

## 🎯 Summary

The document submission system now implements a **clean either/or requirement** where applicants must upload exactly **one document** - either a School Recommendation Letter or an NYSC Orientation Camp Letter. The system enforces this requirement through validation, automatically replaces documents when new ones are uploaded, and provides clear guidance to users about the requirements.

**Key Achievement:** Simplified from potentially multiple documents to exactly **one required document**, while maintaining flexibility for different applicant situations.
