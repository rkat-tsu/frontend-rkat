import React, { useState, useEffect } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CustomSelect from '@/Components/CustomSelect';
import { Search, Plus, ChevronDown, CheckCircle, XCircle, Edit2, Trash2 } from 'lucide-react';

export default function Index({ users, filters = {}, units = [] }) {
    const { props } = usePage();
    const authUser = props?.auth?.user;
    
    const [searchTerm, setSearchTerm] = useState(filters.q || '');
    const [selectedUnit, setSelectedUnit] = useState(filters.unit || '');

    // Debounced Search & Filter
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== (filters.q || '') || selectedUnit !== (filters.unit || '')) {
                router.get(
                    route('user.index'),
                    { q: searchTerm, unit: selectedUnit },
                    { preserveState: true, preserveScroll: true, replace: true }
                );
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, selectedUnit]);

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
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Pengaturan Akun Pengguna
                    </h1>

                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-blue-500">
                        
                        {/* Top Bar: Search, Filter, & Tambah Button */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <div className="relative w-full md:w-1/2">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="w-5 h-5 text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Cari nama, email, atau peran..." 
                                    value={searchTerm} 
                                    onChange={(e) => setSearchTerm(e.target.value)} 
                                    className="pl-10 h-11 block w-full bg-gray-100 border-transparent rounded-lg focus:border-blue-500 focus:bg-white focus:ring-0 text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="w-48">
                                    <CustomSelect
                                        value={selectedUnit}
                                        onChange={(e) => setSelectedUnit(e.target.value)}
                                        options={unitOptions}
                                        placeholder="Semua Unit"
                                        className="h-11 rounded-lg border-transparent bg-gray-200 dark:bg-gray-700 dark:text-gray-300 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white focus:ring-0 text-sm"
                                    />
                                </div>
                                
                                {authUser?.peran === 'Admin' && (
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
                            Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{filtered.length}</span> data pengguna
                        </div>

                        {/* Tabel */}
                        <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
                            <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-gray-300 dark:border-gray-600 font-medium">Nama</th>
                                        <th className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">NIK</th>
                                        <th className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Email / Username</th>
                                        <th className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Peran</th>
                                        <th className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Unit ID</th>
                                        <th className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Unit</th>
                                        <th className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Status</th>
                                        <th className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length > 0 ? (
                                        filtered.map(user => (
                                            <tr key={user.id_user} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                <td className="px-4 py-3 border-b border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                                                    {user.nama_lengkap}
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                                                    {user.nik || '-'}
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700">
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-900 dark:text-gray-200">{user.email}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{user.username || '-'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 text-center">
                                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                                        user.peran === 'Admin' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                    }`}>
                                                        {user.peran}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 text-center">
                                                    {user.unit?.id_unit ?? user.id_unit ?? '-'}
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700">
                                                    {user.unit?.nama_unit || '-'}
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 text-center">
                                                    <div className="flex items-center justify-center">
                                                        {user.is_aktif ? (
                                                            <CheckCircle className="w-5 h-5 text-green-500" title="Aktif" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-red-500" title="Tidak Aktif" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Link
                                                            href={route('user.edit', user.uuid)}
                                                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                                                            title="Edit User"
                                                        >
                                                            <Edit2 className="w-4 h-4" /> 
                                                        </Link>
                                                        
                                                        {authUser?.id_user !== user.id_user && (
                                                            <Link
                                                                as="button"
                                                                method="delete"
                                                                href={route('user.destroy', user.uuid)}
                                                                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                                                onClick={(e) => {
                                                                    if (!confirm('Apakah Anda yakin ingin menghapus user ini?')) {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                title="Hapus User"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500 border-b border-gray-300">
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
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Menampilkan <span className="font-medium">{users.from || 0}</span> sampai <span className="font-medium">{users.to || 0}</span> dari <span className="font-medium">{users.total || 0}</span> akun
                                </p>
                                
                                <div className="flex flex-wrap gap-2">
                                    {users.links.map((link, k) => (
                                        link.url ? (
                                            <Link
                                                key={k}
                                                href={link.url}
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