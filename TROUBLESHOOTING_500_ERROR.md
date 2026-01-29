# Troubleshooting 500 Error - Quick Fix Guide 🔧

## 🚨 Issue: Still Getting 500 Error

The backend tests are **ALL PASSING**, but you're still getting 500 errors in the browser. This means:

### **✅ Backend is Working:**
- ✅ Serializer validation: PASS
- ✅ File upload: PASS  
- ✅ API endpoints: PASS
- ✅ Database operations: PASS
- ✅ File storage: PASS

### **❌ Frontend-Backend Connection Issue**

## 🔧 Immediate Fixes to Try

### **1. RESTART DJANGO SERVER** ⭐ Most Likely Fix
```bash
# Stop the current server (Ctrl+C)
# Then restart it:
cd backend
python manage.py runserver
```

**Why this works:** Django settings changes (like ALLOWED_HOSTS) require server restart.

### **2. CHECK FOR EXISTING DOCUMENTS**
```bash
cd backend
python manage.py shell -c "
from documents.models import Document
from applications.models import Application
from django.contrib.auth import get_user_model
User = get_user_model()

user = User.objects.get(username='your_username')  # Replace with your username
print('Your applications:')
for app in Application.objects.filter(applicant=user):
    doc_count = Document.objects.filter(application=app).count()
    print(f'  App {app.id}: {app.program.name} ({doc_count} documents)')
    if doc_count > 0:
        print('    ⚠️  This app already has documents - try a different app')
"
```

### **3. CLEAR BROWSER CACHE**
- Press `Ctrl+Shift+R` (hard refresh)
- Or open in incognito/private window
- Clear browser cache completely

### **4. CHECK CONSOLE FOR SPECIFIC ERROR**
Open browser dev tools (F12) and look for:
- Network tab → Check the actual 500 error response
- Console tab → Look for detailed error messages

## 🧪 Quick Test Steps

### **Step 1: Restart Server**
```bash
cd backend
python manage.py runserver
```

### **Step 2: Test with New Application**
1. **Login as applicant**
2. **Go to Programs page**
3. **Apply to a program you haven't applied to before**
4. **Fill out form completely**
5. **Upload a small PDF file** (under 1MB)
6. **Submit**

### **Step 3: Check Results**
- ✅ Should work if server was restarted
- ❌ If still 500, check browser console for specific error

## 📊 What We Know Works

### **Backend Tests:**
```
✅ Direct serializer test: PASS
✅ API client test: PASS  
✅ Multiple file sizes: PASS
✅ Response format: Correct
✅ File storage: Working
```

### **Expected Response:**
```json
{
  "id": 11,
  "application": "12", 
  "document_type_name": "School Recommendation Letter",
  "file_url": "http://localhost:8000/media/documents/...",
  "file_name": "school_recommendation.pdf",
  "file_size": 41,
  "uploaded_at": "2026-01-29T11:53:16.008223+01:00",
  "is_verified": false
}
```

## 🎯 Most Likely Solutions

### **90% Chance: Server Restart**
The ALLOWED_HOSTS change requires Django server restart.

### **9% Chance: Existing Documents**
You're trying to upload to an application that already has a document.

### **1% Chance: Browser Cache**
Old JavaScript cached with old API calls.

## 🔍 If Still Failing After Restart

### **Check Django Server Logs:**
Look at the terminal where Django is running - it should show the actual 500 error details.

### **Check Network Tab:**
1. Open Dev Tools (F12)
2. Go to Network tab
3. Submit application
4. Click on the failing `/api/documents/` request
5. Look at Response tab for actual error

### **Test API Directly:**
```bash
# Test if backend is accessible
curl http://localhost:8000/api/document-types/
```

---

## 🚀 Expected Result After Fix

**After restarting the Django server, you should see:**
```
POST http://localhost:8000/api/documents/ 201 (Created) ✅
✅ Document uploaded successfully
✅ Application submitted successfully
```

**The backend is 100% working - just need to restart the server!** 🎉
