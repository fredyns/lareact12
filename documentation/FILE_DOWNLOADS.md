# File Downloads - Serving S3/MinIO Files Through Application Domain

This documentation explains how to serve files from S3/MinIO storage through your application's domain instead of exposing S3 URLs directly.

## Overview

The download system allows you to:
- **Serve files through your application domain** instead of S3/MinIO URLs
- **Control access** with authentication and authorization
- **Stream files efficiently** without loading entire files into memory
- **Support both inline viewing and forced downloads**
- **Cache files** for better performance

## Routes

### 1. Serve File (Inline or Download)
```
GET /downloads/{path}
```
- **Route Name:** `downloads.serve`
- **Default Behavior:** Display inline (in browser)
- **Query Parameter:** Add `?download=1` to force download

### 2. Force Download
```
GET /downloading/{path}
```
- **Route Name:** `downloads.force`
- **Behavior:** Always forces download (attachment)

## Usage Examples

### Backend - Generating Download URLs

#### Using MinioService

```php
use App\Services\MinioService;

class ItemController extends Controller
{
    protected MinioService $minioService;

    public function __construct(MinioService $minioService)
    {
        $this->minioService = $minioService;
    }

    public function show(Item $item)
    {
        // Get inline view URL (displays in browser)
        $fileUrl = $this->minioService->getDownloadUrl($item->file);
        
        // Get forced download URL
        $downloadUrl = $this->minioService->getDownloadUrl($item->file, true);
        
        return Inertia::render('Items/Show', [
            'item' => $item,
            'fileUrl' => $fileUrl,
            'downloadUrl' => $downloadUrl,
        ]);
    }
}
```

#### Using Route Helper Directly

```php
// Inline view
$url = route('downloads.serve', ['path' => 'items/files/document.pdf']);

// Force download
$url = route('downloads.force', ['path' => 'items/files/document.pdf']);

// Inline with download option
$url = route('downloads.serve', ['path' => 'items/files/document.pdf']) . '?download=1';
```

### Frontend - Using Download URLs

#### React/TypeScript Example

```tsx
interface Item {
    id: string;
    name: string;
    file: string;
    image: string;
}

export default function ItemShow({ item }: { item: Item }) {
    // Generate download URLs
    const fileUrl = route('downloads.serve', { path: item.file });
    const imageUrl = route('downloads.serve', { path: item.image });
    const downloadUrl = route('downloads.force', { path: item.file });

    return (
        <div>
            {/* Display image inline */}
            <img src={imageUrl} alt={item.name} />
            
            {/* Link to view PDF in browser */}
            <a href={fileUrl} target="_blank">View File</a>
            
            {/* Link to download file */}
            <a href={downloadUrl}>Download File</a>
        </div>
    );
}
```

#### HTML Example

```html
<!-- View image -->
<img src="/downloads/items/images/photo.jpg" alt="Photo">

<!-- View PDF in browser -->
<a href="/downloads/items/files/document.pdf" target="_blank">View PDF</a>

<!-- Download file -->
<a href="/downloading/items/files/document.pdf">Download PDF</a>

<!-- Force download with query parameter -->
<a href="/downloads/items/files/document.pdf?download=1">Download</a>
```

## File Path Examples

The `{path}` parameter should be the full path to the file in S3/MinIO storage:

```
items/files/uuid-filename.pdf
items/images/uuid-photo.jpg
uploads/documents/report.docx
users/avatars/user-123.png
```

## Features

### 1. Automatic MIME Type Detection
The controller automatically detects and sets the correct `Content-Type` header based on the file extension.

### 2. Streaming Response
Files are streamed directly from S3/MinIO to the client without loading the entire file into memory, making it efficient for large files.

### 3. Proper Headers
- **Content-Type:** Automatically detected
- **Content-Length:** File size
- **Content-Disposition:** `inline` or `attachment`
- **Cache-Control:** Public caching for 1 hour (inline) or no-cache (download)
- **Accept-Ranges:** Supports byte-range requests

### 4. Error Handling
Returns 404 if file doesn't exist in S3/MinIO storage.

## Adding Authentication

To require authentication for downloads, wrap the routes in middleware:

```php
// In routes/web.php

// Public downloads (no auth required)
Route::get('downloads/{path}', [DownloadController::class, 'serve'])
    ->where('path', '.*')
    ->name('downloads.serve');

// OR Protected downloads (auth required)
Route::middleware(['auth'])->group(function () {
    Route::get('downloads/{path}', [DownloadController::class, 'serve'])
        ->where('path', '.*')
        ->name('downloads.serve');
});
```

