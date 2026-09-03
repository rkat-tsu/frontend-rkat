import React, { useState, useEffect, useMemo, Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        this.setState({ errorInfo });
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 m-8 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                    <h2 className="text-xl font-bold text-red-700 mb-4">Terjadi Kesalahan pada Komponen LPJ</h2>
                    <pre className="p-4 bg-white rounded border border-red-100 text-red-600 text-sm overflow-x-auto">
                        {this.state.error && this.state.error.toString()}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
    FileCheck2, Plus, Search, Send, Edit2, FileDown, Eye, Save,
    CheckCircle2, XCircle, AlertTriangle, AlertCircle, Clock, Wallet, ArrowUpRight,
    Building2, Calendar, FileText, Receipt, Check, RefreshCw, Paperclip,
    ArrowUp, ArrowDown, ArrowUpDown
} from 'lucide-react';
import CustomSelect from '@/Components/CustomSelect';
import DateInput from '@/Components/DateInput';
import ActionButton, { ActionGroup } from '@/Components/ActionButton';
import GlobalApprovalModal from '@/Components/GlobalApprovalModal';
import StatusBadge from '@/Components/StatusBadge';
import Modal from '@/Components/Modal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/usePermission';

const formatDate = (value) => {
    if (!value) return '-';
    try {
        return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return value;
    }
};

const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val || 0);

function FieldTooltipError({ message }) {
    if (!message) return null;
    return (
        <div className="absolute left-3 -bottom-8 z-30 flex items-center gap-1.5 px-3 py-1 bg-rose-600 dark:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xl animate-fade-in-up border border-rose-500/30">
            <div className="absolute -top-1 left-4 w-2.5 h-2.5 bg-rose-600 dark:bg-rose-700 rotate-45"></div>
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{message}</span>
        </div>
    );
}

export default function Index(props) {
    return (
        <ErrorBoundary>
            <IndexContent {...props} />
        </ErrorBoundary>
    );
}

