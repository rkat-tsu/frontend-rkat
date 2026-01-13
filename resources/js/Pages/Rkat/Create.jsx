import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import TextArea from '@/Components/TextArea';
import RupiahInput from '@/Components/RupiahInput';
import DateInput from '@/Components/DateInput';
import CustomSelect from '@/Components/CustomSelect';
import { Plus, Trash2, Save, ArrowLeft, Calculator } from 'lucide-react';

export default function Create({ auth, tahunAnggarans, units, akunAnggarans, ikus }) {
    // --- 1. SETUP STATE FORM ---
    const { data, setData, post, processing, errors } = useForm({
        // Header
        tahun_anggaran: '',
        id_unit: auth.user.id_unit || '',
        judul_pengajuan: '',
        
        // Kinerja
        iku_id: '',
        ikk_id: '',
        
        // Detail Isian
        kode_akun: '', // Disembunyikan dari UI tapi tetap ada di data
        deskripsi_kegiatan: '', 
        latar_belakang: '',
        rasional: '',
        tujuan: '',
        mekanisme: '',
        
        // Pelaksanaan
        jadwal_pelaksanaan_mulai: '',
        jadwal_pelaksanaan_akhir: '',
        lokasi_pelaksanaan: '',
        
        // Output & Penanggung Jawab
        target: '', 
        pjawab: '', 
        keberlanjutan: 'Tidak Berlanjut',
        jenis_kegiatan: 'Rutin',
        
        // Keuangan
        anggaran: 0,
        jenis_pencairan: 'Tunai',
        nama_bank: '',
        nomor_rekening: '',
        atas_nama: '',

        // Array Dinamis
        indikator_kinerja: [
            { 
                indikator: '', 
                kondisi_akhir_2024_capaian: '', 
                tahun_2025_target: '', 
                tahun_2025_capaian: '',
                akhir_tahun_2029_target: '', 
                akhir_tahun_2029_capaian: ''
            }
        ],
        
        rincian_anggaran: [
            { 
                kode_anggaran: '', 
                kebutuhan: '', 
                vol: 1, 
                satuan: 'Paket', 
                biaya_satuan: 0, 
                jumlah: 0 
            }
        ]
    });

    const [filteredIkks, setFilteredIkks] = useState([]);

    // --- EFFECT: FILTER IKK SAAT IKU DIPILIH ---
    useEffect(() => {
        if (data.iku_id) {
            const selectedIkuObj = ikus.find(item => String(item.id_iku) === String(data.iku_id));
            if (selectedIkuObj && selectedIkuObj.ikks) {
                const options = selectedIkuObj.ikks.map(ikk => ({
                    value: ikk.id_ikk,
                    label: ikk.nama_ikk
                }));
                setFilteredIkks(options);
            } else {
                setFilteredIkks([]);
            }
        } else {
            setFilteredIkks([]);
        }
    }, [data.iku_id, ikus]);

    // --- EFFECT: HITUNG TOTAL ANGGARAN OTOMATIS ---
    useEffect(() => {
        // Pastikan konversi ke Number aman agar tidak NaN
        const total = data.rincian_anggaran.reduce((acc, item) => {
            return acc + (parseFloat(item.jumlah) || 0);
        }, 0);
        setData(prev => ({ ...prev, anggaran: total }));
    }, [data.rincian_anggaran]);

    // --- HANDLERS INDIKATOR ---
    const addIndikator = () => {
        setData('indikator_kinerja', [
            ...data.indikator_kinerja,
            { indikator: '', kondisi_akhir_2024_capaian: '', tahun_2025_target: '', tahun_2025_capaian: '', akhir_tahun_2029_target: '', akhir_tahun_2029_capaian: '' }
        ]);
    };

    const removeIndikator = (index) => {
        const list = [...data.indikator_kinerja];
        list.splice(index, 1);
        setData('indikator_kinerja', list);
    };

    const updateIndikator = (index, field, value) => {
        const list = [...data.indikator_kinerja];
        list[index][field] = value;
        setData('indikator_kinerja', list);
    };

    // --- HANDLERS RAB ---
    const addRabItem = () => {
        setData('rincian_anggaran', [
            ...data.rincian_anggaran,
            { kode_anggaran: '', kebutuhan: '', vol: 1, satuan: 'Paket', biaya_satuan: 0, jumlah: 0 }
        ]);
    };

    const removeRabItem = (index) => {
        const list = [...data.rincian_anggaran];
        list.splice(index, 1);
        setData('rincian_anggaran', list);
    };

    const updateRabItem = (index, field, value) => {
        const list = [...data.rincian_anggaran];
        list[index][field] = value;

        // Logic Hitung Subtotal per Baris
        if (field === 'vol' || field === 'biaya_satuan') {
            const vol = field === 'vol' ? (parseFloat(value) || 0) : (parseFloat(list[index].vol) || 0);
            const price = field === 'biaya_satuan' ? (parseFloat(value) || 0) : (parseFloat(list[index].biaya_satuan) || 0);
            list[index].jumlah = vol * price;
        }

        setData('rincian_anggaran', list);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('rkat.store'));
    };

    // Options for Selects
    const tahunOptions = tahunAnggarans.map(t => ({ value: t.tahun_anggaran, label: t.tahun_anggaran }));
    const unitOptions = units.map(u => ({ value: u.id_unit, label: `${u.kode_unit} - ${u.nama_unit}` }));
    const ikuOptions = ikus.map(i => ({ value: i.id_iku, label: i.nama_iku }));
    const akunOptions = akunAnggarans.map(a => ({ value: a.kode_anggaran, label: `${a.kode_anggaran} - ${a.nama_anggaran}` }));

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pengajuan RKAT Baru</h2>}
        >
            <Head title="Input RKAT" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* --- KONTAINER 1: HEADER & DATA DASAR --- */}
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-teal-500">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                                1. Data Dasar Pengajuan
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel value="Tahun Anggaran" required />
                                    <CustomSelect
                                        value={data.tahun_anggaran}
                                        onChange={(e) => setData('tahun_anggaran', e.target.value)}
                                        options={tahunOptions}
                                        placeholder="Pilih Tahun"
                                        className="mt-1"
                                    />
                                    <InputError message={errors.tahun_anggaran} className="mt-2" />
                                </div>
                                <div>
                                    {/* LABEL DIGANTI JADI UNIT KERJA */}
                                    <InputLabel value="Unit Kerja" required />
                                    <CustomSelect
                                        value={data.id_unit}
                                        onChange={(e) => setData('id_unit', e.target.value)}
                                        options={unitOptions}
                                        placeholder="Pilih Unit"
                                        disabled={auth.user.peran !== 'Admin'}
                                        className="mt-1"
                                    />
                                    <InputError message={errors.id_unit} className="mt-2" />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <InputLabel value="Judul Kegiatan" required />
                                    <TextArea
                                        value={data.judul_pengajuan}
                                        onChange={(e) => setData('judul_pengajuan', e.target.value)}
                                        className="mt-1 block w-full"
                                        rows={2}
                                        placeholder="Tuliskan judul kegiatan secara lengkap..."
                                    />
                                    <InputError message={errors.judul_pengajuan} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* --- KONTAINER 2 (DULU 3): DETAIL PELAKSANAAN --- */}
                        {/* INPUT MENURUN KE BAWAH, KODE AKUN DIHAPUS */}
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-indigo-500">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                                2. Detail Pelaksanaan
                            </h3>

                            <div className="space-y-6">
                                {/* TEXT AREA DISUSUN VERTIKAL (TURUN KE BAWAH) */}
                                <div className="space-y-6">
                                    <div>
                                        <InputLabel value="Latar Belakang" required />
                                        <TextArea 
                                            value={data.latar_belakang} 
                                            onChange={(e) => setData('latar_belakang', e.target.value)} 
                                            rows={4} 
                                            className="mt-1 w-full"
                                            placeholder="Jelaskan latar belakang kegiatan..."
                                        />
                                        <InputError message={errors.latar_belakang} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Tujuan Kegiatan" required />
                                        <TextArea 
                                            value={data.tujuan} 
                                            onChange={(e) => setData('tujuan', e.target.value)} 
                                            rows={4} 
                                            className="mt-1 w-full"
                                            placeholder="Apa tujuan yang ingin dicapai?"
                                        />
                                        <InputError message={errors.tujuan} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Rasional / Alasan" required />
                                        <TextArea 
                                            value={data.rasional} 
                                            onChange={(e) => setData('rasional', e.target.value)} 
                                            rows={4} 
                                            className="mt-1 w-full"
                                            placeholder="Mengapa kegiatan ini penting?"
                                        />
                                        <InputError message={errors.rasional} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Mekanisme Pelaksanaan" required />
                                        <TextArea 
                                            value={data.mekanisme} 
                                            onChange={(e) => setData('mekanisme', e.target.value)} 
                                            rows={4} 
                                            className="mt-1 w-full"
                                            placeholder="Bagaimana kegiatan akan dilaksanakan?"
                                        />
                                        <InputError message={errors.mekanisme} className="mt-2" />
                                    </div>
                                </div>

                                {/* Jadwal & Lokasi */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <div>
                                        <InputLabel value="Tanggal Mulai" required />
                                        <DateInput 
                                            value={data.jadwal_pelaksanaan_mulai} 
                                            onChange={(val) => setData('jadwal_pelaksanaan_mulai', val)} 
                                            className="mt-1 w-full" 
                                        />
                                        <InputError message={errors.jadwal_pelaksanaan_mulai} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Tanggal Selesai" required />
                                        <DateInput 
                                            value={data.jadwal_pelaksanaan_akhir} 
                                            onChange={(val) => setData('jadwal_pelaksanaan_akhir', val)} 
                                            className="mt-1 w-full" 
                                        />
                                        <InputError message={errors.jadwal_pelaksanaan_akhir} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Lokasi Kegiatan" required />
                                        <TextInput 
                                            value={data.lokasi_pelaksanaan} 
                                            onChange={(e) => setData('lokasi_pelaksanaan', e.target.value)} 
                                            className="mt-1 w-full h-11" 
                                            placeholder="Tempat pelaksanaan..."
                                        />
                                        <InputError message={errors.lokasi_pelaksanaan} className="mt-2" />
                                    </div>
                                </div>

                                {/* Info Tambahan */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <InputLabel value="Penanggung Jawab (PIC)" required />
                                        <TextInput 
                                            value={data.pjawab} 
                                            onChange={(e) => setData('pjawab', e.target.value)} 
                                            className="mt-1 w-full" 
                                        />
                                        <InputError message={errors.pjawab} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Target Peserta / Output" required />
                                        <TextInput 
                                            value={data.target} 
                                            onChange={(e) => setData('target', e.target.value)} 
                                            className="mt-1 w-full" 
                                            placeholder="Cth: 100 Peserta"
                                        />
                                        <InputError message={errors.target} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Status Keberlanjutan" required />
                                        <CustomSelect 
                                            value={data.keberlanjutan}
                                            onChange={(e) => setData('keberlanjutan', e.target.value)}
                                            options={[{value:'Berlanjut', label:'Berlanjut'}, {value:'Tidak Berlanjut', label:'Tidak Berlanjut'}]}
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- KONTAINER 3 (DULU 2): INDIKATOR KINERJA --- */}
                        {/* LAYOUT MENYAMPING (HORIZONTAL) */}
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-blue-500">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                                3. Indikator Kinerja
                            </h3>
                            
                            {/* IKU & IKK Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <InputLabel value="Indikator Kinerja Utama (IKU)" required />
                                    <CustomSelect
                                        value={data.iku_id}
                                        onChange={(e) => setData(prev => ({ ...prev, iku_id: e.target.value, ikk_id: '' }))}
                                        options={ikuOptions}
                                        placeholder="Pilih IKU"
                                        className="mt-1"
                                    />
                                    <InputError message={errors.iku_id} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Indikator Kinerja Kegiatan (IKK)" required />
                                    <CustomSelect
                                        value={data.ikk_id}
                                        onChange={(e) => setData('ikk_id', e.target.value)}
                                        options={filteredIkks}
                                        placeholder={data.iku_id ? "Pilih Kegiatan (IKK)" : "Pilih IKU Terlebih Dahulu"}
                                        disabled={!data.iku_id}
                                        className="mt-1"
                                    />
                                    <InputError message={errors.ikk_id} className="mt-2" />
                                </div>
                            </div>

                            {/* TABEL TARGET DINAMIS - LAYOUT MENYAMPING */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <InputLabel value="Target Kinerja (Kuantitatif)" />
                                    <button type="button" onClick={addIndikator} className="text-sm flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
                                        <Plus size={16} className="mr-1" /> Tambah Baris
                                    </button>
                                </div>
                                
                                <div className="space-y-2">
                                    {/* Header Kecil untuk Tabel Custom */}
                                    <div className="hidden md:grid grid-cols-12 gap-4 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <div className="col-span-4">Nama Indikator</div>
                                        <div className="col-span-2">Baseline 2024</div>
                                        <div className="col-span-3 text-teal-600">Target 2025</div>
                                        <div className="col-span-3">Target 2029</div>
                                    </div>

                                    {data.indikator_kinerja.map((item, index) => (
                                        <div key={index} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-700/30 relative grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                                            {/* Baris Indikator dibuat Horizontal Menyamping */}
                                            
                                            <div className="md:col-span-4">
                                                <span className="md:hidden text-xs text-gray-500 block mb-1">Nama Indikator</span>
                                                <TextInput 
                                                    value={item.indikator} 
                                                    onChange={(e) => updateIndikator(index, 'indikator', e.target.value)}
                                                    placeholder="Deskripsi Indikator..." 
                                                    className="w-full h-10 text-sm" 
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <span className="md:hidden text-xs text-gray-500 block mb-1">Baseline 2024</span>
                                                <TextInput 
                                                    value={item.kondisi_akhir_2024_capaian} 
                                                    onChange={(e) => updateIndikator(index, 'kondisi_akhir_2024_capaian', e.target.value)}
                                                    className="w-full h-10 text-sm"
                                                    placeholder="Cth: 10%"
                                                />
                                            </div>
                                            
                                            <div className="md:col-span-3">
                                                <span className="md:hidden text-xs text-teal-600 font-bold block mb-1">Target 2025</span>
                                                <TextInput 
                                                    value={item.tahun_2025_target} 
                                                    onChange={(e) => updateIndikator(index, 'tahun_2025_target', e.target.value)}
                                                    className="w-full h-10 text-sm border-teal-200 focus:border-teal-500 focus:ring-teal-500 bg-white" 
                                                    placeholder="Target Tahun Ini"
                                                />
                                            </div>
                                            
                                            <div className="md:col-span-3 pr-6">
                                                <span className="md:hidden text-xs text-gray-500 block mb-1">Target 2029</span>
                                                <TextInput 
                                                    value={item.akhir_tahun_2029_target} 
                                                    onChange={(e) => updateIndikator(index, 'akhir_tahun_2029_target', e.target.value)}
                                                    className="w-full h-10 text-sm" 
                                                    placeholder="Jangka Panjang"
                                                />
                                            </div>

                                            {data.indikator_kinerja.length > 1 && (
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeIndikator(index)} 
                                                    className="absolute top-3 right-2 text-gray-400 hover:text-red-500 transition-colors"
                                                    title="Hapus Baris"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <InputError message={errors.indikator_kinerja} className="mt-2" />
                            </div>
                        </div>

                        {/* --- KONTAINER 4: RAB (ANGGARAN) --- */}
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-yellow-500">
                            <div className="mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    4. Rincian Anggaran Belanja (RAB)
                                </h3>
                            </div>

                            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th className="px-4 py-3 w-12 text-center">No</th>
                                            <th className="px-4 py-3 w-1/4">Akun Belanja</th>
                                            <th className="px-4 py-3">Uraian / Kebutuhan</th>
                                            <th className="px-4 py-3 w-20 text-center">Vol</th>
                                            <th className="px-4 py-3 w-24">Satuan</th>
                                            <th className="px-4 py-3 w-36">Harga (@)</th>
                                            <th className="px-4 py-3 w-36 text-right">Subtotal</th>
                                            <th className="px-4 py-3 w-12"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {data.rincian_anggaran.map((item, index) => (
                                            <tr key={index} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                <td className="px-4 py-2 text-center font-medium text-gray-500">{index + 1}</td>
                                                <td className="px-4 py-2">
                                                    <select 
                                                        value={item.kode_anggaran}
                                                        onChange={(e) => updateRabItem(index, 'kode_anggaran', e.target.value)}
                                                        className="block w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                                                    >
                                                        <option value="">- Pilih Akun -</option>
                                                        {akunAnggarans.map(a => (
                                                            <option key={a.id_rincian_anggaran} value={a.kode_anggaran}>
                                                                {a.kode_anggaran} - {a.nama_anggaran}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-2">
                                                    <TextInput 
                                                        value={item.kebutuhan} 
                                                        onChange={(e) => updateRabItem(index, 'kebutuhan', e.target.value)} 
                                                        className="w-full h-9 text-sm" 
                                                        placeholder="Deskripsi item..."
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <TextInput 
                                                        type="number" 
                                                        value={item.vol} 
                                                        onChange={(e) => updateRabItem(index, 'vol', e.target.value)} 
                                                        className="w-full h-9 text-sm text-center" 
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <TextInput 
                                                        value={item.satuan} 
                                                        onChange={(e) => updateRabItem(index, 'satuan', e.target.value)} 
                                                        className="w-full h-9 text-sm" 
                                                    />
                                                </td>
                                                <td className="px-4 py-2">
                                                    <RupiahInput 
                                                        value={item.biaya_satuan} 
                                                        onValueChange={(val) => updateRabItem(index, 'biaya_satuan', val)} 
                                                        className="w-full h-9 text-sm text-right" 
                                                    />
                                                </td>
                                                <td className="px-4 py-2 text-right font-semibold">
                                                    {new Intl.NumberFormat('id-ID').format(item.jumlah)}
                                                </td>
                                                <td className="px-4 py-2 text-center">
                                                    {data.rincian_anggaran.length > 1 && (
                                                        <button type="button" onClick={() => removeRabItem(index)} className="text-gray-400 hover:text-red-600 transition-colors">
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div className="flex justify-between items-end">
                                <button type="button" onClick={addRabItem} className="inline-flex items-center text-sm font-medium text-yellow-600 hover:text-yellow-700">
                                    <Plus size={16} className="mr-1" /> Tambah Item Anggaran
                                </button>

                                {/* TOTAL ANGGARAN DIPINDAH KE BAWAH */}
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">Total Estimasi Anggaran</span>
                                    <div className="text-2xl font-bold text-gray-900 flex items-center mt-1">
                                        <Calculator className="w-5 h-5 mr-2 text-gray-400" />
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(data.anggaran)}
                                    </div>
                                </div>
                            </div>
                            <InputError message={errors.rincian_anggaran} className="mt-2" />
                        </div>

                        {/* --- KONTAINER 5: METODE PENCAIRAN (OPTIMALIZED UI) --- */}
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-green-500">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
                                5. Metode Pencairan Dana
                            </h3>
                            
                            <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-5 border border-gray-100 dark:border-gray-700">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                    <div>
                                        <InputLabel value="Pilih Metode Pencairan" />
                                        <CustomSelect
                                            value={data.jenis_pencairan}
                                            onChange={(e) => setData('jenis_pencairan', e.target.value)}
                                            options={[{value:'Tunai', label:'Tunai (Cash)'}, {value:'Bank', label:'Transfer Bank'}]}
                                            className="mt-1 w-full"
                                        />
                                        <p className="text-xs text-gray-500 mt-2">
                                            Pilih "Transfer Bank" jika dana ingin dikirim langsung ke rekening penerima/vendor.
                                        </p>
                                    </div>

                                    {/* Form Bank Conditional dengan Animasi Halus */}
                                    {data.jenis_pencairan === 'Bank' && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300 border-l-2 border-green-200 pl-4">
                                            <div>
                                                <InputLabel value="Nama Bank" />
                                                <TextInput value={data.nama_bank} onChange={(e) => setData('nama_bank', e.target.value)} className="mt-1 w-full h-10" placeholder="Cth: Bank BNI" />
                                            </div>
                                            <div>
                                                <InputLabel value="Nomor Rekening" />
                                                <TextInput value={data.nomor_rekening} onChange={(e) => setData('nomor_rekening', e.target.value)} className="mt-1 w-full h-10" placeholder="Cth: 1234567890" />
                                            </div>
                                            <div>
                                                <InputLabel value="Atas Nama" />
                                                <TextInput value={data.atas_nama} onChange={(e) => setData('atas_nama', e.target.value)} className="mt-1 w-full h-10" placeholder="Nama Pemilik Rekening" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* --- TOMBOL AKSI STICKY --- */}
                        <div className="sticky bottom-4 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 rounded-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <Link href={route('dashboard')} className="text-gray-600 hover:text-gray-900 font-medium text-sm flex items-center px-4 py-2 hover:bg-gray-100 rounded-md transition-colors">
                                <ArrowLeft size={16} className="mr-2" /> Kembali ke Dashboard
                            </Link>
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block mr-4">
                                    <p className="text-xs text-gray-500">Total Pengajuan</p>
                                    <p className="text-sm font-bold text-teal-600">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(data.anggaran)}</p>
                                </div>
                                <PrimaryButton disabled={processing} className="px-6 py-3 text-base shadow-teal-200 hover:shadow-teal-400">
                                    <Save size={18} className="mr-2" /> Simpan Pengajuan RKAT
                                </PrimaryButton>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}