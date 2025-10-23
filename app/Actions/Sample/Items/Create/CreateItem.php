<?php

namespace App\Actions\Sample\Items\Create;

use App\Enums\Sample\ItemEnumerate;
use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Create Item Action Controller
 *
 * Single-action controller for showing the create form
 */
class CreateItem extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(): Response
    {
        $this->authorize('create', \App\Models\Sample\Item::class);

        // Generate temporary upload path for file uploads
        $now = now();
        $tempUploadPath = sprintf(
            'tmp/%s/%s/%s/sample_items',
            $now->format('Y'),
            $now->format('m'),
            $now->format('d')
        );

        return Inertia::render('sample/items/create', [
            'enumerateOptions' => ItemEnumerate::toSelectOptions(),// todo: remove this and let input component fetch from Enum API
            'tempUploadPath' => $tempUploadPath,// todo: check if this is needed
        ]);
    }
}
