<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        foreach ([
            ['WR_1', 'WR-1'], ['WR_2', 'WR-2'], ['WR_3', 'WR-3'],
        ] as [$oldRole, $unitName]) {
            $unitId = DB::table('unit')->where('nama_unit', $unitName)->value('id_unit');
            if (!$unitId) continue;

            DB::table('users')->where('peran', $oldRole)->update(['peran' => 'Rektorat', 'id_unit' => $unitId]);
            DB::table('approval_path_steps')
                ->where('approver_type', 'role')
                ->whereIn('role_name', [$oldRole, $unitName])
                ->update(['approver_type' => 'unit', 'unit_id' => $unitId, 'role_name' => null]);
        }

        $rektoratUnitId = DB::table('unit')->where('nama_unit', 'Rektorat')->value('id_unit');
        if ($rektoratUnitId) {
            DB::table('approval_path_steps')
                ->where('approver_type', 'role')
                ->where('role_name', 'Rektorat')
                ->update(['approver_type' => 'unit', 'unit_id' => $rektoratUnitId, 'role_name' => null]);
        }

        DB::table('approval_path_steps')
            ->where('approver_type', 'role')
            ->whereIn('role_name', ['WR_1', 'WR_2', 'WR_3'])
            ->update(['role_name' => null]);
    }

    public function down(): void
    {
        foreach ([['WR-1', 'WR_1'], ['WR-2', 'WR_2'], ['WR-3', 'WR_3']] as [$unitName, $role]) {
            $unitId = DB::table('unit')->where('nama_unit', $unitName)->value('id_unit');
            if (!$unitId) continue;

            DB::table('users')->where('peran', 'Rektorat')->where('id_unit', $unitId)->update(['peran' => $role]);
            DB::table('approval_path_steps')
                ->where('approver_type', 'unit')->where('unit_id', $unitId)
                ->update(['approver_type' => 'role', 'role_name' => $unitName, 'unit_id' => null]);
        }

        $rektoratUnitId = DB::table('unit')->where('nama_unit', 'Rektorat')->value('id_unit');
        if ($rektoratUnitId) {
            DB::table('users')->where('peran', 'Rektorat')->where('id_unit', $rektoratUnitId)->update(['peran' => 'Rektor']);
            DB::table('approval_path_steps')
                ->where('approver_type', 'unit')->where('unit_id', $rektoratUnitId)
                ->update(['approver_type' => 'role', 'role_name' => 'Rektorat', 'unit_id' => null]);
        }
    }
};
