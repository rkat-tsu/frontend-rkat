import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionButton, { ActionGroup } from '@/Components/ActionButton';
import { Edit2, Trash2, Search, Plus, Save, ArrowUp, ArrowDown, ArrowUpDown, Loader2, X, Users, UserCheck, Phone, Mail, Building2, Briefcase } from 'lucide-react';
import CustomSelect from '@/Components/CustomSelect';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/usePermission';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import FieldTooltipError from '@/Components/FieldTooltipError';

export default function Index({ auth, karyawans = {}, units = [], filters = {} }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [unitFilter, setUnitFilter] = useState(filters?.unit_id || '');
    const [statusPegawaiFilter, setStatusPegawaiFilter] = useState(filters?.status_pegawai || '');
    const [statusAktifFilter, setStatusAktifFilter] = useState(filters?.status_aktif || '');
    const [perPage, setPerPage] = useState(filters?.per_page || '15');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'nama');
    const [sortDirection, setSortDirection] = useState(filters?.sort_direction || 'asc');
    const [isSearching, setIsSearching] = useState(false);

    const { isAdmin } = usePermission();

    const applyFilters = (newSearch, newUnit, newStatusPegawai, newStatusAktif, newPerPage, newSortBy = sortBy, newSortDirection = sortDirection) => {
        setIsSearching(true);
        router.get(
            route('karyawan.index'),
            { 
                search: newSearch, 
                unit_id: newUnit, 
                status_pegawai: newStatusPegawai, 
                status_aktif: newStatusAktif, 
                per_page: newPerPage, 
                sort_by: newSortBy, 
                sort_direction: newSortDirection 
            },
            { 
                preserveState: true, 
                preserveScroll: true, 
                replace: true,
                onFinish: () => setIsSearching(false)
            }
        );
    };

    const handleSort = (field) => {
        const newDirection = (sortBy === field && sortDirection === 'asc') ? 'desc' : 'asc';
        setSortBy(field);
        setSortDirection(newDirection);
        applyFilters(searchTerm, unitFilter, statusPegawaiFilter, statusAktifFilter, perPage, field, newDirection);
    };

    const handleInstantSearch = () => {
        applyFilters(searchTerm, unitFilter, statusPegawaiFilter, statusAktifFilter, perPage, sortBy, sortDirection);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        applyFilters('', unitFilter, statusPegawaiFilter, statusAktifFilter, perPage, sortBy, sortDirection);
    };

    // Debounce search input
    useEffect(() => {
        if (searchTerm === (filters?.search || '')) return;

        setIsSearching(true);
        const timeoutId = setTimeout(() => {
            applyFilters(searchTerm, unitFilter, statusPegawaiFilter, statusAktifFilter, perPage, sortBy, sortDirection);
        }, 650);

        return () => {
            clearTimeout(timeoutId);
            setIsSearching(false);
        };
    }, [searchTerm]);

    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingKaryawan, setEditingKaryawan] = useState(null);
    const [createFormErrors, setCreateFormErrors] = useState({});
    const [editFormErrors, setEditFormErrors] = useState({});

    const { data: createData, setData: setCreateData, post, processing: createProcessing, errors: createErrors, reset: resetCreate } = useForm({
        nik: '',
        nama: '',
        email: '',
        no_telepon: '',
        id_unit: '',
        jabatan: '',
        status_pegawai: 'Tetap',
        is_aktif: true,
    });

    const { data: editData, setData: setEditData, patch, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        nik: '',
        nama: '',
        email: '',
        no_telepon: '',
        id_unit: '',
        jabatan: '',
        status_pegawai: 'Tetap',
        is_aktif: true,
    });

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

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        const errorsObj = {};
        if (!createData.nama || !createData.nama.trim()) {
            errorsObj.nama = 'Nama lengkap wajib diisi.';
        }
        if (!createData.status_pegawai) {
            errorsObj.status_pegawai = 'Status kepegawaian wajib dipilih.';
        }

        if (Object.keys(errorsObj).length > 0) {
            setCreateFormErrors(errorsObj);
            toast.error("Form Belum Lengkap", { description: "Harap periksa kolom yang wajib diisi." });
            return;
        }

        setCreateFormErrors({});
        const toastId = toast.loading("Menyimpan data SDM...");
        post(route('karyawan.store'), {
            onSuccess: () => {
                toast.success("Berhasil", { id: toastId, description: `Data SDM ${createData.nama} berhasil ditambahkan.` });
                setIsCreateModalOpen(false);
                resetCreate();
            },
            onError: () => toast.error("Gagal Menyimpan", { id: toastId, description: "Terdapat kesalahan saat menyimpan data." })
        });
    };

    const openEditModal = (item) => {
        setEditingKaryawan(item);
        setEditFormErrors({});
        setEditData({
            nik: item.nik || '',
            nama: item.nama || '',
            email: item.email || '',
            no_telepon: item.no_telepon || '',
            id_unit: item.id_unit ? String(item.id_unit) : '',
            jabatan: item.jabatan || '',
            status_pegawai: item.status_pegawai || 'Tetap',
            is_aktif: item.is_aktif ?? true,
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const errorsObj = {};
        if (!editData.nama || !editData.nama.trim()) {
            errorsObj.nama = 'Nama lengkap wajib diisi.';
        }

        if (Object.keys(errorsObj).length > 0) {
            setEditFormErrors(errorsObj);
            toast.error("Form Belum Lengkap", { description: "Harap periksa kolom yang wajib diisi." });
            return;
        }

        setEditFormErrors({});
        const toastId = toast.loading("Memperbarui data SDM...");
        patch(route('karyawan.update', editingKaryawan.uuid || editingKaryawan.id_karyawan), {
            onSuccess: () => {
                toast.success("Berhasil", { id: toastId, description: `Data SDM berhasil diperbarui.` });
                setIsEditModalOpen(false);
                resetEdit();
                setEditingKaryawan(null);
            },
            onError: () => toast.error("Gagal Memperbarui", { id: toastId, description: "Terdapat kesalahan saat memperbarui data." })
        });
    };

    const handleDelete = (item) => {
        toast.warning("Konfirmasi Hapus", {
            description: `Apakah Anda yakin ingin menghapus data SDM "${item.nama}"?`,
            action: {
                label: "Ya, Hapus",
                onClick: () => {
                    const toastId = toast.loading("Sedang menghapus...");
                    router.delete(route('karyawan.destroy', item.uuid || item.id_karyawan), {
                        onSuccess: () => toast.success("Berhasil dihapus", { id: toastId }),
                        onError: () => toast.error("Gagal menghapus data", { id: toastId })
                    });
                }
            },
            cancel: { label: "Batal" }
        });
    };

    const items = karyawans.data || [];

    const statusOptions = [
        { value: '', label: 'Semua Status Pegawai' },
        { value: 'Tetap', label: 'Tetap' },
        { value: 'Kontrak', label: 'Kontrak' },
        { value: 'Dosen Tetap', label: 'Dosen Tetap' },
        { value: 'Dosen LB', label: 'Dosen Luar Biasa (LB)' },
        { value: 'Tendik', label: 'Tenaga Kependidikan (Tendik)' },
        { value: 'Honorer', label: 'Honorer' },
        { value: 'Lainnya', label: 'Lainnya' },
    ];

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Data SDM / Karyawan</h2>}>
            <Head title="Data SDM / Karyawan" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 space-y-6">

                    {/* Header Judul & Tombol Tambah */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Users className="text-teal-600 dark:text-teal-400" size={32} />
                                Data SDM / Karyawan
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Master database profil dosen, staf, dan tenaga kependidikan untuk rujukan PIC kegiatan RKA.
                            </p>
                        </div>
                        {isAdmin() && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-teal-600/20"
                            >
                                <Plus size={18} /> Tambah Data SDM
                            </button>
                        )}
                    </div>

                    {/* Filter Card */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-5 border border-gray-100 dark:border-gray-700 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Search Box */}
                            <div className="relative col-span-1 sm:col-span-2">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    {isSearching ? (
                                        <Loader2 size={18} className="text-teal-500 animate-spin" />
                                    ) : (
                                        <Search size={18} className="text-gray-400" />
                                    )}
                                </div>
                                <input
                                    type="text"
                                    className="pl-10 pr-10 h-11 block w-full bg-gray-50 border-gray-200 rounded-xl focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all"
                                    placeholder="Cari nama, NIK, jabatan, email... (Enter untuk cari)"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleInstantSearch();
                                        }
                                    }}
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        title="Hapus pencarian"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Filter Unit Kerja */}
                            <div>
                                <CustomSelect
                                    value={unitFilter}
                                    onChange={(e) => {
                                        setUnitFilter(e.target.value);
                                        applyFilters(searchTerm, e.target.value, statusPegawaiFilter, statusAktifFilter, perPage, sortBy, sortDirection);
                                    }}
                                    options={[
                                        { value: '', label: 'Semua Unit Kerja' },
                                        ...units.map(u => ({ value: String(u.id_unit), label: `${u.kode_unit} - ${u.nama_unit}` }))
                                    ]}
                                    placeholder="Pilih Unit Kerja"
                                    className="h-11 w-full text-sm"
                                />
                            </div>

                            {/* Filter Status Pegawai */}
                            <div>
                                <CustomSelect
                                    value={statusPegawaiFilter}
                                    onChange={(e) => {
                                        setStatusPegawaiFilter(e.target.value);
                                        applyFilters(searchTerm, unitFilter, e.target.value, statusAktifFilter, perPage, sortBy, sortDirection);
                                    }}
                                    options={statusOptions}
                                    placeholder="Pilih Status"
                                    className="h-11 w-full text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                                <thead className="bg-gray-50/80 dark:bg-gray-750 text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 font-semibold">
                                    <tr>
                                        <th className="w-12 px-4 py-3.5 text-center">No</th>
                                        <th 
                                            className="px-4 py-3.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition select-none"
                                            onClick={() => handleSort('nama')}
                                        >
                                            <div className="flex items-center gap-1">
                                                <span>Nama Lengkap & NIK</span>
                                                {sortBy === 'nama' && (
                                                    sortDirection === 'asc' ? <ArrowUp size={14} className="text-teal-600" /> : <ArrowDown size={14} className="text-teal-600" />
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-3.5">Unit Kerja</th>
                                        <th 
                                            className="px-4 py-3.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition select-none"
                                            onClick={() => handleSort('jabatan')}
                                        >
                                            <div className="flex items-center gap-1">
                                                <span>Jabatan / Posisi</span>
                                                {sortBy === 'jabatan' && (
                                                    sortDirection === 'asc' ? <ArrowUp size={14} className="text-teal-600" /> : <ArrowDown size={14} className="text-teal-600" />
                                                )}
                                            </div>
                                        </th>
                                        <th className="px-4 py-3.5">Status Pegawai</th>
                                        <th className="px-4 py-3.5 text-center">Status</th>
                                        {isAdmin() && <th className="px-4 py-3.5 text-center w-28">Aksi</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {items.length > 0 ? items.map((item, idx) => (
                                        <tr key={item.id_karyawan} className="hover:bg-teal-50/30 dark:hover:bg-gray-750/50 transition">
                                            <td className="px-4 py-3.5 text-center text-gray-400 font-medium">
                                                {(karyawans.from || 1) + idx}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    {item.nama}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                                    {item.nik && <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">NIK: {item.nik}</span>}
                                                    {item.email && (
                                                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                                                            <Mail size={12} /> {item.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {item.unit ? (
                                                    <div>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{item.unit.nama_unit}</span>
                                                        <span className="text-xs text-gray-400 ml-1">({item.unit.kode_unit})</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300">
                                                {item.jabatan || '-'}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                                    {item.status_pegawai}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${item.is_aktif ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                                    {item.is_aktif ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            {isAdmin() && (
                                                <td className="px-4 py-3.5 text-center">
                                                    <ActionGroup>
                                                        <ActionButton
                                                            variant="edit"
                                                            tooltip="Edit Data SDM"
                                                            onClick={() => openEditModal(item)}
                                                        />
                                                        <ActionButton
                                                            variant="delete"
                                                            tooltip="Hapus Data SDM"
                                                            onClick={() => handleDelete(item)}
                                                        />
                                                    </ActionGroup>
                                                </td>
                                            )}
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={isAdmin() ? 7 : 6} className="px-6 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Users size={36} className="text-gray-300 dark:text-gray-600" />
                                                    <p className="text-sm">Tidak ada data SDM / Karyawan yang sesuai.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {karyawans.links && (
                            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <span>Tampilkan</span>
                                        <div className="w-20">
                                            <CustomSelect
                                                value={perPage}
                                                onChange={(e) => {
                                                    setPerPage(e.target.value);
                                                    applyFilters(searchTerm, unitFilter, statusPegawaiFilter, statusAktifFilter, e.target.value, sortBy, sortDirection);
                                                }}
                                                options={[
                                                    { value: '10', label: '10' },
                                                    { value: '15', label: '15' },
                                                    { value: '25', label: '25' },
                                                    { value: '50', label: '50' },
                                                    { value: 'all', label: 'Semua' }
                                                ]}
                                                className="h-8 text-xs py-1 px-2"
                                            />
                                        </div>
                                    </div>
                                    <span>
                                        Menampilkan <span className="font-bold text-gray-700 dark:text-gray-300">{karyawans.from || 0}</span> - <span className="font-bold text-gray-700 dark:text-gray-300">{karyawans.to || 0}</span> dari <span className="font-bold text-gray-700 dark:text-gray-300">{karyawans.total || 0}</span> data
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {karyawans.links.map((link, k) => (
                                        link.url ? (
                                            <Link
                                                key={k}
                                                href={link.url}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${link.active
                                                    ? 'bg-teal-600 text-white shadow-sm'
                                                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={k}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
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

            {/* Modal Tambah SDM */}
            <Modal show={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setCreateFormErrors({}); }} maxWidth="2xl">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Plus className="text-teal-600" size={20} /> Tambah Data SDM / Karyawan
                    </h2>
                </div>
                <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nama Lengkap & Gelar <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Dr. Ir. Budi Santoso, M.Kom."
                                value={createData.nama}
                                onChange={(e) => handleCreateChange('nama', e.target.value)}
                                className={`w-full bg-gray-50 border ${(createFormErrors.nama || createErrors.nama) ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-200 focus:ring-teal-500 focus:border-teal-500'} text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm`}
                            />
                            <FieldTooltipError message={createFormErrors.nama || createErrors.nama} />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                NIK / NIDN / NIP
                            </label>
                            <input
                                type="text"
                                placeholder="Nomor Induk Karyawan"
                                value={createData.nik}
                                onChange={(e) => handleCreateChange('nik', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Unit Kerja / Penempatan
                            </label>
                            <CustomSelect
                                value={createData.id_unit}
                                onChange={(e) => handleCreateChange('id_unit', e.target.value)}
                                options={[
                                    { value: '', label: '-- Pilih Unit Kerja --' },
                                    ...units.map(u => ({ value: String(u.id_unit), label: `${u.kode_unit} - ${u.nama_unit}` }))
                                ]}
                                placeholder="Pilih Unit Kerja"
                                className="h-10 text-sm"
                            />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Jabatan / Posisi
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Dosen / Ka. Lab / Staf Keuangan"
                                value={createData.jabatan}
                                onChange={(e) => handleCreateChange('jabatan', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status Kepegawaian <span className="text-red-500">*</span>
                            </label>
                            <CustomSelect
                                value={createData.status_pegawai}
                                onChange={(e) => handleCreateChange('status_pegawai', e.target.value)}
                                options={statusOptions.filter(o => o.value !== '')}
                                placeholder="Pilih Status"
                                className="h-10 text-sm"
                            />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status Keaktifan
                            </label>
                            <div className="flex items-center gap-4 mt-2">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={createData.is_aktif} 
                                        onChange={e => handleCreateChange('is_aktif', e.target.checked)}
                                        className="rounded border-gray-300 text-teal-600 shadow-sm focus:ring-teal-500" 
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Pegawai Aktif</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="email@tsu.ac.id"
                                value={createData.email}
                                onChange={(e) => handleCreateChange('email', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                No. Telepon / WhatsApp
                            </label>
                            <input
                                type="text"
                                placeholder="08xxxxxxxxxx"
                                value={createData.no_telepon}
                                onChange={(e) => handleCreateChange('no_telepon', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 bg-gray-50 dark:bg-gray-750 -mx-6 -mb-6 p-4 rounded-b-xl border-t border-gray-100 dark:border-gray-700">
                        <SecondaryButton type="button" onClick={() => { setIsCreateModalOpen(false); setCreateFormErrors({}); }}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton 
                            disabled={createProcessing} 
                            className="bg-teal-600 hover:bg-teal-700 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-md"
                        >
                            <Save size={18} /> Simpan Data SDM
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Edit SDM */}
            <Modal show={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditFormErrors({}); }} maxWidth="2xl">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Edit2 className="text-teal-600" size={20} /> Edit Data SDM / Karyawan
                    </h2>
                </div>
                <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nama Lengkap & Gelar <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Dr. Ir. Budi Santoso, M.Kom."
                                value={editData.nama}
                                onChange={(e) => handleEditChange('nama', e.target.value)}
                                className={`w-full bg-gray-50 border ${(editFormErrors.nama || editErrors.nama) ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-200 focus:ring-teal-500 focus:border-teal-500'} text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm`}
                            />
                            <FieldTooltipError message={editFormErrors.nama || editErrors.nama} />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                NIK / NIDN / NIP
                            </label>
                            <input
                                type="text"
                                placeholder="Nomor Induk Karyawan"
                                value={editData.nik}
                                onChange={(e) => handleEditChange('nik', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Unit Kerja / Penempatan
                            </label>
                            <CustomSelect
                                value={editData.id_unit}
                                onChange={(e) => handleEditChange('id_unit', e.target.value)}
                                options={[
                                    { value: '', label: '-- Pilih Unit Kerja --' },
                                    ...units.map(u => ({ value: String(u.id_unit), label: `${u.kode_unit} - ${u.nama_unit}` }))
                                ]}
                                placeholder="Pilih Unit Kerja"
                                className="h-10 text-sm"
                            />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Jabatan / Posisi
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Dosen / Ka. Lab / Staf Keuangan"
                                value={editData.jabatan}
                                onChange={(e) => handleEditChange('jabatan', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status Kepegawaian <span className="text-red-500">*</span>
                            </label>
                            <CustomSelect
                                value={editData.status_pegawai}
                                onChange={(e) => handleEditChange('status_pegawai', e.target.value)}
                                options={statusOptions.filter(o => o.value !== '')}
                                placeholder="Pilih Status"
                                className="h-10 text-sm"
                            />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status Keaktifan
                            </label>
                            <div className="flex items-center gap-4 mt-2">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={editData.is_aktif} 
                                        onChange={e => handleEditChange('is_aktif', e.target.checked)}
                                        className="rounded border-gray-300 text-teal-600 shadow-sm focus:ring-teal-500" 
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Pegawai Aktif</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="email@tsu.ac.id"
                                value={editData.email}
                                onChange={(e) => handleEditChange('email', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                No. Telepon / WhatsApp
                            </label>
                            <input
                                type="text"
                                placeholder="08xxxxxxxxxx"
                                value={editData.no_telepon}
                                onChange={(e) => handleEditChange('no_telepon', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 bg-gray-50 dark:bg-gray-750 -mx-6 -mb-6 p-4 rounded-b-xl border-t border-gray-100 dark:border-gray-700">
                        <SecondaryButton type="button" onClick={() => { setIsEditModalOpen(false); setEditFormErrors({}); }}>
                            Batal
                        </SecondaryButton>
                        <PrimaryButton 
                            disabled={editProcessing} 
                            className="bg-teal-600 hover:bg-teal-700 flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-bold text-white rounded-xl shadow-md"
                        >
                            <Save size={18} /> Simpan Perubahan
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
