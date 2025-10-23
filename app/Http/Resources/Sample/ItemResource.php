<?php

namespace App\Http\Resources\Sample;

use App\Services\MinioService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Item API Resource
 * 
 * Transforms Item model into a standardized API response
 */
class ItemResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        // Only instantiate MinioService if file/image fields exist
        // This avoids unnecessary service instantiation for list views
        $minioService = ($this->file || $this->image) ? app(MinioService::class) : null;
        
        return [
            'id' => $this->id,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'created_by' => $this->created_by,
            'updated_by' => $this->updated_by,
            'user_id' => $this->user_id,
            'string' => $this->string,
            'email' => $this->email,
            'color' => $this->color,
            'integer' => $this->integer,
            'decimal' => $this->decimal,
            'npwp' => $this->npwp,
            'datetime' => $this->datetime,
            'date' => $this->date,
            'time' => $this->time,
            'ip_address' => $this->ip_address,
            'boolean' => $this->boolean,
            'enumerate' => $this->enumerate?->value,
            'text' => $this->text,
            'file' => $this->file,
            'file_url' => $this->file && $minioService ? $minioService->getDownloadUrl($this->file) : null,
            'file_download_url' => $this->file && $minioService ? $minioService->getDownloadUrl($this->file, true) : null,
            'image' => $this->image,
            'image_url' => $this->image && $minioService ? $minioService->getDownloadUrl($this->image) : null,
            'image_download_url' => $this->image && $minioService ? $minioService->getDownloadUrl($this->image, true) : null,
            'markdown_text' => $this->markdown_text,
            'wysiwyg' => $this->wysiwyg,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'upload_path' => $this->upload_path,
            
            // Include relationships when they are loaded
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
            'creator' => $this->whenLoaded('creator', function () {
                return [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ];
            }),
            'updater' => $this->whenLoaded('updater', function () {
                return [
                    'id' => $this->updater->id,
                    'name' => $this->updater->name,
                ];
            }),
        ];
    }
}
