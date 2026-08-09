import React, { useState, useEffect } from 'react';
import Modal from '@/Components/Modal';
import { CheckCircle2, Check, AlertTriangle, XCircle, FileText, Send, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';

export default function GlobalApprovalModal({
    show = false,
    onClose,
    title = 'Persetujuan Dokumen',
    documentNumber = '',
    documentTitle = '',
    details = [], // Array of { label, value }
    onConfirm,
    processing = false,
    customContent = null,
    defaultAction = 'Disetujui'
}) {
    const [action, setAction] = useState(defaultAction);
    const [catatan, setCatatan] = useState('');

    useEffect(() => {
        if (show) {
            setAction(defaultAction);
            setCatatan('');
        }
    }, [show, defaultAction]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if ((action === 'Revisi' || action === 'Ditolak') && !catatan.trim()) {
            toast.error('Catatan wajib diisi apabila melakukan revisi atau penolakan.');
            return;
        }

        if (onConfirm) {
            onConfirm({ action, catatan });
        }
    };

    const getSubmitButtonColor = () => {
        if (action === 'Disetujui') return 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-600/20';
        if (action === 'Revisi') return 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 shadow-amber-600/20';
        if (action === 'Ditolak') return 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 shadow-rose-600/20';
        return 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20';
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                {title}
                            </h3>
                            {documentNumber && (
                                <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 block">
                                    {documentNumber}
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Summary Info Card */}
                {(documentTitle || details.length > 0) && (
                    <div className="bg-gray-50/80 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200/80 dark:border-gray-700/80 space-y-2 text-xs">
                        {documentTitle && (
                            <div>
                                <span className="text-gray-400 block text-[11px] uppercase tracking-wider font-semibold">Judul Kegiatan / Dokumen</span>
                                <span className="font-bold text-gray-900 dark:text-white text-sm">{documentTitle}</span>
                            </div>
                        )}
                        {details.length > 0 && (
                            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-200/60 dark:border-gray-800">
                                {details.map((item, idx) => (
                                    <div key={idx} className="space-y-0.5">
                                        <span className="text-gray-400 block text-[11px] font-medium">{item.label}</span>
                                        <span className="font-bold text-gray-900 dark:text-white block">{item.value || '-'}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Custom breakdown content if provided */}
                {customContent}

                {/* Keputusan Approval (Tab Buttons) */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                        Keputusan Approval *
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            type="button"
                            onClick={() => setAction('Disetujui')}
                            className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 active:scale-95 ${
                                action === 'Disetujui'
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <Check className="w-4 h-4" /> Setujui
                        </button>
                        <button
                            type="button"
                            onClick={() => setAction('Revisi')}
                            className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 active:scale-95 ${
                                action === 'Revisi'
                                    ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/20'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <AlertTriangle className="w-4 h-4" /> Revisi
                        </button>
                        <button
                            type="button"
                            onClick={() => setAction('Ditolak')}
                            className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition flex items-center justify-center gap-1.5 active:scale-95 ${
                                action === 'Ditolak'
                                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            <XCircle className="w-4 h-4" /> Tolak
                        </button>
                    </div>
                </div>

                {/* Catatan Input Textarea */}
                <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                        Catatan / Instruksi Perbaikan {action !== 'Disetujui' && <span className="text-rose-500">*</span>}
                    </label>
                    <textarea
                        rows="3"
                        required={action !== 'Disetujui'}
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                        placeholder={
                            action === 'Disetujui'
                                ? 'Tambahkan catatan persetujuan opsional...'
                                : 'Tuliskan instruksi revisi atau alasan penolakan secara jelas...'
                        }
                        className="w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 dark:text-white transition"
                    ></textarea>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-11 px-5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={processing}
                        className={`h-11 inline-flex items-center justify-center gap-2 px-6 text-xs font-bold text-white rounded-xl shadow-md transition-all duration-200 active:scale-95 disabled:opacity-50 ${getSubmitButtonColor()}`}
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Simpan Keputusan</span>
                    </button>
                </div>
            </form>
        </Modal>
    );
}
