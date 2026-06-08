import React, { useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeft, CheckCircle2, Clock, XCircle, AlertCircle, Printer, Send, Download } from 'lucide-react';
import PrimaryButton from '@/Components/PrimaryButton';
import { toast } from 'sonner';

export default function Show({ auth, pencairan, flash = {} }) {
    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);
    const rkat = pencairan.rkat_header;
    const items = pencairan.items;

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    const getStatusBadge = (status) => {
        if (!status) return 'bg-blue-100 text-blue-800 border-blue-200';
        const s = status.toLowerCase();
        if (s.includes('disetujui_final') || s.includes('disetujui final')) return 'bg-green-100 text-green-800 border-green-200';
        if (s.includes('ditolak')) return 'bg-red-100 text-red-800 border-red-200';
        if (s.includes('revisi')) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        if (s.includes('draft')) return 'bg-gray-200 text-gray-800 border-gray-300';
        return 'bg-blue-100 text-blue-800 border-blue-200';
    };

    const totalCair = items.reduce((sum, item) => sum + parseFloat(item.sub_total_pencairan), 0);

    const handleSubmit = () => {
        toast("Konfirmasi Pengajuan", {
            description: "Apakah Anda yakin ingin mengajukan pencairan ini?",
            action: {
                label: "Ya, Ajukan",
                onClick: () => {
                    const toastId = toast.loading('Sedang mengajukan...');
                    router.post(route('pencairan.submit', pencairan.uuid), {}, {
                        onFinish: () => {
                            toast.dismiss(toastId);
                        }
                    });
                }
            },
            cancel: {
                label: "Batal"
            }
        });
    };

    return (
        <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Detail Pencairan Dana</h2>}>
            <Head title={`Detail Pencairan - ${rkat.nomor_dokumen}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 space-y-6">

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Informasi Pencairan</h3>
                                    <p className="text-sm text-gray-500 mt-1">Nama/Keterangan: <span className="font-semibold">{pencairan.nama_pencairan || 'Tidak ada'}</span></p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusBadge(pencairan.status_pencairan)}`}>
                                    Status: {pencairan.status_pencairan.replace(/_/g, ' ')}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">RKAT Referensi</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{rkat.nomor_dokumen}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Unit Pengaju</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{rkat.unit?.nama_unit}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Tanggal Pengajuan</p>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">{pencairan.tanggal_pengajuan ? new Date(pencairan.tanggal_pengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Pencairan Tahap Ini</p>
                                    <p className="font-bold text-teal-600 dark:text-teal-400 text-lg">{formatCurrency(totalCair)}</p>
                                </div>
                            </div>
                        </div>

                        {pencairan.catatan && (
                            <div className="p-4 m-6 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                                <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={20} />
                                <div>
                                    <p className="font-semibold text-red-800">Catatan Revisi / Penolakan</p>
                                    <p className="text-red-700 text-sm mt-1">{pencairan.catatan}</p>
                                </div>
                            </div>
                        )}

                        <div className="p-6">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Rincian Item yang Dicairkan</h4>
                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase">Item RAB</th>
                                            <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-300 uppercase">Vol</th>
                                            <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-300 uppercase">Harga Satuan</th>
                                            <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-300 uppercase">Sub Total Cair</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{item.rkat_rab_item?.deskripsi_item}</td>
                                                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{item.volume_pencairan}</td>
                                                <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">{formatCurrency(item.nominal_pencairan)}</td>
                                                <td className="px-4 py-3 text-right font-bold text-gray-900 dark:text-gray-100">{formatCurrency(item.sub_total_pencairan)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <td colSpan="3" className="px-4 py-3 text-right font-bold text-gray-700 dark:text-gray-200">Total:</td>
                                            <td className="px-4 py-3 text-right font-bold text-teal-600 dark:text-teal-400 text-base">{formatCurrency(totalCair)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* --- STICKY FOOTER --- */}
                    <div className="sticky bottom-4 z-30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center mt-6">
                        <Link
                            href={route('pencairan.index')}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm flex items-center px-4 py-2 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <ArrowLeft size={16} className="mr-2" /> Kembali
                        </Link>
                        <div className="flex items-center gap-4">
                            <a
                                href={pencairan?.uuid ? route('pencairan.export', pencairan.uuid) : '#'}
                                target="_blank"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                <Download size={18} /> Export PDF
                            </a>

                            {(pencairan.status_pencairan === 'Draft' || pencairan.status_pencairan === 'Revisi') && auth.user.id_user === pencairan.diajukan_oleh && (
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-md shadow-lg shadow-teal-200/50 dark:shadow-teal-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                >
                                    <Send size={18} /> Ajukan Pencairan
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}