import * as XLSX from 'xlsx';

/**
 * Export JSON data array to an Excel file (.xlsx) with styled header contrast
 * @param {Array<Object>} data - Array of objects representing rows
 * @param {string} filename - Output filename (e.g., 'Data_RKAT.xlsx')
 * @param {string} sheetName - Excel sheet tab name
 */
export const exportToExcel = (data, filename = 'Export.xlsx', sheetName = 'Data') => {
    if (!data || data.length === 0) {
        alert('Tidak ada data untuk diexport');
        return;
    }

    const keys = Object.keys(data[0]);

    // Create an HTML table element with styled headers for visual contrast
    const table = document.createElement('table');

    // Header Row with Teal background & white bold text for contrast
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    keys.forEach(key => {
        const th = document.createElement('th');
        th.innerText = key;
        th.style.backgroundColor = '#0F766E'; // Dark Teal header background
        th.style.color = '#FFFFFF';           // White bold text
        th.style.fontWeight = 'bold';
        th.style.fontSize = '12px';
        th.style.padding = '8px 12px';
        th.style.textAlign = 'center';
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Body Rows
    const tbody = document.createElement('tbody');
    data.forEach((row, rowIndex) => {
        const tr = document.createElement('tr');
        if (rowIndex % 2 === 1) {
            tr.style.backgroundColor = '#F9FAFB'; // Zebra striping
        }
        keys.forEach(key => {
            const td = document.createElement('td');
            const val = row[key] != null ? row[key] : '';
            td.innerText = val;
            td.style.padding = '6px 10px';
            if (typeof val === 'number') {
                td.style.textAlign = 'right';
            } else {
                td.style.textAlign = 'left';
            }
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    // Convert HTML table to sheet to preserve styles
    const worksheet = XLSX.utils.table_to_sheet(table);

    // Auto-fit column widths based on maximum character count per column
    const colWidths = keys.map(key => {
        let maxLen = key.length;
        data.forEach(row => {
            const cellValue = row[key] != null ? String(row[key]) : '';
            if (cellValue.length > maxLen) {
                maxLen = cellValue.length;
            }
        });
        return { wch: Math.min(Math.max(maxLen + 4, 12), 60) };
    });
    worksheet['!cols'] = colWidths;

    // SheetJS cell styling properties
    keys.forEach((key, colIndex) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: colIndex });
        if (worksheet[cellAddress]) {
            worksheet[cellAddress].s = {
                fill: {
                    patternType: 'solid',
                    fgColor: { rgb: '0F766E' },
                    bgColor: { rgb: '0F766E' }
                },
                font: {
                    name: 'Calibri',
                    sz: 11,
                    bold: true,
                    color: { rgb: 'FFFFFF' }
                },
                alignment: {
                    vertical: 'center',
                    horizontal: 'center'
                }
            };
        }
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Ensure filename ends with .xlsx
    const finalFilename = filename.toLowerCase().endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    XLSX.writeFile(workbook, finalFilename);
};
