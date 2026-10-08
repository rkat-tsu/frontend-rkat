import React, { useState } from 'react';
import { Head, Link, router, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    ArrowLeft, Download, AlertTriangle, Save, Send, Edit2, 
    MessageSquare, History, CheckCircle2, Clock, User, 
    ArrowRight, TrendingUp, TrendingDown, RefreshCw, CornerDownRight 
} from 'lucide-react';
import { toast } from 'sonner';

const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0';
    try {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(amount);
    } catch (e) {
        return 'Rp ' + amount;
    }
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (e) {
        return '-';
    }
};

const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '-';
        return d.toLocaleDateString('id-ID', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return '-';
    }
};

const formatPelaksanaanText = (mulai, akhir) => {
    if (!mulai && !akhir) return '-';
    if (!mulai) return formatDate(akhir);
    if (!akhir) return formatDate(mulai);
    const fmtMulai = formatDate(mulai);
    const fmtAkhir = formatDate(akhir);
    if (fmtMulai === fmtAkhir) return fmtMulai;
    return `${fmtMulai} s.d. ${fmtAkhir}`;
};

// Custom Table Row for the layout
const TableRow = ({ no, label, children, colSpan = 1 }) => (
    <tr className="border-b border-gray-300 dark:border-gray-700">
        {no && <td className="p-3 border-r border-gray-300 dark:border-gray-700 text-center text-gray-500 w-12">{no}</td>}
        <td className={`p-3 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 w-48 ${!no ? 'pl-4' : ''}`}>
            {label}
        </td>
        <td colSpan={colSpan} className="p-3 text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
            {children}
        </td>
    </tr>
);

