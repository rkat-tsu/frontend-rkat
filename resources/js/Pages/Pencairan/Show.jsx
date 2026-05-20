import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, FileDown, Calendar, MapPin, Target, Wallet, Send, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';

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
export default function Show({ auth, pencairan }) {
    const detail = pencairan.rkat_header?.rkat_details?.[0];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Detail Pencairan Dana</h2>}
        >
            <Head title={`Pencairan - ${pencairan.rkat_header?.nomor_dokumen}`} />

            <div className="py-6">
                <div className="max-w-5xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-4 flex items-center justify-between">
                        <Link href={route('pencairan.index')} className="text-teal-600 hover:text-teal-700 flex items-center gap-2 font-medium">
                            <ArrowLeft size={16} /> Kembali
                        </Link>

                        <a 
                            href={route('pencairan.export', pencairan.uuid)}
                            target="_blank"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 dark:bg-gray-200 border border-transparent rounded-lg font-semibold text-xs text-white dark:text-gray-800 uppercase tracking-widest hover:bg-gray-700 dark:hover:bg-white transition"
                        >
                            <FileDown size={16} /> Export PDF
                        </a>
                    </div>

                    {/* Catatan Revisi / Tolak */}
                    {pencairan.catatan && (pencairan.status_pencairan === 'Revisi' || pencairan.status_pencairan === 'Ditolak') && (
                        <div className="mb-6 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-850 rounded-lg p-5 shadow-sm">
                            <h3 className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-lg mb-3">
                                <AlertTriangle size={20} />
                                Catatan Revisi / Penolakan Pencairan
                            </h3>
                            <div className="bg-white dark:bg-gray-800 p-4 rounded-md border border-amber-100 dark:border-amber-900/50 shadow-sm">
                                <p className="text-gray-700 dark:text-gray-300 text-sm italic border-l-4 border-amber-300 pl-3 py-1">
                                    "{pencairan.catatan}"
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                        {/* Header Banner */}
                        <div className="px-6 py-5 bg-gradient-to-r from-teal-500 to-teal-700 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-xl font-bold mb-1">Pengajuan Pencairan Dana</h3>
                                <p className="text-teal-100 opacity-90">{pencairan.rkat_header?.nomor_dokumen} • Unit: {pencairan.rkat_header?.unit?.nama_unit}</p>
                            </div>
                            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-sm font-bold shadow-sm whitespace-nowrap">
                                Status: {pencairan.status_pencairan.replace(/_/g, ' ')}
                            </span>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 md:p-8 space-y-8">
                            
                            {/* TOR Section */}
                            <section>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                                    <FileDown className="text-teal-500" size={20} />
                                    Isi TOR / Detail Kegiatan
                                </h4>

                                {detail ? (
                                    <div className="grid grid-cols-1 gap-6 text-sm">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-1 gap-x-4">
                                            <div className="text-gray-500 dark:text-gray-400 font-medium">Judul Kegiatan</div>
                                            <div className="md:col-span-2 text-gray-900 dark:text-gray-200 font-semibold text-base">{detail.judul_kegiatan}</div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-1 gap-x-4">
                                            <div className="text-gray-500 dark:text-gray-400 font-medium">Deskripsi Kegiatan</div>
                                            <div className="md:col-span-2 text-gray-900 dark:text-gray-200">{detail.deskripsi_kegiatan}</div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-1 gap-x-4">
                                            <div className="text-gray-500 dark:text-gray-400 font-medium">Latar Belakang</div>
                                            <div className="md:col-span-2 text-gray-900 dark:text-gray-200 whitespace-pre-wrap">{detail.latar_belakang}</div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-1 gap-x-4">
                                            <div className="text-gray-500 dark:text-gray-400 font-medium">Rasional</div>
                                            <div className="md:col-span-2 text-gray-900 dark:text-gray-200 whitespace-pre-wrap">{detail.rasional}</div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-1 gap-x-4">
                                            <div className="text-gray-500 dark:text-gray-400 font-medium">Tujuan</div>
                                            <div className="md:col-span-2 text-gray-900 dark:text-gray-200 whitespace-pre-wrap">{detail.tujuan}</div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-1 gap-x-4">
                                            <div className="text-gray-500 dark:text-gray-400 font-medium">Mekanisme</div>
                                            <div className="md:col-span-2 text-gray-900 dark:text-gray-200 whitespace-pre-wrap">{detail.mekanisme}</div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                            <div>
                                                <div className="text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1"><Calendar size={14}/> Jadwal Pelaksanaan</div>
                                                <div className="text-gray-900 dark:text-gray-200 font-medium">
                                                    {new Date(detail.jadwal_pelaksanaan_mulai).toLocaleDateString('id-ID')} - {new Date(detail.jadwal_pelaksanaan_akhir).toLocaleDateString('id-ID')}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1"><MapPin size={14}/> Lokasi</div>
                                                <div className="text-gray-900 dark:text-gray-200 font-medium">{detail.lokasi_pelaksanaan}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1"><Target size={14}/> Target / Luaran</div>
                                                <div className="text-gray-900 dark:text-gray-200 font-medium">{detail.target}</div>
                                            </div>
                                            <div>
                                                <div className="text-gray-500 dark:text-gray-400 font-medium mb-1 flex items-center gap-1"><Wallet size={14}/> Total Anggaran</div>
                                                <div className="font-bold text-lg text-teal-600 dark:text-teal-400">
                                                    {formatCurrency(pencairan.rkat_header?.total_anggaran)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-1 gap-x-4">
                                            <div className="text-gray-500 dark:text-gray-400 font-medium">Jenis Pencairan</div>
                                            <div className="md:col-span-2 text-gray-900 dark:text-gray-200">
                                                <span className="font-semibold">{detail.jenis_pencairan}</span>
                                                {detail.jenis_pencairan === 'Bank' && (
                                                    <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                        <li>Bank: {detail.nama_bank}</li>
                                                        <li>Rekening: {detail.nomor_rekening}</li>
                                                        <li>A.N: {detail.atas_nama}</li>
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-gray-500 italic">Data Detail RKAT tidak ditemukan.</div>
                                )}
                            </section>

                            <section>
                                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                                    Status Persetujuan
                                </h4>
                                
                                <div className="space-y-4">
                                    {(() => {
                                        let timelineVariant = 'success';
                                        if (pencairan.status_pencairan === 'Revisi') timelineVariant = 'warning';
                                        if (pencairan.status_pencairan === 'Ditolak') timelineVariant = 'error';

                                        return (
                                            <>
                                                <TimelineItem 
                                                    label="Pengajuan" 
                                                    date={pencairan.tanggal_pengajuan} 
                                                    isActive={pencairan.tanggal_pengajuan != null} 
                                                    variant={timelineVariant}
                                                />
                                                <TimelineItem 
                                                    label="Validasi BAAK" 
                                                    date={pencairan.tanggal_divalidasi_baak} 
                                                    isActive={pencairan.tanggal_divalidasi_baak != null} 
                                                    variant={timelineVariant}
                                                />
                                                <TimelineItem 
                                                    label={`Mengetahui ${pencairan.rkat_header?.unit?.nama_unit || 'Unit'}`} 
                                                    date={pencairan.tanggal_diketahui_unit} 
                                                    isActive={pencairan.tanggal_diketahui_unit != null} 
                                                    variant={timelineVariant}
                                                />
                                                <TimelineItem 
                                                    label="Verifikasi BAUK" 
                                                    date={pencairan.tanggal_diverifikasi_bauk} 
                                                    isActive={pencairan.tanggal_diverifikasi_bauk != null} 
                                                    variant={timelineVariant}
                                                />
                                                <TimelineItem 
                                                    label="Disetujui WR 2" 
                                                    date={pencairan.tanggal_disetujui_wr2} 
                                                    isActive={pencairan.tanggal_disetujui_wr2 != null} 
                                                    isFinal={true}
                                                    variant={timelineVariant}
                                                />
                                            </>
                                        );
                                    })()}
                                </div>
                            </section>
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
                {date && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(date).toLocaleString('id-ID')}</p>}
            </div>
        </div>
    );
}
