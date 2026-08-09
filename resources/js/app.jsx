import React from 'react';

import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { toast } from 'sonner';

// Global Error Handling
router.on('invalid', (event) => {
    const status = event.detail.response.status;

    // 1. Tangani Session Expired (419)
    if (status === 419) {
        event.preventDefault();
        toast.error('Sesi Anda telah berakhir. Silakan login kembali.', {
            duration: 5000,
        });
        router.get('/login');
        return false;
    }

    // 2. Tangani Forbidden Access (403)
    if (status === 403) {
        event.preventDefault();
        toast.warning('IZIN ✋, Anda tidak memiliki akses untuk aksi ini.', {
            description: 'Silakan hubungi administrator jika ini adalah kesalahan.',
            duration: 5000,
        });
        return false;
    }

    // 3. Tangani Server Error (500)
    if (status === 500) {
        event.preventDefault();
        toast.error('Terjadi kesalahan pada server.', {
            description: 'Kami sedang berusaha memperbaikinya. Silakan coba lagi nanti.',
        });
        return false;
    }
});

// Global Indonesian HTML5 Form Validation Messages
if (typeof window !== 'undefined') {
    document.addEventListener(
        'invalid',
        (event) => {
            const el = event.target;
            if (!el || !(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)) {
                return;
            }

            if (el.validity.valueMissing) {
                el.setCustomValidity('Harap isi bidang ini.');
            } else if (el.validity.typeMismatch) {
                if (el.type === 'email') {
                    el.setCustomValidity('Harap masukkan alamat email yang valid.');
                } else if (el.type === 'url') {
                    el.setCustomValidity('Harap masukkan tautan (URL) yang valid.');
                }
            } else if (el.validity.patternMismatch) {
                el.setCustomValidity('Harap sesuaikan dengan format yang diminta.');
            } else if (el.validity.rangeUnderflow) {
                el.setCustomValidity(`Nilai harus minimal ${el.min}.`);
            } else if (el.validity.rangeOverflow) {
                el.setCustomValidity(`Nilai maksimal adalah ${el.max}.`);
            } else if (el.validity.tooShort) {
                el.setCustomValidity(`Harap perpanjang teks ini hingga minimal ${el.minLength} karakter.`);
            } else if (el.validity.tooLong) {
                el.setCustomValidity(`Harap perpendek teks ini hingga maksimal ${el.maxLength} karakter.`);
            }
        },
        true
    );

    const clearValidity = (event) => {
        const el = event.target;
        if (el && (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement)) {
            el.setCustomValidity('');
        }
    };

    document.addEventListener('input', clearValidity, true);
    document.addEventListener('change', clearValidity, true);
}

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#FFC107',
    },
});
