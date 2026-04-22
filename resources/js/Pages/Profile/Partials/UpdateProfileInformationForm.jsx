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
    BriefcaseBusiness,
    Save,
    Edit,
    ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const isAdmin = user.peran === 'Admin';

    const { data, setData, patch, transform, errors, processing, recentlySuccessful } =
        useForm({
            nama_lengkap: user.nama_lengkap || '',
            username: user.username || '',
            email: user.email,
            no_telepon: user.no_telepon || '',
            peran: user.peran, // Tetap ada di state hanya untuk ditampilkan di UI
        });

    const submit = (e) => {
        e.preventDefault();
        const toastId = toast.loading("Menyimpan profil...");

        // Transformasi ini memastikan field 'peran' SELALU dihapus dari data
        // yang dikirim ke backend untuk semua user, sehingga tidak akan terupdate.
        transform((data) => {
            const { peran, ...rest } = data;
            return rest;
        });

        patch(route('profile.update'), {
            onSuccess: () => toast.success("Berhasil", { id: toastId, description: "Profil berhasil diperbarui." }),
            onError: (errors) => {
                toast.error("Gagal Memperbarui", { id: toastId, description: "Periksa kembali input Anda." });
                console.error(errors);
            }
        });
    };

    return (
        <section className={className}>
            {/* Header (Profil Picture & Nama) */}
            <div className="flex flex-col items-center mb-10">
                <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-white text-4xl mb-3 shadow-xl border-4 border-white dark:border-gray-800">
                    <CircleUserRound className="w-20 h-20" />
                    <button type="button" className="absolute bottom-0 end-0 p-1.5 bg-yellow-500 hover:bg-yellow-600 rounded-full border-2 border-white dark:border-gray-800 shadow-sm transition-transform hover:scale-110">
                        <Camera className="w-4 h-4 text-black" />
                    </button>
                </div>

                <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{user.nama_lengkap || data.username || 'User'}</h3>
                <div className="mt-2 flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full flex items-center gap-1.5 ${isAdmin ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'}`}>
                        {isAdmin && <ShieldCheck className="w-3.5 h-3.5" />}
                        {data.peran.replace('_', ' ')}
                    </span>
                </div>
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
                        className="bg-teal-600 hover:bg-teal-700 text-white dark:text-gray-900 dark:bg-teal-500 dark:hover:bg-teal-400 focus:ring-teal-500 shadow-md transition-all active:scale-95"
                    >
                        {processing ? (
                            <>
                                <Save className="w-4 h-4 me-2 animate-pulse" /> Menyimpan...
                            </>
                        ) : (
                            <>
                                <Edit className="w-4 h-4 me-2" /> Edit Profil
                            </>
                        )}
                    </PrimaryButton>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                    {/* Kolom KIRI */}
                    <div className="space-y-6">
                        <div className="relative">
                            <InputLabel htmlFor="nama_lengkap" value={<><UserRound className="w-4 h-4 inline me-2 text-teal-500" /> Nama Lengkap</>} />
                            <TextInput
                                id="nama_lengkap"
                                className="mt-1 block w-full focus:ring-teal-500 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                value={data.nama_lengkap}
                                onChange={(e) => setData('nama_lengkap', e.target.value)}
                                required
                                isFocused
                                autoComplete="name"
                            />
                            <InputError className="mt-2" message={errors.nama_lengkap} />
                        </div>

                        <div className="relative">
                            <InputLabel htmlFor="username" value={<><UserRound className="w-4 h-4 inline me-2 text-teal-500" /> Username</>} />
                            <TextInput
                                id="username"
                                className="mt-1 block w-full focus:ring-teal-500 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                required
                                autoComplete="username"
                            />
                            <InputError className="mt-2" message={errors.username} />
                        </div>
                    </div>

                    {/* Kolom KANAN */}
                    <div className="space-y-6">
                        {/* Field Peran (Read Only untuk SEMUA user) */}
                        <div className="relative">
                            <InputLabel htmlFor="peran" value={<><BriefcaseBusiness className="w-4 h-4 inline me-2 text-teal-500" /> Peran / Jabatan</>} />
                            <div className="mt-1 block w-full px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-md text-gray-500 dark:text-gray-400 cursor-not-allowed select-none">
                                {data.peran.replace('_', ' ')}
                            </div>
                        </div>

                        <div className="relative">
                            <InputLabel htmlFor="no_telepon" value={<><Phone className="w-4 h-4 inline me-2 text-teal-500" /> No. Telepon</>} />
                            <TextInput
                                id="no_telepon"
                                type="text"
                                className="mt-1 block w-full focus:ring-teal-500 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                                value={data.no_telepon}
                                onChange={(e) => setData('no_telepon', e.target.value)}
                                autoComplete="tel"
                                placeholder="Contoh: 0812xxxxxxxx"
                            />
                            <InputError className="mt-2" message={errors.no_telepon} />
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <InputLabel htmlFor="email" value={<><Mail className="w-4 h-4 inline me-2 text-teal-500" /> Email</>} />
                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full focus:ring-teal-500 dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                        value={data.email}
                        required
                        onChange={(e) => setData('email', e.target.value)}
                        autoComplete="email"
                    />
                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div className="flex items-center gap-4 pt-4">
                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4" /> Informasi tersimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}