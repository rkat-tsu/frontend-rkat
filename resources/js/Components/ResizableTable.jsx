import React from 'react';
import { useResizableTable } from '@/hooks/useResizableTable';

/**
 * Komponen Tabel dengan kemampuan Resize Kolom (Resizable Columns)
 * Pengguna dapat menarik batas kolom untuk mengubah ukuran sesuka hati.
 * Ukuran kolom tersimpan otomatis di localStorage.
 */
export default function ResizableTable({
    storageKey,
    className = '',
    children,
    minWidth = 50,
    defaultWidths = {},
    ...props
}) {
    const { tableRef } = useResizableTable(storageKey, { minWidth, defaultWidths });

    return (
        <table
            ref={tableRef}
            className={`border-collapse ${className}`}
            {...props}
        >
            {children}
        </table>
    );
}

export { useResizableTable };

