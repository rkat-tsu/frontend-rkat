import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook untuk membuat tabel HTML dapat di-resize kolomnya (resizable columns)
 * dengan drag & drop di batas header kolom.
 * 
 * Ukuran kolom tersimpan otomatis di localStorage berdasarkan `storageKey`.
 * Double click pada resizer handle akan me-reset lebar kolom tersebut ke default.
 *
 * @param {string} storageKey - Kunci unik untuk menyimpan lebar kolom di localStorage
 * @param {Object} options - Konfigurasi opsional (minWidth, defaultWidths)
 * @returns {{ tableRef: React.RefObject<HTMLTableElement>, resetWidths: () => void }}
 */
export function useResizableTable(storageKey, options = {}) {
    const tableRef = useRef(null);
    const { minWidth = 50, defaultWidths = {} } = options;
    const fullStorageKey = storageKey ? `rkat_table_widths_${storageKey}` : null;

    // Load saved widths from localStorage
    const getSavedWidths = useCallback(() => {
        if (!fullStorageKey || typeof window === 'undefined') return {};
        try {
            const saved = localStorage.getItem(fullStorageKey);
            return saved ? JSON.parse(saved) : {};
        } catch {
            return {};
        }
    }, [fullStorageKey]);

    // Save widths to localStorage
    const saveWidths = useCallback((widths) => {
        if (!fullStorageKey || typeof window === 'undefined') return;
        try {
            localStorage.setItem(fullStorageKey, JSON.stringify(widths));
        } catch {
            // Ignore quota exceeded errors
        }
    }, [fullStorageKey]);

    // Reset widths to default
    const resetWidths = useCallback(() => {
        if (fullStorageKey && typeof window !== 'undefined') {
            localStorage.removeItem(fullStorageKey);
        }
        if (!tableRef.current) return;
        const ths = tableRef.current.querySelectorAll('thead th');
        ths.forEach((th, index) => {
            const def = defaultWidths[index];
            if (def) {
                th.style.width = typeof def === 'number' ? `${def}px` : def;
                th.style.minWidth = typeof def === 'number' ? `${def}px` : def;
            } else {
                th.style.width = '';
                th.style.minWidth = '';
            }
        });
    }, [fullStorageKey, defaultWidths]);

    useEffect(() => {
        const table = tableRef.current;
        if (!table) return;

        const headerRow = table.querySelector('thead tr');
        if (!headerRow) return;

        const ths = Array.from(headerRow.querySelectorAll('th'));
        if (ths.length === 0) return;

        const savedWidths = getSavedWidths();

        // 1. Terapkan lebar yang tersimpan atau default
        const applyWidthsAndResizers = () => {
            const currentSavedWidths = getSavedWidths();

            ths.forEach((th, index) => {
                const saved = currentSavedWidths[index] || defaultWidths[index];
                if (saved) {
                    const widthVal = typeof saved === 'number' ? `${saved}px` : saved;
                    th.style.width = widthVal;
                    th.style.minWidth = widthVal;
                }
            });

            ths.forEach((th, index) => {
                if (th.classList.contains('no-resize')) return;

                if (window.getComputedStyle(th).position === 'static') {
                    th.style.position = 'relative';
                }

                let resizer = th.querySelector('.table-col-resizer');
                if (!resizer) {
                    resizer = document.createElement('div');
                    resizer.className = 'table-col-resizer';
                    resizer.title = 'Tarik untuk mengubah ukuran kolom (Klik 2x untuk reset)';
                    
                    resizer.style.position = 'absolute';
                    resizer.style.top = '0';
                    resizer.style.right = '-5px';
                    resizer.style.width = '10px';
                    resizer.style.height = '100%';
                    resizer.style.cursor = 'col-resize';
                    resizer.style.userSelect = 'none';
                    resizer.style.touchAction = 'none';
                    resizer.style.zIndex = '20';
                    resizer.style.display = 'flex';
                    resizer.style.justifyContent = 'center';
                    resizer.style.alignItems = 'center';

                    const line = document.createElement('div');
                    line.style.width = '2px';
                    line.style.height = '60%';
                    line.style.borderRadius = '2px';
                    line.style.backgroundColor = 'transparent';
                    line.style.pointerEvents = 'none';
                    line.style.transition = 'background-color 0.15s ease, height 0.15s ease';
                    resizer.appendChild(line);

                    resizer.addEventListener('mouseenter', () => {
                        line.style.backgroundColor = '#14b8a6'; // teal-500
                        line.style.height = '100%';
                    });
                    resizer.addEventListener('mouseleave', () => {
                        if (!resizer.dataset.dragging) {
                            line.style.backgroundColor = 'transparent';
                            line.style.height = '60%';
                        }
                    });

                    th.appendChild(resizer);
                }

                const line = resizer.firstChild;

                const onPointerDown = (e) => {
                    // Hanya izinkan klik kiri
                    if (e.button !== 0) return;

                    e.preventDefault();
                    e.stopPropagation();

                    try {
                        resizer.setPointerCapture(e.pointerId);
                    } catch {}

                    resizer.dataset.dragging = 'true';
                    if (line) {
                        line.style.backgroundColor = '#0d9488'; // teal-600
                        line.style.height = '100%';
                    }

                    const startX = e.clientX;
                    const startWidth = th.getBoundingClientRect().width;
                    document.body.style.cursor = 'col-resize';
                    document.body.style.userSelect = 'none';

                    let hasMoved = false;

                    const onPointerMove = (moveEvent) => {
                        const deltaX = moveEvent.clientX - startX;
                        if (Math.abs(deltaX) > 1) {
                            hasMoved = true;
                        }
                        const newWidth = Math.max(minWidth, Math.round(startWidth + deltaX));
                        th.style.width = `${newWidth}px`;
                        th.style.minWidth = `${newWidth}px`;
                    };

                    const onPointerUp = (upEvent) => {
                        if (upEvent) {
                            upEvent.preventDefault();
                            upEvent.stopPropagation();
                        }

                        try {
                            resizer.releasePointerCapture(e.pointerId);
                        } catch {}

                        delete resizer.dataset.dragging;
                        if (line) {
                            line.style.backgroundColor = 'transparent';
                            line.style.height = '60%';
                        }

                        document.body.style.cursor = '';
                        document.body.style.userSelect = '';

                        window.removeEventListener('pointermove', onPointerMove);
                        window.removeEventListener('pointerup', onPointerUp);
                        window.removeEventListener('pointercancel', onPointerUp);

                        if (hasMoved) {
                            const currentWidths = {};
                            ths.forEach((cell, i) => {
                                currentWidths[i] = Math.round(cell.getBoundingClientRect().width);
                            });
                            saveWidths(currentWidths);
                        }
                    };

                    window.addEventListener('pointermove', onPointerMove);
                    window.addEventListener('pointerup', onPointerUp);
                    window.addEventListener('pointercancel', onPointerUp);
                };

                const onDoubleClick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    th.style.width = '';
                    th.style.minWidth = '';
                    
                    const currentWidths = getSavedWidths();
                    delete currentWidths[index];
                    saveWidths(currentWidths);
                };

                const onClickResizer = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                };

                resizer.onpointerdown = onPointerDown;
                resizer.ondblclick = onDoubleClick;
                resizer.onclick = onClickResizer;
            });
        };

        applyWidthsAndResizers();
    }, [getSavedWidths, saveWidths, minWidth, defaultWidths]);

    return { tableRef, resetWidths };
}

export default useResizableTable;
