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
import { Plus, Trash2, Save, ArrowLeft, Calculator, Search, ChevronDown, Check } from 'lucide-react';
import { cn } from "@/lib/utils";
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
import { usePermission } from '@/hooks/usePermission';
import FieldTooltipError from '@/Components/FieldTooltipError';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

const formatRupiah = (angka) => {
    const number = Number(angka) || 0;
    return `Rp. ${number.toLocaleString('id-ID', { minimumFractionDigits: 0 })}`;
};

    const SboSelectPopover = ({ value, onChange, options, placeholder = "Pilih SBO..." }) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const OPTION_OTHER = { value: '__OTHER__', label: 'Lainnya / Other', isOther: true };

    const selected = value === '__OTHER__'
        ? OPTION_OTHER
        : options.find(opt => String(opt.value) === String(value));

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase()) ||
        String(opt.value).toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={cn(
                        "flex h-9 w-full items-center justify-between rounded-md border px-3 py-2 text-xs shadow-sm focus:outline-none focus:ring-1 transition-all",
                        value === '__OTHER__'
                            ? "border-purple-400/60 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 focus:ring-purple-500 hover:border-purple-500"
                            : "border-gray-300/50 bg-white dark:bg-gray-900 dark:border-gray-700/50 dark:text-gray-300 focus:ring-teal-500 hover:border-teal-400"
                    )}
                >
                    <span className="truncate mr-2 text-left">
                        {selected ? selected.label : placeholder}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[550px] p-0 shadow-2xl border border-teal-100 dark:border-teal-900 bg-white dark:bg-gray-900 z-[100]" align="start">
                <div className="flex items-center border-b border-gray-100 dark:border-gray-700 px-3 py-2 bg-gray-50/50 dark:bg-gray-800/50">
                    <Search className="mr-2 h-4 w-4 shrink-0 opacity-50 text-teal-600" />
                    <input
                        className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder="Cari Kode atau Nama Anggaran..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        autoFocus
                    />
                </div>
                <div className="max-h-[350px] overflow-y-auto p-1 custom-scrollbar">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt) => (
                            <div
                                key={opt.value}
                                className={cn(
                                    "relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors",
                                    "hover:bg-teal-50 dark:hover:bg-teal-900/30",
                                    String(value) === String(opt.value) ? "bg-teal-50/80 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200 font-medium" : "text-gray-700 dark:text-gray-300"
                                )}
                                onClick={() => {
                                    onChange({ target: { value: opt.value } });
                                    setOpen(false);
                                    setSearch("");
                                }}
                            >
                                <div className="flex-1 flex items-center gap-3 overflow-hidden py-1">
                                    <Check
                                        className={cn(
                                            "h-4 w-4 text-teal-600 shrink-0",
                                            String(value) === String(opt.value) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                                        <div className="flex justify-between items-center w-full">
                                            <span className="font-bold text-[10px] uppercase tracking-wider text-teal-600 dark:text-teal-400 leading-none">{opt.label.split(' - ')[0]}</span>
                                            <div className="flex items-center gap-2">
                                                {opt.satuan && (
                                                    <span className="text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                                        {opt.satuan}
                                                    </span>
                                                )}
                                                <span className="text-[10px] font-mono font-bold bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300 px-1.5 py-0.5 rounded">
                                                    Pagu: {formatRupiah(opt.nominal)}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-sm truncate pr-2">{opt.label.split(' - ').slice(1).join(' - ')}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-6 text-center flex flex-col items-center justify-center gap-2">
                            <Search className="h-8 w-8 text-gray-200 dark:text-gray-700" />
                            <p className="text-sm text-gray-500">Data standar biaya tidak ditemukan.</p>
                        </div>
                    )}

                    {/* Opsi Lainnya / Other di paling bawah */}
                    <div
                        className={cn(
                            "relative flex cursor-pointer select-none items-center rounded-md px-3 py-2 text-sm outline-none transition-colors mt-1",
                            "hover:bg-purple-50 dark:hover:bg-purple-900/30 border border-dashed border-purple-300 dark:border-purple-700",
                            value === '__OTHER__' ? "bg-purple-50/80 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 font-medium" : "text-purple-600 dark:text-purple-400"
                        )}
                        onClick={() => {
                            onChange({ target: { value: '__OTHER__' } });
                            setOpen(false);
                            setSearch("");
                        }}
                    >
                        <div className="flex-1 flex items-center gap-3 overflow-hidden py-1">
                            <Check
                                className={cn(
                                    "h-4 w-4 text-purple-600 shrink-0",
                                    value === '__OTHER__' ? "opacity-100" : "opacity-0"
                                )}
                            />
                            <div className="flex flex-col gap-0.5 overflow-hidden flex-1">
                                <div className="flex justify-between items-center w-full">
                                    <span className="font-bold text-[10px] uppercase tracking-wider text-purple-600 dark:text-purple-400 leading-none">Lain-lain</span>
                                    <span className="text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded">
                                        Tanpa Batas Standar Biaya
                                    </span>
                                </div>
                                <span className="text-sm truncate pr-2">Lainnya / Other - isi uraian, satuan & harga secara bebas</span>
                            </div>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};
