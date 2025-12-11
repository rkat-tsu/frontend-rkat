import React from 'react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { 
    CircleUserRound, 
    UserRound, 
    Camera, 
    Mail, 
    Phone, 
    ChevronUp, // Digunakan untuk indikator dropdown
    BriefcaseBusiness,
    Save, 
    Edit, 
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/Components/ui/dropdown-menu';

// ▼▼▼ DAFTAR PERAN SUDAH DIPERBARUI (TERMASUK DIREKTUR) ▼▼▼
const ALLOWED_ROLES = [
    'Admin', 
    'Rektor', 
    'WR_1', 
    'WR_2', 
    'WR_3',
    'Dekan', 
    'Kepala_Unit', 
    'Kaprodi', 
    'Inputer'
]; 

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const isAdmin = user.peran === 'Admin';

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            nama_lengkap: user.nama_lengkap || '', 
            username: user.username || '', 
            email: user.email,
            no_telepon: user.no_telepon || '', 
            peran: user.peran, 
        });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update')); 
    };

    return (
        <section className={className}> 
            
            {/* Header (Profil Picture & Nama) */}
            <div className="flex flex-col items-center mb-10">
                <div className="relative w-28 h-28 rounded-full bg-teal-500 flex items-center justify-center text-white text-4xl mb-3 shadow-md">
                    <CircleUserRound className="w-20 h-20"/>
                    
                    <button type="button" className="absolute bottom-0 end-0 p-1 bg-yellow-500 hover:bg-yellow-600 rounded-full border-2 border-white dark:border-gray-800">
                        <Camera className="w-5 h-5 text-black"/>
                    </button>
                </div>
                
                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{user.nama_lengkap || data.username || 'User'}</h3>
                <span className={`px-2.5 py-0.5 mt-1 text-sm font-medium rounded-full ${isAdmin ? 'bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{data.peran}</span>
            </div>

            {/* Form Utama */}
            <form onSubmit={submit} className="space-y-6">
                
                <header className="mb-6 flex justify-between items-center border-b pb-4 border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        Informasi Pribadi
                    </h2>
                    
                    {/* Tombol Simpan */}
                    <PrimaryButton 
                        disabled={processing} 
                        className="bg-teal-500 hover:bg-teal-600 text-white dark:text-gray-900 dark:bg-teal-500 dark:hover:bg-teal-400 focus:ring-teal-500"
                    >
                        {processing ? (
                            <>
                                <Save className="w-4 h-4 me-1"/> Menyimpan...
                            </>
                        ) : (
                            <>
                                <Edit className="w-4 h-4 me-1"/> Edit Profil
                            </>
                        )}
                    </PrimaryButton>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    
                    {/* Kolom KIRI */}
                    <div className="space-y-6">
                        <div className="relative">
                            <InputLabel htmlFor="nama_lengkap" value={<><UserRound className="w-4 h-4 inline me-2 text-gray-500 dark:text-gray-400"/> Nama</>} />
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

                        <div className="relative">
                            <InputLabel htmlFor="email" value={<><Mail className="w-4 h-4 inline me-2 text-gray-500 dark:text-gray-400"/> Email</>} />
                            <TextInput
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                required
                                onChange={(e) => setData('email', e.target.value)}
                                autoComplete="email"
                            />
                            <InputError className="mt-2" message={errors.email} />
                        </div>
                    </div>

                    {/* Kolom KANAN */}
                    <div className="space-y-6">
                        
                        {/* ▼▼▼ DROPDOWN ROLE MODERN (STYLE SHADCN) ▼▼▼ */}
                        <div className="relative">
                            <InputLabel htmlFor="peran" value={<><BriefcaseBusiness className="w-4 h-4 inline me-2 text-gray-500 dark:text-gray-400"/> Peran</>} />
                            
                            {isAdmin ? (
                                <div className="relative">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <div className="appearance-none mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-teal-500 dark:focus:border-teal-600 focus:ring-teal-500 dark:focus:ring-teal-600 rounded-md shadow-sm pr-10 cursor-pointer">
                                                {data.peran}
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent sideOffset={6} className="w-56">
                                            {ALLOWED_ROLES.map((peran) => (
                                                <DropdownMenuItem key={peran} onSelect={() => setData('peran', peran)} className={data.peran === peran ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}>
                                                    {peran}
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ) : (
                                // Tampilan Read-only untuk non-Admin
                                <TextInput
                                    id="peran_view"
                                    className="mt-1 block w-full bg-gray-50 dark:bg-gray-700"
                                    value={data.peran} 
                                    disabled
                                />
                            )}
                            <InputError className="mt-2" message={errors.peran} />
                        </div>

                        <div className="relative">
                            <InputLabel htmlFor="no_telepon" value={<><Phone className="w-4 h-4 inline me-2 text-gray-500 dark:text-gray-400"/> No. Telp</>} />
                            <TextInput
                                id="no_telepon"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.no_telepon} 
                                onChange={(e) => setData('no_telepon', e.target.value)} 
                                autoComplete="tel"
                            />
                            <InputError className="mt-2" message={errors.no_telepon} />
                        </div>
                    </div>
                </div>

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
            </form>
        </section>
    );
}