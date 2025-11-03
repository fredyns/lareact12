<?php

namespace App\Helpers;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImageOptimizer
{
    /**
     * Optimize and convert image to WebP format
     * 
     * @param UploadedFile $file The uploaded image file
     * @param string $path The target path for the optimized image
     * @param int $quality WebP quality (0-100)
     * @param int $maxWidth Maximum width to resize to
     * @return string The path to the optimized WebP image
     */
    public static function optimizeAndConvert(UploadedFile $file, string $path, int $quality = 85, int $maxWidth = 1920): string
    {
        // Create ImageManager with GD driver
        $manager = new ImageManager(new Driver());
        
        // Read the uploaded image
        $image = $manager->read($file->getRealPath());
        
        // Resize if image is too large
        if ($image->width() > $maxWidth) {
            $image->resize($maxWidth, null, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize(); // Prevent upsizing
            });
        }
        
        // Generate WebP path by replacing the extension
        $webpPath = preg_replace('/\.(jpg|jpeg|png|gif)$/i', '.webp', $path);
        
        // Encode as WebP with specified quality
        $encoded = $image->toWebp($quality);
        
        // Store the optimized image
        Storage::put($webpPath, $encoded);
        
        return $webpPath;
    }
    
    /**
     * Check if the file is an image that can be optimized
     * 
     * @param UploadedFile $file
     * @return bool
     */
    public static function canOptimize(UploadedFile $file): bool
    {
        $supportedMimes = [
            'image/jpeg',
            'image/jpg', 
            'image/png',
            'image/gif',
            'image/webp'
        ];
        
        return in_array($file->getMimeType(), $supportedMimes);
    }
    
    /**
     * Get optimized file information
     * 
     * @param string $originalPath
     * @param string $optimizedPath  
     * @return array
     */
    public static function getOptimizationInfo(string $originalPath, string $optimizedPath): array
    {
        $originalSize = Storage::size($originalPath);
        $optimizedSize = Storage::size($optimizedPath);
        $savings = $originalSize - $optimizedSize;
        $savingsPercent = $originalSize > 0 ? round(($savings / $originalSize) * 100, 2) : 0;
        
        return [
            'original_size' => $originalSize,
            'optimized_size' => $optimizedSize,
            'savings_bytes' => $savings,
            'savings_percent' => $savingsPercent,
        ];
    }
}
