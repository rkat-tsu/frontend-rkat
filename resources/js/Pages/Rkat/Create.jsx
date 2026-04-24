import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
//import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import TextArea from '@/Components/TextArea';
import RupiahInput from '@/Components/RupiahInput';
import DateInput from '@/Components/DateInput';
import { Plus, Trash2, Save, ArrowLeft, Calculator } from 'lucide-react';
//import { cn } from "@/lib/utils";
import CustomSelect from '@/Components/CustomSelect';
import {
    Combobox,
    ComboboxChip,
    ComboboxChips,
    ComboboxChipsInput,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxItem,
    ComboboxList,
    ComboboxValue,
    useComboboxAnchor,
} from "@/components/ui/combobox"
import { toast } from 'sonner';

const formatRupiah = (angka) => {
    const number = Number(angka) || 0;
    return `Rp. ${number.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;
};
export default function Create({ auth, tahunAnggarans, units, akunAnggarans, ikus }) {

    // Initial States
    const initialIndikator = {
        id: Date.now(),
        indikator: '',
        kondisi_akhir_2024_capaian: '',
        tahun_2025_target: '',
        tahun_2025_capaian: '',
        akhir_tahun_2029_target: '',
        akhir_tahun_2029_capaian: ''
    };

    const initialRAB = {
        id: Date.now() + 1,
        kode_anggaran: '',
        kebutuhan: '',
        vol: 1,
        satuan: 'Paket',
        biaya_satuan: 0,
        jumlah: 0
    };

    // Setup Form
    const { data, setData, post, processing, errors, isDirty } = useForm({
        // 1. Header
        tahun_anggaran: '',
        id_unit: auth.user.id_unit || '',
        kode_akun: '',
        judul_pengajuan: '',

        // 2. Kinerja
        iku_id: '',
        ikk_id: '',

        // 3. Detail
        deskripsi_kegiatan: '',
        latar_belakang: '',
        rasional: '',
        tujuan: '',
        mekanisme: '',

        // 4. Pelaksanaan
        jadwal_pelaksanaan_mulai: '',
        jadwal_pelaksanaan_akhir: '',
        lokasi_pelaksanaan: '',

        // 5. Output, PJ & Jenis
        target: '',
        pjawab: '',
        jenis_kegiatan: 'Rutin',
        dokumen_pendukung: [],

        // 6. Keuangan
        anggaran: 0,
        jenis_pencairan: 'Tunai',
        nama_bank: '',
        nomor_rekening: '',
        atas_nama: '',

        // 7. Array
        indikator_kinerja: [initialIndikator],
        rincian_anggaran: [initialRAB]
    });

    const [filteredIkks, setFilteredIkks] = useState([]);
    const [isManualDeskripsi, setIsManualDeskripsi] = useState(false);

    // --- LOGIC 1: AUTO GENERATE KODE AKUN ---
    useEffect(() => {
        if (data.id_unit && data.tahun_anggaran) {
            const selectedUnit = units.find(u => String(u.id_unit) === String(data.id_unit));
            const kodeUnit = selectedUnit ? selectedUnit.kode_unit : 'UNIT';
            const autoKode = `${kodeUnit}.${data.tahun_anggaran}.001`;
            setData(prev => ({ ...prev, kode_akun: autoKode }));
        }
    }, [data.id_unit, data.tahun_anggaran, units]);

    // --- LOGIC 2: AUTO FILL DESKRIPSI ---
    useEffect(() => {
        if (!isManualDeskripsi) {
            setData(prev => ({ ...prev, deskripsi_kegiatan: data.judul_pengajuan }));
        }
    }, [data.judul_pengajuan]);

    // --- LOGIC 3: FILTER IKK ---
    useEffect(() => {
        if (data.iku_id) {
            const selectedIkuObj = ikus.find(item => String(item.id_iku) === String(data.iku_id));
            if (selectedIkuObj && selectedIkuObj.ikks) {
                setFilteredIkks(selectedIkuObj.ikks.map(ikk => ({ value: ikk.id_ikk, label: ikk.nama_ikk })));
            } else {
                setFilteredIkks([]);
            }
        } else {
            setFilteredIkks([]);
        }
    }, [data.iku_id, ikus]);

    // --- HANDLERS ---
    const addIndikatorRow = () => setData('indikator_kinerja', [...data.indikator_kinerja, { ...initialIndikator, id: Date.now() }]);

    const removeIndikatorRow = (id) => {
        const list = data.indikator_kinerja.filter(item => item.id !== id);
        setData('indikator_kinerja', list.length ? list : [{ ...initialIndikator, id: Date.now() }]);
    };

    const handleIndikatorChange = (index, field, value) => {
        const list = [...data.indikator_kinerja];
        list[index][field] = value;
        setData('indikator_kinerja', list);
    };

    const addRabItem = () => setData('rincian_anggaran', [...data.rincian_anggaran, { ...initialRAB, id: Date.now() }]);

    const removeRabItem = (id) => {
        const list = data.rincian_anggaran.filter(item => item.id !== id);
        if (list.length === 0) {
            setData('rincian_anggaran', [{ ...initialRAB, id: Date.now() }]);
        } else {
            const totalBaru = list.reduce((acc, curr) => acc + (parseFloat(curr.jumlah) || 0), 0);
            setData(prev => ({ ...prev, rincian_anggaran: list, anggaran: totalBaru }));
        }
    };

    const handleRincianChange = (index, field, value) => {
        const list = [...data.rincian_anggaran];
        const item = { ...list[index] };

        const getReferenceAccount = (kode) => {
            return akunAnggarans.find(a => String(a.kode_anggaran) === String(kode));
        };

        if (field === 'kode_anggaran') {
            const kode = value;
            const akun = getReferenceAccount(kode);
            item.kode_anggaran = kode;

            if (akun) {
                item.kebutuhan = akun.nama_anggaran;
                item.satuan = akun.satuan || item.satuan;
                item.biaya_satuan = parseFloat(akun.nominal) || 0;
            }
        }
        else if (field === 'biaya_satuan') {
            const akun = getReferenceAccount(item.kode_anggaran);
            let inputHarga = parseFloat(value);
            if (isNaN(inputHarga)) inputHarga = 0;

            const maxHarga = akun ? parseFloat(akun.nominal) : Infinity;

            if (inputHarga > maxHarga) {
                inputHarga = maxHarga;
            }
            item.biaya_satuan = inputHarga;
        }
        else {
            item[field] = value;
        }

        const vol = parseFloat(item.vol) || 0;
        const harga = parseFloat(item.biaya_satuan) || 0;
        item.jumlah = vol * harga;

        list[index] = item;
        const totalAnggaranBaru = list.reduce((acc, curr) => acc + (parseFloat(curr.jumlah) || 0), 0);

        setData(prev => ({ ...prev, rincian_anggaran: list, anggaran: totalAnggaranBaru }));
    };

    const handleBack = () => {
        if (isDirty) {
            toast.warning("Konfirmasi Batal", {
                description: "Anda memiliki draf pengajuan RKAT yang belum disimpan. Yakin ingin kembali? Semua input akan hilang.",
                action: {
                    label: "Ya, Kembali",
                    onClick: () => router.get(route('rkat.index'))
                },
                cancel: {
                    label: "Batal"
                }
            });
        } else {
            router.get(route('rkat.index'));
        }
    };

    const submit = (e) => {
        e.preventDefault();

        // Validasi: pastikan semua field dasar terisi
        if (
            !data.tahun_anggaran || !data.id_unit || !data.judul_pengajuan ||
            !data.deskripsi_kegiatan || !data.latar_belakang || !data.tujuan ||
            !data.rasional || !data.mekanisme || !data.jadwal_pelaksanaan_mulai ||
            !data.jadwal_pelaksanaan_akhir || !data.lokasi_pelaksanaan ||
            !data.pjawab || !data.target || !data.jenis_kegiatan || !data.iku_id || !data.ikk_id || data.dokumen_pendukung.length === 0
        ) {
            toast.error("Gagal Menyimpan", { description: "Semua form input wajib diisi." });
            return;
        }

        if (data.rincian_anggaran.length === 0 || data.anggaran === 0) {
            toast.error("Gagal Menyimpan", { description: "Rincian anggaran belum diisi atau total anggaran masih 0." });
            return;
        }

        // Peringatan sebelum menyimpan
        toast("Konfirmasi Simpan", {
            description: `Yakin ingin menyimpan pengajuan RKAT ini? Total anggaran dari rincian anggaran yang dipilih adalah ${formatRupiah(data.anggaran)}.`,
            action: {
                label: "Ya, Simpan",
                onClick: () => {
                    const toastId = toast.loading("Sedang menyimpan data...");
                    post(route('rkat.store'), {
                        onSuccess: () => {
                            toast.success("Berhasil disimpan!", { id: toastId, description: "Pengajuan RKAT telah berhasil disimpan." });
                        },
                        onError: (err) => {
                            console.error("Validation Error:", err);
                            toast.error("Gagal Menyimpan", {
                                id: toastId,
                                description: "Terdapat kesalahan input. Periksa form yang berwarna merah."
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

    // Options
    const tahunOptions = tahunAnggarans.map(t => ({ value: t.tahun_anggaran, label: t.tahun_anggaran }));
    const unitOptions = units.map(u => ({ value: u.id_unit, label: `${u.kode_unit} - ${u.nama_unit}` }));
    const ikuOptions = ikus.map(i => ({ value: i.id_iku, label: i.nama_iku }));
    const akunOptions = akunAnggarans.map(a => ({ value: a.kode_anggaran, label: `${a.kode_anggaran} - ${a.nama_anggaran}` }));

    const dokumenPendukungList = ['Pengajuan Rutin', 'Proposal', 'TOR', 'Usulan'];
    const anchor = useComboboxAnchor();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pengajuan RKAT Baru</h2>}
        >
            <Head title="Input RKAT" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">

                        {/* --- 1. DATA DASAR --- */}
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-teal-500">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">1. Data Dasar Pengajuan</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel value="Tahun Anggaran" required />
                                    <CustomSelect value={data.tahun_anggaran} onChange={(e) => setData('tahun_anggaran', e.target.value)} options={tahunOptions} placeholder="Pilih Tahun" className="mt-1" />
                                    <InputError message={errors.tahun_anggaran} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel value="Unit Kerja" required />
                                    <CustomSelect
                                        value={data.id_unit}
                                        onChange={(e) => setData('id_unit', e.target.value)}
                                        options={auth.user.peran === 'Admin' ? unitOptions : unitOptions.filter(u => String(u.value) === String(auth.user.id_unit))}
                                        placeholder="Pilih Unit"
                                        disabled={auth.user.peran !== 'Admin'}
                                        className="mt-1"
                                    />
                                    <InputError message={errors.id_unit} className="mt-2" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel value="Kode Akun Kegiatan (Auto)" required />
                                    <TextInput value={data.kode_akun} readOnly className="mt-1 block w-full bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200" placeholder="Otomatis..." />
                                    <InputError message={errors.kode_akun} className="mt-2" />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel value="Judul Kegiatan" required />
                                    <TextArea value={data.judul_pengajuan} onChange={(e) => setData('judul_pengajuan', e.target.value)} className="mt-1 block w-full" rows={2} placeholder="Tuliskan judul kegiatan..." />
                                    <InputError message={errors.judul_pengajuan} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* --- 2. DETAIL PELAKSANAAN --- */}
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-indigo-500">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">2. Detail Pelaksanaan</h3>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <InputLabel value="Deskripsi Kegiatan" required />
                                        <TextArea
                                            value={data.deskripsi_kegiatan}
                                            onChange={(e) => { setData('deskripsi_kegiatan', e.target.value); setIsManualDeskripsi(true); }}
                                            rows={3}
                                            className="mt-1 w-full"
                                            placeholder="Deskripsi kegiatan..."
                                        />
                                        <InputError message={errors.deskripsi_kegiatan} className="mt-2" />
                                    </div>
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
                                        <InputLabel value="Tujuan" required />
                                        <TextArea value={data.tujuan}
                                            onChange={(e) => setData('tujuan', e.target.value)}
                                            rows={4}
                                            className="mt-1 w-full"
                                            placeholder="Jelaskan tujuan kegiatan..."
                                        />
                                        <InputError message={errors.tujuan} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Rasional" required />
                                        <TextArea
                                            value={data.rasional}
                                            onChange={(e) => setData('rasional', e.target.value)}
                                            rows={4}
                                            className="mt-1 w-full"
                                            placeholder="Jelaskan rasional kegiatan..."
                                        />
                                        <InputError message={errors.rasional} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Mekanisme" required />
                                        <TextArea
                                            value={data.mekanisme}
                                            onChange={(e) => setData('mekanisme', e.target.value)}
                                            rows={4}
                                            className="mt-1 w-full"
                                            placeholder="Jelaskan mekanisme pelaksanaan kegiatan..."
                                        />
                                        <InputError message={errors.mekanisme} className="mt-2" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-4">
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
                                        <InputLabel value="Lokasi" required />
                                        <TextInput
                                            value={data.lokasi_pelaksanaan}
                                            onChange={(e) => setData('lokasi_pelaksanaan', e.target.value)}
                                            className="mt-1 w-full h-11"
                                            placeholder="Masukkan Lokasi Pelaksanaan"
                                        />
                                        <InputError message={errors.lokasi_pelaksanaan} className="mt-2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <InputLabel value="PIC" required />
                                        <TextInput
                                            value={data.pjawab}
                                            onChange={(e) => setData('pjawab', e.target.value)}
                                            className="mt-1 w-full h-11"
                                            placeholder="Masukkan Penanggung Jawab"
                                        />
                                        <InputError message={errors.pjawab} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value="Target Peserta" required />
                                        <TextInput
                                            value={data.target}
                                            onChange={(e) => setData('target', e.target.value)}
                                            className="mt-1 w-full h-11"
                                            placeholder="Masukkan Target Peserta"
                                        />
                                        <InputError message={errors.target} className="mt-2" />
                                    </div>

                                    {/* Input Jenis Kegiatan */}
                                    <div>
                                        <InputLabel value="Jenis Kegiatan" required />
                                        <CustomSelect
                                            value={data.jenis_kegiatan}
                                            onChange={(e) => setData('jenis_kegiatan', e.target.value)}
                                            options={[
                                                { value: 'Rutin', label: 'Rutin' },
                                                { value: 'Inovasi', label: 'Inovasi' }
                                            ]}
                                            className="mt-1"
                                        />
                                        <InputError message={errors.jenis_kegiatan} className="mt-2" />
                                    </div>
                                    <div className="md:col-span-3">
                                        <InputLabel value="Dokumen Pendukung" required />
                                        <div className="mt-1">
                                            <Combobox
                                                multiple
                                                autoHighlight
                                                items={dokumenPendukungList}
                                                value={data.dokumen_pendukung}
                                                onValueChange={(val) => setData('dokumen_pendukung', val)}
                                            >
                                                <ComboboxChips ref={anchor}>
                                                    <ComboboxValue>
                                                        {(values) => (
                                                            <React.Fragment>
                                                                {values.map((value) => (
                                                                    <ComboboxChip key={value}>{value}</ComboboxChip>
                                                                ))}
                                                                <ComboboxChipsInput placeholder="Pilih Dokumen..." />
                                                            </React.Fragment>
                                                        )}
                                                    </ComboboxValue>
                                                </ComboboxChips>
                                                <ComboboxContent anchor={anchor}>
                                                    <ComboboxEmpty>Tidak ditemukan.</ComboboxEmpty>
                                                    <ComboboxList>
                                                        {dokumenPendukungList.map((item) => (
                                                            <ComboboxItem key={item} value={item}>
                                                                {item}
                                                            </ComboboxItem>
                                                        ))}
                                                    </ComboboxList>
                                                </ComboboxContent>
                                            </Combobox>
                                        </div>
                                        <InputError message={errors.dokumen_pendukung} className="mt-2" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- 3. INDIKATOR KINERJA --- */}
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-blue-500">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">3. Indikator Kinerja</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div><InputLabel value="IKU" required /><CustomSelect value={data.iku_id} onChange={(e) => setData(prev => ({ ...prev, iku_id: e.target.value, ikk_id: '' }))} options={ikuOptions} placeholder="Pilih IKU" className="mt-1" /><InputError message={errors.iku_id} className="mt-2" /></div>
                                <div><InputLabel value="IKK" required /><CustomSelect value={data.ikk_id} onChange={(e) => setData('ikk_id', e.target.value)} options={filteredIkks} placeholder="Pilih IKK" disabled={!data.iku_id} className="mt-1" /><InputError message={errors.ikk_id} className="mt-2" /></div>
                            </div>
                            <div className="overflow-x-auto rounded-lg mb-4">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300">
                                        <tr>
                                            <th className="px-2 py-3 text-xs text-center">No</th>
                                            <th className="px-4 py-3 text-xs text-left min-w-[200px]">Indikator</th>
                                            <th className="px-4 py-3 text-xs text-center min-w-[100px]">Kondisi 2025</th>
                                            <th className="px-4 py-3 text-xs text-center">Target 2026</th>
                                            <th className="px-4 py-3 text-xs text-center">Capaian 2026</th>
                                            <th className="px-4 py-3 text-xs text-center">Target 2029</th>
                                            <th className="px-4 py-3 text-xs text-center">Capaian 2029</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800">
                                        {data.indikator_kinerja.map((item, index) => (
                                            <tr key={item.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                                <td className="px-2 py-3 text-sm text-center align-top pt-4">{index + 1}</td>
                                                <td className="p-2 align-top"><TextArea value={item.indikator} onChange={(e) => handleIndikatorChange(index, 'indikator', e.target.value)} className="w-full text-sm min-h-[80px]" rows="3" placeholder="Indikator..." /></td>
                                                <td className="p-2 align-top"><TextArea value={item.kondisi_akhir_2024_capaian} onChange={(e) => handleIndikatorChange(index, 'kondisi_akhir_2024_capaian', e.target.value)} className="w-full text-sm text-center min-h-[80px]" rows="3" /></td>
                                                <td className="p-2 align-top"><TextArea value={item.tahun_2025_target} onChange={(e) => handleIndikatorChange(index, 'tahun_2025_target', e.target.value)} className="w-full text-sm text-center min-h-[80px]" rows="3" /></td>
                                                <td className="p-2 align-top"><TextArea value={item.tahun_2025_capaian} onChange={(e) => handleIndikatorChange(index, 'tahun_2025_capaian', e.target.value)} className="w-full text-sm text-center min-h-[80px]" rows="3" /></td>
                                                <td className="p-2 align-top"><TextArea value={item.akhir_tahun_2029_target} onChange={(e) => handleIndikatorChange(index, 'akhir_tahun_2029_target', e.target.value)} className="w-full text-sm text-center min-h-[80px]" rows="3" /></td>
                                                <td className="p-2 align-top"><TextArea value={item.akhir_tahun_2029_capaian} onChange={(e) => handleIndikatorChange(index, 'akhir_tahun_2029_capaian', e.target.value)} className="w-full text-sm text-center min-h-[80px]" rows="3" /></td>
                                                <td className="p-2 pt-4 align-top"><button type="button" onClick={() => removeIndikatorRow(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={16} /></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <button type="button" onClick={addIndikatorRow} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"><Plus size={16} className="mr-1" /> Tambah Indikator</button>
                        </div>

                        {/* --- 4. RAB --- */}
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-yellow-500">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">4. Rincian Anggaran Belanja (RAB)</h3>
                            <div className="overflow-x-auto rounded-lg mb-4">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-bold uppercase">
                                        <tr>
                                            <th className="px-2 py-2 w-8 text-center">No</th>
                                            <th className="px-2 py-2 w-[30%] min-w-[250px]">Standar Biaya Operasional</th>
                                            <th className="px-2 py-2 min-w-[150px]">Uraian / Kebutuhan</th>
                                            <th className="px-2 py-2 w-16 text-center">Vol</th>
                                            <th className="px-2 py-2 w-20 text-center">Satuan</th>
                                            <th className="px-2 py-2 w-32 text-right">Harga (@)</th>
                                            <th className="px-2 py-2 w-32 text-right">Subtotal</th>
                                            <th className="px-2 py-2 w-8"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="">
                                        {data.rincian_anggaran.map((item, index) => (
                                            <tr key={item.id} className="bg-white dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 transition-colors">
                                                <td className="px-2 py-1 text-center font-medium text-gray-500 dark:text-gray-400 align-middle">{index + 1}</td>
                                                <td className="px-2 py-1 align-middle">
                                                    <CustomSelect
                                                        value={item.kode_anggaran}
                                                        onChange={(e) => handleRincianChange(index, 'kode_anggaran', e.target.value)}
                                                        options={akunOptions}
                                                        placeholder="Pilih "
                                                        className="w-full h-9 text-xs"
                                                    />
                                                </td>
                                                <td className="px-2 py-1 align-middle">
                                                    <TextInput
                                                        value={item.kebutuhan}
                                                        onChange={(e) => handleRincianChange(index, 'kebutuhan', e.target.value)}
                                                        className="w-full h-9 text-xs px-2"
                                                        placeholder="Deskripsi..."
                                                    />
                                                </td>
                                                <td className="px-2 py-1 align-middle">
                                                    <TextInput
                                                        type="number"
                                                        value={item.vol}
                                                        onChange={(e) => handleRincianChange(index, 'vol', e.target.value)}
                                                        className="w-full h-9 text-xs text-center px-1"
                                                        min="1"
                                                        placeholder="0"
                                                    />
                                                </td>
                                                <td className="px-2 py-1 align-middle">
                                                    <TextInput
                                                        value={item.satuan}
                                                        onChange={(e) => handleRincianChange(index, 'satuan', e.target.value)}
                                                        className="w-full h-9 text-xs text-center px-1"
                                                        placeholder="Paket"
                                                    />
                                                </td>
                                                <td className="px-2 py-1 align-middle">
                                                    <div className="flex flex-col">
                                                        <RupiahInput
                                                            value={item.biaya_satuan}
                                                            onValueChange={(val) => handleRincianChange(index, 'biaya_satuan', val)}
                                                            className="w-full h-9 text-xs text-right px-2"
                                                        />
                                                        {item.kode_anggaran && (() => {
                                                            const akun = akunAnggarans.find(a => String(a.kode_anggaran) === String(item.kode_anggaran));
                                                            return akun ? <span className="text-[10px] text-gray-400 text-right mt-0.5">Max: {formatRupiah(akun.nominal)}</span> : null;
                                                        })()}
                                                    </div>
                                                </td>
                                                <td className="px-2 py-1 text-right font-semibold text-gray-700 dark:text-gray-200 align-middle">{formatRupiah(item.jumlah)}</td>
                                                <td className="px-2 py-1 text-center align-middle">
                                                    <button type="button" onClick={() => removeRabItem(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-between items-end">
                                <button type="button" onClick={addRabItem} className="flex items-center text-sm font-medium text-yellow-600 hover:text-yellow-700"><Plus size={16} className="mr-1" /> Tambah Item</button>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Total Estimasi</span>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white flex items-center"><Calculator className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />{formatRupiah(data.anggaran)}</div>
                                </div>
                            </div>
                            <InputError message={errors.rincian_anggaran} className="mt-2" />
                        </div>

                        {/* --- 5. PENCAIRAN --- */}
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-green-500">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">5. Metode Pencairan Dana</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-700/50 p-5 rounded-xl">
                                <div>
                                    <InputLabel value="Metode" />
                                    <CustomSelect
                                        value={data.jenis_pencairan}
                                        onChange={(e) => setData('jenis_pencairan', e.target.value)}
                                        options={[{ value: 'Tunai', label: 'Tunai' }, { value: 'Bank', label: 'Transfer Bank' }]}
                                        className="mt-1 w-full"
                                    />
                                </div>
                                {data.jenis_pencairan === 'Bank' && (
                                    <div className="space-y-4 border-l-2 border-green-200 pl-4 animate-in fade-in slide-in-from-left-4">
                                        <div><InputLabel value="Nama Bank" />
                                            <TextInput
                                                value={data.nama_bank}
                                                onChange={(e) => setData('nama_bank', e.target.value)}
                                                className="mt-1 w-full h-11"
                                                placeholder="Masukkan Nama BANK"
                                            />
                                            <InputError message={errors.nama_bank} className="mt-2" />
                                        </div>
                                        <div><InputLabel value="No. Rekening" />
                                            <TextInput
                                                value={data.nomor_rekening}
                                                onChange={(e) => setData('nomor_rekening', e.target.value)}
                                                className="mt-1 w-full h-11"
                                                placeholder="Masukkan No. Rekening"
                                            />
                                            <InputError message={errors.nomor_rekening} className="mt-2" />
                                        </div>
                                        <div><InputLabel value="Atas Nama" />
                                            <TextInput
                                                value={data.atas_nama}
                                                onChange={(e) => setData('atas_nama', e.target.value)}
                                                className="mt-1 w-full h-11"
                                                placeholder="Masukkan Nama Pemilik Rekening"
                                            />
                                            <InputError message={errors.atas_nama} className="mt-2" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- STICKY FOOTER --- */}
                        <div className="sticky bottom-4 z-10 bg-white/90 dark:bg-gray-900 backdrop-blur-sm p-4 rounded-xl shadow-lg flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-sm flex items-center px-4 py-2 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <ArrowLeft size={16} className="mr-2" /> Kembali
                            </button>
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block mr-4">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Pengajuan</p>
                                    <p className="text-sm font-bold text-teal-600 dark:text-teal-400">{formatRupiah(data.anggaran)}</p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md shadow-lg shadow-teal-200/50 dark:shadow-teal-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                                >
                                    <Save size={18} className="mr-2" /> Simpan Pengajuan
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div >
        </AuthenticatedLayout >
    );
}