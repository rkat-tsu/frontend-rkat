import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import React from 'react';
import { 
    Printer, 
    Edit, 
    ArrowLeft, 
    Calendar, 
    MapPin, 
    User, 
    CheckCircle, 
    AlertCircle,
    FileText,
    TrendingUp,
    Briefcase
} from 'lucide-react';

// --- HELPER FUNCTIONS ---
const formatRupiah = (angka) => {
    const number = Number(angka) || 0;
    return `Rp. ${number.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
};

const StatusBadge = ({ status }) => {
    const colors = {
        'Draft': 'bg-gray-100 text-gray-800 border-gray-200',
        'Diajukan': 'bg-blue-100 text-blue-800 border-blue-200',
        'Disetujui': 'bg-green-100 text-green-800 border-green-200',
        'Revisi': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        'Ditolak': 'bg-red-100 text-red-800 border-red-200',
    };

    const style = colors[status] || colors['Draft']; 
    
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${style}`}>
            {status}
        </span>
    );
};

// --- UI COMPONENTS ---
const InfoCard = ({ label, value, icon: Icon, fullWidth = false, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700 shadow-sm ${fullWidth ? 'col-span-full' : ''} ${className}`}>
        <div className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1 flex items-center gap-2">
            {Icon && <Icon size={14} />}
            {label}
        </div>
        <div className="text-gray-900 dark:text-gray-100 font-medium text-base whitespace-pre-wrap leading-relaxed">
            {value || '-'}
        </div>
    </div>
);

const SectionTitle = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-2 mb-4 mt-8 pb-2 border-b border-gray-200 dark:border-gray-700">
        <div className="p-1.5 bg-teal-50 dark:bg-teal-900/30 rounded text-teal-600 dark:text-teal-400">
            {Icon && <Icon size={20} />}
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
    </div>
);

export default function Show({ auth, rkat }) {
    const detail = rkat.detail || {};
    
    // LOGIC: Mengambil indikator (bisa dari relasi baru 'indikators' atau fallback ke array kosong)
    const indicators = detail.indikators || []; 
    const rabItems = detail.rab_items || []; // Pastikan case snake_case/camelCase sesuai Controller

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Detail Pengajuan RKAT
                    </h2>
                    <div className="flex gap-2">
                         <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-md text-sm transition shadow-sm">
                            <Printer size={16} />
                            <span>Cetak</span>
                        </button>
                        
                        {['Draft', 'Revisi'].includes(rkat.status_persetujuan) && (
                            <Link 
                                href={route('rkat.edit', rkat.id_header)} // Pastikan route edit ada
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md text-sm transition shadow-sm"
                            >
                                <Edit size={16} />
                                <span>Edit</span>
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Detail RKAT - ${detail.judul_kegiatan || 'Untitled'}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* 1. HEADER UTAMA (Status & Info Dasar) */}
                    <div className="bg-white dark:bg-gray-800 p-6 shadow-sm sm:rounded-lg border-l-4 border-teal-500 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="text-sm text-gray-500">Nomor Dokumen</div>
                            <div className="text-xl font-bold font-mono text-gray-800 dark:text-gray-200">
                                {rkat.nomor_dokumen || 'DRAFT'}
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-6 md:items-center w-full md:w-auto">
                            <div>
                                <div className="text-sm text-gray-500">Unit Pengusul</div>
                                <div className="font-semibold">{rkat.unit?.nama_unit}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Tahun Anggaran</div>
                                <div className="font-semibold">{rkat.tahun_anggaran}</div>
                            </div>
                            <div className="flex flex-col items-start md:items-end">
                                <div className="text-sm text-gray-500 mb-1">Status</div>
                                <StatusBadge status={rkat.status_persetujuan} />
                            </div>
                        </div>
                    </div>

                    {/* 2. KONTEN DETAIL */}
                    <div className="bg-white dark:bg-gray-800 p-8 shadow-sm sm:rounded-lg">
                        
                        {/* Judul & Deskripsi */}
                        <div className="mb-6 border-b border-gray-100 dark:border-gray-700 pb-6">
                             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {detail.judul_kegiatan}
                                </h1>
                                <div className="text-left md:text-right p-3 bg-teal-50 dark:bg-teal-900/20 rounded-lg">
                                    <span className="text-xs text-gray-500 uppercase font-bold">Total Anggaran</span>
                                    <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                                        {formatRupiah(detail.anggaran)}
                                    </div>
                                </div>
                             </div>
                             
                             {/* Deskripsi Kegiatan (Perbaikan Error Sebelumnya) */}
                             <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Deskripsi Kegiatan</span>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {detail.deskripsi_kegiatan || '-'}
                                </p>
                             </div>
                        </div>

                        {/* Grid Informasi Dasar */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <InfoCard label="Jenis Kegiatan" value={detail.jenis_kegiatan} icon={Briefcase} />
                            <InfoCard label="Penanggung Jawab" value={detail.pjawab} icon={User} />
                            <InfoCard label="Periode Pelaksanaan" value={`${formatDate(detail.jadwal_pelaksanaan_mulai)} s/d ${formatDate(detail.jadwal_pelaksanaan_akhir)}`} icon={Calendar} className="lg:col-span-2" />
                            <InfoCard label="Lokasi" value={detail.lokasi_pelaksanaan} icon={MapPin} />
                            <InfoCard label="Target Output" value={detail.target} icon={TrendingUp} />
                        </div>

                        {/* Detail Perencanaan */}
                        <SectionTitle title="Detail Perencanaan" icon={FileText} />
                        <div className="grid grid-cols-1 gap-4">
                            <InfoCard label="Latar Belakang" value={detail.latar_belakang} fullWidth />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoCard label="Rasionalisasi" value={detail.rasional} />
                                <InfoCard label="Tujuan" value={detail.tujuan} />
                            </div>
                            <InfoCard label="Mekanisme Pelaksanaan" value={detail.mekanisme} fullWidth />
                            <InfoCard label="Keberlanjutan Program" value={detail.keberlanjutan} fullWidth />
                        </div>

                        {/* Keterkaitan Strategis */}
                        <SectionTitle title="Keterkaitan Strategis (IKU/IKK)" icon={CheckCircle} />
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
                            <ul className="space-y-4">
                                <li className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                                    <span className="min-w-[80px] text-xs font-bold uppercase text-center text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded border dark:border-gray-600">IKU</span>
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">{detail.iku?.indikator || 'Indikator Kinerja Utama tidak dipilih'}</span>
                                </li>
                                <li className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                                    <span className="min-w-[80px] text-xs font-bold uppercase text-center text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded border dark:border-gray-600">Sub IKU</span>
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">{detail.iku_sub?.sub_indikator || '-'}</span>
                                </li>
                                <li className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                                    <span className="min-w-[80px] text-xs font-bold uppercase text-center text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded border dark:border-gray-600">IKK</span>
                                    <span className="text-gray-800 dark:text-gray-200 font-medium">{detail.ikk?.ikk || '-'}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Tabel Indikator Keberhasilan */}
                        <SectionTitle title="Indikator Keberhasilan" icon={TrendingUp} />
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200">
                                    <tr>
                                        <th rowSpan="2" className="px-4 py-3 text-left font-semibold">Indikator</th>
                                        <th rowSpan="2" className="px-4 py-3 text-center font-semibold border-l dark:border-gray-600">Capaian 2024</th>
                                        <th colSpan="2" className="px-4 py-2 text-center font-semibold border-l border-b dark:border-gray-600">Tahun 2025</th>
                                        <th colSpan="2" className="px-4 py-2 text-center font-semibold border-l border-b dark:border-gray-600">Tahun 2029</th>
                                    </tr>
                                    <tr>
                                        <th className="px-4 py-2 text-center text-xs border-l dark:border-gray-600">Target</th>
                                        <th className="px-4 py-2 text-center text-xs">Capaian</th>
                                        <th className="px-4 py-2 text-center text-xs border-l dark:border-gray-600">Target</th>
                                        <th className="px-4 py-2 text-center text-xs">Capaian</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {indicators.length > 0 ? indicators.map((ind, idx) => (
                                        <tr key={ind.id_indikator || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                            <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{ind.nama_indikator}</td>
                                            <td className="px-4 py-3 text-center border-l dark:border-gray-700 text-gray-600 dark:text-gray-300">{ind.capai_2024 || '-'}</td>
                                            <td className="px-4 py-3 text-center border-l dark:border-gray-700 text-gray-600 dark:text-gray-300">{ind.target_2025 || '-'}</td>
                                            <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{ind.capai_2025 || '-'}</td>
                                            <td className="px-4 py-3 text-center border-l dark:border-gray-700 text-gray-600 dark:text-gray-300">{ind.target_2029 || '-'}</td>
                                            <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-300">{ind.capai_2029 || '-'}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-6 text-center text-gray-500 italic bg-gray-50">
                                                Tidak ada data indikator keberhasilan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Tabel RAB */}
                        <SectionTitle title="Rincian Anggaran (RAB)" icon={AlertCircle} />
                        <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-200 w-10">No</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-200">Kode Akun</th>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-200">Kebutuhan</th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-200">Vol</th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-600 dark:text-gray-200">Satuan</th>
                                        <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-200">Harga Satuan</th>
                                        <th className="px-4 py-3 text-right font-semibold text-gray-600 dark:text-gray-200">Sub Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {rabItems.length > 0 ? rabItems.map((item, index) => (
                                        <tr key={item.id || index}>
                                            <td className="px-4 py-3 text-center text-gray-500">{index + 1}</td>
                                            <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-400">{item.kode_anggaran}</td>
                                            <td className="px-4 py-3 text-gray-800 dark:text-gray-200">{item.deskripsi_item || item.kebutuhan || '-'}</td>
                                            <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{item.volume || item.vol}</td>
                                            <td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400">{item.satuan}</td>
                                            <td className="px-4 py-3 text-right text-gray-600 dark:text-gray-400">{formatRupiah(item.harga_satuan || item.biaya_satuan)}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-gray-800 dark:text-gray-200">{formatRupiah(item.sub_total || item.jumlah)}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-6 text-center text-gray-500">Tidak ada rincian anggaran</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-50 dark:bg-gray-800/50 font-bold text-gray-800 dark:text-gray-100 border-t dark:border-gray-700">
                                    <tr>
                                        <td colSpan="6" className="px-4 py-3 text-right uppercase tracking-wider text-xs text-gray-500">Total Anggaran Diajukan</td>
                                        <td className="px-4 py-3 text-right text-teal-600 dark:text-teal-400 text-lg">
                                            {formatRupiah(detail.anggaran)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Informasi Pencairan */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                                <span className="flex items-center justify-center w-5 h-5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs font-bold">i</span>
                                Metode Pencairan
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <div className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold">Metode</div>
                                    <div className="font-medium text-gray-800 dark:text-gray-200">{detail.jenis_pencairan}</div>
                                </div>
                                {detail.jenis_pencairan === 'Bank' && (
                                    <>
                                        <div>
                                            <div className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold">Nama Bank</div>
                                            <div className="font-medium text-gray-800 dark:text-gray-200">{detail.nama_bank || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold">No. Rekening</div>
                                            <div className="font-medium text-gray-800 dark:text-gray-200 font-mono">{detail.nomor_rekening || '-'}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-blue-600 dark:text-blue-400 uppercase font-bold">Atas Nama</div>
                                            <div className="font-medium text-gray-800 dark:text-gray-200">{detail.atas_nama || '-'}</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Footer Navigasi */}
                    <div className="flex justify-start pb-6">
                        <Link 
                            href={route('rkat.index')} 
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition font-medium"
                        >
                            <ArrowLeft size={20} />
                            Kembali ke Daftar RKAT
                        </Link>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}