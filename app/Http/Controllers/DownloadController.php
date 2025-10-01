<?php

namespace App\Http\Controllers;

use App\Services\MinioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DownloadController extends Controller
{
    protected MinioService $minioService;

    public function __construct(MinioService $minioService)
    {
        $this->minioService = $minioService;
    }

    /**
     * Serve a file from S3/MinIO through the application domain
     *
     * @param Request $request
     * @param string $path
     * @return StreamedResponse|\Illuminate\Http\Response
     */
    public function serve(Request $request, string $path)
    {
        // Decode the path in case it contains encoded characters
        $path = urldecode($path);

        // Check if file exists
        if (!$this->minioService->fileExists($path)) {
            abort(404, 'File not found');
        }

        // Get file metadata
        $disk = Storage::disk('minio');
        $mimeType = $disk->mimeType($path);
        $fileSize = $this->minioService->getFileSize($path);
        $fileName = basename($path);

        // Determine if file should be displayed inline or downloaded
        $disposition = $request->query('download', false) ? 'attachment' : 'inline';

        // Stream the file from S3/MinIO
        return new StreamedResponse(function () use ($disk, $path) {
            $stream = $disk->readStream($path);
            if ($stream) {
                fpassthru($stream);
                fclose($stream);
            }
        }, 200, [
            'Content-Type' => $mimeType ?: 'application/octet-stream',
            'Content-Length' => $fileSize,
            'Content-Disposition' => $disposition . '; filename="' . $fileName . '"',
            'Cache-Control' => 'public, max-age=3600',
            'Accept-Ranges' => 'bytes',
        ]);
    }

    /**
     * Force download a file from S3/MinIO
     *
     * @param string $path
     * @return StreamedResponse|\Illuminate\Http\Response
     */
    public function download(string $path)
    {
        // Decode the path in case it contains encoded characters
        $path = urldecode($path);

        // Check if file exists
        if (!$this->minioService->fileExists($path)) {
            abort(404, 'File not found');
        }

        // Get file metadata
        $disk = Storage::disk('minio');
        $mimeType = $disk->mimeType($path);
        $fileSize = $this->minioService->getFileSize($path);
        $fileName = basename($path);

        // Force download
        return new StreamedResponse(function () use ($disk, $path) {
            $stream = $disk->readStream($path);
            if ($stream) {
                fpassthru($stream);
                fclose($stream);
            }
        }, 200, [
            'Content-Type' => $mimeType ?: 'application/octet-stream',
            'Content-Length' => $fileSize,
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
            'Cache-Control' => 'no-cache, must-revalidate',
        ]);
    }
}
