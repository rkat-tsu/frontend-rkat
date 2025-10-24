import React from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PasswordInput from '@/Components/PasswordInput'; // <-- Pastikan path ini benar!
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

// Daftar peran yang diizinkan (sesuaikan dengan database/backend Anda)
const ALLOWED_ROLES = ['Admin', 'User', 'Super Admin']; 

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    // Mendapatkan data user yang sedang login dari props Inertia
    const user = usePage().props.auth.user;

    // Menentukan apakah user yang login adalah Admin
    const isAdmin = user.peran === 'Admin';

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            // Memuat data dari user props. Pastikan controller mengirimkan field ini.
            nama_lengkap: user.nama_lengkap || '', 
            username: user.username || '', 
            password: user.password || '', 
            email: user.email,
            no_telp: user.no_telp || '',
            peran: user.peran, 
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}> 
            {/* Header (Profil Picture & Nama) - Dibuat Center */}
            <div className="flex flex-col items-center mb-10">
                {/* Avatar Placeholder */}
                <div className="relative w-28 h-28 rounded-full bg-teal-500 flex items-center justify-center text-white text-4xl mb-3 shadow-md">
                    <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                    {/* Tombol Ganti Foto (Opsional) */}
                    <button type="button" className="absolute bottom-0 end-0 p-1 bg-yellow-500 hover:bg-yellow-600 rounded-full border-2 border-white dark:border-gray-800">
                        <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293L11 3.414A1 1 0 0010.293 3H5.707A1 1 0 005 3.707L4.293 4.414A1 1 0 013.586 5H4zM7 9a3 3 0 106 0 3 3 0 00-6 0z"></path></svg>
                    </button>
                </div>
                {/* Nama dan Peran */}
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{user.nama_lengkap || data.username || 'User'}</h3>
                <span className={`px-2.5 py-0.5 mt-1 text-sm font-medium rounded-full ${isAdmin ? 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{data.peran}</span>
            </div>

            {/* Form Utama */}
            <form onSubmit={submit} className="space-y-6">
                
                <header className="mb-6 flex justify-between items-center border-b pb-4 border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        Informasi Pribadi
                    </h2>
                    
                    {/* Tombol Simpan/Edit */}
                    <PrimaryButton disabled={processing} className="bg-yellow-500 hover:bg-yellow-600 text-black dark:text-gray-900 dark:bg-yellow-500 dark:hover:bg-yellow-400 focus:ring-yellow-500">
                        <svg className="w-4 h-4 me-1" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM9 11l-4 4v3h3l4-4-3-3z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                        {processing ? 'Menyimpan...' : 'Edit'}
                    </PrimaryButton>
                </header>
                
                {/* Grid 2 Kolom untuk Field Input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    
                    {/* Kolom KIRI */}
                    <div className="space-y-6">
                        {/* 1. Nama Lengkap */}
                        <div className="relative">
                            <InputLabel htmlFor="nama_lengkap" value={<><svg className="w-4 h-4 inline me-2 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"></path></svg> Nama</>} />
                            <TextInput
                                id="nama_lengkap"
                                className="mt-1 block w-full"
                                value={data.nama_lengkap}
                                onChange={(e) => setData('nama_lengkap', e.target.value)}
                                required
                                isFocused
                                autoComplete="name"
                            />
                            <InputError className="mt-2" message={errors.nama_lengkap} />
                        </div>

                        {/* 2. Email */}
                        <div className="relative">
                            <InputLabel htmlFor="email" value={<><svg className="w-4 h-4 inline me-2 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"></path><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path></svg> Email</>} />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                required
                                autoComplete="email"
                            />
                            <InputError className="mt-2" message={errors.email} />
                        </div>
                        
                        {/* 3. Password (MENGGUNAKAN PasswordInput dengan Toggle) */}
                        <div className="relative">
                            <InputLabel htmlFor="password" value={<><svg className="w-4 h-4 inline me-2 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 016 0h2a5 5 0 00-5-5z"></path></svg> Password</>} />
                            <PasswordInput 
                                id="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)} 
                                disabled 
                                className="mt-1 block w-full text-lg"
                            />
                        </div>
                    </div>

                    {/* Kolom KANAN */}
                    <div className="space-y-6">
                        {/* 4. Role (Peran) - Logika Admin */}
                        <div className="relative">
                            <InputLabel htmlFor="peran" value={<><svg className="w-4 h-4 inline me-2 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 13v-2.586l4.586-4.586a2 2 0 012.828 0l.293.293a2 2 0 010 2.828L12.586 13H8z"></path></svg> Role</>} />
                            
                            {isAdmin ? (
                                <select
                                    id="peran"
                                    name="peran"
                                    className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-indigo-500 dark:focus:border-indigo-600 focus:ring-indigo-500 dark:focus:ring-indigo-600 rounded-md shadow-sm"
                                    value={data.peran}
                                    onChange={(e) => setData('peran', e.target.value)}
                                >
                                    {ALLOWED_ROLES.map((role) => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                            ) : (
                                <TextInput
                                    id="peran_view"
                                    className="mt-1 block w-full bg-gray-50 dark:bg-gray-700"
                                    value={data.peran}
                                    disabled
                                />
                            )}
                            <InputError className="mt-2" message={errors.peran} />
                        </div>

                        {/* 5. No. Telp */}
                        <div className="relative">
                            <InputLabel htmlFor="no_telp" value={<><svg className="w-4 h-4 inline me-2 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 3.699a1 1 0 01-.139.999l-2.42 2.42a1 1 0 000 1.414l3.536 3.536a1 1 0 001.414 0l2.42-2.42a1 1 0 01.999-.139l3.699.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"></path></svg> No. Telp</>} />
                            <TextInput
                                id="no_telp"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.no_telp}
                                onChange={(e) => setData('no_telp', e.target.value)}
                                autoComplete="tel"
                            />
                            <InputError className="mt-2" message={errors.no_telp} />
                        </div>
                        
                        {/* 6. Username */}
                        <div className="relative">
                            <InputLabel htmlFor="username" value={<><svg className="w-4 h-4 inline me-2 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M10 4a2 2 0 100 4 2 2 0 000-4zm-7 9a7 7 0 1114 0H3z"></path></svg> Username (Login)</>} />
                            <TextInput
                                id="username"
                                className="mt-1 block w-full"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                required
                                autoComplete="username"
                            />
                            <InputError className="mt-2" message={errors.username} />
                        </div>
                    </div>
                </div>

                {/* Status Sukses & Verifikasi Email */}
                <div className="flex items-center gap-4 pt-4">
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600 dark:text-green-400">
                            Informasi tersimpan.
                        </p>
                    </Transition>
                </div>
                
                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="mt-4">
                         <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
                            Alamat email Anda belum diverifikasi.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:text-gray-100 dark:focus:ring-offset-gray-800"
                            >
                                Klik di sini untuk mengirim ulang email verifikasi.
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                Verifikasi tautan baru telah dikirim ke alamat email Anda.
                            </div>
                        )}
                    </div>
                )}
            </form>
        </section>
    );
}