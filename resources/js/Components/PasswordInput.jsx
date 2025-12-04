import React, { useState } from 'react';
import TextInput from '@/Components/TextInput';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput(props) {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(prev => !prev);
    };

    // Tentukan tipe input: 'text' jika terlihat, 'password' jika disembunyikan
    const inputType = passwordVisible ? 'text' : 'password';

    return (
        <div className="relative">
            <TextInput
                {...props} // Meneruskan semua props (id, name, value, onChange, autoComplete, className)
                type={inputType}
                className={`w-full pr-10 ${props.className || ''}`} // Tambahkan padding kanan
            />

            <button
                type="button"
                onClick={togglePasswordVisibility}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                title={passwordVisible ? 'Sembunyikan password' : 'Tampilkan password'}
            >
                {passwordVisible ?
                    <Eye className="w-4 h-4"/> :
                    <EyeOff className="w-4 h-4"/>}
            </button>
        </div>
    );
}