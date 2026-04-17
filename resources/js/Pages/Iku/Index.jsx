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

export default function Index({ auth, ikus }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    
    // State untuk menyimpan ID baris yang sedang dibuka (Expand)
    const [expandedRows, setExpandedRows] = useState([]);

    // Cek apakah user yang login adalah Admin
    const isAdmin = auth.user.peran === 'Admin';

    const { data, setData, post, processing, errors, reset, delete: destroy } = useForm({
        id_iku: '',
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
            setData({ id_iku: iku.id_iku, nama_iku: iku.nama_iku });
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

    const submit = (e) => {
        e.preventDefault();
        post(route('iku.master.store'), {
            onSuccess: () => closeModal(),
        });
    };

    const handleDelete = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus IKU ini? Semua IKK di dalamnya juga akan terhapus secara permanen.')) {
            destroy(route('iku.destroy', id));
        }
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
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-sm font-medium transition"
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
                                            <tr className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isExpanded ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
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
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ikkList.length > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {ikkList.length} IKK
                                                    </span>
                                                </td>
                                                
                                                {isAdmin && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                                        <div className="flex justify-end gap-3">
                                                            <button
                                                                onClick={() => openModal(iku)}
                                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-1.5 rounded transition"
                                                                title="Ubah Nama IKU"
                                                            >
                                                                <Edit2 size={16} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(iku.id_iku)}
                                                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 p-1.5 rounded transition"
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
                                                <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-200">
                                                    <td colSpan={isAdmin ? 5 : 4} className="p-0">
                                                        <div className="pl-16 pr-6 py-4 animate-in slide-in-from-top-2 duration-200">
                                                            <div className="border border-indigo-100 dark:border-indigo-900/30 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm">
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
                                        <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50">
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
            <Modal show={isModalOpen} onClose={closeModal}>
                <form onSubmit={submit} className="p-6">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 border-b pb-2 mb-4">
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
                        <SecondaryButton type="button" onClick={closeModal}>Batal</SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-teal-600 hover:bg-teal-700">
                            {editData ? 'Simpan Perubahan' : 'Simpan IKU'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}