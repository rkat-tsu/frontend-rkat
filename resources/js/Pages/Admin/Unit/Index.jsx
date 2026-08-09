import React, { useState } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import CustomSelect from '@/Components/CustomSelect';
import { Plus, Search, Edit2, Trash2, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/usePermission';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionButton, { ActionGroup } from '@/Components/ActionButton';

export default function Index({ auth, units = [], users = [], allUnits = [], approvalPaths = [], flash = {}, filters = {} }) {
    const { isAdmin } = usePermission();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTipe, setSelectedTipe] = useState('');
    const [selectedParent, setSelectedParent] = useState('');
    const [selectedPath, setSelectedPath] = useState('');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'nama_unit');
    const [sortDirection, setSortDirection] = useState(filters?.sort_direction || 'asc');

    const applyFilters = (sb = sortBy, sd = sortDirection) => {
        router.get(
            route('unit.index'),
            { sort_by: sb, sort_direction: sd },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleSort = (field) => {
        const newDirection = (sortBy === field && sortDirection === 'asc') ? 'desc' : 'asc';
        setSortBy(field);
        setSortDirection(newDirection);
        applyFilters(field, newDirection);
    };

    // Extract unique filter values
    const uniqueTipes = [...new Set(units.map(u => u.tipe_unit).filter(Boolean))].sort();
    const tipeOptions = [
        { value: '', label: 'Semua Tipe Unit' },
        ...uniqueTipes.map(t => ({ value: t, label: t }))
    ];

    const uniquePaths = [...new Map(units.map(u => [u.approval_path_id, u.approval_path])).values()].filter(Boolean);
    const pathOptions = [
        { value: '', label: 'Semua Alur Persetujuan' },
        ...uniquePaths.map(p => ({ value: p.id, label: p.name }))
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
        const matchesPath = selectedPath === '' || String(unit.approval_path_id) === String(selectedPath);
        
        return matchesSearch && matchesTipe && matchesParent && matchesPath;
    });

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
            user={auth?.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Data Unit Kerja</h2>}
        >
            <Head title="Data Unit Kerja" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Data Unit Kerja
                        </h1>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-yellow-500">
                        
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
                                        value={selectedPath}
                                        onChange={(e) => setSelectedPath(e.target.value)}
                                        options={pathOptions}
                                        placeholder="Alur" 
                                        className="h-11 rounded-lg border-transparent bg-gray-200 dark:bg-gray-700 dark:text-gray-300 focus:border-yellow-500 focus:bg-white focus:ring-0 text-sm w-full"
                                    />
                                </div>

                                {isAdmin() && (
                                    <Link 
                                        href={route('unit.create')} // Pastikan route ini sesuai dengan setting Laravel Anda
                                        className="h-11 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition whitespace-nowrap shadow-sm"
                                    >
                                        <Plus size={16} /> Tambah
                                    </Link>
                                )}
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
                                        <th 
                                            className="px-6 py-3 border-b border-gray-300 dark:border-gray-600 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('kode_unit')}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>Unit</span>
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'kode_unit' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-blue-600 dark:text-blue-400" /> : <ArrowDown size={14} className="text-blue-600 dark:text-blue-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('tipe_unit')}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>Biro Unit</span>
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'tipe_unit' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-blue-600 dark:text-blue-400" /> : <ArrowDown size={14} className="text-blue-600 dark:text-blue-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                        <th 
                                            className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('nama_unit')}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span>Nama Unit</span>
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'nama_unit' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-blue-600 dark:text-blue-400" /> : <ArrowDown size={14} className="text-blue-600 dark:text-blue-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Kepala Unit</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Alur Persetujuan</th>
                                        {isAdmin() && <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Aksi</th>}
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
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                                                    {unit.approval_path?.name || '-'}
                                                </td>
                                                
                                                {/* Kolom Aksi Icon Saja */}
                                                {isAdmin() && (
                                                    <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-center">
                                                        <ActionGroup>
                                                            <ActionButton
                                                                variant="edit"
                                                                tooltip="Edit Unit"
                                                                href={route('unit.edit', unit.uuid)}
                                                            />
                                                            <ActionButton
                                                                variant="delete"
                                                                tooltip="Hapus Unit"
                                                                onClick={() => handleDelete(unit.uuid)}
                                                            />
                                                        </ActionGroup>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500 border-b border-gray-300">
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