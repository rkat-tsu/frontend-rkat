import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import CustomSelect from '@/Components/CustomSelect'; 
import DateInput from '@/Components/DateInput';
import { CalendarPlus, Save, ArrowLeft, CalendarClock } from 'lucide-react';
import { toast } from 'sonner';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        tahun_anggaran: '',
        status_rkat: 'Drafting',
        tanggal_mulai: '',
        tanggal_akhir: '',
    });

    const submit = (e) => {
        e.preventDefault();

        if (!data.tahun_anggaran || !data.status_rkat || !data.tanggal_mulai || !data.tanggal_akhir) {
            toast.error("Peringatan", { description: "Semua form wajib diisi." });
            return;
        }

        const toastId = toast.loading("Sedang menyimpan data...");
        post(route('tahun.store'), {
            onSuccess: () => toast.success("Berhasil", { id: toastId, description: "Tahun Anggaran baru berhasil ditambahkan." }),
            onError: () => toast.error("Gagal Menyimpan", { id: toastId, description: "Terdapat kesalahan saat menyimpan data." })
        });
    };

    const statusOptions = [
        { value: 'Drafting', label: 'Drafting (Penyusunan)' },
        { value: 'Submission', label: 'Submission (Pengajuan)' },
        { value: 'Approved', label: 'Approved (Disetujui)' },
        { value: 'Closed', label: 'Closed (Ditutup)' },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tambah Tahun Anggaran</h2>}
        >
            <Head title="Buat Tahun Anggaran" />

            <div className="py-6 pb-40"> 
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    
                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* --- KONTAINER UTAMA --- */}
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-teal-500">
                            
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                                    <CalendarPlus className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Periode Anggaran Baru
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Tentukan tahun dan masa berlaku pengajuan RKAT.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Baris 1: Tahun & Status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="relative z-0"> {/* z-0 agar tidak menimpa tanggal */}
                                        <InputLabel htmlFor="tahun_anggaran" value="Tahun Anggaran" required />
                                        <TextInput
                                            id="tahun_anggaran"
                                            type="number"
                                            value={data.tahun_anggaran}
                                            onChange={(e) => setData('tahun_anggaran', e.target.value)}
                                            className="mt-1 block w-full"
                                            placeholder="Masukkan tahun anggaran"
                                            isFocused={true}
                                        />
                                        <InputError message={errors.tahun_anggaran} className="mt-2" />
                                    </div>

                                    <div className="relative z-0">
                                        <InputLabel value="Status Awal" required />
                                        <CustomSelect
                                            value={data.status_rkat}
                                            onChange={(e) => setData('status_rkat', e.target.value)}
                                            options={statusOptions}
                                            placeholder="Pilih Status"
                                            className="mt-1"
                                        />
                                        <InputError message={errors.status_rkat} className="mt-2" />
                                    </div>
                                </div>

                                {/* Divider Visual */}
                                <div className="border-t border-gray-100 dark:border-gray-700/50 pt-6 mt-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <CalendarClock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Durasi Pelaksanaan</span>
                                    </div>

                                    {/* Baris 2: Tanggal Mulai & Akhir */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <InputLabel value="Tanggal Mulai" required />
                                            {/* Z-INDEX FIX: z-50 agar di atas footer */}
                                            <div className="mt-1 relative z-50"> 
                                                <DateInput
                                                    value={data.tanggal_mulai}
                                                    onChange={(val) => setData('tanggal_mulai', val)}
                                                    placeholder="Pilih tanggal mulai..."
                                                    position="right"
                                                />
                                            </div>
                                            <InputError message={errors.tanggal_mulai} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel value="Tanggal Selesai" required />
                                            {/* Z-INDEX FIX: z-40 agar di atas footer */}
                                            <div className="mt-1 relative z-40">
                                                <DateInput
                                                    value={data.tanggal_akhir}
                                                    onChange={(val) => setData('tanggal_akhir', val)}
                                                    placeholder="Pilih tanggal selesai..."
                                                    position="left"
                                                />
                                            </div>
                                            <InputError message={errors.tanggal_akhir} className="mt-2" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- TOMBOL AKSI (STICKY) --- */}
                        <div className="sticky bottom-4 z-10 bg-white/90 dark:bg-gray-900 backdrop-blur-sm p-4 rounded-xl shadow-lg flex justify-between items-center">
                            <Link
                                href={route('tahun.index')}
                                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 text-sm flex items-center px-4 py-2"
                            >
                                <ArrowLeft size={16} className="mr-2" /> Kembali
                            </Link>
                            <div className="flex items-center gap-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-md shadow-lg shadow-teal-200/50 dark:shadow-teal-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                                >
                                    <Save size={18} className="mr-2" /> Simpan Data
                                </button>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}