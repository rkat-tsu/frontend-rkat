import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import TextArea from '@/Components/TextArea';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import CustomSelect from '@/Components/CustomSelect';
import { Plus, Trash2, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/usePermission';

export default function Create({ auth, ikus }) {
    const { isAdmin } = usePermission();
    // Setup Form
    const { data, setData, post, processing, errors, reset } = useForm({
        uuid_iku: '',
        ikks: [{ nama_ikk: '' }]
    });

    // --- HANDLERS ---
    const handleIkuChange = (uuid) => {
        const selectedIku = ikus.find(item => item.uuid === uuid);
        
        const newIkks = (selectedIku && selectedIku.ikks && selectedIku.ikks.length > 0)
            ? selectedIku.ikks.map(ikk => ({
                id_ikk: ikk.id_ikk,
                nama_ikk: ikk.nama_ikk
            }))
            : [{ nama_ikk: '' }];

        setData({
            ...data,
            uuid_iku: uuid,
            ikks: newIkks
        });
    };

    const addRow = () => {
        setData('ikks', [...data.ikks, { nama_ikk: '' }]);
    };

    const removeRow = (index) => {
        const list = [...data.ikks];
        list.splice(index, 1);
        setData('ikks', list);
    };

    const updateRow = (index, value) => {
        const list = [...data.ikks];
        list[index]['nama_ikk'] = value;
        setData('ikks', list);
    };

    const submit = (e) => {
        e.preventDefault();

        // Validasi
        if (!data.uuid_iku) {
            toast.error("Peringatan", { description: "Pilih Indikator Utama terlebih dahulu." });
            return;
        }

        // Cek apakah semua IKK terisi
        const isIkksValid = data.ikks.every(ikk => ikk.nama_ikk && ikk.nama_ikk.trim() !== '');
        if (!isIkksValid) {
            toast.error("Peringatan", { description: "Semua daftar kegiatan (IKK) harus diisi." });
            return;
        }

        toast("Konfirmasi Simpan", {
            description: "Yakin ingin menyimpan daftar kegiatan untuk IKU ini?",
            action: {
                label: "Ya, Simpan",
                onClick: () => {
                    const toastId = toast.loading("Sedang menyimpan data...");
                    post(route('iku.store'), {
                        onSuccess: () => {
                            toast.success("Berhasil disimpan", { 
                                id: toastId,
                                description: `Data IKK ${data.nama_iku} berhasil diperbarui.`
                            });
                        },
                        onError: () => {
                            toast.error("Gagal Menyimpan", {
                                id: toastId,
                                description: "Terjadi kesalahan saat menyimpan data."
                            });
                        }
                    });
                }
            },
            cancel: {
                label: "Batal"
            }
        });
    };

    const ikuOptions = ikus.map(i => ({ 
        value: i.uuid, 
        label: i.nama_iku 
    }));

    // Cek Akses Admin
    if (!isAdmin()) {
        return (
            <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Akses Ditolak</h2>}>
                <Head title="Akses Ditolak" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg p-6 text-center text-red-500 font-medium">
                            Anda tidak memiliki izin untuk mengakses halaman ini.
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Kelola Indikator Kinerja Utama (IKU)</h2>}
        >
            <Head title="Input IKU & IKK" />

            <div className="py-6 pb-24">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* --- KONTAINER 1: PILIH IKU --- */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-teal-500">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                                1. Pilih Indikator Utama
                            </h3>
                            <div className="max-w-xl">
                                <InputLabel value="Indikator Kinerja Utama (IKU)" required />
                                <div className="mt-1">
                                    <CustomSelect
                                        value={data.uuid_iku}
                                        onChange={(e) => handleIkuChange(e.target.value)}
                                        options={ikuOptions}
                                        placeholder="-- Pilih IKU untuk mengedit kegiatannya --"
                                        className="w-full"
                                    />
                                </div>
                                <InputError message={errors.uuid_iku} className="mt-2" />
                                <p className="text-sm text-gray-500 mt-2">
                                    Pilih salah satu IKU di atas untuk melihat atau mengubah daftar kegiatan (IKK) yang terkait.
                                </p>
                            </div>
                        </div>

                        {/* --- KONTAINER 2: DAFTAR KEGIATAN (IKK) --- */}
                        {data.uuid_iku && (
                            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-indigo-500 animate-in slide-in-from-bottom-2 duration-300">
                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        2. Daftar Kegiatan (IKK)
                                    </h3>
                                    <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs rounded-full font-medium">
                                        Total: {data.ikks.length} Kegiatan
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {data.ikks.map((item, index) => (
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
                                                    onChange={(e) => updateRow(index, e.target.value)}
                                                    className="w-full text-sm leading-relaxed"
                                                    placeholder={`Masukkan deskripsi lengkap kegiatan/indikator di sini...`}
                                                    rows={2}
                                                    isFocused={index === data.ikks.length - 1 && index > 0}
                                                />
                                                {errors[`ikks.${index}.nama_ikk`] && (
                                                    <p className="text-sm text-red-600 mt-1 font-medium flex items-center gap-1">
                                                        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                                        Nama kegiatan tidak boleh kosong.
                                                    </p>
                                                )}
                                            </div>
                                            
                                            <div className="flex-shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => removeRow(index)}
                                                    className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                    title="Hapus baris ini"
                                                    disabled={data.ikks.length === 1}
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={addRow}
                                        className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-800 rounded-md font-semibold text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-widest shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150"
                                    >
                                        <Plus size={16} className="mr-2" /> Tambah Kegiatan Baru
                                    </button>
                                    <InputError message={errors.ikks} className="mt-2" />
                                </div>
                            </div>
                        )}

                        {/* --- TOMBOL AKSI STICKY --- */}
                        <div className="sticky bottom-4 z-10 bg-white/90 dark:bg-gray-800 backdrop-blur-md p-4 rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <Link
                                href={route('iku.index')}
                                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-sm flex items-center px-4 py-2"
                            >
                                <ArrowLeft size={16} className="mr-2" /> Kembali
                            </Link>
                            
                            <div className="flex items-center gap-3">
                                {data.uuid_iku ? (
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md shadow-lg shadow-teal-200/50 dark:shadow-teal-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                                    >
                                        <Save size={18} className="mr-2" /> Simpan Perubahan
                                    </button>
                                ) : (
                                    <span className="text-sm text-gray-400 dark:text-gray-500 italic px-4">Pilih IKU terlebih dahulu</span>
                                )}
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}