## Adding Authorization

To check permissions before serving files:

```php
// In DownloadController.php

public function serve(Request $request, string $path)
{
    $path = urldecode($path);
    
    // Check if file exists
    if (!$this->minioService->fileExists($path)) {
        abort(404, 'File not found');
    }
    
    // Add authorization check
    // Example: Check if user owns the file
    if (str_starts_with($path, 'items/')) {
        $item = Item::where('file', $path)
            ->orWhere('image', $path)
            ->firstOrFail();
        
        $this->authorize('view', $item);
    }
    
    // ... rest of the code
}
```

## Performance Considerations

### Caching
- Inline files are cached for 1 hour (`Cache-Control: public, max-age=3600`)
- Download files use no-cache to ensure fresh downloads
- Browsers will cache inline files automatically

### CDN Integration
For production, consider putting a CDN in front of your application to cache the download routes:
- CloudFlare
- AWS CloudFront
- Fastly

### Direct S3 URLs vs Application URLs

**Use Application URLs when:**
- ✅ You need authentication/authorization
- ✅ You want to track downloads
- ✅ You need consistent URLs regardless of S3 configuration
- ✅ You want to hide S3 infrastructure

**Use Direct S3 URLs when:**
- ✅ Files are public
- ✅ You need maximum performance
- ✅ You want to reduce server load
- ✅ You're using a CDN directly with S3

## Migration from Temporary URLs

If you're currently using temporary S3 URLs, here's how to migrate:

### Before (Temporary S3 URLs)
```php
// Controller
$fileUrl = $this->minioService->getFileUrl($item->file, 1440); // 24 hours

// Frontend
<a href={item.file_url}>Download</a>
```

### After (Application URLs)
```php
// Controller
$fileUrl = $this->minioService->getDownloadUrl($item->file);

// Frontend
<a href={route('downloads.serve', { path: item.file })}>Download</a>
```

## Troubleshooting

### File Not Found (404)
- Verify the file path is correct
- Check if file exists in MinIO: `php artisan tinker` → `Storage::disk('minio')->exists('path/to/file')`
- Ensure MinIO is running and accessible

### Slow Downloads
- Check MinIO connection
- Consider using CDN
- Verify network between application and MinIO

### Wrong MIME Type
- The system auto-detects MIME type from file extension
- If incorrect, you may need to manually set it in the controller

### Authentication Issues
- Ensure routes are properly wrapped in auth middleware if needed
- Check session configuration
- Verify user is authenticated

## Example: Complete Implementation

```php
// Controller
class ItemController extends Controller
{
    public function show(Item $item)
    {
        $minioService = app(MinioService::class);
        
        return Inertia::render('Items/Show', [
            'item' => [
                'id' => $item->id,
                'name' => $item->name,
                'file' => $item->file,
                'image' => $item->image,
                'file_url' => $minioService->getDownloadUrl($item->file),
                'image_url' => $minioService->getDownloadUrl($item->image),
                'download_url' => $minioService->getDownloadUrl($item->file, true),
            ],
        ]);
    }
}
```

```tsx
// React Component
export default function ItemShow({ item }: Props) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
                {/* Display image */}
                {item.image && (
                    <img 
                        src={item.image_url} 
                        alt={item.name}
                        className="w-full h-auto rounded"
                    />
                )}
                
                {/* File actions */}
                {item.file && (
                    <div className="flex gap-2 mt-4">
                        <Button asChild>
                            <a href={item.file_url} target="_blank">
                                View File
                            </a>
                        </Button>
                        <Button asChild variant="outline">
                            <a href={item.download_url}>
                                Download File
                            </a>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
```

## Security Best Practices

1. **Always validate file paths** to prevent directory traversal attacks
2. **Implement authorization** for sensitive files
3. **Rate limit** download endpoints to prevent abuse
4. **Log downloads** for audit trails
5. **Use HTTPS** in production
6. **Sanitize filenames** in Content-Disposition headers
7. **Set appropriate CORS headers** if needed

## Summary

The download system provides a secure, efficient way to serve S3/MinIO files through your application domain with:
- ✅ Full control over access
- ✅ Efficient streaming
- ✅ Proper caching
- ✅ Clean URLs
- ✅ Easy integration with existing code
