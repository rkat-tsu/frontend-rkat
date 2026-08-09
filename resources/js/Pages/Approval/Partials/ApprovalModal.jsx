import React, { useState } from 'react';
import GlobalApprovalModal from '@/Components/GlobalApprovalModal';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

export default function ApprovalModal({ show, onClose, rkat }) {
    const [processing, setProcessing] = useState(false);

    if (!rkat) return null;

    const handleConfirm = ({ action, catatan }) => {
        const actionType = action === 'Disetujui' ? 'Setuju' : action;
        const toastId = toast.loading(`Sedang memproses ${actionType}...`);
        setProcessing(true);

        router.post(
            route('approval.process', rkat.uuid),
            {
                aksi: actionType,
                catatan: catatan
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Berhasil", { id: toastId, description: `Dokumen RKAT berhasil di${actionType.toLowerCase()}.` });
                    setProcessing(false);
                    onClose();
                },
                onError: (errors) => {
                    toast.error("Gagal Memproses", { id: toastId, description: errors?.catatan || "Terdapat kesalahan saat memproses persetujuan." });
                    setProcessing(false);
                },
                onFinish: () => {
                    setProcessing(false);
                }
            }
        );
    };

    return (
        <GlobalApprovalModal
            show={show}
            onClose={onClose}
            title="Persetujuan Dokumen RKAT"
            documentNumber={rkat.nomor_dokumen || 'Tanpa Nomor'}
            documentTitle={rkat.nama_kegiatan || rkat.judul_rkat || '-'}
            details={[
                { label: 'Unit Kerja', value: rkat.unit?.nama_unit || '-' },
                { label: 'Tahun Anggaran', value: rkat.tahun_anggaran?.tahun || '-' },
                { label: 'Total Anggaran', value: rkat.total_anggaran ? `Rp ${Number(rkat.total_anggaran).toLocaleString('id-ID')}` : '-' },
                { label: 'Status Saat Ini', value: rkat.status_persetujuan?.replace(/_/g, ' ') || '-' }
            ]}
            processing={processing}
            onConfirm={handleConfirm}
        />
    );
}