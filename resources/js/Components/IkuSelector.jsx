// resources/js/Components/IkuSelector.jsx

import React, { useState, useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';
import InputError from '@/Components/InputError';

export default function IkuSelector({ programKerjas, data, setData, errors }) {
    
    // State untuk menyimpan pilihan saat ini
    const [selectedIku, setSelectedIku] = useState(data.iku_id || '');
    const [selectedIkusub, setSelectedIkusub] = useState(data.ikusub_id || '');
    const [selectedIkk, setSelectedIkk] = useState(data.program_kerja_id || '');

    // Data yang difilter
    const selectedIkuObject = programKerjas.find(iku => String(iku.id) === String(selectedIku));
    const ikusubs = selectedIkuObject ? selectedIkuObject.ikusubs : [];
    
    const selectedIkusubObject = ikusubs.find(ikusub => String(ikusub.id) === String(selectedIkusub));
    const ikks = selectedIkusubObject ? selectedIkusubObject.ikks : [];

    // Mengelola perubahan IKU
    const handleIkuChange = (e) => {
        const ikuId = e.target.value;
        setSelectedIku(ikuId);
        setSelectedIkusub(''); // Reset sub saat parent berubah
        setSelectedIkk('');    // Reset ikk saat parent berubah
        
        // Simpan ke data Inertia, set ID lainnya menjadi null
        setData(prevData => ({
            ...prevData,
            iku_id: ikuId,
            ikusub_id: null,
            program_kerja_id: null,
        }));
    };

    // Mengelola perubahan IKUSUB
    const handleIkusubChange = (e) => {
        const ikusubId = e.target.value;
        setSelectedIkusub(ikusubId);
        setSelectedIkk(''); // Reset ikk saat parent berubah
        
        // Simpan ke data Inertia, set ID IKK menjadi null
        setData(prevData => ({
            ...prevData,
            ikusub_id: ikusubId,
            program_kerja_id: null,
        }));
    };

    // Mengelola perubahan IKK
    const handleIkkChange = (e) => {
        const ikkId = e.target.value;
        setSelectedIkk(ikkId);
        
        // Simpan ke data Inertia (properti final yang dibutuhkan)
        setData(prevData => ({
            ...prevData,
            program_kerja_id: ikkId,
        }));
    };

    // Opsi untuk SelectInput
    const ikuOptions = programKerjas.map(iku => ({ 
        value: iku.id, 
        label: iku.nama_iku 
    }));
    
    const ikusubOptions = ikusubs.map(ikusub => ({ 
        value: ikusub.id, 
        label: ikusub.nama_ikusub 
    }));
    
    const ikkOptions = ikks.map(ikk => ({ 
        value: ikk.id, 
        label: ikk.nama_ikk 
    }));


    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Pemilihan IKU */}
            <div>
                <InputLabel htmlFor="iku_id" value="Indikator Kinerja Utama (IKU)" />
                <SelectInput
                    id="iku_id"
                    name="iku_id"
                    value={selectedIku}
                    className="mt-1 block w-full"
                    onChange={handleIkuChange}
                    required
                >
                    <option value="">Pilih IKU</option>
                    {ikuOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </SelectInput>
                <InputError message={errors.iku_id} className="mt-2" />
            </div>

            {/* 2. Pemilihan IKUSUB */}
            <div>
                <InputLabel htmlFor="ikusub_id" value="Sub Indikator Kinerja (IKUSUB)" />
                <SelectInput
                    id="ikusub_id"
                    name="ikusub_id"
                    value={selectedIkusub}
                    className="mt-1 block w-full"
                    onChange={handleIkusubChange}
                    disabled={!selectedIku} // Matikan jika IKU belum dipilih
                    required
                >
                    <option value="">Pilih IKUSUB</option>
                    {ikusubOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </SelectInput>
                <InputError message={errors.ikusub_id} className="mt-2" />
            </div>

            {/* 3. Pemilihan IKK (Program Kerja Final) */}
            <div>
                <InputLabel htmlFor="program_kerja_id" value="Indikator Kinerja Kegiatan (IKK)" />
                <SelectInput
                    id="program_kerja_id"
                    name="program_kerja_id"
                    value={selectedIkk}
                    className="mt-1 block w-full"
                    onChange={handleIkkChange}
                    disabled={!selectedIkusub} // Matikan jika IKUSUB belum dipilih
                    required
                >
                    <option value="">Pilih IKK</option>
                    {ikkOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </SelectInput>
                <InputError message={errors.program_kerja_id} className="mt-2" />
            </div>
        </div>
    );
}