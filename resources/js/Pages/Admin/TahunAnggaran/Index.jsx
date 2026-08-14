import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionButton, { ActionGroup } from '@/Components/ActionButton';
import { Edit2, Trash2, Search, Plus, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
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
import FieldTooltipError from '@/Components/FieldTooltipError';
import { CalendarPlus, Save, CalendarClock, X, PencilLine } from 'lucide-react';

export default function Index({ tahunAnggarans, filters = {} }) {
    const { isAdmin, user: authUser } = usePermission();
    const [search, setSearch] = useState(filters?.search || '');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'tahun_anggaran');
    const [sortDirection, setSortDirection] = useState(filters?.sort_direction || 'desc');

    const applyFilters = (newSearch = search, newSortBy = sortBy, newSortDirection = sortDirection) => {
        router.get(
            route('tahun.index'),
            { search: newSearch, sort_by: newSortBy, sort_direction: newSortDirection },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleSort = (field) => {
        const newDirection = (sortBy === field && sortDirection === 'asc') ? 'desc' : 'asc';
        setSortBy(field);
        setSortDirection(newDirection);
        applyFilters(search, field, newDirection);
    };

    React.useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (search !== (filters?.search || '')) {
                applyFilters(search, sortBy, sortDirection);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [search]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormErrors, setCreateFormErrors] = useState({});
    const [editFormErrors, setEditFormErrors] = useState({});

    const computeIndikatorLabels = (yearVal) => {
        const y = parseInt(yearVal, 10);
        if (!y || isNaN(y)) {
            return { past: '', current: '', future: '' };
        }
        return {
            past: String(y - 1),
            current: `Tahun ${y}`,
            future: `Akhir ${y + 3}`
        };
    };

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        tahun_anggaran: '',
        status_rkat: 'Drafting',
        tanggal_mulai: '',
        tanggal_akhir: '',
        indikator_labels: {
            past: '',
            current: '',
            future: ''
        }
    });

    const handleCreateChange = (field, value) => {
        if (field === 'tahun_anggaran') {
            const y = parseInt(value, 10);
            const computed = computeIndikatorLabels(value);
            const isValidYear = y && !isNaN(y) && y >= 2000 && y <= 2100;
            
            setData(prev => ({
                ...prev,
                tahun_anggaran: value,
                tanggal_mulai: (isValidYear && !prev.tanggal_mulai) ? `${y}-01-01` : prev.tanggal_mulai,
                tanggal_akhir: (isValidYear && !prev.tanggal_akhir) ? `${y}-12-31` : prev.tanggal_akhir,
                indikator_labels: computed
            }));
        } else {
            setData(field, value);
        }
        if (createFormErrors[field]) {
            setCreateFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleEditChange = (field, value) => {
        if (field === 'tahun_anggaran') {
            const computed = computeIndikatorLabels(value);
            editForm.setData(prev => ({
                ...prev,
                tahun_anggaran: value,
                indikator_labels: computed
            }));
        } else {
            editForm.setData(field, value);
        }
        if (editFormErrors[field]) {
            setEditFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const statusOptions = [
        { value: 'Drafting', label: 'Drafting (Penyusunan)' },
        { value: 'Submission', label: 'Submission (Pengajuan)' },
        { value: 'Approved', label: 'Approved (Disetujui)' },
        { value: 'Closed', label: 'Closed (Ditutup)' },
    ];

    const openCreateModal = () => {
        reset();
        clearErrors();
        setCreateFormErrors({});
        const nextYear = new Date().getFullYear();
        setData({
            tahun_anggaran: nextYear,
            status_rkat: 'Drafting',
            tanggal_mulai: `${nextYear}-01-01`,
            tanggal_akhir: `${nextYear}-12-31`,
            indikator_labels: computeIndikatorLabels(nextYear)
        });
        setIsCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        reset();
        clearErrors();
        setCreateFormErrors({});
    };

    const submitCreate = (e) => {
        e.preventDefault();
        const errs = {};
        if (!data.tahun_anggaran) errs.tahun_anggaran = 'Harap isi bidang ini.';
        if (!data.status_rkat) errs.status_rkat = 'Harap isi bidang ini.';
        if (!data.tanggal_mulai) errs.tanggal_mulai = 'Harap isi bidang ini.';
        if (!data.tanggal_akhir) errs.tanggal_akhir = 'Harap isi bidang ini.';

        if (Object.keys(errs).length > 0) {
            setCreateFormErrors(errs);
            toast.error("Gagal Menyimpan", { description: "Harap lengkapi bidang form yang wajib diisi." });
            return;
        }

        setCreateFormErrors({});
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
            past: '',
            current: '',
            future: ''
        }
    });

    const formatInputDate = (isoString) => {
        if (!isoString) return '';
        return isoString.split('T')[0];
    };

    const openEditModal = (tahun) => {
        editForm.reset();
        editForm.clearErrors();
        setEditFormErrors({});

        const computed = computeIndikatorLabels(tahun.tahun_anggaran);
        editForm.setData({
            id: tahun.uuid || tahun.id_tahun || tahun.id,
            tahun_anggaran: tahun.tahun_anggaran || '',
            status_rkat: tahun.status_rkat || 'Drafting',
            tanggal_mulai: formatInputDate(tahun.tanggal_mulai),
            tanggal_akhir: formatInputDate(tahun.tanggal_akhir),
            indikator_labels: {
                past: tahun.indikator_labels?.past || computed.past,
                current: tahun.indikator_labels?.current || computed.current,
                future: tahun.indikator_labels?.future || computed.future,
            }
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        editForm.reset();
        editForm.clearErrors();
        setEditFormErrors({});
    };

    const submitEdit = (e) => {
        e.preventDefault();
        const errs = {};
        if (!editForm.data.tahun_anggaran) errs.tahun_anggaran = 'Harap isi bidang ini.';
        if (!editForm.data.status_rkat) errs.status_rkat = 'Harap isi bidang ini.';
        if (!editForm.data.tanggal_mulai) errs.tanggal_mulai = 'Harap isi bidang ini.';
        if (!editForm.data.tanggal_akhir) errs.tanggal_akhir = 'Harap isi bidang ini.';

        if (Object.keys(errs).length > 0) {
            setEditFormErrors(errs);
            toast.error("Gagal Memperbarui", { description: "Harap lengkapi bidang form yang wajib diisi." });
            return;
        }

        setEditFormErrors({});
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
                                        <th 
                                            className="px-2 py-3 border-b border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('tahun_anggaran')}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>Tahun Anggaran</span>
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'tahun_anggaran' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-teal-600 dark:text-teal-400" /> : <ArrowDown size={14} className="text-teal-600 dark:text-teal-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('tanggal_mulai')}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>Tanggal Mulai</span>
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'tanggal_mulai' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-teal-600 dark:text-teal-400" /> : <ArrowDown size={14} className="text-teal-600 dark:text-teal-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('tanggal_akhir')}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>Tanggal Akhir</span>
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'tanggal_akhir' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-teal-600 dark:text-teal-400" /> : <ArrowDown size={14} className="text-teal-600 dark:text-teal-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('status_rkat')}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>Status</span>
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'status_rkat' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-teal-600 dark:text-teal-400" /> : <ArrowDown size={14} className="text-teal-600 dark:text-teal-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
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
                                                    {isAdmin() && (
                                                        <ActionGroup>
                                                            <ActionButton
                                                                variant="edit"
                                                                tooltip="Edit Tahun"
                                                                onClick={() => openEditModal(tahun)}
                                                            />
                                                            <ActionButton
                                                                variant="delete"
                                                                tooltip="Hapus Tahun"
                                                                onClick={() => handleDelete(tahun)}
                                                            />
                                                        </ActionGroup>
                                                    )}
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
                                <div className="relative pb-2">
                                    <InputLabel htmlFor="tahun_anggaran" value="Tahun Anggaran" required />
                                    <TextInput
                                        id="tahun_anggaran"
                                        type="number"
                                        value={data.tahun_anggaran}
                                        onChange={(e) => handleCreateChange('tahun_anggaran', e.target.value)}
                                        className={`mt-1 block w-full ${(createFormErrors.tahun_anggaran || errors.tahun_anggaran) ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`}
                                        placeholder="Masukkan tahun anggaran"
                                        isFocused={true}
                                    />
                                    <FieldTooltipError message={createFormErrors.tahun_anggaran || errors.tahun_anggaran} />
                                </div>

                                <div className="relative pb-2">
                                    <InputLabel value="Status Awal" required />
                                    <CustomSelect
                                        value={data.status_rkat}
                                        onChange={(e) => handleCreateChange('status_rkat', e.target.value)}
                                        options={statusOptions}
                                        placeholder="Pilih Status"
                                        className={`mt-1 ${(createFormErrors.status_rkat || errors.status_rkat) ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`}
                                    />
                                    <FieldTooltipError message={createFormErrors.status_rkat || errors.status_rkat} />
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
                                <div className="relative pb-2">
                                    <InputLabel value="Tanggal Mulai" required />
                                    <div className="mt-1 relative z-50"> 
                                        <DateInput
                                            value={data.tanggal_mulai}
                                            onChange={(val) => handleCreateChange('tanggal_mulai', val)}
                                            placeholder="Pilih tanggal mulai..."
                                            position="right"
                                            isError={!!(createFormErrors.tanggal_mulai || errors.tanggal_mulai)}
                                        />
                                    </div>
                                    <FieldTooltipError message={createFormErrors.tanggal_mulai || errors.tanggal_mulai} />
                                </div>

                                <div className="relative pb-2">
                                    <InputLabel value="Tanggal Selesai" required />
                                    <div className="mt-1 relative z-40">
                                        <DateInput
                                            value={data.tanggal_akhir}
                                            onChange={(val) => handleCreateChange('tanggal_akhir', val)}
                                            placeholder="Pilih tanggal selesai..."
                                            position="left"
                                            isError={!!(createFormErrors.tanggal_akhir || errors.tanggal_akhir)}
                                        />
                                    </div>
                                    <FieldTooltipError message={createFormErrors.tanggal_akhir || errors.tanggal_akhir} />
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
                                <div className="relative pb-2">
                                    <InputLabel htmlFor="edit_tahun_anggaran" value="Tahun Anggaran" required />
                                    <TextInput
                                        id="edit_tahun_anggaran"
                                        type="number"
                                        value={editForm.data.tahun_anggaran}
                                        onChange={(e) => handleEditChange('tahun_anggaran', e.target.value)}
                                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed focus:ring-0"
                                        placeholder="Cth: 2026"
                                        readOnly 
                                    />
                                    <FieldTooltipError message={editFormErrors.tahun_anggaran || editForm.errors.tahun_anggaran} />
                                </div>

                                <div className="relative pb-2">
                                    <InputLabel value="Status RKAT" required />
                                    <CustomSelect
                                        value={editForm.data.status_rkat}
                                        onChange={(e) => handleEditChange('status_rkat', e.target.value)}
                                        options={statusOptions}
                                        placeholder="Pilih Status"
                                        className={`mt-1 ${(editFormErrors.status_rkat || editForm.errors.status_rkat) ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`}
                                    />
                                    <FieldTooltipError message={editFormErrors.status_rkat || editForm.errors.status_rkat} />
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
                                <div className="relative pb-2">
                                    <InputLabel value="Tanggal Mulai" required />
                                    <div className="mt-1 relative z-50"> 
                                        <DateInput
                                            value={editForm.data.tanggal_mulai}
                                            onChange={(val) => handleEditChange('tanggal_mulai', val)}
                                            placeholder="Pilih tanggal mulai..."
                                            position="right"
                                            isError={!!(editFormErrors.tanggal_mulai || editForm.errors.tanggal_mulai)}
                                        />
                                    </div>
                                    <FieldTooltipError message={editFormErrors.tanggal_mulai || editForm.errors.tanggal_mulai} />
                                </div>

                                <div className="relative pb-2">
                                    <InputLabel value="Tanggal Selesai" required />
                                    <div className="mt-1 relative z-40">
                                        <DateInput
                                            value={editForm.data.tanggal_akhir}
                                            onChange={(val) => handleEditChange('tanggal_akhir', val)}
                                            placeholder="Pilih tanggal selesai..."
                                            position="left"
                                            isError={!!(editFormErrors.tanggal_akhir || editForm.errors.tanggal_akhir)}
                                        />
                                    </div>
                                    <FieldTooltipError message={editFormErrors.tanggal_akhir || editForm.errors.tanggal_akhir} />
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
