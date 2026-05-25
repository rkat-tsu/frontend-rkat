<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApprovalPathStep extends Model
{
    protected $table = 'approval_path_steps';
    protected $fillable = [
        'approval_path_id', 
        'order', 
        'step_name', 
        'approver_type', 
        'role_name', 
        'unit_id'
    ];

    public function path()
    {
        return $this->belongsTo(ApprovalPath::class, 'approval_path_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
