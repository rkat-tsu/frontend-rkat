import * as XLSX from 'xlsx';

/**
 * Export JSON data array to an Excel file (.xlsx)
 * @param {Array<Object>} data - Array of objects representing rows
 * @param {string} filename - Output filename (e.g., 'Data_RKAT.xlsx')
 * @param {string} sheetName - Excel sheet tab name
 */
export const exportToExcel = (data, filename = 'Export.xlsx', sheetName = 'Data') => {
    if (!data || data.length === 0) {
        alert('Tidak ada data untuk diexport');
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Auto-fit column widths based on maximum character count per column
    const keys = Object.keys(data[0]);
    const colWidths = keys.map(key => {
        let maxLen = key.length;
        data.forEach(row => {
            const cellValue = row[key] != null ? String(row[key]) : '';
            if (cellValue.length > maxLen) {
                maxLen = cellValue.length;
            }
        });
        return { wch: Math.min(Math.max(maxLen + 4, 10), 60) };
    });
    worksheet['!cols'] = colWidths;

    // Ensure filename ends with .xlsx
    const finalFilename = filename.toLowerCase().endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    XLSX.writeFile(workbook, finalFilename);
};
