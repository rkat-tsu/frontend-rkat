// resources/js/Pages/Iku/Create.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput'; // Pastikan Anda memiliki komponen ini
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import DangerButton from '@/Components/DangerButton';

// --- Blueprints untuk Struktur Data ---
const initialIkk = () => ({
    temp_id: Date.now() + Math.random(), 
    nama_ikk: '',
});

const initialIkusub = () => ({
    temp_id: Date.now() + Math.random(), 
    nama_ikusub: '',
    ikks: [initialIkk()],
});

// ====================================================================
// Komponen Utama Form Manajemen IKU (Penambahan Turunan)
// ====================================================================

// Menerima prop 'ikus' dari controller, yang berisi data IKU, IKUSUB, dan IKK yang sudah ada.
export default function Create({ auth, ikus }) {
    
    // State untuk form input IKUSUB/IKK baru
    const { data, setData, post, processing, errors } = useForm({
        id_iku: '',          // ID IKU yang dipilih (yang sudah ada)
        ikusubs: [initialIkusub()], // IKUSUB dan IKK baru yang akan disimpan
    });

    // Cari detail IKU yang dipilih dari prop 'ikus' untuk ditampilkan di panel kanan
    const selectedIku = useMemo(() => {
        return ikus.find(iku => String(iku.id_iku) === String(data.id_iku));
    }, [data.id_iku, ikus]);

    // Mengelola perubahan dropdown IKU
    const handleIkuSelect = (e) => {
        setData('id_iku', e.target.value);
    };

    const submit = (e) => {
        e.preventDefault();
        // Menggunakan route('iku.store') yang sudah diperbarui di controller
        post(route('iku.store')); 
    };
    
    // --- FUNGSI IKUSUB ---
    
    const addIkusub = () => {
        setData('ikusubs', [...data.ikusubs, initialIkusub()]);
    };

    const removeIkusub = (temp_id) => {
        setData('ikusubs', data.ikusubs.filter(ikusub => ikusub.temp_id !== temp_id));
    };

    const handleIkusubChange = (temp_id, field, value) => {
        const updatedIkusubs = data.ikusubs.map(ikusub => {
            if (ikusub.temp_id === temp_id) {
                return { ...ikusub, [field]: value };
            }
            return ikusub;
        });
        setData('ikusubs', updatedIkusubs);
    };

    // --- FUNGSI IKK ---
    
    const addIkk = (ikusub_temp_id) => {
        const updatedIkusubs = data.ikusubs.map(ikusub => {
            if (ikusub.temp_id === ikusub_temp_id) {
                return { ...ikusub, ikks: [...ikusub.ikks, initialIkk()] };
            }
            return ikusub;
        });
        setData('ikusubs', updatedIkusubs);
    };

    const removeIkk = (ikusub_temp_id, ikk_temp_id) => {
        const updatedIkusubs = data.ikusubs.map(ikusub => {
            if (ikusub.temp_id === ikusub_temp_id) {
                const updatedIkks = ikusub.ikks.filter(ikk => ikk.temp_id !== ikk_temp_id);
                return { ...ikusub, ikks: updatedIkks };
            }
            return ikusub;
        });
        setData('ikusubs', updatedIkusubs);
    };
    
    const handleIkkChange = (ikusub_temp_id, ikk_temp_id, field, value) => {
        const updatedIkusubs = data.ikusubs.map(ikusub => {
            if (ikusub.temp_id === ikusub_temp_id) {
                const updatedIkks = ikusub.ikks.map(ikk => {
                    if (ikk.temp_id === ikk_temp_id) {
                        return { ...ikk, [field]: value };
                    }
                    return ikk;
                });
                return { ...ikusub, ikks: updatedIkks };
            }
            return ikusub;
        });
        setData('ikusubs', updatedIkusubs);
    };


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Input IKUSUB & IKK</h2>}
        >
            <Head title="Tambah Turunan IKU" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* ==================================================================== */}
                        {/* KOLOM KIRI: FORM INPUT */}
                        {/* ==================================================================== */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg">
                            <form onSubmit={submit} className="space-y-8">
                                
                                {/* 1. PEMILIHAN IKU UTAMA */}
                                <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 border-b pb-2 mb-4">
                                    🔑 Pilih Indikator Kinerja Utama (IKU)
                                </h3>
                                
                                <div>
                                    <InputLabel htmlFor="id_iku" value="Pilih IKU Induk" />
                                    <SelectInput
                                        id="id_iku"
                                        name="id_iku"
                                        value={data.id_iku}
                                        className="mt-1 block w-full"
                                        onChange={handleIkuSelect}
                                        required
                                    >
                                        <option value="">-- Pilih IKU Induk --</option>
                                        {ikus.map(iku => (
                                            <option key={iku.id_iku} value={iku.id_iku}>{iku.nama_iku}</option>
                                        ))}
                                    </SelectInput>
                                    <InputError message={errors.id_iku} className="mt-2" />
                                </div>
                                
                                {/* 2. INPUT IKUSUB BARU */}
                                {data.id_iku && (
                                    <>
                                        <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 border-b pb-2 pt-4">
                                            🎯 Input Sub Indikator Kinerja (IKUSUB) Baru
                                        </h3>
                                        
                                        {data.ikusubs.map((ikusub, ikusubIndex) => (
                                            <div key={ikusub.temp_id} className="p-4 border-2 border-green-200 dark:border-green-700 rounded-lg space-y-4 relative mt-4">
                                                
                                                <h4 className="font-semibold text-lg text-green-700 dark:text-green-300">
                                                    IKUSUB Baru #{ikusubIndex + 1}
                                                </h4>
                                                
                                                {/* Tombol Hapus IKUSUB */}
                                                {data.ikusubs.length > 1 && (
                                                    <DangerButton 
                                                        type="button" 
                                                        onClick={() => removeIkusub(ikusub.temp_id)}
                                                        className="absolute top-2 right-2 p-2"
                                                    >
                                                        Hapus IKUSUB
                                                    </DangerButton>
                                                )}

                                                {/* Form Nama IKUSUB */}
                                                <div>
                                                    <InputLabel htmlFor={`ikusub_nama_${ikusub.temp_id}`} value="Nama IKUSUB Baru" />
                                                    <TextInput
                                                        id={`ikusub_nama_${ikusub.temp_id}`}
                                                        type="text"
                                                        value={ikusub.nama_ikusub}
                                                        className="mt-1 block w-full"
                                                        onChange={(e) => handleIkusubChange(ikusub.temp_id, 'nama_ikusub', e.target.value)}
                                                        required
                                                    />
                                                    <InputError message={errors[`ikusubs.${ikusubIndex}.nama_ikusub`]} className="mt-2" />
                                                </div>
                                                
                                                {/* 3. INPUT IKK BARU (Loop di dalam IKUSUB) */}
                                                <div className="mt-6 pt-4 border-t border-green-300 dark:border-green-600">
                                                    <h5 className="font-semibold text-md text-gray-600 dark:text-gray-400 mb-3">
                                                        Kegiatan Kinerja (IKK) Baru
                                                    </h5>
                                                    
                                                    {ikusub.ikks.map((ikk, ikkIndex) => (
                                                        <div key={ikk.temp_id} className="flex space-x-4 mb-4 p-3 border border-dashed border-gray-400 dark:border-gray-600 rounded-md">
                                                            
                                                            {/* Nama IKK */}
                                                            <div className="flex-1">
                                                                <InputLabel htmlFor={`ikk_nama_${ikk.temp_id}`} value={`Nama IKK Baru #${ikkIndex + 1}`} />
                                                                <TextInput
                                                                    id={`ikk_nama_${ikk.temp_id}`}
                                                                    type="text"
                                                                    value={ikk.nama_ikk}
                                                                    className="mt-1 block w-full"
                                                                    onChange={(e) => handleIkkChange(ikusub.temp_id, ikk.temp_id, 'nama_ikk', e.target.value)}
                                                                    required
                                                                />
                                                                <InputError message={errors[`ikusubs.${ikusubIndex}.ikks.${ikkIndex}.nama_ikk`]} className="mt-2" />
                                                            </div>

                                                            {/* Tombol Hapus IKK */}
                                                            <div className="flex items-end pt-5">
                                                                {ikusub.ikks.length > 1 && (
                                                                    <DangerButton 
                                                                        type="button" 
                                                                        onClick={() => removeIkk(ikusub.temp_id, ikk.temp_id)}
                                                                    >
                                                                        Hapus
                                                                    </DangerButton>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {/* Tombol Tambah IKK */}
                                                    <PrimaryButton type="button" onClick={() => addIkk(ikusub.temp_id)} className="mt-2 bg-gray-500 hover:bg-gray-600">
                                                        + Tambah IKK Baru
                                                    </PrimaryButton>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Tombol Tambah IKUSUB */}
                                        <div className="mt-6 pt-4 border-t dark:border-gray-700">
                                            <PrimaryButton type="button" onClick={addIkusub} className="bg-indigo-700 hover:bg-indigo-800">
                                                + Tambah IKUSUB Baru
                                            </PrimaryButton>
                                        </div>
                                    </>
                                )}


                                {/* Tombol Submit Form */}
                                <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                                    <PrimaryButton disabled={processing || !data.id_iku}>
                                        Simpan IKUSUB & IKK Baru
                                    </PrimaryButton>
                                </div>

                            </form>
                        </div>
                        
                        {/* ==================================================================== */}
                        {/* KOLOM KANAN: PREVIEW DATA IKU YANG DIPILIH */}
                        {/* ==================================================================== */}
                        <div className="lg:col-span-1 bg-gray-100 dark:bg-gray-900 p-6 shadow sm:rounded-lg">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2">
                                📊 Data IKU yang Sudah Ada
                            </h3>

                            {!selectedIku ? (
                                <p className="text-gray-500 dark:text-gray-400">Silakan pilih IKU Induk terlebih dahulu.</p>
                            ) : (
                                <div className="space-y-4">
                                    <div className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                                        {selectedIku.nama_iku}
                                    </div>

                                    {/* Daftar IKUSUB */}
                                    {selectedIku.ikusubs && selectedIku.ikusubs.length > 0 ? (
                                        selectedIku.ikusubs.map((ikusub, index) => (
                                            <div key={ikusub.id_ikusub} className="pl-3 border-l-4 border-blue-500 dark:border-blue-400 bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm">
                                                <p className="font-semibold text-blue-700 dark:text-blue-300">
                                                    {index + 1}. {ikusub.nama_ikusub}
                                                </p>

                                                {/* Daftar IKK */}
                                                {ikusub.ikks && ikusub.ikks.length > 0 ? (
                                                    <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                        {ikusub.ikks.map((ikk, ikkIndex) => (
                                                            <li key={ikk.id_ikk} className="ml-2">
                                                                IKK #{ikkIndex + 1}: {ikk.nama_ikk}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <p className="text-xs text-red-500 mt-1">Belum ada IKK di IKUSUB ini.</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada IKUSUB yang ditautkan ke IKU ini.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}