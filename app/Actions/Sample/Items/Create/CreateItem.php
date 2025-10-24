<?php

namespace App\Actions\Sample\Items\Create;

use App\Http\Controllers\Controller;
use App\Models\Sample\Item;
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
        $this->authorize('create', Item::class);

        return Inertia::render('sample/items/create');
    }
}
