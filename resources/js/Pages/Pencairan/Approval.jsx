import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionButton, { ActionGroup } from '@/Components/ActionButton';
import StatusBadge from '@/Components/StatusBadge';
import { CheckCircle2, FileText, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import PencairanApprovalModal from './Partials/PencairanApprovalModal';

export default function Approval({ auth, pencairans, filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPencairan, setSelectedPencairan] = useState(null);
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'updated_at');
    const [sortDirection, setSortDirection] = useState(filters?.sort_direction || 'desc');

    const applyFilters = (newSortBy = sortBy, newSortDirection = sortDirection) => {
        router.get(
            route('pencairan.approval'),
            { sort_by: newSortBy, sort_direction: newSortDirection },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleSort = (field) => {
        const newDirection = (sortBy === field && sortDirection === 'asc') ? 'desc' : 'asc';
        setSortBy(field);
        setSortDirection(newDirection);
        applyFilters(field, newDirection);
    };

    const getStatusColor = (status) => {
        if (!status) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        const s = status.toLowerCase();
        if (s.includes('disetujui_final') || s.includes('disetujui final')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        if (s.includes('ditolak')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        if (s.includes('revisi')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        if (s.includes('draft')) return 'bg-gray-200 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const openModal = (pencairan) => {
        setSelectedPencairan(pencairan);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedPencairan(null);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Persetujuan Pencairan Dana</h2>}
        >
            <Head title="Persetujuan Pencairan Dana" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Antrean Pencairan Dana
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Anda memiliki <span className="font-bold text-teal-600 dark:text-teal-400">{pencairans.length}</span> dokumen pencairan yang menunggu tindakan.
                                </p>
                            </div>
                        </div>

                        {pencairans.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center">
                                <CheckCircle2 size={48} className="text-green-500 mb-4 opacity-50" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Semua tugas selesai!</p>
                                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Tidak ada dokumen pencairan yang menunggu persetujuan Anda saat ini.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm border-collapse">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th 
                                                className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group border-r border-gray-200 dark:border-gray-600 last:border-r-0"
                                                onClick={() => handleSort('nomor_dokumen')}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span>No. Dokumen RKAT / Unit</span>
                                                    <div className="flex flex-col ml-1">
                                                        {sortBy === 'nomor_dokumen' ? (
                                                            sortDirection === 'asc' ? <ArrowUp size={14} className="text-indigo-600 dark:text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                        ) : (
                                                            <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        )}
                                                    </div>
                                                </div>
                                            </th>
                                            <th 
                                                className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group border-r border-gray-200 dark:border-gray-600 last:border-r-0"
                                                onClick={() => handleSort('status_pencairan')}
                                            >
                                                <div className="flex items-center justify-center">
                                                    <span>Status Saat Ini</span>
                                                    <div className="flex flex-col ml-1">
                                                        {sortBy === 'status_pencairan' ? (
                                                            sortDirection === 'asc' ? <ArrowUp size={14} className="text-indigo-600 dark:text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                        ) : (
                                                            <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        )}
                                                    </div>
                                                </div>
                                            </th>
                                            <th 
                                                className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors select-none group border-r border-gray-200 dark:border-gray-600 last:border-r-0"
                                                onClick={() => handleSort('tanggal_pengajuan')}
                                            >
                                                <div className="flex items-center justify-center">
                                                    <span>Tgl Pengajuan</span>
                                                    <div className="flex flex-col ml-1">
                                                        {sortBy === 'tanggal_pengajuan' ? (
                                                            sortDirection === 'asc' ? <ArrowUp size={14} className="text-indigo-600 dark:text-indigo-400" /> : <ArrowDown size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                        ) : (
                                                            <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        )}
                                                    </div>
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs border-r border-gray-200 dark:border-gray-600 last:border-r-0">Tanggal Pelaksanaan</th>
                                            <th className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {pencairans.map((item) => (
                                            <tr key={item.id_pencairan} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                 <td className="px-6 py-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                                                     <div className="font-medium">
                                                         {item.rkat_header ? (
                                                             <Link 
                                                                 href={route('daftar-ajuan.show', item.rkat_header.uuid)}
                                                                 className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline transition-colors"
                                                             >
                                                                 {item.rkat_header.nomor_dokumen}
                                                             </Link>
                                                         ) : (
                                                             <span className="text-gray-500 dark:text-gray-400">Tidak Ada Nomor</span>
                                                         )}
                                                     </div>
                                                     <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{item.rkat_header?.unit?.nama_unit || 'Unit Tidak Diketahui'}</div>
                                                 </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                                                    <StatusBadge status={item.status_pencairan} />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                                                    {new Date(item.tanggal_pengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
                                                    {(item.rkat_header?.rkat_details?.length > 0 || item.rkat_header?.rkatDetails?.length > 0) ? (
                                                        <div className="text-xs whitespace-nowrap inline-block text-center">
                                                            {formatDate((item.rkat_header.rkat_details || item.rkat_header.rkatDetails)[0].jadwal_pelaksanaan_mulai)} <br/> s.d <br/> {formatDate((item.rkat_header.rkat_details || item.rkat_header.rkatDetails)[0].jadwal_pelaksanaan_akhir)}
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center font-medium">
                                                    <ActionGroup>
                                                        {/* Tombol Lihat Detail */}
                                                        <ActionButton
                                                            variant="detail"
                                                            tooltip="Lihat Detail Pencairan"
                                                            onClick={() => router.get(route('pencairan.show', item.uuid))}
                                                        />
                                                        
                                                        {/* Tombol Eksekusi (Membuka Modal) */}
                                                        <ActionButton
                                                            variant="approve"
                                                            tooltip="Proses Persetujuan Pencairan"
                                                            onClick={() => openModal(item)}
                                                        />
                                                    </ActionGroup>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Persetujuan Pencairan */}
            <PencairanApprovalModal
                show={isModalOpen}
                onClose={closeModal}
                pencairan={selectedPencairan}
            />

        </AuthenticatedLayout>
    );
}
