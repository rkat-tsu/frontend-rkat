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
import { UserPlus, Save, ArrowLeft, Shield, Building2, Lock, Phone, Mail, User, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function Edit({ auth, user, units = [] }) {
    const [profileFormErrors, setProfileFormErrors] = useState({});
    const [passwordFormErrors, setPasswordFormErrors] = useState({});

    // Form untuk data profil
    const { data, setData, patch, processing, errors } = useForm({
        nama_lengkap: user.nama_lengkap || '',
        nik: user.nik || '',
        username: user.username || '',
        email: user.email || '',
        peran: user.peran || 'Inputer',
        no_telepon: user.no_telepon || '',
        id_unit: user.id_unit || '',
        is_aktif: user.is_aktif ? 1 : 0,
    });

    const handleProfileChange = (field, value) => {
        setData(field, value);
        if (profileFormErrors[field]) {
            setProfileFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handlePasswordChange = (field, value) => {
        passwordForm.setData(field, value);
        if (passwordFormErrors[field]) {
            setPasswordFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Form khusus ganti password paksa
    const passwordForm = useForm({
        password: '',
        password_confirmation: '',
    });

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

    const unitOptions = units.map(u => ({
        value: u.id_unit,
        label: u.kode_unit ? `${u.kode_unit} - ${u.nama_unit}` : u.nama_unit
    }));

    const statusOptions = [
        { value: 1, label: 'Aktif (Dapat Login)' },
        { value: 0, label: 'Non-Aktif (Akses Dikunci)' },
    ];

    const submitProfile = (e) => {
        e.preventDefault();
        
        const errs = {};
        if (!data.nama_lengkap) errs.nama_lengkap = 'Harap isi bidang ini.';
        if (!data.username) errs.username = 'Harap isi bidang ini.';
        if (!data.email) errs.email = 'Harap isi bidang ini.';
        if (!data.peran) errs.peran = 'Harap isi bidang ini.';

        if (Object.keys(errs).length > 0) {
            setProfileFormErrors(errs);
            toast.error("Peringatan", { description: "Harap lengkapi bidang profil yang wajib diisi." });
            return;
        }

        setProfileFormErrors({});
        toast.warning("Konfirmasi Simpan", {
            description: "Apakah Anda yakin ingin menyimpan perubahan profil ini?",
            action: {
                label: "Ya, Simpan",
                onClick: () => {
                    const toastId = toast.loading("Memperbarui data user...");
                    patch(route('user.update', user.uuid), {
                        onSuccess: () => toast.success("Berhasil", { id: toastId, description: `Data user ${data.nama_lengkap} berhasil diperbarui.` }),
                        onError: () => toast.error("Gagal", { id: toastId, description: "Cek kembali inputan Anda." }),
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

    const submitPassword = (e) => {
        e.preventDefault();

        const errs = {};
        if (!passwordForm.data.password) errs.password = 'Harap isi bidang ini.';
        if (!passwordForm.data.password_confirmation) errs.password_confirmation = 'Harap isi bidang ini.';

        if (Object.keys(errs).length > 0) {
            setPasswordFormErrors(errs);
            toast.error("Peringatan", { description: "Harap lengkapi bidang password." });
            return;
        }

        if (passwordForm.data.password !== passwordForm.data.password_confirmation) {
            setPasswordFormErrors({ password_confirmation: 'Password dan konfirmasi password tidak cocok.' });
            toast.error("Peringatan", { description: "Password dan konfirmasi password tidak cocok." });
            return;
        }

        setPasswordFormErrors({});
        const toastId = toast.loading("Mengganti password...");
        passwordForm.patch(route('user.password.update', user.uuid), {
            onSuccess: () => {
                toast.success("Berhasil", { id: toastId, description: "Password berhasil diganti paksa." });
                passwordForm.reset();
            },
            onError: () => toast.error("Gagal", { id: toastId, description: "Cek kembali konfirmasi password." }),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Edit Pengguna</h2>}
        >
            <Head title={`Edit User - ${user.nama_lengkap}`} />

            <div className="py-6 pb-40">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* --- FORM 1: DATA PROFIL --- */}
                    <form onSubmit={submitProfile} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Informasi Profil</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Perbarui data identitas dan akses pengguna.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="relative pb-2">
                                <InputLabel htmlFor="nama_lengkap" value="Nama Lengkap" required />
                                <TextInput id="nama_lengkap" value={data.nama_lengkap} onChange={(e) => handleProfileChange('nama_lengkap', e.target.value)} className={`mt-1 block w-full ${(profileFormErrors.nama_lengkap || errors.nama_lengkap) ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`} />
                                <FieldTooltipError message={profileFormErrors.nama_lengkap || errors.nama_lengkap} />
                            </div>
                            <div className="relative pb-2">
                                <InputLabel htmlFor="nik" value="NIK (Nomor Induk Karyawan)" />
                                <TextInput id="nik" value={data.nik} onChange={(e) => handleProfileChange('nik', e.target.value)} className="mt-1 block w-full" />
                                <FieldTooltipError message={profileFormErrors.nik || errors.nik} />
                            </div>
                            <div className="relative pb-2">
                                <InputLabel htmlFor="username" value="Username" required />
                                <TextInput id="username" value={data.username} onChange={(e) => handleProfileChange('username', e.target.value)} className={`mt-1 block w-full ${(profileFormErrors.username || errors.username) ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`} />
                                <FieldTooltipError message={profileFormErrors.username || errors.username} />
                            </div>
                            <div className="relative pb-2">
                                <InputLabel htmlFor="email" value="Email" required />
                                <TextInput id="email" type="email" value={data.email} onChange={(e) => handleProfileChange('email', e.target.value)} className={`mt-1 block w-full ${(profileFormErrors.email || errors.email) ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`} />
                                <FieldTooltipError message={profileFormErrors.email || errors.email} />
                            </div>
                            <div className="relative pb-2">
                                <InputLabel htmlFor="no_telepon" value="Nomor Telepon" />
                                <TextInput id="no_telepon" value={data.no_telepon} onChange={(e) => handleProfileChange('no_telepon', e.target.value)} className="mt-1 block w-full" />
                                <FieldTooltipError message={profileFormErrors.no_telepon || errors.no_telepon} />
                            </div>
                            <div className="relative pb-2">
                                <InputLabel htmlFor="peran" value="Peran / Role" required />
                                <CustomSelect value={data.peran} onChange={(e) => handleProfileChange('peran', e.target.value)} options={roleOptions} className={`mt-1 ${(profileFormErrors.peran || errors.peran) ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`} />
                                <FieldTooltipError message={profileFormErrors.peran || errors.peran} />
                            </div>
                            <div className="relative pb-2">
                                <InputLabel htmlFor="id_unit" value="Unit Kerja" />
                                <CustomSelect value={data.id_unit} onChange={(e) => handleProfileChange('id_unit', e.target.value)} options={[{value: '', label: '-- Tanpa Unit --'}, ...unitOptions]} className="mt-1" />
                                <FieldTooltipError message={profileFormErrors.id_unit || errors.id_unit} />
                            </div>
                            <div className="relative pb-2">
                                <InputLabel htmlFor="is_aktif" value="Status Akun" required />
                                <CustomSelect value={data.is_aktif} onChange={(e) => handleProfileChange('is_aktif', parseInt(e.target.value))} options={statusOptions} className="mt-1" />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                            <PrimaryButton disabled={processing}>
                                <Save className="w-4 h-4 mr-2" /> Simpan Perubahan Profil
                            </PrimaryButton>
                        </div>
                    </form>

                    {/* --- FORM 2: GANTI PASSWORD PAKSA --- */}
                    <form onSubmit={submitPassword} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border-l-4 border-amber-500">
                        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                                <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Ganti Password Paksa</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Gunakan fitur ini jika pengguna lupa password mereka.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div className="relative pb-2">
                                <InputLabel htmlFor="password" value="Password Baru" required />
                                <PasswordInput id="password" value={passwordForm.data.password} onChange={(e) => handlePasswordChange('password', e.target.value)} className={`mt-1 block w-full ${(passwordFormErrors.password || passwordForm.errors.password) ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`} />
                                <FieldTooltipError message={passwordFormErrors.password || passwordForm.errors.password} />
                            </div>
                            <div className="relative pb-2">
                                <InputLabel htmlFor="password_confirmation" value="Konfirmasi Password Baru" required />
                                <PasswordInput id="password_confirmation" value={passwordForm.data.password_confirmation} onChange={(e) => handlePasswordChange('password_confirmation', e.target.value)} className={`mt-1 block w-full ${(passwordFormErrors.password_confirmation || passwordForm.errors.password_confirmation) ? 'border-rose-500 ring-2 ring-rose-500/20' : ''}`} />
                                <FieldTooltipError message={passwordFormErrors.password_confirmation || passwordForm.errors.password_confirmation} />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button 
                                type="submit" 
                                disabled={passwordForm.processing}
                                className="inline-flex items-center px-4 py-2 bg-amber-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-amber-700 focus:bg-amber-700 active:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition ease-in-out duration-150 shadow-sm"
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${passwordForm.processing ? 'animate-spin' : ''}`} /> Ganti Password Sekarang
                            </button>
                        </div>
                    </form>

                    <div className="flex justify-center">
                        <button onClick={handleBack} type="button" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Daftar User
                        </button>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
