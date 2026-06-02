import React, { useState, useEffect, Component } from 'react';

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
                    <h2 className="text-xl font-bold text-red-700 mb-4">A Component Crashed</h2>
                    <pre className="p-4 bg-white rounded border border-red-100 text-red-600 text-sm overflow-x-auto">
                        {this.state.error && this.state.error.toString()}
                    </pre>
                    <pre className="mt-4 p-4 bg-white rounded border border-red-100 text-red-500 text-xs overflow-x-auto">
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, Search, Send, Edit2, FileDown, Eye, Save, Info } from 'lucide-react';
import CustomSelect from '@/Components/CustomSelect';
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

export default function Index(props) {
    return (
        <ErrorBoundary>
            <IndexContent {...props} />
        </ErrorBoundary>
    );
}

function IndexContent({ auth, pencairans, filters, tahunAnggarans, units = [], flash = {}, statuses = [], rkatList = [] }) {
    const { isAdmin } = usePermission();
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [tahun, setTahun] = useState(filters?.tahun || '');
    const [status, setStatus] = useState(filters?.status || '');
    const [unitId, setUnitId] = useState(filters?.unit_id || '');
    const [perPage, setPerPage] = useState(filters?.per_page || '15');

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingPencairanObj, setEditingPencairanObj] = useState(null);
    const [selectedHeaderId, setSelectedHeaderId] = useState('');
    const [namaPencairan, setNamaPencairan] = useState('');
    const [items, setItems] = useState([]);

    const getStatusColor = (status) => {
        if (!status) return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
        const s = status.toLowerCase();
        if (s.includes('disetujui_final') || s.includes('disetujui final')) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
        if (s.includes('ditolak')) return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
        if (s.includes('revisi')) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        if (s.includes('draft')) return 'bg-gray-200 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300';
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    };

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    useEffect(() => {
        if (selectedHeaderId) {
            const selectedRkat = rkatList.find(r => r.id_header === parseInt(selectedHeaderId));
            if (selectedRkat && selectedRkat.rab_items) {
                setItems(selectedRkat.rab_items.map(item => {
                    let volumePencairan = 0;
                    let nominalPencairan = item.harga_satuan;
                    let isSelected = false;
                    let remainingVol = item.remaining_volume;
                    let remainingNom = item.remaining_nominal;

                    if (editingPencairanObj && editingPencairanObj.items) {
                        const editItem = editingPencairanObj.items.find(i => i.id_rkat_rab_item === item.id);
                        if (editItem) {
                            volumePencairan = parseFloat(editItem.volume_pencairan);
                            nominalPencairan = parseFloat(editItem.nominal_pencairan);
                            isSelected = true;
                            remainingVol += volumePencairan;
                            remainingNom += parseFloat(editItem.sub_total_pencairan);
                        }
                    }

                    return {
                        ...item,
                        remaining_volume: remainingVol,
                        remaining_nominal: remainingNom,
                        volume_pencairan: volumePencairan,
                        nominal_pencairan: nominalPencairan,
                        is_selected: isSelected
                    };
                }));
            } else {
                setItems([]);
            }
        } else {
            setItems([]);
        }
    }, [selectedHeaderId, rkatList, editingPencairanObj]);

    const handleItemChange = (id, field, value) => {
        setItems(items.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        }));
    };

    const toggleItem = (id) => {
        setItems(items.map(item => {
            if (item.id === id) {
                return { ...item, is_selected: !item.is_selected, volume_pencairan: !item.is_selected ? item.remaining_volume : 0 };
            }
            return item;
        }));
    };

    const handleSubmitCreate = (e) => {
        e.preventDefault();
        
        if (!selectedHeaderId) {
            toast.error('Pilih RKAT terlebih dahulu');
            return;
        }

        if (!namaPencairan.trim()) {
            toast.error('Masukkan nama pencairan (Misal: Tahap 1)');
            return;
        }

        const selectedItems = items.filter(i => i.is_selected && i.volume_pencairan > 0);
        
        if (selectedItems.length === 0) {
            toast.error('Pilih minimal 1 item untuk dicairkan dan tentukan volumenya');
            return;
        }

        const payload = {
            id_header: selectedHeaderId,
            nama_pencairan: namaPencairan,
            items: selectedItems.map(i => ({
                id: i.id,
                volume_pencairan: parseFloat(i.volume_pencairan),
                nominal_pencairan: parseFloat(i.nominal_pencairan)
            }))
        };

        const totalCair = selectedItems.reduce((sum, item) => sum + (parseFloat(item.volume_pencairan) * parseFloat(item.nominal_pencairan)), 0);

        toast("Konfirmasi Simpan", {
            description: `Yakin ingin menyimpan pengajuan pencairan ini? Total pencairan adalah ${formatCurrency(totalCair)}.`,
            action: {
                label: "Ya, Simpan",
                onClick: () => {
                    const toastId = toast.loading('Sedang menyimpan draft pencairan...');
                    const submitRoute = editingPencairanObj 
                        ? route('pencairan.update', editingPencairanObj.uuid || editingPencairanObj.id_pencairan)
                        : route('pencairan.store');
                    
                    const method = editingPencairanObj ? 'put' : 'post';

                    router[method](submitRoute, payload, {
                        onSuccess: () => {
                            toast.success("Berhasil disimpan!", { id: toastId, description: "Pengajuan pencairan telah berhasil disimpan." });
                            setIsCreateModalOpen(false);
                            setEditingPencairanObj(null);
                            setSelectedHeaderId('');
                            setNamaPencairan('');
                            setItems([]);
                        },
                        onError: (err) => {
                            console.error("Error:", err);
                            toast.error("Gagal Menyimpan", { id: toastId, description: "Terdapat kesalahan saat menyimpan." });
                        },
                        onFinish: () => {
                            toast.dismiss(toastId);
                        }
                    });
                }
            }
        });
    };

    const applyFilters = (newSearch, newTahun, newStatus, newUnitId, newPerPage) => {
        router.get(
            route('pencairan.index'),
            { search: newSearch, tahun: newTahun, status: newStatus, unit_id: newUnitId, per_page: newPerPage },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== (filters?.search || '') || perPage !== (filters?.per_page || '15')) {
                applyFilters(searchTerm, tahun, status, unitId, perPage);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, perPage]);

    const handleFilterChange = (filterType, value) => {
        if (filterType === 'tahun') {
            setTahun(value);
            applyFilters(searchTerm, value, status, unitId, perPage);
        } else if (filterType === 'status') {
            setStatus(value);
            applyFilters(searchTerm, tahun, value, unitId, perPage);
        } else if (filterType === 'unit_id') {
            setUnitId(value);
            applyFilters(searchTerm, tahun, status, value, perPage);
        }
    };

    const handleEdit = (item) => {
        setEditingPencairanObj(item);
        setSelectedHeaderId(item.id_header);
        setNamaPencairan(item.nama_pencairan);
        setIsCreateModalOpen(true);
    };

    const handleAjukan = (item) => {
        toast("Konfirmasi Pengajuan", {
            description: "Apakah Anda yakin ingin mengajukan pencairan ini?",
            action: {
                label: "Ya, Ajukan",
                onClick: () => {
                    const toastId = toast.loading("Sedang mengirim pengajuan...");
                    router.post(route('pencairan.submit', item.uuid || item.id_pencairan), {}, {
                        onFinish: () => {
                            toast.dismiss(toastId);
                        }
                    });
                }
            },
            cancel: {
                label: "Batal"
            }
        });
    };

    const isLocked = !!flash.error;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Daftar Pencairan Dana</h2>}
        >
            <Head title="Daftar Pencairan Dana" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Pencairan Dana
                    </h1>

                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-teal-500 mb-6">
                        <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
                            <div className="relative w-full lg:flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Cari nomor dokumen rkat atau unit..."
                                    className="pl-10 h-11 block w-full bg-gray-50 border-gray-200 rounded-lg focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <div className="flex-1 min-w-[140px] lg:w-36">
                                    <CustomSelect
                                        value={tahun}
                                        onChange={(e) => handleFilterChange('tahun', e.target.value)}
                                        className="h-11"
                                        options={[
                                            { value: '', label: 'Semua Tahun' },
                                            ...(tahunAnggarans || []).map(th => ({ value: th, label: th }))
                                        ]}
                                    />
                                </div>

                                {isAdmin() && units.length > 0 && (
                                    <div className="flex-1 min-w-[200px] lg:w-56">
                                        <CustomSelect
                                            value={unitId}
                                            onChange={(e) => handleFilterChange('unit_id', e.target.value)}
                                            className="h-11"
                                            options={[
                                                { value: '', label: 'Semua Unit Kerja' },
                                                ...units.map(u => ({ value: u.id_unit, label: u.nama_unit }))
                                            ]}
                                        />
                                    </div>
                                )}

                                <div className="flex-1 min-w-[160px] lg:w-44">
                                    <CustomSelect
                                        value={status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="h-11"
                                        options={[
                                            { value: '', label: 'Semua Status' },
                                            ...(statuses || []).map(s => ({
                                                value: s,
                                                label: (s || '').replace(/_/g, ' ')
                                            }))
                                        ]}
                                    />
                                </div>

                                <button
                                    onClick={() => {
                                        if (!isLocked) setIsCreateModalOpen(true);
                                    }}
                                    className={`h-11 inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap shadow-md ${isLocked
                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'bg-teal-600 hover:bg-teal-700 text-white active:scale-95'
                                        }`}
                                >
                                    <Plus size={18} />
                                    Baru
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Pagination */}
                    {pencairans.links && pencairans.links.length > 3 && (
                        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Tampilkan</span>
                                    <div className="w-20">
                                        <CustomSelect
                                            value={perPage}
                                            onChange={(e) => setPerPage(e.target.value)}
                                            options={[
                                                { value: '10', label: '10' },
                                                { value: '15', label: '15' },
                                                { value: '25', label: '25' },
                                                { value: '50', label: '50' },
                                                { value: '100', label: '100' },
                                                { value: 'all', label: 'Semua' }
                                            ]}
                                            className="h-8 text-xs py-1 px-2"
                                        />
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{pencairans.from || 0}</span> sampai <span className="font-semibold text-gray-900 dark:text-white">{pencairans.to || 0}</span> dari <span className="font-semibold text-gray-900 dark:text-white">{pencairans.total || 0}</span> data
                                </div>
                            </div>
                            <div className="flex flex-wrap shadow-sm rounded-md">
                                {pencairans.links.map((link, key) => (
                                    <Link
                                        key={key}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 text-sm border ${link.active ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'} ${!link.url ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 mt-4">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">No</th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Nomor RKAT</th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Unit</th>
                                        <th className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Status</th>
                                        <th className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Tgl Pengajuan</th>
                                        <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {pencairans.data && pencairans.data.length > 0 ? pencairans.data.map((item, index) => (
                                        <tr key={item.id_pencairan} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 text-center font-medium text-gray-900 dark:text-white">{pencairans.from + index}</td>
                                            <td className="px-6 py-4 font-medium">
                                                {item.rkat_header ? (
                                                    <Link 
                                                        href={route('daftar-ajuan.show', item.rkat_header.uuid)}
                                                        className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline transition-colors"
                                                    >
                                                        {item.rkat_header.nomor_dokumen}
                                                    </Link>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-850 dark:text-gray-300">{item.rkat_header?.unit?.nama_unit || '-'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 inline-flex whitespace-nowrap text-xs leading-5 font-bold rounded-md ${getStatusColor(item.status_pencairan)}`}>
                                                    {(item.status_pencairan || '').replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-850 dark:text-gray-300">{formatDate(item.tanggal_pengajuan)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Link
                                                                    href={route('pencairan.show', item.uuid || item.id_pencairan)}
                                                                    className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                                                                >
                                                                    <Eye size={16} />
                                                                </Link>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Detail Pencairan</TooltipContent>
                                                        </Tooltip>
 
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <a
                                                                    href={route('pencairan.export', item.uuid || item.id_pencairan)}
                                                                    target="_blank"
                                                                    className="inline-flex items-center justify-center w-8 h-8 border border-blue-300 rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 dark:bg-gray-700 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-900/20 transition-colors"
                                                                >
                                                                    <FileDown size={16} />
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Export PDF</TooltipContent>
                                                        </Tooltip>
 
                                                        {(item.status_pencairan === 'Draft' || item.status_pencairan === 'Revisi') && (isAdmin() || auth.user.id_user == item.diajukan_oleh) && (
                                                            <>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button
                                                                            onClick={() => handleEdit(item)}
                                                                            className="inline-flex items-center justify-center w-8 h-8 border border-yellow-300 rounded-md shadow-sm text-yellow-700 bg-white hover:bg-yellow-50 dark:bg-gray-700 dark:text-yellow-400 dark:border-yellow-900/50 dark:hover:bg-yellow-900/20 transition-colors"
                                                                        >
                                                                            <Edit2 size={16} />
                                                                        </button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Edit Pencairan</TooltipContent>
                                                                </Tooltip>
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <button
                                                                            onClick={() => handleAjukan(item)}
                                                                            className="inline-flex items-center justify-center w-8 h-8 bg-teal-600 text-white rounded-md shadow-sm hover:bg-teal-700 transition"
                                                                        >
                                                                        <Send size={16} />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Ajukan Pencairan</TooltipContent>
                                                            </Tooltip>
                                                            </>
                                                        )}
                                                    </TooltipProvider>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                Tidak ada data pencairan yang sesuai.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} maxWidth="5xl">
                <div className="p-6">
                    <div className="mb-4 flex items-center justify-between pb-3">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pengajuan Pencairan Dana</h3>
                        <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Close</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-lg flex gap-3 text-sm">
                        <Info className="shrink-0 mt-0.5" size={18} />
                        <div>
                            <p className="font-semibold mb-1">Pencairan Bertahap</p>
                            <p>Anda dapat mengajukan pencairan dana berkali-kali untuk RKAT yang sama, selama sisa anggaran item belum habis dicairkan. Pilih item dan tentukan volume yang ingin dicairkan pada tahap ini.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitCreate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Dokumen RKAT
                                </label>
                                <CustomSelect
                                    value={selectedHeaderId}
                                    onChange={(e) => setSelectedHeaderId(e.target.value)}
                                    options={[
                                        { value: '', label: '- Pilih RKAT -' },
                                        ...(rkatList || []).map(r => ({
                                            value: r.id_header,
                                            label: `${r.nomor_dokumen} - ${r.unit?.nama_unit} (Sisa: ${formatCurrency(r.sisa_anggaran)})`
                                        }))
                                    ]}
                                    className="h-11"
                                />
                                {rkatList?.length === 0 && (
                                    <p className="mt-2 text-sm text-red-500">Tidak ada RKAT yang memenuhi syarat pencairan saat ini (Sisa anggaran sudah habis atau tidak ada RKAT).</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nama/Keterangan Pencairan <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={namaPencairan}
                                    onChange={(e) => setNamaPencairan(e.target.value)}
                                    placeholder="Contoh: Pencairan Tahap 1"
                                    className="h-11 w-full rounded-md text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 dark:bg-gray-900 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                                    required
                                />
                            </div>
                        </div>

                        {items.length > 0 && (
                            <div className="mt-8">
                                <h4 className="text-md font-bold text-gray-900 dark:text-white mb-4 pb-2">Rincian Item yang Dicairkan</h4>
                                <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                        <thead className="bg-gray-50 dark:bg-gray-700">
                                            <tr>
                                                <th className="px-4 py-3 text-left w-12 text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Pilih</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Item & Harga Satuan Asli</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Sisa Volume (Max)</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Volume Dicairkan</th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Harga Satuan Pencairan</th>
                                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider">Sub Total Cair</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {items.map((item) => (
                                                <tr key={item.id} className={item.is_selected ? 'bg-teal-50 dark:bg-teal-900/10' : ''}>
                                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.is_selected}
                                                            onChange={() => toggleItem(item.id)}
                                                            className="w-4 h-4 text-teal-600 rounded border-gray-300 focus:ring-teal-500 cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="font-medium text-gray-900 dark:text-gray-100">{item.deskripsi_item}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatCurrency(item.harga_satuan)}</div>
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                                                        <span className="font-semibold">{item.remaining_volume}</span> (dari total {item.volume})
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={item.remaining_volume}
                                                            step="any"
                                                            value={item.volume_pencairan}
                                                            onChange={(e) => handleItemChange(item.id, 'volume_pencairan', e.target.value)}
                                                            disabled={!item.is_selected}
                                                            className="w-24 rounded-md text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm disabled:opacity-50"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={item.nominal_pencairan}
                                                            onChange={(e) => handleItemChange(item.id, 'nominal_pencairan', e.target.value)}
                                                            disabled={!item.is_selected}
                                                            className="w-32 rounded-md text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm disabled:opacity-50"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-4 whitespace-nowrap text-right font-bold text-gray-900 dark:text-white">
                                                        {formatCurrency((parseFloat(item.volume_pencairan) || 0) * (parseFloat(item.nominal_pencairan) || 0))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                                            <tr>
                                                <td colSpan="5" className="px-4 py-4 text-right font-bold text-gray-700 dark:text-gray-300">Total Pengajuan Tahap Ini:</td>
                                                <td className="px-4 py-4 text-right font-bold text-teal-600 dark:text-teal-400 text-lg">
                                                    {formatCurrency(items.filter(i => i.is_selected).reduce((sum, item) => sum + ((parseFloat(item.volume_pencairan) || 0) * (parseFloat(item.nominal_pencairan) || 0)), 0))}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-700 mt-6 gap-3">
                            <button
                                type="button"
                                onClick={() => setIsCreateModalOpen(false)}
                                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-bold"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={!selectedHeaderId || items.filter(i => i.is_selected).length === 0}
                                className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-bold transition-all shadow-md ${(!selectedHeaderId || items.filter(i => i.is_selected).length === 0) ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:shadow-lg active:scale-95'}`}
                            >
                                <Save size={18} />
                                Ajukan Pencairan Dana
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
