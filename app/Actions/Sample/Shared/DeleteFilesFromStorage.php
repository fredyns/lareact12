<?php

namespace App\Actions\Sample\Shared;

use App\Services\MinioService;

/**
 * Delete Files from Storage Action
 *
 * Deletes files from MinIO storage
 *  todo: maybe this class should be moved to the Shared folder for all actions. or folder of services?
 */
class DeleteFilesFromStorage
{
    public function __construct(
        protected MinioService $minioService
    ) {}

    /**
     * Delete files from storage
     *
     * @param array|string $files Single file path or array of file paths
     * @return void
     */
    public function handle(array|string $files): void
    {
        $filePaths = is_array($files) ? $files : [$files];
        
        $this->minioService->deleteFiles($filePaths);
    }
}
