import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Search, Package, Plus, ArrowUp, ArrowDown, ArrowUpDown, FileText, FileSpreadsheet } from 'lucide-react';
import CustomSelect from '@/Components/CustomSelect';
import StatusBadge from '@/Components/StatusBadge';
import ActionButton, { ActionGroup } from '@/Components/ActionButton';
import { usePermission } from '@/hooks/usePermission';
import { exportToExcel } from '@/Utils/exportToExcel';

const formatDate = (value) => {
    if (!value) return '-';
    try {
        return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return value;
    }
};

const formatPelaksanaan = (mulai, akhir) => {
    if (!mulai && !akhir) return '-';
    if (!mulai) return formatDate(akhir);
    if (!akhir) return formatDate(mulai);

    const fmtMulai = formatDate(mulai);
    const fmtAkhir = formatDate(akhir);

    if (fmtMulai === fmtAkhir) {
        return fmtMulai;
    }

    return (
        <>
            {fmtMulai} <br /> s.d <br /> {fmtAkhir}
        </>
    );
};

const formatRupiah = (angka) => {
    const number = Number(angka) || 0;
    return `Rp. ${number.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;
};

export default function Index({ auth, rkats = { data: [] }, filters = {}, tahunAnggarans = [], units = [], statuses = [] }) {
    const { isAdmin } = usePermission();

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [tahun, setTahun] = useState(filters?.tahun || '');
    const [unitId, setUnitId] = useState(filters?.unit_id || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [perPage, setPerPage] = useState(filters?.per_page || '15');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'tanggal_pengajuan');
    const [sortDirection, setSortDirection] = useState(filters?.sort_direction || 'desc');

    const applyFilters = (newSearch, newTahun, newUnitId, newStatus, newPerPage, newSortBy = sortBy, newSortDirection = sortDirection) => {
        router.get(
            route('rkat.index'),
            { search: newSearch, tahun: newTahun, unit_id: newUnitId, status: newStatus, per_page: newPerPage, sort_by: newSortBy, sort_direction: newSortDirection },
            { preserveState: true, replace: true, preserveScroll: true }
        );
    };

    const handleSort = (field) => {
        const newDirection = (sortBy === field && sortDirection === 'asc') ? 'desc' : 'asc';
        setSortBy(field);
        setSortDirection(newDirection);
        applyFilters(searchTerm, tahun, unitId, status, perPage, field, newDirection);
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            applyFilters(searchTerm, tahun, unitId, status, perPage, sortBy, sortDirection);
        }
    };

    const handleExportExcel = () => {
        if (!rkats?.data || rkats.data.length === 0) return;
        const exportData = rkats.data.map((item, index) => {
            const details = item.rkat_details || item.rkatDetails || [];
            const firstDetail = details[0];
            const namaKegiatan = firstDetail?.judul_kegiatan || firstDetail?.deskripsi_kegiatan || item.nomor_dokumen;
            const calculatedAnggaran = Number(item.total_anggaran) > 0
                ? Number(item.total_anggaran)
                : details.reduce((acc, d) => acc + (parseFloat(d.anggaran) || 0), 0);

            const pencairanList = item.pencairan_danas || item.pencairanDanas || [];
            const pencairan = pencairanList[0];
            const lpj = pencairan?.lpj;

            let tglPelak = '-';
            if (firstDetail?.jadwal_pelaksanaan_mulai || firstDetail?.jadwal_pelaksanaan_akhir) {
                const m = firstDetail.jadwal_pelaksanaan_mulai ? formatDate(firstDetail.jadwal_pelaksanaan_mulai) : '';
                const a = firstDetail.jadwal_pelaksanaan_akhir ? formatDate(firstDetail.jadwal_pelaksanaan_akhir) : '';
                tglPelak = m === a ? m : `${m} s.d ${a}`;
            }

            return {
                'No': (rkats.from || 1) + index,
                'Nama Kegiatan': namaKegiatan,
                'No. Dokumen': item.nomor_dokumen || '-',
                'Unit': item.unit?.nama_unit || '-',
                'Tahun': item.tahun_anggaran || '-',
                'Tanggal Pelaksanaan': tglPelak,
                'Anggaran (Rp)': calculatedAnggaran,
                'Status RKA': item.status_persetujuan || '-',
                'Status Pencairan': pencairan?.status_pencairan || '-',
                'Status LPJ': lpj?.status_lpj || '-'
            };
        });

        exportToExcel(exportData, `Daftar_RKAT_${new Date().toISOString().slice(0, 10)}.xlsx`, 'Daftar RKAT');
    };

    const tahunSelectOptions = [
        { value: '', label: 'Semua Tahun' },
        ...tahunAnggarans.map(t => ({ value: t.tahun_anggaran, label: `Tahun ${t.tahun_anggaran}` }))
    ];

    const unitSelectOptions = [
        { value: '', label: 'Semua Unit' },
        ...units.map(u => ({ value: u.id_unit, label: `${u.kode_unit} - ${u.nama_unit}` }))
    ];

    const statusSelectOptions = [
        { value: '', label: 'Semua Status' },
        ...(statuses || []).map(s => ({
            value: s,
            label: s.replace(/_/g, ' ')
        }))
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Daftar RKAT</h2>}
        >
            <Head title="RKAT" />

            <div className="py-8 pb-24">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Package className="w-8 h-8 text-indigo-500" />
                        RKAT
                    </h1>

                    {/* --- KONTAINER: FILTER & TABLE --- */}
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-indigo-500 mb-6 space-y-4">

                        {/* Baris 1: Search Box & Tombol Action */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
                            {/* Search */}
                            <div className="relative w-full sm:flex-1 max-w-2xl">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="pl-10 h-11 block w-full bg-gray-50 border-gray-200 rounded-lg focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all"
                                    placeholder="Cari kegiatan, dokumen..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    onKeyDown={handleSearchKeyDown}
                                />
                            </div>

                            {/* Tombol Export Excel */}
                            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                <button
                                    onClick={handleExportExcel}
                                    disabled={!rkats?.data || rkats.data.length === 0}
                                    className="h-11 flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition whitespace-nowrap shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FileSpreadsheet size={18} />
                                    Export Excel
                                </button>
                            </div>
                        </div>

                        {/* Baris 2: Filters Grid */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div>
                                    <CustomSelect
                                        value={tahun}
                                        onChange={(e) => { setTahun(e.target.value); applyFilters(searchTerm, e.target.value, unitId, status, perPage); }}
                                        options={tahunSelectOptions}
                                        placeholder="Pilih Tahun"
                                        className="h-11 w-full text-sm"
                                    />
                                </div>

                                {isAdmin() && (
                                    <div>
                                        <CustomSelect
                                            value={unitId}
                                            onChange={(e) => { setUnitId(e.target.value); applyFilters(searchTerm, tahun, e.target.value, status, perPage); }}
                                            options={unitSelectOptions}
                                            placeholder="Pilih Unit"
                                            className="h-11 w-full text-sm"
                                        />
                                    </div>
                                )}

                                <div>
                                    <CustomSelect
                                        value={status}
                                        onChange={(e) => { setStatus(e.target.value); applyFilters(searchTerm, tahun, unitId, e.target.value, perPage); }}
                                        options={statusSelectOptions}
                                        placeholder="Pilih Status"
                                        className="h-11 w-full text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Record Count */}
                        <div className="pt-2 text-xs text-gray-500 dark:text-gray-400">
                            Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{rkats?.total || 0}</span> dokumen RKAT
                        </div>

                        {/* TABEL DATA */}
                        <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
                            <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 border-b border-gray-300 dark:border-gray-600 font-medium text-center">No</th>

                                        {/* Column 2: Nama Kegiatan (dibawahnya nomor dokumen) */}
                                        <th
                                            className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('nomor_dokumen')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Nama Kegiatan / No. Dokumen
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'nomor_dokumen' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-indigo-600 dark:text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>

                                        {/* Column 3: Unit */}
                                        <th
                                            className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('unit')}
                                        >
                                            <div className="flex items-center gap-1">
                                                Unit
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'unit' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-indigo-600 dark:text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>

                                        {/* Column 4: Tahun */}
                                        <th
                                            className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('tahun_anggaran')}
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                Tahun
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'tahun_anggaran' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-indigo-600 dark:text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>

                                        {/* Column 5: Tgl Pelaksana */}
                                        <th
                                            className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('pelaksanaan')}
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                Tanggal Pelaksanaan
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'pelaksanaan' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-indigo-600 dark:text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>

                                        {/* Column 6: Anggaran */}
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-right">
                                            Anggaran
                                        </th>

                                        {/* Column 7: Status Global */}
                                        <th
                                            className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group"
                                            onClick={() => handleSort('status_persetujuan')}
                                        >
                                            <div className="flex items-center justify-center gap-1">
                                                Status Global
                                                <div className="flex flex-col ml-1">
                                                    {sortBy === 'status_persetujuan' ? (
                                                        sortDirection === 'asc' ? <ArrowUp size={14} className="text-indigo-600 dark:text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                    ) : (
                                                        <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    )}
                                                </div>
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rkats?.data && rkats.data.length > 0 ? (
                                        rkats.data.map((item, index) => {
                                            const details = item.rkat_details || item.rkatDetails || [];
                                            const firstDetail = details[0];
                                            const namaKegiatan = firstDetail?.judul_kegiatan || firstDetail?.deskripsi_kegiatan || item.nomor_dokumen;

                                            const calculatedAnggaran = Number(item.total_anggaran) > 0
                                                ? Number(item.total_anggaran)
                                                : details.reduce((acc, d) => acc + (parseFloat(d.anggaran) || 0), 0);

                                            const pencairanList = item.pencairan_danas || item.pencairanDanas || [];
                                            const pencairan = pencairanList[0];
                                            const lpj = pencairan?.lpj;

                                            return (
                                                <tr key={item.id_header} className="bg-white dark:bg-gray-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors">
                                                    {/* 1. No */}
                                                    <td className="px-4 py-4 border-b border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-white text-center">
                                                        {(rkats.from || 1) + index}
                                                    </td>

                                                    {/* 2. Nama Kegiatan (dibawahnya ada nomor dokumen) */}
                                                    <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700">
                                                        <div className="font-semibold text-gray-900 dark:text-white leading-snug">
                                                            {namaKegiatan}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-1 flex items-center gap-1">
                                                            <span>{item.nomor_dokumen}</span>
                                                        </div>
                                                    </td>

                                                    {/* 3. Unit */}
                                                    <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                                                        {item.unit?.nama_unit || '-'}
                                                    </td>

                                                    {/* 4. Tahun */}
                                                    <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-center font-semibold">
                                                        {item.tahun_anggaran}
                                                    </td>

                                                    {/* 5. Tgl Pelaksana */}
                                                    <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-center">
                                                        {firstDetail && (firstDetail.jadwal_pelaksanaan_mulai || firstDetail.jadwal_pelaksanaan_akhir) ? (
                                                            <div className="text-xs whitespace-nowrap font-medium">
                                                                {formatPelaksanaan(firstDetail.jadwal_pelaksanaan_mulai, firstDetail.jadwal_pelaksanaan_akhir)}
                                                            </div>
                                                        ) : '-'}
                                                    </td>

                                                    {/* 6. Anggaran */}
                                                    <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-right font-bold whitespace-nowrap">
                                                        {formatRupiah(calculatedAnggaran)}
                                                    </td>

                                                    {/* 7. Status Global (RKA, Pencairan, LPJ) */}
                                                    <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-1">
                                                            <StatusBadge status={item.status_persetujuan} type="rka" size="sm" />
                                                            {pencairan && (
                                                                <StatusBadge status={pencairan.status_pencairan} type="pencairan" size="sm" />
                                                            )}
                                                            {lpj && (
                                                                <StatusBadge status={lpj.status_lpj} type="lpj" size="sm" />
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                Tidak ada data RKAT yang ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        {rkats?.links && rkats.links.length > 3 && (
                            <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">Tampilkan</span>
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
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        Menampilkan <span className="font-medium text-gray-900 dark:text-white">{rkats.from || 0}</span> sampai <span className="font-medium text-gray-900 dark:text-white">{rkats.to || 0}</span> dari <span className="font-medium text-gray-900 dark:text-white">{rkats.total || 0}</span> data
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {rkats.links.map((link, k) => (
                                        link.url ? (
                                            <Link
                                                key={k}
                                                href={link.url}
                                                className={`px-3 py-1 text-sm border rounded-md transition-colors ${link.active
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
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