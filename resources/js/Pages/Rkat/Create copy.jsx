// resources/js/Pages/Rkat/Create.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import TextArea from '@/Components/TextArea'; 
import InputError from '@/Components/InputError';
import DangerButton from '@/Components/DangerButton';
import RupiahInput from '@/Components/RupiahInput';

// ====================================================================
// UTILITY FUNCTIONS (Ambil dari Create copy.jsx)
// ====================================================================
const formatRupiah = (angka) => {
    return `Rp. ${Number(angka).toLocaleString('id-ID', { minimumFractionDigits: 2 })}`;
};

const parseRupiah = (rupiah) => {
    if (!rupiah) return 0;
    const clean = rupiah.replace(/[^,\d]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
};

// ====================================================================
// RupiahInput Component (Ambil dari Create copy.jsx)
// ====================================================================
const RupiahInput = React.forwardRef(({ value, onChange, ...props }, ref) => {
    
    // State untuk menyimpan nilai yang diformat saat ditampilkan
    const [displayValue, setDisplayValue] = useState(value ? formatRupiah(value) : 'Rp. 0,00');

    useEffect(() => {
        // Update displayValue saat nilai (value) dari luar berubah
        setDisplayValue(value ? formatRupiah(value) : 'Rp. 0,00');
    }, [value]);

    const handleFocus = () => {
        // Saat fokus, tampilkan hanya angka mentah
        setDisplayValue(value || '');
    };

    const handleBlur = () => {
        // Saat blur, format kembali ke Rupiah
        const parsedValue = parseRupiah(displayValue);
        setDisplayValue(formatRupiah(parsedValue));
        // Memastikan komponen induk mendapatkan nilai numerik yang bersih
        if (onChange) {
            // Mengirim balik nilai numerik bersih
            onChange({ target: { value: parsedValue } });
        }
    };

    const handleChange = (e) => {
        // Saat mengetik, biarkan nilai apa adanya (tanpa Rp)
        setDisplayValue(e.target.value);
    };

    return (
        <TextInput
            ref={ref}
            value={displayValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            type="text"
            {...props}
        />
    );
});


// ====================================================================
// Komponen Utama Form RKAT
// ====================================================================
export default function Create({ auth, tahunAnggarans, departemens, programKerjas, akunAnggarans }) {
    
    // Menginisiasi form dengan data awal
    const { data, setData, post, processing, errors } = useForm({
        // Data Header (untuk RkatHeader)
        tahun_anggaran: tahunAnggarans[0]?.tahun_anggaran || '',
        id_departemen: auth.user.id_departemen || departemens[0]?.id_departemen || '', // Otomatis dari user login
        kode_kegiatan: '', // I.A.1.1 (Sesuai Form Image)
        judul_pengajuan: '',
        
        // Data Detail (untuk RkatDetail)
        id_program: programKerjas[0]?.id_proker || '',
        kode_akun: akunAnggarans[0]?.kode_akun || '',
        jadwal_pelaksanaan: new Date().toISOString().slice(0, 10), // Ganti 'waktu_pelaksanaan' ke 'jadwal_pelaksanaan'
        lokasi_pelaksanaan: '',
        latar_belakang: '',
        rasional: '',
        tujuan: '',
        mekanisme: '',
        
        // Indikator Kerja (Mapping ke 'target' di backend)
        indikator_keberhasilan: '', 
        
        // REPEATING FORM FIELD (RAB Details) - Akan disimpan ke kolom 'rincian_anggaran_rab'
        rincian_anggaran: [
            { id: 1, kebutuhan: '', keterangan: '', vol: 1, satuan: 'unit', biaya_satuan: 0, jumlah: 0 }
        ],
        
        // Total Anggaran (mapping ke 'anggaran' di backend)
        anggaran: 0, 
    });
    
    // State untuk Dropdown IKU/IKK (Hierarki)
    const [selectedIKU, setSelectedIKU] = useState('');
    const [selectedIKUSub, setSelectedIKUSub] = useState('');

    // State untuk filter program kerja
    const [filteredProgramKerjas, setFilteredProgramKerjas] = useState(programKerjas);
    
    
    // --- EFECTS DAN HANDLER ---

    // 1. Total Anggaran Effect: Menghitung total anggaran dari rincian RAB
    useEffect(() => {
        const total = data.rincian_anggaran.reduce((sum, item) => sum + (item.jumlah || 0), 0);
        setData('anggaran', total);
    }, [data.rincian_anggaran]);

    // 2. Program Kerja Filter Effect: Mengelola hierarki IKU/IKK
    // Menampilkan Program Kerja yang relevan berdasarkan IKU/SubIKU yang dipilih
    useEffect(() => {
        // Mengambil semua nama IKU unik
        const uniqueIKUs = [...new Set(programKerjas.map(p => p.ikk?.ikusub?.iku?.nama_iku).filter(Boolean))];
        
        // Reset pilihan Sub IKU jika IKU berubah
        if (selectedIKU && !uniqueIKUs.includes(selectedIKU)) {
            setSelectedIKUSub('');
        }
        
        let filtered = programKerjas;
        
        if (selectedIKU) {
            filtered = filtered.filter(proker => proker.ikk?.ikusub?.iku?.nama_iku === selectedIKU);
        }

        if (selectedIKUSub) {
            filtered = filtered.filter(proker => proker.ikk?.ikusub?.nama_ikusub === selectedIKUSub);
        }
        
        setFilteredProgramKerjas(filtered);
        
        // Reset id_program jika program yang dipilih tidak ada di filter baru
        if (!filtered.some(p => p.id_proker == data.id_program) && filtered.length > 0) {
             setData('id_program', filtered[0].id_proker);
        } else if (filtered.length === 0) {
             setData('id_program', '');
        }
        
    }, [selectedIKU, selectedIKUSub, programKerjas]);
    
    // 3. RAB Handler: Mengupdate baris rincian RAB
    const handleRincianChange = (index, field, value) => {
        const newRincian = [...data.rincian_anggaran];
        newRincian[index][field] = value;
        
        // Hitung ulang Jumlah
        if (field === 'vol' || field === 'biaya_satuan') {
            const vol = newRincian[index].vol || 0;
            const biayaSatuan = newRincian[index].biaya_satuan || 0;
            newRincian[index].jumlah = vol * biayaSatuan;
        }

        setData('rincian_anggaran', newRincian);
    };
    
    // 4. RAB Handler: Menambah baris
    const addRincianRow = () => {
        setData('rincian_anggaran', [
            ...data.rincian_anggaran, 
            { id: Date.now(), kebutuhan: '', keterangan: '', vol: 1, satuan: 'unit', biaya_satuan: 0, jumlah: 0 }
        ]);
    };
    
    // 5. RAB Handler: Menghapus baris
    const removeRincianRow = (id) => {
        setData('rincian_anggaran', data.rincian_anggaran.filter(item => item.id !== id));
    };

    // 6. Submit Handler
    const submit = (e) => {
        e.preventDefault();
        // Controller akan menerima data.rincian_anggaran dan menyimpannya sebagai JSON di rincian_anggaran_rab
        // Controller akan menerima data.indikator_keberhasilan dan menyimpannya di target
        post(route('rkat.store'));
    };
    
    
    // --- DATA OPTION UNTUK DROPDOWN ---

    // Mengambil IKU unik
    const uniqueIKUs = [...new Set(programKerjas.map(p => p.ikk?.ikusub?.iku?.nama_iku).filter(Boolean))];
    
    // Mengambil IKUSub unik berdasarkan IKU yang dipilih
    const uniqueIKUSubs = selectedIKU 
        ? [...new Set(programKerjas
            .filter(p => p.ikk?.ikusub?.iku?.nama_iku === selectedIKU)
            .map(p => p.ikk?.ikusub?.nama_ikusub)
            .filter(Boolean)
          )]
        : [];
        
    // Mendapatkan nama departemen berdasarkan ID
    const currentDepartemen = departemens.find(d => d.id_departemen == data.id_departemen)?.nama_departemen || 'N/A';
    
    // Mendapatkan IKKS unik berdasarkan program yang dipilih
    const selectedProgram = programKerjas.find(p => p.id_proker == data.id_program);
    const ikkName = selectedProgram?.ikk?.nama_ikk || 'Pilih Program Kerja';


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Input RKAT</h2>}
        >
            <Head title="Input RKAT" />

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="bg-white dark:bg-gray-800 p-8 shadow-xl sm:rounded-lg">
                        
                        {/* ==================================================================== */}
                        {/* BAGIAN HEADER (2 KOLOM) */}
                        {/* ==================================================================== */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b pb-6 dark:border-gray-700">
                            
                            {/* KOLOM KIRI */}
                            <div>
                                {/* Kode Kegiatan */}
                                <InputLabel htmlFor="kode_kegiatan" value="Kode Kegiatan" />
                                <TextInput
                                    id="kode_kegiatan"
                                    name="kode_kegiatan"
                                    value={data.kode_kegiatan}
                                    onChange={(e) => setData('kode_kegiatan', e.target.value)}
                                    className="mt-1 block w-full bg-gray-100 dark:bg-gray-700"
                                    isFocused
                                    placeholder="Diisi otomatis atau manual (cth: I.A.1.1)"
                                />
                                <InputError message={errors.kode_kegiatan} className="mt-2" />
                                
                                {/* Unit Kerja / Sub Unit (Otomatis) */}
                                <div className="mt-4">
                                    <InputLabel value="Unit Kerja / Sub Unit" />
                                    {/* Jika user login memiliki id_departemen, gunakan itu, jika tidak gunakan dropdown */}
                                    {auth.user.id_departemen ? (
                                        <TextInput
                                            value={currentDepartemen}
                                            className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                                            readOnly
                                        />
                                    ) : (
                                        <SelectInput
                                            id="id_departemen"
                                            name="id_departemen"
                                            value={data.id_departemen}
                                            onChange={(e) => setData('id_departemen', e.target.value)}
                                            className="mt-1 block w-full"
                                        >
                                            <option value="">Pilih Unit</option>
                                            {departemens.map((dep) => (
                                                <option key={dep.id_departemen} value={dep.id_departemen}>
                                                    {dep.nama_departemen}
                                                </option>
                                            ))}
                                        </SelectInput>
                                    )}
                                    <InputError message={errors.id_departemen} className="mt-2" />
                                </div>
                                
                                {/* Judul Kegiatan */}
                                <div className="mt-4">
                                    <InputLabel htmlFor="judul_pengajuan" value="Judul Kegiatan" />
                                    <TextInput
                                        id="judul_pengajuan"
                                        name="judul_pengajuan"
                                        value={data.judul_pengajuan}
                                        onChange={(e) => setData('judul_pengajuan', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.judul_pengajuan} className="mt-2" />
                                </div>
                                
                                {/* IKK (Display dari Program Kerja yang dipilih) */}
                                <div className="mt-4">
                                    <InputLabel value="IKK" />
                                    <TextInput
                                        value={ikkName}
                                        className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                                        readOnly
                                    />
                                </div>
                                
                            </div>
                            
                            {/* KOLOM KANAN */}
                            <div>
                                {/* Tahun Anggaran */}
                                <InputLabel htmlFor="tahun_anggaran" value="Tahun Anggaran" />
                                <SelectInput
                                    id="tahun_anggaran"
                                    name="tahun_anggaran"
                                    value={data.tahun_anggaran}
                                    onChange={(e) => setData('tahun_anggaran', e.target.value)}
                                    className="mt-1 block w-full"
                                >
                                    {tahunAnggarans.map(ta => (
                                        <option key={ta.tahun_anggaran} value={ta.tahun_anggaran}>{ta.tahun_anggaran}</option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.tahun_anggaran} className="mt-2" />
                                
                                {/* Jadwal Pelaksanaan */}
                                <div className="mt-4">
                                    <InputLabel htmlFor="jadwal_pelaksanaan" value="Jadwal Pelaksanaan" />
                                    <TextInput
                                        id="jadwal_pelaksanaan"
                                        type="date"
                                        name="jadwal_pelaksanaan"
                                        value={data.jadwal_pelaksanaan}
                                        onChange={(e) => setData('jadwal_pelaksanaan', e.target.value)}
                                        className="mt-1 block w-full"
                                    />
                                    <InputError message={errors.jadwal_pelaksanaan} className="mt-2" />
                                </div>
                                
                                {/* Akun Anggaran */}
                                <div className="mt-4">
                                    <InputLabel htmlFor="kode_akun" value="Akun Anggaran (Akun Belanja)" />
                                    <SelectInput
                                        id="kode_akun"
                                        name="kode_akun"
                                        value={data.kode_akun}
                                        onChange={(e) => setData('kode_akun', e.target.value)}
                                        className="mt-1 block w-full"
                                    >
                                        {akunAnggarans.map(akun => (
                                            <option key={akun.kode_akun} value={akun.kode_akun}>{akun.kode_akun} - {akun.nama_akun}</option>
                                        ))}
                                    </SelectInput>
                                    <InputError message={errors.kode_akun} className="mt-2" />
                                </div>
                                
                                {/* Lokasi Pelaksanaan */}
                                <div className="mt-4">
                                    <InputLabel htmlFor="lokasi_pelaksanaan" value="Lokasi Pelaksanaan" />
                                    <TextInput
                                        id="lokasi_pelaksanaan"
                                        name="lokasi_pelaksanaan"
                                        value={data.lokasi_pelaksanaan || ''} 
                                        onChange={(e) => setData('lokasi_pelaksanaan', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Cth: Lab 5 & 6"
                                    />
                                    <InputError message={errors.lokasi_pelaksanaan} className="mt-2" />
                                </div>

                            </div>
                        </div>

                        {/* ==================================================================== */}
                        {/* BAGIAN PROGRAM / KEGIATAN (3 KOLOM HIERARKI) */}
                        {/* ==================================================================== */}
                        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Keterkaitan Program/IKU</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 border-b pb-6 dark:border-gray-700">
                            
                            {/* IKU */}
                            <div>
                                <InputLabel htmlFor="iku" value="IKU (Indikator Kinerja Utama)" />
                                <SelectInput
                                    id="iku"
                                    value={selectedIKU}
                                    onChange={(e) => {
                                        setSelectedIKU(e.target.value);
                                        setSelectedIKUSub(''); // Reset Sub IKU ketika IKU berubah
                                    }}
                                    className="mt-1 block w-full"
                                >
                                    <option value="">Pilih IKU</option>
                                    {uniqueIKUs.map(iku => (
                                        <option key={iku} value={iku}>{iku}</option>
                                    ))}
                                </SelectInput>
                            </div>
                            
                            {/* SUB IKU */}
                            <div>
                                <InputLabel htmlFor="ikusub" value="Sub IKU" />
                                <SelectInput
                                    id="ikusub"
                                    value={selectedIKUSub}
                                    onChange={(e) => setSelectedIKUSub(e.target.value)}
                                    className="mt-1 block w-full"
                                    disabled={!selectedIKU}
                                >
                                    <option value="">Pilih Sub IKU</option>
                                    {uniqueIKUSubs.map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </SelectInput>
                            </div>
                            
                            {/* PROGRAM KERJA / KEGIATAN (Filter berdasarkan IKU & Sub IKU) */}
                            <div>
                                <InputLabel htmlFor="id_program" value="Program / Kegiatan" />
                                <SelectInput
                                    id="id_program"
                                    name="id_program"
                                    value={data.id_program}
                                    onChange={(e) => setData('id_program', e.target.value)}
                                    className="mt-1 block w-full"
                                    disabled={filteredProgramKerjas.length === 0}
                                >
                                    {filteredProgramKerjas.length === 0 ? (
                                        <option value="">Tidak ada Program yang tersedia</option>
                                    ) : (
                                        filteredProgramKerjas.map(proker => (
                                            <option key={proker.id_proker} value={proker.id_proker}>{proker.nama_proker}</option>
                                        ))
                                    )}
                                </SelectInput>
                                <InputError message={errors.id_program} className="mt-2" />
                            </div>
                        </div>

                        {/* ==================================================================== */}
                        {/* BAGIAN DESKRIPSI (TEXTAREA) */}
                        {/* ==================================================================== */}
                        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Deskripsi Kegiatan</h3>
                        <div className="space-y-6 mb-8 border-b pb-6 dark:border-gray-700">
                            {/* Latar Belakang */}
                            <div>
                                <InputLabel htmlFor="latar_belakang" value="Latar Belakang" />
                                <TextArea
                                    id="latar_belakang"
                                    name="latar_belakang"
                                    value={data.latar_belakang}
                                    onChange={(e) => setData('latar_belakang', e.target.value)}
                                    className="mt-1 block w-full resize-y"
                                    rows="3"
                                />
                                <InputError message={errors.latar_belakang} className="mt-2" />
                            </div>
                            
                            {/* Rasionalisasi */}
                            <div>
                                <InputLabel htmlFor="rasional" value="Rasionalisasi" />
                                <TextArea
                                    id="rasional"
                                    name="rasional"
                                    value={data.rasional}
                                    onChange={(e) => setData('rasional', e.target.value)}
                                    className="mt-1 block w-full resize-y"
                                    rows="3"
                                />
                                <InputError message={errors.rasional} className="mt-2" />
                            </div>
                            
                            {/* Tujuan */}
                            <div>
                                <InputLabel htmlFor="tujuan" value="Tujuan" />
                                <TextArea
                                    id="tujuan"
                                    name="tujuan"
                                    value={data.tujuan}
                                    onChange={(e) => setData('tujuan', e.target.value)}
                                    className="mt-1 block w-full resize-y"
                                    rows="3"
                                />
                                <InputError message={errors.tujuan} className="mt-2" />
                            </div>
                            
                            {/* Mekanisme & Rancangan */}
                            <div>
                                <InputLabel htmlFor="mekanisme" value="Mekanisme & Rancangan" />
                                <TextArea
                                    id="mekanisme"
                                    name="mekanisme"
                                    value={data.mekanisme}
                                    onChange={(e) => setData('mekanisme', e.target.value)}
                                    className="mt-1 block w-full resize-y"
                                    rows="3"
                                />
                                <InputError message={errors.mekanisme} className="mt-2" />
                            </div>

                            {/* Indikator Kerja (Mapping ke 'target' di backend) */}
                            <div>
                                <InputLabel htmlFor="indikator_keberhasilan" value="Indikator Kerja" />
                                <TextArea
                                    id="indikator_keberhasilan"
                                    name="indikator_keberhasilan"
                                    value={data.indikator_keberhasilan}
                                    onChange={(e) => setData('indikator_keberhasilan', e.target.value)}
                                    className="mt-1 block w-full resize-y"
                                    rows="3"
                                />
                                <InputError message={errors.indikator_keberhasilan} className="mt-2" />
                            </div>
                            
                            {/* Field Tambahan: PJawab dan Keberlanjutan (Jika diperlukan di form) 
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="pjawab" value="Penanggung Jawab" />
                                    <TextInput id="pjawab" name="pjawab" value={data.pjawab} onChange={(e) => setData('pjawab', e.target.value)} className="mt-1 block w-full" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="keberlanjutan" value="Keberlanjutan" />
                                    <TextInput id="keberlanjutan" name="keberlanjutan" value={data.keberlanjutan} onChange={(e) => setData('keberlanjutan', e.target.value)} className="mt-1 block w-full" />
                                </div>
                            </div>
                            */}
                        </div>

                        {/* ==================================================================== */}
                        {/* BAGIAN RINCIAN ANGGARAN (RAB) - REPEATING FORM */}
                        {/* ==================================================================== */}
                        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Rincian Anggaran (RAB)</h3>
                        
                        <div className="overflow-x-auto mb-6">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border dark:border-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-10">No.</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-40">Nama Kebutuhan</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-52">Keterangan</th>
                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-20">Vol</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-24">Satuan</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-36">Biaya Satuan</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-36">Jumlah</th>
                                        <th className="w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {data.rincian_anggaran.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">{index + 1}</td>
                                            
                                            {/* Nama Kebutuhan */}
                                            <td className="p-1">
                                                <TextInput
                                                    value={item.kebutuhan}
                                                    onChange={(e) => handleRincianChange(index, 'kebutuhan', e.target.value)}
                                                    className="w-full text-sm"
                                                    placeholder="Nama item"
                                                />
                                            </td>
                                            
                                            {/* Keterangan */}
                                            <td className="p-1">
                                                <TextInput
                                                    value={item.keterangan}
                                                    onChange={(e) => handleRincianChange(index, 'keterangan', e.target.value)}
                                                    className="w-full text-sm"
                                                    placeholder="Deskripsi singkat"
                                                />
                                            </td>
                                            
                                            {/* Vol */}
                                            <td className="p-1">
                                                <TextInput
                                                    value={item.vol}
                                                    onChange={(e) => handleRincianChange(index, 'vol', parseInt(e.target.value) || 0)}
                                                    className="w-full text-sm text-center"
                                                    type="number"
                                                    min="1"
                                                />
                                            </td>
                                            
                                            {/* Satuan */}
                                            <td className="p-1">
                                                <TextInput
                                                    value={item.satuan}
                                                    onChange={(e) => handleRincianChange(index, 'satuan', e.target.value)}
                                                    className="w-full text-sm"
                                                />
                                            </td>
                                            
                                            {/* Biaya Satuan */}
                                            <td className="p-1">
                                                <RupiahInput
                                                    value={item.biaya_satuan}
                                                    onChange={(e) => handleRincianChange(index, 'biaya_satuan', e.target.value)}
                                                    className="w-full text-sm text-right"
                                                />
                                            </td>
                                            
                                            {/* Jumlah (Otomatis) */}
                                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 font-medium text-right bg-gray-50 dark:bg-gray-700">
                                                {formatRupiah(item.jumlah)}
                                            </td>
                                            
                                            {/* Tombol Hapus */}
                                            <td className="px-2 py-2 text-sm text-center">
                                                <DangerButton type="button" onClick={() => removeRincianRow(item.id)} className="p-1 h-8 w-8 flex items-center justify-center">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </DangerButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Tombol Tambah dan Total */}
                        <div className="flex justify-between items-center mb-8">
                            <PrimaryButton type="button" onClick={addRincianRow}>
                                + Tambah Baris
                            </PrimaryButton>
                            <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                Total Anggaran: <span className="text-indigo-600 dark:text-indigo-400">{formatRupiah(data.anggaran)}</span>
                            </div>
                        </div>


                        {/* ==================================================================== */}
                        {/* BAGIAN FOOTER (TOMBOL SIMPAN/KIRIM) */}
                        {/* ==================================================================== */}
                        <div className="flex justify-end space-x-4 pt-4 border-t dark:border-gray-700">
                            <PrimaryButton type="submit" disabled={processing} className="bg-green-500 hover:bg-green-600">
                                Simpan Draft
                            </PrimaryButton>
                            <PrimaryButton type="submit" disabled={processing} className="bg-blue-600 hover:bg-blue-700">
                                Kirim
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}