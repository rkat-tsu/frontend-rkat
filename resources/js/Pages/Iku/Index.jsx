import React, { useState } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionButton, { ActionGroup } from '@/Components/ActionButton';
import { 
    Plus, Edit2, Trash2, CheckCircle2, 
    Save, History, Calendar, Archive, Copy, Search, User, Clock, 
    Layers, X 
} from 'lucide-react';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextArea from '@/Components/TextArea';
import CustomSelect from '@/Components/CustomSelect';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/usePermission';

export default function Index({ 
    auth, 
    ikus = [], 
    tahunOptions = [], 
    selectedTahun = new Date().getFullYear(), 
    activeTahun = new Date().getFullYear(), 
    changeLogs = [] 
}) {
    const { isAdmin } = usePermission();

    // Modals state
    const [isAnnualModalOpen, setIsAnnualModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCopyYearModalOpen, setIsCopyYearModalOpen] = useState(false);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);

    const [editingIku, setEditingIku] = useState(null);

    // Filter State untuk Log Modal
    const [logSearch, setLogSearch] = useState('');
    const [logFilterAction, setLogFilterAction] = useState('ALL');
    const [expandedLogId, setExpandedLogId] = useState(null);

    // 1. Annual Create Form (Tambah IKU & IKK)
    const annualForm = useForm({
        tahun_anggaran: selectedTahun,
        nama_iku: '',
        ikks: [{ nama_ikk: '' }],
    });

    // 2. Unified Edit Form (Edit IKU & IKK)
    const editForm = useForm({
        uuid: '',
        tahun_anggaran: selectedTahun,
        nama_iku: '',
        ikks: [{ nama_ikk: '' }],
    });

    // 3. Copy Year Form
    const copyYearForm = useForm({
        source_tahun: selectedTahun > 2020 ? selectedTahun - 1 : selectedTahun,
        target_tahun: selectedTahun,
    });

    // Filter Year Change
    const handleYearChange = (newYear) => {
        router.get(route('iku.index'), { tahun: newYear }, { preserveState: true, preserveScroll: true });
    };

    // Modal Create Handlers
    const openAnnualModal = () => {
        annualForm.setData({
            tahun_anggaran: selectedTahun,
            nama_iku: '',
            ikks: [{ nama_ikk: '' }],
        });
        annualForm.clearErrors();
        setIsAnnualModalOpen(true);
    };

    const closeAnnualModal = () => {
        setIsAnnualModalOpen(false);
        annualForm.reset();
    };

    // Modal Unified Edit Handlers
    const openEditModal = (iku) => {
        setEditingIku(iku);
        const ikkList = (iku && iku.ikks && iku.ikks.length > 0)
            ? iku.ikks.map(ikk => ({ id_ikk: ikk.id_ikk, nama_ikk: ikk.nama_ikk }))
            : [{ nama_ikk: '' }];

        editForm.setData({
            uuid: iku.uuid,
            tahun_anggaran: iku.tahun_anggaran || selectedTahun,
            nama_iku: iku.nama_iku,
            ikks: ikkList,
        });
        editForm.clearErrors();
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingIku(null);
        editForm.reset();
    };

    // Modal Copy Year Handlers
    const openCopyYearModal = () => {
        const availableYears = tahunOptions.map(t => t.tahun_anggaran);
        const defaultSource = availableYears.find(y => y < selectedTahun) || (selectedTahun - 1);
        copyYearForm.setData({
            source_tahun: defaultSource,
            target_tahun: selectedTahun,
        });
        copyYearForm.clearErrors();
        setIsCopyYearModalOpen(true);
    };

    const closeCopyYearModal = () => {
        setIsCopyYearModalOpen(false);
        copyYearForm.reset();
    };

    // SUBMIT HANDLERS
    const submitAnnual = (e) => {
        e.preventDefault();
        if (!annualForm.data.nama_iku || annualForm.data.nama_iku.trim() === '') {
            toast.error("Peringatan", { description: "Nama IKU wajib diisi." });
            return;
        }

        const toastId = toast.loading("Sedang menyimpan IKU & IKK...");
        annualForm.post(route('iku.annual.store'), {
            onSuccess: () => {
                toast.success("Berhasil Ditambahkan", { 
                    id: toastId,
                    description: `IKU dan daftar IKK berhasil ditambahkan.`
                });
                closeAnnualModal();
            },
            onError: () => {
                toast.error("Gagal Menyimpan", {
                    id: toastId,
                    description: "Terjadi kesalahan saat menyimpan data."
                });
            }
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();
        if (!editForm.data.nama_iku || editForm.data.nama_iku.trim() === '') {
            toast.error("Peringatan", { description: "Nama IKU wajib diisi." });
            return;
        }

        const toastId = toast.loading("Sedang memperbarui IKU & IKK...");
        editForm.put(route('iku.update', editingIku.uuid), {
            onSuccess: () => {
                toast.success("Berhasil Diperbarui", { 
                    id: toastId,
                    description: `Data IKU dan IKK berhasil diperbarui.`
                });
                closeEditModal();
            },
            onError: () => {
                toast.error("Gagal Menyimpan", {
                    id: toastId,
                    description: "Terjadi kesalahan saat memperbarui data."
                });
            }
        });
    };

    const submitCopyYear = (e) => {
        e.preventDefault();
        if (copyYearForm.data.source_tahun === copyYearForm.data.target_tahun) {
            toast.error("Peringatan", { description: "Tahun asal dan tujuan harus berbeda." });
            return;
        }

        const toastId = toast.loading("Sedang menyalin IKU & IKK dari tahun sebelumnya...");
        copyYearForm.post(route('iku.copy_year'), {
            onSuccess: () => {
                toast.success("Berhasil Disalin", {
                    id: toastId,
                    description: `Data IKU & IKK dari Tahun ${copyYearForm.data.source_tahun} berhasil disalin ke Tahun ${copyYearForm.data.target_tahun}.`
                });
                closeCopyYearModal();
            },
            onError: (errs) => {
                toast.error("Gagal Menyalin", {
                    id: toastId,
                    description: errs.source_tahun || errs.target_tahun || "Terjadi kesalahan saat menyalin data."
                });
            }
        });
    };

    const handleDelete = (uuid) => {
        toast.warning("Konfirmasi Hapus", {
            description: "Apakah Anda yakin ingin menghapus IKU ini beserta seluruh IKK-nya?",
            action: {
                label: "Ya, Hapus",
                onClick: () => {
                    const toastId = toast.loading("Sedang menghapus...");
                    router.delete(route('iku.destroy', uuid), {
                        onSuccess: () => toast.success("Berhasil Dihapus", { id: toastId, description: "IKU berhasil dihapus." }),
                        onError: () => toast.error("Gagal Menghapus", { id: toastId, description: "Terjadi kesalahan saat menghapus data." })
                    });
                }
            },
            cancel: { label: "Batal" }
        });
    };

    // Annual Form IKK row controls
    const addAnnualIkkRow = () => {
        annualForm.setData('ikks', [...annualForm.data.ikks, { nama_ikk: '' }]);
    };
    const removeAnnualIkkRow = (index) => {
        const list = [...annualForm.data.ikks];
        list.splice(index, 1);
        annualForm.setData('ikks', list);
    };
    const updateAnnualIkkRow = (index, value) => {
        const list = [...annualForm.data.ikks];
        list[index]['nama_ikk'] = value;
        annualForm.setData('ikks', list);
    };

    // Edit Form IKK row controls
    const addEditIkkRow = () => {
        editForm.setData('ikks', [...editForm.data.ikks, { nama_ikk: '' }]);
    };
    const removeEditIkkRow = (index) => {
        const list = [...editForm.data.ikks];
        list.splice(index, 1);
        editForm.setData('ikks', list);
    };
    const updateEditIkkRow = (index, value) => {
        const list = [...editForm.data.ikks];
        list[index]['nama_ikk'] = value;
        editForm.setData('ikks', list);
    };

    // Filter Logs Logic
    const filteredLogs = changeLogs.filter(log => {
        const matchesAction = logFilterAction === 'ALL' || log.aksi === logFilterAction;
        const searchLower = logSearch.toLowerCase();
        const matchesSearch = !logSearch || 
            (log.ringkasan_perubahan && log.ringkasan_perubahan.toLowerCase().includes(searchLower)) ||
            (log.nama_entitas && log.nama_entitas.toLowerCase().includes(searchLower)) ||
            (log.user && log.user.nama_lengkap && log.user.nama_lengkap.toLowerCase().includes(searchLower)) ||
            (log.user && log.user.username && log.user.username.toLowerCase().includes(searchLower));
        return matchesAction && matchesSearch;
    });

    const yearSelectOptions = (tahunOptions.length > 0 ? tahunOptions : [{ tahun_anggaran: selectedTahun }]).map(t => ({
        value: t.tahun_anggaran,
        label: `Tahun ${t.tahun_anggaran}${t.status_rkat && t.status_rkat !== 'Closed' ? ' (Aktif)' : ''}`
    }));

    const isArchiveYear = selectedTahun !== activeTahun;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Indikator Kinerja Utama (IKU) & Kegiatan (IKK)
                    </h2>
                </div>
            }
        >
            <Head title={`Master IKU & IKK - Tahun ${selectedTahun}`} />

            <div className="py-6 pb-24">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 space-y-6">

                    {/* --- HEADER CONTROLS CARD (RESPONSIVE FOR MOBILE & DESKTOP) --- */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-5">
                        
                        {/* Row 1: Judul & Subjudul (Kiri) vs Action Buttons (Kanan) */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                    Daftar IKU & IKK
                                </h1>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Kelola master Indikator Kinerja Utama (IKU) dan rincian Indikator Kinerja Kegiatan (IKK).
                                </p>
                            </div>

                            {/* Tombol Aksi (Responsive Stack di Mobile, Flex di Desktop) */}
                            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 w-full lg:w-auto shrink-0">
                                <button
                                    onClick={() => setIsLogModalOpen(true)}
                                    className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition shadow-sm border border-slate-200 dark:border-gray-600 h-10 whitespace-nowrap w-full sm:w-auto"
                                    title="Lihat riwayat log perubahan dan pengarsipan IKU/IKK"
                                >
                                    <History size={16} className="text-slate-600 dark:text-slate-300 shrink-0" />
                                    <span>Log Perubahan & Arsip</span>
                                    {changeLogs.length > 0 && (
                                        <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
                                            {changeLogs.length}
                                        </span>
                                    )}
                                </button>

                                {isAdmin() && (
                                    <>
                                        <button
                                            onClick={openCopyYearModal}
                                            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold transition shadow-sm h-10 whitespace-nowrap w-full sm:w-auto"
                                            title="Salin semua IKU & IKK dari tahun anggaran sebelumnya"
                                        >
                                            <Copy size={16} className="shrink-0" />
                                            <span>Salin dari Tahun Lalu</span>
                                        </button>

                                        <button
                                            onClick={openAnnualModal}
                                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition h-10 whitespace-nowrap w-full sm:w-auto"
                                        >
                                            <Plus size={16} className="shrink-0" />
                                            <span>Tambah IKU & IKK</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Row 2: Dedicated Bar Filter Tahun Anggaran (Flexible Wrap for Mobile) */}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5 shrink-0">
                                    <Calendar size={15} className="text-teal-600 dark:text-teal-400" />
                                    Tahun Anggaran:
                                </span>
                                <div className="w-full sm:w-56">
                                    <CustomSelect
                                        value={selectedTahun}
                                        onChange={(e) => handleYearChange(Number(e.target.value))}
                                        options={yearSelectOptions}
                                        className="h-10 text-xs w-full"
                                    />
                                </div>
                                {isArchiveYear ? (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50 shrink-0">
                                        <Archive size={13} /> Arsip
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700/50 shrink-0">
                                        <CheckCircle2 size={13} /> Tahun Digunakan (Aktif)
                                    </span>
                                )}
                            </div>

                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Menampilkan master IKU dan rincian IKK untuk Tahun Anggaran <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedTahun}</span>.
                            </div>
                        </div>
                    </div>

                    {/* --- MOBILE CARD VIEW (TAMPIL PADA SCREEN HP / TABLET KECIL) --- */}
                    <div className="block md:hidden space-y-4">
                        {ikus.length > 0 ? (
                            ikus.map((iku, index) => {
                                const ikkList = iku.ikks || [];
                                return (
                                    <div key={iku.id_iku} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                                        {/* Header Mobile Card */}
                                        <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-2">
                                                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0">
                                                    {index + 1}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                                    Tahun {iku.tahun_anggaran || selectedTahun}
                                                </span>
                                            </div>
                                            {isAdmin() && (
                                                <ActionGroup>
                                                    <ActionButton
                                                        variant="edit"
                                                        tooltip="Edit IKU & Rincian IKK"
                                                        onClick={() => openEditModal(iku)}
                                                    />
                                                    <ActionButton
                                                        variant="delete"
                                                        tooltip="Hapus IKU ini"
                                                        onClick={() => handleDelete(iku.uuid)}
                                                    />
                                                </ActionGroup>
                                            )}
                                        </div>

                                        {/* Judul IKU */}
                                        <div>
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 block mb-1">
                                                Indikator Kinerja Utama (IKU)
                                            </span>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-relaxed">
                                                {iku.nama_iku}
                                            </h4>
                                        </div>

                                        {/* List IKK */}
                                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500">
                                                    Rincian Kegiatan (IKK)
                                                </span>
                                                <span className="text-xs text-gray-500 font-medium">
                                                    {ikkList.length} IKK
                                                </span>
                                            </div>
                                            {ikkList.length > 0 ? (
                                                <div className="space-y-2">
                                                    {ikkList.map((ikk, i) => (
                                                        <div key={ikk.id_ikk} className="flex items-start gap-2.5 text-xs bg-gray-50 dark:bg-gray-900/50 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700/60">
                                                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold shrink-0 text-[10px] border border-teal-200 dark:border-teal-700">
                                                                {i + 1}
                                                            </span>
                                                            <span className="text-gray-800 dark:text-gray-200 leading-relaxed pt-0.5">
                                                                {ikk.nama_ikk}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="py-2 text-xs text-gray-400 dark:text-gray-500 italic bg-gray-50 dark:bg-gray-900/30 p-2.5 rounded-lg text-center">
                                                    Belum ada rincian kegiatan (IKK).
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 text-center text-gray-500 dark:text-gray-400 text-sm border border-gray-200 dark:border-gray-700">
                                Belum ada data IKU terdaftar untuk Tahun Anggaran {selectedTahun}.
                            </div>
                        )}
                    </div>

                    {/* --- TABEL DESKTOP MASTER IKU & IKK (HIDDEN DI MOBILE) --- */}
                    <div className="hidden md:block bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700/60">
                                    <tr>
                                        <th className="w-12 px-4 py-3.5 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                                        <th className="w-1/3 px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Indikator Kinerja Utama (IKU)</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rincian Kegiatan (IKK)</th>
                                        {isAdmin() && (
                                            <th className="w-32 px-6 py-3.5 text-center text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Aksi</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                    {ikus.map((iku, index) => {
                                        const ikkList = iku.ikks || [];

                                        return (
                                            <tr key={iku.id_iku} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition-colors align-top">
                                                
                                                {/* No */}
                                                <td className="px-4 py-4 text-center whitespace-nowrap text-gray-900 dark:text-gray-100 font-bold">
                                                    {index + 1}
                                                </td>

                                                {/* Nama IKU & Tahun */}
                                                <td className="px-6 py-4 space-y-1.5">
                                                    <div className="font-bold text-gray-900 dark:text-white leading-relaxed text-sm">
                                                        {iku.nama_iku}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                                            Tahun {iku.tahun_anggaran || selectedTahun}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            ({ikkList.length} IKK)
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Daftar IKK (Tampil Langsung Semua) */}
                                                <td className="px-6 py-4">
                                                    {ikkList.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {ikkList.map((ikk, i) => (
                                                                <div key={ikk.id_ikk} className="flex items-start gap-2.5 text-xs bg-gray-50/60 dark:bg-gray-900/40 p-2 rounded-lg border border-gray-100 dark:border-gray-700/60">
                                                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold shrink-0 text-[11px] border border-teal-200 dark:border-teal-700">
                                                                        {i + 1}
                                                                    </span>
                                                                    <span className="text-gray-800 dark:text-gray-200 leading-relaxed pt-0.5">
                                                                        {ikk.nama_ikk}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="py-2 text-xs text-gray-400 dark:text-gray-500 italic">
                                                            Belum ada rincian kegiatan (IKK) untuk IKU ini.
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Aksi (Tunggal: Edit Unified & Delete) */}
                                                {isAdmin() && (
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <ActionGroup className="justify-center">
                                                            <ActionButton
                                                                variant="edit"
                                                                tooltip="Edit IKU & Rincian IKK"
                                                                onClick={() => openEditModal(iku)}
                                                            />
                                                            <ActionButton
                                                                variant="delete"
                                                                tooltip="Hapus IKU ini"
                                                                onClick={() => handleDelete(iku.uuid)}
                                                            />
                                                        </ActionGroup>
                                                    </td>
                                                )}
                                            </tr>
                                        );
                                    })}

                                    {ikus.length === 0 && (
                                        <tr>
                                            <td colSpan={isAdmin() ? 4 : 3} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 bg-gray-50/30 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-700">
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <Archive size={36} className="text-gray-400 dark:text-gray-500" />
                                                    <p className="font-semibold text-gray-700 dark:text-gray-300">Belum ada data IKU terdaftar untuk Tahun Anggaran {selectedTahun}.</p>
                                                    {isAdmin() && (
                                                        <div className="flex gap-3 mt-3">
                                                            <button
                                                                onClick={openAnnualModal}
                                                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
                                                            >
                                                                Tambah IKU & IKK
                                                            </button>
                                                            <button
                                                                onClick={openCopyYearModal}
                                                                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 rounded-lg text-xs font-semibold shadow-sm transition"
                                                            >
                                                                Salin dari Tahun Lalu
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- MODAL 1: TAMBAH IKU & IKK --- */}
            <Modal show={isAnnualModalOpen} onClose={closeAnnualModal} maxWidth="3xl">
                <form onSubmit={submitAnnual} className="p-6 bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Plus className="text-teal-600" size={22} />
                                Tambah IKU Tahunan Beserta IKK
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Buat IKU baru beserta seluruh daftar Indikator Kinerja Kegiatan (IKK) secara bersamaan dalam satu langkah.
                            </p>
                        </div>
                        <button type="button" onClick={closeAnnualModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Pilih Tahun Anggaran & Nama IKU */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div>
                                <InputLabel htmlFor="annual_tahun_anggaran" value="Tahun Anggaran" required />
                                <CustomSelect
                                    value={annualForm.data.tahun_anggaran}
                                    onChange={(e) => annualForm.setData('tahun_anggaran', Number(e.target.value))}
                                    options={yearSelectOptions}
                                    className="mt-1 w-full"
                                />
                                <InputError message={annualForm.errors.tahun_anggaran} className="mt-1" />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="annual_nama_iku" value="Nama Indikator Kinerja Utama (IKU)" required />
                                <TextArea
                                    id="annual_nama_iku"
                                    value={annualForm.data.nama_iku}
                                    onChange={(e) => annualForm.setData('nama_iku', e.target.value)}
                                    className="mt-1 block w-full text-sm leading-relaxed"
                                    placeholder="Contoh: IKU 01: Meningkatkan kualitas lulusan dan pembelajaran"
                                    rows={3}
                                    isFocused
                                />
                                <InputError message={annualForm.errors.nama_iku} className="mt-1" />
                            </div>
                        </div>

                        {/* Daftar Baris IKK */}
                        <div className="border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4 bg-indigo-50/20 dark:bg-indigo-950/10">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                                    <Layers size={16} /> Daftar Kegiatan / Indikator (IKK)
                                </h3>
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                                    {annualForm.data.ikks.length} IKK
                                </span>
                            </div>

                            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
                                {annualForm.data.ikks.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                                            {index + 1}
                                        </div>

                                        <div className="flex-grow">
                                            <TextArea
                                                value={item.nama_ikk}
                                                onChange={(e) => updateAnnualIkkRow(index, e.target.value)}
                                                className="w-full text-sm leading-relaxed"
                                                placeholder={`Masukkan rincian kegiatan / IKK ke-${index + 1}...`}
                                                rows={2}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeAnnualIkkRow(index)}
                                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                                            disabled={annualForm.data.ikks.length === 1}
                                            title="Hapus baris ini"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addAnnualIkkRow}
                                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-700 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition shadow-sm"
                            >
                                <Plus size={15} /> Tambah Baris IKK
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <SecondaryButton type="button" onClick={closeAnnualModal}>Batal</SecondaryButton>
                        <PrimaryButton disabled={annualForm.processing} className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2">
                            <Save size={18} />
                            <span>Simpan IKU & Semua IKK</span>
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* --- MODAL 2: UNIFIED EDIT IKU & IKK (EDIT DALAM SATU TEMPAT) --- */}
            <Modal show={isEditModalOpen} onClose={closeEditModal} maxWidth="3xl">
                <form onSubmit={submitEdit} className="p-6 bg-white dark:bg-gray-800">
                    <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <Edit2 className="text-indigo-600" size={22} />
                                Edit IKU & Rincian IKK
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Perbarui nama IKU, tahun anggaran, dan kelola rincian kegiatan (IKK) dalam satu formulir terpadu.
                            </p>
                        </div>
                        <button type="button" onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Tahun Anggaran & Nama IKU */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div>
                                <InputLabel htmlFor="edit_tahun_anggaran" value="Tahun Anggaran" required />
                                <CustomSelect
                                    value={editForm.data.tahun_anggaran}
                                    onChange={(e) => editForm.setData('tahun_anggaran', Number(e.target.value))}
                                    options={yearSelectOptions}
                                    className="mt-1 w-full"
                                />
                                <InputError message={editForm.errors.tahun_anggaran} className="mt-1" />
                            </div>

                            <div className="md:col-span-2">
                                <InputLabel htmlFor="edit_nama_iku" value="Nama Indikator Kinerja Utama (IKU)" required />
                                <TextArea
                                    id="edit_nama_iku"
                                    value={editForm.data.nama_iku}
                                    onChange={(e) => editForm.setData('nama_iku', e.target.value)}
                                    className="mt-1 block w-full text-sm leading-relaxed"
                                    placeholder="Contoh: IKU XX: Meningkatkan tata kelola organisasi"
                                    rows={3}
                                    isFocused
                                />
                                <InputError message={editForm.errors.nama_iku} className="mt-1" />
                            </div>
                        </div>

                        {/* Kelola Daftar IKK */}
                        <div className="border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4 bg-indigo-50/20 dark:bg-indigo-950/10">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                                    <Layers size={16} /> Rincian Kegiatan (IKK)
                                </h3>
                                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300">
                                    {editForm.data.ikks.length} IKK
                                </span>
                            </div>

                            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
                                {editForm.data.ikks.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                                        <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                                            {index + 1}
                                        </div>

                                        <div className="flex-grow">
                                            <TextArea
                                                value={item.nama_ikk}
                                                onChange={(e) => updateEditIkkRow(index, e.target.value)}
                                                className="w-full text-sm leading-relaxed"
                                                placeholder={`Masukkan rincian kegiatan / IKK ke-${index + 1}...`}
                                                rows={2}
                                            />
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeEditIkkRow(index)}
                                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition"
                                            disabled={editForm.data.ikks.length === 1}
                                            title="Hapus baris ini"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={addEditIkkRow}
                                className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-800 border border-indigo-300 dark:border-indigo-700 rounded-lg text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 transition shadow-sm"
                            >
                                <Plus size={15} /> Tambah Baris IKK
                            </button>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <SecondaryButton type="button" onClick={closeEditModal}>Batal</SecondaryButton>
                        <PrimaryButton disabled={editForm.processing} className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                            <Save size={18} />
                            <span>Simpan Perubahan</span>
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* --- MODAL 3: SALIN IKU DARI TAHUN SEBELUMNYA --- */}
            <Modal show={isCopyYearModalOpen} onClose={closeCopyYearModal} maxWidth="lg">
                <form onSubmit={submitCopyYear} className="p-6 bg-white dark:bg-gray-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                        <Copy className="text-indigo-600" size={20} />
                        Salin IKU & IKK dari Tahun Sebelumnya
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
                        Duplikasi seluruh struktur Master IKU dan IKK dari tahun lalu ke tahun anggaran terpilih secara otomatis.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="source_tahun" value="Salin Dari Tahun (Asal)" required />
                            <CustomSelect
                                value={copyYearForm.data.source_tahun}
                                onChange={(e) => copyYearForm.setData('source_tahun', Number(e.target.value))}
                                options={yearSelectOptions}
                                className="mt-1 w-full"
                            />
                            <InputError message={copyYearForm.errors.source_tahun} className="mt-1" />
                        </div>

                        <div>
                            <InputLabel htmlFor="target_tahun" value="Salin Ke Tahun (Tujuan)" required />
                            <CustomSelect
                                value={copyYearForm.data.target_tahun}
                                onChange={(e) => copyYearForm.setData('target_tahun', Number(e.target.value))}
                                options={yearSelectOptions}
                                className="mt-1 w-full"
                            />
                            <InputError message={copyYearForm.errors.target_tahun} className="mt-1" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <SecondaryButton type="button" onClick={closeCopyYearModal}>Batal</SecondaryButton>
                        <PrimaryButton disabled={copyYearForm.processing} className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2">
                            <Copy size={18} />
                            <span>Proses Salin IKU</span>
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>

            {/* --- MODAL 4: LOG PERUBAHAN & PENGARSIPAN IKU & IKK --- */}
            <Modal show={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} maxWidth="4xl">
                <div className="p-6 bg-white dark:bg-gray-800 max-h-[85vh] flex flex-col">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                <History className="text-indigo-600 dark:text-indigo-400" size={24} />
                                Log Perubahan & Pengarsipan IKU / IKK
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Catatan histori perubahah, waktu update, serta identitas user pengubah untuk keperluan audit dan pengarsipan.
                            </p>
                        </div>
                        <button onClick={() => setIsLogModalOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <X size={22} />
                        </button>
                    </div>

                    {/* Filter Bar Log */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="relative flex-grow">
                            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                value={logSearch}
                                onChange={(e) => setLogSearch(e.target.value)}
                                placeholder="Cari berdasarkan nama IKU, IKK, atau nama user pengubah..."
                                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                            {['ALL', 'CREATE', 'BULK_CREATE', 'UPDATE', 'SYNC_IKK', 'DELETE', 'COPY_YEAR'].map(act => (
                                <button
                                    key={act}
                                    onClick={() => setLogFilterAction(act)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${logFilterAction === act ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'}`}
                                >
                                    {act === 'ALL' ? 'Semua Aksi' : act}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Log Timeline List */}
                    <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                        {filteredLogs.length > 0 ? (
                            filteredLogs.map((log) => {
                                const isExpanded = expandedLogId === log.id_log;
                                const userFull = log.user ? log.user.nama_lengkap : 'Sistem / Admin';
                                const userRole = log.user ? log.user.peran : 'User';
                                const userUsername = log.user ? `@${log.user.username}` : '';
                                const createdAtFormatted = log.created_at 
                                    ? new Date(log.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'medium' })
                                    : '-';

                                let badgeColor = 'bg-gray-100 text-gray-800';
                                if (log.aksi === 'CREATE' || log.aksi === 'BULK_CREATE') badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                                else if (log.aksi === 'UPDATE' || log.aksi === 'SYNC_IKK') badgeColor = 'bg-blue-100 text-blue-800 border-blue-200';
                                else if (log.aksi === 'DELETE') badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
                                else if (log.aksi === 'COPY_YEAR') badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';

                                return (
                                    <div key={log.id_log} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/40 hover:border-indigo-300 transition space-y-2">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                            
                                            {/* Informast User Pengubah */}
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                                                    <User size={16} />
                                                </div>
                                                <div>
                                                    <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        <span>{userFull}</span>
                                                        <span className="px-2 py-0.5 rounded text-[10px] bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">
                                                            {userRole}
                                                        </span>
                                                        {userUsername && <span className="text-gray-400 text-[10px]">{userUsername}</span>}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                        <Clock size={12} />
                                                        <span>{createdAtFormatted}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Action Badge */}
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold border ${badgeColor}`}>
                                                {log.aksi}
                                            </span>
                                        </div>

                                        {/* Ringkasan Perubahan */}
                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 pt-1">
                                            {log.ringkasan_perubahan}
                                        </div>

                                        {/* Detail Diff Toggle */}
                                        {log.detail_perubahan && (
                                            <div>
                                                <button
                                                    onClick={() => setExpandedLogId(isExpanded ? null : log.id_log)}
                                                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 mt-1"
                                                >
                                                    {isExpanded ? 'Sembunyikan Detail Rincian ▲' : 'Lihat Detail Rincian ▼'}
                                                </button>

                                                {isExpanded && (
                                                    <div className="mt-2 p-3 bg-white dark:bg-gray-950 rounded-lg text-xs font-mono border border-gray-200 dark:border-gray-800 overflow-x-auto text-gray-700 dark:text-gray-300">
                                                        <pre className="whitespace-pre-wrap">
                                                            {JSON.stringify(log.detail_perubahan, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-12 text-center text-gray-400 text-sm italic">
                                Belum ada catatan log perubahan IKU/IKK.
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                        <SecondaryButton onClick={() => setIsLogModalOpen(false)}>Tutup</SecondaryButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}