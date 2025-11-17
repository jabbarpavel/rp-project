# Feature Guide: Role-Based Access Control & Document Management

## 1. Role-Based Access Control (RBAC)

### Permission System
The system uses a **flags-based enumeration** for efficient permission storage and checking:

```csharp
[Flags]
public enum Permission
{
    None = 0,
    
    // Customer permissions
    ViewCustomers = 1,      // Can view customer list and details
    CreateCustomers = 2,    // Can create new customers
    EditCustomers = 4,      // Can edit customer information
    DeleteCustomers = 8,    // Can delete customers
    
    // Document permissions
    ViewDocuments = 16,     // Can view documents
    UploadDocuments = 32,   // Can upload new documents
    DeleteDocuments = 64,   // Can delete documents
    
    // User management permissions
    ViewUsers = 128,        // Can view user list
    CreateUsers = 256,      // Can create new users
    EditUsers = 512,        // Can edit user information
    DeleteUsers = 1024,     // Can delete users
    ManagePermissions = 2048, // Can manage user permissions
    
    // Predefined roles
    User = ViewCustomers | CreateCustomers | EditCustomers | ViewDocuments | UploadDocuments,
    Admin = All permissions
}
```

### How It Works

1. **User Entity**: Each user has a `Permissions` field (integer) that stores their permissions as bitwise flags
2. **Authorization**: The `RequirePermissionAttribute` checks if the current user has the required permission
3. **Default Role**: New users get the "User" role by default (basic permissions)
4. **Backend Configuration**: Permissions are set in the database and can be modified per user

### Example Usage

**Backend (Controller):**
```csharp
[HttpDelete("{id:int}")]
[RequirePermission(Permission.DeleteCustomers)]
public async Task<IActionResult> Delete(int id)
{
    // Only users with DeleteCustomers permission can access this
}
```

**Backend (User Entity):**
```csharp
var user = await _userRepository.GetByIdAsync(userId);
if (user.HasPermission(Permission.DeleteDocuments))
{
    // User can delete documents
}
```

### Permission Combinations
- **Regular User**: Can view/create/edit customers and view/upload documents
- **Admin**: Can do everything including delete customers, delete documents, and manage users
- **Custom Roles**: Combine any permissions as needed (e.g., view-only user, document manager)

---

## 2. Document Management

### Features

#### Upload Documents
- **Location**: Customer detail page, in the right column below "Hauptberater"
- **Max File Size**: 10 MB
- **Supported Files**: Any file type
- **Storage**: Files are stored in `/uploads/{tenantId}/` directory
- **Metadata Captured**:
  - Original filename
  - File size
  - Content type (MIME type)
  - Upload date and time
  - Uploader's name
  - Associated customer

#### View Documents
Each document is displayed with:
- 📄 Document icon
- Filename
- File size (formatted: KB, MB)
- Upload date (DD.MM.YYYY format)
- Uploader name (if available)

#### Download Documents
- Click the download icon (⬇️) to download the original file
- Browser will prompt to save the file with its original name

#### Delete Documents
- Click the delete icon (🗑️) to remove a document
- Confirmation dialog appears to prevent accidental deletion
- Both database record and physical file are removed

### UI Components

**Document Card Structure:**
```
┌─────────────────────────────────────┐
│ Dokumente              [+ Hochladen]│
├─────────────────────────────────────┤
│ 📄 contract.pdf                     │
│    2.5 MB • 17.11.2024 • Max Müller │
│                          [⬇️] [🗑️]   │
├─────────────────────────────────────┤
│ 📄 identity_card.jpg                │
│    1.2 MB • 16.11.2024 • Anna Meyer │
│                          [⬇️] [🗑️]   │
└─────────────────────────────────────┘
```

### Security
- ✅ **Tenant Isolation**: Users can only access documents from their own tenant
- ✅ **Permission Checks**: All operations check user permissions
- ✅ **File Validation**: File size is validated on upload
- ✅ **Secure Storage**: Files stored outside web root
- ✅ **Audit Trail**: Upload date and uploader tracked

### API Endpoints

| Method | Endpoint | Permission Required | Description |
|--------|----------|-------------------|-------------|
| GET | `/api/documents/customer/{customerId}` | ViewDocuments | List all documents for a customer |
| POST | `/api/documents` | UploadDocuments | Upload a new document |
| GET | `/api/documents/{id}/download` | ViewDocuments | Download a document |
| DELETE | `/api/documents/{id}` | DeleteDocuments | Delete a document |

---

## 3. Integration with Customer Detail Page

### Layout
The document management section is integrated into the customer detail page as follows:

