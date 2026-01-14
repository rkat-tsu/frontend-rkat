import React from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import PasswordInput from '@/Components/PasswordInput';
import CustomSelect from '@/Components/CustomSelect'; 
import { UserPlus, Save, ArrowLeft, Shield, Building2, Lock, Phone, Mail, User } from 'lucide-react';

export default function Create({ auth, units = [] }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        nama_lengkap: '',
        username: '', // Field ini ada di state tapi tidak ditampilkan di form asli, dibiarkan saja
        email: '',
        peran: 'Inputer',
        password: '',
        password_confirmation: '',
        no_telepon: '',
        id_unit: '',
    });

    const roleOptions = [
        { value: 'Inputer', label: 'Inputer (Staf/Operator)' },
        { value: 'Kaprodi', label: 'Kaprodi (Kepala Program Studi)' },
        { value: 'Kepala_Unit', label: 'Kepala Unit' },
        { value: 'Dekan', label: 'Dekan' },
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
        post(route('user.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
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
                        <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-teal-500">
                            
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
                                        <div>
                                            <InputLabel htmlFor="nama_lengkap" value="Nama Lengkap" required />
                                            <TextInput 
                                                id="nama_lengkap" 
                                                value={data.nama_lengkap} 
                                                onChange={(e) => setData('nama_lengkap', e.target.value)} 
                                                className="mt-1 block w-full" 
                                                placeholder="Contoh: Dr. Budi Santoso, M.Kom"
                                            />
                                            <InputError message={errors.nama_lengkap} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="email" value="Alamat Email" required />
                                            <div className="relative mt-1">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Mail className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <TextInput 
                                                    id="email" 
                                                    type="email" 
                                                    value={data.email} 
                                                    onChange={(e) => setData('email', e.target.value)} 
                                                    className="pl-10 block w-full" 
                                                    placeholder="nama@universitas.ac.id"
                                                />
                                            </div>
                                            <InputError message={errors.email} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="no_telepon" value="Nomor Telepon/WA" />
                                            <div className="relative mt-1">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <Phone className="h-4 w-4 text-gray-400" />
                                                </div>
                                                <TextInput 
                                                    id="no_telepon" 
                                                    value={data.no_telepon} 
                                                    onChange={(e) => setData('no_telepon', e.target.value)} 
                                                    className="pl-10 block w-full" 
                                                    placeholder="0812..."
                                                />
                                            </div>
                                            <InputError message={errors.no_telepon} className="mt-2" />
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
                                        <div className="relative z-20"> {/* Z-index tinggi untuk dropdown */}
                                            <InputLabel htmlFor="peran" value="Peran Pengguna" required />
                                            <CustomSelect
                                                value={data.peran}
                                                onChange={(e) => setData('peran', e.target.value)}
                                                options={roleOptions}
                                                placeholder="Pilih Peran..."
                                                className="mt-1"
                                            />
                                            <InputError message={errors.peran} className="mt-2" />
                                        </div>

                                        <div className="relative z-10">
                                            <InputLabel htmlFor="id_unit" value="Unit Kerja (Opsional)" />
                                            <CustomSelect
                                                value={data.id_unit}
                                                onChange={(e) => setData('id_unit', e.target.value)}
                                                options={unitOptions}
                                                placeholder="-- Pilih Unit --"
                                                className="mt-1"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Kosongkan jika user adalah Admin Global atau Rektorat tanpa unit spesifik.</p>
                                            <InputError message={errors.id_unit} className="mt-2" />
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
                                        <div>
                                            <InputLabel htmlFor="password" value="Password" required />
                                            <PasswordInput 
                                                id="password" 
                                                value={data.password} 
                                                onChange={(e) => setData('password', e.target.value)} 
                                                className="mt-1 block w-full" 
                                                autoComplete="new-password"
                                            />
                                            <InputError message={errors.password} className="mt-2" />
                                        </div>

                                        <div>
                                            <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password" required />
                                            <PasswordInput 
                                                id="password_confirmation" 
                                                value={data.password_confirmation} 
                                                onChange={(e) => setData('password_confirmation', e.target.value)} 
                                                className="mt-1 block w-full" 
                                                autoComplete="new-password"
                                            />
                                            <InputError message={errors.password_confirmation} className="mt-2" />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* --- TOMBOL AKSI (STICKY) --- */}
                        <div className="sticky bottom-4 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                            <Link
                                href={route('user.index')}
                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium text-sm flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                            >
                                <ArrowLeft size={16} className="mr-2" /> Batal
                            </Link>
                            
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