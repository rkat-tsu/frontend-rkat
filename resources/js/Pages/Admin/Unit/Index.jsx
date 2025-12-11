import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function Index({ units = [] }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter units berdasarkan searchTerm
    const filteredUnits = units.filter(unit =>
        unit.nama_unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.kode_unit?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unit.tipe_unit?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus unit ini?')) {
            router.delete(route('unit.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={null}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Semua Unit
                    </h2>
                </div>
            }
        >
            <Head title="Semua Unit" />

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg overflow-hidden">
                        {/* Search Bar */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2 rounded-md px-3 py-2">
                                <Search size={18} className="text-gray-400 " />
                                <TextInput
                                    type="text"
                                    placeholder="Search"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-gray-100 dark:bg-gray-900 border-0 flex-1"
                                />
                                <Link href="/unit/create">
                                    <PrimaryButton className="flex items-center gap-2">
                                        <Plus size={18} />
                                        Tambah
                                    </PrimaryButton>
                                </Link>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Unit
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Biro Unit
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Nama Unit
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Akun
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filteredUnits.length > 0 ? (
                                        filteredUnits.map((unit) => (
                                            <tr key={unit.id_unit} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {unit.kode_unit}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {unit.tipe_unit || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                                    {unit.nama_unit}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {unit.kepala?.nama_lengkap || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                    <Link href={route('unit.edit', unit.id_unit)} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition">
                                                        <Edit2 size={14} />
                                                        Edit
                                                    </Link>
                                                    <button onClick={() => handleDelete(unit.id_unit)} className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition">
                                                        <Trash2 size={14} />
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                Tidak ada data unit
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
