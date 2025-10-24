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
class TrashingFiles
{
    public function __construct(
        protected MinioService $minioService
    )
    {
    }

    /**
     * Move files from temporary to final location
     *
     * @param Model $model Model with file and image properties
     * @param string[] $attributes list of attributes to trash
     * @return bool True if any files were moved
     */
    public function handle(Model $model, array $attributes): bool
    {
        $filesMoved = 0;
        $trashPath = 'trash/' . $model->getTable() . '/' . date('Y/m/d') . '/' . $model->id;

        foreach ($attributes as $attribute) {
            if (!$model->{$attribute}) {
                continue;
            }

            $newPath = $this->minioService->moveToFolder($model->{$attribute}, $trashPath);
            if (!$newPath) {
                continue;
            }

            $model->{$attribute} = $newPath;
            $filesMoved++;
        }

        // Save model as JSON to data.json in a trash path
        $this->minioService->put($trashPath . '/data.json', $model->toJson(JSON_PRETTY_PRINT));

        return $filesMoved;
    }
}
