// resources/js/Pages/Iku/CreateIku.jsx

import React, { useState, useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import DangerButton from '@/Components/DangerButton';
import Dropdown from '@/Components/Dropdown'; 

// --- Blueprints untuk Struktur Data ---
const initialIkk = (data = {}) => ({
    // Tambahkan id_ikk, null jika baru
    id_ikk: data.id_ikk ?? null, 
    temp_id: data.id_ikk || Date.now() + Math.random(), 
    nama_ikk: data.nama_ikk ?? '',
});

const initialIkusub = (data = {}) => ({
    // Tambahkan id_ikusub, null jika baru
    id_ikusub: data.id_ikusub ?? null,
    temp_id: data.id_ikusub || Date.now() + Math.random(), 
    nama_ikusub: data.nama_ikusub ?? '',
    // Jika ada data lama, isi ikks dengan data lama
    ikks: data.ikks?.map(ikk => initialIkk(ikk)) ?? [initialIkk()],
});

// ====================================================================
// Komponen Utama Form Manajemen IKU (Edit & Tambah Turunan)
// ====================================================================

export default function Create({ auth, ikus }) {
    
    const { data, setData, post, processing, errors } = useForm({
        id_iku: '',          // ID IKU yang dipilih
        ikusubs: [initialIkusub()], // IKUSUB dan IKK yang akan disimpan/diupdate
    });

    const selectedIku = useMemo(() => {
        return ikus.find(iku => String(iku.id_iku) === String(data.id_iku));
    }, [data.id_iku, ikus]);
    
    const triggerText = selectedIku ? selectedIku.nama_iku : '-- Pilih IKU Induk --';

    // Mengelola perubahan IKU
    const handleIkuSelect = (ikuId) => {
        setData('id_iku', ikuId);
        
        const ikuToEdit = ikus.find(iku => String(iku.id_iku) === String(ikuId));
        
        if (ikuToEdit && ikuToEdit.ikusubs.length > 0) {
            // MODE EDIT: Isi form dengan data IKUSUB yang sudah ada
            const existingIkusubs = ikuToEdit.ikusubs.map(ikusub => initialIkusub(ikusub));
            setData('ikusubs', existingIkusubs);
        } else {
            // MODE BARU: Reset form jika tidak ada data turunan atau IKU tidak dipilih
            setData('ikusubs', [initialIkusub()]);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('iku.store')); 
    };
    
    // --- FUNGSI IKUSUB ---
    
    const addIkusub = () => {
        setData('ikusubs', [...data.ikusubs, initialIkusub()]);
    };

    const removeIkusub = (temp_id) => {
        // Tampilkan konfirmasi, terutama jika item memiliki ID database (sudah tersimpan)
        const ikusubToRemove = data.ikusubs.find(i => i.temp_id === temp_id);
        if (ikusubToRemove.id_ikusub && !window.confirm(`Anda yakin ingin menghapus IKUSUB "${ikusubToRemove.nama_ikusub}"? Aksi ini akan menghapus data di database.`)) {
            return;
        }

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
        const ikusubIndex = data.ikusubs.findIndex(i => i.temp_id === ikusub_temp_id);
        if (ikusubIndex === -1) return;
        
        const ikkToRemove = data.ikusubs[ikusubIndex].ikks.find(i => i.temp_id === ikk_temp_id);
        if (ikkToRemove.id_ikk && !window.confirm(`Anda yakin ingin menghapus IKK "${ikkToRemove.nama_ikk}"? Aksi ini akan menghapus data di database.`)) {
            return;
        }

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
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit & Tambah Turunan IKU</h2>}
        >
            <Head title="Input IKU" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* ==================================================================== */}
                        {/* KOLOM KIRI: FORM INPUT/EDIT */}
                        {/* ==================================================================== */}
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg">
                            <form onSubmit={submit} className="space-y-8">
                                
                                {/* 1. PEMILIHAN IKU UTAMA - DROPDOOWN */}
                                <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 border-b pb-2 mb-4">
                                    🔑 Pilih Indikator Kinerja Utama (IKU)
                                </h3>
                                
                                <div className="relative">
                                    <InputLabel htmlFor="id_iku" value="Pilih IKU Induk" />
                                    
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            {/* Tombol Trigger: Menggunakan styling TextInput */}
                                            <button 
                                                type="button" 
                                                className={`w-full text-left bg-white dark:bg-gray-900 px-3 py-2 text-sm leading-5 transition duration-150 ease-in-out ${data.id_iku ? 'font-semibold' : 'text-gray-500 dark:text-gray-400'}`}
                                            >
                                                {triggerText}
                                            </button>
                                        </Dropdown.Trigger>

                                        {/* Content: Options List menggunakan button HTML murni */}
                                        <Dropdown.Content align="left" width="w-full">
                                            
                                            {/* Opsi default/kosong */}
                                            <button
                                                type="button"
                                                onClick={() => handleIkuSelect('')}
                                                className={`block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800 transition duration-150 ease-in-out ${!data.id_iku ? 'bg-gray-100 dark:bg-gray-800 font-bold' : ''}`}
                                            >
                                                -- Pilih IKU Induk --
                                            </button>
                                            
                                            {/* Opsi IKU dari Database */}
                                            {ikus.map(iku => (
                                                <button
                                                    key={iku.id_iku}
                                                    type="button"
                                                    onClick={() => handleIkuSelect(iku.id_iku)}
                                                    className={`block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800 transition duration-150 ease-in-out ${String(iku.id_iku) === String(data.id_iku) ? 'bg-indigo-50 dark:bg-indigo-800 font-bold' : ''}`}
                                                >
                                                    {iku.nama_iku}
                                                </button>
                                            ))}
                                        </Dropdown.Content>
                                    </Dropdown>
                                    
                                    <InputError message={errors.id_iku} className="mt-2" />
                                </div>
                                
                                {/* 2. INPUT/EDIT IKUSUB */}
                                {data.id_iku && (
                                    <>
                                        <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 border-b pb-2 pt-4">
                                            📝 IKUSUB & IKK ({selectedIku.nama_iku})
                                        </h3>
                                        
                                        {data.ikusubs.map((ikusub, ikusubIndex) => (
                                            <div key={ikusub.temp_id} className="p-4 border-2 border-green-200 dark:border-green-700 rounded-lg space-y-4 relative mt-4">
                                                
                                                <h4 className="font-semibold text-lg text-green-700 dark:text-green-300">
                                                    {ikusub.id_ikusub ? 'EDIT IKUSUB ' : 'IKUSUB BARU '}#{ikusubIndex + 1}
                                                </h4>
                                                
                                                {/* Hidden input untuk ID database IKUSUB */}
                                                <input type="hidden" name={`ikusubs.${ikusubIndex}.id_ikusub`} value={ikusub.id_ikusub || ''} />

                                                {/* Tombol Hapus IKUSUB */}
                                                {(data.ikusubs.length > 1 || ikusub.id_ikusub) && ( // Boleh hapus jika lebih dari 1 atau jika sudah ada di DB
                                                    <DangerButton 
                                                        type="button" 
                                                        onClick={() => removeIkusub(ikusub.temp_id)}
                                                        className="absolute top-2 right-2 p-2"
                                                    >
                                                        {ikusub.id_ikusub ? 'Hapus' : 'Batal'}
                                                    </DangerButton>
                                                )}

                                                {/* Form Nama IKUSUB */}
                                                <div>
                                                    <InputLabel htmlFor={`ikusub_nama_${ikusub.temp_id}`} value="Nama IKUSUB" />
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
                                                
                                                {/* 3. INPUT/EDIT IKK (Loop di dalam IKUSUB) */}
                                                <div className="mt-6 pt-4 border-t border-green-300 dark:border-green-600">
                                                    <h5 className="font-semibold text-md text-gray-600 dark:text-gray-400 mb-3">
                                                        Kegiatan Kinerja (IKK)
                                                    </h5>
                                                    
                                                    {ikusub.ikks.map((ikk, ikkIndex) => (
                                                        <div key={ikk.temp_id} className="flex space-x-4 mb-4 p-3 border border-dashed border-gray-400 dark:border-gray-600 rounded-md">
                                                            
                                                            {/* Hidden input untuk ID database IKK */}
                                                            <input type="hidden" name={`ikusubs.${ikusubIndex}.ikks.${ikkIndex}.id_ikk`} value={ikk.id_ikk || ''} />
                                                            
                                                            {/* Nama IKK */}
                                                            <div className="flex-1">
                                                                <InputLabel htmlFor={`ikk_nama_${ikk.temp_id}`} value={`Nama IKK #${ikkIndex + 1} (${ikk.id_ikk ? 'Edit' : 'Baru'})`} />
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
                                                                {/* Boleh dihapus jika ada ID database, atau jika lebih dari 1 IKK dalam IKUSUB ini */}
                                                                {(ikusub.ikks.length > 1 || ikk.id_ikk) && (
                                                                    <DangerButton 
                                                                        type="button" 
                                                                        onClick={() => removeIkk(ikusub.temp_id, ikk.temp_id)}
                                                                    >
                                                                        {ikk.id_ikk ? 'Hapus' : 'Batal'}
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
                                        Simpan Perubahan
                                    </PrimaryButton>
                                </div>

                            </form>
                        </div>
                        
                        {/* ==================================================================== */}
                        {/* KOLOM KANAN: PREVIEW DATA IKU YANG DIPILIH */}
                        {/* ==================================================================== */}
                        <div className="lg:col-span-1 bg-gray-100 dark:bg-gray-900 p-6 shadow sm:rounded-lg">
                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 border-b pb-2">
                                📊 Struktur IKU
                            </h3>

                            {!selectedIku ? (
                                <p className="text-gray-500 dark:text-gray-400">Silakan pilih IKU Induk di sebelah kiri untuk melihat dan mengedit datanya.</p>
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
                                                    {index + 1}. {ikusub.nama_ikusub} (ID: {ikusub.id_ikusub})
                                                </p>

                                                {/* Daftar IKK */}
                                                {ikusub.ikks && ikusub.ikks.length > 0 ? (
                                                    <ul className="list-disc list-inside mt-2 text-sm text-gray-600 dark:text-gray-300">
                                                        {ikusub.ikks.map((ikk, ikkIndex) => (
                                                            <li key={ikk.id_ikk} className="ml-2">
                                                                IKK #{ikkIndex + 1}: {ikk.nama_ikk} (ID: {ikk.id_ikk})
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