import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import CustomSelect from '@/Components/CustomSelect'; 
import { Building2, Save, ArrowLeft, Settings2, UserCircle, Phone, Mail, PencilLine } from 'lucide-react';
import { toast } from 'sonner';

export default function Edit({ auth, unit, users, units }) {
    // 1. SETUP FORM: Ganti 'put' menjadi 'patch'
    const { data, setData, patch, processing, errors } = useForm({
        kode_unit: unit.kode_unit || '',
        nama_unit: unit.nama_unit || '',
        tipe_unit: unit.tipe_unit || 'Unit',
        jalur_persetujuan: unit.jalur_persetujuan || 'non-akademik',
        id_kepala: unit.id_kepala || '',
        parent_id: unit.parent_id || '',
        no_telepon: unit.no_telepon || '',
        email: unit.email || '',
    });

    const submit = (e) => {
        e.preventDefault();

        if (!data.kode_unit || !data.nama_unit || !data.tipe_unit || !data.jalur_persetujuan) {
            toast.error("Peringatan", { description: "Semua form bertanda * wajib diisi." });
            return;
        }

        const toastId = toast.loading("Sedang memperbarui data...");
        patch(route('unit.update', unit.id_unit), {
            onSuccess: () => toast.success("Berhasil", { id: toastId, description: "Data Unit Kerja berhasil diperbarui." }),
            onError: () => toast.error("Gagal Memperbarui", { id: toastId, description: "Terdapat kesalahan saat memperbarui data." })
        });
    };

    // 2. OPSI DROPDOWN
    const tipeOptions = [
        { value: 'Fakultas', label: 'Fakultas' },
        { value: 'Prodi', label: 'Program Studi (Prodi)' },
        { value: 'Unit', label: 'Unit Kerja' },
        { value: 'Lainnya', label: 'Lainnya' },
        { value: 'Atasan', label: 'Pimpinan / Atasan' },
        { value: 'Admin', label: 'Administrator' },
    ];

    const jalurOptions = [
        { value: 'akademik', label: 'Akademik' },
        { value: 'non-akademik', label: 'Non-Akademik' },
    ];

    const userOptions = users.map(u => ({ value: u.id_user, label: u.nama_lengkap }));
    
    const parentOptions = units
        .filter(u => u.id_unit !== unit.id_unit)
        .map(u => ({ value: u.id_unit, label: `${u.kode_unit} - ${u.nama_unit}` }));

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Unit Kerja</h2>}
        >
            <Head title={`Edit ${data.nama_unit}`} />

            <div className="py-6 pb-24">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    
                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* --- KONTAINER 1: IDENTITAS UTAMA --- */}
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-teal-500">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                                    <PencilLine className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Edit Identitas Unit</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Perbarui informasi dasar unit kerja.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel value="Kode Unit" required />
                                    <TextInput
                                        value={data.kode_unit}
                                        onChange={(e) => setData('kode_unit', e.target.value)}
                                        className="mt-1 block w-full bg-gray-50"
                                        placeholder="Cth: 1.01"
                                    />
                                    <InputError message={errors.kode_unit} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel value="Nama Unit Kerja" required />
                                    <TextInput
                                        value={data.nama_unit}
                                        onChange={(e) => setData('nama_unit', e.target.value)}
                                        className="mt-1 block w-full"
                                        placeholder="Cth: Biro Administrasi Umum"
                                    />
                                    <InputError message={errors.nama_unit} className="mt-2" />
                                </div>

                                {/* Parent Unit */}
                                <div className="md:col-span-2">
                                    <InputLabel value="Unit Induk (Parent)" />
                                    <CustomSelect
                                        value={data.parent_id}
                                        onChange={(e) => setData('parent_id', e.target.value)}
                                        options={parentOptions}
                                        placeholder="Pilih Unit Induk (Opsional)"
                                        className="mt-1"
                                    />
                                    <InputError message={errors.parent_id} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* --- KONTAINER 2: STRUKTUR & KONTAK --- */}
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-indigo-500">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                                    <UserCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Struktur & Kontak</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Pimpinan unit dan informasi kontak.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Kepala Unit */}
                                <div>
                                    <InputLabel value="Kepala Unit" />
                                    <CustomSelect
                                        value={data.id_kepala}
                                        onChange={(e) => setData('id_kepala', e.target.value)}
                                        options={userOptions}
                                        placeholder="Pilih Pejabat / Kepala Unit"
                                        className="mt-1"
                                    />
                                    <InputError message={errors.id_kepala} className="mt-2" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <InputLabel value="No. Telepon / WhatsApp" />
                                        <div className="relative mt-1">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <TextInput
                                                value={data.no_telepon}
                                                onChange={(e) => setData('no_telepon', e.target.value)}
                                                className="pl-10 block w-full"
                                                placeholder="Masukkan Nomor Telepon / WhatsApp"
                                            />
                                        </div>
                                        <InputError message={errors.no_telepon} className="mt-2" />
                                    </div>

                                    <div>
                                        <InputLabel value="Email Resmi" />
                                        <div className="relative mt-1">
                                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <TextInput
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="pl-10 block w-full"
                                                placeholder="Masukkan Email Resmi Unit"
                                            />
                                        </div>
                                        <InputError message={errors.email} className="mt-2" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- KONTAINER 3: KONFIGURASI SISTEM --- */}
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-gray-500">
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                    <Settings2 className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Konfigurasi Sistem</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Pengaturan tipe dan alur approval.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel value="Tipe Unit" required />
                                    <CustomSelect
                                        value={data.tipe_unit}
                                        onChange={(e) => setData('tipe_unit', e.target.value)}
                                        options={tipeOptions}
                                        placeholder="Pilih Tipe"
                                        className="mt-1"
                                    />
                                    <InputError message={errors.tipe_unit} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel value="Jalur Persetujuan" required />
                                    <CustomSelect
                                        value={data.jalur_persetujuan}
                                        onChange={(e) => setData('jalur_persetujuan', e.target.value)}
                                        options={jalurOptions}
                                        placeholder="Pilih Jalur"
                                        className="mt-1"
                                    />
                                    <InputError message={errors.jalur_persetujuan} className="mt-2" />
                                </div>
                            </div>
                        </div>

                        {/* --- TOMBOL AKSI --- */}
                        <div className="mt-6 flex items-center justify-end gap-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-200 dark:border-gray-700 sticky bottom-4 z-10">
                            <Link
                                href={route('unit.index')}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium text-sm flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            >
                                <ArrowLeft size={16} className="mr-2" /> Batal
                            </Link>
                            
                            <PrimaryButton disabled={processing} className="shadow-teal-200 hover:shadow-teal-400">
                                <Save size={16} className="mr-2" /> Simpan Perubahan
                            </PrimaryButton>
                        </div>

                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}