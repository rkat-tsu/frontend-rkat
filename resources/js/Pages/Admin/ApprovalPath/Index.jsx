import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Plus, Edit2, Trash2, Save } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import TextArea from '@/Components/TextArea';
import Modal from '@/Components/Modal';
import CustomSelect from '@/Components/CustomSelect';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { toast } from 'sonner';

import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Index({ auth, paths, units }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPath, setEditingPath] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        steps: []
    });

    const openDialog = (path = null) => {
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
        setFormData(prev => {
            const newSteps = [...prev.steps];
            newSteps[index] = { ...newSteps[index], [field]: value };
            return { ...prev, steps: newSteps };
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
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

    return (
        <AuthenticatedLayout
            user={auth?.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Daftar Alur Persetujuan</h2>}
        >
            <Head title="Daftar Alur Persetujuan" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">

                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Daftar Alur Persetujuan
                        </h1>
                        <PrimaryButton onClick={() => openDialog()} className="h-11">
                            <Plus className="w-5 h-5 mr-2" /> Tambah Alur
                        </PrimaryButton>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-indigo-500">
                        <div className="space-y-4">
                            {paths.map(path => (
                                <div key={path.id} className="border border-slate-300 dark:border-slate-700 rounded-xl p-6 bg-white dark:bg-gray-800">
                                    <div className="flex justify-between items-start mb-5">
                                        <div>
                                            <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">{path.name}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{path.description}</p>
                                        </div>
                                        <div className="flex justify-center gap-2">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            onClick={() => openDialog(path)}
                                                            className="inline-flex items-center justify-center w-8 h-8 border border-blue-200 rounded-lg text-blue-500 hover:bg-blue-50 dark:bg-gray-800 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30 transition-colors"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Edit Alur</TooltipContent>
                                                </Tooltip>

                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            onClick={() => handleDelete(path.id)}
                                                            className="inline-flex items-center justify-center w-8 h-8 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 dark:bg-gray-800 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Hapus Alur</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Urutan Persetujuan:</h5>
                                        <div className="flex flex-wrap items-center gap-y-3 gap-x-2">
                                            {path.steps.map((step, index) => (
                                                <div key={step.id} className="flex items-center">
                                                    <span className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm transition-all hover:shadow-md">
                                                        {index + 1}. {step.step_name}
                                                        <span className="text-slate-400 font-normal ml-1.5">
                                                            ({step.approver_type === 'role' ? step.role_name : step.approver_type === 'unit' ? step.unit?.nama_unit : step.approver_type === 'parent_unit' ? 'Atasan Unit' : 'Kepala Unit Pemohon'})
                                                        </span>
                                                    </span>
                                                    {index < path.steps.length - 1 && (
                                                        <span className="mx-2 text-slate-300 font-bold">➔</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {paths.length === 0 && (
                                <p className="text-center text-gray-500 py-8">Belum ada alur persetujuan yang dibuat.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Form */}
            <Modal show={isDialogOpen} onClose={() => setIsDialogOpen(false)} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100">
                        {editingPath ? 'Edit Alur Persetujuan' : 'Tambah Alur Persetujuan'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6 mt-6">
                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="name" value="Nama Alur (Misal: Bidang 1)" className="text-slate-600 dark:text-slate-400 mb-1.5" />
                                <TextInput
                                    id="name"
                                    className="block w-full border-slate-300 rounded-lg shadow-sm focus:border-slate-400 focus:ring-slate-400"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <InputLabel htmlFor="description" value="Deskripsi" className="text-slate-600 dark:text-slate-400 mb-1.5" />
                                <TextArea
                                    id="description"
                                    className="block w-full border-slate-300 rounded-lg shadow-sm focus:border-slate-400 focus:ring-slate-400"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <div className="mb-4 mt-2">
                                <h3 className="text-base font-medium text-slate-800 dark:text-slate-100">Tahapan Persetujuan</h3>
                            </div>
                            <div className="space-y-4">
                                {formData.steps.map((step, index) => (
                                    <div key={index} className="flex gap-4 items-start bg-[#f8fafc] dark:bg-gray-800/50 p-5 rounded-xl border border-slate-300 dark:border-slate-600">
                                        <div className="pt-8 font-semibold text-slate-500 text-lg">{index + 1}.</div>
                                        <div className="flex-1 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <InputLabel value="Status Tahapan" className="text-slate-600 dark:text-slate-400 mb-1" />
                                                    <TextInput
                                                        className="block w-full border-slate-300 rounded-lg shadow-sm"
                                                        value={step.step_name}
                                                        onChange={(e) => updateStep(index, 'step_name', e.target.value)}
                                                        placeholder="Misal: Mengetahui Unit"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <InputLabel value="Tipe Approver" className="text-slate-600 dark:text-slate-400 mb-1" />
                                                    <CustomSelect
                                                        value={step.approver_type}
                                                        onChange={(e) => updateStep(index, 'approver_type', e.target.value)}
                                                        options={[
                                                            { value: 'role', label: 'Berdasarkan Role (Peran)' },
                                                            { value: 'unit', label: 'Kepala Unit Tertentu' },
                                                            { value: 'parent_unit', label: 'Atasan Unit Pemohon' },
                                                            { value: 'self_unit_head', label: 'Kepala Unit Pemohon' },
                                                        ]}
                                                        className="w-full border-slate-300 rounded-lg shadow-sm"
                                                    />
                                                </div>
                                            </div>

                                            {step.approver_type === 'role' && (
                                                <div>
                                                    <InputLabel value="Pilih Role" className="text-slate-600 dark:text-slate-400 mb-1" />
                                                    <CustomSelect
                                                        value={step.role_name}
                                                        onChange={(e) => updateStep(index, 'role_name', e.target.value)}
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
                                                        className="w-full border-slate-300 rounded-lg shadow-sm"
                                                    />
                                                </div>
                                            )}

                                            {step.approver_type === 'unit' && (
                                                <div>
                                                    <InputLabel value="Pilih Unit" className="text-slate-600 dark:text-slate-400 mb-1" />
                                                    <CustomSelect
                                                        value={step.unit_id}
                                                        onChange={(e) => updateStep(index, 'unit_id', e.target.value)}
                                                        options={units.map(u => ({ value: u.id_unit, label: u.nama_unit }))}
                                                        placeholder="Pilih Unit..."
                                                        className="w-full border-slate-300 rounded-lg shadow-sm"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            className="mt-7 flex items-center justify-center w-10 h-10 bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg shadow-sm transition-colors"
                                            onClick={() => removeStep(index)}
                                            title="Hapus Tahap"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                {formData.steps.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">Belum ada tahapan. Klik tombol di bawah untuk menambah tahap baru.</p>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={addStep}
                                className="mt-4 w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center font-medium text-sm"
                            >
                                <Plus className="w-5 h-5 mr-2" /> Tambah Tahap
                            </button>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <SecondaryButton type="button" onClick={() => setIsDialogOpen(false)}>Batal</SecondaryButton>
                            <PrimaryButton type="submit">
                                <Save size={16} className="mr-2" /> Simpan Alur
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
