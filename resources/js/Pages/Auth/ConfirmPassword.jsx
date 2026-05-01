import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import PasswordInput from '@/Components/PasswordInput';
import { Head, useForm } from '@inertiajs/react';
import { ShieldAlert, Lock } from 'lucide-react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirm Password" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                    <ShieldAlert size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Konfirmasi Keamanan</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Ini adalah area aman aplikasi. Mohon masukkan kata sandi Anda untuk melanjutkan.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <div className="mb-1.5 flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                        <Lock className="mr-2 h-4 w-4 text-amber-500" />
                        Kata Sandi
                    </div>
                    <PasswordInput 
                        id="password"
                        name="password"
                        value={data.password}
                        className="block w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white px-4 py-3 text-sm shadow-sm transition-colors focus:border-amber-500 focus:ring-amber-500"
                        autoComplete="current-password"
                        isFocused={true}
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="pt-2">
                    <PrimaryButton 
                        className="w-full flex justify-center py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-500 font-bold shadow-lg shadow-amber-500/20 dark:shadow-amber-950/40 transition-all duration-300 hover:scale-[1.02] text-white dark:text-white" 
                        disabled={processing}
                    >
                        KONFIRMASI SEKARANG
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
