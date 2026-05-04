<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class VolunteerOpportunity extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'public_id',
        'organization_id',
        'title',
        'description',
        'required_skills',
        'location_type',
        'location_text',
        'start_date',
        'end_date',
        'duration_hours',
        'session_title',
        'session_starts_at',
        'session_timezone',
        'session_join_url',
        'status',
        'approved_by',
        'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'required_skills' => 'array',
            'start_date' => 'date',
            'end_date' => 'date',
            'session_starts_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    public function organization()
    {
        return $this->belongsTo(Organization::class);
    }

    public function applications()
    {
        return $this->hasMany(VolunteerApplication::class, 'opportunity_id');
    }
}
