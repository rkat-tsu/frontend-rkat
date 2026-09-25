import React, { useState, useEffect } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { MailCheck, LogOut, RefreshCcw, Clock, AlertCircle, Send } from 'lucide-react';

const TIMER_DURATION = 180; // 3 Menit (180 Detik)

const formatTime = (totalSeconds) => {
    const minutes = Math.floor(Math.max(0, totalSeconds) / 60);
    const seconds = Math.max(0, totalSeconds) % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function VerifyEmail({ status }) {
    const { post, processing } = useForm({});

    const [timeLeft, setTimeLeft] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedExpiry = localStorage.getItem('email_verify_expiry');
            if (savedExpiry) {
                const remaining = Math.floor((parseInt(savedExpiry, 10) - Date.now()) / 1000);
                if (remaining > 0) return remaining;
                localStorage.removeItem('email_verify_expiry');
            }
        }
        if (status === 'verification-link-sent') {
            return TIMER_DURATION;
        }
        // Default 0 agar tombol KIRIM EMAIL langsung aktif saat pengguna baru login!
        return 0;
    });

    const [hasSentEmail, setHasSentEmail] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedExpiry = localStorage.getItem('email_verify_expiry');
            if (savedExpiry && parseInt(savedExpiry, 10) > Date.now()) {
                return true;
            }
        }
        return status === 'verification-link-sent';
    });

    // Set ulang timer jika ada status 'verification-link-sent' dari server
    useEffect(() => {
        if (status === 'verification-link-sent') {
            const expiry = Date.now() + TIMER_DURATION * 1000;
            localStorage.setItem('email_verify_expiry', expiry.toString());
            setTimeLeft(TIMER_DURATION);
            setHasSentEmail(true);
        }
    }, [status]);

    // Loop interval countdown
    useEffect(() => {
        if (timeLeft <= 0) return;

        const timer = setInterval(() => {
            if (typeof window !== 'undefined') {
                const savedExpiry = localStorage.getItem('email_verify_expiry');
                if (savedExpiry) {
                    const remaining = Math.floor((parseInt(savedExpiry, 10) - Date.now()) / 1000);
                    if (remaining <= 0) {
                        setTimeLeft(0);
                        localStorage.removeItem('email_verify_expiry');
                    } else {
                        setTimeLeft(remaining);
                    }
                } else {
                    setTimeLeft((prev) => (prev > 1 ? prev - 1 : 0));
                }
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft]);

    const submit = (e) => {
        e.preventDefault();
        if (processing || timeLeft > 0) return;

        post(route('verification.send'), {
            onSuccess: () => {
                toast.success('Tautan verifikasi baru telah berhasil dikirim ke email Anda.');
                const expiry = Date.now() + TIMER_DURATION * 1000;
                localStorage.setItem('email_verify_expiry', expiry.toString());
                setTimeLeft(TIMER_DURATION);
                setHasSentEmail(true);
            },
            onError: () => {
                toast.error('Gagal mengirim ulang tautan verifikasi.');
            }
        });
    };

    const isTimerActive = timeLeft > 0;
    const isExpired = hasSentEmail && timeLeft === 0;

    return (
        <GuestLayout>
            <Head title="Verifikasi Email" />

            <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <MailCheck size={24} />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Verifikasi Email Anda</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    Terima kasih telah mendaftar di Sistem RKAT. Sebagai langkah keamanan, silakan verifikasi alamat email Anda melalui tautan verifikasi.
                </p>
            </div>

            {/* Kotak Informasi & Live Countdown Timer 3 Menit */}
            {!hasSentEmail && !isTimerActive && (
                <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 flex items-start gap-3 text-left">
                    <Send className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                        <p className="font-semibold mb-1 text-sm">Kirim Tautan Verifikasi</p>
                        <p>Silakan tekan tombol <strong>"KIRIM EMAIL VERIFIKASI"</strong> di bawah untuk mendapatkan tautan verifikasi ke email Anda. Tautan akan berlaku selama <strong>3 menit</strong>.</p>
                    </div>
                </div>
            )}

            {isTimerActive && (
                <div className="mb-6 p-5 rounded-2xl border bg-amber-50/80 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/60 shadow-sm transition-all duration-300">
                    <div className="flex flex-col items-center text-center">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                                Sisa Waktu Berlaku Tautan
                            </span>
                        </div>
                        <div className="text-3xl font-black font-mono tracking-widest text-amber-600 dark:text-amber-400 my-1">
                            {formatTime(timeLeft)}
                        </div>
                        <p className="text-xs text-amber-700/90 dark:text-amber-300/80 leading-relaxed max-w-xs mt-1">
                            Email verifikasi telah dikirim. Silakan buka inbox/spam email Anda dan klik tautan sebelum waktu habis.
                        </p>
                        {/* Progress Bar */}
                        <div className="w-full bg-amber-200/60 dark:bg-amber-950/60 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div 
                                className="bg-amber-500 dark:bg-amber-400 h-full transition-all duration-1000 ease-linear rounded-full"
                                style={{ width: `${(timeLeft / TIMER_DURATION) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {isExpired && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3 text-left">
                    <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                        <p className="font-bold text-sm mb-1 text-rose-900 dark:text-rose-200">Tautan Kadaluarsa</p>
                        <p>Masa berlaku 3 menit telah habis. Tautan verifikasi sebelumnya sudah tidak dapat digunakan. Silakan tekan tombol di bawah untuk meminta tautan baru.</p>
                    </div>
                </div>
            )}

            {status === 'verification-link-sent' && (
                <div className="mb-6 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800 flex items-center gap-2">
                    <MailCheck className="w-4 h-4 shrink-0" />
                    <span>Tautan verifikasi baru telah berhasil dikirim ke alamat email Anda.</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div className="flex flex-col gap-3">
                    <PrimaryButton 
                        className={`w-full flex justify-center py-3.5 rounded-xl font-bold transition-all duration-300 ${
                            isTimerActive || processing
                                ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-700 dark:to-teal-600 shadow-lg shadow-blue-500/20 dark:shadow-blue-900/40 hover:scale-[1.02] text-white dark:text-white'
                        }`}
                        disabled={processing || isTimerActive}
                    >
                        <RefreshCcw className={`mr-2 h-4 w-4 ${processing ? 'animate-spin' : ''}`} />
                        {isTimerActive 
                            ? `TUNGGU TIMER SELESAI (${formatTime(timeLeft)})`
                            : (hasSentEmail ? 'KIRIM ULANG EMAIL VERIFIKASI' : 'KIRIM EMAIL VERIFIKASI')
                        }
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
