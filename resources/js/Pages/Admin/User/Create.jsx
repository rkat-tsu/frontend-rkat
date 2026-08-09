import React, { useState } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import PasswordInput from '@/Components/PasswordInput';
import CustomSelect from '@/Components/CustomSelect'; 
import FieldTooltipError from '@/Components/FieldTooltipError';
import { UserPlus, Save, ArrowLeft, Shield, Building2, Lock, Phone, Mail, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Create({ auth, units = [] }) {
    const [formErrors, setFormErrors] = useState({});

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_lengkap: '',
        nik: '',
        username: '', // Field ini ada di state tapi tidak ditampilkan di form asli, dibiarkan saja
        email: '',
        peran: 'Inputer',
        password: '',
        password_confirmation: '',
        no_telepon: '',
        id_unit: '',
    });

    const handleFieldChange = (field, value) => {
        setData(field, value);
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const roleOptions = [
        { value: 'Inputer', label: 'Inputer (Staf/Operator)' },
        { value: 'Kaprodi', label: 'Kaprodi (Kepala Program Studi)' },
        { value: 'Kepala_Unit', label: 'Kepala Unit' },
        { value: 'Dekan', label: 'Dekan' },
        { value: 'Tim_Renbang', label: 'Tim Renbang' },
        { value: 'Rektor', label: 'Rektor' },
        { value: 'WR_1', label: 'Wakil Rektor 1' },
        { value: 'WR_2', label: 'Wakil Rektor 2' },
        { value: 'WR_3', label: 'Wakil Rektor 3' },
        { value: 'Admin', label: 'Administrator Sistem' },
    ];

    // Format Unit Options untuk CustomSelect
    const unitOptions = units.map(u => ({
        value: u.id_unit,
        label: u.kode_unit ? `${u.kode_unit} - ${u.nama_unit}` : u.nama_unit
    }));

    const submit = (e) => {
        e.preventDefault();

        const errs = {};
        if (!data.nama_lengkap) errs.nama_lengkap = 'Harap isi bidang ini.';
        if (!data.email) errs.email = 'Harap isi bidang ini.';
        if (!data.peran) errs.peran = 'Harap isi bidang ini.';
        if (!data.password) errs.password = 'Harap isi bidang ini.';
        if (!data.password_confirmation) errs.password_confirmation = 'Harap isi bidang ini.';

        if (Object.keys(errs).length > 0) {
            setFormErrors(errs);
            toast.error("Peringatan", { description: "Semua form wajib diisi." });
            return;
        }

        if (data.password !== data.password_confirmation) {
            setFormErrors({ password_confirmation: 'Password dan konfirmasi password tidak cocok.' });
            toast.error("Peringatan", { description: "Password dan konfirmasi password tidak cocok." });
            return;
        }

        setFormErrors({});
        toast.warning("Konfirmasi Simpan", {
            description: "Apakah Anda yakin ingin menyimpan user baru ini?",
            action: {
                label: "Ya, Simpan",
                onClick: () => {
                    const toastId = toast.loading("Sedang menyimpan data...");
                    post(route('user.store'), {
                        onSuccess: () => {
                            toast.success("Berhasil", { id: toastId, description: `User ${data.nama_lengkap} berhasil ditambahkan.` });
                        },
                        onError: (err) => {
                            toast.error("Gagal Menyimpan", { id: toastId, description: "Terdapat kesalahan saat menyimpan data." });
                        },
                        onFinish: () => reset('password', 'password_confirmation'),
                    });
                }
            },
            cancel: { label: "Batal" }
        });
    };

    const handleBack = () => {
        toast.warning("Konfirmasi Batal", {
            description: "Yakin ingin membatalkan? Perubahan yang belum disimpan akan hilang.",
            action: {
                label: "Ya, Batal",
                onClick: () => router.get(route('user.index'))
            },
            cancel: { label: "Lanjut" }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Manajemen Pengguna</h2>}
        >
            <Head title="Tambah User Baru" />

            <div className="py-6 pb-40">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    
                    <form onSubmit={submit} className="space-y-6">
                        
                        {/* --- KONTAINER UTAMA --- */}
                        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-teal-500">
                            
                            {/* Header Kecil */}
                            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                                <div className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                                    <UserPlus className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                        Registrasi Pengguna Baru
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Lengkapi formulir di bawah untuk membuat akun akses baru.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                
                                {/* 1. Data Diri & Kontak */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 flex items-center mb-4">
                                        <User className="w-4 h-4 mr-2 text-teal-500" /> Informasi Dasar
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative pb-2">
                                            <InputLabel htmlFor="nama_lengkap" value="Nama Lengkap" required />
                                            <TextInput 
                                                id="nama_lengkap" 
                                                value={data.nama_lengkap} 
                                                onChange={(e) => handleFieldChange('nama_lengkap', e.target.value)} 
                                                className={`mt-1 block w-full ${(formErrors.nama_lengkap || errors.nama_lengkap) ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`} 
                                                placeholder="Masukkan Nama Lengkap"
                                            />
                                            <FieldTooltipError message={formErrors.nama_lengkap || errors.nama_lengkap} />
                                        </div>

                                        <div className="relative pb-2">
                                            <InputLabel htmlFor="nik" value="NIK (Nomor Induk Karyawan)" />
                                            <TextInput 
                                                id="nik" 
                                                value={data.nik} 
                                                onChange={(e) => handleFieldChange('nik', e.target.value)} 
                                                className="mt-1 block w-full" 
                                                placeholder="Masukkan NIK"
                                            />
                                            <FieldTooltipError message={formErrors.nik || errors.nik} />
                                        </div>

                                        <div className="relative pb-2">
                                            <InputLabel htmlFor="email" value="Alamat Email" required />
                                            <div className="relative mt-1">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <TextInput 
                                                    id="email" 
                                                    type="email" 
                                                    value={data.email} 
                                                    onChange={(e) => handleFieldChange('email', e.target.value)} 
                                                    className={`pl-10 block w-full ${(formErrors.email || errors.email) ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`} 
                                                    placeholder="Masukkan Alamat Email"
                                                />
                                            </div>
                                            <FieldTooltipError message={formErrors.email || errors.email} />
                                        </div>

                                        <div className="relative pb-2">
                                            <InputLabel htmlFor="no_telepon" value="Nomor Telepon/WA" />
                                            <div className="relative mt-1">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <TextInput 
                                                    id="no_telepon" 
                                                    value={data.no_telepon} 
                                                    onChange={(e) => handleFieldChange('no_telepon', e.target.value)} 
                                                    className="pl-10 block w-full" 
                                                    placeholder="Masukkan Nomor Telepon/WA"
                                                />
                                            </div>
                                            <FieldTooltipError message={formErrors.no_telepon || errors.no_telepon} />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-700 my-4"></div>

                                {/* 2. Peran & Unit */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 flex items-center mb-4">
                                        <Building2 className="w-4 h-4 mr-2 text-teal-500" /> Akses & Penempatan
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative pb-2 z-20"> {/* Z-index tinggi untuk dropdown */}
                                            <InputLabel htmlFor="peran" value="Peran Pengguna" required />
                                            <CustomSelect
                                                value={data.peran}
                                                onChange={(e) => handleFieldChange('peran', e.target.value)}
                                                options={roleOptions}
                                                className={`mt-1 ${(formErrors.peran || errors.peran) ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                                            />
                                            <FieldTooltipError message={formErrors.peran || errors.peran} />
                                        </div>

                                        <div className="relative pb-2 z-10">
                                            <InputLabel htmlFor="id_unit" value="Unit Kerja (Opsional)" />
                                            <CustomSelect
                                                value={data.id_unit}
                                                onChange={(e) => handleFieldChange('id_unit', e.target.value)}
                                                options={unitOptions}
                                                placeholder="-- Pilih Unit --"
                                                className="mt-1"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Kosongkan jika user adalah Admin Global atau Rektorat tanpa unit spesifik.</p>
                                            <FieldTooltipError message={formErrors.id_unit || errors.id_unit} />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-700 my-4"></div>

                                {/* 3. Keamanan */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-200 flex items-center mb-4">
                                        <Shield className="w-4 h-4 mr-2 text-teal-500" /> Keamanan Akun
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="relative pb-2">
                                            <InputLabel htmlFor="password" value="Password" required />
                                            <PasswordInput 
                                                id="password" 
                                                value={data.password} 
                                                onChange={(e) => handleFieldChange('password', e.target.value)} 
                                                className={`mt-1 block w-full ${(formErrors.password || errors.password) ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`} 
                                                autoComplete="new-password"
                                            />
                                            <FieldTooltipError message={formErrors.password || errors.password} />
                                        </div>

                                        <div className="relative pb-2">
                                            <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" required />
                                            <PasswordInput 
                                                id="password_confirmation" 
                                                value={data.password_confirmation} 
                                                onChange={(e) => handleFieldChange('password_confirmation', e.target.value)} 
                                                className={`mt-1 block w-full ${(formErrors.password_confirmation || errors.password_confirmation) ? 'border-rose-500 ring-2 ring-rose-500/20 focus:ring-rose-500 focus:border-rose-500' : ''}`} 
                                            />
                                            <FieldTooltipError message={formErrors.password_confirmation || errors.password_confirmation} />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* --- TOMBOL AKSI (STICKY) --- */}
                        <div className="sticky bottom-4 z-30 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <button
                                type="button"
                                onClick={handleBack}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium text-sm flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            >
                                <ArrowLeft size={16} className="mr-2" /> Batal
                            </button>
                            
                            <PrimaryButton disabled={processing} className="shadow-teal-200 hover:shadow-teal-400">
                                <Save size={16} className="mr-2" /> Simpan User Baru
                            </PrimaryButton>
                        </div>

                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}