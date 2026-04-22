import React, { useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import CustomSelect from '@/Components/CustomSelect';
import { Plus, Trash2, Save, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Create({ auth, ikus }) {
    // Setup Form
    const { data, setData, post, processing, errors, reset } = useForm({
        uuid_iku: '',
        ikks: [{ nama_ikk: '' }]
    });

    // --- EFFECT: LOAD DATA SAAT IKU DIPILIH ---
    useEffect(() => {
        if (data.uuid_iku) {
            const selectedIku = ikus.find(item => item.uuid === data.uuid_iku);
            
            if (selectedIku && selectedIku.ikks && selectedIku.ikks.length > 0) {
                setData('ikks', selectedIku.ikks.map(ikk => ({
                    id_ikk: ikk.id_ikk,
                    nama_ikk: ikk.nama_ikk
                })));
            } else {
                setData('ikks', [{ nama_ikk: '' }]);
            }
        }
    }, [data.uuid_iku]); 

    // --- HANDLERS ---
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
                                description: "Data IKK berhasil diperbarui."
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
    if (auth.user.peran !== 'Admin') {
        return (
            <AuthenticatedLayout user={auth.user} header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Akses Ditolak</h2>}>
                <Head title="Akses Ditolak" />
                <div className="py-12">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6 text-center text-red-500 font-medium">
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
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-teal-500">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                                1. Pilih Indikator Utama
                            </h3>
                            <div className="max-w-xl">
                                <InputLabel value="Indikator Kinerja Utama (IKU)" required />
                                <div className="mt-1">
                                    <CustomSelect
                                        value={data.uuid_iku}
                                        onChange={(e) => setData('uuid_iku', e.target.value)}
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
                            <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-indigo-500 animate-in slide-in-from-bottom-2 duration-300">
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
                                        <div key={index} className="flex items-start gap-3 group">
                                            <div className="flex-shrink-0 mt-2.5">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 flex items-center justify-center text-xs font-bold border border-gray-200 dark:border-gray-600">
                                                    {index + 1}
                                                </div>
                                            </div>
                                            
                                            <div className="flex-grow">
                                                <InputLabel value={`Nama Kegiatan / Indikator ${index + 1}`} className="sr-only" />
                                                <TextInput
                                                    value={item.nama_ikk}
                                                    onChange={(e) => updateRow(index, e.target.value)}
                                                    className="w-full"
                                                    placeholder={`Contoh: Penyelenggaraan Seminar Internasional...`}
                                                    isFocused={index === data.ikks.length - 1 && index > 0} // Auto focus baris baru
                                                />
                                                {errors[`ikks.${index}.nama_ikk`] && (
                                                    <p className="text-sm text-red-600 mt-1">Nama kegiatan tidak boleh kosong.</p>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => removeRow(index)}
                                                className="mt-2 p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                title="Hapus baris ini"
                                                disabled={data.ikks.length === 1} // Jangan hapus jika sisa 1
                                            >
                                                <Trash2 size={18} />
                                            </button>
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
                        <div className="sticky bottom-4 z-10 bg-white/90 dark:bg-gray-900 backdrop-blur-sm p-4 rounded-xl shadow-lg flex justify-between items-center">
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