// components/ApplicationLogo.jsx

import React from 'react';

// Terima prop 'isMinimized' dari parent
export default function ApplicationLogo({ isMinimized = false, ...props }) {
    
    // Tentukan sumber gambar berdasarkan status
    const logoSrc = isMinimized 
        ? "/img/logo-tsu.svg"      // Logo kecil/minimalis
        : "/img/logo-full-tsu.svg"; // Logo penuh/maximize

    // Anda bisa mengontrol ukuran melalui prop atau class Tailwind
    const defaultStyle = { 
        width: isMinimized ? '32px' : '100px', 
        height: 'auto' 
    };

    return (
        <img 
            src={logoSrc} 
            alt="Logo TSU" 
            style={defaultStyle}
            // Meneruskan props Tailwind (misalnya 'className')
            {...props}
        />
    );
}