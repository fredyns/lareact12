<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MinioService
{
    protected $disk;
    protected ?string $targetFolder = null;

    public function __construct()
    {
        $this->disk = Storage::disk('minio');
        $this->targetFolder = 'tmp/' . date('Y/m/d');
    }

    /**
     * Set the target folder for subsequent operations
     *
     * @param string|null $folder The target folder path
     * @return self
     */
    public function setFolder(?string $folder): self
    {
        $this->targetFolder = $folder;
        return $this;
    }

    /**
     * Get the current target folder
     *
     * @return string|null
     */
    public function getFolder(): ?string
    {
        return $this->targetFolder;
    }

    /**
     * Upload a file to MinIO
     *
     * @param UploadedFile $file
     * @param string $directory
     * @param string|null $filename
     * @return string|false
     */
    public function uploadFile(UploadedFile $file, string $directory = 'uploads'): string|false
    {
        // Get original filename without extension
        $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
        // Convert to slug and append UUID for uniqueness
        $slug = Str::slug($originalName . '-' . Str::random(5));
        $filename = $slug . '.' . $file->getClientOriginalExtension();

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
     * Delete multiple files from MinIO
     *
     * @param array $filePaths Array of file paths to delete
     * @return int Number of files successfully deleted
     */
    public function deleteFiles(array $filePaths): int
    {
        $deletedCount = 0;

        foreach ($filePaths as $filePath) {
            // Skip null or empty paths
            if (empty($filePath)) {
                continue;
            }

            // Check if file exists and delete
            if ($this->fileExists($filePath) && $this->deleteFile($filePath)) {
                $deletedCount++;
            }
        }

        return $deletedCount;
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

    /**
     * Move a file to a target folder and update the reference
     * The file path variable is updated directly via reference
     *
     * @param string|null &$filePath Reference to the file path variable to move and update
     * @param string|null $targetFolder The destination folder path (uses setFolder if null)
     * @return bool True if file was moved successfully, false otherwise
     */
    public function moveToFolder(?string &$filePath, ?string $targetFolder = null): bool
    {
        // Use stored target folder if not provided
        $folder = $targetFolder ?? $this->targetFolder;

        if (empty($folder)) {
            \Log::error("MinIO moveToFolder: No target folder specified");
            return false;
        }

        // Skip null or empty paths
        if (empty($filePath)) {
            return false;
        }

        // Check if file exists
        if (!$this->fileExists($filePath)) {
            \Log::warning("MinIO moveToFolder: File does not exist: {$filePath}");
            return false;
        }

        // Get the filename from the original path
        $fileName = basename($filePath);

        // Construct the new path
        $newPath = rtrim($folder, '/') . '/' . $fileName;

        // Move the file
        if ($this->moveFile($filePath, $newPath)) {
            // Update the reference with the new path
            $filePath = $newPath;
            return true;
        }

        \Log::error("MinIO moveToFolder: Failed to move file from {$filePath} to {$newPath}");
        return false;
    }

    /**
     * Update a file by deleting the old one and uploading a new one
     * The file path variable is updated directly via reference
     * Handles both file uploads and already-uploaded file paths (two-step upload)
     *
     * @param string|null &$filePath Reference to the current file path variable to update
     * @param mixed $request The request object (e.g., Illuminate\Http\Request)
     * @param string $field The field name in the request (e.g., 'file', 'image')
     * @return bool True if file was updated successfully, false otherwise
     */
    public function updateFile(?string &$filePath, $request, string $field): bool
    {
        // Case 1: Handle actual file upload
        if ($request->hasFile($field)) {
            // Use stored target folder
            if (empty($this->targetFolder)) {
                \Log::error("MinIO updateFile: No target folder specified. Call setFolder() first.");
                return false;
            }

            // Delete old file if exists
            if (!empty($filePath) && $this->fileExists($filePath)) {
                $this->deleteFile($filePath);
            }

            // Upload new file
            $newPath = $this->uploadFile(
                $request->file($field),
                $this->targetFolder
            );

            if ($newPath) {
                // Update the reference with the new path
                $filePath = $newPath;
                return true;
            }

            \Log::error("MinIO updateFile: Failed to upload file for field {$field}");
            return false;
        }

        // Case 2: Handle already-uploaded file path (two-step upload process)
        if ($request->has($field) && is_string($request->input($field))) {
            $newPath = $request->input($field);
            
            // Validate that the file exists in MinIO
            if (!empty($newPath) && $this->fileExists($newPath)) {
                // Update the reference with the new path
                $filePath = $newPath;
                return true;
            }
            
            \Log::warning("MinIO updateFile: File path provided but file does not exist: {$newPath}");
            return false;
        }

        // No file provided
        return false;
    }
}