export default function Create({ auth, tahunAnggarans, units, akunAnggarans, ikus }) {
    const { user, isAdmin } = usePermission();

    // Initial States
    const initialIndikator = {
        id: Date.now(),
        indikator: '',
        past_capaian: '',
        current_target: '',
        current_capaian: '',
        future_target: '',
        future_capaian: ''
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
        nama_penerima: '',

        // 7. Array
        indikator_kinerja: [initialIndikator],
        rincian_anggaran: [initialRAB]
    });

    const [filteredIkks, setFilteredIkks] = useState([]);
    const [isManualDeskripsi, setIsManualDeskripsi] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    const getFieldError = (field) => formErrors[field] || errors[field];

    const handleFieldChange = (field, value) => {
        setData(field, value);
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

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
    const addIndikatorRow = () => {
        setData('indikator_kinerja', [...data.indikator_kinerja, { ...initialIndikator, id: Date.now() }]);
        if (formErrors.indikator_kinerja) setFormErrors(prev => ({ ...prev, indikator_kinerja: null }));
    };

    const removeIndikatorRow = (id) => {
        const list = data.indikator_kinerja.filter(item => item.id !== id);
        setData('indikator_kinerja', list.length ? list : [{ ...initialIndikator, id: Date.now() }]);
    };

    const handleIndikatorChange = (index, field, value) => {
        const list = [...data.indikator_kinerja];
        list[index][field] = value;
        setData('indikator_kinerja', list);
        if (formErrors.indikator_kinerja) setFormErrors(prev => ({ ...prev, indikator_kinerja: null }));
    };

    const addRabItem = () => {
        setData('rincian_anggaran', [...data.rincian_anggaran, { ...initialRAB, id: Date.now() }]);
        if (formErrors.rincian_anggaran) setFormErrors(prev => ({ ...prev, rincian_anggaran: null }));
    };

    const removeRabItem = (id) => {
        const list = data.rincian_anggaran.filter(item => item.id !== id);
        if (list.length === 0) {
            setData('rincian_anggaran', [{ ...initialRAB, id: Date.now() }]);
        } else {
            const totalBaru = list.reduce((acc, curr) => acc + (parseFloat(curr.jumlah) || 0), 0);
            setData(prev => ({ ...prev, rincian_anggaran: list, anggaran: totalBaru }));
        }
        if (formErrors.rincian_anggaran) setFormErrors(prev => ({ ...prev, rincian_anggaran: null }));
    };

    const handleRincianChange = (index, field, value) => {
        if (formErrors.rincian_anggaran) setFormErrors(prev => ({ ...prev, rincian_anggaran: null }));
        const list = [...data.rincian_anggaran];
        const item = { ...list[index] };

        const getReferenceAccount = (kode) => {
            return akunAnggarans.find(a => String(a.kode_anggaran) === String(kode));
        };

        // Cek apakah item ini mode "Lainnya" (bebas input)
        const isOtherMode = (kode) => kode === '__OTHER__';

        if (field === 'kode_anggaran') {
            const kode = value;
            item.kode_anggaran = kode;

            if (isOtherMode(kode)) {
                // Mode Lainnya: kosongkan kebutuhan & harga, satuan default Paket
                item.kebutuhan = '';
                item.satuan = 'Paket';
                item.biaya_satuan = 0;
            } else {
                const akun = getReferenceAccount(kode);
                if (akun) {
                    item.kebutuhan = akun.nama_anggaran;
                    item.satuan = akun.satuan || item.satuan;
                    item.biaya_satuan = parseFloat(akun.nominal) || 0;
                }
            }
        }
        else if (field === 'biaya_satuan') {
            let inputHarga = parseFloat(value);
            if (isNaN(inputHarga)) inputHarga = 0;

            if (!isOtherMode(item.kode_anggaran)) {
                // Hanya validasi batas maksimal jika bukan mode Lainnya
                const akun = getReferenceAccount(item.kode_anggaran);
                const maxHarga = akun ? parseFloat(akun.nominal) : Infinity;

                if (inputHarga > maxHarga) {
                    inputHarga = maxHarga;
                    toast.warning("Batas Maksimal Terlampaui", {
                        description: `Harga satuan untuk item ini tidak boleh melebihi standar biaya (${formatRupiah(maxHarga)}).`,
                        duration: 3000,
                    });
                }
            }
            item.biaya_satuan = inputHarga;
        }
        else if (field === 'vol') {
            const cleanVal = String(value).replace(/[-+eE]/g, '');
            item.vol = cleanVal;
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
                    onClick: () => router.get(route('daftar-ajuan.index'))
                },
                cancel: {
                    label: "Batal"
                }
            });
        } else {
            router.get(route('daftar-ajuan.index'));
        }
    };

    const submit = (e) => {
        e.preventDefault();

        const errorsObj = {};
        const missingLabels = [];

        if (!data.tahun_anggaran) {
            errorsObj.tahun_anggaran = 'Harap isi bidang ini.';
            missingLabels.push('Tahun Anggaran');
        }
        if (!data.id_unit) {
            errorsObj.id_unit = 'Harap isi bidang ini.';
            missingLabels.push('Unit Kerja');
        }
        if (!data.judul_pengajuan || !data.judul_pengajuan.trim()) {
            errorsObj.judul_pengajuan = 'Harap isi bidang ini.';
            missingLabels.push('Judul Kegiatan');
        }
        if (!data.deskripsi_kegiatan || !data.deskripsi_kegiatan.trim()) {
            errorsObj.deskripsi_kegiatan = 'Harap isi bidang ini.';
            missingLabels.push('Deskripsi Kegiatan');
        }
        if (!data.latar_belakang || !data.latar_belakang.trim()) {
            errorsObj.latar_belakang = 'Harap isi bidang ini.';
            missingLabels.push('Latar Belakang');
        }
        if (!data.tujuan || !data.tujuan.trim()) {
            errorsObj.tujuan = 'Harap isi bidang ini.';
            missingLabels.push('Tujuan');
        }
        if (!data.rasional || !data.rasional.trim()) {
            errorsObj.rasional = 'Harap isi bidang ini.';
            missingLabels.push('Rasional');
        }
        if (!data.mekanisme || !data.mekanisme.trim()) {
            errorsObj.mekanisme = 'Harap isi bidang ini.';
            missingLabels.push('Mekanisme');
        }
        if (!data.jadwal_pelaksanaan_mulai) {
            errorsObj.jadwal_pelaksanaan_mulai = 'Harap isi bidang ini.';
            missingLabels.push('Tanggal Mulai Kegiatan');
        }
        if (!data.jadwal_pelaksanaan_akhir) {
            errorsObj.jadwal_pelaksanaan_akhir = 'Harap isi bidang ini.';
            missingLabels.push('Tanggal Selesai Kegiatan');
        }
        if (!data.lokasi_pelaksanaan || !data.lokasi_pelaksanaan.trim()) {
            errorsObj.lokasi_pelaksanaan = 'Harap isi bidang ini.';
            missingLabels.push('Lokasi Kegiatan');
        }
        if (!data.pjawab || !data.pjawab.trim()) {
            errorsObj.pjawab = 'Harap isi bidang ini.';
            missingLabels.push('PIC Kegiatan');
        }
        if (!data.target || !data.target.trim()) {
            errorsObj.target = 'Harap isi bidang ini.';
            missingLabels.push('Target Peserta');
        }
        if (!data.jenis_kegiatan) {
            errorsObj.jenis_kegiatan = 'Harap isi bidang ini.';
            missingLabels.push('Jenis Kegiatan');
        }
        if (!data.dokumen_pendukung || data.dokumen_pendukung.length === 0) {
            errorsObj.dokumen_pendukung = 'Harap tambahkan minimal 1 dokumen pendukung.';
            missingLabels.push('Dokumen Pendukung');
        }
        if (!data.iku_id) {
            errorsObj.iku_id = 'Harap isi bidang ini.';
            missingLabels.push('IKU');
        }
        if (!data.ikk_id) {
            errorsObj.ikk_id = 'Harap isi bidang ini.';
            missingLabels.push('IKK');
        }

        // Check Indikator Kinerja
        const hasValidIndikator = data.indikator_kinerja.some(item => item.indikator && item.indikator.trim() !== '');
        if (!hasValidIndikator) {
            errorsObj.indikator_kinerja = 'Harap isi minimal 1 deskripsi indikator kinerja.';
            missingLabels.push('Indikator Kinerja');
        }

        // Check RAB
        if (data.rincian_anggaran.length === 0 || data.anggaran <= 0) {
            errorsObj.rincian_anggaran = 'Rincian anggaran belum diisi atau total anggaran masih 0.';
            missingLabels.push('RAB / Anggaran');
        }

        // Check Pencairan Dana
        if (data.jenis_pencairan === 'Bank') {
            if (!data.nama_bank || !data.nama_bank.trim()) {
                errorsObj.nama_bank = 'Harap isi bidang ini.';
                missingLabels.push('Nama Bank');
            }
            if (!data.nomor_rekening || !data.nomor_rekening.trim()) {
                errorsObj.nomor_rekening = 'Harap isi bidang ini.';
                missingLabels.push('Nomor Rekening');
            }
            if (!data.atas_nama || !data.atas_nama.trim()) {
                errorsObj.atas_nama = 'Harap isi bidang ini.';
                missingLabels.push('Atas Nama Rekening');
            }
        } else if (data.jenis_pencairan === 'Tunai') {
            if (!data.nama_penerima || !data.nama_penerima.trim()) {
                errorsObj.nama_penerima = 'Harap isi bidang ini.';
                missingLabels.push('Nama Penerima');
            }
        }

        if (Object.keys(errorsObj).length > 0) {
            setFormErrors(errorsObj);
            let desc = '';
            if (missingLabels.length <= 4) {
                desc = `Harap lengkapi bidang yang belum diisi: ${missingLabels.join(', ')}.`;
            } else {
                const first4 = missingLabels.slice(0, 4).join(', ');
                desc = `Harap lengkapi ${missingLabels.length} isian yang belum diisi, yaitu: ${first4}, dan lainnya.`;
            }
            toast.error("Gagal Menyimpan (Belum Lengkap)", {
                description: desc,
                duration: 5000,
            });

            setTimeout(() => {
                const errorElement = document.querySelector('.border-rose-500, .ring-rose-500');
                if (errorElement) {
                    errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return;
        }

        setFormErrors({});

        // Peringatan sebelum menyimpan
        toast("Konfirmasi Simpan", {
            description: `Yakin ingin menyimpan pengajuan RKAT ini? Total anggaran dari rincian anggaran yang dipilih adalah ${formatRupiah(data.anggaran)}.`,
            action: {
                label: "Ya, Simpan",
                onClick: () => {
                    const toastId = toast.loading("Sedang menyimpan data...");
                    post(route('daftar-ajuan.store'), {
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
    
    const filteredIkuList = ikus.filter(i => {
        if (!data.tahun_anggaran) return true;
        return !i.tahun_anggaran || Number(i.tahun_anggaran) === Number(data.tahun_anggaran);
    });
    const ikuOptions = filteredIkuList.map(i => ({ value: i.id_iku, label: i.nama_iku }));
    const akunOptions = akunAnggarans.map(a => ({
        value: a.kode_anggaran,
        label: `${a.kode_anggaran} - ${a.nama_anggaran}`,
        nominal: a.nominal,
        satuan: a.satuan
    }));

    const dokumenPendukungList = ['Pengajuan Rutin', 'Proposal', 'TOR', 'Usulan'];
    const anchor = useComboboxAnchor();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pengajuan RKAT Baru</h2>}
        >
            <Head title="Input RKAT" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="space-y-6">

                        {/* --- 1. DATA DASAR --- */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-teal-500">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">1. Data Dasar Pengajuan</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative pb-2">
                                    <InputLabel value="Tahun Anggaran" required />
                                    <CustomSelect
                                        value={data.tahun_anggaran}
                                        onChange={(e) => handleFieldChange('tahun_anggaran', e.target.value)}
                                        options={tahunOptions}
                                        placeholder="Pilih Tahun"
                                        className={`mt-1 ${getFieldError('tahun_anggaran') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                    />
                                    <FieldTooltipError message={getFieldError('tahun_anggaran')} />
                                </div>
                                <div className="relative pb-2">
                                    <InputLabel value="Unit Kerja" required />
                                    <CustomSelect
                                        value={data.id_unit}
                                        onChange={(e) => handleFieldChange('id_unit', e.target.value)}
                                        options={isAdmin() ? unitOptions : unitOptions.filter(u => String(u.value) === String(user.id_unit))}
                                        placeholder="Pilih Unit"
                                        disabled={!isAdmin()}
                                        className={`mt-1 ${getFieldError('id_unit') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                    />
                                    <FieldTooltipError message={getFieldError('id_unit')} />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel value="Kode Akun Kegiatan (Auto)" required />
                                    <TextInput value={data.kode_akun} readOnly className="mt-1 block w-full bg-gray-100 text-gray-600 cursor-not-allowed border-gray-200" placeholder="Otomatis..." />
                                </div>

                                <div className="md:col-span-2 relative pb-2">
                                    <InputLabel value="Judul Kegiatan" required />
                                    <TextArea
                                        value={data.judul_pengajuan}
                                        onChange={(e) => handleFieldChange('judul_pengajuan', e.target.value)}
                                        className={`mt-1 block w-full ${getFieldError('judul_pengajuan') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                        rows={2}
                                        placeholder="Tuliskan judul kegiatan..."
                                    />
                                    <FieldTooltipError message={getFieldError('judul_pengajuan')} />
                                </div>
                            </div>
                        </div>

                        {/* --- 2. DETAIL PELAKSANAAN --- */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-indigo-500">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">2. Detail Pelaksanaan</h3>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="relative pb-2">
                                        <InputLabel value="Deskripsi Kegiatan" required />
                                        <TextArea
                                            value={data.deskripsi_kegiatan}
                                            onChange={(e) => { handleFieldChange('deskripsi_kegiatan', e.target.value); setIsManualDeskripsi(true); }}
                                            rows={3}
                                            className={`mt-1 w-full ${getFieldError('deskripsi_kegiatan') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                            placeholder="Deskripsi kegiatan..."
                                        />
                                        <FieldTooltipError message={getFieldError('deskripsi_kegiatan')} />
                                    </div>
                                    <div className="relative pb-2">
                                        <InputLabel value="Latar Belakang" required />
                                        <TextArea
                                            value={data.latar_belakang}
                                            onChange={(e) => handleFieldChange('latar_belakang', e.target.value)}
                                            rows={4}
                                            className={`mt-1 w-full ${getFieldError('latar_belakang') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                            placeholder="Jelaskan latar belakang kegiatan..."
                                        />
                                        <FieldTooltipError message={getFieldError('latar_belakang')} />
                                    </div>
                                    <div className="relative pb-2">
                                        <InputLabel value="Tujuan" required />
                                        <TextArea
                                            value={data.tujuan}
                                            onChange={(e) => handleFieldChange('tujuan', e.target.value)}
                                            rows={4}
                                            className={`mt-1 w-full ${getFieldError('tujuan') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                            placeholder="Jelaskan tujuan kegiatan..."
                                        />
                                        <FieldTooltipError message={getFieldError('tujuan')} />
                                    </div>
                                    <div className="relative pb-2">
                                        <InputLabel value="Rasional" required />
                                        <TextArea
                                            value={data.rasional}
                                            onChange={(e) => handleFieldChange('rasional', e.target.value)}
                                            rows={4}
                                            className={`mt-1 w-full ${getFieldError('rasional') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                            placeholder="Jelaskan rasional kegiatan..."
                                        />
                                        <FieldTooltipError message={getFieldError('rasional')} />
                                    </div>
                                    <div className="relative pb-2">
                                        <InputLabel value="Mekanisme" required />
                                        <TextArea
                                            value={data.mekanisme}
                                            onChange={(e) => handleFieldChange('mekanisme', e.target.value)}
                                            rows={4}
                                            className={`mt-1 w-full ${getFieldError('mekanisme') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                            placeholder="Jelaskan mekanisme pelaksanaan kegiatan..."
                                        />
                                        <FieldTooltipError message={getFieldError('mekanisme')} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t pt-4">
                                    <div className="relative pb-2">
                                        <InputLabel value="Tanggal Mulai Kegiatan" required />
                                        <DateInput
                                            value={data.jadwal_pelaksanaan_mulai}
                                            onChange={(val) => handleFieldChange('jadwal_pelaksanaan_mulai', val)}
                                            isError={!!getFieldError('jadwal_pelaksanaan_mulai')}
                                            className="mt-1 w-full"
                                        />
                                        <FieldTooltipError message={getFieldError('jadwal_pelaksanaan_mulai')} />
                                    </div>
                                    <div className="relative pb-2">
                                        <InputLabel value="Tanggal Selesai Kegiatan" required />
                                        <DateInput
                                            value={data.jadwal_pelaksanaan_akhir}
                                            onChange={(val) => handleFieldChange('jadwal_pelaksanaan_akhir', val)}
                                            isError={!!getFieldError('jadwal_pelaksanaan_akhir')}
                                            className="mt-1 w-full"
                                        />
                                        <FieldTooltipError message={getFieldError('jadwal_pelaksanaan_akhir')} />
                                    </div>
                                    <div className="relative pb-2">
                                        <InputLabel value="Lokasi Kegiatan" required />
                                        <TextInput
                                            value={data.lokasi_pelaksanaan}
                                            onChange={(e) => handleFieldChange('lokasi_pelaksanaan', e.target.value)}
                                            className={`mt-1 w-full h-11 ${getFieldError('lokasi_pelaksanaan') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                            placeholder="Masukkan Lokasi Pelaksanaan"
                                        />
                                        <FieldTooltipError message={getFieldError('lokasi_pelaksanaan')} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="relative pb-2">
                                        <InputLabel value="PIC Kegiatan" required />
                                        <TextInput
                                            value={data.pjawab}
                                            onChange={(e) => handleFieldChange('pjawab', e.target.value)}
                                            className={`mt-1 w-full h-11 ${getFieldError('pjawab') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                            placeholder="Masukkan Penanggung Jawab"
                                        />
                                        <FieldTooltipError message={getFieldError('pjawab')} />
                                    </div>
                                    <div className="relative pb-2">
                                        <InputLabel value="Target Peserta" required />
                                        <TextInput
                                            value={data.target}
                                            onChange={(e) => handleFieldChange('target', e.target.value)}
                                            className={`mt-1 w-full h-11 ${getFieldError('target') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                            placeholder="Masukkan Target Peserta"
                                        />
                                        <FieldTooltipError message={getFieldError('target')} />
                                    </div>

                                    {/* Input Jenis Kegiatan */}
                                    <div className="relative pb-2">
                                        <InputLabel value="Jenis Kegiatan" required />
                                        <CustomSelect
                                            value={data.jenis_kegiatan}
                                            onChange={(e) => handleFieldChange('jenis_kegiatan', e.target.value)}
                                            options={[
                                                { value: 'Rutin', label: 'Rutin' },
                                                { value: 'Inovasi', label: 'Inovasi' }
                                            ]}
                                            className={`mt-1 ${getFieldError('jenis_kegiatan') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                        />
                                        <FieldTooltipError message={getFieldError('jenis_kegiatan')} />
                                    </div>
                                    <div className="md:col-span-3 relative pb-2">
                                        <InputLabel value="Dokumen Pendukung" required />
                                        <div className={`mt-1 rounded-md transition-all ${getFieldError('dokumen_pendukung') ? 'ring-2 ring-rose-500 border border-rose-500' : ''}`}>
                                            <Combobox
                                                multiple
                                                autoHighlight
                                                items={dokumenPendukungList}
                                                value={data.dokumen_pendukung}
                                                onValueChange={(val) => handleFieldChange('dokumen_pendukung', val)}
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
                                        <FieldTooltipError message={getFieldError('dokumen_pendukung')} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- 3. INDIKATOR KINERJA --- */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-blue-500">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">3. Indikator Kinerja Sesuai IKU</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="relative pb-2">
                                    <InputLabel value="IKU" required />
                                    <CustomSelect
                                        value={data.iku_id}
                                        onChange={(e) => {
                                            handleFieldChange('iku_id', e.target.value);
                                            setData(prev => ({ ...prev, iku_id: e.target.value, ikk_id: '' }));
                                        }}
                                        options={ikuOptions}
                                        placeholder="Pilih IKU"
                                        isMarquee={true}
                                        className={`mt-1 ${getFieldError('iku_id') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                    />
                                    <FieldTooltipError message={getFieldError('iku_id')} />
                                </div>
                                <div className="relative pb-2">
                                    <InputLabel value="IKK" required />
                                    <CustomSelect
                                        value={data.ikk_id}
                                        onChange={(e) => handleFieldChange('ikk_id', e.target.value)}
                                        options={filteredIkks}
                                        placeholder="Pilih IKK"
                                        disabled={!data.iku_id}
                                        isMarquee={true}
                                        className={`mt-1 ${getFieldError('ikk_id') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                    />
                                    <FieldTooltipError message={getFieldError('ikk_id')} />
                                </div>
                            </div>
                            <div className="relative pb-2">
                                <div className={`overflow-x-auto rounded-lg mb-4 ${getFieldError('indikator_kinerja') ? 'border-2 border-rose-500 ring-2 ring-rose-500/20' : ''}`}>
                                    {(() => {
                                        const selectedTahunData = tahunAnggarans.find(t => String(t.tahun_anggaran) === String(data.tahun_anggaran));
                                        const labels = selectedTahunData?.indikator_labels || { past: '2025', current: 'Tahun 2026', future: 'Akhir 2029' };
                                        
                                        return (
                                            <table className="min-w-full">
                                                <thead className="bg-gray-50 dark:bg-gray-700/40 text-gray-700 dark:text-gray-300">
                                                    <tr>
                                                        <th className="px-2 py-3 text-xs text-center">No</th>
                                                        <th className="px-4 py-3 text-xs text-left min-w-[200px]">Indikator</th>
                                                        <th className="px-4 py-3 text-xs text-center min-w-[100px]">Kondisi {labels.past}</th>
                                                        <th className="px-4 py-3 text-xs text-center">Target {labels.current}</th>
                                                        <th className="px-4 py-3 text-xs text-center">Capaian {labels.current}</th>
                                                        <th className="px-4 py-3 text-xs text-center">Target {labels.future}</th>
                                                        <th className="px-4 py-3 text-xs text-center">Capaian {labels.future}</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800">
                                                    {data.indikator_kinerja.map((item, index) => (
                                                        <tr key={item.id} className="hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                                                            <td className="px-2 py-3 text-sm text-center align-top pt-4">{index + 1}</td>
                                                            <td className="p-2 align-top"><TextArea value={item.indikator} onChange={(e) => handleIndikatorChange(index, 'indikator', e.target.value)} className="w-full text-sm min-h-[80px]" rows="3" placeholder="Indikator..." /></td>
                                                            <td className="p-2 align-top"><TextArea value={item.past_capaian} onChange={(e) => handleIndikatorChange(index, 'past_capaian', e.target.value)} className="w-full text-sm text-center min-h-[80px]" rows="3" /></td>
                                                            <td className="p-2 align-top"><TextArea value={item.current_target} onChange={(e) => handleIndikatorChange(index, 'current_target', e.target.value)} className="w-full text-sm text-center min-h-[80px]" rows="3" /></td>
                                                            <td className="p-2 align-top"><TextArea value={item.current_capaian} onChange={(e) => handleIndikatorChange(index, 'current_capaian', e.target.value)} className="w-full text-sm text-center min-h-[80px]" rows="3" /></td>
                                                            <td className="p-2 align-top"><TextArea value={item.future_target} onChange={(e) => handleIndikatorChange(index, 'future_target', e.target.value)} className="w-full text-sm text-center min-h-[80px]" rows="3" /></td>
                                                            <td className="p-2 align-top"><TextArea value={item.future_capaian} onChange={(e) => handleIndikatorChange(index, 'future_capaian', e.target.value)} className="w-full text-sm text-center min-h-[80px]" rows="3" /></td>
                                                            <td className="p-2 pt-4 align-top"><button type="button" onClick={() => removeIndikatorRow(item.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={16} /></button></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        );
                                    })()}
                                </div>
                                <FieldTooltipError message={getFieldError('indikator_kinerja')} />
                            </div>
                            <button type="button" onClick={addIndikatorRow} className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"><Plus size={16} className="mr-1" /> Tambah Indikator</button>
                        </div>

                        {/* --- 4. RAB --- */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-yellow-500">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">4. Rincian Anggaran Belanja (RAB)</h3>
                            <div className="relative pb-2">
                                <div className={`overflow-x-auto rounded-lg mb-4 ${getFieldError('rincian_anggaran') ? 'border-2 border-rose-500 ring-2 ring-rose-500/20' : ''}`}>
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
                                                        <SboSelectPopover
                                                            value={item.kode_anggaran}
                                                            onChange={(e) => handleRincianChange(index, 'kode_anggaran', e.target.value)}
                                                            options={akunOptions}
                                                            placeholder="Pilih SBO..."
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
                                                            onKeyDown={(e) => {
                                                                if (['-', '+', 'e', 'E'].includes(e.key)) {
                                                                    e.preventDefault();
                                                                }
                                                            }}
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
                                                                onChange={(e) => handleRincianChange(index, 'biaya_satuan', e.target.value)}
                                                                className="w-full h-9 text-xs text-right px-2"
                                                            />
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
                                <FieldTooltipError message={getFieldError('rincian_anggaran')} />
                            </div>
                            <div className="flex justify-between items-end">
                                <button type="button" onClick={addRabItem} className="flex items-center text-sm font-medium text-yellow-600 hover:text-yellow-700"><Plus size={16} className="mr-1" /> Tambah Item</button>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider">Total Estimasi</span>
                                    <div className="text-xl font-bold text-gray-900 dark:text-white flex items-center"><Calculator className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />{formatRupiah(data.anggaran)}</div>
                                </div>
                            </div>
                        </div>

                        {/* --- 5. PENCAIRAN --- */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-green-500">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">5. Pencairan Dana</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-700/50 p-5 rounded-xl">
                                <div className="relative pb-2">
                                    <InputLabel value="Metode Pencairan" />
                                    <CustomSelect
                                        value={data.jenis_pencairan}
                                        onChange={(e) => handleFieldChange('jenis_pencairan', e.target.value)}
                                        options={[{ value: 'Tunai', label: 'Tunai' }, { value: 'Bank', label: 'Transfer Bank' }]}
                                        className={`mt-1 w-full ${getFieldError('jenis_pencairan') ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`}
                                    />
                                    <FieldTooltipError message={getFieldError('jenis_pencairan')} />
                                </div>
                                {data.jenis_pencairan === 'Bank' && (
                                    <div className="space-y-4 border-l-2 border-green-200 pl-4 animate-in fade-in slide-in-from-left-4">
                                        <div className="relative pb-2">
                                            <InputLabel value="Nama Bank" />
                                            <TextInput
                                                value={data.nama_bank}
                                                onChange={(e) => handleFieldChange('nama_bank', e.target.value)}
                                                className={`mt-1 w-full h-11 ${getFieldError('nama_bank') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                                placeholder="Masukkan Nama BANK"
                                            />
                                            <FieldTooltipError message={getFieldError('nama_bank')} />
                                        </div>
                                        <div className="relative pb-2">
                                            <InputLabel value="No. Rekening" />
                                            <TextInput
                                                value={data.nomor_rekening}
                                                onChange={(e) => handleFieldChange('nomor_rekening', e.target.value)}
                                                className={`mt-1 w-full h-11 ${getFieldError('nomor_rekening') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                                placeholder="Masukkan No. Rekening"
                                            />
                                            <FieldTooltipError message={getFieldError('nomor_rekening')} />
                                        </div>
                                        <div className="relative pb-2">
                                            <InputLabel value="Atas Nama" />
                                            <TextInput
                                                value={data.atas_nama}
                                                onChange={(e) => handleFieldChange('atas_nama', e.target.value)}
                                                className={`mt-1 w-full h-11 ${getFieldError('atas_nama') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                                placeholder="Masukkan Nama Pemilik Rekening"
                                            />
                                            <FieldTooltipError message={getFieldError('atas_nama')} />
                                        </div>
                                    </div>
                                )}
                                {data.jenis_pencairan === 'Tunai' && (
                                    <div className="space-y-4 border-l-2 border-green-200 pl-4 animate-in fade-in slide-in-from-left-4">
                                        <div>
                                            <InputLabel value="Nama Pengusul (PIC)" />
                                            <TextInput
                                                value={data.pjawab || ''}
                                                readOnly
                                                className="mt-1 w-full h-11 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-600"
                                                placeholder="Otomatis dari PIC"
                                            />
                                        </div>
                                        <div>
                                            <InputLabel value="Nama Pemberi" />
                                            <TextInput
                                                value="BAUK"
                                                readOnly
                                                className="mt-1 w-full h-11 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 cursor-not-allowed border-gray-200 dark:border-gray-600 font-semibold"
                                            />
                                        </div>
                                        <div className="relative pb-2">
                                            <InputLabel value="Nama Penerima" />
                                            <TextInput
                                                value={data.nama_penerima}
                                                onChange={(e) => handleFieldChange('nama_penerima', e.target.value)}
                                                className={`mt-1 w-full h-11 ${getFieldError('nama_penerima') ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                                placeholder="Masukkan Nama Penerima"
                                            />
                                            <FieldTooltipError message={getFieldError('nama_penerima')} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* --- STICKY FOOTER --- */}
                        <div className="sticky bottom-4 z-30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm flex items-center px-4 py-2 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
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