```
┌──────────────────────────────┬───────────────────────┐
│                              │                       │
│  Stammdaten                  │  Hauptberater         │
│  (Customer Info)             │  (Advisor Info)       │
│                              │                       │
│  Persönliche Angaben         │  ─────────────────    │
│  (Personal Info)             │                       │
│                              │  Dokumente ⭐ NEW!    │
│                              │  (Documents)          │
│                              │                       │
└──────────────────────────────┴───────────────────────┘
```

### User Flow

1. **Navigate** to customer detail page
2. **Scroll** to the right column
3. **See** the "Dokumente" section below the advisor card
4. **Click** "+ Hochladen" to select and upload a file
5. **View** uploaded documents with all metadata
6. **Download** any document by clicking the download icon
7. **Delete** documents (if permitted) by clicking the trash icon

---

## 4. Database Schema

### New Tables

**Documents Table:**
```sql
CREATE TABLE Documents (
    Id INT PRIMARY KEY,
    FileName VARCHAR(255),
    FilePath VARCHAR(500),
    ContentType VARCHAR(100),
    FileSize BIGINT,
    CustomerId INT REFERENCES Customers(Id),
    UploadedByUserId INT REFERENCES Users(Id),
    TenantId INT REFERENCES Tenants(Id),
    CreatedAt TIMESTAMP,
    UpdatedAt TIMESTAMP
);
```

**Users Table (Updated):**
```sql
ALTER TABLE Users 
ADD COLUMN Permissions INT DEFAULT 55; -- Default User role
```

---

## 5. Future Enhancements

Potential improvements that can be added:

1. **Document Categories**: Tag documents (e.g., "Vertrag", "Ausweis", "Sonstiges")
2. **Document Preview**: Show previews for images and PDFs
3. **Version Control**: Keep history of document changes
4. **Bulk Operations**: Upload/download multiple files at once
5. **Search**: Search documents by name or content
6. **Sharing**: Share documents with other users
7. **Expiration**: Set expiration dates for time-sensitive documents
8. **Compression**: Automatically compress large files
9. **Cloud Storage**: Integrate with AWS S3 or Azure Blob Storage
10. **Admin Dashboard**: Centralized view of all documents and permissions

---

## 6. Testing Guide

### Manual Testing Checklist

**Upload:**
- [ ] Upload a small file (< 1 MB)
- [ ] Upload a large file (< 10 MB)
- [ ] Try uploading a file > 10 MB (should be rejected)
- [ ] Upload different file types (PDF, DOCX, JPG, PNG)

**View:**
- [ ] Verify all documents are listed
- [ ] Check metadata is correct (size, date, uploader)
- [ ] Verify empty state shows when no documents

**Download:**
- [ ] Download a document
- [ ] Verify correct filename and content

**Delete:**
- [ ] Delete a document
- [ ] Verify confirmation dialog appears
- [ ] Check document is removed from list
- [ ] Verify file is deleted from disk

**Permissions:**
- [ ] Test with User role (should be able to view and upload)
- [ ] Test with Admin role (should be able to delete)
- [ ] Test without ViewDocuments permission (should see forbidden)

**Tenant Isolation:**
- [ ] Switch tenants
- [ ] Verify documents from other tenants are not visible

---

## 7. Troubleshooting

### Common Issues

**Issue**: "Fehler beim Hochladen des Dokuments"
- **Cause**: File too large or network error
- **Solution**: Check file size (max 10 MB), check internet connection

**Issue**: "Fehler beim Herunterladen des Dokuments"
- **Cause**: File not found on server
- **Solution**: File may have been deleted from disk, check backend logs

**Issue**: "Forbidden" error
- **Cause**: User lacks required permission
- **Solution**: Admin needs to grant appropriate permissions to user

**Issue**: Documents not showing
- **Cause**: API connection issue or permission issue
- **Solution**: Check browser console for errors, verify API is running

---

## 8. Configuration

### Backend Configuration

**File Storage Location:**
```csharp
// In DocumentsController
var uploadsPath = Path.Combine(_environment.ContentRootPath, "uploads", _tenantContext.TenantId.ToString());
```

**Permission Defaults:**
```csharp
// In AppDbContext
entity.Property(u => u.Permissions)
    .HasDefaultValue((int)Permission.User);
```

### Frontend Configuration

**File Size Limit:**
```typescript
// In CustomerDocumentsComponent
if (file.size > 10 * 1024 * 1024) {
  this.toast.show('Datei ist zu groß (max. 10 MB)', 'error');
  return;
}
```

---

## Support

For questions or issues, please contact the development team or open an issue in the repository.