function IndexContent({ auth, lpjs, stats, availablePencairans = [], filters = {}, tahunAnggarans = [], units = [], flash = {} }) {
    const { isAdmin, isApprover } = usePermission();

    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [tahun, setTahun] = useState(filters?.tahun || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [unitId, setUnitId] = useState(filters?.unit_id || '');
    const [perPage, setPerPage] = useState(filters?.per_page || '15');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'created_at');
    const [sortDirection, setSortDirection] = useState(filters?.sort_direction || 'desc');

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);

    const [editingLpj, setEditingLpj] = useState(null);
    const [selectedLpjDetail, setSelectedLpjDetail] = useState(null);

    // Form state for Create / Edit
    const [formErrors, setFormErrors] = useState({});
    const [selectedPencairanId, setSelectedPencairanId] = useState('');
    const [judulLpj, setJudulLpj] = useState('');
    const [tanggalLpj, setTanggalLpj] = useState(new Date().toISOString().split('T')[0]);
    const [tglMulai, setTglMulai] = useState('');
    const [tglSelesai, setTglSelesai] = useState('');
    const [lokasi, setLokasi] = useState('');
    const [ringkasan, setRingkasan] = useState('');
    const [itemsForm, setItemsForm] = useState([]);
    const [buktiList, setBuktiList] = useState([]);
    const [newBuktiUrl, setNewBuktiUrl] = useState('');

    // Approval Modal Form state
    const [approvalAction, setApprovalAction] = useState('Disetujui');
    const [approvalCatatan, setApprovalCatatan] = useState('');
    const [targetLpjForApproval, setTargetLpjForApproval] = useState(null);

    // Filter Trigger
    const handleFilterChange = (newFilters = {}) => {
        const queryParams = {
            search: searchTerm,
            tahun,
            status,
            unit_id: unitId,
            per_page: perPage,
            sort_by: sortBy,
            sort_direction: sortDirection,
            ...newFilters
        };
        router.get(route('lpj.index'), queryParams, { preserveState: true, replace: true });
    };

    const handleSortColumn = (field) => {
        let direction = 'asc';
        if (sortBy === field && sortDirection === 'asc') {
            direction = 'desc';
        }
        setSortBy(field);
        setSortDirection(direction);
        handleFilterChange({ sort_by: field, sort_direction: direction });
    };

    const renderSortIcon = (field) => {
        if (sortBy !== field) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-gray-400 opacity-50 inline-block" />;
        return sortDirection === 'asc' 
            ? <ArrowUp className="w-3.5 h-3.5 ml-1 text-teal-600 dark:text-teal-400 inline-block" />
            : <ArrowDown className="w-3.5 h-3.5 ml-1 text-teal-600 dark:text-teal-400 inline-block" />;
    };

    // When selecting Pencairan in Create modal
    useEffect(() => {
        if (selectedPencairanId && !editingLpj) {
            const rawId = selectedPencairanId?.target ? selectedPencairanId.target.value : selectedPencairanId;
            const selectedPencairan = availablePencairans.find(p => 
                String(p.id_header) === String(rawId) || String(p.id_pencairan) === String(rawId)
            );
            if (selectedPencairan) {
                setJudulLpj(`LPJ - ${selectedPencairan.nomor_dokumen_rkat} (${selectedPencairan.unit_name})`);
                setItemsForm(selectedPencairan.items.map(item => ({
                    id_pencairan_item: item.id_pencairan_item,
                    deskripsi_item: item.deskripsi_item,
                    satuan: item.satuan,
                    volume_pencairan: item.volume_pencairan,
                    nominal_pencairan: item.nominal_pencairan,
                    sub_total_pencairan: item.sub_total_pencairan,
                    volume_realisasi: item.volume_pencairan,
                    harga_satuan_realisasi: item.nominal_pencairan,
                    nomor_kwitansi: '',
                    keterangan: ''
                })));
            }
        }
    }, [selectedPencairanId, availablePencairans, editingLpj]);

    // Open Modal Create
    const handleOpenCreateModal = () => {
        setEditingLpj(null);
        setSelectedPencairanId('');
        setJudulLpj('');
        setTanggalLpj(new Date().toISOString().split('T')[0]);
        setTglMulai('');
        setTglSelesai('');
        setLokasi('');
        setRingkasan('');
        setItemsForm([]);
        setBuktiList([]);
        setFormErrors({});
        setIsCreateModalOpen(true);
    };

    // Open Modal Edit
    const handleOpenEditModal = (lpj) => {
        setEditingLpj(lpj);
        setSelectedPencairanId(lpj.id_pencairan.toString());
        setJudulLpj(lpj.judul_lpj);
        setTanggalLpj(lpj.tanggal_lpj ? lpj.tanggal_lpj.split('T')[0] : new Date().toISOString().split('T')[0]);
        setTglMulai(lpj.tanggal_pelaksanaan_mulai ? lpj.tanggal_pelaksanaan_mulai.split('T')[0] : '');
        setTglSelesai(lpj.tanggal_pelaksanaan_selesai ? lpj.tanggal_pelaksanaan_selesai.split('T')[0] : '');
        setLokasi(lpj.lokasi_kegiatan || '');
        setRingkasan(lpj.ringkasan_kegiatan || '');
        setBuktiList(lpj.dokumen_bukti || []);
        setFormErrors({});

        if (lpj.items && lpj.items.length > 0) {
            setItemsForm(lpj.items.map(item => ({
                id_pencairan_item: item.id_pencairan_item,
                deskripsi_item: item.pencairan_item?.rkat_rab_item?.deskripsi_item || 'Item Anggaran',
                satuan: item.pencairan_item?.rkat_rab_item?.satuan || 'Satuan',
                volume_pencairan: item.pencairan_item?.volume_pencairan || 0,
                nominal_pencairan: item.pencairan_item?.nominal_pencairan || 0,
                sub_total_pencairan: item.pencairan_item?.sub_total_pencairan || 0,
                volume_realisasi: item.volume_realisasi,
                harga_satuan_realisasi: item.harga_satuan_realisasi,
                nomor_kwitansi: item.nomor_kwitansi || '',
                keterangan: item.keterangan || ''
            })));
        }
        setIsCreateModalOpen(true);
    };

    const parseNonNegativeFloat = (val) => {
        const num = parseFloat(val);
        return isNaN(num) || num < 0 ? 0 : num;
    };

    const handleNumberKeyDown = (e) => {
        if (['e', 'E', '+', '-'].includes(e.key)) {
            e.preventDefault();
        }
    };

    // Item form handler
    const handleItemChange = (index, field, value) => {
        const updated = [...itemsForm];
        if (field === 'volume_realisasi' || field === 'harga_satuan_realisasi') {
            let cleanVal = value;
            if (typeof cleanVal === 'string') {
                cleanVal = cleanVal.replace(/[^0-9.]/g, '');
                const parts = cleanVal.split('.');
                if (parts.length > 2) {
                    cleanVal = parts[0] + '.' + parts.slice(1).join('');
                }
            }
            updated[index][field] = cleanVal;
        } else {
            updated[index][field] = value;
        }
        setItemsForm(updated);
    };

    const addBuktiItem = () => {
        if (newBuktiUrl.trim()) {
            let formattedUrl = newBuktiUrl.trim();
            if (!/^https?:\/\//i.test(formattedUrl)) {
                formattedUrl = 'https://' + formattedUrl;
            }
            setBuktiList([...buktiList, formattedUrl]);
            setNewBuktiUrl('');
        }
    };

    const removeBuktiItem = (idx) => {
        setBuktiList(buktiList.filter((_, i) => i !== idx));
    };

    // Calculate totals for Modal Create/Edit
    const totalPencairanModal = itemsForm.reduce((sum, item) => sum + (parseFloat(item.sub_total_pencairan) || 0), 0);
    const totalRealisasiModal = itemsForm.reduce((sum, item) => sum + (parseNonNegativeFloat(item.volume_realisasi) * parseNonNegativeFloat(item.harga_satuan_realisasi)), 0);
    const totalSisaModal = totalPencairanModal - totalRealisasiModal;

    // Submit Create/Edit Form
    const handleSubmitLpjForm = (e) => {
        e.preventDefault();
        const errorsObj = {};

        if (!selectedPencairanId) {
            errorsObj.selectedPencairanId = 'Harap isi bidang ini.';
        }
        if (!judulLpj || !judulLpj.trim()) {
            errorsObj.judulLpj = 'Harap isi bidang ini.';
        }
        if (!tanggalLpj) {
            errorsObj.tanggalLpj = 'Harap isi bidang ini.';
        }
        if (!lokasi || !lokasi.trim()) {
            errorsObj.lokasi = 'Harap isi bidang ini.';
        }
        if (!tglMulai) {
            errorsObj.tglMulai = 'Harap isi bidang ini.';
        }
        if (!tglSelesai) {
            errorsObj.tglSelesai = 'Harap isi bidang ini.';
        }
        if (!ringkasan || !ringkasan.trim()) {
            errorsObj.ringkasan = 'Harap isi bidang ini.';
        }
        if (buktiList.length === 0) {
            errorsObj.buktiList = 'Harap tambahkan minimal 1 link dokumen bukti.';
        }

        if (Object.keys(errorsObj).length > 0) {
            setFormErrors(errorsObj);
            toast.error('Harap lengkapi semua isian yang masih kosong.');
            return;
        }

        setFormErrors({});

        const rawId = selectedPencairanId?.target ? selectedPencairanId.target.value : selectedPencairanId;
        const selectedPencairan = availablePencairans.find(p => 
            String(p.id_header) === String(rawId) || String(p.id_pencairan) === String(rawId)
        );

        const payload = {
            id_header: selectedPencairan?.id_header || null,
            id_pencairan: selectedPencairan?.id_pencairan || selectedPencairanId,
            judul_lpj: judulLpj,
            tanggal_lpj: tanggalLpj,
            tanggal_pelaksanaan_mulai: tglMulai || null,
            tanggal_pelaksanaan_selesai: tglSelesai || null,
            lokasi_kegiatan: lokasi,
            ringkasan_kegiatan: ringkasan,
            items: itemsForm.map(item => ({
                id_pencairan_item: item.id_pencairan_item,
                volume_realisasi: parseNonNegativeFloat(item.volume_realisasi),
                harga_satuan_realisasi: parseNonNegativeFloat(item.harga_satuan_realisasi),
                nomor_kwitansi: item.nomor_kwitansi,
                keterangan: item.keterangan,
            })),
            dokumen_bukti: buktiList,
        };

        if (editingLpj) {
            const toastId = toast.loading('Sedang memperbarui LPJ...');
            router.put(route('lpj.update', editingLpj.id_lpj), payload, {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    toast.success('Dokumen LPJ berhasil diperbarui.', { id: toastId });
                },
                onError: () => {
                    toast.error('Gagal memperbarui dokumen LPJ.', { id: toastId });
                }
            });
        } else {
            const toastId = toast.loading('Sedang membuat LPJ baru...');
            router.post(route('lpj.store'), payload, {
                onSuccess: () => {
                    setIsCreateModalOpen(false);
                    toast.success('Dokumen LPJ berhasil dibuat.', { id: toastId });
                },
                onError: () => {
                    toast.error('Gagal membuat dokumen LPJ.', { id: toastId });
                }
            });
        }
    };

    // Submit for Approval action with Sonner Toast Confirmation
    const handleSubmitForApproval = (lpjId) => {
        toast.warning('Konfirmasi Pengajuan LPJ', {
            description: 'Apakah Anda yakin ingin mengajukan LPJ ini untuk persetujuan?',
            action: {
                label: 'Ya, Ajukan',
                onClick: () => {
                    const toastId = toast.loading('Sedang mengajukan LPJ...');
                    router.post(route('lpj.submit', lpjId), {}, {
                        onSuccess: () => {
                            toast.success('LPJ berhasil diajukan untuk persetujuan.', { id: toastId });
                        },
                        onError: () => {
                            toast.error('Gagal mengajukan LPJ.', { id: toastId });
                        }
                    });
                }
            },
            cancel: {
                label: 'Batal'
            }
        });
    };

    // Open Approval Modal
    const handleOpenApprovalModal = (lpj) => {
        setTargetLpjForApproval(lpj);
        setApprovalAction('Disetujui');
        setApprovalCatatan('');
        setIsApproveModalOpen(true);
    };

    const handleProcessApproval = (e) => {
        e.preventDefault();
        if (!targetLpjForApproval) return;

        if ((approvalAction === 'Revisi' || approvalAction === 'Ditolak') && !approvalCatatan.trim()) {
            toast.error('Catatan wajib diisi apabila melakukan revisi atau penolakan.');
            return;
        }

        const toastId = toast.loading('Sedang memproses persetujuan LPJ...');
        router.post(route('lpj.approve', targetLpjForApproval.id_lpj), {
            aksi: approvalAction,
            catatan: approvalCatatan
        }, {
            onSuccess: () => {
                setIsApproveModalOpen(false);
                setTargetLpjForApproval(null);
                toast.success(`LPJ berhasil di-${approvalAction.toLowerCase()}.`, { id: toastId });
            },
            onError: () => {
                toast.error('Gagal memproses persetujuan LPJ.', { id: toastId });
            }
        });
    };

    // Status Badge Helper
    const getStatusBadge = (status) => <StatusBadge status={status} />;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                    Laporan Pertanggungjawaban
                </h2>
            }
        >
            <Head title="Laporan Pertanggungjawaban (LPJ)" />

            <div className="py-6 space-y-6">

                {/* --- STATISTICAL METRICS CARDS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total LPJ */}
                    <div className="relative overflow-hidden bg-white dark:bg-gray-800/90 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Total LPJ</p>
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stats?.total_lpj || 0}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                    <span className="text-teal-600 font-medium">{stats?.disetujui || 0}</span> Disetujui
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-400/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                <FileCheck2 className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Total Realisasi Pengeluaran */}
                    <div className="relative overflow-hidden bg-white dark:bg-gray-800/90 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Total Realisasi</p>
                                <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                                    {formatCurrency(stats?.total_realisasi)}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Pencairan: {formatCurrency(stats?.total_pencairan)}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <Wallet className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Sisa Pengembalian Dana */}
                    <div className="relative overflow-hidden bg-white dark:bg-gray-800/90 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Sisa Pengembalian</p>
                                <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                                    {formatCurrency(stats?.total_sisa)}
                                </h3>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-0.5">
                                    <ArrowUpRight className="w-3.5 h-3.5" /> Efisiensi Penggunaan
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <Receipt className="w-6 h-6" />
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Menunggu Approval / Revisi */}
                    <div className="relative overflow-hidden bg-white dark:bg-gray-800/90 rounded-2xl p-5 border border-gray-100 dark:border-gray-700/60 shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase">Perlu Perhatian</p>
                                <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                                    {(stats?.diajukan || 0) + (stats?.revisi || 0)}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {stats?.diajukan || 0} Diajukan, {stats?.revisi || 0} Revisi
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Clock className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- FILTER & SEARCH BAR --- */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-2xl p-5 border-l-4 border-teal-500 border-gray-200/80 dark:border-gray-700/80">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        {/* Search & Filters (Sisi Kiri) */}
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto flex-1">
                            {/* Search input */}
                            <div className="relative w-full lg:w-72">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Cari No LPJ, Judul, Unit..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleFilterChange()}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 dark:focus:ring-teal-400 text-gray-900 dark:text-white placeholder-gray-400 transition"
                                />
                            </div>

                            {/* Tahun Anggaran */}
                            <div className="w-36">
                                <CustomSelect
                                    value={tahun}
                                    onChange={(val) => { setTahun(val); handleFilterChange({ tahun: val }); }}
                                    options={[
                                        { value: '', label: 'Semua Tahun' },
                                        ...tahunAnggarans.map(t => ({ value: t.toString(), label: `Tahun ${t}` }))
                                    ]}
                                    placeholder="Tahun"
                                />
                            </div>

                            {/* Status */}
                            <div className="w-40">
                                <CustomSelect
                                    value={status}
                                    onChange={(val) => { setStatus(val); handleFilterChange({ status: val }); }}
                                    options={[
                                        { value: '', label: 'Semua Status' },
                                        { value: 'Draft', label: 'Draft' },
                                        { value: 'Diajukan', label: 'Diajukan' },
                                        { value: 'Disetujui', label: 'Disetujui' },
                                        { value: 'Revisi', label: 'Revisi' },
                                        { value: 'Ditolak', label: 'Ditolak' },
                                    ]}
                                    placeholder="Status"
                                />
                            </div>

                            {/* Unit (Admin/Approver) */}
                            {(isAdmin() || isApprover()) && units.length > 0 && (
                                <div className="w-48">
                                    <CustomSelect
                                        value={unitId}
                                        onChange={(val) => { setUnitId(val); handleFilterChange({ unit_id: val }); }}
                                        options={[
                                            { value: '', label: 'Semua Unit' },
                                            ...units.map(u => ({ value: u.id_unit.toString(), label: u.nama_unit }))
                                        ]}
                                        placeholder="Unit Kerja"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Button Buat LPJ Baru (Posisi Paling Kanan - Warna TSU Teal) */}
                        <div className="w-full lg:w-auto flex justify-end">
                            <button
                                onClick={handleOpenCreateModal}
                                className="h-11 inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-md shadow-teal-600/20 transition-all duration-200 active:scale-95 whitespace-nowrap"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Buat LPJ Baru</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- DATA TABLE --- */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300 border-collapse">
                            <thead className="text-xs uppercase bg-gray-50/80 dark:bg-gray-900/60 text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 font-semibold tracking-wider select-none">
                                <tr>
                                    <th className="py-3.5 px-4 text-center w-12 border-r border-gray-200 dark:border-gray-700/60 last:border-r-0">No</th>
                                    
                                    <th 
                                        onClick={() => handleSortColumn('nomor_lpj')}
                                        className="py-3.5 px-4 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition border-r border-gray-200 dark:border-gray-700/60 last:border-r-0"
                                    >
                                        <div className="flex items-center justify-center">
                                            <span>Dokumen LPJ</span>
                                            {renderSortIcon('nomor_lpj')}
                                        </div>
                                    </th>

                                    <th 
                                        onClick={(isAdmin() || isApprover()) ? () => handleSortColumn('unit') : undefined}
                                        className={`py-3.5 px-4 text-center border-r border-gray-200 dark:border-gray-700/60 last:border-r-0 ${
                                            (isAdmin() || isApprover()) ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition' : ''
                                        }`}
                                    >
                                        <div className="flex items-center justify-center">
                                            <span>Unit Kerja</span>
                                            {(isAdmin() || isApprover()) && renderSortIcon('unit')}
                                        </div>
                                    </th>

                                    <th 
                                        onClick={() => handleSortColumn('pencairan')}
                                        className="py-3.5 px-4 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition border-r border-gray-200 dark:border-gray-700/60 last:border-r-0"
                                    >
                                        <div className="flex items-center justify-center">
                                            <span>Ref. Pencairan</span>
                                            {renderSortIcon('pencairan')}
                                        </div>
                                    </th>

                                    <th 
                                        onClick={() => handleSortColumn('total_realisasi')}
                                        className="py-3.5 px-4 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition border-r border-gray-200 dark:border-gray-700/60 last:border-r-0"
                                    >
                                        <div className="flex items-center justify-center">
                                            <span>Realisasi</span>
                                            {renderSortIcon('total_realisasi')}
                                        </div>
                                    </th>

                                    <th 
                                        onClick={() => handleSortColumn('sisa_dana')}
                                        className="py-3.5 px-4 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition border-r border-gray-200 dark:border-gray-700/60 last:border-r-0"
                                    >
                                        <div className="flex items-center justify-center">
                                            <span>Sisa Pengembalian</span>
                                            {renderSortIcon('sisa_dana')}
                                        </div>
                                    </th>

                                    <th 
                                        onClick={() => handleSortColumn('status_lpj')}
                                        className="py-3.5 px-4 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition border-r border-gray-200 dark:border-gray-700/60 last:border-r-0"
                                    >
                                        <div className="flex items-center justify-center">
                                            <span>Status</span>
                                            {renderSortIcon('status_lpj')}
                                        </div>
                                    </th>

                                    <th className="py-3.5 px-4 text-center w-36">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {lpjs?.data && lpjs.data.length > 0 ? (
                                     lpjs.data.map((lpj, index) => {
                                        const unitLpjId = lpj.rkat_header?.id_unit || lpj.pencairan_dana?.rkat_header?.id_unit;
                                        const isBelongsToUnit = auth.user.id_unit && unitLpjId && String(auth.user.id_unit) === String(unitLpjId);
                                        const isPengaju = auth.user.id_user === lpj.diajukan_oleh || isBelongsToUnit || isAdmin();
                                        const canEdit = (lpj.status_lpj === 'Draft' || lpj.status_lpj === 'Revisi') && isPengaju;
                                        const canSubmit = (lpj.status_lpj === 'Draft' || lpj.status_lpj === 'Revisi') && isPengaju;
                                        const canApprove = lpj.status_lpj === 'Diajukan' && (isApprover() || isAdmin());

                                        return (
                                            <tr key={lpj.id_lpj} className="hover:bg-gray-50/80 dark:hover:bg-gray-700/30 transition">
                                                <td className="py-3.5 px-4 text-center font-medium text-gray-400 border-r border-gray-200/80 dark:border-gray-700/50 last:border-r-0">
                                                    {(lpjs.current_page - 1) * lpjs.per_page + index + 1}
                                                </td>
                                                <td className="py-3.5 px-4 text-center border-r border-gray-200/80 dark:border-gray-700/50 last:border-r-0">
                                                    <div className="font-bold text-gray-900 dark:text-white inline-flex items-center justify-center gap-1.5">
                                                        <span>{lpj.nomor_lpj}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1 text-center">
                                                        {lpj.judul_lpj}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 mt-0.5 text-center">
                                                        Tgl: {formatDate(lpj.tanggal_lpj)}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-medium text-gray-800 dark:text-gray-200 border-r border-gray-200/80 dark:border-gray-700/50 last:border-r-0">
                                                    {lpj.rkat_header?.unit?.nama_unit || lpj.pencairan_dana?.rkat_header?.unit?.nama_unit || '-'}
                                                </td>
                                                <td className="py-3.5 px-4 text-center text-xs text-gray-600 dark:text-gray-300 border-r border-gray-200/80 dark:border-gray-700/50 last:border-r-0">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {lpj.pencairan_dana?.nama_pencairan || 'Gabungan Pencairan'}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400">
                                                        No RKAT: {lpj.rkat_header?.nomor_dokumen || lpj.pencairan_dana?.rkat_header?.nomor_dokumen || '-'}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-bold text-gray-900 dark:text-white border-r border-gray-200/80 dark:border-gray-700/50 last:border-r-0">
                                                    {formatCurrency(lpj.total_realisasi)}
                                                </td>
                                                <td className="py-3.5 px-4 text-center font-semibold border-r border-gray-200/80 dark:border-gray-700/50 last:border-r-0">
                                                    <span className={lpj.sisa_dana < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                                                        {formatCurrency(lpj.sisa_dana)}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-center border-r border-gray-200/80 dark:border-gray-700/50 last:border-r-0">
                                                    <StatusBadge status={lpj.status_lpj} type="lpj" />
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <ActionGroup>
                                                        {/* Detail View */}
                                                        <ActionButton
                                                            variant="detail"
                                                            tooltip="Lihat Detail LPJ"
                                                            onClick={() => {
                                                                setSelectedLpjDetail(lpj);
                                                                setIsDetailModalOpen(true);
                                                            }}
                                                        />

                                                        {/* Export PDF */}
                                                        <ActionButton
                                                            variant="export"
                                                            tooltip="Cetak PDF"
                                                            href={route('lpj.export', lpj.id_lpj)}
                                                            target="_blank"
                                                        />

                                                        {/* Edit Draft/Revisi */}
                                                        {canEdit && (
                                                            <ActionButton
                                                                variant="edit"
                                                                tooltip="Edit LPJ"
                                                                onClick={() => handleOpenEditModal(lpj)}
                                                            />
                                                        )}

                                                        {/* Submit Draft/Revisi */}
                                                        {canSubmit && (
                                                            <ActionButton
                                                                variant="submit"
                                                                tooltip="Ajukan LPJ"
                                                                onClick={() => handleSubmitForApproval(lpj.id_lpj)}
                                                            />
                                                        )}

                                                        {/* Approval Button for Approvers */}
                                                        {canApprove && (
                                                            <ActionButton
                                                                variant="approve"
                                                                tooltip="Proses Approval LPJ"
                                                                onClick={() => handleOpenApprovalModal(lpj)}
                                                            />
                                                        )}
                                                    </ActionGroup>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="py-12 text-center text-gray-400 dark:text-gray-500">
                                            <FileCheck2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                            <p className="font-medium text-base">Belum Ada Data Laporan Pertanggungjawaban (LPJ)</p>
                                            <p className="text-xs text-gray-400 mt-1">Klik tombol "Buat LPJ Baru" untuk menyusun laporan realisasi.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {lpjs?.links && lpjs.links.length > 3 && (
                        <div className="p-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                Menampilkan {lpjs.from || 0} - {lpjs.to || 0} dari {lpjs.total || 0} data
                            </span>
                            <div className="flex items-center gap-1">
                                {lpjs.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url || link.active}
                                        onClick={() => link.url && router.get(link.url)}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
                                            link.active
                                                ? 'bg-teal-600 text-white'
                                                : link.url
                                                    ? 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- MODAL CREATE / EDIT LPJ --- */}
            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="4xl">
                <form onSubmit={handleSubmitLpjForm} noValidate className="p-6 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FileCheck2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                            <span>{editingLpj ? 'Edit Dokumen LPJ' : 'Buat Laporan Pertanggungjawaban (LPJ) Baru'}</span>
                        </h3>
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            ✕
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pilih Dokumen RKA / Pencairan Dana */}
                        <div className="md:col-span-2 relative pb-2">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Pilih Dokumen RKA (Gabungan Pencairan) *
                            </label>
                            <CustomSelect
                                value={selectedPencairanId}
                                onChange={(val) => {
                                    const rawVal = val?.target ? val.target.value : val;
                                    setSelectedPencairanId(rawVal);
                                    if (formErrors.selectedPencairanId) setFormErrors(prev => ({ ...prev, selectedPencairanId: null }));
                                }}
                                isDisabled={!!editingLpj}
                                options={[
                                    { value: '', label: 'Pilih Dokumen RKA yang Disetujui' },
                                    ...availablePencairans.map(p => ({
                                        value: (p.id_header || p.id_pencairan).toString(),
                                        label: `${p.nomor_dokumen_rkat} - ${p.unit_name} (${p.total_tahap || 1} Tahap Pencairan) - Total: ${formatCurrency(p.total_pencairan)}`
                                    }))
                                ]}
                            />
                            <FieldTooltipError message={formErrors.selectedPencairanId} />
                        </div>

                        {/* Judul LPJ */}
                        <div className="md:col-span-2 relative pb-2">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Judul LPJ / Nama Kegiatan *
                            </label>
                            <input
                                type="text"
                                value={judulLpj}
                                onChange={(e) => {
                                    setJudulLpj(e.target.value);
                                    if (formErrors.judulLpj) setFormErrors(prev => ({ ...prev, judulLpj: null }));
                                }}
                                placeholder="Contoh: LPJ Pelatihan Sertifikasi Kompetensi Dosen"
                                className={`h-11 w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border rounded-xl shadow-sm focus:ring-2 text-gray-900 dark:text-white transition ${
                                    formErrors.judulLpj
                                        ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500'
                                        : 'border-gray-200 dark:border-gray-700 focus:ring-teal-500 focus:border-teal-500'
                                }`}
                            />
                            <FieldTooltipError message={formErrors.judulLpj} />
                        </div>

                        {/* Tanggal Laporan */}
                        <div className="relative pb-2">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Tanggal Laporan LPJ *
                            </label>
                            <DateInput
                                id="tanggal_lpj"
                                value={tanggalLpj}
                                onChange={(val) => {
                                    setTanggalLpj(val);
                                    if (formErrors.tanggalLpj) setFormErrors(prev => ({ ...prev, tanggalLpj: null }));
                                }}
                                position="right"
                                className="w-full"
                            />
                            <FieldTooltipError message={formErrors.tanggalLpj} />
                        </div>

                        {/* Lokasi Kegiatan */}
                        <div className="relative pb-2">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Lokasi Pelaksanaan Kegiatan *
                            </label>
                            <input
                                type="text"
                                value={lokasi}
                                onChange={(e) => {
                                    setLokasi(e.target.value);
                                    if (formErrors.lokasi) setFormErrors(prev => ({ ...prev, lokasi: null }));
                                }}
                                placeholder="Contoh: Aula Kampus A / Zoom Meeting"
                                className={`h-11 w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border rounded-xl shadow-sm focus:ring-2 text-gray-900 dark:text-white transition ${
                                    formErrors.lokasi
                                        ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500'
                                        : 'border-gray-200 dark:border-gray-700 focus:ring-teal-500 focus:border-teal-500'
                                }`}
                            />
                            <FieldTooltipError message={formErrors.lokasi} />
                        </div>

                        {/* Tanggal Pelaksanaan Mulai & Selesai */}
                        <div className="relative pb-2">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Tanggal Mulai Kegiatan *
                            </label>
                            <DateInput
                                id="tanggal_pelaksanaan_mulai"
                                value={tglMulai}
                                onChange={(val) => {
                                    setTglMulai(val);
                                    if (formErrors.tglMulai) setFormErrors(prev => ({ ...prev, tglMulai: null }));
                                }}
                                position="right"
                                className="w-full"
                            />
                            <FieldTooltipError message={formErrors.tglMulai} />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                                Tanggal Selesai Kegiatan *
                            </label>
                            <DateInput
                                id="tanggal_pelaksanaan_selesai"
                                value={tglSelesai}
                                onChange={(val) => {
                                    setTglSelesai(val);
                                    if (formErrors.tglSelesai) setFormErrors(prev => ({ ...prev, tglSelesai: null }));
                                }}
                                position="right"
                                className="w-full"
                            />
                            <FieldTooltipError message={formErrors.tglSelesai} />
                        </div>
                    </div>

                    {/* Tabel Realisasi Per Item */}
                    {itemsForm.length > 0 && (
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <Receipt className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                                    <span>Rincian Realisasi Anggaran Pengeluaran</span>
                                </h4>
                                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    * Isikan volume & nominal sesuai nota realisasi sesungguhnya
                                </span>
                            </div>

                            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                                <table className="w-full text-xs text-left text-gray-600 dark:text-gray-300">
                                    <thead className="text-[11px] uppercase bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                                        <tr>
                                            <th className="py-3 px-3">No</th>
                                            <th className="py-3 px-3">Deskripsi Item / Satuan</th>
                                            <th className="py-3 px-3 text-center bg-blue-50/50 dark:bg-blue-950/30">Vol Cair</th>
                                            <th className="py-3 px-3 text-right bg-blue-50/50 dark:bg-blue-950/30">Total Cair</th>
                                            <th className="py-3 px-3 text-center bg-teal-50/50 dark:bg-teal-950/30 w-24">Vol Realisasi</th>
                                            <th className="py-3 px-3 text-right bg-teal-50/50 dark:bg-teal-950/30 w-36">Harga Realisasi</th>
                                            <th className="py-3 px-3 text-right bg-teal-50/50 dark:bg-teal-950/30">Total Realisasi</th>
                                            <th className="py-3 px-3 text-right">Selisih</th>
                                            <th className="py-3 px-3 w-48">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-900">
                                        {itemsForm.map((item, idx) => {
                                            const subtotalReal = parseNonNegativeFloat(item.volume_realisasi) * parseNonNegativeFloat(item.harga_satuan_realisasi);
                                            const selisih = (parseFloat(item.sub_total_pencairan) || 0) - subtotalReal;

                                            return (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white">{idx + 1}</td>
                                                    <td className="py-2.5 px-3">
                                                        <div className="font-semibold text-gray-900 dark:text-white">{item.deskripsi_item}</div>
                                                        <div className="text-[10px] text-gray-400">{item.satuan}</div>
                                                    </td>
                                                    <td className="py-2.5 px-3 text-center font-medium bg-blue-50/20 dark:bg-blue-950/10">
                                                        {item.volume_pencairan}
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-medium bg-blue-50/20 dark:bg-blue-950/10">
                                                        {formatCurrency(item.sub_total_pencairan)}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="any"
                                                            value={item.volume_realisasi}
                                                            onKeyDown={handleNumberKeyDown}
                                                            onChange={(e) => handleItemChange(idx, 'volume_realisasi', e.target.value)}
                                                            className="w-full text-center py-1 px-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-teal-500"
                                                        />
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="any"
                                                            value={item.harga_satuan_realisasi}
                                                            onKeyDown={handleNumberKeyDown}
                                                            onChange={(e) => handleItemChange(idx, 'harga_satuan_realisasi', e.target.value)}
                                                            className="w-full text-right py-1 px-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-teal-500"
                                                        />
                                                    </td>
                                                    <td className="py-2.5 px-3 text-right font-bold text-gray-900 dark:text-white">
                                                        {formatCurrency(subtotalReal)}
                                                    </td>
                                                    <td className={`py-2.5 px-3 text-right font-semibold ${selisih < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                                        {formatCurrency(selisih)}
                                                    </td>
                                                    <td className="py-2.5 px-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Keterangan / Catatan..."
                                                            value={item.nomor_kwitansi}
                                                            onChange={(e) => handleItemChange(idx, 'nomor_kwitansi', e.target.value)}
                                                            className="w-full py-1 px-2 text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-teal-500"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Ringkasan Anggaran Footbar */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">Total Dana Dicairkan:</span>
                            <span className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(totalPencairanModal)}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">Total Realisasi Pengeluaran:</span>
                            <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(totalRealisasiModal)}</span>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 block">Sisa Pengembalian / Defisit:</span>
                            <span className={`text-base font-bold ${totalSisaModal < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                {formatCurrency(totalSisaModal)}
                            </span>
                        </div>
                    </div>

                    {/* Ringkasan & Catatan Kegiatan */}
                    <div className="relative pb-2">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                            Ringkasan Laporan & Evaluasi Kegiatan *
                        </label>
                        <textarea
                            rows="3"
                            value={ringkasan}
                            onChange={(e) => {
                                setRingkasan(e.target.value);
                                if (formErrors.ringkasan) setFormErrors(prev => ({ ...prev, ringkasan: null }));
                            }}
                            placeholder="Tuliskan ringkasan singkat pelaksanaan kegiatan, pencapaian target, dan evaluasi..."
                            className={`w-full px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border rounded-xl shadow-sm focus:ring-2 text-gray-900 dark:text-white transition ${
                                formErrors.ringkasan
                                    ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500'
                                    : 'border-gray-200 dark:border-gray-700 focus:ring-teal-500 focus:border-teal-500'
                            }`}
                        ></textarea>
                        <FieldTooltipError message={formErrors.ringkasan} />
                    </div>

                    {/* Dokumen Bukti Link / File */}
                    <div className="space-y-2 relative pb-2">
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Lampiran Bukti Transaksi / Google Drive Link *
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Paste Link Dokumen Bukti (Misal: Google Drive / Dropbox PDF)"
                                value={newBuktiUrl}
                                onChange={(e) => {
                                    setNewBuktiUrl(e.target.value);
                                    if (formErrors.buktiList) setFormErrors(prev => ({ ...prev, buktiList: null }));
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        addBuktiItem();
                                        if (formErrors.buktiList) setFormErrors(prev => ({ ...prev, buktiList: null }));
                                    }
                                }}
                                className={`h-11 flex-1 px-4 py-2.5 text-sm bg-white dark:bg-gray-900 border rounded-xl shadow-sm text-gray-900 dark:text-white focus:ring-2 transition ${
                                    formErrors.buktiList
                                        ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500'
                                        : 'border-gray-200 dark:border-gray-700 focus:ring-teal-500'
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    addBuktiItem();
                                    if (formErrors.buktiList) setFormErrors(prev => ({ ...prev, buktiList: null }));
                                }}
                                className="h-11 px-5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 transition-all duration-200 active:scale-95 whitespace-nowrap"
                            >
                                + Tambah Link
                            </button>
                        </div>
                        <FieldTooltipError message={formErrors.buktiList} />
                        {buktiList.length > 0 && (
                            <ul className="space-y-1.5 mt-2">
                                {buktiList.map((url, i) => (
                                    <li key={i} className="flex items-center justify-between text-xs p-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-700/60">
                                        <a href={url} target="_blank" rel="noreferrer" className="text-teal-600 dark:text-teal-400 font-medium underline truncate max-w-md">
                                            {url}
                                        </a>
                                        <button type="button" onClick={() => removeBuktiItem(i)} className="text-rose-500 hover:text-rose-700 font-bold ml-2 p-1">
                                            ✕
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                        <button
                            type="button"
                            onClick={() => setIsCreateModalOpen(false)}
                            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 rounded-xl shadow-lg shadow-teal-600/20 transition"
                        >
                            Simpan Draft LPJ
                        </button>
                    </div>
                </form>
            </Modal>

            {/* --- MODAL DETAIL LPJ PREVIEW --- */}
            <Modal show={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} maxWidth="3xl">
                {selectedLpjDetail && (
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <FileCheck2 className="w-5 h-5 text-teal-600" />
                                    <span>{selectedLpjDetail.nomor_lpj}</span>
                                </h3>
                                <p className="text-xs text-gray-500">{selectedLpjDetail.judul_lpj}</p>
                            </div>
                            {getStatusBadge(selectedLpjDetail.status_lpj)}
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-1">
                                <span className="text-gray-400 block">Unit Kerja:</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {selectedLpjDetail.rkat_header?.unit?.nama_unit || selectedLpjDetail.pencairan_dana?.rkat_header?.unit?.nama_unit || '-'}
                                </span>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-1">
                                <span className="text-gray-400 block">Tanggal Laporan:</span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {formatDate(selectedLpjDetail.tanggal_lpj)}
                                </span>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-1">
                                <span className="text-gray-400 block">Total Realisasi Belanja:</span>
                                <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                    {formatCurrency(selectedLpjDetail.total_realisasi)}
                                </span>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-1">
                                <span className="text-gray-400 block">Sisa Pengembalian Dana:</span>
                                <span className={`font-bold ${selectedLpjDetail.sisa_dana < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                    {formatCurrency(selectedLpjDetail.sisa_dana)}
                                </span>
                            </div>
                        </div>

                        {/* Catatan Revisi / Penolakan jika ada */}
                        {selectedLpjDetail.catatan && (
                            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs space-y-1">
                                <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                                    <AlertTriangle className="w-4 h-4" /> Catatan Approver:
                                </span>
                                <p className="text-amber-900 dark:text-amber-200">{selectedLpjDetail.catatan}</p>
                            </div>
                        )}

                        {/* Rincian Items */}
                        <div className="space-y-2">
                            <h4 className="font-bold text-xs uppercase text-gray-500">Rincian Item Realisasi</h4>
                            <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden text-xs">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-100 dark:bg-gray-900 font-semibold">
                                        <tr>
                                            <th className="p-2.5">Item</th>
                                            <th className="p-2.5 text-right">Vol</th>
                                            <th className="p-2.5 text-right">Harga Satuan</th>
                                            <th className="p-2.5 text-right">Total Realisasi</th>
                                            <th className="p-2.5">Keterangan</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {selectedLpjDetail.items?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="p-2.5 font-medium">
                                                    {item.pencairan_item?.rkat_rab_item?.deskripsi_item || 'Item'}
                                                </td>
                                                <td className="p-2.5 text-right">{item.volume_realisasi}</td>
                                                <td className="p-2.5 text-right">{formatCurrency(item.harga_satuan_realisasi)}</td>
                                                <td className="p-2.5 text-right font-bold">{formatCurrency(item.sub_total_realisasi)}</td>
                                                <td className="p-2.5 text-gray-500">{item.nomor_kwitansi || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-4">
                            <a
                                href={route('lpj.export', selectedLpjDetail.id_lpj)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-semibold rounded-xl transition"
                            >
                                <FileDown className="w-4 h-4" /> Download PDF Resmi
                            </a>

                            <button
                                type="button"
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- MODAL APPROVAL ACTION --- */}
            <GlobalApprovalModal
                show={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                title="Persetujuan Laporan Pertanggungjawaban"
                documentNumber={targetLpjForApproval?.nomor_lpj}
                documentTitle={targetLpjForApproval?.judul_lpj}
                details={targetLpjForApproval ? [
                    { label: 'Unit Kerja', value: targetLpjForApproval.pencairan_dana?.rkat_header?.unit?.nama_unit || '-' },
                    { label: 'Tanggal LPJ', value: formatDate(targetLpjForApproval.tanggal_lpj) },
                    { label: 'Total Realisasi', value: formatCurrency(targetLpjForApproval.total_realisasi) },
                    { label: 'Sisa Pengembalian', value: formatCurrency(targetLpjForApproval.sisa_dana) }
                ] : []}
                onConfirm={({ action, catatan }) => {
                    const toastId = toast.loading('Sedang memproses persetujuan LPJ...');
                    router.post(route('lpj.approve', targetLpjForApproval.id_lpj), {
                        aksi: action,
                        catatan: catatan
                    }, {
                        onSuccess: () => {
                            setIsApproveModalOpen(false);
                            setTargetLpjForApproval(null);
                            toast.success(`LPJ berhasil di-${action.toLowerCase()}.`, { id: toastId });
                        },
                        onError: () => {
                            toast.error('Gagal memproses persetujuan LPJ.', { id: toastId });
                        }
                    });
                }}
            />
        </AuthenticatedLayout>
    );
}
