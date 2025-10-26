// resources/js/Components/RupiahInput.jsx

import React, { useState, useEffect } from 'react';
import TextInput from './TextInput'; // Asumsi TextInput ada di direktori yang sama

// UTILITY FUNCTIONS
const formatRupiah = (angka) => {
    return `Rp. ${Number(angka).toLocaleString('id-ID', { minimumFractionDigits: 2 })}`;
};

const parseRupiah = (rupiah) => {
    if (!rupiah) return 0;
    // Menghilangkan semua karakter kecuali angka, koma, dan titik
    const clean = rupiah.replace(/[^,\d]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
};

// Komponen RupiahInput
const RupiahInput = React.forwardRef(({ value, onChange, ...props }, ref) => {
    
    // State untuk menyimpan nilai yang diformat saat ditampilkan
    const [displayValue, setDisplayValue] = useState(value ? formatRupiah(value) : 'Rp. 0,00');

    useEffect(() => {
        // Update displayValue saat nilai (value) dari luar berubah
        setDisplayValue(value ? formatRupiah(value) : 'Rp. 0,00');
    }, [value]);

    const handleFocus = () => {
        // Saat fokus, tampilkan hanya angka mentah untuk memudahkan edit
        setDisplayValue(value || '');
    };

    const handleBlur = () => {
        // Saat blur, format kembali ke Rupiah
        const parsedValue = parseRupiah(displayValue);
        setDisplayValue(formatRupiah(parsedValue));
        
        // Memastikan komponen induk mendapatkan nilai numerik yang bersih
        if (onChange) {
            // Mengirim balik nilai numerik bersih
            onChange({ target: { value: parsedValue } });
        }
    };

    const handleChange = (e) => {
        // Saat mengetik, biarkan nilai apa adanya (tanpa Rp)
        setDisplayValue(e.target.value);
    };

    return (
        <TextInput
            ref={ref}
            value={displayValue}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            type="text"
            {...props}
        />
    );
});

export default RupiahInput;