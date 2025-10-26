import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout'; // Pastikan path ini benar
import { Head, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import DangerButton from '@/Components/DangerButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { useForm } from '@inertiajs/react';

// Komponen Modal Aksi Persetujuan (diasumsikan ada)
// Anda perlu membuat komponen modal ini untuk meminta catatan persetujuan/revisi/tolak
import ApprovalModal from './Partials/ApprovalModal'; 
import { useState } from 'react';

export default function ApproverDashboard({ auth, rkatMenunggu, currentRole }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRkat, setSelectedRkat] = useState(null);
    const [actionType, setActionType] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        aksi: '',
        catatan: '',
    });

    const openModal = (rkat, action) => {
        setSelectedRkat(rkat);
        setActionType(action);
        setData(prev => ({ ...prev, aksi: action, catatan: '' }));
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRkat(null);
        setActionType(null);
        reset();
    };

    const submitAction = (e) => {
        e.preventDefault();
        if (!selectedRkat) return;

        post(route('approver.approve', selectedRkat.id_header), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: (err) => console.error(err),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Persetujuan RKAT ({currentRole})</h2>}
        >
            <Head title="Persetujuan RKAT" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                            Daftar RKAT Menunggu Persetujuan Anda ({rkatMenunggu.length})
                        </h3>

                        {rkatMenunggu.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400">Tidak ada RKAT yang menunggu persetujuan Anda saat ini.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID / Unit</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tahun</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {rkatMenunggu.map((rkat) => (
                                            <tr key={rkat.id_header} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    #{rkat.id_header} <br />
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{rkat.unit.nama_unit}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{rkat.tahun_anggaran}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                                                        {rkat.status_persetujuan.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                    {/* Tombol Aksi */}
                                                    <SecondaryButton onClick={() => router.get(route('rkat.show', rkat.id_header))}>
                                                        Lihat Detail
                                                    </SecondaryButton>
                                                    <PrimaryButton onClick={() => openModal(rkat, 'Setuju')} className="bg-green-600 hover:bg-green-700">
                                                        Setuju
                                                    </PrimaryButton>
                                                    <SecondaryButton onClick={() => openModal(rkat, 'Revisi')} className="bg-blue-500 hover:bg-blue-600">
                                                        Revisi
                                                    </SecondaryButton>
                                                    <DangerButton onClick={() => openModal(rkat, 'Tolak')}>
                                                        Tolak
                                                    </DangerButton>
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

            {/* Modal Persetujuan (Asumsi dibuat di Partials/ApprovalModal.jsx) */}
            <ApprovalModal
                show={isModalOpen}
                onClose={closeModal}
                title={`Aksi RKAT #${selectedRkat?.id_header} - ${actionType}`}
                submit={submitAction}
                processing={processing}
                data={data}
                setData={setData}
                errors={errors}
                actionType={actionType}
            />

        </AuthenticatedLayout>
    );
}