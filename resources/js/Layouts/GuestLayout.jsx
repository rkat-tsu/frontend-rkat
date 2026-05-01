import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import { Toaster } from '@/Components/ui/sonner';
import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

const THEME_STATE_KEY = 'app_theme_preference';

export default function GuestLayout({ children }) {
    const [theme, setTheme] = useState('light');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem(THEME_STATE_KEY);
            if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                setTheme('dark');
                document.documentElement.classList.add('dark');
            } else {
                setTheme('light');
                document.documentElement.classList.remove('dark');
            }
        }
    }, []);

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
            document.documentElement.classList.add('dark');
            localStorage.setItem(THEME_STATE_KEY, 'dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
            localStorage.setItem(THEME_STATE_KEY, 'light');
        }
    };

    return (
        <div
            className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100 dark:bg-gray-950 transition-colors duration-500 relative px-4"
            style={{
                backgroundImage: 'url("/img/backgrounds/login-bg.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundColor: 'rgba(0,0,0,0.6)',
                backgroundBlendMode: 'overlay',
            }}
        >
            <button
                onClick={toggleTheme}
                className="absolute top-4 left-4 p-2 rounded-full bg-white/20 dark:bg-gray-800/40 backdrop-blur-sm text-white hover:bg-white/30 dark:hover:bg-gray-800/60 transition-colors shadow-lg z-50 flex items-center justify-center"
                aria-label="Toggle Dark Mode"
            >
                {theme === 'dark' ? <Moon size={24} className="text-indigo-400" /> : <Sun size={24} className="text-amber-400" />}
            </button>

            <Toaster position="top-center" richColors />
            
            <div className="w-full overflow-hidden bg-white shadow-2xl sm:max-w-md rounded-2xl dark:bg-gray-800 transform transition-all duration-500">
                {/* Header Logo dengan Gradasi - Padding dikurangi agar lebih rekat */}
                <div className="bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-700 dark:to-teal-600 pt-8 pb-14 flex justify-center">
                    <Link href="/" className="hover:scale-105 transition-transform duration-300">
                        <ApplicationLogo className="w-32 h-auto brightness-0 invert drop-shadow-md" />
                    </Link>
                </div>

                {/* Area Konten dengan lengkungan U terbalik - Jarak lebih rapat */}
                <div className="-mt-10 bg-white dark:bg-gray-800 px-6 pt-6 pb-10 rounded-t-[40px] relative z-10">
                    {children}
                </div>
            </div>
        </div>
    );
}
