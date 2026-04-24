import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { useForm } from '@inertiajs/react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ApprovalModal({ show, onClose, rkat }) {
    // Determine the type of action selected visually
    const [actionType, setActionType] = useState('Setuju');

    // Initialize Inertia form
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        aksi: 'Setuju',
        catatan: '',
    });

    // Reset form when modal opens with a new RKAT
    useEffect(() => {
        if (show) {
            setActionType('Setuju');
            reset('aksi', 'catatan');
            clearErrors();
        }
    }, [show, rkat]);

    const handleActionSelect = (type) => {
        setActionType(type);
        setData('aksi', type);
        clearErrors('aksi');

        // If changing to Setuju, clear the notes since they aren't required
        if (type === 'Setuju') {
            setData('catatan', '');
            clearErrors('catatan');
        }
    };

    const submit = (e) => {
        e.preventDefault();

        // Final sanity check before submission
        if ((actionType === 'Revisi' || actionType === 'Tolak') && !data.catatan.trim()) {
            toast.error("Catatan Wajib Diisi", { description: "Silakan tuliskan alasan revisi atau penolakan." });
            return;
        }

        const toastId = toast.loading(`Sedang memproses ${actionType}...`);
        
        post(route('approval.process', rkat.uuid), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Berhasil", { id: toastId, description: `Dokumen berhasil di${actionType.toLowerCase()}.` });
                reset();
                onClose();
            },
            onError: () => {
                toast.error("Gagal Memproses", { id: toastId, description: "Terdapat kesalahan saat memproses persetujuan." });
            },
        });
    };

    if (!rkat) return null;

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
                    Review Dokumen RKAT: <span className="font-bold text-indigo-600 dark:text-indigo-400">{rkat.nomor_dokumen}</span>
                </h2>

                <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Tentukan Keputusan Anda:</p>
                    <div className="grid grid-cols-3 gap-3">
                        {/* SETUJU BUTTON */}
                        <button
                            type="button"
                            onClick={() => handleActionSelect('Setuju')}
                            className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all duration-200 ${actionType === 'Setuju'
                                    ? 'bg-green-50 border-green-500 text-green-700 shadow-sm ring-1 ring-green-500 dark:bg-green-900/30 dark:border-green-400 dark:text-green-300'
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                        >
                            <CheckCircle size={28} className="mb-2" />
                            <span className="text-sm font-bold">Setujui</span>
                        </button>

                        {/* REVISI BUTTON */}
                        <button
                            type="button"
                            onClick={() => handleActionSelect('Revisi')}
                            className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all duration-200 ${actionType === 'Revisi'
                                    ? 'bg-yellow-50 border-yellow-500 text-yellow-700 shadow-sm ring-1 ring-yellow-500 dark:bg-yellow-900/30 dark:border-yellow-400 dark:text-yellow-300'
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                        >
                            <AlertTriangle size={28} className="mb-2" />
                            <span className="text-sm font-bold">Revisi</span>
                        </button>

                        {/* TOLAK BUTTON */}
                        <button
                            type="button"
                            onClick={() => handleActionSelect('Tolak')}
                            className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all duration-200 ${actionType === 'Tolak'
                                    ? 'bg-red-50 border-red-500 text-red-700 shadow-sm ring-1 ring-red-500 dark:bg-red-900/30 dark:border-red-400 dark:text-red-300'
                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700'
                                }`}
                        >
                            <XCircle size={28} className="mb-2" />
                            <span className="text-sm font-bold">Tolak</span>
                        </button>
                    </div>
                    <InputError message={errors.aksi} className="mt-2 text-center" />
                </div>

                {/* TEXTAREA CATATAN: Only shows if Revisi or Tolak is selected */}
                {actionType !== 'Setuju' && (
                    <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-200 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                        <InputLabel
                            htmlFor="catatan"
                            value={`Catatan ${actionType} (Wajib diisi)`}
                            className={`font-semibold mb-1 ${actionType === 'Revisi' ? 'text-yellow-700 dark:text-yellow-500' : 'text-red-700 dark:text-red-500'}`}
                        />
                        <textarea
                            id="catatan"
                            value={data.catatan}
                            onChange={(e) => setData('catatan', e.target.value)}
                            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-900 dark:text-gray-100 transition-colors ${errors.catatan
                                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                    : `border-gray-300 ${actionType === 'Revisi' ? 'focus:border-yellow-500 focus:ring-yellow-500' : 'focus:border-red-500 focus:ring-red-500'} dark:border-gray-600`
                                }`}
                            rows="4"
                            placeholder={actionType === 'Revisi' ? "Tuliskan bagian mana saja yang perlu diperbaiki oleh unit..." : "Tuliskan alasan utama mengapa pengajuan ini ditolak secara permanen..."}
                            required={actionType !== 'Setuju'}
                        />
                        <InputError message={errors.catatan} className="mt-2" />
                    </div>
                )}

                {/* FOOTER ACTIONS */}
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <SecondaryButton onClick={onClose} disabled={processing}>Batal</SecondaryButton>

                    {actionType === 'Setuju' && (
                        <PrimaryButton disabled={processing} className="bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white border border-transparent">
                            {processing ? 'Memproses...' : 'Proses Persetujuan'}
                        </PrimaryButton>
                    )}
                    {actionType === 'Revisi' && (
                        <PrimaryButton disabled={processing} className="bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500 border border-transparent">
                            {processing ? 'Mengirim...' : 'Kirim Catatan Revisi'}
                        </PrimaryButton>
                    )}
                    {actionType === 'Tolak' && (
                        <DangerButton disabled={processing}>
                            {processing ? 'Menolak...' : 'Tolak Pengajuan'}
                        </DangerButton>
                    )}
                </div>
            </form>
        </Modal>
    );
}