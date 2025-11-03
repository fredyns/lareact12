<?php

namespace App\Http\Controllers;

use App\Helpers\ImageOptimizer;
use App\Services\MinioService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UploadController extends Controller
{
    protected MinioService $minioService;

    public function __construct(MinioService $minioService)
    {
        $this->minioService = $minioService;
    }

    /**
     * Upload a file to MinIO.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadFile(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:pdf,docx,pptx,xlsx,zip,rar|max:10240', // 10MB max
            'folder' => 'string|nullable', // Optional folder parameter for organized uploads
        ]);

        $file = $request->file('file');
        // Use provided folder or default to uploads/files
        $folder = $request->input('folder', 'uploads/files/' . date('Y/m/d'));

        try {
            $filePath = $this->minioService->uploadFile($file, $folder);

            if (!$filePath) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to upload file to storage.'
                ], 500);
            }

            return response()->json([
                'success' => true,
                'path' => $filePath,
                'folder' => $folder,
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'message' => 'File uploaded successfully.'
            ]);
        } catch (\Exception $e) {
            \Log::error('File upload failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Failed to upload file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload an image to MinIO.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|image|mimes:jpg,jpeg,png,gif,webp|max:5120', // 5MB max
            'folder' => 'string|nullable', // Optional folder parameter for organized uploads
            'optimize' => 'boolean', // Optional optimization flag (default: true)
        ]);

        $file = $request->file('file');
        // Use provided folder or default to uploads/images
        $folder = $request->input('folder', 'uploads/images/' . date('Y/m/d'));
        $shouldOptimize = $request->input('optimize', true);

        try {
            $filePath = null;
            $optimizationInfo = null;
            
            // Check if we should optimize and if the file can be optimized
            if ($shouldOptimize && ImageOptimizer::canOptimize($file)) {
                try {
                    // First upload the original file to get its path
                    $originalPath = $this->minioService->uploadFile($file, $folder);
                    
                    if (!$originalPath) {
                        throw new \Exception('Failed to upload original image to storage.');
                    }
                    
                    // Optimize and convert to WebP
                    $optimizedPath = ImageOptimizer::optimizeAndConvert($file, $originalPath);
                    
                    // Upload the optimized WebP version
                    $optimizedFile = new \Illuminate\Http\File(storage_path('app/' . $optimizedPath));
                    $finalPath = $this->minioService->uploadFile($optimizedFile, $folder);
                    
                    if ($finalPath) {
                        // Use the optimized version as the final path
                        $filePath = $finalPath;
                        
                        // Get optimization statistics
                        $optimizationInfo = ImageOptimizer::getOptimizationInfo($originalPath, $optimizedPath);
                        
                        // Clean up temporary files
                        \Storage::delete($originalPath);
                        \Storage::delete($optimizedPath);
                    } else {
                        // Fallback to original if optimization upload fails
                        $filePath = $originalPath;
                    }
                } catch (\Exception $e) {
                    \Log::warning('Image optimization failed, using original: ' . $e->getMessage());
                    
                    // Fallback to uploading original file without optimization
                    $filePath = $this->minioService->uploadFile($file, $folder);
                }
            } else {
                // Upload without optimization
                $filePath = $this->minioService->uploadFile($file, $folder);
            }

            if (!$filePath) {
                return response()->json([
                    'success' => false,
                    'error' => 'Failed to upload image to storage.'
                ], 500);
            }

            // Get image dimensions if possible
            $dimensions = null;
            if (function_exists('getimagesize')) {
                $imageInfo = getimagesize($file->getPathname());
                if ($imageInfo) {
                    $dimensions = [
                        'width' => $imageInfo[0],
                        'height' => $imageInfo[1]
                    ];
                }
            }

            $response = [
                'success' => true,
                'path' => $filePath,
                'folder' => $folder,
                'original_name' => $file->getClientOriginalName(),
                'size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'dimensions' => $dimensions,
                'message' => 'Image uploaded successfully.'
            ];
            
            // Add optimization info if available
            if ($optimizationInfo) {
                $response['optimization'] = $optimizationInfo;
                $response['message'] .= sprintf(
                    ' Optimized to WebP format with %s%% size reduction.',
                    $optimizationInfo['savings_percent']
                );
            }

            return response()->json($response);
        } catch (\Exception $e) {
            \Log::error('Image upload failed: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'error' => 'Failed to upload image: ' . $e->getMessage()
            ], 500);
        }
    }
}
