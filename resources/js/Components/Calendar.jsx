// resources/js/Components/Calendar.jsx

import React, { useState } from 'react';

// ====================================================================
// UTILITY FUNCTIONS (Tidak Berubah)
// ====================================================================
const getDaysInMonth = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    while (date.getMonth() === month) {
        days.push(new Date(date));
        date.setDate(date.getDate() + 1);
    }
    return days;
};

const getPaddingDays = (year, month) => {
    const firstDayOfMonth = new Date(year, month, 1).getDay(); 
    const paddingStart = firstDayOfMonth; 
    
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();

    const paddingDays = [];
    for (let i = paddingStart; i > 0; i--) {
        paddingDays.push(daysInPrevMonth - i + 1);
    }
    return paddingDays;
};


export default function Calendar({ selectedDate, onDateChange }) {
    const initialDate = selectedDate instanceof Date && !isNaN(selectedDate) ? selectedDate : new Date();
    const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
    const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
    
    // NEW STATE: Mengontrol tampilan: 'day', 'month', atau 'year'
    const [viewMode, setViewMode] = useState('day'); 
    const [transitionKey, setTransitionKey] = useState(0); 
    
    // Data Kalender
    const days = getDaysInMonth(currentYear, currentMonth);
    const paddingDays = getPaddingDays(currentYear, currentMonth);
    const remainingPadding = 42 - (paddingDays.length + days.length);
    const nextPaddingDays = Array.from({ length: remainingPadding }, (_, i) => i + 1);

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    // ====================================================================
    // HANDLERS
    // ====================================================================
    
    const changeView = (mode) => {
        setTransitionKey(prev => prev + 1);
        setViewMode(mode);
    };
    
    // Ketika bulan dipilih dari tampilan 'month'
    const handleMonthSelect = (monthIndex) => {
        setCurrentMonth(monthIndex);
        changeView('day'); // Kembali ke tampilan tanggal
    };

    // Ketika tahun dipilih dari tampilan 'year'
    const handleYearSelect = (year) => {
        setCurrentYear(year);
        changeView('month'); // Berpindah ke tampilan bulan
    };

    const handlePrev = () => {
        setTransitionKey(prev => prev + 1);
        if (viewMode === 'day') {
            setCurrentMonth(prev => {
                if (prev === 0) {
                    setCurrentYear(prevYear => prevYear - 1);
                    return 11;
                }
                return prev - 1;
            });
        } else if (viewMode === 'year') {
            // Pindah 12 tahun sekaligus
            setCurrentYear(prev => prev - 12); 
        } else if (viewMode === 'month') {
            // Pindah tahun
            setCurrentYear(prevYear => prevYear - 1);
        }
    };

    const handleNext = () => {
        setTransitionKey(prev => prev + 1);
        if (viewMode === 'day') {
            setCurrentMonth(prev => {
                if (prev === 11) {
                    setCurrentYear(prevYear => prevYear + 1);
                    return 0;
                }
                return prev + 1;
            });
        } else if (viewMode === 'year') {
            // Pindah 12 tahun sekaligus
            setCurrentYear(prev => prev + 12);
        } else if (viewMode === 'month') {
             // Pindah tahun
            setCurrentYear(prevYear => prevYear + 1);
        }
    };

    const handleDayClick = (day) => {
        if (onDateChange) {
            onDateChange(day);
        }
    };

    const isSelected = (day) => {
        if (!selectedDate || isNaN(selectedDate)) return false;
        return (
            day.getDate() === selectedDate.getDate() &&
            day.getMonth() === selectedDate.getMonth() &&
            day.getFullYear() === selectedDate.getFullYear()
        );
    }
    
    // ====================================================================
    // RENDER: SUB-KOMPONEN
    // ====================================================================

    const renderMonthView = () => (
        <div key={transitionKey} className="grid grid-cols-3 gap-2 text-center transition-opacity duration-300 ease-in-out" style={{ opacity: 1 }}>
            {monthNames.map((month, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => handleMonthSelect(index)}
                    className={`
                        w-full h-10 flex items-center justify-center rounded-lg py-2 text-sm font-medium
                        border border-gray-200 dark:border-gray-700
                        ${currentMonth === index && new Date().getFullYear() === currentYear 
                            ? 'bg-indigo-500 text-white font-bold' 
                            : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                        transition duration-100
                    `}
                >
                    {month.substring(0, 3)} {/* Tampilkan 3 huruf bulan */}
                </button>
            ))}
        </div>
    );

    const renderYearView = () => {
        const startYear = currentYear - (currentYear % 12); // Mulai dari kelipatan 12 terdekat di bawah
        const years = Array.from({ length: 12 }, (_, i) => startYear + i);

        return (
             <div key={transitionKey} className="grid grid-cols-3 gap-2 text-center transition-opacity duration-300 ease-in-out" style={{ opacity: 1 }}>
                {years.map((year) => (
                    <button
                        key={year}
                        type="button"
                        onClick={() => handleYearSelect(year)}
                        className={`
                            w-full h-10 flex items-center justify-center rounded-lg py-2 text-sm font-medium
                            border border-gray-200 dark:border-gray-700
                            ${year === new Date().getFullYear()
                                ? 'bg-indigo-500 text-white font-bold'
                                : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }
                            transition duration-100
                        `}
                    >
                        {year}
                    </button>
                ))}
            </div>
        );
    };

    const renderDayView = () => (
        <>
            {/* Nama Hari (Min - Sab) */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400 mb-2">
                {weekDays.map(day => (
                    <span key={day} className={day === 'Min' ? 'text-red-500 dark:text-red-400' : ''}>{day}</span>
                ))}
            </div>

            {/* Tanggal dengan Animasi Smooth */}
            <div 
                key={transitionKey}
                className="grid grid-cols-7 gap-1 text-center text-sm transition-opacity duration-300 ease-in-out"
                style={{ opacity: 1 }}
            >
                {/* Padding Days (Bulan Sebelumnya) */}
                {paddingDays.map((day, index) => (
                    <span 
                        key={`prev-${index}`} 
                        className="py-1 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    >
                        {day}
                    </span>
                ))}

                {/* Days In Month */}
                {days.map((day, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => handleDayClick(day)}
                        className={`
                            w-full h-8 flex items-center justify-center rounded-lg 
                            ${isSelected(day) 
                                ? 'bg-indigo-600 text-white font-bold' 
                                : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }
                            ${day.getDay() === 0 ? 'text-red-500 dark:text-red-400' : ''}
                            transition duration-100
                        `}
                    >
                        {day.getDate()}
                    </button>
                ))}
                
                {/* Padding Days (Bulan Berikutnya) */}
                 {nextPaddingDays.map((day, index) => (
                    <span 
                        key={`next-${index}`} 
                        className="py-1 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                    >
                        {day}
                    </span>
                ))}
            </div>
        </>
    );

    // ====================================================================
    // RENDER UTAMA
    // ====================================================================
    
    let headerTitle, headerAction;
    if (viewMode === 'day') {
        headerTitle = (
            <>
                <button 
                    type="button"
                    onClick={() => changeView('month')}
                    className="font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                    {monthNames[currentMonth]}
                </button>
                {' '}
                <button
                    type="button"
                    onClick={() => changeView('year')}
                    className="font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                    {currentYear}
                </button>
            </>
        );
        headerAction = handleNext;
    } else if (viewMode === 'month') {
        headerTitle = (
            <button
                type="button"
                onClick={() => changeView('year')}
                className="text-lg font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
                {currentYear}
            </button>
        );
        headerAction = handleNext;
    } else if (viewMode === 'year') {
        const startYear = currentYear - (currentYear % 12);
        headerTitle = (
             <span className="text-lg font-semibold">{startYear} - {startYear + 11}</span>
        );
        headerAction = handleNext;
    }

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border dark:border-gray-700 w-80 text-gray-900 dark:text-gray-100">
            {/* Header Kalender */}
            <div className="flex justify-between items-center mb-4 relative">
                
                {/* Tombol Navigasi Sebelumnya */}
                <button type="button" onClick={handlePrev} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>

                {/* Judul yang Dapat Diklik */}
                <span className="text-lg">
                    {headerTitle}
                </span>
                
                {/* Tombol Navigasi Berikutnya */}
                <button type="button" onClick={headerAction} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            </div>

            {/* KONTEN KALENDER BERDASARKAN viewMode */}
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'year' && renderYearView()}
            {viewMode === 'day' && renderDayView()}
            
        </div>
    );
}