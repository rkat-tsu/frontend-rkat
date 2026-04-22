import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, Edit2, Trash2, ListChecks, ChevronDown, ChevronRight, CheckCircle2 } from 'lucide-react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import { toast } from 'sonner';

export default function Index({ auth, ikus }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    // State untuk menyimpan ID baris yang sedang dibuka (Expand)
    const [expandedRows, setExpandedRows] = useState([]);

    // Cek apakah user yang login adalah Admin
    const isAdmin = auth.user.peran === 'Admin';

    const { data, setData, post, processing, errors, reset, delete: destroy, isDirty } = useForm({
        uuid: '',
        nama_iku: '',
    });

    // Fungsi Toggle Expand Baris
    const toggleRow = (id) => {
        setExpandedRows(prev =>
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    const openModal = (iku = null) => {
        if (iku) {
            setEditData(iku);
            setData({ uuid: iku.uuid, nama_iku: iku.nama_iku });
        } else {
            setEditData(null);
            reset();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        reset();
    };

    const handleCloseModal = () => {
        if (isDirty) {
            toast.warning("Konfirmasi Batal", {
                description: "Anda memiliki perubahan yang belum disimpan. Yakin ingin membatalkan?",
                action: {
                    label: "Ya, Batal",
                    onClick: () => closeModal()
                },
                cancel: {
                    label: "Lanjut"
                }
            });
        } else {
            closeModal();
        }
    };

    const submit = (e) => {
        e.preventDefault();
        
        if (!data.nama_iku) {
            toast.error("Gagal Menyimpan", { description: "Nama IKU wajib diisi." });
            return;
        }

        const toastId = toast.loading("Sedang menyimpan data...");
        post(route('iku.master.store'), {
            onSuccess: () => {
                toast.success("Berhasil", { id: toastId, description: editData ? "Data IKU berhasil diperbarui." : "IKU baru berhasil ditambahkan." });
                closeModal();
            },
            onError: () => {
                toast.error("Gagal Menyimpan", { id: toastId, description: "Terdapat kesalahan saat menyimpan data." });
            }
        });
    };

    const handleDelete = (id) => {
        toast.warning("Konfirmasi Hapus", {
            description: "Apakah Anda yakin ingin menghapus IKU ini? Semua IKK di dalamnya juga akan terhapus secara permanen.",
            action: {
                label: "Ya, Hapus",
                onClick: () => {
                    const toastId = toast.loading("Sedang menghapus...");
                    destroy(route('iku.destroy', id), {
                        onSuccess: () => toast.success("Berhasil Dihapus", { id: toastId, description: "IKU berhasil dihapus." }),
                        onError: () => toast.error("Gagal Menghapus", { id: toastId, description: "Terdapat kesalahan saat menghapus data." })
                    });
                }
            },
            cancel: {
                label: "Batal"
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Master Indikator Kinerja Utama (IKU)</h2>}
        >
            <Head title="Daftar IKU & IKK" />

            <div className="py-6 pb-24">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <div className="mb-6 flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Daftar IKU & Rincian Kegiatan</h3>
                            <p className="text-sm text-gray-500 mt-1">Klik ikon panah pada tabel untuk melihat rincian IKK di dalam setiap IKU.</p>
                        </div>

                        {/* HANYA TAMPILKAN TOMBOL KELOLA JIKA ADMIN */}
                        {isAdmin && (
                            <div className="flex gap-3">
                                <Link
                                    href={route('iku.create')}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-md text-sm font-medium transition"
                                >
                                    <ListChecks size={16} />
                                    Kelola Rincian IKK
                                </Link>
                                <button
                                    onClick={() => openModal()}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm font-medium shadow-sm shadow-teal-200 transition"
                                >
                                    <Plus size={16} />
                                    Tambah IKU Baru
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow sm:rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="w-12 px-4 py-3"></th> {/* Kolom Expand Toggle */}
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">No</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Nama Indikator Utama (IKU)</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Jumlah IKK</th>
                                    {isAdmin && (
                                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                {ikus.map((iku, index) => {
                                    const isExpanded = expandedRows.includes(iku.id_iku);
                                    const ikkList = iku.ikks || [];

                                    return (
                                        <React.Fragment key={iku.id_iku}>
                                            {/* --- BARIS INDUK (IKU) --- */}
                                            <tr className={`hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors ${isExpanded ? 'bg-indigo-50/30 dark:bg-indigo-900/20' : ''}`}>
                                                <td className="px-4 py-4 text-center cursor-pointer" onClick={() => toggleRow(iku.id_iku)}>
                                                    <button className="text-gray-400 hover:text-indigo-600 transition-colors">
                                                        {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100 font-medium">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 text-gray-900 dark:text-gray-100 font-medium cursor-pointer" onClick={() => toggleRow(iku.id_iku)}>
                                                    {iku.nama_iku}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ikkList.length > 0 ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                                        {ikkList.length} IKK
                                                    </span>
                                                </td>

                                                {isAdmin && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex justify-end gap-3">
                                                            <button
                                                                onClick={() => openModal(iku)}
                                                                className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/60 p-1.5 rounded transition"
                                                                title="Ubah Nama IKU"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(iku.uuid)}
                                                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/60 p-1.5 rounded transition"
                                                                title="Hapus IKU"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>

                                            {/* --- BARIS ANAKAN (IKK SUB-TABLE) --- */}
                                            {isExpanded && (
                                                <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                                    <td colSpan={isAdmin ? 5 : 4} className="p-0">
                                                        <div className="pl-16 pr-6 py-4 animate-in slide-in-from-top-2 duration-200">
                                                            <div className="border border-indigo-100 dark:border-indigo-900/50 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
                                                                <div className="bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 border-b border-indigo-100 dark:border-indigo-900/30">
                                                                    <h4 className="text-xs font-semibold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide">
                                                                        Rincian Kegiatan (IKK)
                                                                    </h4>
                                                                </div>

                                                                {ikkList.length > 0 ? (
                                                                    <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                                                        {ikkList.map((ikk, i) => (
                                                                            <li key={ikk.id_ikk} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50/80 dark:hover:bg-gray-700/30">
                                                                                <CheckCircle2 size={16} className="text-teal-500 mt-0.5 flex-shrink-0" />
                                                                                <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                                                    {ikk.nama_ikk}
                                                                                </span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400 italic flex flex-col items-center">
                                                                        <span>Belum ada rincian IKK untuk IKU ini.</span>
                                                                        {isAdmin && (
                                                                            <Link href={route('iku.create')} className="text-indigo-600 hover:underline mt-1 font-medium">
                                                                                + Tambahkan IKK sekarang
                                                                            </Link>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })}

                                {ikus.length === 0 && (
                                    <tr>
                                        <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                                            Belum ada data Indikator Kinerja Utama yang terdaftar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal Input/Edit IKU */}
            <Modal show={isModalOpen} onClose={handleCloseModal}>
                <form onSubmit={submit} className="p-6 bg-white dark:bg-gray-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b dark:border-gray-700 pb-2 mb-4">
                        {editData ? 'Ubah Nama IKU' : 'Tambah IKU Baru'}
                    </h2>

                    <div>
                        <InputLabel htmlFor="nama_iku" value="Nama Indikator Kinerja Utama" required />
                        <TextInput
                            id="nama_iku"
                            type="text"
                            name="nama_iku"
                            value={data.nama_iku}
                            onChange={(e) => setData('nama_iku', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Contoh: Meningkatkan kualitas SDM"
                            isFocused
                        />
                        <InputError message={errors.nama_iku} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 -mx-6 -mb-6 p-4 border-t dark:border-gray-700">
                        <SecondaryButton type="button" className="px-5 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 border border-red-300  dark:border-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-200 dark:focus:ring-red-600 transition-colors" onClick={handleCloseModal}>Batal</SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-teal-600 flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg hover:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 transition-colors disabled:opacity-70 disabled:cursor-not-allowed" >
                            {editData ? 'Simpan Perubahan' : 'Simpan IKU'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}