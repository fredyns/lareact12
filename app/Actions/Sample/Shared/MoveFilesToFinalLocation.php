<?php

namespace App\Actions\Sample\Shared;

use App\Services\MinioService;
use Illuminate\Database\Eloquent\Model;

/**
 * Move Files to Final Location Action
 *
 * Moves uploaded files from temporary location to final location
 * based on the model's upload_path
 * 
 * todo: maybe this class should be moved to the Shared folder for all actions. or folder of services?
 */
class MoveFilesToFinalLocation
{
    public function __construct(
        protected MinioService $minioService
    ) {}

    /**
     * Move files from temporary to final location
     *
     * @param Model $model Model with file and image properties
     * @return bool True if any files were moved
     */
    public function handle(Model $model): bool
    {
        $filesMoved = false;

        // Move file if exists
        if ($model->file) {
            $newPath = $this->minioService->moveToFolder($model->file, $model->upload_path);
            if ($newPath) {
                $model->file = $newPath;
                $filesMoved = true;
            }
        }

        // Move image if exists
        if ($model->image) {
            $newPath = $this->minioService->moveToFolder($model->image, $model->upload_path);
            if ($newPath) {
                $model->image = $newPath;
                $filesMoved = true;
            }
        }

        // Save if any files were moved
        if ($filesMoved && $model->isDirty(['file', 'image'])) {
            $model->save();
        }

        return $filesMoved;
    }
}
