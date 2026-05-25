<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ApprovalPath;
use App\Models\ApprovalPathStep;
use App\Models\Unit;

class ApprovalPathController extends Controller
{
    public function index()
    {
        $paths = ApprovalPath::with('steps.unit')->get();
        $units = Unit::select(['id_unit', 'nama_unit'])->get();

        return Inertia::render('Admin/ApprovalPath/Index', [
            'paths' => $paths,
            'units' => $units
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:approval_paths,name',
            'description' => 'nullable|string',
            'steps' => 'required|array',
            'steps.*.step_name' => 'required|string',
            'steps.*.approver_type' => 'required|in:role,unit,parent_unit,self_unit_head',
        ]);

        $path = ApprovalPath::create([
            'name' => $request->name,
            'description' => $request->description,
        ]);

        foreach ($request->steps as $index => $step) {
            ApprovalPathStep::create([
                'approval_path_id' => $path->id,
                'order' => $index + 1,
                'step_name' => $step['step_name'],
                'approver_type' => $step['approver_type'],
                'role_name' => $step['approver_type'] === 'role' ? $step['role_name'] : null,
                'unit_id' => $step['approver_type'] === 'unit' ? $step['unit_id'] : null,
            ]);
        }

        return redirect()->back()->with('success', 'Alur persetujuan berhasil ditambahkan.');
    }

    public function update(Request $request, ApprovalPath $approvalPath)
    {
        $request->validate([
            'name' => 'required|string|unique:approval_paths,name,' . $approvalPath->id,
            'description' => 'nullable|string',
            'steps' => 'required|array',
            'steps.*.step_name' => 'required|string',
            'steps.*.approver_type' => 'required|in:role,unit,parent_unit,self_unit_head',
        ]);

        $approvalPath->name = $request->name;
        $approvalPath->description = $request->description;
        $approvalPath->save();

        $approvalPath->steps()->delete(); // Reset steps

        foreach ($request->steps as $index => $step) {
            ApprovalPathStep::create([
                'approval_path_id' => $approvalPath->id,
                'order' => $index + 1,
                'step_name' => $step['step_name'],
                'approver_type' => $step['approver_type'],
                'role_name' => $step['approver_type'] === 'role' ? $step['role_name'] : null,
                'unit_id' => $step['approver_type'] === 'unit' ? $step['unit_id'] : null,
            ]);
        }

        return redirect()->back()->with('success', 'Alur persetujuan berhasil diperbarui.');
    }

    public function destroy(ApprovalPath $approvalPath)
    {
        ApprovalPath::destroy($approvalPath->id);
        return redirect()->back()->with('success', 'Alur persetujuan berhasil dihapus.');
    }
}
