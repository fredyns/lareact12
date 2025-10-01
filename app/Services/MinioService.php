<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;

class MinioService
{
    protected $disk;

    public function __construct()
    {
        $this->disk = Storage::disk('minio');
    }

    /**
     * Upload a file to MinIO
     *
     * @param UploadedFile $file
     * @param string $directory
     * @param string|null $filename
     * @return string|false
     */
    public function uploadFile(UploadedFile $file, string $directory = 'uploads', ?string $filename = null): string|false
    {
        if (!$filename) {
            $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        }

        $path = $directory . '/' . $filename;

        try {
            $uploaded = $this->disk->putFileAs($directory, $file, $filename);
            return $uploaded;
        } catch (\Exception $e) {
            \Log::error('MinIO upload failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Upload file content to MinIO
     *
     * @param string $content
     * @param string $path
     * @return bool
     */
    public function uploadContent(string $content, string $path): bool
    {
        try {
            return $this->disk->put($path, $content);
        } catch (\Exception $e) {
            \Log::error('MinIO content upload failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get file URL from MinIO
     *
     * @param string $path
     * @param int $expiration (in minutes, default 60)
     * @return string|null
     */
    public function getFileUrl(string $path, int $expiration = 60): ?string
    {
        try {
            if (!$this->disk->exists($path)) {
                return null;
            }

            return $this->disk->temporaryUrl($path, now()->addMinutes($expiration));
        } catch (\Exception $e) {
            \Log::error('MinIO URL generation failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get permanent public URL (if bucket allows public access)
     *
     * @param string $path
     * @return string|null
     */
    public function getPublicUrl(string $path): ?string
    {
        try {
            if (!$this->disk->exists($path)) {
                return null;
            }

            return $this->disk->url($path);
        } catch (\Exception $e) {
            \Log::error('MinIO public URL generation failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Delete a file from MinIO
     *
     * @param string $path
     * @return bool
     */
    public function deleteFile(string $path): bool
    {
        try {
            return $this->disk->delete($path);
        } catch (\Exception $e) {
            \Log::error('MinIO delete failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Check if file exists in MinIO
     *
     * @param string $path
     * @return bool
     */
    public function fileExists(string $path): bool
    {
        try {
            return $this->disk->exists($path);
        } catch (\Exception $e) {
            \Log::error('MinIO file check failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get file size
     *
     * @param string $path
     * @return int|null
     */
    public function getFileSize(string $path): ?int
    {
        try {
            if (!$this->disk->exists($path)) {
                return null;
            }

            return $this->disk->size($path);
        } catch (\Exception $e) {
            \Log::error('MinIO file size check failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get file content
     *
     * @param string $path
     * @return string|null
     */
    public function getFileContent(string $path): ?string
    {
        try {
            if (!$this->disk->exists($path)) {
                return null;
            }

            return $this->disk->get($path);
        } catch (\Exception $e) {
            \Log::error('MinIO file content retrieval failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * List files in a directory
     *
     * @param string $directory
     * @return array
     */
    public function listFiles(string $directory = ''): array
    {
        try {
            return $this->disk->files($directory);
        } catch (\Exception $e) {
            \Log::error('MinIO file listing failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Create a directory
     *
     * @param string $directory
     * @return bool
     */
    public function createDirectory(string $directory): bool
    {
        try {
            return $this->disk->makeDirectory($directory);
        } catch (\Exception $e) {
            \Log::error('MinIO directory creation failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Copy a file within MinIO
     *
     * @param string $from
     * @param string $to
     * @return bool
     */
    public function copyFile(string $from, string $to): bool
    {
        try {
            return $this->disk->copy($from, $to);
        } catch (\Exception $e) {
            \Log::error('MinIO file copy failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Move a file within MinIO
     *
     * @param string $from
     * @param string $to
     * @return bool
     */
    public function moveFile(string $from, string $to): bool
    {
        try {
            return $this->disk->move($from, $to);
        } catch (\Exception $e) {
            \Log::error('MinIO file move failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get application download URL (serves through application domain)
     *
     * @param string $path
     * @param bool $forceDownload If true, uses 'downloading' route to force download
     * @return string|null
     */
    public function getDownloadUrl(string $path, bool $forceDownload = false): ?string
    {
        try {
            if (!$this->disk->exists($path)) {
                return null;
            }

            // Use 'downloads.serve' for inline view, 'downloads.force' for forced download
            $routeName = $forceDownload ? 'downloads.force' : 'downloads.serve';
            return route($routeName, ['path' => $path]);
        } catch (\Exception $e) {
            \Log::error('Download URL generation failed: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Get MIME type of a file
     *
     * @param string $path
     * @return string|null
     */
    public function getMimeType(string $path): ?string
    {
        try {
            if (!$this->disk->exists($path)) {
                return null;
            }

            return $this->disk->mimeType($path);
        } catch (\Exception $e) {
            \Log::error('MIME type retrieval failed: ' . $e->getMessage());
            return null;
        }
    }
}
