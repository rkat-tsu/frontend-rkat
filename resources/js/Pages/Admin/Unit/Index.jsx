import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import CustomSelect from '@/Components/CustomSelect';
import { Plus, Search, Edit2, Trash2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

export default function Index({ units = [] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTipe, setSelectedTipe] = useState('');
    const [selectedParent, setSelectedParent] = useState('');
    const [selectedJalur, setSelectedJalur] = useState('');

    // Extract unique filter values
    const uniqueTipes = [...new Set(units.map(u => u.tipe_unit).filter(Boolean))].sort();
    const tipeOptions = [
        { value: '', label: 'Semua Tipe Unit' },
        ...uniqueTipes.map(t => ({ value: t, label: t }))
    ];

    const uniqueJalurs = [...new Set(units.map(u => u.jalur_persetujuan).filter(Boolean))].sort();
    const jalurOptions = [
        { value: '', label: 'Semua Jalur Persetujuan' },
        ...uniqueJalurs.map(j => ({ value: j, label: j === 'akademik' ? 'Akademik' : j === 'non-akademik' ? 'Non-Akademik' : j }))
    ];
    
    // Parent unit mapping
    const uniqueParentIds = [...new Set(units.map(u => u.parent_id).filter(Boolean))];
    const parentOptions = [
        { value: '', label: 'Semua Unit Induk' },
        ...uniqueParentIds.map(id => {
            const p = units.find(u => u.id_unit === id);
            return { value: id, label: p ? p.nama_unit : `ID: ${id}` };
        }).sort((a, b) => a.label.localeCompare(b.label))
    ];

    // Filter and sort units
    const filteredUnits = units.filter(unit => {
        const q = searchTerm.toLowerCase();
        const matchesSearch = unit.nama_unit?.toLowerCase().includes(q) ||
            unit.kode_unit?.toLowerCase().includes(q) ||
            unit.tipe_unit?.toLowerCase().includes(q);
            
        const matchesTipe = selectedTipe === '' || unit.tipe_unit === selectedTipe;
        const matchesParent = selectedParent === '' || String(unit.parent_id) === String(selectedParent);
        const matchesJalur = selectedJalur === '' || unit.jalur_persetujuan === selectedJalur;
        
        return matchesSearch && matchesTipe && matchesParent && matchesJalur;
    }).sort((a, b) => (a.kode_unit || '').localeCompare(b.kode_unit || '', undefined, { numeric: true, sensitivity: 'base' }));

    const handleDelete = (id) => {
        toast.warning("Konfirmasi Hapus", {
            description: "Apakah Anda yakin ingin menghapus unit kerja ini?",
            action: {
                label: "Ya, Hapus",
                onClick: () => {
                    const toastId = toast.loading("Sedang menghapus...");
                    router.delete(route('unit.destroy', id), {
                        onSuccess: () => toast.success("Berhasil Dihapus", { id: toastId, description: "Unit kerja berhasil dihapus." }),
                        onError: () => toast.error("Gagal Menghapus", { id: toastId, description: "Terdapat kesalahan saat menghapus data." })
                    });
                }
            },
            cancel: {
                label: "Batal",
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={null}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Data Unit Kerja</h2>}
        >
            <Head title="Semua Unit" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Data Unit Kerja
                    </h1>

                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-yellow-500">
                        
                        {/* Top Bar: Search, Filters, & Tambah Button */}
                        <div className="flex flex-col xl:flex-row justify-between items-center gap-4 mb-4">
                            <div className="relative w-full xl:w-1/4">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="w-5 h-5 text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Cari unit atau kode..." 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    className="pl-10 h-11 block w-full bg-gray-100 border-transparent rounded-lg focus:border-yellow-500 focus:bg-white focus:ring-0 text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
                                <div className="w-[140px]">
                                    <CustomSelect
                                        value={selectedTipe}
                                        onChange={(e) => setSelectedTipe(e.target.value)}
                                        options={tipeOptions}
                                        placeholder="Tipe Unit"
                                        className="h-11 rounded-lg border-transparent bg-gray-200 dark:bg-gray-700 dark:text-gray-300 focus:border-yellow-500 focus:bg-white focus:ring-0 text-sm w-full"
                                    />
                                </div>

                                <div className="w-[140px]">
                                    <CustomSelect
                                        value={selectedParent}
                                        onChange={(e) => setSelectedParent(e.target.value)}
                                        options={parentOptions}
                                        placeholder="Unit Induk"
                                        className="h-11 rounded-lg border-transparent bg-gray-200 dark:bg-gray-700 dark:text-gray-300 focus:border-yellow-500 focus:bg-white focus:ring-0 text-sm w-full"
                                    />
                                </div>

                                <div className="w-[140px]">
                                    <CustomSelect
                                        value={selectedJalur}
                                        onChange={(e) => setSelectedJalur(e.target.value)}
                                        options={jalurOptions}
                                        placeholder="Jalur" 
                                        className="h-11 rounded-lg border-transparent bg-gray-200 dark:bg-gray-700 dark:text-gray-300 focus:border-yellow-500 focus:bg-white focus:ring-0 text-sm w-full"
                                    />
                                </div>

                                <Link 
                                    href={route('unit.create')} // Pastikan route ini sesuai dengan setting Laravel Anda
                                    className="h-11 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition whitespace-nowrap shadow-sm"
                                >
                                    <Plus size={16} /> Tambah
                                </Link>
                            </div>
                        </div>
                        
                        {/* Record Count */}
                        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                            Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{filteredUnits.length}</span> data unit kerja
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
                            <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 border-b border-gray-300 dark:border-gray-600 font-medium">Unit</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Biro Unit</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Nama Unit</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Kepala Unit</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUnits.length > 0 ? (
                                        filteredUnits.map((unit) => (
                                            <tr key={unit.id_unit} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                <td className="px-6 py-4 border-b border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                                                    {unit.kode_unit}
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                                                    {unit.tipe_unit || '-'}
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                                                    {unit.nama_unit}
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                                                    {unit.kepala?.nama_lengkap || '-'}
                                                </td>
                                                
                                                {/* Kolom Aksi Icon Saja */}
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        <Link
                                                            href={route('unit.edit', unit.uuid)}
                                                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Link>
                                                        <button 
                                                            onClick={() => handleDelete(unit.uuid)}
                                                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 border-b border-gray-300">
                                                Tidak ada data unit ditemukan.
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