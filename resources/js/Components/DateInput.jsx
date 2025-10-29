// resources/js/Components/DateInput.jsx

import React, { useState, useRef, useEffect } from 'react';
import Calendar from './Calendar'; 
import TextInput from './TextInput'; 
// Asumsi Anda juga menggunakan TextInput di file yang memanggil DateInput

export default function DateInput({ id, value, onChange, className = '' }) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null); // Ref untuk TextInput

    // Konversi nilai (string YYYY-MM-DD) ke objek Date
    const dateValue = value ? new Date(value + 'T00:00:00') : null; 
    
    // Format tampilan yang akan ditampilkan di TextInput
    const formattedDate = dateValue && !isNaN(dateValue) ? dateValue.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }) : '';

    // Handler klik di luar komponen untuk menutup kalender
    useEffect(() => {
        function handleClickOutside(event) {
            // Tutup jika klik terjadi di luar wrapper, kecuali jika kalender sedang terbuka
            // dan klik terjadi pada elemen yang berfokus pada TextInput
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);
    
    const handleDateSelect = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        onChange(`${year}-${month}-${day}`);
        setIsOpen(false);
    };

    const handleIconClick = () => {
        setIsOpen(prev => !prev);
        // Opsional: Fokuskan input saat ikon diklik
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }

    // Kelas untuk Ikon: Berubah warna saat kalender terbuka (isOpen)
    const iconClasses = `w-5 h-5 transition-colors duration-150 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-10 
        ${isOpen 
            ? 'text-indigo-500 dark:text-indigo-400' 
            : 'text-gray-400 dark:text-gray-500 hover:text-indigo-500 dark:hover:text-indigo-400'
        }`;
    
    // Perhatikan: Padding kanan pada TextInput disesuaikan agar tidak menutupi ikon.
    // Kita tambahkan 'pr-10' untuk memberikan ruang.
    const inputPaddingClass = 'pr-10'; 


    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            
            {/* 1. TEXT INPUT UTAMA */}
            {/* Ini adalah elemen utama, selalu terlihat seperti text input */}
            <TextInput
                id={id}
                name={id}
                ref={inputRef}
                type="text" // Type text agar tidak memicu native date picker
                readOnly // Mencegah user mengedit teks secara manual
                value={formattedDate || ''}
                className={`block w-full cursor-pointer ${inputPaddingClass}`} 
                placeholder="Pilih Tanggal"
            />
            
            {/* 2. IKON KALENDER (BUTTON PENGATUR OPEN/CLOSE) */}
            <button
                type="button"
                className={iconClasses}
                onClick={handleIconClick}
                aria-label="Toggle Calendar"
            >
                {/* Ikon Kalender */}
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h.01M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </button>


            {/* 3. POPUP KALENDER */}
            {isOpen && (
                <div className="absolute z-50 mt-2 right-0">
                    <Calendar 
                        selectedDate={dateValue} 
                        onDateChange={handleDateSelect} 
                    />
                </div>
            )}
        </div>
    );
}