import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import CustomSelect from '@/Components/CustomSelect';
import { 
    Monitor, BarChart3, CheckCircle2, Clock, 
    AlertCircle, FileText, ChevronRight, Eye 
} from 'lucide-react';

export default function Index({ auth, data, tahunOptions, selectedYear, stats }) {
    
    // Handle Ganti Tahun
    const handleYearChange = (e) => {
        router.get(route('monitoring.index'), { tahun: e.target.value }, { preserveState: true });
    };

    // Helper Format Rupiah
    const formatRupiah = (num) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
    };

    // Helper Badge Status
    const getStatusBadge = (status) => {
        switch (status) {
            case 'Belum Mengisi':
                return <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium border border-gray-200">Belum Ada Data</span>;
            case 'Draft':
                return <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs font-medium border border-yellow-200">Draft (Penyusunan)</span>;
            case 'Diajukan':
            case 'Menunggu_Dekan_Kepala':
                return <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">Menunggu Review</span>;
            case 'Revisi':
                return <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">Perlu Revisi</span>;
            case 'Disetujui_Final':
                return <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium border border-teal-200">Disetujui Final</span>;
            default:
                return <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-200">{status.replace('_', ' ')}</span>;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Monitoring RKAT</h2>}
        >
            <Head title="Monitoring Status RKAT" />

            <div className="py-6 pb-24">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* --- BAGIAN 1: FILTER & STATISTIK --- */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        
                        {/* Filter Tahun */}
                        <div className="md:col-span-1 bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Tahun Anggaran</label>
                            <CustomSelect
                                value={selectedYear}
                                onChange={handleYearChange}
                                options={tahunOptions.map(t => ({ value: t.tahun_anggaran, label: t.tahun_anggaran }))}
                                className="w-full"
                            />
                        </div>

                        {/* Kartu Statistik */}
                        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold">Total Unit Kerja</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.total_unit}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-full text-blue-600"><Monitor size={20}/></div>
                            </div>
                            
                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-yellow-500 flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold">Sudah Submit</p>
                                    <p className="text-2xl font-bold text-gray-800">{stats.sudah_submit} <span className="text-sm text-gray-400 font-normal">/ {stats.total_unit}</span></p>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-full text-yellow-600"><Clock size={20}/></div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border-l-4 border-teal-500 flex items-center justify-between">
                                <div>
                                    <p className="text-gray-500 text-xs uppercase font-bold">Total Anggaran</p>
                                    <p className="text-lg font-bold text-gray-800 truncate" title={formatRupiah(stats.total_anggaran_diajukan)}>
                                        {new Intl.NumberFormat('id-ID', { notation: "compact", compactDisplay: "short", style: "currency", currency: "IDR" }).format(stats.total_anggaran_diajukan)}
                                    </p>
                                </div>
                                <div className="p-3 bg-teal-50 rounded-full text-teal-600"><BarChart3 size={20}/></div>
                            </div>
                        </div>
                    </div>

                    {/* --- BAGIAN 2: TABEL MONITORING --- */}
                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-gray-500" />
                                Progres Pengajuan RKAT {selectedYear}
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th className="px-6 py-3 w-12 text-center">No</th>
                                        <th className="px-6 py-3">Unit Kerja</th>
                                        <th className="px-6 py-3 text-center">Status Terkini</th>
                                        <th className="px-6 py-3 text-right">Total Anggaran</th>
                                        <th className="px-6 py-3">Waktu Pengajuan</th>
                                        <th className="px-6 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {data.map((item, index) => (
                                        <tr key={item.id_unit} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 text-center text-gray-500 font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 dark:text-white text-base">
                                                        {item.nama_unit}
                                                    </span>
                                                    <span className="text-xs text-gray-500 mt-0.5">
                                                        Kode: {item.kode_unit} | Ka. Unit: {item.kepala_unit}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {item.total_anggaran > 0 ? (
                                                    <span className="font-bold text-gray-800 dark:text-gray-200">
                                                        {formatRupiah(item.total_anggaran)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500">
                                                {item.tanggal_pengajuan ? (
                                                    <div className="flex flex-col">
                                                        <span>{new Date(item.tanggal_pengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                                        <span className="text-gray-400">{new Date(item.tanggal_pengajuan).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">Belum diajukan</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {item.id_header ? (
                                                    <Link 
                                                        href={route('rkat.show', item.id_header)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-25 transition ease-in-out duration-150"
                                                    >
                                                        <Eye size={14} className="mr-1.5" /> Detail
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-300 text-xs italic">N/A</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}