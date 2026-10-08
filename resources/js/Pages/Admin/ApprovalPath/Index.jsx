import React, { useState } from 'react';
import { router, Head } from '@inertiajs/react';
import { Plus, Edit2, Trash2, Save, Route, ChevronRight, Layers, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import TextArea from '@/Components/TextArea';
import Modal from '@/Components/Modal';
import CustomSelect from '@/Components/CustomSelect';
import ActionButton, { ActionGroup } from '@/Components/ActionButton';
import FieldTooltipError from '@/Components/FieldTooltipError';
import { toast } from 'sonner';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, paths, units, lpjApprovalPathId }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPath, setEditingPath] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [selectedLpjPath, setSelectedLpjPath] = useState(lpjApprovalPathId ? String(lpjApprovalPathId) : '');
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        steps: []
    });

    const openDialog = (path = null) => {
        setFormErrors({});
        if (path) {
            setEditingPath(path);
            setFormData({
                name: path.name,
                description: path.description || '',
                steps: path.steps.map(s => ({ ...s }))
            });
        } else {
            setEditingPath(null);
            setFormData({
                name: '',
                description: '',
                steps: []
            });
        }
        setIsDialogOpen(true);
    };

    const addStep = () => {
        setFormData(prev => ({
            ...prev,
            steps: [
                ...prev.steps,
                { step_name: '', approver_type: 'role', role_name: '', unit_id: '' }
            ]
        }));
    };

    const removeStep = (index) => {
        setFormData(prev => ({
            ...prev,
            steps: prev.steps.filter((_, i) => i !== index)
        }));
    };

    const updateStep = (index, field, value) => {
        const val = value?.target ? value.target.value : value;
        setFormData(prev => {
            const newSteps = [...prev.steps];
            newSteps[index] = { ...newSteps[index], [field]: val };
            return { ...prev, steps: newSteps };
        });
        if (formErrors[`step_${index}_${field}`]) {
            setFormErrors(prev => ({ ...prev, [`step_${index}_${field}`]: null }));
        }
    };

    const handleNameChange = (val) => {
        setFormData(prev => ({ ...prev, name: val }));
        if (formErrors.name) {
            setFormErrors(prev => ({ ...prev, name: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const errs = {};
        if (!formData.name || !formData.name.trim()) {
            errs.name = 'Harap isi nama alur.';
        }

        formData.steps.forEach((step, index) => {
            if (!step.step_name || !step.step_name.trim()) {
                errs[`step_${index}_step_name`] = 'Nama tahap wajib diisi.';
            }
            if (step.approver_type === 'role' && !step.role_name) {
                errs[`step_${index}_role_name`] = 'Role approver wajib dipilih.';
            }
            if (step.approver_type === 'unit' && !step.unit_id) {
                errs[`step_${index}_unit_id`] = 'Unit spesifik wajib dipilih.';
            }
        });

        if (Object.keys(errs).length > 0) {
            setFormErrors(errs);
            toast.error("Peringatan", { description: "Harap lengkapi semua bidang yang wajib diisi." });
            return;
        }

        setFormErrors({});
        const toastId = toast.loading("Sedang menyimpan alur persetujuan...");

        if (editingPath) {
            router.patch(route('approval-path.update', editingPath.id), formData, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.success("Alur persetujuan berhasil diperbarui", { id: toastId });
                },
                onError: () => toast.error("Gagal memperbarui alur persetujuan", { id: toastId })
            });
        } else {
            router.post(route('approval-path.store'), formData, {
                onSuccess: () => {
                    setIsDialogOpen(false);
                    toast.success("Alur persetujuan berhasil ditambahkan", { id: toastId });
                },
                onError: () => toast.error("Gagal menambahkan alur persetujuan", { id: toastId })
            });
        }
    };

    const handleDelete = (id) => {
        toast.warning("Konfirmasi Hapus", {
            description: "Apakah Anda yakin ingin menghapus alur ini? Semua unit yang menggunakan alur ini harus diperbarui.",
            action: {
                label: "Ya, Hapus",
                onClick: () => {
                    const toastId = toast.loading("Sedang menghapus alur persetujuan...");
                    router.delete(route('approval-path.destroy', id), {
                        onSuccess: () => toast.success("Alur persetujuan berhasil dihapus", { id: toastId }),
                        onError: () => toast.error("Gagal menghapus alur persetujuan", { id: toastId })
                    });
                }
            },
            cancel: { label: "Batal" }
        });
    };

    const saveLpjPath = () => {
        const toastId = toast.loading('Sedang menyimpan alur LPJ...');
        router.post(route('approval-path.lpj.update'), { approval_path_id: selectedLpjPath }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Alur LPJ bersama berhasil diperbarui', { id: toastId }),
            onError: () => toast.error('Pilih alur yang memiliki tahapan persetujuan', { id: toastId }),
        });
    };

    const getApproverLabel = (step) => {
        if (step.approver_type === 'role') return step.role_name ? step.role_name.replace(/_/g, ' ') : 'Role';
        if (step.approver_type === 'unit') return step.unit?.nama_unit || 'Unit Spesifik';
        if (step.approver_type === 'parent_unit') return 'Atasan Unit Pemohon';
        if (step.approver_type === 'self_unit_head') return 'Kepala Unit Pemohon';
        return 'Approver';
    };

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Alur Persetujuan</h2>}
        >
            <Head title="Alur Persetujuan" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

                    {/* Header Banner Toolbar */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-teal-600">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <Route className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                                    Kelola Alur Persetujuan (Approval Paths)
                                </h1>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Atur alur RKA dan pencairan per unit, serta alur LPJ bersama untuk seluruh unit.
                            </p>
                        </div>
                        <button
                            onClick={() => openDialog()}
                            className="h-11 inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition-all duration-200 active:scale-95 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Tambah Alur Baru</span>
                        </button>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-indigo-200 dark:border-indigo-900 shadow-sm p-6 border-l-4 border-l-indigo-500">
                        <div className="flex flex-col md:flex-row md:items-end gap-4">
                            <div className="flex-1 space-y-1">
                                <h2 className="font-bold text-gray-900 dark:text-white">Alur Persetujuan LPJ (Semua Unit)</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Semua unit menggunakan alur yang sama. Admin dapat mengubah alur tujuan persetujuannya dari sini.</p>
                                <CustomSelect
                                    value={selectedLpjPath}
                                    onChange={setSelectedLpjPath}
                                    options={paths.filter(path => path.steps.length > 0).map(path => ({ value: String(path.id), label: path.name }))}
                                    placeholder="Pilih alur untuk LPJ"
                                />
                            </div>
                            <button type="button" onClick={saveLpjPath} disabled={!selectedLpjPath} className="h-10 px-5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold">Simpan Alur LPJ</button>
                        </div>
                    </div>

                    {/* Main Content Cards */}
                    <div className="space-y-4">
                        {paths.map(path => (
                            <div
                                key={path.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm p-6 hover:shadow-md transition-all duration-200 border-l-4 border-l-teal-500"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700/60">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2.5">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                                                {path.name}
                                            </h4>
                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                                                {path.steps.length} Tahapan
                                            </span>
                                        </div>
                                        {path.description && (
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {path.description}
                                            </p>
                                        )}
                                    </div>

                                    <ActionGroup>
                                        <ActionButton
                                            variant="edit"
                                            tooltip="Edit Alur Persetujuan"
                                            onClick={() => openDialog(path)}
                                        />
                                        <ActionButton
                                            variant="delete"
                                            tooltip="Hapus Alur Persetujuan"
                                            onClick={() => handleDelete(path.id)}
                                        />
                                    </ActionGroup>
                                </div>

                                {/* Flow Diagram Visualization */}
                                <div>
                                    <h5 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                        <Layers className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                                        <span>Visualisasi Pipeline Persetujuan:</span>
                                    </h5>

                                    <div className="flex flex-wrap items-center gap-2.5 pt-1">
                                        {path.steps.map((step, index) => (
                                            <React.Fragment key={step.id || index}>
                                                <div className="flex items-center gap-2.5 px-3.5 py-2 bg-gray-50/80 dark:bg-gray-900/60 border border-gray-200/80 dark:border-gray-700/80 rounded-xl shadow-xs hover:border-teal-300 dark:hover:border-teal-700 transition">
                                                    <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold inline-flex items-center justify-center text-center leading-none shrink-0">
                                                        {index + 1}
                                                    </span>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                                                            {step.step_name}
                                                        </span>
                                                        <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                                                            {getApproverLabel(step)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {index < path.steps.length - 1 && (
                                                    <ChevronRight className="w-4 h-4 text-teal-500 dark:text-teal-400 shrink-0" />
                                                )}
                                            </React.Fragment>
                                        ))}

                                        {path.steps.length === 0 && (
                                            <p className="text-xs text-gray-400 italic">Belum ada tahapan persetujuan yang disetting.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {paths.length === 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 p-12 text-center flex flex-col items-center">
                                <Route className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
                                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200">Belum Ada Alur Persetujuan</h3>
                                <p className="text-xs text-gray-400 mt-1 max-w-sm">
                                    Klik tombol "+ Tambah Alur Baru" di atas untuk membuat konfigurasi alur persetujuan baru.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            <Modal show={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="2xl">
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                            <Route className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                {editingPath ? 'Edit Alur Persetujuan' : 'Tambah Alur Persetujuan Baru'}
                            </h2>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="relative pb-2">
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                    Nama Alur *
                                </label>
                                <input
                                    type="text"
                                    className={`h-11 w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 text-gray-900 dark:text-white transition ${formErrors.name ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-200 dark:border-gray-700'}`}
                                    value={formData.name}
                                    onChange={(e) => handleNameChange(e.target.value)}
                                    placeholder="Contoh: Alur Persetujuan Bidang 1 / Fakultas Teknik"
                                />
                                <FieldTooltipError message={formErrors.name} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                    Deskripsi Catatan
                                </label>
                                <textarea
                                    rows="2"
                                    className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 dark:text-white transition"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Penjelasan singkat alur persetujuan ini..."
                                ></textarea>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                    <span>Tahapan Persetujuan Berurutan</span>
                                </h3>
                                <span className="text-xs text-gray-400">
                                    {formData.steps.length} Langkah Diset
                                </span>
                            </div>

                            <div className="space-y-3">
                                {formData.steps.map((step, index) => (
                                    <div key={index} className="flex gap-3 items-start bg-gray-50/80 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700/80 relative">
                                        <div className="w-7 h-7 rounded-full bg-teal-600 text-white text-xs font-bold inline-flex items-center justify-center text-center leading-none shrink-0 mt-2">
                                            {index + 1}
                                        </div>
                                        <div className="flex-1 space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="relative pb-2">
                                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                                                        Status / Nama Tahap *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className={`h-10 w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border rounded-lg shadow-sm focus:ring-1 focus:ring-teal-500 text-gray-900 dark:text-white ${formErrors[`step_${index}_step_name`] ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-200 dark:border-gray-700'}`}
                                                        value={step.step_name}
                                                        onChange={(e) => updateStep(index, 'step_name', e.target.value)}
                                                        placeholder="Contoh: Mengetahui Dekan"
                                                    />
                                                    <FieldTooltipError message={formErrors[`step_${index}_step_name`]} />
                                                </div>
                                                <div className="relative pb-2">
                                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                                                        Tipe Approver *
                                                    </label>
                                                    <CustomSelect
                                                        value={step.approver_type}
                                                        onChange={(val) => updateStep(index, 'approver_type', val)}
                                                        options={[
                                                            { value: 'role', label: 'Berdasarkan Role (Peran)' },
                                                            { value: 'unit', label: 'Kepala Unit Tertentu' },
                                                            { value: 'parent_unit', label: 'Atasan Unit Pemohon' },
                                                            { value: 'self_unit_head', label: 'Kepala Unit Pemohon' },
                                                        ]}
                                                    />
                                                    <FieldTooltipError message={formErrors[`step_${index}_approver_type`]} />
                                                </div>
                                            </div>

                                            {step.approver_type === 'role' && (
                                                <div className="relative pb-2">
                                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                                                        Pilih Role Approver *
                                                    </label>
                                                    <CustomSelect
                                                        value={step.role_name}
                                                        onChange={(val) => updateStep(index, 'role_name', val)}
                                                        options={[
                                                            { value: 'Tim_Renbang', label: 'Tim Renbang' },
                                                            { value: 'BAAK', label: 'BAAK' },
                                                            { value: 'BAUK', label: 'BAUK' },
                                                            { value: 'WR_1', label: 'Wakil Rektor 1' },
                                                            { value: 'WR_2', label: 'Wakil Rektor 2' },
                                                            { value: 'WR_3', label: 'Wakil Rektor 3' },
                                                            { value: 'Sekretaris_Univ', label: 'Sekretaris Univ' },
                                                            { value: 'Rektor', label: 'Rektor' },
                                                        ]}
                                                        placeholder="Pilih Role..."
                                                        className={formErrors[`step_${index}_role_name`] ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}
                                                    />
                                                    <FieldTooltipError message={formErrors[`step_${index}_role_name`]} />
                                                </div>
                                            )}

                                            {step.approver_type === 'unit' && (
                                                <div className="relative pb-2">
                                                    <label className="block text-[11px] font-semibold text-gray-600 dark:text-gray-400 uppercase mb-1">
                                                        Pilih Unit Spesifik *
                                                    </label>
                                                    <CustomSelect
                                                        value={step.unit_id}
                                                        onChange={(val) => updateStep(index, 'unit_id', val)}
                                                        options={units.map(u => ({ value: u.id_unit.toString(), label: u.nama_unit }))}
                                                        placeholder="Pilih Unit..."
                                                        className={formErrors[`step_${index}_unit_id`] ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}
                                                    />
                                                    <FieldTooltipError message={formErrors[`step_${index}_unit_id`]} />
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-950/40 rounded-lg transition mt-1"
                                            onClick={() => removeStep(index)}
                                            title="Hapus Tahap"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {formData.steps.length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-4 italic">
                                        Belum ada tahapan. Klik tombol di bawah untuk menambah tahap baru.
                                    </p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={addStep}
                                className="w-full py-3 border-2 border-dashed border-teal-300 dark:border-teal-700/60 rounded-xl text-teal-600 dark:text-teal-400 hover:bg-teal-50/50 dark:hover:bg-teal-950/30 transition font-bold text-xs flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>+ Tambah Tahapan Baru</span>
                            </button>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <SecondaryButton type="button" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
                                Batal
                            </SecondaryButton>
                            <button
                                type="submit"
                                className="h-11 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition-all duration-200 active:scale-95"
                            >
                                <Save size={16} />
                                <span>Simpan Alur</span>
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
