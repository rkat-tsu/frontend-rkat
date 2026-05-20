import React, { useState } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { CheckCircle2, FileText, Eye } from 'lucide-react';
import PencairanApprovalModal from './Partials/PencairanApprovalModal';

export default function Approval({ auth, pencairans }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPencairan, setSelectedPencairan] = useState(null);

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
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
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
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">No. Dokumen RKAT / Unit</th>
                                            <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Status Saat Ini</th>
                                            <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Tgl Pengajuan</th>
                                            <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {pencairans.map((item) => (
                                            <tr key={item.id_pencairan} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                 <td className="px-6 py-4 whitespace-nowrap">
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
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                                                        {item.status_pencairan.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                                                    {new Date(item.tanggal_pengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        {/* Tombol Lihat Detail */}
                                                        <SecondaryButton 
                                                            onClick={() => router.get(route('pencairan.show', item.uuid))}
                                                            className="inline-flex items-center gap-1 border-gray-300 text-gray-700"
                                                            title="Lihat Detail Pencairan"
                                                        >
                                                            <Eye size={16} /> Detail
                                                        </SecondaryButton>
                                                        
                                                        {/* Tombol Eksekusi (Membuka Modal) */}
                                                        <PrimaryButton 
                                                            onClick={() => openModal(item)} 
                                                            className="bg-teal-600 hover:bg-teal-700 focus:ring-teal-500 text-white"
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

            {/* Modal Persetujuan Pencairan */}
            <PencairanApprovalModal
                show={isModalOpen}
                onClose={closeModal}
                pencairan={selectedPencairan}
            />

        </AuthenticatedLayout>
    );
}
