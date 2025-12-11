// resources/js/Pages/Dashboard.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React from 'react';
// ICON IMPORTS
import { File, FileCheck, FileClock, FileX, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';


// Komponen Helper untuk menampilkan Ikon Lucide
const StatisticIcon = ({ Icon, colorClass }) => (
    <Icon size={48} className={`${colorClass} dark:text-opacity-90`} />
);

export default function Dashboard({ auth, stats, rkatTerbaru }) {
    
    const getStatusInfo = (status) => {
        switch (status) {
            case 'Menunggu Persetujuan':
            case 'Pending': // Pending dan Menunggu Persetujuan dianggap sama
                return { text: status, color: 'text-yellow-600 dark:text-yellow-400', style: 'border-yellow-300' };
            case 'Approve':
                return { text: 'Approve', color: 'text-green-600 dark:text-green-400', style: 'border-green-300' };
            case 'Ditolak':
                return { text: 'Ditolak', color: 'text-red-600 dark:text-red-400', style: 'border-red-300' };
            default:
                return { text: status, color: 'text-gray-600', style: 'border-gray-300' };
        }
    };

    // ▼▼▼ PERUBAHAN UTAMA: Menggunakan komponen Ikon Lucide (StatisticIcon) ▼▼▼
    const statisticCards = [
        // Menggunakan File (Berkas) sebagai representasi Total RKAT
        { 
            label: 'Total RKAT', 
            value: stats.total, 
            icon: <StatisticIcon Icon={File} colorClass="text-blue-800" />, 
            color: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100' 
        },
        // Menggunakan FileClock (Berkas dengan Jam/Waktu) sebagai representasi Pending
        { 
            label: 'Pending', 
            value: stats.pending, 
            icon: <StatisticIcon Icon={FileClock} colorClass="text-yellow-800" />, 
            color: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100' 
        },
        // Menggunakan FileCheck (Berkas dengan Tanda Cek) sebagai representasi Approve
        { 
            label: 'Approve', 
            value: stats.approved, 
            icon: <StatisticIcon Icon={FileCheck} colorClass="text-green-800" />, 
            color: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100' 
        },
        // Menggunakan FileX (Berkas dengan Tanda Silang) sebagai representasi Ditolak
        { 
            label: 'Ditolak', 
            value: stats.rejected, 
            icon: <StatisticIcon Icon={FileX} colorClass="text-red-800" />, 
            color: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' 
        },
    ];
    // ▲▲▲ AKHIR PERUBAHAN UTAMA ▲▲▲
    
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Selamat datang! {auth.user.peran?.toUpperCase() || auth.user.peran?.toUpperCase() || 'PENGGUNA'}</p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        
                        {/* STATISTIK RKAT CARDS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {statisticCards.map((card, index) => (
                                <div key={index} className={`p-6 rounded-lg shadow-md ${card.color} flex items-center justify-between`}>
                                    <div className="text-left">
                                        <div className="text-sm font-medium">{card.label}</div>
                                        <div className="text-5xl font-extrabold">{card.value}</div>
                                    </div>
                                    {/* MENGGANTI EMOJI DENGAN KOMPONEN ICON */}
                                    <div className="text-5xl opacity-100"> 
                                        {card.icon}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* RKAT TERBARU SECTION */}
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">RKAT Terbaru</h3>
                        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
                            
                            {rkatTerbaru.map((rkat, index) => {
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
                                        
                                        <div className="text-sm font-semibold flex items-center">
                                            <span className={`px-3 py-1 text-xs rounded-full ${info.color} border ${info.style} bg-opacity-20`}>
                                                {info.text}
                                            </span>
                                            
                                            {/* Icon Panah atau Check */}
                                            {rkat.status === 'Menunggu Persetujuan' && (
                                                <ChevronDown size={16} className="ms-2 inline-block align-middle" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Tombol Tampilkan Lebih Banyak */}
                            <div className="p-2 text-center border-t border-gray-200 dark:border-gray-700">
                                <Button 
                                    variant="ghost" 
                                    className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 text-sm"
                                >
                                    Tampilkan lebih banyak
                                    <ChevronDown size={16} className="ms-1" />
                                </Button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}