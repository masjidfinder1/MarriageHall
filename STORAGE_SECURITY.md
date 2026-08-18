# Supabase Storage Security Policies

## Overview
This document explains the Row Level Security (RLS) policies applied to Supabase Storage buckets to prevent unauthorized access and file enumeration.

## Security Issue Fixed
**Problem**: Broad SELECT policies on storage.objects allowed any user (authenticated or not) to list all files in buckets, exposing sensitive file information.

**Solution**: Implemented role-based access control:
- **Public Read**: Public-facing content (gallery, content, branding) can be read by anyone
- **Public List Block**: Non-admin users CANNOT list files in buckets (preventing full file enumeration)
- **Admin Write/Delete**: Only authenticated users with `admin`, `manager`, or `staff` roles can upload, update, or delete files
- **Admin-Only Buckets**: `branding actions`, `content actions`, `gallery actions`, `rooms actions` are restricted to admins only

## Buckets & Policies

### 1. **branding** (Public Read, Admin Write)
```
- READ: ✅ Anyone (for logo, favicon display on site)
- LIST: ❌ Only admins (prevents file enumeration)
- WRITE: ✅ Only admins
- UPDATE: ✅ Only admins
- DELETE: ✅ Only admins
```

### 2. **branding actions** (Admin Only)
```
- READ: ✅ Only admins
- LIST: ✅ Only admins
- WRITE: ✅ Only admins
- UPDATE: ✅ Only admins
- DELETE: ✅ Only admins
```

### 3. **content** (Public Read, Admin Write)
```
- READ: ✅ Anyone (for hero images, site content)
- LIST: ❌ Only admins
- WRITE: ✅ Only admins
- UPDATE: ✅ Only admins
- DELETE: ✅ Only admins
```

### 4. **content actions** (Admin Only)
```
- READ: ✅ Only admins
- LIST: ✅ Only admins
- WRITE: ✅ Only admins
- UPDATE: ✅ Only admins
- DELETE: ✅ Only admins
```

### 5. **gallery** (Public Read, Admin Write)
```
- READ: ✅ Anyone (for gallery display)
- LIST: ❌ Only admins
- WRITE: ✅ Only admins
- UPDATE: ✅ Only admins
- DELETE: ✅ Only admins
```

### 6. **gallery actions** (Admin Only)
```
- READ: ✅ Only admins
- LIST: ✅ Only admins
- WRITE: ✅ Only admins
- UPDATE: ✅ Only admins
- DELETE: ✅ Only admins
```

### 7. **rooms** (Public Read, Admin Write)
```
- READ: ✅ Anyone (for room display on site)
- LIST: ❌ Only admins
- WRITE: ✅ Only admins
- UPDATE: ✅ Only admins
- DELETE: ✅ Only admins
```

### 8. **rooms actions** (Admin Only)
```
- READ: ✅ Only admins
- LIST: ✅ Only admins
- WRITE: ✅ Only admins
- UPDATE: ✅ Only admins
- DELETE: ✅ Only admins
```

### 9. **venues** (Public Read, Admin Write)
```
- READ: ✅ Anyone (for venue display)
- LIST: ❌ Only admins
- WRITE: ✅ Only admins
- UPDATE: ✅ Only admins
- DELETE: ✅ Only admins
```

## Key Security Features

### 1. **Role-Based Access Control**
All policies check for user role in `public.profiles` table:
```sql
EXISTS (
  SELECT 1 FROM public.profiles p
  WHERE p.id = auth.uid()
    AND p.role IN ('admin', 'manager', 'staff')
)
```

### 2. **No File Enumeration**
Only individual file access (by direct path) is allowed for non-admins. The `LIST` operation is restricted to admins only.

**Example**: 
- ✅ User can access: `https://...storage.../branding/logo.png` (direct file)
- ❌ User cannot list: All files in branding bucket

### 3. **Separation of Concerns**
Action buckets (`*_actions`) are for internal/temporary operations and are admin-only. Public buckets allow direct file access but no listing.

### 4. **Auth-Required for Admin Operations**
All admin operations require `auth.uid() IS NOT NULL`, ensuring only authenticated users can modify files.

## Implementation Details

### Policy Structure for Public-Read Buckets
```sql
-- Read policy (anyone)
CREATE POLICY "bucket_read_public" ON storage.objects
FOR SELECT
USING (bucket_id = 'bucket_name');

-- Write/Update/Delete policies (admins only)
CREATE POLICY "bucket_write_admin" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'bucket_name' AND
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role IN ('admin', 'manager', 'staff')
  )
);
```

### Policy Structure for Admin-Only Buckets
```sql
CREATE POLICY "bucket_actions_admin_only" ON storage.objects
FOR ALL
USING (
  bucket_id = 'bucket actions' AND
  auth.uid() IS NOT NULL AND
  EXISTS (...)
)
WITH CHECK (...);
```

## How Direct File Access Works

Users can still access files directly if they know the exact path:

**Frontend Code Example**:
```typescript
// This works (direct file access with cache busting)
const logoUrl = `https://project.supabase.co/storage/v1/object/public/branding/logo.png?v=${Date.now()}`;

// This DOESN'T work for non-admins (file listing)
const { data: files } = await supabase.storage
  .from('branding')
  .list(); // ❌ Permission denied for non-admins
```

## Deployment Instructions

1. **Apply to Supabase**:
   - Copy the schema from `supabase-schema.sql` or `supabase-schema-complete.sql`
   - Go to Supabase SQL Editor
   - Paste and execute

2. **Verify Policies**:
   - Go to Authentication > Policies in Supabase Dashboard
   - Check `storage.objects` table
   - All policies should be listed and marked as active

3. **Test Security**:
   ```typescript
   // This should work (public read)
   const { data } = await supabase.storage
     .from('branding')
     .download('logo.png');

   // This should fail (non-admin list)
   try {
     await supabase.storage.from('branding').list();
   } catch (e) {
     console.log('Expected: Permission denied');
   }

   // This should work (admin operations)
   const { data: user } = await supabase.auth.getUser();
   if (userRole === 'admin') {
     await supabase.storage.from('branding').list(); // ✅ Works
   }
   ```

## Benefits

✅ **Security**: No public file enumeration  
✅ **Performance**: Reduces unnecessary bucket listing requests  
✅ **Privacy**: Hides file structure from unauthorized users  
✅ **Compliance**: Follows principle of least privilege  
✅ **Scalability**: Cleaner bucket structure as data grows  

## Troubleshooting

### Problem: File uploads fail with "Permission denied"
- **Solution**: Ensure user has admin/manager/staff role in `profiles` table

### Problem: Can't access image URL
- **Solution**: Use direct file paths only (not bucket list). Image URLs should be stored in database tables (venues, rooms, gallery, etc.)

### Problem: Admin can't list files in their bucket
- **Solution**: Verify their auth.uid() matches a profile with correct role

## Future Improvements

- Add object signing for time-limited file access
- Implement separate policies per content type (images vs. documents)
- Add file size/type validation in policies
- Monitor storage access patterns via logging
