# Image Upload Feature Documentation

## Overview
The e-commerce store now supports local image uploads for products. Images are stored in the `/public/uploads/products/` directory and served directly from there.

## How to Use

### Admin Panel
1. Navigate to `/admin/products/new` to create a new product
2. In the **"Product Images"** section, you have two options:
   - **Upload from device**: Click the blue "Click to upload" button to select an image file from your computer
   - **Paste image URL**: Enter a full URL (e.g., `https://example.com/image.jpg`) in the input field

### Upload Details
- **Supported formats**: JPEG, PNG, WebP, GIF
- **Maximum file size**: 5MB per image
- **Unlimited images**: Add as many images as needed
- **Image preview**: Uploaded images show a preview thumbnail

### Add/Remove Images
- Click **"+ Add Another Image"** to add more image fields
- Click the **trash icon** to remove an image (not available for the only image)

## Technical Details

### Upload API Endpoint
- **URL**: `/api/upload`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Request Body**: FormData with file field
- **Response**:
  ```json
  {
    "success": true,
    "url": "/uploads/products/product-1234567-abc123.jpg",
    "filename": "product-1234567-abc123.jpg"
  }
  ```

### Storage
- Images are stored locally in: `public/uploads/products/`
- Filenames are auto-generated with format: `product-[timestamp]-[random].ext`
- Files are served as static assets via the Next.js public directory

### File Structure
```
public/
  uploads/
    products/
      product-1705348800000-abc123.jpg
      product-1705348801000-def456.png
      ...
```

## Configuration

### .gitignore
The `/public/uploads/` directory is ignored in git to prevent large binary files from being committed. Add it to version control if you prefer to track uploads (not recommended for production).

### Environment Variables
No additional environment variables are required for local file uploads.

## Production Considerations

For production deployments, consider migrating to cloud storage:

### Option 1: AWS S3
```
- Install: `aws-sdk`
- Create S3 bucket
- Update /api/upload route to use S3 SDK
- No local storage needed
```

### Option 2: Cloudinary
```
- Sign up at cloudinary.com
- Install: `next-cloudinary`
- Use Cloudinary's React component
- Free tier includes 25GB storage
```

### Option 3: Vercel Blob (Recommended for Vercel deployments)
```
- Install: `@vercel/blob`
- Update /api/upload route
- Automatic scaling
```

## Example Usage in Admin Form

```tsx
// File selected for upload
const file = event.target.files[0];
handleFileUpload(index, file);

// Response will update form with: /uploads/products/product-xxx.jpg
// Image immediately appears in preview
```

## Error Handling

The upload API returns appropriate error messages:
- Invalid file type: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed."
- File too large: "File size exceeds 5MB limit"
- Upload failure: "Failed to upload file"

## Future Enhancements

- Image cropping/editing before upload
- Drag-and-drop support
- Batch upload
- Image optimization/compression
- WebP conversion
- CDN integration
