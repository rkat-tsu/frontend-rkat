import React, { useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft } from 'lucide-react';

const formatCurrency = (amount) => {
    if (!amount) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
};

const ReadOnlyField = ({ label, value, isTextarea = false }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {isTextarea ? (
            <div className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 min-h-[100px] whitespace-pre-wrap">
                {value || '-'}
            </div>
        ) : (
            <div className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 min-h-[38px]">
                {value || '-'}
            </div>
        )}
    </div>
);

export default function Show({ auth, rkat = {} }) {
    const dataRkat = rkat.data || rkat;

    const rawDetail = dataRkat?.rkat_details || dataRkat?.rkatDetails || dataRkat?.detail;
    const dataDetail = Array.isArray(rawDetail) ? (rawDetail[0] || {}) : (rawDetail || {});

    const indikators = dataDetail?.indikators || [];
    const rabItems = dataDetail?.rab_items || dataDetail?.rabItems || [];

    useEffect(() => {
        // Fitur Debugging: Anda bisa melihat struktur data ini di Console Browser (F12)
        console.log("Header RKAT:", dataRkat);
        console.log("Detail RKAT Terbaca:", dataDetail);
    }, [dataRkat, dataDetail]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Detail Pengajuan RKAT</h2>}
        >
            <Head title={`Detail RKAT - ${dataRkat?.nomor_dokumen || 'Baru'}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <div className="mb-6">
                        <Link
                            href={route('rkat.index')}
                            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-sm font-medium"
                        >
                            <ArrowLeft size={16} />
                            Kembali ke Daftar
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 space-y-8">

                        {/* Section 1: Informasi Dasar Header */}
                        <section>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                                Informasi Dokumen (Header)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <ReadOnlyField label="Nomor Dokumen" value={dataRkat?.nomor_dokumen} />
                                <ReadOnlyField label="Tahun Anggaran" value={dataRkat?.tahun_anggaran} />
                                <ReadOnlyField label="Unit Pengaju" value={dataRkat?.unit?.nama_unit} />
                                <ReadOnlyField label="Diajukan Oleh" value={dataRkat?.user?.name} />
                                <ReadOnlyField label="Status Persetujuan" value={dataRkat?.status_persetujuan} />
                                <ReadOnlyField label="Tanggal Pengajuan" value={formatDate(dataRkat?.tanggal_pengajuan)} />
                                <ReadOnlyField label="Total Anggaran" value={formatCurrency(dataRkat?.total_anggaran)} />
                            </div>
                        </section>

                        {/* Section 2: Detail Kegiatan */}
                        <section>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                                Rincian Kegiatan (Detail)
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <ReadOnlyField label="Judul Kegiatan" value={dataDetail?.judul_kegiatan} />
                                    <ReadOnlyField label="Deskripsi Singkat" value={dataDetail?.deskripsi_kegiatan} />
                                </div>

                                <ReadOnlyField label="Latar Belakang" value={dataDetail?.latar_belakang} isTextarea />
                                <ReadOnlyField label="Rasional" value={dataDetail?.rasional} isTextarea />
                                <ReadOnlyField label="Tujuan" value={dataDetail?.tujuan} isTextarea />
                                <ReadOnlyField label="Mekanisme Pelaksanaan" value={dataDetail?.mekanisme} isTextarea />

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <ReadOnlyField label="Jadwal Mulai" value={formatDate(dataDetail?.jadwal_pelaksanaan_mulai)} />
                                    <ReadOnlyField label="Jadwal Selesai" value={formatDate(dataDetail?.jadwal_pelaksanaan_akhir)} />
                                    <ReadOnlyField label="Lokasi Pelaksanaan" value={dataDetail?.lokasi_pelaksanaan} />
                                    <ReadOnlyField label="Jenis Kegiatan" value={dataDetail?.jenis_kegiatan} />
                                    <ReadOnlyField label="Dokumen Pendukung" value={Array.isArray(dataDetail?.dokumen_pendukung) ? dataDetail.dokumen_pendukung.join(', ') : dataDetail?.dokumen_pendukung} />
                                    <ReadOnlyField label="Penanggung Jawab" value={dataDetail?.pjawab} />
                                    <ReadOnlyField label="Target Output" value={dataDetail?.target} />
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Indikator Kinerja (IKU & IKK) */}
                        <section>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                                Indikator Kinerja & Keberhasilan
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <ReadOnlyField label="Indikator Kinerja Utama (IKU)" value={dataDetail?.iku?.nama_iku} />
                                <ReadOnlyField label="Indikator Kinerja Kegiatan (IKK)" value={dataDetail?.ikk?.nama_ikk} />
                            </div>

                            <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-gray-200">Indikator Keberhasilan</th>
                                            <th className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-200">Kondisi 2025</th>
                                            <th className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-200">Target 2026</th>
                                            <th className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-200">Capaian 2026</th>
                                            <th className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-200">Target 2029</th>
                                            <th className="px-4 py-3 text-center font-medium text-gray-700 dark:text-gray-200">Capaian 2029</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {indikators.length > 0 ? indikators.map((ind, idx) => (
                                            <tr key={idx} className="bg-white dark:bg-gray-800">
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{ind.nama_indikator}</td>
                                                <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{ind.capai_2025 || '-'}</td>
                                                <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{ind.target_2026 || '-'}</td>
                                                <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{ind.capai_2026 || '-'}</td>
                                                <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{ind.target_2029 || '-'}</td>
                                                <td className="px-4 py-3 text-center text-gray-700 dark:text-gray-300">{ind.capai_2029 || '-'}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-4 text-center text-gray-500">Tidak ada data indikator.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Section 4: Pencairan Dana */}
                        <section>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                                Informasi Pencairan Dana
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <ReadOnlyField label="Jenis Pencairan" value={dataDetail?.jenis_pencairan} />
                                {dataDetail?.jenis_pencairan === 'Bank' && (
                                    <>
                                        <ReadOnlyField label="Nama Bank" value={dataDetail?.nama_bank} />
                                        <ReadOnlyField label="Nomor Rekening" value={dataDetail?.nomor_rekening} />
                                        <ReadOnlyField label="Atas Nama" value={dataDetail?.atas_nama} />
                                    </>
                                )}
                            </div>
                        </section>

                        {/* Section 5: Rincian Anggaran (RAB) */}
                        <section>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                                Rincian Anggaran Biaya (RAB)
                            </h3>
                            <div className="overflow-x-auto rounded border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full text-sm divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-teal-50 dark:bg-teal-900/30">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-teal-800 dark:text-teal-200">Kode Akun</th>
                                            <th className="px-4 py-3 text-left font-medium text-teal-800 dark:text-teal-200">Kebutuhan / Deskripsi</th>
                                            <th className="px-4 py-3 text-right font-medium text-teal-800 dark:text-teal-200">Volume</th>
                                            <th className="px-4 py-3 text-left font-medium text-teal-800 dark:text-teal-200">Satuan</th>
                                            <th className="px-4 py-3 text-right font-medium text-teal-800 dark:text-teal-200">Harga Satuan</th>
                                            <th className="px-4 py-3 text-right font-medium text-teal-800 dark:text-teal-200">Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {rabItems.length > 0 ? rabItems.map((rab, idx) => (
                                            <tr key={idx} className="bg-white dark:bg-gray-800">
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{rab.kode_anggaran}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{rab.deskripsi_item}</td>
                                                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{rab.volume}</td>
                                                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{rab.satuan}</td>
                                                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{formatCurrency(rab.harga_satuan)}</td>
                                                <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-gray-100">{formatCurrency(rab.sub_total)}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="6" className="px-4 py-4 text-center text-gray-500">Tidak ada rincian anggaran.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-700 font-bold">
                                        <tr>
                                            <td colSpan="5" className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">TOTAL KESELURUHAN</td>
                                            <td className="px-4 py-3 text-right text-teal-600 dark:text-teal-400">
                                                {formatCurrency(rabItems.reduce((acc, curr) => acc + parseFloat(curr.sub_total), 0))}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}