const getStatusColor = (status) => {
    if (!status) return 'bg-blue-100 text-blue-800 border-blue-200';
    const s = status.toLowerCase();
    if (s.includes('disetujui_final') || s.includes('disetujui final')) return 'bg-green-100 text-green-800 border-green-200';
    if (s.includes('ditolak')) return 'bg-red-100 text-red-800 border-red-200';
    if (s.includes('revisi')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (s.includes('draft')) return 'bg-gray-200 text-gray-800 border-gray-300';
    return 'bg-blue-100 text-blue-800 border-blue-200';
};

export default function Show({ auth, rkat = {}, history = [], initialTotalAnggaran = null, komentars = [] }) {
    const dataRkat = rkat.data || rkat;
    const rawDetail = dataRkat?.rkat_details || dataRkat?.rkatDetails || dataRkat?.detail;
    const dataDetail = Array.isArray(rawDetail) ? (rawDetail[0] || {}) : (rawDetail || {});

    const indikators = Array.isArray(dataDetail?.indikators) ? dataDetail.indikators : [];
    const rabItems = Array.isArray(dataDetail?.rab_items) ? dataDetail.rab_items : (Array.isArray(dataDetail?.rabItems) ? dataDetail.rabItems : []);
    
    const logs = Array.isArray(dataRkat?.log_persetujuans) ? dataRkat.log_persetujuans : (Array.isArray(dataRkat?.logPersetujuans) ? dataRkat.logPersetujuans : []);
    const notes = logs.filter(l => l?.aksi === 'Revisi' || l?.aksi === 'Tolak');

    // Nilai Awal vs Nilai Akhir
    const currentBudget = parseFloat(dataRkat?.total_anggaran || 0);
    const initialBudget = initialTotalAnggaran !== null ? parseFloat(initialTotalAnggaran) : currentBudget;
    const budgetDiff = currentBudget - initialBudget;
    const isBudgetChanged = Math.abs(budgetDiff) > 0.01;

    // Form Komentar Dua Arah
    const [pesanKomentar, setPesanKomentar] = useState('');
    const [isSendingKomentar, setIsSendingKomentar] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleKirimKomentar = (e) => {
        e.preventDefault();
        if (!pesanKomentar.trim()) {
            toast.error("Pesan Kosong", { description: "Silakan ketik catatan atau tanggapan terlebih dahulu." });
            return;
        }

        setIsSendingKomentar(true);
        router.post(
            route('daftar-ajuan.komentar.store', dataRkat.uuid || dataRkat.id_header),
            { pesan: pesanKomentar },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setPesanKomentar('');
                    toast.success("Terkirim", { description: "Catatan tanggapan berhasil dikirim." });
                },
                onError: () => {
                    toast.error("Gagal Mengirim", { description: "Terjadi kesalahan saat mengirim catatan." });
                },
                onFinish: () => {
                    setIsSendingKomentar(false);
                }
            }
        );
    };

    const handleAjukan = (item) => {
        if (isSubmitting) return;
        toast.dismiss();

        toast("Konfirmasi Pengajuan", {
            id: `konfirmasi-pengajuan-${item.uuid || item.id_header}`,
            description: "Apakah Anda yakin ingin mengajukan RKAT ini? Setelah diajukan, data tidak dapat diubah kecuali dikembalikan untuk revisi.",
            action: {
                label: "Ya, Ajukan",
                onClick: () => {
                    if (isSubmitting) return;
                    toast.dismiss();
                    setIsSubmitting(true);
                    const toastId = toast.loading("Sedang mengirim pengajuan...");
                    router.post(route('daftar-ajuan.submit', item.uuid || item.id_header), {}, {
                        onSuccess: () => {
                            toast.success("Berhasil", { id: toastId, description: "Pengajuan RKAT berhasil dikirim." });
                        },
                        onError: (err) => {
                            toast.error("Gagal Mengajukan", { id: toastId, description: err?.message || "Terjadi kesalahan saat mengirim pengajuan." });
                        },
                        onFinish: () => {
                            setIsSubmitting(false);
                        }
                    });
                }
            },
            cancel: {
                label: "Batal",
                onClick: () => toast.dismiss()
            }
        });
    };

    const canEdit = dataRkat?.status_persetujuan === 'Draft' || dataRkat?.status_persetujuan === 'Revisi';

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Detail Pengajuan RKAT</h2>}
        >
            <Head title={`Detail RKAT - ${dataRkat?.nomor_dokumen || 'Baru'}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 space-y-6">

                    {/* Banner Catatan Revisi / Tolak Terakhir (Jika Ada) */}
                    {notes.length > 0 && (
                        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 shadow-sm">
                            <h3 className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-lg mb-3">
                                <AlertTriangle size={20} />
                                Catatan Revisi & Penolakan dari Approver
                            </h3>
                            <div className="space-y-3">
                                {notes.map((note, idx) => (
                                    <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-amber-100 dark:border-amber-900/50 shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {note.approver?.nama_lengkap || 'Approver'} 
                                                </span>
                                                <span className="text-gray-500 dark:text-gray-400 text-xs font-normal">
                                                    ({typeof note.level_persetujuan === 'string' ? note.level_persetujuan.replace(/_/g, ' ') : 'Reviewer'})
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                                    <Clock size={12} /> {formatDateTime(note.created_at)}
                                                </span>
                                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${note.aksi === 'Tolak' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}>
                                                    {note.aksi}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm italic border-l-4 border-amber-400 pl-3 py-1 bg-amber-50/50 dark:bg-gray-900/40 rounded-r">
                                            "{note.catatan}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ringkasan Perubahan Nilai Awal vs Nilai Akhir (Tracking Perubahan Anggaran) */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                                    <TrendingUp size={20} className="text-teal-600 dark:text-teal-400" />
                                    Informasi Nilai Usulan & Penyesuaian Anggaran
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Memantau pergeseran nilai anggaran dari draft usulan awal hingga revisi saat ini.
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(dataRkat?.status_persetujuan)}`}>
                                    Status: {typeof dataRkat?.status_persetujuan === 'string' ? (dataRkat.status_persetujuan === 'Disetujui_Final' ? 'Disetujui RKAT' : dataRkat.status_persetujuan.replace(/_/g, ' ')) : '-'}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                            {/* Nilai Awal */}
                            <div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl p-4 border border-gray-100 dark:border-gray-700/60">
                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider block">
                                    Nilai Sebelum Revisi
                                </span>
                                <span className="text-lg font-extrabold text-gray-800 dark:text-gray-200 mt-1 block">
                                    {formatCurrency(initialBudget)}
                                </span>
                                <span className="text-[11px] text-gray-400 mt-1 block">
                                    {isBudgetChanged ? 'Nilai asli sebelum perubahan' : 'Belum ada revisi anggaran'}
                                </span>
                            </div>

                            {/* Nilai Terkini / Akhir */}
                            <div className="bg-teal-50/70 dark:bg-teal-900/20 rounded-xl p-4 border border-teal-100 dark:border-teal-800/40">
                                <span className="text-xs font-medium text-teal-700 dark:text-teal-300 uppercase tracking-wider block">
                                    Nilai Terkini (Setelah Revisi)
                                </span>
                                <span className="text-lg font-extrabold text-teal-700 dark:text-teal-300 mt-1 block">
                                    {formatCurrency(currentBudget)}
                                </span>
                                <span className="text-[11px] text-teal-600/70 dark:text-teal-400/70 mt-1 block">
                                    {isBudgetChanged ? 'Nilai setelah penyesuaian terakhir' : 'Total nominal RAB saat ini'}
                                </span>
                            </div>

                            {/* Selisih Perubahan */}
                            <div className={`rounded-xl p-4 border ${
                                !isBudgetChanged 
                                    ? 'bg-gray-50 dark:bg-gray-900/60 border-gray-100 dark:border-gray-700/60'
                                    : budgetDiff < 0 
                                        ? 'bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800/40 text-rose-700 dark:text-rose-300'
                                        : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-300'
                            }`}>
                                <span className="text-xs font-medium uppercase tracking-wider block opacity-80">
                                    Selisih / Perubahan Nilai
                                </span>
                                <span className="text-lg font-extrabold mt-1 flex items-center gap-1.5">
                                    {budgetDiff > 0 && <TrendingUp size={18} className="text-emerald-600" />}
                                    {budgetDiff < 0 && <TrendingDown size={18} className="text-rose-600" />}
                                    {isBudgetChanged ? formatCurrency(Math.abs(budgetDiff)) : 'Rp 0'}
                                </span>
                                <span className="text-[11px] opacity-70 mt-1 block">
                                    {!isBudgetChanged ? 'Tidak ada perubahan nominal' : budgetDiff > 0 ? 'Mengalami kenaikan anggaran' : 'Mengalami efisiensi / penurunan'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Dokumen Utama (Kertas) */}
                    <div className="bg-white dark:bg-gray-900 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        
                        {/* Header Dokumen */}
                        <div className="text-center py-8 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider underline underline-offset-4 decoration-2">
                                TAHUN ANGGARAN {dataRkat?.tahun_anggaran}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Nomor Dokumen: {dataRkat?.nomor_dokumen}</p>
                            <div className="mt-2 inline-block">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(dataRkat?.status_persetujuan)}`}>
                                    Status: {typeof dataRkat?.status_persetujuan === 'string' ? (dataRkat.status_persetujuan === 'Disetujui_Final' ? 'Disetujui RKAT' : dataRkat.status_persetujuan.replace(/_/g, ' ')) : '-'}
                                </span>
                            </div>
                        </div>

                        <div className="p-4 sm:p-8">
                            
                            {/* Tabel 1: Informasi Utama */}
                            <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-xl mb-8">
                                <table className="w-full text-sm text-left border-collapse">
                                    <tbody>
                                        <TableRow no="1" label="Unit Kerja / Sub Unit">{dataRkat?.unit?.nama_unit}</TableRow>
                                        
                                        <tr className="border-b border-gray-300 dark:border-gray-700">
                                            <td className="p-3 border-r border-gray-300 dark:border-gray-700 text-center text-gray-500 w-12" rowSpan="2">2</td>
                                            <td className="p-3 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 w-48" rowSpan="2">Program / Kegiatan</td>
                                            <td className="p-3 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 w-24">IKU</td>
                                            <td className="p-3 text-gray-800 dark:text-gray-200">{dataDetail?.iku?.nama_iku || '-'}</td>
                                        </tr>
                                        <tr className="border-b border-gray-300 dark:border-gray-700">
                                            <td className="p-3 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 w-24">IKK</td>
                                            <td className="p-3 text-gray-800 dark:text-gray-200">{dataDetail?.ikk?.nama_ikk || '-'}</td>
                                        </tr>

                                        <TableRow no="3" label="Judul Kegiatan" colSpan={2}>{dataDetail?.judul_kegiatan}</TableRow>
                                        <TableRow no="4" label="Latar Belakang" colSpan={2}>{dataDetail?.latar_belakang}</TableRow>
                                        <TableRow no="5" label="Rasionalisasi" colSpan={2}>{dataDetail?.rasional}</TableRow>
                                        <TableRow no="6" label="Tujuan" colSpan={2}>{dataDetail?.tujuan}</TableRow>
                                        <TableRow no="7" label="Mekanisme & Rancangan" colSpan={2}>{dataDetail?.mekanisme}</TableRow>
                                        <TableRow no="8" label="Jadwal Pelaksanaan" colSpan={2}>
                                            {formatPelaksanaanText(dataDetail?.jadwal_pelaksanaan_mulai, dataDetail?.jadwal_pelaksanaan_akhir)}
                                        </TableRow>
                                        <TableRow no="9" label="Lokasi Pelaksanaan" colSpan={2}>{dataDetail?.lokasi_pelaksanaan}</TableRow>
                                        
                                        {/* Row 10: Indikator */}
                                        <tr className="border-b border-gray-300 dark:border-gray-700">
                                            <td className="p-3 border-r border-gray-300 dark:border-gray-700 text-center text-gray-500 align-top">10</td>
                                            <td className="p-3 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 align-top">Target Capaian</td>
                                            <td colSpan={2} className="p-0">
                                                <div className="overflow-x-auto m-0 border-l-0">
                                                    {(() => {
                                                        const labels = dataRkat?.tahun_obj?.indikator_labels || { past: '2025', current: 'Tahun 2026', future: 'Akhir 2029' };
                                                        return (
                                                            <table className="w-full text-xs border-collapse">
                                                                <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                                                    <tr>
                                                                        <th rowSpan="2" className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center">Indikator</th>
                                                                        <th className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center w-20">{labels.past}</th>
                                                                        <th colSpan="2" className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center">{labels.current}</th>
                                                                        <th colSpan="2" className="p-2 border-b border-gray-300 dark:border-gray-700 text-center">{labels.future}</th>
                                                                    </tr>
                                                                    <tr>
                                                                        <th className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center">Capaian</th>
                                                                        <th className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center">Target</th>
                                                                        <th className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center">Capaian</th>
                                                                        <th className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center">Target</th>
                                                                        <th className="p-2 border-b border-gray-300 dark:border-gray-700 text-center">Capaian</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {indikators.map((ind, i) => (
                                                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                                                            <td className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">{ind.nama_indikator}</td>
                                                                            <td className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">{ind.past_capaian || '-'}</td>
                                                                            <td className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">{ind.current_target || '-'}</td>
                                                                            <td className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">{ind.current_capaian || '-'}</td>
                                                                            <td className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">{ind.future_target || '-'}</td>
                                                                            <td className="p-2 border-b border-gray-300 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">{ind.future_capaian || '-'}</td>
                                                                        </tr>
                                                                    ))}
                                                                    {indikators.length === 0 && (
                                                                        <tr><td colSpan="6" className="p-4 text-center text-gray-500 border-b border-gray-300 dark:border-gray-700">Tidak ada indikator</td></tr>
                                                                    )}
                                                                </tbody>
                                                            </table>
                                                        );
                                                    })()}
                                                </div>
                                            </td>
                                        </tr>

                                        <TableRow no="11" label="Keberlanjutan" colSpan={2}>{dataDetail?.target || '-'}</TableRow>
                                        <TableRow no="12" label="Penanggung Jawab (PIC)" colSpan={2}>
                                            <span className="font-semibold text-teal-700 dark:text-teal-400">
                                                {dataDetail?.pjawab || '-'}
                                            </span>
                                        </TableRow>
                                    </tbody>
                                </table>
                            </div>

                            <div className="text-center font-bold underline decoration-2 text-lg mb-4 text-gray-900 dark:text-gray-100">
                                RENCANA ANGGARAN
                            </div>

                            {/* Tabel 2: Rencana Anggaran */}
                            <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-xl mb-8">
                                <table className="w-full text-sm text-left border-collapse">
                                    <tbody>
                                        <TableRow label={<>Kegiatan<br/><span className="text-xs font-normal text-gray-500 italic">diisi sesuai RKA</span></>}>
                                            {dataDetail?.judul_kegiatan}
                                        </TableRow>
                                        <TableRow label={<>Target<br/><span className="text-xs font-normal text-gray-500 italic">diisi sesuai RKA</span></>}>
                                            {dataDetail?.target || '-'}
                                        </TableRow>
                                        <TableRow label="Jenis Kegiatan">
                                            <span className="rounded-lg bg-teal-50 px-3 py-1.5 font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">{dataDetail?.jenis_kegiatan || '-'}</span>
                                        </TableRow>
                                        <TableRow label="Dokumen Pendukung">
                                            {(() => {
                                                let docs = dataDetail?.dokumen_pendukung || [];
                                                if (typeof docs === 'string') {
                                                    try { docs = JSON.parse(docs); } catch { docs = docs.split(',').map((item) => item.trim()); }
                                                }
                                                if (!Array.isArray(docs)) docs = [];
                                                return docs.length ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {docs.map((doc, index) => {
                                                            const isObject = doc && typeof doc === 'object';
                                                            const label = isObject ? (doc.type === 'link' ? doc.url : (doc.name || 'Dokumen')) : String(doc);
                                                            const href = isObject && doc.type === 'link'
                                                                ? doc.url
                                                                : isObject && doc.type === 'file'
                                                                    ? route('daftar-ajuan.dokumen', [dataRkat.uuid, index])
                                                                    : null;
                                                            return href ? (
                                                                <a key={`${label}-${index}`} href={href} target="_blank" rel="noreferrer" className="rounded-lg border border-teal-200 px-3 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-50 dark:border-teal-800 dark:text-teal-300 dark:hover:bg-teal-900/30">{label}</a>
                                                            ) : (
                                                                <span key={`${label}-${index}`} className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 dark:border-gray-700 dark:text-gray-300">{label}</span>
                                                            );
                                                        })}
                                                    </div>
                                                ) : <span className="text-sm text-gray-500">Belum ada dokumen pendukung.</span>;
                                            })()}
                                        </TableRow>
                                        <TableRow label="Waktu Pelaksanaan">
                                            {formatPelaksanaanText(dataDetail?.jadwal_pelaksanaan_mulai, dataDetail?.jadwal_pelaksanaan_akhir)}
                                        </TableRow>
                                        <TableRow label="Anggaran">
                                            <span className="font-bold text-lg text-teal-700 dark:text-teal-400">
                                                {formatCurrency(dataRkat?.total_anggaran)}
                                            </span>
                                        </TableRow>
                                        <TableRow label="Pencairan Dana">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-4 h-4 rounded border flex items-center justify-center ${dataDetail?.jenis_pencairan === 'Bank' ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-400'}`}>{dataDetail?.jenis_pencairan === 'Bank' && '✓'}</span> 
                                                    Transfer ke Bank : {dataDetail?.nama_bank || '-'}
                                                </div>
                                                <div className="ml-6 text-gray-600 dark:text-gray-400">
                                                    No Rekening : {dataDetail?.nomor_rekening || '-'} (a.n {dataDetail?.atas_nama || '-'})
                                                </div>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className={`w-4 h-4 rounded border flex items-center justify-center ${dataDetail?.jenis_pencairan === 'Tunai' ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-400'}`}>{dataDetail?.jenis_pencairan === 'Tunai' && '✓'}</span> 
                                                    Tunai
                                                </div>
                                                {dataDetail?.jenis_pencairan === 'Tunai' && (
                                                    <div className="ml-6 mt-2 text-gray-600 dark:text-gray-400">
                                                        <div className="grid grid-cols-[140px_1fr] gap-1">
                                                            <span>Nama Pengusul</span>
                                                            <span>: {dataDetail?.pjawab || '-'}</span>
                                                            <span>Nama Pemberi</span>
                                                            <span>: BAUK</span>
                                                            <span>Nama Penerima</span>
                                                            <span>: {dataDetail?.nama_penerima || '-'}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </TableRow>
                                    </tbody>
                                </table>
                            </div>

                            <div className="font-bold text-gray-900 dark:text-gray-100 mb-2">Rincian Anggaran Biaya (RAB)</div>

                            {/* Tabel 3: RAB */}
                            <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-xl">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                        <tr>
                                            <th className="p-3 border-r border-b border-gray-300 dark:border-gray-700 text-center w-12">No.</th>
                                            <th className="p-3 border-r border-b border-gray-300 dark:border-gray-700 w-32">Kode Akun</th>
                                            <th className="p-3 border-r border-b border-gray-300 dark:border-gray-700">Keterangan</th>
                                            <th className="p-3 border-r border-b border-gray-300 dark:border-gray-700 text-center w-20">Vol</th>
                                            <th className="p-3 border-r border-b border-gray-300 dark:border-gray-700 text-center w-24">Satuan</th>
                                            <th className="p-3 border-r border-b border-gray-300 dark:border-gray-700 text-center w-20">Vol 2</th>
                                            <th className="p-3 border-r border-b border-gray-300 dark:border-gray-700 text-center w-24">Satuan 2</th>
                                            <th className="p-3 border-r border-b border-gray-300 dark:border-gray-700 text-right w-36">Biaya Satuan</th>
                                            <th className="p-3 border-b border-gray-300 dark:border-gray-700 text-right w-40">Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rabItems.map((rab, i) => (
                                            <tr key={i} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="p-3 border-r border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400">{i + 1}</td>
                                                <td className="p-3 border-r border-gray-200 dark:border-gray-700 font-mono text-gray-800 dark:text-gray-300 text-xs">{rab.kode_anggaran || '-'}</td>
                                                <td className="p-3 border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300">{rab.deskripsi_item}</td>
                                                <td className="p-3 border-r border-gray-200 dark:border-gray-700 text-center text-gray-800 dark:text-gray-300">{rab.volume}</td>
                                                <td className="p-3 border-r border-gray-200 dark:border-gray-700 text-center text-gray-800 dark:text-gray-300">{rab.satuan}</td>
                                                <td className="p-3 border-r border-gray-200 dark:border-gray-700 text-center text-gray-800 dark:text-gray-300">{rab.volume2 ?? '-'}</td>
                                                <td className="p-3 border-r border-gray-200 dark:border-gray-700 text-center text-gray-800 dark:text-gray-300">{rab.satuan2 || '-'}</td>
                                                <td className="p-3 border-r border-gray-200 dark:border-gray-700 text-right text-gray-800 dark:text-gray-300">{formatCurrency(rab.harga_satuan)}</td>
                                                <td className="p-3 text-right font-medium text-gray-900 dark:text-gray-200">{formatCurrency(rab.sub_total)}</td>
                                            </tr>
                                        ))}
                                        {rabItems.length === 0 && (
                                            <tr><td colSpan="9" className="p-6 text-center text-gray-500">Tidak ada rincian RAB</td></tr>
                                        )}
                                    </tbody>
                                    <tfoot className="bg-gray-100 dark:bg-gray-800 font-bold">
                                        <tr>
                                            <td colSpan="8" className="p-3 text-right text-gray-800 dark:text-gray-200 uppercase">Total</td>
                                            <td className="p-3 text-right text-teal-700 dark:text-teal-400">
                                                {formatCurrency(rabItems.reduce((acc, curr) => acc + (parseFloat(curr?.sub_total) || 0), 0))}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                        </div>
                    </div>

                    {/* FITUR DUA ARAH: RUANG DISKUSI CATATAN & KLARIFIKASI REVISI */}
                    <div className="mt-8 bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700 mb-6">
                            <div>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <MessageSquare size={20} className="text-teal-600 dark:text-teal-400" />
                                    Diskusi & Catatan
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Ruang komunikasi interaktif antara Pengusul Unit dan Reviewer / Approver untuk membahas poin revisi.
                                </p>
                            </div>
                            <span className="text-xs bg-teal-50 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-full font-semibold">
                                {komentars.length} Pesan
                            </span>
                        </div>

                        {/* Daftar Percakapan Komentar */}
                        <div className="space-y-4 max-h-[420px] overflow-y-auto pr-2 mb-6">
                            {komentars.length > 0 ? (
                                komentars.map((kom, idx) => {
                                    const isCurrentUser = kom.id_user === auth.user.id_user;
                                    const roleName = kom.user?.peran ? kom.user.peran.replace(/_/g, ' ') : 'Pengguna';
                                    const initials = kom.user?.nama_lengkap 
                                        ? kom.user.nama_lengkap.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
                                        : 'U';

                                    return (
                                        <div 
                                            key={kom.id_komentar || idx}
                                            className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                                        >
                                            {/* Avatar Inisial */}
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-sm ${
                                                isCurrentUser 
                                                    ? 'bg-teal-600 text-white' 
                                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                                            }`}>
                                                {initials}
                                            </div>

                                            {/* Bubble Pesan */}
                                            <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 space-y-1 shadow-xs ${
                                                isCurrentUser 
                                                    ? 'bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-800/60 rounded-tr-none text-gray-900 dark:text-gray-100'
                                                    : 'bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-tl-none text-gray-900 dark:text-gray-100'
                                            }`}>
                                                <div className="flex items-center gap-2 flex-wrap text-xs">
                                                    <span className="font-bold text-gray-900 dark:text-white">
                                                        {kom.user?.nama_lengkap || 'Pengguna'}
                                                    </span>
                                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-gray-200/80 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                        {roleName}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 ml-auto">
                                                        {formatDateTime(kom.created_at)}
                                                    </span>
                                                </div>
                                                <p className="text-sm whitespace-pre-wrap leading-relaxed pt-1">
                                                    {kom.pesan}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8 text-gray-400 dark:text-gray-500 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <MessageSquare size={28} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-sm font-medium">Belum ada diskusi atau catatan tambahan pada dokumen ini.</p>
                                    <p className="text-xs text-gray-400 mt-1">Gunakan formulir di bawah untuk mengirim catatan revisi atau tanggapan klarifikasi.</p>
                                </div>
                            )}
                        </div>

                        {/* Input Kirim Tanggapan / Diskusi Dua Arah */}
                        <form onSubmit={handleKirimKomentar} className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <div className="relative">
                                <textarea
                                    rows="3"
                                    value={pesanKomentar}
                                    onChange={(e) => setPesanKomentar(e.target.value)}
                                    placeholder="Tulis catatan revisi, instruksi perbaikan, atau klarifikasi jawaban pengusul di sini..."
                                    className="w-full bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 dark:text-white transition-all resize-none"
                                ></textarea>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-400">
                                    Pesan akan otomatis tersimpan dalam log percakapan dokumen ini.
                                </span>
                                <button
                                    type="submit"
                                    disabled={isSendingKomentar || !pesanKomentar.trim()}
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition shadow-sm"
                                >
                                    <Send size={15} /> {isSendingKomentar ? 'Mengirim...' : 'Kirim Catatan'}
                                </button>
                            </div>
                        </form>
                    </div>
 
                    {/* Tracking Status Timeline */}
                    <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                            Status Persetujuan
                        </h4>
                        
                        <div className="space-y-4">
                            {(() => {
                                let timelineVariant = 'success';
                                if (dataRkat?.status_persetujuan === 'Revisi') timelineVariant = 'warning';
                                if (dataRkat?.status_persetujuan === 'Ditolak') timelineVariant = 'error';

                                const steps = dataRkat?.unit?.approval_path?.steps || dataRkat?.unit?.approvalPath?.steps || [];
                                const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

                                return (
                                    <>
                                        <TimelineItem 
                                            label="Pengajuan" 
                                            date={dataRkat?.tanggal_pengajuan} 
                                            isActive={dataRkat?.tanggal_pengajuan != null} 
                                            variant={timelineVariant}
                                        />
                                        
                                        {sortedSteps.length > 0 ? (
                                            sortedSteps.map((step, idx) => {
                                                const stepDate = dataRkat?.approval_dates?.[step.step_name];
                                                const isLast = idx === sortedSteps.length - 1;
                                                return (
                                                    <TimelineItem 
                                                        key={step.id || idx}
                                                        label={step.step_name} 
                                                        date={stepDate} 
                                                        isActive={stepDate != null} 
                                                        isFinal={isLast}
                                                        variant={timelineVariant}
                                                    />
                                                );
                                            })
                                        ) : (
                                            <div className="text-gray-500 italic text-sm py-4">Belum ada alur persetujuan yang dikonfigurasi.</div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    </div>
 
                    {/* Log Aktivitas / Persetujuan */}
                    {logs.length > 0 && (
                        <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 p-6">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                                Riwayat Log Persetujuan
                            </h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                        <tr>
                                            <th className="p-3 border-b border-gray-200 dark:border-gray-600">Waktu & Tanggal</th>
                                            <th className="p-3 border-b border-gray-200 dark:border-gray-600">Aksi</th>
                                            <th className="p-3 border-b border-gray-200 dark:border-gray-600">Oleh</th>
                                            <th className="p-3 border-b border-gray-200 dark:border-gray-600">Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log, idx) => (
                                            <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                <td className="p-3 text-gray-600 dark:text-gray-400 whitespace-nowrap font-medium">
                                                    {formatDateTime(log.created_at)}
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                                                        log.aksi === 'Setuju' || log.aksi === 'Disetujui' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                                                        log.aksi === 'Revisi' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                                                        log.aksi === 'Tolak' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {log.aksi}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-gray-800 dark:text-gray-300">
                                                    <div className="font-semibold">{log.approver?.nama_lengkap || 'Unknown'}</div>
                                                    <div className="text-xs text-gray-500">({typeof log.level_persetujuan === 'string' ? log.level_persetujuan.replace(/_/g, ' ') : log.level_persetujuan})</div>
                                                </td>
                                                <td className="p-3 text-gray-800 dark:text-gray-300 italic">{log.catatan || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
 
                    {/* Riwayat Revisi / Versi Sebelumnya */}
                    {history.length > 0 && (
                        <div className="mt-8 bg-gray-50 dark:bg-gray-800/30 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <History size={20} className="text-teal-600" />
                                Riwayat Dokumen RKA & Versi Sebelumnya
                            </h3>
                            <div className="space-y-3">
                                {history.map((rev) => (
                                    <div key={rev.id_header} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{rev.nomor_dokumen}</span>
                                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getStatusColor(rev.status_persetujuan)}`}>
                                                    {rev.status_persetujuan}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                Nominal: <strong className="text-gray-700 dark:text-gray-300">{formatCurrency(rev.total_anggaran)}</strong> • Diarsipkan: {formatDateTime(rev.created_at)}
                                            </span>
                                        </div>
                                        <Link
                                            href={route('daftar-ajuan.show', rev.uuid || rev.id_header)}
                                            className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900/50 transition-colors self-start sm:self-auto"
                                        >
                                            Lihat Versi Ini
                                        </Link>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic">
                                * Daftar di atas menampilkan riwayat revisi (versi-versi sebelumnya) dari pengajuan RKA ini.
                            </p>
                        </div>
                    )}
 
                    {/* --- STICKY FOOTER --- */}
                    <div className="sticky bottom-4 z-30 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3 mt-6">
                        <Link
                            href={route('daftar-ajuan.index')}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm flex items-center px-4 py-2 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 self-start sm:self-auto"
                        >
                            <ArrowLeft size={16} className="mr-2" /> Kembali
                        </Link>
                        
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                            {/* Tombol Export PDF */}
                            <a 
                                href={dataRkat?.uuid ? route('daftar-ajuan.export', dataRkat.uuid) : '#'}
                                target="_blank"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl font-semibold text-sm text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Download size={18} /> Export PDF
                            </a>

                            {/* Tombol Edit di sebelah kanan tombol Export PDF saat status Draft / Revisi */}
                            {canEdit && (
                                <Link
                                    href={route('daftar-ajuan.edit', dataRkat?.uuid || dataRkat?.id_header)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-md shadow-amber-500/20 transition-colors"
                                >
                                    <Edit2 size={18} /> Edit Pengajuan
                                </Link>
                            )}

                            {/* Tombol Ajukan RKAT */}
                            {canEdit && (
                                <button
                                    type="button"
                                    disabled={isSubmitting}
                                    onClick={() => handleAjukan(dataRkat)}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/30 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                >
                                    <Send size={18} /> {isSubmitting ? 'Mengirim...' : 'Ajukan RKAT'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function TimelineItem({ label, date, isActive, isFinal = false, variant = 'success' }) {
    let colorClass = 'bg-teal-500 border-teal-500';
    let lineClass = 'bg-teal-500';
    
    if (variant === 'warning') {
        colorClass = 'bg-yellow-500 border-yellow-500';
        lineClass = 'bg-yellow-500';
    } else if (variant === 'error') {
        colorClass = 'bg-red-500 border-red-500';
        lineClass = 'bg-red-500';
    }

    return (
        <div className="flex gap-4 relative">
            {!isFinal && (
                <div className={`absolute top-6 bottom-[-16px] left-[11px] w-0.5 ${isActive ? lineClass : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            )}
            <div className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 ${isActive ? colorClass : 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600'}`}>
                {isActive && <div className="w-2 h-2 bg-white rounded-full"></div>}
            </div>
            <div className="-mt-1 pb-4">
                <p className={`font-semibold text-sm ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>{label}</p>
                {date && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatDateTime(date)}</p>}
            </div>
        </div>
    );
}
