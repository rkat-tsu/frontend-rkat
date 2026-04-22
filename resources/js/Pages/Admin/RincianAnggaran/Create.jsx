import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Create() {
    // Inisialisasi useForm dari Inertia
    const { data, setData, post, processing, errors } = useForm({
        kode_anggaran: '',
        nama_anggaran: '',
        satuan: '',
        kelompok_anggaran: '',
        nominal: '',
    });

    const handleBack = () => {
        const isFilled = data.kode_anggaran !== '' || data.nama_anggaran !== '' || data.satuan !== '' || data.kelompok_anggaran !== '' || data.nominal !== '';
        
        if (isFilled) {
            toast.warning("Konfirmasi Batal", {
                description: "Anda memiliki data yang belum disimpan. Yakin ingin kembali? Perubahan akan hilang.",
                action: {
                    label: "Ya, Kembali",
                    onClick: () => router.get(route('rincian.index'))
                },
                cancel: {
                    label: "Batal"
                }
            });
        } else {
            router.get(route('rincian.index'));
        }
    };

    // Handle submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!data.kode_anggaran || !data.nama_anggaran || !data.nominal) {
            toast.error("Gagal Menyimpan", { description: "Semua form input bertanda * wajib diisi." });
            return;
        }

        const toastId = toast.loading("Sedang menyimpan data...");
        post(route('rincian.store'), {
            onSuccess: () => toast.success("Berhasil", { id: toastId, description: "Item SBO baru berhasil ditambahkan." }),
            onError: () => toast.error("Gagal Menyimpan", { id: toastId, description: "Terdapat kesalahan saat menyimpan data." })
        });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Standar Biaya Operasional</h2>}>
            <Head title="Tambah Item SBO" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Header Bagian Atas */}
                    <div className="flex items-center gap-4 mb-6">
                        <button 
                            type="button"
                            onClick={handleBack}
                            className="p-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-full transition"
                            title="Kembali"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Tambah Item Baru
                        </h1>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-8 border-l-4 border-yellow-500">
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Kode Item */}
                                <div>
                                    <label htmlFor="kode_anggaran" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Kode Item <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="kode_anggaran"
                                        placeholder="Contoh: A.1.1"
                                        value={data.kode_anggaran}
                                        onChange={(e) => setData('kode_anggaran', e.target.value)}
                                        className={`w-full bg-gray-50 border ${errors.kode_anggaran ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                                        required
                                    />
                                    {errors.kode_anggaran && <p className="mt-1 text-sm text-red-600">{errors.kode_anggaran}</p>}
                                </div>

                                {/* Kelompok Anggaran */}
                                <div>
                                    <label htmlFor="kelompok_anggaran" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Kelompok Anggaran
                                    </label>
                                    <input
                                        type="text"
                                        id="kelompok_anggaran"
                                        placeholder="Contoh: pcs, bph, dll"
                                        value={data.kelompok_anggaran}
                                        onChange={(e) => setData('kelompok_anggaran', e.target.value)}
                                        className={`w-full bg-gray-50 border ${errors.kelompok_anggaran ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                                    />
                                    {errors.kelompok_anggaran && <p className="mt-1 text-sm text-red-600">{errors.kelompok_anggaran}</p>}
                                </div>
                            </div>

                            {/* Nama Anggaran / Keterangan */}
                            <div>
                                <label htmlFor="nama_anggaran" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Keterangan / Deskripsi <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="nama_anggaran"
                                    rows="3"
                                    placeholder="Masukkan keterangan lengkap item SBO"
                                    value={data.nama_anggaran}
                                    onChange={(e) => setData('nama_anggaran', e.target.value)}
                                    className={`w-full bg-gray-50 border ${errors.nama_anggaran ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                                    required
                                ></textarea>
                                {errors.nama_anggaran && <p className="mt-1 text-sm text-red-600">{errors.nama_anggaran}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Satuan */}
                                <div>
                                    <label htmlFor="satuan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Satuan
                                    </label>
                                    <input
                                        type="text"
                                        id="satuan"
                                        placeholder="Contoh: Paket, Orang, Hari"
                                        value={data.satuan}
                                        onChange={(e) => setData('satuan', e.target.value)}
                                        className={`w-full bg-gray-50 border ${errors.satuan ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                                    />
                                    {errors.satuan && <p className="mt-1 text-sm text-red-600">{errors.satuan}</p>}
                                </div>

                                {/* Nominal */}
                                <div>
                                    <label htmlFor="nominal" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Pagu Anggaran (Rp) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">Rp</span>
                                        </div>
                                        <input
                                            type="number"
                                            id="nominal"
                                            min="0"
                                            value={data.nominal}
                                            onChange={(e) => setData('nominal', e.target.value)}
                                            className={`pl-10 w-full bg-gray-50 border ${errors.nominal ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg focus:ring-yellow-500 focus:border-yellow-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                                            required
                                        />
                                    </div>
                                    {errors.nominal && <p className="mt-1 text-sm text-red-600">{errors.nominal}</p>}
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-5 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 border border-red-300  dark:border-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-200 dark:focus:ring-red-600 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Data'}
                                </button>
                            </div>

                        </form>
                        
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}