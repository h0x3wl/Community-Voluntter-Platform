<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VolunteerApplication extends Model
{
    protected $fillable = [
        'public_id',
        'opportunity_id',
        'user_id',
        'full_name',
        'email',
        'phone',
        'skills_text',
        'experience_text',
        'availability_text',
        'status',
        'reviewed_by',
        'reviewed_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'reviewed_at' => 'datetime',
        ];
    }

    public function opportunity()
    {
        return $this->belongsTo(VolunteerOpportunity::class, 'opportunity_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
