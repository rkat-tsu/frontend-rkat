import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, Download, AlertTriangle } from 'lucide-react';

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

export default function Show({ auth, rkat = {} }) {
    const dataRkat = rkat.data || rkat;
    const rawDetail = dataRkat?.rkat_details || dataRkat?.rkatDetails || dataRkat?.detail;
    const dataDetail = Array.isArray(rawDetail) ? (rawDetail[0] || {}) : (rawDetail || {});

    const indikators = Array.isArray(dataDetail?.indikators) ? dataDetail.indikators : [];
    const rabItems = Array.isArray(dataDetail?.rab_items) ? dataDetail.rab_items : (Array.isArray(dataDetail?.rabItems) ? dataDetail.rabItems : []);
    
    const logs = Array.isArray(dataRkat?.log_persetujuans) ? dataRkat.log_persetujuans : (Array.isArray(dataRkat?.logPersetujuans) ? dataRkat.logPersetujuans : []);
    const notes = logs.filter(l => l?.aksi === 'Revisi' || l?.aksi === 'Tolak');

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Detail Pengajuan RKAT</h2>}
        >
            <Head title={`Detail RKAT - ${dataRkat?.nomor_dokumen || 'Baru'}`} />

            <div className="py-6">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Toolbar */}
                    <div className="flex justify-between items-center mb-6">
                        <Link
                            href={route('rkat.index')}
                            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm font-medium transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Kembali ke Daftar
                        </Link>

                        <a 
                            href={dataRkat?.uuid ? route('rkat.export', dataRkat.uuid) : '#'}
                            target="_blank"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-200 border border-transparent rounded-lg font-semibold text-xs text-white dark:text-gray-800 uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-white transition"
                        >
                            <Download size={16} /> Export PDF
                        </a>
                    </div>

                    {/* Catatan Revisi / Tolak */}
                    {notes.length > 0 && (
                        <div className="mb-6 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-5 shadow-sm">
                            <h3 className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-lg mb-3">
                                <AlertTriangle size={20} />
                                Catatan Revisi / Penolakan
                            </h3>
                            <div className="space-y-3">
                                {notes.map((note, idx) => (
                                    <div key={idx} className="bg-white dark:bg-gray-800 p-4 rounded-md border border-amber-100 dark:border-amber-900/50 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                {note.approver?.nama_lengkap || 'Unknown'} 
                                                <span className="text-gray-500 dark:text-gray-400 text-sm ml-2 font-normal">
                                                    ({typeof note.level_persetujuan === 'string' ? note.level_persetujuan.replace(/_/g, ' ') : 'Unknown'})
                                                </span>
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${note.aksi === 'Tolak' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {note.aksi}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 text-sm italic border-l-4 border-amber-300 pl-3 py-1">
                                            "{note.catatan}"
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Dokumen Utama (Kertas) */}
                    <div className="bg-white dark:bg-gray-900 shadow-lg sm:rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                        
                        {/* Header Dokumen */}
                        <div className="text-center py-8 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider underline underline-offset-4 decoration-2">
                                TAHUN ANGGARAN {dataRkat?.tahun_anggaran}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Nomor Dokumen: {dataRkat?.nomor_dokumen}</p>
                            <div className="mt-2 inline-block">
                                <span className={`px-3 py-1 text-xs font-bold rounded-full border 
                                    ${dataRkat.status_persetujuan === 'Disetujui_Final' ? 'bg-green-100 text-green-800 border-green-200' : 
                                      dataRkat?.status_persetujuan === 'Ditolak' ? 'bg-red-100 text-red-800 border-red-200' : 
                                      dataRkat?.status_persetujuan === 'Revisi' ? 'bg-amber-100 text-amber-800 border-amber-200' : 
                                      'bg-blue-100 text-blue-800 border-blue-200'}`}>
                                    Status: {typeof dataRkat?.status_persetujuan === 'string' ? dataRkat.status_persetujuan.replace(/_/g, ' ') : '-'}
                                </span>
                            </div>
                        </div>

                        <div className="p-0 sm:p-8">
                            
                            {/* Tabel 1: Informasi Utama */}
                            <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-md mb-8">
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
                                            {formatDate(dataDetail?.jadwal_pelaksanaan_mulai)} s.d. {formatDate(dataDetail?.jadwal_pelaksanaan_akhir)}
                                        </TableRow>
                                        <TableRow no="9" label="Lokasi Pelaksanaan" colSpan={2}>{dataDetail?.lokasi_pelaksanaan}</TableRow>
                                        
                                        {/* Row 10: Indikator */}
                                        <tr className="border-b border-gray-300 dark:border-gray-700">
                                            <td className="p-3 border-r border-gray-300 dark:border-gray-700 text-center text-gray-500 align-top">10</td>
                                            <td className="p-3 font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 align-top">Target Capaian</td>
                                            <td colSpan={2} className="p-0">
                                                <div className="overflow-x-auto m-0 border-l-0">
                                                    <table className="w-full text-xs border-collapse">
                                                        <thead className="bg-gray-100 dark:bg-gray-800">
                                                            <tr>
                                                                <th rowSpan="2" className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center">Indikator</th>
                                                                <th className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center w-20">2025</th>
                                                                <th colSpan="2" className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center">Tahun 2026</th>
                                                                <th colSpan="2" className="p-2 border-b border-gray-300 dark:border-gray-700 text-center">Akhir 2029</th>
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
                                                                    <td className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">{ind.capai_2025 || '-'}</td>
                                                                    <td className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">{ind.target_2026 || '-'}</td>
                                                                    <td className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">{ind.capai_2026 || '-'}</td>
                                                                    <td className="p-2 border-r border-b border-gray-300 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">{ind.target_2029 || '-'}</td>
                                                                    <td className="p-2 border-b border-gray-300 dark:border-gray-700 text-center text-gray-700 dark:text-gray-300">{ind.capai_2029 || '-'}</td>
                                                                </tr>
                                                            ))}
                                                            {indikators.length === 0 && (
                                                                <tr><td colSpan="6" className="p-4 text-center text-gray-500 border-b border-gray-300 dark:border-gray-700">Tidak ada indikator</td></tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </td>
                                        </tr>

                                        <TableRow no="11" label="Keberlanjutan" colSpan={2}>{dataDetail?.target || '-'}</TableRow>
                                        <TableRow no="12" label="Penanggung Jawab" colSpan={2}>{dataDetail?.pjawab}</TableRow>
                                    </tbody>
                                </table>
                            </div>

                            <div className="text-center font-bold underline decoration-2 text-lg mb-4 text-gray-900 dark:text-gray-100">
                                RENCANA ANGGARAN
                            </div>

                            {/* Tabel 2: Rencana Anggaran */}
                            <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-md mb-8">
                                <table className="w-full text-sm text-left border-collapse">
                                    <tbody>
                                        <TableRow label={<>Kegiatan<br/><span className="text-xs font-normal text-gray-500 italic">diisi sesuai RKA</span></>}>
                                            {dataDetail?.judul_kegiatan}
                                        </TableRow>
                                        <TableRow label={<>Target<br/><span className="text-xs font-normal text-gray-500 italic">diisi sesuai RKA</span></>}>
                                            {dataDetail?.target || '-'}
                                        </TableRow>
                                        <TableRow label="Jenis Kegiatan">
                                            <div className="flex gap-6">
                                                <span className="flex items-center gap-2">
                                                    <span className={`w-4 h-4 rounded border flex items-center justify-center ${dataDetail?.jenis_kegiatan === 'Rutin' ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-400'}`}>{dataDetail?.jenis_kegiatan === 'Rutin' && '✓'}</span> Rutin
                                                </span>
                                                <span className="flex items-center gap-2">
                                                    <span className={`w-4 h-4 rounded border flex items-center justify-center ${dataDetail?.jenis_kegiatan === 'Inovasi' ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-400'}`}>{dataDetail?.jenis_kegiatan === 'Inovasi' && '✓'}</span> Inovasi
                                                </span>
                                            </div>
                                        </TableRow>
                                        <TableRow label="Dokumen Pendukung">
                                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                {['Pengajuan Rutin', 'Proposal', 'TOR', 'Usulan'].map(doc => {
                                                    let docs = [];
                                                    if (Array.isArray(dataDetail?.dokumen_pendukung)) {
                                                        docs = dataDetail.dokumen_pendukung;
                                                    } else if (dataDetail?.dokumen_pendukung) {
                                                        try {
                                                            docs = JSON.parse(dataDetail.dokumen_pendukung);
                                                        } catch (e) {
                                                            if (typeof dataDetail.dokumen_pendukung === 'string') {
                                                                docs = dataDetail.dokumen_pendukung.split(',').map(s => s.trim());
                                                            }
                                                        }
                                                    }
                                                    
                                                    if (!Array.isArray(docs)) {
                                                        docs = typeof docs === 'string' ? [docs] : [];
                                                    }
                                                    
                                                    const isChecked = docs.includes(doc);
                                                    return (
                                                        <span key={doc} className="flex items-center gap-2">
                                                            <span className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-teal-500 border-teal-500 text-white' : 'border-gray-400'}`}>{isChecked && '✓'}</span> {doc}
                                                        </span>
                                                    )
                                                })}
                                            </div>
                                        </TableRow>
                                        <TableRow label="Waktu Pelaksanaan">
                                            {formatDate(dataDetail?.jadwal_pelaksanaan_mulai)} s.d {formatDate(dataDetail?.jadwal_pelaksanaan_akhir)}
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
                                            </div>
                                        </TableRow>
                                    </tbody>
                                </table>
                            </div>

                            <div className="font-bold text-gray-900 dark:text-gray-100 mb-2">Rincian Anggaran Biaya (RAB)</div>

                            {/* Tabel 3: RAB */}
                            <div className="overflow-x-auto border border-gray-300 dark:border-gray-700 rounded-md">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                        <tr>
                                            <th className="p-3 border-r border-b border-gray-300 dark:border-gray-700 text-center w-12">No.</th>
                                            <th className="p-3 border-r border-b border-gray-300 dark:border-gray-700 w-32">Kode Akun</th>
                                            <th className="p-3 border-r border-b border-gray-300 dark:border-gray-700">Keterangan</th>
                                            <th className="p-3 border-r border-b border-gray-300 dark:border-gray-700 text-center w-20">Vol</th>
                                            <th className="p-3 border-r border-b border-gray-300 dark:border-gray-700 text-center w-24">Satuan</th>
                                            <th className="p-3 border-r border-b border-gray-300 dark:border-gray-700 text-right w-36">Biaya Satuan</th>
                                            <th className="p-3 border-b border-gray-300 dark:border-gray-700 text-right w-40">Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rabItems.map((rab, i) => (
                                            <tr key={i} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                                                <td className="p-3 border-r border-gray-200 dark:border-gray-700 text-center text-gray-600 dark:text-gray-400">{i + 1}</td>
                                                <td className="p-3 border-r border-gray-200 dark:border-gray-700 font-mono text-gray-800 dark:text-gray-300 text-xs">{rab.kode_anggaran}</td>
                                                <td className="p-3 border-r border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300">{rab.deskripsi_item}</td>
                                                <td className="p-3 border-r border-gray-200 dark:border-gray-700 text-center text-gray-800 dark:text-gray-300">{rab.volume}</td>
                                                <td className="p-3 border-r border-gray-200 dark:border-gray-700 text-center text-gray-800 dark:text-gray-300">{rab.satuan}</td>
                                                <td className="p-3 border-r border-gray-200 dark:border-gray-700 text-right text-gray-800 dark:text-gray-300">{formatCurrency(rab.harga_satuan)}</td>
                                                <td className="p-3 text-right font-medium text-gray-900 dark:text-gray-200">{formatCurrency(rab.sub_total)}</td>
                                            </tr>
                                        ))}
                                        {rabItems.length === 0 && (
                                            <tr><td colSpan="7" className="p-6 text-center text-gray-500">Tidak ada rincian RAB</td></tr>
                                        )}
                                    </tbody>
                                    <tfoot className="bg-gray-100 dark:bg-gray-800 font-bold">
                                        <tr>
                                            <td colSpan="6" className="p-3 text-right text-gray-800 dark:text-gray-200 uppercase">Total</td>
                                            <td className="p-3 text-right text-teal-700 dark:text-teal-400">
                                                {formatCurrency(rabItems.reduce((acc, curr) => acc + (parseFloat(curr?.sub_total) || 0), 0))}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}