import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionButton, { ActionGroup } from '@/Components/ActionButton';
import StatusBadge from '@/Components/StatusBadge';
import { ArrowRight, Plus, Search, Download, Send, AlertCircle, Edit2, FileDown, Eye, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import CustomSelect from '@/Components/CustomSelect';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/usePermission';

const formatDate = (value) => {
    if (!value) return '-';
    try {
        return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return value;
    }
};

// Tambahkan prop 'flash' untuk menangkap pesan error/success dari Controller
export default function Index({ auth, rkats, filters, tahunAnggarans, units = [], flash = {}, statuses = [] }) {
    const { isAdmin } = usePermission();

    const getStatusColor = (status) => {
        if (!status) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        const s = status.toLowerCase();
        if (s.includes('disetujui_final') || s.includes('disetujui final')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        if (s.includes('ditolak')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        if (s.includes('revisi')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        if (s.includes('draft')) return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    };

    // State untuk menyimpan nilai filter
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [tahun, setTahun] = useState(filters?.tahun || '');
    const [bulan, setBulan] = useState(filters?.bulan || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [unitId, setUnitId] = useState(filters?.unit_id || '');
    const [perPage, setPerPage] = useState(filters?.per_page || '15');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'tanggal_pengajuan');
    const [sortDirection, setSortDirection] = useState(filters?.sort_direction || 'desc');

    // Fungsi untuk menerapkan filter ke backend
    const applyFilters = (newSearch, newTahun, newBulan, newStatus, newUnitId, newPerPage, newSortBy = sortBy, newSortDirection = sortDirection) => {
        router.get(
            route('daftar-ajuan.index'),
            { search: newSearch, tahun: newTahun, bulan: newBulan, status: newStatus, unit_id: newUnitId, per_page: newPerPage, sort_by: newSortBy, sort_direction: newSortDirection },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleSort = (field) => {
        const newDirection = (sortBy === field && sortDirection === 'asc') ? 'desc' : 'asc';
        setSortBy(field);
        setSortDirection(newDirection);
        applyFilters(searchTerm, tahun, bulan, status, unitId, perPage, field, newDirection);
    };

    // Handle perubahan pada input/select
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== (filters?.search || '') || perPage !== (filters?.per_page || '15')) {
                applyFilters(searchTerm, tahun, bulan, status, unitId, perPage, sortBy, sortDirection);
            }
        }, 300); // 300ms delay

        return () => clearTimeout(timeoutId);
    }, [searchTerm, perPage]);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash]);

    const handleFilterChange = (filterType, value) => {
        if (filterType === 'tahun') {
            setTahun(value);
            applyFilters(searchTerm, value, bulan, status, unitId, perPage, sortBy, sortDirection);
        } else if (filterType === 'bulan') {
            setBulan(value);
            applyFilters(searchTerm, tahun, value, status, unitId, perPage, sortBy, sortDirection);
        } else if (filterType === 'status') {
            setStatus(value);
            applyFilters(searchTerm, tahun, bulan, value, unitId, perPage, sortBy, sortDirection);
        } else if (filterType === 'unit_id') {
            setUnitId(value);
            applyFilters(searchTerm, tahun, bulan, status, value, perPage, sortBy, sortDirection);
        }
    };// Fungsi untuk mengirim dokumen (Submit)
    const handleAjukan = (item) => {
        toast("Konfirmasi Pengajuan", {
            description: "Apakah Anda yakin ingin mengajukan RKAT ini? Setelah diajukan, data tidak dapat diubah kecuali dikembalikan untuk revisi.",
            action: {
                label: "Ya, Ajukan",
                onClick: () => {
                    const toastId = toast.loading("Sedang mengirim pengajuan...");
                    router.post(route('daftar-ajuan.submit', item.uuid), {}, {
                        onFinish: () => {
                            toast.dismiss(toastId);
                        }
                    });
                }
            },
            cancel: {
                label: "Batal"
            }
        });
    };

    // Cek apakah tombol "Baru" harus dikunci (jika ada error periode ditutup)
    const isLocked = !!flash.error;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Daftar Ajuan</h2>}
        >
            <Head title="Daftar Ajuan" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">



                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Daftar Ajuan
                    </h1>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-teal-500 mb-6">

                        {/* Top Bar: Search, Filters & Buttons */}
                        <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
                            {/* Search */}
                            <div className="relative w-full lg:flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Cari nomor dokumen atau unit..."
                                    className="pl-10 h-11 block w-full bg-gray-50 border-gray-200 rounded-lg focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all"
                                />
                            </div>

                            {/* Filters Group */}
                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <div className="flex-1 min-w-[140px] lg:w-36">
                                    <CustomSelect
                                        value={tahun}
                                        onChange={(e) => handleFilterChange('tahun', e.target.value)}
                                        className="h-11"
                                        options={[
                                            { value: '', label: 'Semua Tahun' },
                                            ...(tahunAnggarans || []).map(th => ({ value: th, label: th }))
                                        ]}
                                    />
                                </div>

                                <div className="flex-1 min-w-[140px] lg:w-36">
                                    <CustomSelect
                                        value={bulan}
                                        onChange={(e) => handleFilterChange('bulan', e.target.value)}
                                        className="h-11"
                                        options={[
                                            { value: '', label: 'Semua Bulan' },
                                            { value: '1', label: 'Januari' },
                                            { value: '2', label: 'Februari' },
                                            { value: '3', label: 'Maret' },
                                            { value: '4', label: 'April' },
                                            { value: '5', label: 'Mei' },
                                            { value: '6', label: 'Juni' },
                                            { value: '7', label: 'Juli' },
                                            { value: '8', label: 'Agustus' },
                                            { value: '9', label: 'September' },
                                            { value: '10', label: 'Oktober' },
                                            { value: '11', label: 'November' },
                                            { value: '12', label: 'Desember' },
                                        ]}
                                    />
                                </div>

                                {isAdmin() && units.length > 0 && (
                                    <div className="flex-1 min-w-[200px] lg:w-56">
                                        <CustomSelect
                                            value={unitId}
                                            onChange={(e) => handleFilterChange('unit_id', e.target.value)}
                                            className="h-11"
                                            options={[
                                                { value: '', label: 'Semua Unit Kerja' },
                                                ...units.map(u => ({ value: u.id_unit, label: u.nama_unit }))
                                            ]}
                                        />
                                    </div>
                                )}

                                <div className="flex-1 min-w-[160px] lg:w-44">
                                    <CustomSelect
                                        value={status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="h-11"
                                        options={[
                                            { value: '', label: 'Semua Status' },
                                            ...(statuses || []).map(s => ({
                                                value: s,
                                                label: s.replace(/_/g, ' ')
                                            }))
                                        ]}
                                    />
                                </div>

                                {/* TOMBOL BARU */}
                                <Link
                                    href={isLocked ? '#' : route('daftar-ajuan.create')}
                                    onClick={(e) => isLocked && e.preventDefault()}
                                    className={`h-11 inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap shadow-md ${isLocked
                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-teal-600 hover:bg-teal-700 text-white active:scale-95'
                                        }`}
                                >
                                    <Plus size={18} />
                                    Baru
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* Tabel Data */}
                    <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
                        <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                <tr>
                                    <th className="px-4 py-3 border-b border-gray-300 dark:border-gray-600 font-medium text-center">No</th>
                                    <th 
                                        className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                        onClick={() => handleSort('nomor_dokumen')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Nomor Dokumen
                                            <div className="flex flex-col ml-1">
                                                {sortBy === 'nomor_dokumen' ? (
                                                    sortDirection === 'asc' ? <ArrowUp size={14} className="text-teal-600 dark:text-teal-400" /> : <ArrowDown size={14} className="text-teal-600 dark:text-teal-400" />
                                                ) : (
                                                    <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </div>
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                        onClick={() => handleSort('unit')}
                                    >
                                        <div className="flex items-center gap-1">
                                            Unit
                                            <div className="flex flex-col ml-1">
                                                {sortBy === 'unit' ? (
                                                    sortDirection === 'asc' ? <ArrowUp size={14} className="text-teal-600 dark:text-teal-400" /> : <ArrowDown size={14} className="text-teal-600 dark:text-teal-400" />
                                                ) : (
                                                    <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </div>
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                        onClick={() => handleSort('tahun_anggaran')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            Tahun
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
                                        onClick={() => handleSort('status_persetujuan')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            Status
                                            <div className="flex flex-col ml-1">
                                                {sortBy === 'status_persetujuan' ? (
                                                    sortDirection === 'asc' ? <ArrowUp size={14} className="text-teal-600 dark:text-teal-400" /> : <ArrowDown size={14} className="text-teal-600 dark:text-teal-400" />
                                                ) : (
                                                    <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </div>
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                        onClick={() => handleSort('tanggal_pengajuan')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            Tanggal Pengajuan
                                            <div className="flex flex-col ml-1">
                                                {sortBy === 'tanggal_pengajuan' ? (
                                                    sortDirection === 'asc' ? <ArrowUp size={14} className="text-teal-600 dark:text-teal-400" /> : <ArrowDown size={14} className="text-teal-600 dark:text-teal-400" />
                                                ) : (
                                                    <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </div>
                                        </div>
                                    </th>
                                    <th 
                                        className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                        onClick={() => handleSort('pelaksanaan')}
                                    >
                                        <div className="flex items-center justify-center gap-1">
                                            Pelaksanaan
                                            <div className="flex flex-col ml-1">
                                                {sortBy === 'pelaksanaan' ? (
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
                            <tbody>
                                {rkats.data && rkats.data.length > 0 ? rkats.data.map((item, index) => (
                                    <tr key={item.id_header} className="bg-white dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors">
                                        <td className="px-4 py-4 border-b border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-white text-center">{rkats.from + index}</td>
                                        <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium">{item.nomor_dokumen}</td>
                                        <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">{item.unit?.nama_unit || '-'}</td>
                                        <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-center">{item.tahun_anggaran}</td>
                                        <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-center">
                                            <StatusBadge status={item.status_persetujuan} />
                                        </td>
                                        <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-center">{formatDate(item.tanggal_pengajuan)}</td>
                                        <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-center">
                                            {(item.rkat_details?.length > 0 || item.rkatDetails?.length > 0) ? (
                                                <div className="text-xs whitespace-nowrap">
                                                    {formatDate((item.rkat_details || item.rkatDetails)[0].jadwal_pelaksanaan_mulai)} <br /> s.d <br /> {formatDate((item.rkat_details || item.rkatDetails)[0].jadwal_pelaksanaan_akhir)}
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-center">
                                             <ActionGroup>
                                                 {/* --- DETAIL --- */}
                                                 <ActionButton
                                                     variant="detail"
                                                     tooltip="Detail RKAT"
                                                     href={route('daftar-ajuan.show', item.uuid)}
                                                 />

                                                 {/* --- EXPORT --- */}
                                                 <ActionButton
                                                     variant="export"
                                                     tooltip="Export PDF"
                                                     href={route('daftar-ajuan.export', item.uuid)}
                                                     target="_blank"
                                                 />

                                                 {/* --- EDIT --- */}
                                                 {(item.status_persetujuan === 'Draft' || item.status_persetujuan === 'Revisi') && (
                                                     <ActionButton
                                                         variant="edit"
                                                         tooltip="Edit RKAT"
                                                         href={route('daftar-ajuan.edit', item.uuid)}
                                                     />
                                                 )}

                                                 {/* --- AJUKAN --- */}
                                                 {(item.status_persetujuan === 'Draft' || item.status_persetujuan === 'Revisi') && (
                                                     <ActionButton
                                                         variant="submit"
                                                         tooltip="Ajukan RKAT"
                                                         onClick={() => handleAjukan(item)}
                                                     />
                                                 )}
                                             </ActionGroup>
                                         </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            Tidak ada data RKAT yang sesuai dengan filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Links — selalu tampil */}
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Tampilkan</span>
                                <div className="w-20">
                                    <CustomSelect
                                        value={perPage}
                                        onChange={(e) => {
                                            setPerPage(e.target.value);
                                            applyFilters(searchTerm, tahun, bulan, status, unitId, e.target.value, sortBy, sortDirection);
                                        }}
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
                                Menampilkan <span className="font-medium text-gray-900 dark:text-white">{rkats.from || 0}</span> sampai <span className="font-medium text-gray-900 dark:text-white">{rkats.to || 0}</span> dari <span className="font-medium text-gray-900 dark:text-white">{rkats.total || 0}</span> data
                            </p>
                        </div>
                        {rkats.links && rkats.links.length > 3 && (
                            <div className="flex flex-wrap gap-2">
                                {rkats.links.map((link, index) => (
                                    link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            preserveScroll
                                            preserveState
                                            className={`px-3 py-1 text-sm border rounded-md transition-colors ${link.active
                                                ? 'bg-teal-600 text-white border-teal-600'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={index}
                                            className="px-3 py-1 text-sm border rounded-md bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}