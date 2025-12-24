// resources/js/Pages/Rkat/Create.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import TextArea from '@/Components/TextArea';
import InputError from '@/Components/InputError';
import DangerButton from '@/Components/DangerButton';
import RupiahInput from '@/Components/RupiahInput';
import DateInput from '@/Components/DateInput';
import { Trash2, ChevronDown, Check } from 'lucide-react';
import { cn } from "@/lib/utils";

import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/Components/ui/dropdown-menu";

// ====================================================================
// UTILITY COMPONENTS & FUNCTIONS
// ====================================================================
const formatRupiah = (angka) => {
    const number = Number(angka) || 0;
    return `Rp. ${number.toLocaleString('id-ID', { minimumFractionDigits: 2 })}`;
};

/**
 * CustomSelect Component
 * Wrapper untuk Radix Dropdown agar mudah digunakan menggantikan Select HTML biasa.
 */
const CustomSelect = ({ value, onChange, options = [], placeholder = "Pilih...", className, disabled }) => {
    const selectedOption = options.find(opt => String(opt.value) === String(value));
    const displayLabel = selectedOption ? selectedOption.label : placeholder;

    return (
        <DropdownMenu>
            {/* Height h-11 (44px) sudah diterapkan di sini */}
            <DropdownMenuTrigger disabled={disabled} className={cn(
                "flex h-11 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 dark:focus:ring-teal-600 dark:focus:border-teal-600",
                className
            )}>
                <span className="truncate">{displayLabel}</span>
                <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                {options.length === 0 ? (
                    <div className=" text-sm text-gray-500 text-center">Tidak ada data</div>
                ) : (
                    options.map((opt) => (
                        <DropdownMenuItem
                            key={opt.value}
                            onSelect={() => {
                                onChange({ target: { value: opt.value } });
                            }}
                            className="cursor-pointer"
                        >
                            {opt.label}
                            {String(opt.value) === String(value) && <Check className="ml-auto h-4 w-4" />}
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

/**
 * TableContainer Component
 * Wrapper untuk menambahkan border radius dan overflow-x-auto.
 */
const TableContainer = ({ children, className = "" }) => (
    // Outer div untuk margin bottom
    <div className={cn("mb-6", className)}>
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                {children}
            </div>
        </div>
    </div>
);


// ====================================================================
// Komponen Utama Form RKAT
// ====================================================================
export default function Create({ auth, tahunAnggarans, units, akunAnggarans, ikus, ikuSubs, ikks }) {

    // ... (Logika State dan Hooks tetap sama) ...
    const initialIndikator = {
        id: Date.now(),
        indikator: '',
        kondisi_akhir_2024_capaian: '',
        tahun_2025_target: '',
        tahun_2025_capaian: '',
        akhir_tahun_2029_target: '',
        akhir_tahun_2029_capaian: '',
    };

    const initialRAB = {
        id: Date.now() + 1,
        kode_anggaran: akunAnggarans[0]?.kode_anggaran || '',
        kebutuhan: '',
        keterangan: '',
        vol: 1,
        satuan: 'unit',
        biaya_satuan: 0,
        jumlah: 0
    };

    const initialData = {
        tahun_anggaran: tahunAnggarans[0]?.tahun_anggaran || '',
        id_unit: auth.user.id_unit || units[0]?.id_unit || '',
        kode_kegiatan: '',
        judul_pengajuan: '',
        iku_id: '',
        ikusub_id: '',
        ikk_id: '',
        kode_akun: akunAnggarans[0]?.kode_anggaran || '',
        jadwal_pelaksanaan_mulai: new Date().toISOString().slice(0, 10),
        jadwal_pelaksanaan_akhir: new Date().toISOString().slice(0, 10),
        lokasi_pelaksanaan: '',
        latar_belakang: '',
        rasional: '',
        tujuan: '',
        mekanisme: '',
        target: '',
        keberlanjutan: '',
        pjawab: '',
        jenis_kegiatan: 'Rutin',
        jenis_pencairan: 'Tunai',
        nama_bank: '',
        nomor_rekening: '',
        atas_nama: '',
        indikator_kinerja: [initialIndikator],
        rincian_anggaran: [initialRAB],
        anggaran: 0,
    };

    const { data, setData, post, processing, errors, reset } = useForm(initialData);
    const [serverError, setServerError] = useState(null);

    const [selectedIKUId, setSelectedIKUId] = useState('');
    const [selectedIKUSubId, setSelectedIKUSubId] = useState('');
    const [selectedIKKId, setSelectedIKKId] = useState('');
    const [manualDeskripsi, setManualDeskripsi] = useState(false);

    // --- EFECTS DAN HANDLER ---
    useEffect(() => {
        const total = data.rincian_anggaran.reduce((sum, item) => sum + (item.jumlah || 0), 0);
        setData('anggaran', total);
    }, [data.rincian_anggaran]);

    // Auto-fill `deskripsi_kegiatan` from `judul_pengajuan` unless user manually edited it
    useEffect(() => {
        const title = data.judul_pengajuan || '';
        if (!manualDeskripsi && (data.deskripsi_kegiatan !== title)) {
            setData('deskripsi_kegiatan', title);
        }
    }, [data.judul_pengajuan]);

    

    const handleIndikatorChange = (index, field, value) => {
        const newIndikator = [...data.indikator_kinerja];
        newIndikator[index][field] = value;
        setData('indikator_kinerja', newIndikator);
    };

    const addIndikatorRow = () => {
        setData('indikator_kinerja', [
            ...data.indikator_kinerja,
            { ...initialIndikator, id: Date.now() }
        ]);
    };

    const removeIndikatorRow = (id) => {
        setData('indikator_kinerja', data.indikator_kinerja.filter(item => item.id !== id));
    };

    const handleRincianChange = (index, field, value) => {
        const newRincian = [...data.rincian_anggaran];

        // When user selects a "kebutuhan" (from CustomSelect) the value is kode_anggaran.
        // Sync both `kode_anggaran` and `kebutuhan` (label) so UI and data stay consistent.
        if (field === 'kebutuhan') {
            const kode = value;
            const akun = akunAnggarans.find(a => String(a.kode_anggaran) === String(kode));
            newRincian[index].kode_anggaran = kode;
            newRincian[index].kebutuhan = akun ? `${akun.kode_anggaran} - ${akun.nama_anggaran}` : kode;
        } else if (field === 'kode_anggaran') {
            // If user types/changes kode_anggaran manually, try to resolve the label
            const kode = value;
            const akun = akunAnggarans.find(a => String(a.kode_anggaran) === String(kode));
            newRincian[index].kode_anggaran = kode;
            newRincian[index].kebutuhan = akun ? `${akun.kode_anggaran} - ${akun.nama_anggaran}` : '';
        } else {
            newRincian[index][field] = value;
        }

        // Recompute jumlah when volume or harga/biaya satuan change
        if (field === 'vol' || field === 'biaya_satuan' || field === 'kode_anggaran' || field === 'kebutuhan') {
            const vol = Number(newRincian[index].vol) || 0;
            const biayaSatuan = Number(newRincian[index].biaya_satuan) || 0;
            newRincian[index].jumlah = vol * biayaSatuan;
        }

        setData('rincian_anggaran', newRincian);
    };

    const addRincianRow = () => {
        const createEmptyRAB = () => ({
            id: Date.now(),
            kode_anggaran: akunAnggarans[0]?.kode_anggaran || '',
            kebutuhan: '',
            keterangan: '',
            vol: 1,
            satuan: 'unit',
            biaya_satuan: 0,
            jumlah: 0,
        });

        setData('rincian_anggaran', [
            ...data.rincian_anggaran,
            createEmptyRAB()
        ]);
    };

    const removeRincianRow = (id) => {
        const filtered = data.rincian_anggaran.filter(item => item.id !== id);
        if (filtered.length === 0) {
            // ensure at least one empty row remains
            const createEmptyRAB = () => ({
                id: Date.now(),
                kode_anggaran: akunAnggarans[0]?.kode_anggaran || '',
                kebutuhan: '',
                keterangan: '',
                vol: 1,
                satuan: 'unit',
                biaya_satuan: 0,
                jumlah: 0,
            });
            setData('rincian_anggaran', [createEmptyRAB()]);
        } else {
            setData('rincian_anggaran', filtered);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        setServerError(null);

        post(route('rkat.store'), {
            onSuccess: () => {
                // clear form and UI state after successful save
                reset();
                setManualDeskripsi(false);
                setServerError(null);
                // optional: scroll to top to show success message or cleared form
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            onError: (validationErrors) => {
                // validationErrors is an object of field errors; show a general message
                setServerError('Validasi gagal — periksa isian yang berwarna merah.');
            },
            onFinish: (page) => {
                // if server returned exception payload (debug), it may be in page.props; try to surface it
                const debugPayload = page?.props?.errors || page?.props?.flash?.error || null;
                if (!Object.keys(errors).length && debugPayload) {
                    setServerError(debugPayload);
                }
            }
        });
    };

    // --- DATA OPTION PREPARATION FOR CUSTOM SELECT ---
    const ikuSubsBySelectedIKU = ikuSubs.filter(sub => sub.id_iku == selectedIKUId);
    const currentUnit = units.find(u => u.id_unit == data.id_unit)?.nama_unit || 'N/A';

    // Helper: Map data arrays to {value, label} objects
    const optionsTahun = tahunAnggarans.map(ta => ({ value: ta.tahun_anggaran, label: ta.tahun_anggaran }));
    const optionsIku = ikus.map(iku => ({ value: iku.id_iku, label: iku.nama_iku }));
    const optionsIkuSub = ikuSubsBySelectedIKU.map(sub => ({ value: sub.id_ikusub, label: sub.nama_ikusub }));
    // Build IKK options scoped to selected IKUSUB or IKU. Fallback to all IKKs from `ikuSubs`.
    const optionsIkk = (() => {
        // Only expose IKKs when an IKUSUB is selected (sequential flow)
        if (selectedIKUSubId) {
            const sub = ikuSubs.find(s => String(s.id_ikusub) === String(selectedIKUSubId));
            return (sub?.ikks || []).map(i => ({ value: i.id_ikk, label: i.nama_ikk }));
        }

        return [];
    })();
    
    const optionsAkunAnggaran = akunAnggarans.map(akun => ({ value: akun.kode_anggaran, label: `${akun.kode_anggaran} - ${akun.nama_anggaran}` })); 
    const optionsPencairan = [
        { value: 'Tunai', label: 'Tunai' },
        { value: 'Bank', label: 'Transfer Bank' }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Input RKAT</h2>}
        >
            <Head title="Input RKAT" />

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="bg-white dark:bg-gray-800 p-8 shadow-xl sm:rounded-lg">
                        {serverError && (
                            <div className="mb-4 p-3 rounded border border-red-200 bg-red-50 text-red-700">
                                {typeof serverError === 'string' ? serverError : JSON.stringify(serverError)}
                            </div>
                        )}
                        {/* ... (Bagian Header Form) ... */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2 border-b pb-6 dark:border-gray-700">
                            <div>
                                <InputLabel htmlFor="kode_kegiatan" value="Kode Kegiatan" />
                                <TextInput
                                    id="kode_kegiatan"
                                    name="kode_kegiatan"
                                    value={data.kode_kegiatan}
                                    onChange={(e) => setData('kode_kegiatan', e.target.value)}
                                    className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 h-11" // <--- Disesuaikan: h-11
                                    isFocused
                                    placeholder="Diisi otomatis atau manual (cth: I.A.1.1)"
                                />
                                <InputError message={errors.kode_kegiatan} className="mt-2" />

                                <div className="mt-4">
                                    <InputLabel value="Unit Kerja / Sub Unit" />
                                    {auth.user.id_unit ? (
                                        <TextInput
                                            value={currentUnit}
                                            className="mt-1 block w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed h-11" // <--- Disesuaikan: h-11
                                            readOnly
                                        />
                                    ) : (
                                        <TextInput
                                            id="id_unit"
                                            name="id_unit"
                                            value={data.id_unit}
                                            onChange={(e) => setData('id_unit', e.target.value)}
                                            className="mt-1 block w-full h-11" // <--- Disesuaikan: h-11
                                        />
                                    )}
                                    <InputError message={errors.id_unit} className="mt-2" />
                                </div>

                                {/* IKK moved into Keterkaitan Program/IKU section (selectable) */}
                            </div>

                            <div>
                                <InputLabel htmlFor="tahun_anggaran" value="Tahun Anggaran" />
                                <CustomSelect
                                    value={data.tahun_anggaran}
                                    onChange={(e) => setData('tahun_anggaran', e.target.value)}
                                    options={optionsTahun}
                                    placeholder="Pilih Tahun"
                                    className="mt-1"
                                />
                                <InputError message={errors.tahun_anggaran} className="mt-2" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                                    <div>
                                        <InputLabel htmlFor="jadwal_pelaksanaan_mulai" value="Jadwal Mulai" />
                                        <DateInput
                                            id="jadwal_pelaksanaan_mulai"
                                            name="jadwal_pelaksanaan_mulai"
                                            value={data.jadwal_pelaksanaan_mulai}
                                            onChange={(value) => setData('jadwal_pelaksanaan_mulai', value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.jadwal_pelaksanaan_mulai} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="jadwal_pelaksanaan_akhir" value="Jadwal Akhir" />
                                        <DateInput
                                            id="jadwal_pelaksanaan_akhir"
                                            name="jadwal_pelaksanaan_akhir"
                                            value={data.jadwal_pelaksanaan_akhir}
                                            onChange={(value) => setData('jadwal_pelaksanaan_akhir', value)}
                                            className="mt-1 block w-full"
                                        />
                                        <InputError message={errors.jadwal_pelaksanaan_akhir} className="mt-2" />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <InputLabel htmlFor="lokasi_pelaksanaan" value="Lokasi Pelaksanaan" />
                                    <TextInput
                                        id="lokasi_pelaksanaan"
                                        name="lokasi_pelaksanaan"
                                        value={data.lokasi_pelaksanaan || ''}
                                        onChange={(e) => setData('lokasi_pelaksanaan', e.target.value)}
                                        className="mt-1 block w-full h-11" // <--- Disesuaikan: h-11
                                        placeholder="Contoh: Lab 5 & 6"
                                    />
                                    <InputError message={errors.lokasi_pelaksanaan} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4">
                            <InputLabel htmlFor="judul_pengajuan" value="Judul Kegiatan" />
                            <TextArea
                                id="judul_pengajuan"
                                name="judul_pengajuan"
                                value={data.judul_pengajuan}
                                onChange={(e) => setData('judul_pengajuan', e.target.value)}
                                className="mt-1 mb-3 block w-full"
                            />
                            <InputError message={errors.judul_pengajuan} className="mt-2" />
                        </div>

                        <div className="mb-4 w-1/3">
                            <InputLabel htmlFor="jenis_kegiatan" value="Jenis Kegiatan" />
                            <CustomSelect
                                value={data.jenis_kegiatan}
                                onChange={(e) => setData('jenis_kegiatan', e.target.value)}
                                options={[
                                    { value: 'Rutin', label: 'Rutin' },
                                    { value: 'Khusus', label: 'Khusus' },
                                    { value: 'Program', label: 'Program' },
                                ]}
                                placeholder="Pilih Jenis Kegiatan"
                                className="mt-1"
                            />
                            <InputError message={errors.jenis_kegiatan} className="mt-2" />
                        </div>

                        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Keterkaitan Program/IKU</h3>
                        <div className="grid grid-cols-1 gap-6 mb-8 border-b pb-6 dark:border-gray-700">
                            <div>
                                <InputLabel htmlFor="iku" value="IKU (Indikator Kinerja Utama)" />
                                <CustomSelect
                                    value={selectedIKUId}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSelectedIKUId(val);
                                        setData('iku_id', val);
                                        // reset downstream selections when IKU changes
                                        setSelectedIKUSubId('');
                                        setSelectedIKKId('');
                                        setData('ikk_id', '');
                                    }}
                                    options={optionsIku}
                                    placeholder="Pilih IKU"
                                    className="mt-1"
                                />
                                <InputError message={errors.iku_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="ikusub" value="Sub IKU" />
                                <CustomSelect
                                    value={selectedIKUSubId}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSelectedIKUSubId(val);
                                        setData('ikusub_id', val);
                                        // reset IKK when IKUSUB changes
                                        setSelectedIKKId('');
                                        setData('ikk_id', '');
                                        // ensure parent IKU is set from selected IKUSUB
                                        const found = ikuSubs.find(s => String(s.id_ikusub) === String(val));
                                        if (found) {
                                            setSelectedIKUId(found.id_iku);
                                            setData('iku_id', found.id_iku);
                                        }
                                    }}
                                    options={optionsIkuSub}
                                    disabled={!selectedIKUId}
                                    placeholder="Pilih Sub IKU"
                                    className="mt-1"
                                />
                                <InputError message={errors.ikusub_id} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="ikk" value="IKK (Indikator Kinerja Kegiatan)" />
                                <CustomSelect
                                    value={selectedIKKId}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSelectedIKKId(val);
                                        // sync selected IKK into form data so it will be stored
                                        setData('ikk_id', val);
                                        // set parent IKUSUB and IKU based on selected IKK
                                        const foundSub = ikuSubs.find(sub => (sub.ikks || []).some(i => String(i.id_ikk) === String(val)));
                                        if (foundSub) {
                                            setSelectedIKUSubId(foundSub.id_ikusub);
                                            setData('ikusub_id', foundSub.id_ikusub);
                                            setSelectedIKUId(foundSub.id_iku);
                                            setData('iku_id', foundSub.id_iku);
                                        }
                                    }}
                                    options={optionsIkk}
                                    disabled={!selectedIKUSubId}
                                    placeholder="Pilih IKK"
                                    className="mt-1"
                                />
                                <InputError message={errors.ikk_id} className="mt-2" />
                            </div>

                            {/* Program selection removed: storing IKU/IKUSUB/IKK and judul_kegiatan per detail instead */}
                        </div>

                        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Deskripsi Kegiatan</h3>
                        <div className="space-y-6 mb-8 border-b pb-6 dark:border-gray-700">
                            {/* ... (Bagian TextArea Deskripsi tetap sama) ... */}
                            <div>
                                <InputLabel htmlFor="deskripsi_kegiatan" value="Deskripsi Kegiatan" />
                                <TextArea
                                    id="deskripsi_kegiatan"
                                    name="deskripsi_kegiatan"
                                    value={data.deskripsi_kegiatan}
                                    onChange={(e) => {
                                        setData('deskripsi_kegiatan', e.target.value);
                                        // mark as manually edited when user types different from title
                                        if (e.target.value !== data.judul_pengajuan) setManualDeskripsi(true);
                                    }}
                                    className="mt-1 block w-full resize-y"
                                    rows="3"
                                />
                                <InputError message={errors.deskripsi_kegiatan} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="latar_belakang" value="Latar Belakang" />
                                <TextArea id="latar_belakang" name="latar_belakang" value={data.latar_belakang} onChange={(e) => setData('latar_belakang', e.target.value)} className="mt-1 block w-full resize-y" rows="3" />
                                <InputError message={errors.latar_belakang} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="rasional" value="Rasionalisasi" />
                                <TextArea id="rasional" name="rasional" value={data.rasional} onChange={(e) => setData('rasional', e.target.value)} className="mt-1 block w-full resize-y" rows="3" />
                                <InputError message={errors.rasional} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="tujuan" value="Tujuan" />
                                <TextArea id="tujuan" name="tujuan" value={data.tujuan} onChange={(e) => setData('tujuan', e.target.value)} className="mt-1 block w-full resize-y" rows="3" />
                                <InputError message={errors.tujuan} className="mt-2" />
                            </div>
                            <div>
                                <InputLabel htmlFor="mekanisme" value="Mekanisme & Rancangan" />
                                <TextArea id="mekanisme" name="mekanisme" value={data.mekanisme} onChange={(e) => setData('mekanisme', e.target.value)} className="mt-1 block w-full resize-y" rows="3" />
                                <InputError message={errors.mekanisme} className="mt-2" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <InputLabel htmlFor="target" value="Target Kegiatan" />
                                    <TextInput id="target" name="target" value={data.target} onChange={(e) => setData('target', e.target.value)} className="mt-1 block w-full h-11" placeholder="Cth: 100 Peserta" /> {/* <--- Disesuaikan: h-11 */}
                                    <InputError message={errors.target} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="pjawab" value="Penanggung Jawab" />
                                    <TextInput id="pjawab" name="pjawab" value={data.pjawab} onChange={(e) => setData('pjawab', e.target.value)} className="mt-1 block w-full h-11" placeholder="Nama PJ" /> {/* <--- Disesuaikan: h-11 */}
                                    <InputError message={errors.pjawab} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="keberlanjutan" value="Keberlanjutan" />
                                    <CustomSelect
                                        value={data.keberlanjutan}
                                        onChange={(e) => setData('keberlanjutan', e.target.value)}
                                        options={[
                                            { value: 'Tidak', label: 'Tidak' },
                                            { value: 'Sementara', label: 'Sementara' },
                                            { value: 'Berlanjut', label: 'Berlanjut' },
                                        ]}
                                        placeholder="Pilih Keberlanjutan"
                                        className="mt-1"
                                    />
                                    <InputError message={errors.keberlanjutan} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Indikator Kinerja</h3>
                        
                        {/* PENGGUNAAN KOMPONEN TableContainer */}
                        <TableContainer>
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"> {/* Hapus border dari table */}
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    {/* Header Tabel Indikator */}
                                    <tr>
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-10">No.</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-52">Indikator</th>
                                        <th colSpan="1" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-x">Kondisi Akhir 2024 (Capaian)</th>
                                        <th colSpan="2" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-x">Tahun 2025</th>
                                        <th colSpan="2" className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Akhir Tahun 2029</th>
                                        <th className="w-10"></th>
                                    </tr>
                                    <tr className="bg-gray-50 dark:bg-gray-700">
                                        <th></th>
                                        <th></th>
                                        <th className="px-4 py-1 text-center text-xs font-medium text-gray-500 dark:text-gray-300">Capaian</th>
                                        <th className="px-4 py-1 text-center text-xs font-medium text-gray-500 dark:text-gray-300">Target</th>
                                        <th className="px-4 py-1 text-center text-xs font-medium text-gray-500 dark:text-gray-300">Capaian</th>
                                        <th className="px-4 py-1 text-center text-xs font-medium text-gray-500 dark:text-gray-300">Target</th>
                                        <th className="px-4 py-1 text-center text-xs font-medium text-gray-500 dark:text-gray-300">Capaian</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {data.indikator_kinerja.map((item, index) => (
                                        <tr key={item.id}>
                                            <td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400 text-center align-top">{index + 1}</td>
                                            <td className="p-1 align-top"><TextArea value={item.indikator} onChange={(e) => handleIndikatorChange(index, 'indikator', e.target.value)} className="w-full text-sm resize-none" rows="2" placeholder="Nama Indikator Kinerja" /></td>
                                            <td className="p-1 align-top"><TextArea value={item.kondisi_akhir_2024_capaian} onChange={(e) => handleIndikatorChange(index, 'kondisi_akhir_2024_capaian', e.target.value)} className="w-full text-sm resize-none" rows="2" /></td>
                                            <td className="p-1 align-top"><TextArea value={item.tahun_2025_target} onChange={(e) => handleIndikatorChange(index, 'tahun_2025_target', e.target.value)} className="w-full text-sm resize-none" rows="2" /></td>
                                            <td className="p-1 align-top"><TextArea value={item.tahun_2025_capaian} onChange={(e) => handleIndikatorChange(index, 'tahun_2025_capaian', e.target.value)} className="w-full text-sm resize-none" rows="2" /></td>
                                            <td className="p-1 align-top"><TextArea value={item.akhir_tahun_2029_target} onChange={(e) => handleIndikatorChange(index, 'akhir_tahun_2029_target', e.target.value)} className="w-full text-sm resize-none" rows="2" /></td>
                                            <td className="p-1 align-top"><TextArea value={item.akhir_tahun_2029_capaian} onChange={(e) => handleIndikatorChange(index, 'akhir_tahun_2029_capaian', e.target.value)} className="w-full text-sm resize-none" rows="2" /></td>
                                            <td className="px-2 py-2 text-sm text-center align-top">
                                                <DangerButton type="button" onClick={() => removeIndikatorRow(item.id)} className="p-1 h-8 w-8 flex items-center justify-center">
                                                    <Trash2 className="w-4 h-4" />
                                                </DangerButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableContainer>
                        {errors.indikator_kinerja && <InputError message="Indikator Kinerja harus diisi minimal satu baris." className="mt-2" />}
                        
                        <div className="flex justify-start mb-8">
                            <PrimaryButton type="button" onClick={addIndikatorRow}>+ Tambah Indikator Kinerja</PrimaryButton>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Rincian Anggaran (RAB)</h3>
                            <div className="space-x-2">
                                <a href={route('rkat-rab-items.index')} className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md">Daftar RAB Item</a>
                                {/* Tombol 'Tambah RAB Item' dihapus karena halaman create telah dihapus */}
                            </div>
                        </div>
                        
                        {/* PENGGUNAAN KOMPONEN TableContainer */}
                        <TableContainer>
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"> {/* Hapus border dari table */}
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider w-10">No.</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider min-w-40">Kode Akun</th>
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
                                            <td className="px-2 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                                                {index + 1}
                                            </td>

                                            <td className="p-1">
                                                {/* Kolom Kode Anggaran - TextInput */}
                                                <TextInput
                                                    value={item.kode_anggaran}
                                                    onChange={(e) => handleRincianChange(index, 'kode_anggaran', e.target.value)}
                                                    className="w-full text-sm h-11" // <--- Disesuaikan: h-11
                                                    placeholder="Kode Anggaran"
                                                />
                                            </td>

                                            <td className="p-1">
                                                {/* Kolom Nama Kebutuhan - CustomSelect (sudah h-11) */}
                                                <CustomSelect
                                                    value={item.kode_anggaran}
                                                    onChange={(e) => handleRincianChange(index, 'kode_anggaran', e.target.value)}
                                                    options={optionsAkunAnggaran}
                                                    placeholder="Pilih Item/Akun"
                                                    className="w-full text-sm min-w-[150px]"
                                                />
                                            </td>

                                            <td className="p-1">
                                                <TextInput
                                                    value={item.keterangan}
                                                    onChange={(e) => handleRincianChange(index, 'keterangan', e.target.value)}
                                                    className="w-full text-sm h-11" // <--- Disesuaikan: h-11
                                                    placeholder="Deskripsi"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <TextInput
                                                    value={item.vol}
                                                    onChange={(e) => handleRincianChange(index, 'vol', parseInt(e.target.value) || 0)}
                                                    className="w-full text-sm text-center h-11" // <--- Disesuaikan: h-11
                                                    type="number"
                                                    min="1"
                                                />
                                            </td>
                                            <td className="p-1">
                                                <TextInput
                                                    value={item.satuan}
                                                    onChange={(e) => handleRincianChange(index, 'satuan', e.target.value)}
                                                    className="w-full text-sm h-11" // <--- Disesuaikan: h-11
                                                />
                                            </td>
                                            <td className="p-1">
                                                <RupiahInput
                                                    value={item.biaya_satuan}
                                                    onChange={(e) => handleRincianChange(index, 'biaya_satuan', e.target.value)}
                                                    className="w-full text-sm text-right h-11" // <--- Disesuaikan: h-11
                                                />
                                            </td>
                                            <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 font-medium text-right bg-gray-50 dark:bg-gray-700">
                                                {formatRupiah(item.jumlah)}
                                            </td>
                                            <td className="px-2 py-2 text-sm text-center">
                                                <DangerButton type="button" onClick={() => removeRincianRow(item.id)} className="p-1 h-8 w-8 flex items-center justify-center">
                                                    <Trash2 className="w-4 h-4" />
                                                </DangerButton>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </TableContainer>
                        {errors.rincian_anggaran && <InputError message="Rincian Anggaran harus diisi minimal satu baris." className="mt-2" />}

                        <div className="flex justify-between items-center mb-8">
                            <PrimaryButton type="button" onClick={addRincianRow}>+ Tambah Baris RAB</PrimaryButton>
                            <div className="text-xl font-bold text-gray-800 dark:text-gray-200">
                                Total Anggaran: <span className="text-teal-600 dark:text-teal-400">{formatRupiah(data.anggaran)}</span>
                            </div>
                        </div>

                        {/* ... (Bagian Informasi Pencairan dan Footer) ... */}
                        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Informasi Pencairan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 border-b pb-6 dark:border-gray-700">
                            <div>
                                <InputLabel htmlFor="jenis_pencairan" value="Jenis Pencairan" />
                                <CustomSelect
                                    value={data.jenis_pencairan}
                                    onChange={(e) => setData('jenis_pencairan', e.target.value)}
                                    options={optionsPencairan}
                                    className="mt-1"
                                />
                                <InputError message={errors.jenis_pencairan} className="mt-2" />
                            </div>
                            <div className={data.jenis_pencairan !== 'Bank' ? 'opacity-50' : ''}>
                                <InputLabel htmlFor="nama_bank" value="Nama Bank" />
                                <TextInput id="nama_bank" name="nama_bank" value={data.nama_bank} onChange={(e) => setData('nama_bank', e.target.value)} className="mt-1 block w-full h-11" disabled={data.jenis_pencairan !== 'Bank'} /> {/* <--- Disesuaikan: h-11 */}
                                <InputError message={errors.nama_bank} className="mt-2" />
                            </div>
                            <div className={data.jenis_pencairan !== 'Bank' ? 'opacity-50' : ''}>
                                <InputLabel htmlFor="nomor_rekening" value="Nomor Rekening" />
                                <TextInput id="nomor_rekening" name="nomor_rekening" value={data.nomor_rekening} onChange={(e) => setData('nomor_rekening', e.target.value)} className="mt-1 block w-full h-11" disabled={data.jenis_pencairan !== 'Bank'} /> {/* <--- Disesuaikan: h-11 */}
                                <InputError message={errors.nomor_rekening} className="mt-2" />
                            </div>
                            <div className={data.jenis_pencairan !== 'Bank' ? 'opacity-50' : ''}>
                                <InputLabel htmlFor="atas_nama" value="Atas Nama" />
                                <TextInput id="atas_nama" name="atas_nama" value={data.atas_nama} onChange={(e) => setData('atas_nama', e.target.value)} className="mt-1 block w-full h-11" disabled={data.jenis_pencairan !== 'Bank'} /> {/* <--- Disesuaikan: h-11 */}
                                <InputError message={errors.atas_nama} className="mt-2" />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4 dark:border-gray-700">
                            <PrimaryButton type="submit" disabled={processing} className="bg-green-500 hover:bg-green-600">Simpan Draft</PrimaryButton>
                            <PrimaryButton type="submit" disabled={processing} className="bg-teal-600 hover:bg-teal-700">Kirim</PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}