import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Save, ArrowLeft, Info } from 'lucide-react';
import CustomSelect from '@/Components/CustomSelect';
import { toast } from 'sonner';

export default function Create({ auth, rkatList }) {
    const [selectedHeaderId, setSelectedHeaderId] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!selectedHeaderId) {
            toast.error('Pilih RKAT terlebih dahulu');
            return;
        }

        const toastId = toast.loading('Sedang menyimpan draft pencairan...');
        router.post(route('pencairan.store'), { id_header: selectedHeaderId }, {
            onFinish: () => {
                toast.dismiss(toastId);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pengajuan Pencairan Dana</h2>}
        >
            <Head title="Pengajuan Pencairan Dana" />

            <div className="py-6">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    
                    <div className="mb-4 flex items-center justify-between">
                        <Link href={route('pencairan.index')} className="text-teal-600 hover:text-teal-700 flex items-center gap-2">
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
                                <p>Anda hanya dapat mengajukan pencairan dana untuk dokumen RKAT yang telah mencapai status <strong>Disetujui Final</strong> dan belum pernah diajukan pencairannya.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
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
                                                label: `${r.nomor_dokumen} - ${r.unit?.nama_unit} (Anggaran: Rp ${r.total_anggaran?.toLocaleString('id-ID')})`
                                            }))
                                        ]}
                                    />
                                    {rkatList?.length === 0 && (
                                        <p className="mt-2 text-sm text-red-500">Tidak ada RKAT yang memenuhi syarat untuk pencairan saat ini.</p>
                                    )}
                                </div>

                                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <button
                                        type="submit"
                                        disabled={!selectedHeaderId}
                                        className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-bold transition-all shadow-md ${!selectedHeaderId ? 'bg-gray-400 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700 hover:shadow-lg active:scale-95'}`}
                                    >
                                        <Save size={18} />
                                        Simpan Draft Pencairan
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
