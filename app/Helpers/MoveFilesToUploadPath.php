<?php

namespace App\Helpers;

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
class MoveFilesToUploadPath
{
    public function __construct(
        protected MinioService $minioService
    ) {}

    /**
     * Move files from temporary to final location
     *
     * @param Model $model Model with file and image properties
     * @param string[] $attributes list of attributes to move
     * @param bool $save auto save model if any files were moved
     * @return bool True if any files were moved
     */
    public function handle(Model $model, array $attributes, bool $save = true): bool
    {
        $filesMoved = 0;
        foreach ($attributes as $attribute) {
            if (!$model->{$attribute}) {
                continue;
            }

            $newPath = $this->minioService->moveToFolder($model->{$attribute}, $model->upload_path);
            if (!$newPath) {
                continue;
            }

            $model->{$attribute} = $newPath;
            $filesMoved++;
        }

        // Save if any files were moved
        if ($filesMoved > 0 && $model->isDirty($attributes) && $save) {
            $model->save();
        }

        return $filesMoved;
    }
}
