import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import ApprovalModal from './Partials/ApprovalModal'; 
import { Search, Eye, CheckCircle2 } from 'lucide-react';

export default function ApproverDashboard({ auth, rkatMenunggu, currentRole, flash }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRkat, setSelectedRkat] = useState(null);

    const getStatusColor = (status) => {
        if (!status) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        const s = status.toLowerCase();
        if (s.includes('disetujui_final') || s.includes('disetujui final')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        if (s.includes('ditolak')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        if (s.includes('revisi')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        if (s.includes('draft')) return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    // Buka modal dan teruskan data RKAT yang dipilih
    const openModal = (rkat) => {
        setSelectedRkat(rkat);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRkat(null);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Persetujuan ({currentRole})</h2>}
        >
            <Head title="Persetujuan RKAT" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    Antrean RKAT 
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Anda memiliki <span className="font-bold text-indigo-600 dark:text-indigo-400">{rkatMenunggu.length}</span> dokumen yang menunggu tindakan.
                                </p>
                            </div>
                        </div>

                        {rkatMenunggu.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center">
                                <CheckCircle2 size={48} className="text-green-500 mb-4 opacity-50" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Semua tugas selesai!</p>
                                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Tidak ada RKAT yang menunggu persetujuan Anda saat ini.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">No. Dokumen / Unit</th>
                                            <th className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Status Saat Ini</th>
                                            <th className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Tgl Pengajuan</th>
                                            <th className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Tanggal Pelaksanaan</th>
                                            <th className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {rkatMenunggu.map((rkat) => (
                                            <tr key={rkat.id_header} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-medium text-gray-900 dark:text-gray-100">{rkat.nomor_dokumen || `#${rkat.id_header}`}</div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{rkat.unit?.nama_unit || 'Unit Tidak Diketahui'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md ${getStatusColor(rkat.status_persetujuan)}`}>
                                                        {rkat.status_persetujuan.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700 dark:text-gray-300">
                                                    {new Date(rkat.tanggal_pengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700 dark:text-gray-300">
                                                    {(rkat.rkat_details?.length > 0 || rkat.rkatDetails?.length > 0) ? (
                                                        <div className="text-xs whitespace-nowrap inline-block text-center">
                                                            {formatDate((rkat.rkat_details || rkat.rkatDetails)[0].jadwal_pelaksanaan_mulai)} <br/> s.d <br/> {formatDate((rkat.rkat_details || rkat.rkatDetails)[0].jadwal_pelaksanaan_akhir)}
                                                        </div>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center font-medium">
                                                    <div className="flex justify-center gap-2">
                                                        {/* Tombol Lihat Detail */}
                                                        <SecondaryButton 
                                                            onClick={() => router.get(route('daftar-ajuan.show', rkat.uuid))}
                                                            className="inline-flex items-center gap-1 border-gray-300 text-gray-700"
                                                            title="Lihat Detail RKAT"
                                                        >
                                                            <Eye size={16} /> Detail
                                                        </SecondaryButton>
                                                        
                                                        {/* Tombol Eksekusi (Membuka Modal) */}
                                                        <PrimaryButton 
                                                            onClick={() => openModal(rkat)} 
                                                            className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white"
                                                        >
                                                            Tindak Lanjuti
                                                        </PrimaryButton>
                                                    </div>
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

            {/* Modal Persetujuan Mandiri */}
            <ApprovalModal
                show={isModalOpen}
                onClose={closeModal}
                rkat={selectedRkat}
            />

        </AuthenticatedLayout>
    );
}