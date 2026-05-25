<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApprovalPath extends Model
{
    protected $table = 'approval_paths';
    protected $fillable = ['name', 'description'];

    public function steps()
    {
        return $this->hasMany(ApprovalPathStep::class, 'approval_path_id')->orderBy('order', 'asc');
    }
}
