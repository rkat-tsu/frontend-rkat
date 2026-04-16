import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import PasswordInput from '@/Components/PasswordInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
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
                    <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                        Sistem RKAT
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Rencana Kerja dan Anggaran Tahunan
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">

                    {/* --- Input Email --- */}
                    <div>
                        <div className="mb-2 flex items-center text-sm font-medium text-slate-700">
                            <svg className="mr-2 h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                            Alamat Email
                        </div>

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full rounded-xl border-gray-300 px-4 py-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500"
                            autoComplete="email"
                            isFocused={true}
                            tabindex="1"
                            placeholder="Masukkan alamat email Anda"
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    {/* --- Input Password & Lupa Sandi --- */}
                    <div>
                        <div className="mb-2 flex items-center justify-between text-sm font-medium">
                            <div className="flex items-center text-slate-700">
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
                            className="block w-full rounded-xl border-gray-300 px-4 py-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500"
                            autoComplete="current-password"
                            tabindex="2"
                            placeholder="Masukkan kata sandi Anda"
                            onChange={(e) => setData('password', e.target.value)}
                            required
                        />
                        <InputError message={errors.password} className="mt-2" />

                        <Link
                            href={route('password.request')}
                            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                            tabindex="-1"
                        >
                            Lupa sandi?
                        </Link>
                    </div>

                    {/* --- Checkbox Stay Logged In --- */}
                    <div className="pt-2">
                        <label className="flex cursor-pointer items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                className="h-5 w-5 rounded border-gray-300 text-teal-600 shadow-sm focus:ring-teal-500"
                                onChange={(e) => setData('remember', e.target.checked)}
                                tabindex="-1"
                            />
                            <span className="ms-3 text-sm font-medium text-slate-600">
                                Biarkan saya tetap masuk
                            </span>
                        </label>
                    </div>

                    {/* --- Tombol Login Gradien dengan Hover --- */}
                    <div className="pt-4">
                        <PrimaryButton
                            className="group flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-3.5 text-sm font-bold tracking-widest text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:from-blue-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
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