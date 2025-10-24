// resources/js/Pages/Dashboard.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React from 'react';

// Data statis sebagai placeholder, Anda harus mengambil ini dari controller
const DUMMY_STATS = {
    total: 20,
    pending: 10,
    approved: 7,
    rejected: 3,
};

const DUMMY_RKAT_TERBARU = [
    { unit: 'F. Vokasi', judul: 'Lorem ipsum dolor sit amet, consectetur...', waktu: '5 menit yang lalu', status: 'Menunggu Persetujuan' },
    { unit: 'BEM', judul: 'Lorem ipsum dolor sit amet, consectetur...', waktu: '1 Jam yang lalu', status: 'Approve' },
    { unit: 'CIT', judul: 'Lorem ipsum dolor sit amet, consectetur...', waktu: '2 Jam yang lalu', status: 'Pending' },
    { unit: 'BAKPU', judul: 'Lorem ipsum dolor sit amet, consectetur...', waktu: '3 Jam yang lalu', status: 'Ditolak' },
];

export default function Dashboard({ auth }) {
    
    // Fungsi bantuan untuk mendapatkan style dan emoji status
    const getStatusInfo = (status) => {
        switch (status) {
            case 'Menunggu Persetujuan':
                return { text: 'Menunggu Persetujuan', color: 'text-yellow-600 dark:text-yellow-400', style: 'border-yellow-300' };
            case 'Approve':
                return { text: 'Approve', color: 'text-green-600 dark:text-green-400', style: 'border-green-300' };
            case 'Pending':
                return { text: 'Pending', color: 'text-yellow-600 dark:text-yellow-400', style: 'border-yellow-300' };
            case 'Ditolak':
                return { text: 'Ditolak', color: 'text-red-600 dark:text-red-400', style: 'border-red-300' };
            default:
                return { text: status, color: 'text-gray-600', style: 'border-gray-300' };
        }
    };

    const statisticCards = [
        { label: 'Total RKAT', value: DUMMY_STATS.total, icon: '📝', color: 'bg-blue-100 text-blue-800' },
        { label: 'Pending', value: DUMMY_STATS.pending, icon: '⏳', color: 'bg-yellow-100 text-yellow-800' },
        { label: 'Approve', value: DUMMY_STATS.approved, icon: '✅', color: 'bg-green-100 text-green-800' },
        { label: 'Ditolak', value: DUMMY_STATS.rejected, icon: '❌', color: 'bg-red-100 text-red-800' },
    ];
    
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Selamat datang! {auth.user.peran?.toUpperCase() || auth.user.role?.toUpperCase() || 'PENGGUNA'}</p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* STATISTIK RKAT CARDS (Sesuai Gambar Anda) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {statisticCards.map((card, index) => (
                                <div key={index} className={`p-6 rounded-lg shadow-md ${card.color} dark:bg-opacity-20 flex items-center justify-between`}>
                                    <div className="text-left">
                                        <div className="text-sm font-medium">{card.label}</div>
                                        <div className="text-5xl font-extrabold">{card.value}</div>
                                    </div>
                                    <span className="text-5xl">{card.icon}</span>
                                </div>
                            ))}
                        </div>
                        
                        {/* RKAT TERBARU SECTION */}
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">RKAT Terbaru</h3>
                        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                            
                            {DUMMY_RKAT_TERBARU.map((rkat, index) => {
                                const info = getStatusInfo(rkat.status);
                                return (
                                    <div 
                                        key={index} 
                                        className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition duration-100"
                                    >
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900 dark:text-gray-100">{rkat.unit}</div>
                                            <div className="text-sm text-gray-600 dark:text-gray-400 truncate w-64 md:w-auto">{rkat.judul}</div>
                                        </div>
                                        
                                        <div className="text-sm text-gray-500 dark:text-gray-400 me-4 hidden sm:block">{rkat.waktu}</div>
                                        
                                        <div className="text-sm font-semibold">
                                            <span className={`px-3 py-1 text-xs rounded-full ${info.color} border ${info.style} bg-opacity-20`}>
                                                {info.text}
                                            </span>
                                            
                                            {/* Icon Panah atau Check */}
                                            {rkat.status === 'Menunggu Persetujuan' && (
                                                <svg className="w-4 h-4 ms-2 inline-block align-middle" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-3.293-3.293a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Tombol Tampilkan Lebih Banyak */}
                            <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
                                {/* Ganti dengan Link Inertia jika Anda memiliki route monitoring */}
                                <button className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline flex items-center justify-center mx-auto">
                                    Tampilkan lebih banyak
                                    <svg className="w-4 h-4 ms-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}