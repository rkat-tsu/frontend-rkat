import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { MailCheck, LogOut, RefreshCcw } from 'lucide-react';

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const submit = (e) => {
        e.preventDefault();

        post(route('verification.send'), {
            onSuccess: () => {
                toast.success('Tautan verifikasi baru telah berhasil dikirim ke email Anda.');
            },
            onError: () => {
                toast.error('Gagal mengirim ulang tautan verifikasi.');
            }
        });
    };

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <MailCheck size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Verifikasi Email Anda</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Terima kasih telah mendaftar di Sistem RKAT. Sebagai langkah keamanan, silakan verifikasi alamat email Anda melalui tautan yang telah kami kirimkan.
                </p>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 italic">
                    Belum menerima email? Kami dapat mengirimkan ulang tautan verifikasi tersebut.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                    Tautan verifikasi baru telah dikirim ke alamat email yang Anda gunakan saat pendaftaran.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div className="flex flex-col gap-3">
                    <PrimaryButton 
                        className="w-full flex justify-center py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-700 dark:to-teal-600 font-bold shadow-lg shadow-blue-500/20 dark:shadow-blue-900/40 transition-all duration-300 hover:scale-[1.02] text-white dark:text-white" 
                        disabled={processing}
                    >
                        <RefreshCcw className={`mr-2 h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
                        KIRIM ULANG EMAIL VERIFIKASI
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Keluar dari Sesi
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
