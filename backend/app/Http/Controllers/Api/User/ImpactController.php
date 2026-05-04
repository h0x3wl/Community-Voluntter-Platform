<?php

namespace App\Http\Controllers\Api\User;

use App\Http\Controllers\Api\ApiController;
use App\Http\Requests\User\ImpactShowRequest;
use App\Services\ImpactService;

class ImpactController extends ApiController
{
    public function __construct(private readonly ImpactService $impact)
    {
    }

    public function show(ImpactShowRequest $request)
    {
        $month = $request->input('month', now()->format('Y-m'));
        $metrics = $this->impact->buildMetrics($request->user()->id, $month);

        return $this->respond($metrics);
    }
}
