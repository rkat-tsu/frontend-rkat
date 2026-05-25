<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('approval_path_steps', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('approval_path_id');
            $table->foreign('approval_path_id')->references('id')->on('approval_paths')->onDelete('cascade');
            
            $table->integer('order');
            $table->string('step_name'); // e.g. "Kepala Unit", "Tim Renbang"
            $table->enum('approver_type', ['role', 'unit', 'parent_unit', 'self_unit_head']); 
            $table->string('role_name')->nullable(); // Required if approver_type is 'role'
            $table->unsignedBigInteger('unit_id')->nullable(); // Required if approver_type is 'unit'
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approval_path_steps');
    }
};
