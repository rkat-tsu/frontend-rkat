import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionButton, { ActionGroup } from '@/Components/ActionButton';
import { Plus, Edit2, Trash2, ListChecks, ChevronDown, ChevronRight, CheckCircle2, Save } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import TextArea from '@/Components/TextArea';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/usePermission';

export default function Index({ auth, ikus }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);

    // State untuk menyimpan ID baris yang sedang dibuka (Expand)
    const [expandedRows, setExpandedRows] = useState([]);

    const { isAdmin } = usePermission();

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
                id: 'cancel-iku-modal',
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

    const ikkForm = useForm({
        uuid_iku: '',
        ikks: [{ nama_ikk: '' }]
    });
    
    const [isIkkModalOpen, setIsIkkModalOpen] = useState(false);
    const [activeIku, setActiveIku] = useState(null);

    const openIkkModal = (iku) => {
        setActiveIku(iku);
        const newIkks = (iku && iku.ikks && iku.ikks.length > 0)
            ? iku.ikks.map(ikk => ({
                id_ikk: ikk.id_ikk,
                nama_ikk: ikk.nama_ikk
            }))
            : [{ nama_ikk: '' }];

        ikkForm.setData({
            uuid_iku: iku.uuid,
            ikks: newIkks
        });
        ikkForm.clearErrors();
        setIsIkkModalOpen(true);
    };

    const closeIkkModal = () => {
        setIsIkkModalOpen(false);
        setActiveIku(null);
        ikkForm.reset();
    };

    const submitIkk = (e) => {
        e.preventDefault();

        const isIkksValid = ikkForm.data.ikks.every(ikk => ikk.nama_ikk && ikk.nama_ikk.trim() !== '');
        if (!isIkksValid) {
            toast.error("Peringatan", { description: "Semua daftar kegiatan (IKK) harus diisi." });
            return;
        }

        const toastId = toast.loading("Sedang menyimpan data...");
        ikkForm.post(route('iku.store'), {
            onSuccess: () => {
                toast.success("Berhasil disimpan", { 
                    id: toastId,
                    description: `Data IKK berhasil diperbarui.`
                });
                closeIkkModal();
            },
            onError: () => {
                toast.error("Gagal Menyimpan", {
                    id: toastId,
                    description: "Terjadi kesalahan saat menyimpan data."
                });
            }
        });
    };

    const addIkkRow = () => {
        ikkForm.setData('ikks', [...ikkForm.data.ikks, { nama_ikk: '' }]);
    };

    const removeIkkRow = (index) => {
        const list = [...ikkForm.data.ikks];
        list.splice(index, 1);
        ikkForm.setData('ikks', list);
    };

    const updateIkkRow = (index, value) => {
        const list = [...ikkForm.data.ikks];
        list[index]['nama_ikk'] = value;
        ikkForm.setData('ikks', list);
    };

    const submit = (e) => {
        e.preventDefault();
        
        const trimmedNama = (data.nama_iku || '').trim();
        if (!trimmedNama) {
            toast.error("Gagal Menyimpan", { description: "Nama IKU wajib diisi." });
            return;
        }

        // Cek duplikasi nama IKU di frontend (case-insensitive & trimmed)
        const isDuplicate = (ikus || []).some(iku => 
            iku.nama_iku && iku.nama_iku.trim().toLowerCase() === trimmedNama.toLowerCase() && 
            iku.uuid !== data.uuid
        );

        if (isDuplicate) {
            toast.error("Gagal Menyimpan", { description: `Nama IKU "${trimmedNama}" sudah ada di database.` });
            return;
        }

        const toastId = toast.loading("Sedang menyimpan data...");
        post(route('iku.master.store'), {
            onSuccess: () => {
                toast.success("Berhasil", { id: toastId, description: editData ? `Data IKU ${data.nama_iku} berhasil diperbarui.` : `IKU baru ${data.nama_iku} berhasil ditambahkan.` });
                closeModal();
            },
            onError: (errs) => {
                const errorMessage = errs.nama_iku || "Terdapat kesalahan saat menyimpan data.";
                toast.error("Gagal Menyimpan", { id: toastId, description: errorMessage });
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
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Indikator Kinerja Utama (IKU)</h2>}
        >
            <Head title="Daftar IKU & IKK" />

            <div className="py-6 pb-24">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                                Daftar IKU & Rincian Kegiatan
                            </h1>
                            <p className="text-sm text-gray-500 mt-1 sm:mt-2">Klik ikon panah pada tabel untuk melihat rincian IKK di dalam setiap IKU.</p>
                        </div>

                        {/* HANYA TAMPILKAN TOMBOL KELOLA JIKA ADMIN */}
                        {isAdmin() && (
                            <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
                                <button
                                    onClick={() => openModal()}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md text-sm font-medium shadow-sm transition h-11 whitespace-nowrap"
                                >
                                    <Plus size={18} className="shrink-0" />
                                    Tambah IKU Baru
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-x-auto shadow rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="w-12 px-4 py-3"></th> {/* Kolom Expand Toggle */}
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">No</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Nama Indikator Utama (IKU)</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Jumlah IKK</th>
                                    {isAdmin() && (
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
                                                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${ikkList.length > 0 ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                                                        {ikkList.length} IKK
                                                    </span>
                                                </td>

                                                 {isAdmin() && (
                                                    <td className="px-6 py-4 border-b border-l border-gray-200 dark:border-gray-700 text-center">
                                                        <ActionGroup>
                                                            <ActionButton
                                                                variant="edit"
                                                                tooltip="Ubah Nama IKU"
                                                                onClick={() => openModal(iku)}
                                                            />
                                                            <ActionButton
                                                                icon={ListChecks}
                                                                tooltip="Kelola IKK"
                                                                onClick={() => openIkkModal(iku)}
                                                                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900/50"
                                                            />
                                                            <ActionButton
                                                                variant="delete"
                                                                tooltip="Hapus IKU"
                                                                onClick={() => handleDelete(iku.uuid)}
                                                            />
                                                        </ActionGroup>
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
                                                                                <span className="text-teal-600 dark:text-teal-400 font-semibold mt-0.5 flex-shrink-0 text-sm min-w-[1.25rem]">
                                                                                    {i + 1}.
                                                                                </span>
                                                                                <span className="text-gray-700 dark:text-gray-300 text-sm">
                                                                                    {ikk.nama_ikk}
                                                                                </span>
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                ) : (
                                                                    <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400 italic flex flex-col items-center">
                                                                        <span>Belum ada rincian IKK untuk IKU ini.</span>
                                                                        {isAdmin() && (
                                                                            <button type="button" onClick={() => openIkkModal(iku)} className="text-indigo-600 hover:underline mt-1 font-medium">
                                                                                + Tambahkan IKK sekarang
                                                                            </button>
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
                                        <td colSpan={isAdmin() ? 5 : 4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
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
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
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
                            placeholder="Contoh: IKU XX: Meningkatkan kualitas SDM"
                            isFocused
                        />
                        <InputError message={errors.nama_iku} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3 bg-white dark:bg-gray-800 -mx-6 -mb-6 p-4">
                        <SecondaryButton type="button" className="px-5 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 border border-red-300  dark:border-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-200 dark:focus:ring-red-600 transition-colors" onClick={handleCloseModal}>Batal</SecondaryButton>
                        <PrimaryButton disabled={processing} className="bg-teal-600 flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg hover:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 transition-colors disabled:opacity-70 disabled:cursor-not-allowed" >
                            <Save size={18} />
                            {editData ? 'Simpan Perubahan' : 'Simpan IKU'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* Modal Input/Edit IKK */}
            <Modal show={isIkkModalOpen} onClose={closeIkkModal} maxWidth="2xl">
                <form onSubmit={submitIkk} className="p-6 bg-white dark:bg-gray-800">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        Kelola Rincian Kegiatan (IKK)
                    </h2>
                    <p className="text-sm text-gray-500 mb-6 border-b border-gray-200 dark:border-gray-700 pb-4">
                        IKU: <span className="font-medium text-gray-900 dark:text-gray-300">{activeIku?.nama_iku}</span>
                    </p>

                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {ikkForm.data.ikks.map((item, index) => (
                            <div key={index} className="flex items-start gap-4 p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50/30 dark:bg-gray-900/10 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all group">
                                <div className="flex-shrink-0 mt-1">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold border border-indigo-100 dark:border-indigo-800 shadow-sm">
                                        {index + 1}
                                    </div>
                                </div>
                                
                                <div className="flex-grow">
                                    <InputLabel value={`Nama Kegiatan / Indikator ${index + 1}`} className="sr-only" />
                                    <TextArea
                                        value={item.nama_ikk}
                                        onChange={(e) => updateIkkRow(index, e.target.value)}
                                        className="w-full text-sm leading-relaxed"
                                        placeholder={`Masukkan deskripsi lengkap kegiatan/indikator di sini...`}
                                        rows={2}
                                        isFocused={index === ikkForm.data.ikks.length - 1 && index > 0}
                                    />
                                    {ikkForm.errors[`ikks.${index}.nama_ikk`] && (
                                        <p className="text-sm text-red-600 mt-1 font-medium flex items-center gap-1">
                                            <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                            {ikkForm.errors[`ikks.${index}.nama_ikk`]}
                                        </p>
                                    )}
                                </div>
                                
                                <div className="flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => removeIkkRow(index)}
                                        className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                        title="Hapus baris ini"
                                        disabled={ikkForm.data.ikks.length === 1}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={addIkkRow}
                            className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-md font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-widest shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                        >
                            <Plus size={16} className="mr-2" /> Tambah Baris
                        </button>
                        <InputError message={ikkForm.errors.ikks} className="mt-2" />
                        <InputError message={ikkForm.errors.uuid_iku} className="mt-2" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 pt-6">
                        <SecondaryButton type="button" className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onClick={closeIkkModal}>Tutup</SecondaryButton>
                        <PrimaryButton disabled={ikkForm.processing} className="bg-indigo-600 flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white rounded-lg hover:bg-indigo-700 focus:ring-4 focus:outline-none focus:ring-indigo-300 transition-colors disabled:opacity-70 disabled:cursor-not-allowed" >
                            <Save size={18} />
                            Simpan Perubahan
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}