import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Save, ArrowLeft } from 'lucide-react';

export default function Edit({ item }) {
    // Inisialisasi useForm dengan data yang sudah ada (item) dari database
    const { data, setData, put, processing, errors } = useForm({
        kode_anggaran: item?.kode_anggaran || '',
        nama_anggaran: item?.nama_anggaran || '',
        satuan: item?.satuan || '',
        kelompok_anggaran: item?.kelompok_anggaran || '',
        nominal: item?.nominal || '',
    });

    // Handle submit form untuk update data
    const handleSubmit = (e) => {
        e.preventDefault();
        // Menggunakan method PUT untuk update data berdasarkan kode_anggaran/ID
        put(route('rincian.update', item.kode_anggaran)); 
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Standar Biaya Operasional</h2>}>
            <Head title={`Edit Item SBO - ${item?.kode_anggaran}`} />

            <div className="py-8">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Header Bagian Atas */}
                    <div className="flex items-center gap-4 mb-6">
                        <Link 
                            href={route('rincian.index')}
                            className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition"
                            title="Kembali"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Edit Item SBO
                            </h1>
                            <p className="text-sm text-gray-500 mt-1 dark:text-gray-400">
                                Mengubah data untuk kode: <span className="font-semibold">{item?.kode_anggaran}</span>
                            </p>
                        </div>
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
                                        className={`w-full bg-gray-50 border ${errors.kode_anggaran ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                                        required
                                        // Tambahkan atribut readOnly di bawah ini jika kode_anggaran adalah Primary Key yang tidak boleh diubah:
                                        // readOnly
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
                                        className={`w-full bg-gray-50 border ${errors.kelompok_anggaran ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
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
                                    className={`w-full bg-gray-50 border ${errors.nama_anggaran ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
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
                                        className={`w-full bg-gray-50 border ${errors.satuan ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
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
                                            placeholder="0"
                                            value={data.nominal}
                                            onChange={(e) => setData('nominal', e.target.value)}
                                            className={`pl-10 w-full bg-gray-50 border ${errors.nominal ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg focus:ring-teal-500 focus:border-teal-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm`}
                                            required
                                        />
                                    </div>
                                    {errors.nominal && <p className="mt-1 text-sm text-red-600">{errors.nominal}</p>}
                                </div>
                            </div>

                            {/* Tombol Aksi */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <Link
                                    href={route('rincian.index')}
                                    className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-200 transition-colors"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 focus:ring-4 focus:outline-none focus:ring-teal-300 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4" />
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>

                        </form>
                        
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}