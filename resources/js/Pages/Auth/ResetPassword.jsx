import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PasswordInput from '@/Components/PasswordInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Mail, Lock, ShieldCheck } from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
            onSuccess: () => {
                toast.success('Kata sandi Anda telah berhasil diatur ulang.');
            },
            onError: () => {
                toast.error('Terjadi kesalahan saat mengatur ulang kata sandi.');
            }
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Kata Sandi" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <ShieldCheck size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Atur Ulang Kata Sandi</h2>
                <p className="mt-2 text-sm text-slate-600">
                    Silakan tentukan kata sandi baru Anda untuk mengakses kembali akun RKAT.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <div className="mb-1.5 flex items-center text-sm font-medium text-slate-700">
                        <Mail className="mr-2 h-4 w-4 text-blue-500" />
                        Alamat Email
                    </div>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full rounded-xl border-gray-300 px-4 py-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <div className="mb-1.5 flex items-center text-sm font-medium text-slate-700">
                        <Lock className="mr-2 h-4 w-4 text-blue-500" />
                        Kata Sandi Baru
                    </div>
                    <PasswordInput
                        id="password"
                        name="password"
                        value={data.password}
                        className="block w-full rounded-xl border-gray-300 px-4 py-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <div className="mb-1.5 flex items-center text-sm font-medium text-slate-700">
                        <ShieldCheck className="mr-2 h-4 w-4 text-blue-500" />
                        Konfirmasi Kata Sandi
                    </div>
                    <PasswordInput
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="block w-full rounded-xl border-gray-300 px-4 py-3 text-sm shadow-sm transition-colors focus:border-blue-500 focus:ring-blue-500"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="pt-2">
                    <PrimaryButton 
                        className="w-full flex justify-center py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 font-bold shadow-lg shadow-blue-500/20" 
                        disabled={processing}
                    >
                        {processing ? 'MEMPROSES...' : 'SIMPAN KATA SANDI BARU'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
