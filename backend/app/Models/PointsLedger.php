<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PointsLedger extends Model
{
    protected $table = 'points_ledger';

    protected $fillable = [
        'user_id',
        'source_type',
        'source_id',
        'points',
        'description',
        'created_by',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
