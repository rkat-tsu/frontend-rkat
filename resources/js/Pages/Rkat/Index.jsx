import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowRight, Plus, Search, Download, Send, AlertCircle, Edit2 } from 'lucide-react';
import CustomSelect from '@/Components/CustomSelect';
import { toast } from 'sonner';

const formatDate = (value) => {
    if (!value) return '-';
    try {
        return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return value;
    }
};

// Tambahkan prop 'flash' untuk menangkap pesan error/success dari Controller
export default function Index({ auth, rkats, filters, tahunAnggarans, flash = {} }) {
    // State untuk menyimpan nilai filter
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [tahun, setTahun] = useState(filters?.tahun || '');
    const [status, setStatus] = useState(filters?.status || '');

    // Fungsi untuk menerapkan filter ke backend
    const applyFilters = (newSearch, newTahun, newStatus) => {
        router.get(
            route('rkat.index'),
            { search: newSearch, tahun: newTahun, status: newStatus },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    // Handle perubahan pada input/select
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== (filters?.search || '')) {
                applyFilters(searchTerm, tahun, status);
            }
        }, 300); // 300ms delay

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleTahunChange = (e) => {
        const val = e.target.value;
        setTahun(val);
        applyFilters(searchTerm, val, status);
    };

    const handleStatusChange = (e) => {
        const val = e.target.value;
        setStatus(val);
        applyFilters(searchTerm, tahun, val);
    };

    // Fungsi untuk mengirim dokumen (Submit)
    const handleAjukan = (item) => {
        toast("Konfirmasi Pengajuan", {
            description: "Apakah Anda yakin ingin mengajukan RKAT ini? Setelah diajukan, data tidak dapat diubah kecuali dikembalikan untuk revisi.",
            action: {
                label: "Ya, Ajukan",
                onClick: () => {
                    const toastId = toast.loading("Sedang mengirim pengajuan...");
                    router.post(route('rkat.submit', item.uuid), {}, {
                        onSuccess: () => {
                            toast.success("Berhasil diajukan!", { id: toastId });
                        },
                        onError: () => {
                            toast.error("Gagal mengajukan data.", { id: toastId });
                        }
                    });
                }
            },
            cancel: {
                label: "Batal"
            }
        });
    };

    // --- LOGIC: HANDLE FLASH MESSAGES WITH TOAST ---
    useEffect(() => {
        if (flash.success) {
            toast.success(flash.success);
        }
        if (flash.error) {
            toast.error(flash.error, {
                description: "Akses terbatas atau terjadi kesalahan.",
                duration: 5000
            });
        }
    }, [flash]);

    // Cek apakah tombol "Baru" harus dikunci (jika ada error periode ditutup)
    const isLocked = !!flash.error;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Daftar RKAT</h2>}
        >
            <Head title="Daftar RKAT" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">



                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Daftar RKAT
                    </h1>

                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-teal-500 mb-6">

                        {/* Top Bar: Search, Filters & Buttons */}
                        <div className="flex flex-col xl:flex-row justify-between items-center gap-4">
                            <div className="relative w-full xl:w-1/3">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Cari nomor dokumen atau unit..."
                                    className="pl-10 h-11 block w-full bg-gray-100 border-transparent rounded-lg focus:border-teal-500 focus:bg-white focus:ring-0 text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
                                <div className="w-36 md:w-40">
                                    <CustomSelect
                                        value={tahun}
                                        onChange={handleTahunChange}
                                        className="h-11 rounded-lg border-transparent bg-gray-200 dark:bg-gray-700 dark:text-gray-300 focus:border-teal-500 focus:bg-white focus:ring-0 text-sm w-full"
                                        options={[
                                            { value: '', label: 'Semua Tahun' },
                                            ...(tahunAnggarans || []).map(th => ({ value: th, label: th }))
                                        ]}
                                    />
                                </div>

                                <div className="w-40 md:w-48">
                                    <CustomSelect
                                        value={status}
                                        onChange={handleStatusChange}
                                        className="h-11 rounded-lg border-transparent bg-gray-200 dark:bg-gray-700 dark:text-gray-300 focus:border-teal-500 focus:bg-white focus:ring-0 text-sm w-full"
                                        options={[
                                            { value: '', label: 'Semua Status' },
                                            { value: 'Draft', label: 'Draft' },
                                            { value: 'Review', label: 'Review' },
                                            { value: 'Revisi', label: 'Revisi' },
                                            { value: 'Disetujui_Revisi', label: 'Disetujui Revisi' },
                                            { value: 'Disetujui_Final', label: 'Disetujui Final' },
                                            { value: 'Ditolak', label: 'Ditolak' }
                                        ]}
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="h-11 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                    <Download size={16} />
                                    Export
                                </button>

                                {/* TOMBOL BARU - DIKUNCI JIKA PERIODE DITUTUP */}
                                <Link
                                    href={isLocked ? '#' : route('rkat.create')}
                                    onClick={(e) => isLocked && e.preventDefault()}
                                    className={`h-11 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap shadow-sm ${isLocked
                                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                            : 'bg-teal-600 hover:bg-teal-700 text-white'
                                        }`}
                                >
                                    <Plus size={16} />
                                    Baru
                                </Link>
                            </div>
                        </div>
                    </div>
                    {/* Record Count */}
                    <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{rkats.total || (rkats.data && rkats.data.length) || 0}</span> data RKAT
                    </div>

                    {/* Tabel Data */}
                    <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
                        <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                <tr>
                                    <th className="px-6 py-3 border-b border-gray-300 dark:border-gray-600 font-medium">No</th>
                                    <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Nomor Dokumen</th>
                                    <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Unit</th>
                                    <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Tahun</th>
                                    <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Status</th>
                                    <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Tanggal</th>
                                    <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rkats.data && rkats.data.length > 0 ? rkats.data.map((item, index) => (
                                    <tr key={item.id_header} className="bg-white dark:bg-gray-800 hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors">
                                        <td className="px-6 py-4 border-b border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-white">{rkats.from + index}</td>
                                        <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-medium">{item.nomor_dokumen}</td>
                                        <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">{item.unit?.nama_unit || '-'}</td>
                                        <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">{item.tahun_anggaran}</td>
                                        <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                                                    ${item.status_persetujuan === 'Draft' ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
                                                    ${item.status_persetujuan === 'Disetujui_Final' ? 'bg-green-100 text-green-800' : ''}
                                                    ${item.status_persetujuan === 'Ditolak' ? 'bg-red-100 text-red-800' : ''}
                                                    ${item.status_persetujuan === 'Revisi' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                    ${item.status_persetujuan.includes('Menunggu') || item.status_persetujuan === 'Review' ? 'bg-blue-100 text-blue-800' : ''}
                                                `}>
                                                {item.status_persetujuan.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">{formatDate(item.tanggal_pengajuan)}</td>
                                        <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-center">

                                            {/* --- KUMPULAN TOMBOL AKSI --- */}
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={route('rkat.show', item.uuid)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    Lihat
                                                    <ArrowRight size={14} />
                                                </Link>

                                                {/* TOMBOL EDIT: Hanya tampil jika Draft atau Revisi */}
                                                {(item.status_persetujuan === 'Draft' || item.status_persetujuan === 'Revisi') && (
                                                    <Link
                                                        href={route('rkat.edit', item.uuid)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-blue-300 rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 dark:bg-gray-700 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-900/20 transition-colors"
                                                        title="Edit RKAT"
                                                    >
                                                        Edit
                                                        <Edit2 size={14} />
                                                    </Link>
                                                )}

                                                {/* TOMBOL AJUKAN: Hanya tampil jika Draft atau Revisi */}
                                                {(item.status_persetujuan === 'Draft' || item.status_persetujuan === 'Revisi') && (
                                                    <button
                                                        onClick={() => handleAjukan(item)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 text-white rounded-md shadow-sm hover:bg-teal-700 transition"
                                                        title="Ajukan untuk di-review"
                                                    >
                                                        Ajukan
                                                        <Send size={14} />
                                                    </button>
                                                )}
                                            </div>

                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            Tidak ada data RKAT yang sesuai dengan filter.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {rkats.links && rkats.links.length > 3 && (
                        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Menampilkan <span className="font-medium text-gray-900 dark:text-white">{rkats.from || 0}</span> sampai <span className="font-medium text-gray-900 dark:text-white">{rkats.to || 0}</span> dari <span className="font-medium text-gray-900 dark:text-white">{rkats.total || 0}</span> data
                            </div>
                            <div className="flex flex-wrap shadow-sm rounded-md">
                                {rkats.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 border border-gray-200 dark:border-gray-700 text-sm ${link.active
                                                ? 'bg-teal-600 text-white border-teal-600 z-10'
                                                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                            } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''} ${index === 0 ? 'rounded-l-md' : ''
                                            } ${index === rkats.links.length - 1 ? 'rounded-r-md' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        onClick={(e) => !link.url && e.preventDefault()}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}