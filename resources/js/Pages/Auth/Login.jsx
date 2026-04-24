import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import PasswordInput from '@/Components/PasswordInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Login RKAT" />

            {status && (
                <div className="mb-4 text-sm font-medium text-green-600">
                    {status}
                </div>
            )}

            <div className="w-full sm:p-4">

                {/* --- Keterangan RKAT --- */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white">
                        Sistem RKAT
                    </h1>
                    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Rencana Kerja dan Anggaran Tahunan
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">

                    {/* --- Input Login (Email/Username) --- */}
                    <div>
                        <div className="mb-2 flex items-center text-sm font-bold text-slate-700 dark:text-slate-300">
                            <svg className="mr-2 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            Email atau Username
                        </div>

                        <TextInput
                            id="login"
                            type="text"
                            name="login"
                            value={data.login}
                            className="block w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500"
                            autoComplete="username"
                            isFocused={true}
                            tabindex="1"
                            placeholder="Masukkan email atau username"
                            onChange={(e) => setData('login', e.target.value)}
                        />
                        <InputError message={errors.login} className="mt-2" />
                    </div>

                    {/* --- Input Password & Lupa Sandi --- */}
                    <div>
                        <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
                            <div className="flex items-center">
                                <svg className="mr-2 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                </svg>
                                Kata Sandi
                            </div>
                        </div>

                        <PasswordInput
                            id="password"
                            name="password"
                            value={data.password}
                            className="block w-full rounded-xl border-gray-300 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white px-4 py-3 text-sm shadow-sm transition-all focus:border-blue-500 focus:ring-blue-500"
                            autoComplete="current-password"
                            tabindex="2"
                            placeholder="Masukkan kata sandi"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <InputError message={errors.password} className="mt-2" />

                        <div className="mt-2 flex justify-end">
                            <Link
                                href={route('password.request')}
                                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
                                tabindex="-1"
                            >
                                Lupa sandi?
                            </Link>
                        </div>
                    </div>

                    {/* --- Checkbox Stay Logged In --- */}
                    <div className="pt-2">
                        <label className="flex cursor-pointer items-center group">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                className="h-5 w-5 rounded border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-blue-600 shadow-sm focus:ring-blue-500"
                                onChange={(e) => setData('remember', e.target.checked)}
                                tabindex="-1"
                            />
                            <span className="ms-3 text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                Biarkan saya tetap masuk
                            </span>
                        </label>
                    </div>

                    {/* --- Tombol Login Gradien --- */}
                    <div className="pt-4">
                        <PrimaryButton
                            className="group flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-700 dark:to-teal-600 px-4 py-3.5 text-sm font-black tracking-widest text-white shadow-xl shadow-blue-500/30 dark:shadow-blue-950/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-blue-500/40 active:scale-95 disabled:opacity-50"
                            disabled={processing}
                            tabindex="3"
                        >
                            MASUK KE PORTAL RKAT
                            <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}