import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CustomSelect from '@/Components/CustomSelect';
import StatusBadge from '@/Components/StatusBadge';
import ActionButton, { ActionGroup } from '@/Components/ActionButton';
import { Search, Plus, Edit2, Trash2, CheckCircle, XCircle, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { usePermission } from '@/hooks/usePermission';
import { toast } from 'sonner';

export default function Index({ users, filters = {}, units = [] }) {
    const { isAdmin, user: authUser } = usePermission();
    
    const [searchTerm, setSearchTerm] = useState(filters?.q || '');
    const [selectedUnit, setSelectedUnit] = useState(filters?.unit || '');
    const [perPage, setPerPage] = useState(filters?.per_page || '15');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'nama_lengkap');
    const [sortDirection, setSortDirection] = useState(filters?.sort_direction || 'asc');

    const applyFilters = (q, unit, pp, sb = sortBy, sd = sortDirection) => {
        router.get(
            route('user.index'),
            { q, unit, per_page: pp, sort_by: sb, sort_direction: sd },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleSort = (field) => {
        const newDirection = (sortBy === field && sortDirection === 'asc') ? 'desc' : 'asc';
        setSortBy(field);
        setSortDirection(newDirection);
        applyFilters(searchTerm, selectedUnit, perPage, field, newDirection);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyFilters(searchTerm, selectedUnit, perPage, sortBy, sortDirection);
        }
    };

    // Unit dan perPage langsung trigger (tidak perlu debounce)
    const handleUnitChange = (val) => {
        setSelectedUnit(val);
        applyFilters(searchTerm, val, perPage, sortBy, sortDirection);
    };

    const handlePerPageChange = (val) => {
        setPerPage(val);
        applyFilters(searchTerm, selectedUnit, val, sortBy, sortDirection);
    };

    const unitOptions = [
        { value: '', label: 'Semua Unit' },
        ...units.map(u => ({ value: u.id_unit, label: u.nama_unit }))
    ];

    const filtered = users.data || [];

    return (
        <AuthenticatedLayout
            user={authUser}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pengaturan Akun</h2>}
        >
            <Head title="Pengaturan Akun" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Pengaturan Akun Pengguna
                    </h1>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-blue-500">
                        
                        {/* Top Bar: Search, Filter, & Tambah Button */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <div className="relative w-full md:flex-1 max-w-xl">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="w-5 h-5 text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Cari nama, email, atau peran..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    onKeyDown={handleSearchKeyDown}
                                    className="pl-10 h-11 block w-full bg-gray-100 border-transparent rounded-lg focus:border-blue-500 focus:bg-white focus:ring-0 text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="w-48">
                                    <CustomSelect
                                        value={selectedUnit}
                                        onChange={(e) => handleUnitChange(e.target.value)}
                                        options={unitOptions}
                                        placeholder="Semua Unit"
                                        className="h-11 rounded-lg border-transparent bg-gray-200 dark:bg-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white focus:ring-0 text-sm"
                                    />
                                </div>
                                
                                {isAdmin() && (
                                    <Link 
                                        href={route('user.create')} 
                                        className="h-11 flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition whitespace-nowrap"
                                    >
                                        <Plus size={16} /> Tambah User
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Record Count */}
                        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                            Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{users.from || 0}</span> sampai <span className="font-semibold text-gray-900 dark:text-white">{users.to || 0}</span> dari <span className="font-semibold text-gray-900 dark:text-white">{users.total || 0}</span> akun
                        </div>

                        {/* Tabel */}
                        <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
                            <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-gray-300 dark:border-gray-600 font-medium text-center w-12">No</th>
                                        <th 
                                            className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('nama_lengkap')}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>Nama Lengkap</span>
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'nama_lengkap' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-blue-600 dark:text-blue-400" /> : <ArrowDown size={14} className="text-blue-600 dark:text-blue-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                        <th 
                                            className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('nik')}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>NIK</span>
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'nik' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-blue-600 dark:text-blue-400" /> : <ArrowDown size={14} className="text-blue-600 dark:text-blue-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                        <th 
                                            className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('email')}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>Email</span>
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'email' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-blue-600 dark:text-blue-400" /> : <ArrowDown size={14} className="text-blue-600 dark:text-blue-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                        <th 
                                            className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('peran')}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>Peran / Unit</span>
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'peran' || sortBy === 'unit' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-blue-600 dark:text-blue-400" /> : <ArrowDown size={14} className="text-blue-600 dark:text-blue-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                        <th 
                                            className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('is_aktif')}
                                        >
                                            <div className="flex items-center justify-center">
                                                <span>Status</span>
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'is_aktif' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-blue-600 dark:text-blue-400" /> : <ArrowDown size={14} className="text-blue-600 dark:text-blue-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                        <th className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length > 0 ? (
                                        filtered.map((user, index) => (
                                            <tr key={user.id_user} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                <td className="px-4 py-3 border-b border-gray-300 dark:border-gray-700 text-center text-gray-500 text-sm">
                                                    {(users.from || 1) + index}
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                                                    {user.nama_lengkap}
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 text-center text-gray-800 dark:text-gray-200">
                                                    {user.nik || '-'}
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900 dark:text-gray-200">{user.email}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{user.username || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700">
                                                    <div className="flex flex-col gap-1">
                                                        <div>
                                                            <span className={`px-2.5 py-0.5 text-xs rounded-md font-medium whitespace-nowrap inline-flex ${
                                                                user.peran === 'Admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                            }`}>
                                                                {user.peran.replace(/_/g, ' ')}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                            {user.unit?.nama_unit || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 text-center">
                                                    <StatusBadge status={user.is_aktif ? 'Aktif' : 'Non-Aktif'} size="sm" />
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 text-center">
                                                    <ActionGroup>
                                                        <ActionButton
                                                            variant="edit"
                                                            tooltip="Edit User"
                                                            href={route('user.edit', user.uuid)}
                                                        />
                                                        
                                                        {authUser?.id_user !== user.id_user && (
                                                            <ActionButton
                                                                variant="delete"
                                                                tooltip="Hapus User"
                                                                onClick={() => {
                                                                    toast.warning("Konfirmasi Hapus", {
                                                                        description: "Yakin ingin menghapus user ini?",
                                                                        action: {
                                                                            label: "Ya, Hapus",
                                                                            onClick: () => {
                                                                                const toastId = toast.loading("Sedang menghapus...");
                                                                                router.delete(route('user.destroy', user.uuid), {
                                                                                    onSuccess: () => toast.success("Berhasil dihapus", { id: toastId }),
                                                                                    onError: () => toast.error("Gagal menghapus", { id: toastId })
                                                                                });
                                                                            }
                                                                        },
                                                                        cancel: { label: "Batal" }
                                                                    });
                                                                }}
                                                            />
                                                        )}
                                                    </ActionGroup>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-sm text-gray-500 border-b border-gray-300">
                                                Tidak ada data akun pengguna ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION SECTION */}
                        {users.links && Array.isArray(users.links) && (
                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Tampilkan</span>
                                        <div className="w-20">
                                            <CustomSelect
                                                value={perPage}
                                                onChange={(e) => handlePerPageChange(e.target.value)}
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
                                        Menampilkan <span className="font-medium text-gray-900 dark:text-white">{users.from || 0}</span> sampai <span className="font-medium text-gray-900 dark:text-white">{users.to || 0}</span> dari <span className="font-medium text-gray-900 dark:text-white">{users.total || 0}</span> akun
                                    </p>
                                </div>
                                
                                <div className="flex flex-wrap gap-2">
                                    {users.links.map((link, k) => (
                                        link.url ? (
                                            <Link
                                                key={k}
                                                href={link.url}
                                                preserveScroll
                                                preserveState
                                                className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white border-blue-600'
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
        </AuthenticatedLayout>
    );
}