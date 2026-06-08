import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Edit2, Trash2, Search, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/usePermission';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import CustomSelect from '@/Components/CustomSelect'; 
import DateInput from '@/Components/DateInput';
import { CalendarPlus, Save, CalendarClock, X, PencilLine } from 'lucide-react';

export default function Index({ tahunAnggarans }) {
    const { isAdmin, user: authUser } = usePermission();
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        tahun_anggaran: '',
        status_rkat: 'Drafting',
        tanggal_mulai: '',
        tanggal_akhir: '',
        indikator_labels: {
            past: '2025',
            current: 'Tahun 2026',
            future: 'Akhir 2029'
        }
    });

    const statusOptions = [
        { value: 'Drafting', label: 'Drafting (Penyusunan)' },
        { value: 'Submission', label: 'Submission (Pengajuan)' },
        { value: 'Approved', label: 'Approved (Disetujui)' },
        { value: 'Closed', label: 'Closed (Ditutup)' },
    ];

    const openCreateModal = () => {
        reset();
        clearErrors();
        setIsCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        reset();
        clearErrors();
    };

    const submitCreate = (e) => {
        e.preventDefault();

        if (!data.tahun_anggaran || !data.status_rkat || !data.tanggal_mulai || !data.tanggal_akhir) {
            toast.error("Peringatan", { description: "Semua form wajib diisi." });
            return;
        }

        const toastId = toast.loading("Sedang menyimpan data...");
        post(route('tahun.store'), {
            onSuccess: () => {
                toast.success("Berhasil", { id: toastId, description: `Tahun Anggaran ${data.tahun_anggaran} berhasil ditambahkan.` });
                closeCreateModal();
            },
            onError: () => toast.error("Gagal Menyimpan", { id: toastId, description: "Terdapat kesalahan saat menyimpan data." })
        });
    };

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const editForm = useForm({
        id: '',
        tahun_anggaran: '',
        status_rkat: 'Drafting',
        tanggal_mulai: '',
        tanggal_akhir: '',
        indikator_labels: {
            past: '2025',
            current: 'Tahun 2026',
            future: 'Akhir 2029'
        }
    });

    const formatInputDate = (isoString) => {
        if (!isoString) return '';
        return isoString.split('T')[0];
    };

    const openEditModal = (tahun) => {
        editForm.reset();
        editForm.clearErrors();
        editForm.setData({
            id: tahun.uuid || tahun.id_tahun || tahun.id,
            tahun_anggaran: tahun.tahun_anggaran || '',
            status_rkat: tahun.status_rkat || 'Drafting',
            tanggal_mulai: formatInputDate(tahun.tanggal_mulai),
            tanggal_akhir: formatInputDate(tahun.tanggal_akhir),
            indikator_labels: tahun.indikator_labels || {
                past: '2025',
                current: 'Tahun 2026',
                future: 'Akhir 2029'
            }
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        editForm.reset();
        editForm.clearErrors();
    };

    const submitEdit = (e) => {
        e.preventDefault();

        if (!editForm.data.tahun_anggaran || !editForm.data.status_rkat || !editForm.data.tanggal_mulai || !editForm.data.tanggal_akhir) {
            toast.error("Peringatan", { description: "Semua form wajib diisi." });
            return;
        }

        const toastId = toast.loading("Sedang memperbarui data...");
        editForm.patch(route('tahun.update', editForm.data.id), {
            onSuccess: () => {
                toast.success("Berhasil", { id: toastId, description: `Data Tahun Anggaran ${editForm.data.tahun_anggaran} berhasil diperbarui.` });
                closeEditModal();
            },
            onError: () => toast.error("Gagal Memperbarui", { id: toastId, description: "Terdapat kesalahan saat memperbarui data." })
        });
    };

    // Client-side filter for the current page
    const filtered = tahunAnggarans.data.filter(t => {
        const q = search.toLowerCase();
        return (
            String(t.tahun_anggaran).includes(q) ||
            t.status_rkat?.toLowerCase().includes(q)
        );
    });

    // Handle delete with confirmation
    const handleDelete = (tahunAnggaran) => {
        toast.warning("Konfirmasi Hapus", {
            description: `Yakin menghapus Tahun Anggaran ${tahunAnggaran.tahun_anggaran}? Semua RKAT terkait akan terhapus.`,
            action: {
                label: "Ya, Hapus",
                onClick: () => {
                    const toastId = toast.loading("Sedang menghapus...");
                    router.delete(route('tahun.destroy', tahunAnggaran.uuid), {
                        onSuccess: () => toast.success("Berhasil Dihapus", { id: toastId, description: `Tahun Anggaran ${tahunAnggaran.tahun_anggaran} berhasil dihapus.` }),
                        onError: () => toast.error("Gagal Menghapus", { id: toastId, description: "Terdapat kesalahan saat menghapus data." })
                    });
                }
            },
            cancel: {
                label: "Batal",
            }
        });
    };

    // Format date for display
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Drafting':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Submission':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'Approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Closed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    return (
        <AuthenticatedLayout
            user={authUser}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tahun Anggaran</h2>}
        >
            <Head title="Tahun Anggaran" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Tahun Anggaran
                    </h1>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-teal-500">
                        
                        {/* Top Bar: Search, Filter, & Tambah Button */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <div className="relative w-full md:w-1/2">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search size={18} className="text-gray-400"/>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Cari tahun atau status..." 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)} 
                                    className="pl-10 block w-full h-11 bg-gray-100 border-transparent rounded-lg focus:border-teal-500 focus:bg-white focus:ring-0 text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {isAdmin() && (
                                    <button 
                                        onClick={openCreateModal}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition whitespace-nowrap h-11"
                                    >
                                        <Plus size={16} /> Tambah Tahun
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
                            <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    <tr>
                                        <th className="px-2 py-3 border-b border-gray-300 dark:border-gray-600 font-medium text-center">Tahun Anggaran</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Tanggal Mulai</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Tanggal Akhir</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Status</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800">
                                    {filtered.length > 0 ? (
                                        filtered.map(tahun => (
                                            <tr key={tahun.tahun_anggaran} className="hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors duration-200">
                                                <td className="px-6 py-4 border-b border-gray-300 dark:border-gray-700 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100 text-center">
                                                    {tahun.tahun_anggaran}
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                                                    {formatDate(tahun.tanggal_mulai)}
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 text-center">
                                                    {formatDate(tahun.tanggal_akhir)}
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 whitespace-nowrap text-center">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-bold whitespace-nowrap ${getStatusColor(tahun.status_rkat)}`}>
                                                        {tahun.status_rkat}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 whitespace-nowrap text-sm text-center">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <TooltipProvider>
                                                            {isAdmin() && (
                                                                <>
                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <button 
                                                                                onClick={() => openEditModal(tahun)}
                                                                                className="inline-flex items-center justify-center w-8 h-8 border border-teal-300 rounded-md shadow-sm text-teal-700 bg-white hover:bg-teal-50 dark:bg-gray-700 dark:text-teal-400 dark:border-teal-900/50 dark:hover:bg-teal-900/20 transition-colors"
                                                                            >
                                                                                <Edit2 size={16} />
                                                                            </button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Edit Tahun</TooltipContent>
                                                                    </Tooltip>

                                                                    <Tooltip>
                                                                        <TooltipTrigger asChild>
                                                                            <button
                                                                                onClick={() => handleDelete(tahun)}
                                                                                className="inline-flex items-center justify-center w-8 h-8 border border-red-300 rounded-md shadow-sm text-red-700 bg-white hover:bg-red-50 dark:bg-gray-700 dark:text-red-400 dark:border-red-900/50 dark:hover:bg-red-900/20 transition-colors"
                                                                            >
                                                                                <Trash2 size={16} />
                                                                            </button>
                                                                        </TooltipTrigger>
                                                                        <TooltipContent>Hapus Tahun</TooltipContent>
                                                                    </Tooltip>
                                                                </>
                                                            )}
                                                        </TooltipProvider>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-b border-gray-300 dark:border-gray-700">
                                                Tidak ada data tahun anggaran ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <Modal show={isCreateModalOpen} onClose={closeCreateModal} maxWidth="3xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Tambah Tahun Anggaran</h2>
                        <button onClick={closeCreateModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <X size={20} />
                        </button>
                    </div>

                    <form 
                        onSubmit={submitCreate} 
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                submitCreate(e);
                            }
                        }}
                        className="space-y-6"
                    >
                        
                        {/* --- KARTU 1: PERIODE ANGGARAN --- */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                                    <CalendarPlus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
                                        Periode Anggaran Baru
                                    </h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="relative z-0">
                                    <InputLabel htmlFor="tahun_anggaran" value="Tahun Anggaran" required />
                                    <TextInput
                                        id="tahun_anggaran"
                                        type="number"
                                        value={data.tahun_anggaran}
                                        onChange={(e) => setData('tahun_anggaran', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Masukkan tahun anggaran"
                                        isFocused={true}
                                    />
                                    <InputError message={errors.tahun_anggaran} className="mt-2" />
                                </div>

                                <div className="relative z-0">
                                    <InputLabel value="Status Awal" required />
                                    <CustomSelect
                                        value={data.status_rkat}
                                        onChange={(e) => setData('status_rkat', e.target.value)}
                                        options={statusOptions}
                                        placeholder="Pilih Status"
                                        className="mt-1"
                                    />
                                    <InputError message={errors.status_rkat} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* --- KARTU 2: DURASI PELAKSANAAN --- */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-teal-50 dark:bg-teal-900/40 rounded-lg">
                                    <CalendarClock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 dark:text-white">
                                        Durasi Pelaksanaan
                                    </h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <InputLabel value="Tanggal Mulai" required />
                                    <div className="mt-1 relative z-50"> 
                                        <DateInput
                                            value={data.tanggal_mulai}
                                            onChange={(val) => setData('tanggal_mulai', val)}
                                            placeholder="Pilih tanggal mulai..."
                                            position="right"
                                        />
                                    </div>
                                    <InputError message={errors.tanggal_mulai} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel value="Tanggal Selesai" required />
                                    <div className="mt-1 relative z-40">
                                        <DateInput
                                            value={data.tanggal_akhir}
                                            onChange={(val) => setData('tanggal_akhir', val)}
                                            placeholder="Pilih tanggal selesai..."
                                            position="left"
                                        />
                                    </div>
                                    <InputError message={errors.tanggal_akhir} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* --- KARTU 3: INDIKATOR KEBERHASILAN --- */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-teal-50 dark:bg-teal-900/40 rounded-lg">
                                    <CalendarClock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 dark:text-white">
                                        Pengaturan Tahun Indikator Keberhasilan
                                    </h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="flex flex-col h-full">
                                    <InputLabel value="Tahun Lalu (Capaian)" />
                                    <div className="mt-auto pt-1">
                                        <TextInput
                                            type="text"
                                            value={data.indikator_labels?.past || ''}
                                            onChange={(e) => setData('indikator_labels', { ...data.indikator_labels, past: e.target.value })}
                                            className="block w-full"
                                            placeholder="Contoh: 2025"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col h-full">
                                    <InputLabel value="Tahun Berjalan (Target & Capaian)" />
                                    <div className="mt-auto pt-1">
                                        <TextInput
                                            type="text"
                                            value={data.indikator_labels?.current || ''}
                                            onChange={(e) => setData('indikator_labels', { ...data.indikator_labels, current: e.target.value })}
                                            className="block w-full"
                                            placeholder="Contoh: Tahun 2026"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col h-full">
                                    <InputLabel value="Tahun Mendatang (Target & Capaian)" />
                                    <div className="mt-auto pt-1">
                                        <TextInput
                                            type="text"
                                            value={data.indikator_labels?.future || ''}
                                            onChange={(e) => setData('indikator_labels', { ...data.indikator_labels, future: e.target.value })}
                                            className="block w-full"
                                            placeholder="Contoh: Akhir 2029"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                            <button
                                type="button"
                                onClick={closeCreateModal}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-md shadow-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            >
                                <Save size={16} className="mr-2" /> Simpan Data
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
            <Modal show={isEditModalOpen} onClose={closeEditModal} maxWidth="3xl">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Edit Tahun Anggaran</h2>
                        <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <X size={20} />
                        </button>
                    </div>

                    <form 
                        onSubmit={submitEdit} 
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                submitEdit(e);
                            }
                        }}
                        className="space-y-6"
                    >
                        
                        {/* --- KARTU 1: PERIODE ANGGARAN --- */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                                    <PencilLine className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
                                        Perbarui Periode Anggaran
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        ID Data: <span className="font-semibold text-teal-600 dark:text-teal-400">{editForm.data.id}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="relative z-0">
                                    <InputLabel htmlFor="edit_tahun_anggaran" value="Tahun Anggaran" required />
                                    <TextInput
                                        id="edit_tahun_anggaran"
                                        type="number"
                                        value={editForm.data.tahun_anggaran}
                                        onChange={(e) => editForm.setData('tahun_anggaran', e.target.value)}
                                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed focus:ring-0"
                                        placeholder="Cth: 2026"
                                        readOnly 
                                    />
                                    <InputError message={editForm.errors.tahun_anggaran} className="mt-2" />
                                </div>

                                <div className="relative z-0">
                                    <InputLabel value="Status RKAT" required />
                                    <CustomSelect
                                        value={editForm.data.status_rkat}
                                        onChange={(e) => editForm.setData('status_rkat', e.target.value)}
                                        options={statusOptions}
                                        placeholder="Pilih Status"
                                        className="mt-1"
                                    />
                                    <InputError message={editForm.errors.status_rkat} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* --- KARTU 2: DURASI PELAKSANAAN --- */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-teal-50 dark:bg-teal-900/40 rounded-lg">
                                    <CalendarClock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 dark:text-white">
                                        Durasi Pelaksanaan
                                    </h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <InputLabel value="Tanggal Mulai" required />
                                    <div className="mt-1 relative z-50"> 
                                        <DateInput
                                            value={editForm.data.tanggal_mulai}
                                            onChange={(val) => editForm.setData('tanggal_mulai', val)}
                                            placeholder="Pilih tanggal mulai..."
                                            position="right"
                                        />
                                    </div>
                                    <InputError message={editForm.errors.tanggal_mulai} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel value="Tanggal Selesai" required />
                                    <div className="mt-1 relative z-40">
                                        <DateInput
                                            value={editForm.data.tanggal_akhir}
                                            onChange={(val) => editForm.setData('tanggal_akhir', val)}
                                            placeholder="Pilih tanggal selesai..."
                                            position="left"
                                        />
                                    </div>
                                    <InputError message={editForm.errors.tanggal_akhir} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* --- KARTU 3: INDIKATOR KEBERHASILAN --- */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-teal-50 dark:bg-teal-900/40 rounded-lg">
                                    <CalendarClock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="text-md font-medium text-gray-900 dark:text-white">
                                        Pengaturan Tahun Indikator Keberhasilan
                                    </h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="flex flex-col h-full">
                                    <InputLabel value="Tahun Lalu (Capaian)" />
                                    <div className="mt-auto pt-1">
                                        <TextInput
                                            type="text"
                                            value={editForm.data.indikator_labels?.past || ''}
                                            onChange={(e) => editForm.setData('indikator_labels', { ...editForm.data.indikator_labels, past: e.target.value })}
                                            className="block w-full"
                                            placeholder="Contoh: 2025"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col h-full">
                                    <InputLabel value="Tahun Berjalan (Target & Capaian)" />
                                    <div className="mt-auto pt-1">
                                        <TextInput
                                            type="text"
                                            value={editForm.data.indikator_labels?.current || ''}
                                            onChange={(e) => editForm.setData('indikator_labels', { ...editForm.data.indikator_labels, current: e.target.value })}
                                            className="block w-full"
                                            placeholder="Contoh: Tahun 2026"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col h-full">
                                    <InputLabel value="Tahun Mendatang (Target & Capaian)" />
                                    <div className="mt-auto pt-1">
                                        <TextInput
                                            type="text"
                                            value={editForm.data.indikator_labels?.future || ''}
                                            onChange={(e) => editForm.setData('indikator_labels', { ...editForm.data.indikator_labels, future: e.target.value })}
                                            className="block w-full"
                                            placeholder="Contoh: Akhir 2029"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                            <button
                                type="button"
                                onClick={closeEditModal}
                                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={editForm.processing}
                                className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-md shadow-sm disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                            >
                                <Save size={16} className="mr-2" /> Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
