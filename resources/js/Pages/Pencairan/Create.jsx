import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Save, ArrowLeft, Info, Check, Calculator } from 'lucide-react';
import CustomSelect from '@/Components/CustomSelect';
import { toast } from 'sonner';

export default function Create({ auth, rkatList }) {
    const [selectedHeaderId, setSelectedHeaderId] = useState('');
    const [namaPencairan, setNamaPencairan] = useState('');
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (selectedHeaderId) {
            const selectedRkat = rkatList.find(r => r.id_header === parseInt(selectedHeaderId));
            if (selectedRkat && selectedRkat.rab_items) {
                setItems(selectedRkat.rab_items.map(item => ({
                    ...item,
                    volume_pencairan: 0,
                    nominal_pencairan: item.harga_satuan, // Default to unit price
                    is_selected: false
                })));
            } else {
                setItems([]);
            }
        } else {
            setItems([]);
        }
    }, [selectedHeaderId, rkatList]);

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

    const handleSubmit = (e) => {
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

        const toastId = toast.loading('Sedang menyimpan draft pencairan...');
        router.post(route('pencairan.store'), payload, {
            onFinish: () => {
                toast.dismiss(toastId);
            }
        });
    };

    const formatCurrency = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pengajuan Pencairan Dana</h2>}
        >
            <Head title="Pengajuan Pencairan Dana" />

            <div className="py-6">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-4 flex items-center justify-between">
                        <Link href={route('pencairan.index')} className="text-teal-600 hover:text-teal-700 flex items-center gap-2 font-medium">
                            <ArrowLeft size={16} /> Kembali
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex bg-gray-50 dark:bg-gray-700/50 items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pilih RKAT Disetujui Final</h3>
                        </div>

                        <div className="p-6">
                            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-4 rounded-lg flex gap-3 text-sm">
                                <Info className="shrink-0 mt-0.5" size={18} />
                                <div>
                                    <p className="font-semibold mb-1">Pencairan Bertahap</p>
                                    <p>Anda dapat mengajukan pencairan dana berkali-kali untuk RKAT yang sama, selama sisa anggaran item belum habis dicairkan. Pilih item dan tentukan volume yang ingin dicairkan pada tahap ini.</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
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
                                            className="w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                                            required
                                        />
                                    </div>
                                </div>

                                {items.length > 0 && (
                                    <div className="mt-8">
                                        <h4 className="text-md font-bold text-gray-900 dark:text-white mb-4 border-b pb-2">Rincian Item yang Dicairkan</h4>
                                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                                <thead className="bg-gray-50 dark:bg-gray-700">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left w-12 text-xs font-medium text-gray-500 uppercase tracking-wider">Pilih</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item & Harga Satuan Asli</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sisa Volume (Max)</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volume Dicairkan</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harga Satuan Pencairan</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Total Cair</th>
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
                                                                    className="w-24 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm disabled:opacity-50"
                                                                />
                                                            </td>
                                                            <td className="px-4 py-4 whitespace-nowrap">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={item.nominal_pencairan}
                                                                    onChange={(e) => handleItemChange(item.id, 'nominal_pencairan', e.target.value)}
                                                                    disabled={!item.is_selected}
                                                                    className="w-32 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-sm disabled:opacity-50"
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

                                <div className="flex justify-end pt-6 border-t border-gray-100 dark:border-gray-700 mt-6">
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
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
