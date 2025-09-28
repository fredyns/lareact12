# MinIO Integration Setup

This document describes the MinIO integration setup for the Laravel React application, providing S3-compatible object storage for file uploads.

## Overview

MinIO is a high-performance, S3-compatible object storage system that has been integrated into this Laravel application to handle file uploads for the Sample Items module.

## Configuration

### 1. Environment Variables

Add the following MinIO configuration to your `.env` file:

```env
# MinIO Configuration
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
MINIO_ENDPOINT=http://localhost:9000
MINIO_BUCKET_NAME=localhost
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
MINIO_DEFAULT_REGION=us-east-1
MINIO_URL=http://localhost:9000/localhost
MINIO_USE_PATH_STYLE_ENDPOINT=true
```

### 2. Filesystem Configuration

The MinIO disk has been configured in `config/filesystems.php`:

```php
'minio' => [
    'driver' => 's3',
    'key' => env('MINIO_ACCESS_KEY'),
    'secret' => env('MINIO_SECRET_KEY'),
    'region' => env('MINIO_DEFAULT_REGION', 'us-east-1'),
    'bucket' => env('MINIO_BUCKET_NAME'),
    'url' => env('MINIO_URL'),
    'endpoint' => env('MINIO_ENDPOINT'),
    'use_path_style_endpoint' => env('MINIO_USE_PATH_STYLE_ENDPOINT', true),
    'throw' => false,
    'report' => false,
],
```

### 3. Dependencies

The following Composer package has been installed:

```bash
composer require league/flysystem-aws-s3-v3
```

## MinIO Service

A dedicated `MinioService` class has been created at `app/Services/MinioService.php` to provide common MinIO operations:

### Available Methods

- `uploadFile(UploadedFile $file, string $directory, ?string $filename)` - Upload a file
- `uploadContent(string $content, string $path)` - Upload content directly
- `getFileUrl(string $path, int $expiration)` - Get temporary signed URL
- `getPublicUrl(string $path)` - Get public URL (if bucket allows)
- `deleteFile(string $path)` - Delete a file
- `fileExists(string $path)` - Check if file exists
- `getFileSize(string $path)` - Get file size
- `getFileContent(string $path)` - Get file content
- `listFiles(string $directory)` - List files in directory
- `createDirectory(string $directory)` - Create directory
- `copyFile(string $from, string $to)` - Copy file
- `moveFile(string $from, string $to)` - Move file

### Usage Example

```php
use App\Services\MinioService;

$minioService = app(MinioService::class);

// Upload a file
$filePath = $minioService->uploadFile($request->file('document'), 'documents');

// Get a temporary URL (valid for 24 hours)
$url = $minioService->getFileUrl($filePath, 1440);

// Delete a file
$minioService->deleteFile($filePath);
```

## Integration Points

### 1. Sample Items Controller

The `ItemController` has been updated to use MinIO for file uploads:

- **Store Method**: Uploads files to MinIO using the service
- **Update Method**: Replaces old files with new ones
- **Destroy Method**: Cleans up files when items are deleted

### 2. Item Resource

The `ItemResource` has been enhanced to provide MinIO file URLs:

- `file_url`: Temporary signed URL for file downloads (24-hour expiration)
- `image_url`: Temporary signed URL for image access (24-hour expiration)

### 3. Frontend File Upload

The Sample Items Create page has been enhanced with:

- File size validation (10MB for files, 5MB for images)
- Visual feedback showing selected file information
- Better error handling and user experience

## File Organization

Files are organized in MinIO with the following structure:

```
bucket/
├── items/
│   ├── files/          # Document files (PDF, DOCX, etc.)
│   └── images/         # Image files (JPG, PNG, etc.)
```

## Security Features

1. **Temporary URLs**: File access uses signed URLs with expiration times
2. **File Validation**: Size and type validation on both frontend and backend
3. **Secure Storage**: Files are stored in MinIO with controlled access
4. **Error Handling**: Comprehensive error handling with logging

## MinIO Server Setup

### Docker Setup (Recommended)

```yaml
version: '3.8'
services:
  minio:
    image: minio/minio:latest
    container_name: minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin123
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data

volumes:
  minio_data:
```

### Manual Installation

1. Download MinIO server from https://min.io/download
2. Run: `minio server /path/to/data --console-address ":9001"`
3. Access console at http://localhost:9001

### Bucket Setup

1. Access MinIO Console at http://localhost:9001
2. Login with credentials (minioadmin/minioadmin123)
3. Create bucket named "localhost" (or your configured bucket name)
4. Set appropriate access policies if needed

## File Upload Limits

- **Documents**: Maximum 10MB (PDF, DOCX, PPTX, XLSX, ZIP, RAR)
- **Images**: Maximum 5MB (JPG, JPEG, PNG)

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure MinIO server is running on port 9000
2. **Access Denied**: Check bucket policies and access credentials
3. **File Not Found**: Verify file paths and bucket configuration
4. **Upload Fails**: Check file size limits and network connectivity

### Debug Mode

Enable debug logging by setting `LOG_LEVEL=debug` in your `.env` file to see detailed MinIO operation logs.

## Performance Considerations

1. **URL Caching**: Temporary URLs are valid for 24 hours to reduce API calls
2. **File Validation**: Client-side validation reduces server load
3. **Error Handling**: Graceful degradation when MinIO is unavailable

## Future Enhancements

1. **Image Thumbnails**: Automatic thumbnail generation for images
2. **File Versioning**: Keep multiple versions of uploaded files
3. **Bulk Operations**: Support for multiple file uploads
4. **CDN Integration**: CloudFront or similar CDN integration
5. **File Metadata**: Store and retrieve file metadata
