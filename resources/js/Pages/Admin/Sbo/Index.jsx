import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionButton, { ActionGroup } from '@/Components/ActionButton';
import { Edit2, Trash2, Search, Plus, Save, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import CustomSelect from '@/Components/CustomSelect';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/usePermission';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import FieldTooltipError from '@/Components/FieldTooltipError';

export default function Index({ auth, items = {}, filters = {}, kelompoks = [], flash = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [kelompokFilter, setKelompokFilter] = useState(filters?.kelompok || '');
    const [perPage, setPerPage] = useState(filters?.per_page || '15');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'kode_anggaran');
    const [sortDirection, setSortDirection] = useState(filters?.sort_direction || 'asc');

    const applyFilters = (newSearch, newKelompok, newPerPage, newSortBy = sortBy, newSortDirection = sortDirection) => {
        router.get(
            route('sbo.index'),
            { search: newSearch, kelompok: newKelompok, per_page: newPerPage, sort_by: newSortBy, sort_direction: newSortDirection },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleSort = (field) => {
        const newDirection = (sortBy === field && sortDirection === 'asc') ? 'desc' : 'asc';
        setSortBy(field);
        setSortDirection(newDirection);
        applyFilters(searchTerm, kelompokFilter, perPage, field, newDirection);
    };

    const { isAdmin } = usePermission();

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [createFormErrors, setCreateFormErrors] = useState({});
    const [editFormErrors, setEditFormErrors] = useState({});

    const handleCreateChange = (field, value) => {
        setCreateData(field, value);
        if (createFormErrors[field]) {
            setCreateFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleEditChange = (field, value) => {
        setEditData(field, value);
        if (editFormErrors[field]) {
            setEditFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const { data: createData, setData: setCreateData, post, processing: createProcessing, errors: createErrors, reset: resetCreate } = useForm({
        kode_anggaran: '',
        nama_anggaran: '',
        satuan: '',
        kelompok_anggaran: '',
        nominal: '',
    });

    const { data: editData, setData: setEditData, patch, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        kode_anggaran: '',
        nama_anggaran: '',
        satuan: '',
        kelompok_anggaran: '',
        nominal: '',
    });

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== (filters?.search || '') || kelompokFilter !== (filters?.kelompok || '') || perPage !== (filters?.per_page || '15')) {
                applyFilters(searchTerm, kelompokFilter, perPage, sortBy, sortDirection);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, kelompokFilter, perPage]);

    // Data dari server
    const filtered = items.data || [];

    // Helper untuk Format Rupiah
    const formatRupiah = (number) => {
        if (!number) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const handleDelete = (uuid) => {
        toast.warning("Konfirmasi Hapus", {
            description: "Apakah Anda yakin ingin menghapus item SBO ini?",
            action: {
                label: "Ya, Hapus",
                onClick: () => {
                    const toastId = toast.loading("Sedang menghapus...");
                    router.delete(route('sbo.destroy', uuid), {
                        onSuccess: () => toast.success("Berhasil dihapus", { id: toastId }),
                        onError: () => toast.error("Gagal menghapus data", { id: toastId })
                    });
                }
            },
            cancel: { label: "Batal" }
        });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        const errorsObj = {};
        if (!createData.kode_anggaran || !createData.kode_anggaran.trim()) {
            errorsObj.kode_anggaran = 'Harap isi bidang ini.';
        }
        if (!createData.nama_anggaran || !createData.nama_anggaran.trim()) {
            errorsObj.nama_anggaran = 'Harap isi bidang ini.';
        }
        if (createData.nominal === '' || createData.nominal === null || createData.nominal === undefined) {
            errorsObj.nominal = 'Harap isi bidang ini.';
        }

        if (Object.keys(errorsObj).length > 0) {
            setCreateFormErrors(errorsObj);
            toast.error("Gagal Menyimpan (Belum Lengkap)", { description: "Harap lengkapi form input yang belum terisi." });
            return;
        }

        setCreateFormErrors({});
        const toastId = toast.loading("Sedang menyimpan data...");
        post(route('sbo.store'), {
            onSuccess: () => {
                toast.success("Berhasil", { id: toastId, description: `Item SBO berhasil ditambahkan.` });
                setIsCreateModalOpen(false);
                resetCreate();
            },
            onError: () => toast.error("Gagal Menyimpan", { id: toastId, description: "Terdapat kesalahan saat menyimpan data." })
        });
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setEditFormErrors({});
        setEditData({
            kode_anggaran: item.kode_anggaran || '',
            nama_anggaran: item.nama_anggaran || '',
            satuan: item.satuan || '',
            kelompok_anggaran: item.kelompok_anggaran || '',
            nominal: item.nominal || '',
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const errorsObj = {};
        if (!editData.nama_anggaran || !editData.nama_anggaran.trim()) {
            errorsObj.nama_anggaran = 'Harap isi bidang ini.';
        }
        if (editData.nominal === '' || editData.nominal === null || editData.nominal === undefined) {
            errorsObj.nominal = 'Harap isi bidang ini.';
        }

        if (Object.keys(errorsObj).length > 0) {
            setEditFormErrors(errorsObj);
            toast.error("Gagal Memperbarui (Belum Lengkap)", { description: "Harap lengkapi form input yang belum terisi." });
            return;
        }

        setEditFormErrors({});
        const toastId = toast.loading("Sedang memperbarui data...");
        patch(route('sbo.update', editingItem.uuid || editingItem.kode_anggaran), {
            onSuccess: () => {
                toast.success("Berhasil", { id: toastId, description: `Data SBO berhasil diperbarui.` });
                setIsEditModalOpen(false);
                resetEdit();
                setEditingItem(null);
            },
            onError: () => toast.error("Gagal Memperbarui", { id: toastId, description: "Terdapat kesalahan saat memperbarui data." })
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Standar Biaya Operasional (SBO)</h2>}>
            <Head title="SBO" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Standar Biaya Operasional (SBO)
                    </h1>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-yellow-500">

                        {/* Top Bar */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <div className="relative w-full md:w-1/2">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari kode, nama, atau kelompok anggaran..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-10 block w-full h-11 bg-gray-100 border-transparent rounded-lg focus:border-yellow-500 focus:bg-white focus:ring-0 text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>

                            <div className="flex flex-wrap items-center justify-start md:justify-end gap-3 w-full md:w-auto mt-2 md:mt-0">
                                <div className="w-full sm:w-40">
                                    <CustomSelect
                                        value={kelompokFilter}
                                        onChange={(e) => setKelompokFilter(e.target.value)}
                                        options={[
                                            { value: '', label: 'Semua Kelompok' },
                                            ...kelompoks.map(k => ({ value: k, label: k }))
                                        ]}
                                        className="h-11 rounded-lg border-transparent bg-gray-200 dark:bg-gray-700 dark:text-gray-300 focus:border-yellow-500 focus:bg-white focus:ring-0 text-sm"
                                    />
                                </div>
                                {isAdmin() && (
                                    <button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition whitespace-nowrap h-11"
                                    >
                                        <Plus size={16} /> Tambah Item SBO
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Tabel */}
                        <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
                            <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    <tr>
                                        <th className="w-8 border-b border-gray-300 dark:border-gray-600"></th>
                                        <th 
                                            className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('kode_anggaran')}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>Kode Item</span>
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'kode_anggaran' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-indigo-600 dark:text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                        <th 
                                            className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('nama_anggaran')}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>Keterangan</span>
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'nama_anggaran' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-indigo-600 dark:text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                        <th 
                                            className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('satuan')}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>Satuan</span>
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'satuan' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-indigo-600 dark:text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                        <th 
                                            className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('nominal')}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>Pagu Anggaran</span>
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'nominal' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-indigo-600 dark:text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                        {isAdmin() && <th className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Aksi</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length > 0 ? filtered.map((item, index) => {
                                        const currentLetter = item.kode_anggaran ? item.kode_anggaran.charAt(0).toUpperCase() : '';
                                        const prevLetter = index > 0 && filtered[index - 1].kode_anggaran ? filtered[index - 1].kode_anggaran.charAt(0).toUpperCase() : '';
                                        const isNewGroup = currentLetter !== prevLetter;

                                        return (
                                            <tr key={item.kode_anggaran} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                <td className="w-10 px-1 py-3 border-b border-gray-300 dark:border-gray-700 align-middle">
                                                    {isNewGroup && currentLetter && (
                                                        <div className="w-6 h-6 mx-auto bg-yellow-500 text-white font-bold flex items-center justify-center text-xs rounded-sm">
                                                            {currentLetter}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 text-center font-medium text-gray-900 dark:text-white">
                                                    {item.kode_anggaran}
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                                                    {item.nama_anggaran}
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 text-center">
                                                    {item.satuan}
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 whitespace-nowrap text-right">
                                                    {formatRupiah(item.nominal)}
                                                </td>
                                                {isAdmin() && (
                                                    <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 text-center">
                                                        <ActionGroup>
                                                            <ActionButton
                                                                variant="edit"
                                                                tooltip="Edit SBO"
                                                                onClick={() => openEditModal(item)}
                                                            />
                                                            <ActionButton
                                                                variant="delete"
                                                                tooltip="Hapus SBO"
                                                                onClick={() => handleDelete(item.uuid)}
                                                            />
                                                        </ActionGroup>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={isAdmin() ? 6 : 5} className="px-6 py-8 text-center text-sm text-gray-500 border-b border-gray-300">
                                                Tidak ada data item operasional ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {items.links && (
                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Tampilkan</span>
                                        <div className="w-20">
                                            <CustomSelect
                                                value={perPage}
                                                onChange={(e) => setPerPage(e.target.value)}
                                                options={[
                                                    { value: '10', label: '10' },
                                                    { value: '15', label: '15' },
                                                    { value: '25', label: '25' },
                                                    { value: '50', label: '50' },
                                                    { value: '100', label: '100' },
                                                    { value: 'all', label: 'Semua' }
                                                ]}
                                                className="h-8 text-xs py-1 px-2"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Menampilkan <span className="font-medium">{items.from || 0}</span> sampai <span className="font-medium">{items.to || 0}</span> dari <span className="font-medium">{items.total || 0}</span> item
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {items.links.map((link, k) => (
                                        link.url ? (
                                            <Link
                                                key={k}
                                                href={link.url}
                                                className={`px-3 py-1 text-sm border rounded-md transition-colors ${link.active
                                                    ? 'bg-yellow-500 text-white border-yellow-500'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                                                    }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={k}
                                                className="px-3 py-1 text-sm border rounded-md bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Create */}
            <Modal show={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setCreateFormErrors({}); }} maxWidth="2xl">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        Tambah Item SBO Baru
                    </h2>
                </div>
                <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kode Item <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: A.1.1"
                                value={createData.kode_anggaran}
                                onChange={(e) => handleCreateChange('kode_anggaran', e.target.value)}
                                className={`w-full bg-gray-50 border ${(createFormErrors.kode_anggaran || createErrors.kode_anggaran) ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500'} text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                            />
                            <FieldTooltipError message={createFormErrors.kode_anggaran || createErrors.kode_anggaran} />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kelompok Anggaran
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Kelompok A, B, C"
                                value={createData.kelompok_anggaran}
                                onChange={(e) => handleCreateChange('kelompok_anggaran', e.target.value)}
                                className={`w-full bg-gray-50 border ${(createFormErrors.kelompok_anggaran || createErrors.kelompok_anggaran) ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500'} text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                            />
                            <FieldTooltipError message={createFormErrors.kelompok_anggaran || createErrors.kelompok_anggaran} />
                        </div>
                    </div>
                    <div className="relative pb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Keterangan / Deskripsi <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows="3"
                            placeholder="Masukkan keterangan lengkap item SBO"
                            value={createData.nama_anggaran}
                            onChange={(e) => handleCreateChange('nama_anggaran', e.target.value)}
                            className={`w-full bg-gray-50 border ${(createFormErrors.nama_anggaran || createErrors.nama_anggaran) ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500'} text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                        ></textarea>
                        <FieldTooltipError message={createFormErrors.nama_anggaran || createErrors.nama_anggaran} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Satuan
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Paket, Orang, Hari"
                                value={createData.satuan}
                                onChange={(e) => handleCreateChange('satuan', e.target.value)}
                                className={`w-full bg-gray-50 border ${(createFormErrors.satuan || createErrors.satuan) ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500'} text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                            />
                            <FieldTooltipError message={createFormErrors.satuan || createErrors.satuan} />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Pagu Anggaran (Rp) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">Rp</span>
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    value={createData.nominal}
                                    onChange={(e) => handleCreateChange('nominal', e.target.value)}
                                    className={`pl-10 w-full bg-gray-50 border ${(createFormErrors.nominal || createErrors.nominal) ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500'} text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                                />
                            </div>
                            <FieldTooltipError message={createFormErrors.nominal || createErrors.nominal} />
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-3 bg-white dark:bg-gray-800 -mx-6 -mb-6 p-4">
                        <SecondaryButton type="button" onClick={() => { setIsCreateModalOpen(false); setCreateFormErrors({}); }}>Batal</SecondaryButton>
                        <PrimaryButton 
                            disabled={createProcessing} 
                            className="bg-yellow-500 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-lg hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save size={18} />
                            Simpan Item SBO
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit */}
            <Modal show={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditFormErrors({}); }} maxWidth="2xl">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            Edit Item SBO
                        </h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Kode Item: {editingItem?.kode_anggaran}
                        </p>
                    </div>
                </div>
                <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kode Item <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={editData.kode_anggaran}
                                className="w-full bg-yellow-50 border border-gray-300 text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm opacity-70 cursor-not-allowed"
                                disabled
                                readOnly
                            />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Kelompok Anggaran
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Kelompok A, B, C"
                                value={editData.kelompok_anggaran}
                                onChange={(e) => handleEditChange('kelompok_anggaran', e.target.value)}
                                className={`w-full bg-gray-50 border ${(editFormErrors.kelompok_anggaran || editErrors.kelompok_anggaran) ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500'} text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                            />
                            <FieldTooltipError message={editFormErrors.kelompok_anggaran || editErrors.kelompok_anggaran} />
                        </div>
                    </div>
                    <div className="relative pb-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Keterangan / Deskripsi <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows="3"
                            placeholder="Masukkan keterangan lengkap item SBO"
                            value={editData.nama_anggaran}
                            onChange={(e) => handleEditChange('nama_anggaran', e.target.value)}
                            className={`w-full bg-gray-50 border ${(editFormErrors.nama_anggaran || editErrors.nama_anggaran) ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500'} text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                        ></textarea>
                        <FieldTooltipError message={editFormErrors.nama_anggaran || editErrors.nama_anggaran} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Satuan
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Paket, Orang, Hari"
                                value={editData.satuan}
                                onChange={(e) => handleEditChange('satuan', e.target.value)}
                                className={`w-full bg-gray-50 border ${(editFormErrors.satuan || editErrors.satuan) ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500'} text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                            />
                            <FieldTooltipError message={editFormErrors.satuan || editErrors.satuan} />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Pagu Anggaran (Rp) <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">Rp</span>
                                </div>
                                <input
                                    type="number"
                                    min="0"
                                    value={editData.nominal}
                                    onChange={(e) => handleEditChange('nominal', e.target.value)}
                                    className={`pl-10 w-full bg-gray-50 border ${(editFormErrors.nominal || editErrors.nominal) ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : 'border-gray-300 focus:ring-yellow-500 focus:border-yellow-500'} text-gray-900 rounded-lg p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                                />
                            </div>
                            <FieldTooltipError message={editFormErrors.nominal || editErrors.nominal} />
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-3 bg-white dark:bg-gray-800 -mx-6 -mb-6 p-4">
                        <SecondaryButton type="button" onClick={() => { setIsEditModalOpen(false); setEditFormErrors({}); }}>Batal</SecondaryButton>
                        <PrimaryButton 
                            disabled={editProcessing} 
                            className="bg-yellow-500 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-lg hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <Save size={18} />
                            Simpan Perubahan
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}