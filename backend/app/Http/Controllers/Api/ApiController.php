<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;

class ApiController extends Controller
{
    protected function respond(mixed $data, array $meta = []): JsonResponse
    {
        if ($data instanceof JsonResource) {
            $data = $data->resolve();
            if (is_array($data) && array_key_exists('data', $data)) {
                $data = $data['data'];
            }
        }

        return response()->json([
            'data' => $data,
            'meta' => (object) $meta,
        ]);
    }
}
