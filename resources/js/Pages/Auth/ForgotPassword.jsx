import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { toast } from 'sonner';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'), {
            onSuccess: () => {
                toast.success('Tautan pemulihan kata sandi telah dikirim ke email Anda.');
            },
            onError: (err) => {
                toast.error('Gagal mengirim tautan. Silakan periksa kembali alamat email Anda.');
            }
        });
    };

    return (
        <GuestLayout>
            <Head title="Lupa Kata Sandi" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <KeyRound size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Lupa Kata Sandi?</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Silakan masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan verifikasi untuk mengatur ulang kata sandi Anda secara aman.
                </p>
            </div>

            {status && (
                <div className="mb-6 rounded-lg bg-emerald-50 p-4 text-sm font-medium text-emerald-600 border border-emerald-100">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
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
                        isFocused={true}
                        placeholder="nama@email.com"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="pt-2">
                    <PrimaryButton 
                        className="w-full flex justify-center py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 font-bold shadow-lg shadow-blue-500/20" 
                        disabled={processing}
                    >
                        {processing ? 'MENGIRIM...' : 'KIRIM TAUTAN PEMULIHAN'}
                    </PrimaryButton>
                </div>

                <div className="mt-6 text-center">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke halaman Login
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
