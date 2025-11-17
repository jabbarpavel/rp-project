using System;

namespace RP.CRM.Domain.Enums
{
    [Flags]
    public enum Permission
    {
        None = 0,
        
        // Customer permissions
        ViewCustomers = 1 << 0,          // 1
        CreateCustomers = 1 << 1,        // 2
        EditCustomers = 1 << 2,          // 4
        DeleteCustomers = 1 << 3,        // 8
        
        // Document permissions
        ViewDocuments = 1 << 4,          // 16
        UploadDocuments = 1 << 5,        // 32
        DeleteDocuments = 1 << 6,        // 64
        
        // User management permissions
        ViewUsers = 1 << 7,              // 128
        CreateUsers = 1 << 8,            // 256
        EditUsers = 1 << 9,              // 512
        DeleteUsers = 1 << 10,           // 1024
        ManagePermissions = 1 << 11,     // 2048
        
        // Predefined roles
        User = ViewCustomers | CreateCustomers | EditCustomers | ViewDocuments | UploadDocuments,
        Admin = ViewCustomers | CreateCustomers | EditCustomers | DeleteCustomers | 
                ViewDocuments | UploadDocuments | DeleteDocuments |
                ViewUsers | CreateUsers | EditUsers | DeleteUsers | ManagePermissions
    }
}
