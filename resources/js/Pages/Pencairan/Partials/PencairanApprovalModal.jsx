import React, { useState } from 'react';
import GlobalApprovalModal from '@/Components/GlobalApprovalModal';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

export default function PencairanApprovalModal({ show, onClose, pencairan }) {
    const [processing, setProcessing] = useState(false);

    if (!pencairan) return null;

    const handleConfirm = ({ action, catatan }) => {
        if (processing) return;
        toast.dismiss();
        const actionType = action === 'Disetujui' ? 'Setuju' : action;
        const toastId = toast.loading(`Sedang memproses persetujuan pencairan...`);
        setProcessing(true);

        router.post(
            route('pencairan.approve', pencairan.uuid),
            {
                aksi: actionType,
                catatan: catatan
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Berhasil", { id: toastId, description: `Pencairan dana berhasil di${actionType.toLowerCase()}.` });
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
            title="Persetujuan Pencairan Dana"
            documentNumber={pencairan.rkat_header?.nomor_dokumen || 'Tanpa Nomor'}
            documentTitle={pencairan.nama_pencairan || pencairan.rkat_header?.nama_kegiatan || '-'}
            details={[
                { label: 'Unit Kerja', value: pencairan.rkat_header?.unit?.nama_unit || '-' },
                { label: 'Tgl Pengajuan', value: pencairan.tanggal_pengajuan ? new Date(pencairan.tanggal_pengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-' },
                { label: 'Status Saat Ini', value: pencairan.status_pencairan?.replace(/_/g, ' ') || '-' }
            ]}
            processing={processing}
            onConfirm={handleConfirm}
        />
    );
}

