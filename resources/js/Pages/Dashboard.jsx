// resources/js/Pages/Dashboard.jsx

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React from 'react';

export default function Dashboard({ auth }) {
    // Anda bisa mendapatkan data RKAT dari props jika dilewatkan dari controller
    // const { totalRkat, pending, approved, rejected, rkatTerbaru } = auth.user; 

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div>
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Selamat datang! {auth.user.peran?.toUpperCase() || 'PENGGUNA'}</p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-4"> {/* Menggunakan padding vertikal */}
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        {/* Statistik RKAT Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                            {/* Total RKAT */}
                            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg flex items-center justify-center text-blue-800 dark:text-blue-200 shadow-md">
                                <span className="text-3xl font-bold me-2">📝</span>
                                <div>
                                    <div className="text-sm">Total RKAT</div>
                                    <div className="text-2xl font-bold">20</div> {/* Ganti dengan data dinamis */}
                                </div>
                            </div>
                            {/* Pending */}
                            <div className="bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg flex items-center justify-center text-yellow-800 dark:text-yellow-200 shadow-md">
                                <span className="text-3xl font-bold me-2">⏳</span>
                                <div>
                                    <div className="text-sm">Pending</div>
                                    <div className="text-2xl font-bold">10</div>
                                </div>
                            </div>
                            {/* Approve */}
                            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg flex items-center justify-center text-green-800 dark:text-green-200 shadow-md">
                                <span className="text-3xl font-bold me-2">✅</span>
                                <div>
                                    <div className="text-sm">Approve</div>
                                    <div className="text-2xl font-bold">7</div>
                                </div>
                            </div>
                            {/* Ditolak */}
                            <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg flex items-center justify-center text-red-800 dark:text-red-200 shadow-md">
                                <span className="text-3xl font-bold me-2">❌</span>
                                <div>
                                    <div className="text-sm">Ditolak</div>
                                    <div className="text-2xl font-bold">3</div>
                                </div>
                            </div>
                            {/* Card Kosong / Untuk Icon Lain */}
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex items-center justify-center text-gray-800 dark:text-gray-200 shadow-md">
                                {/* Icon opsional atau untuk informasi lain */}
                            </div>
                        </div>

                        {/* RKAT Terbaru Section */}
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">RKAT Terbaru</h3>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            {/* Contoh Item Tabel */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">F. Vokasi</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur...</div>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 me-4">5 menit yang lalu</div>
                                <div className="flex items-center text-yellow-600 dark:text-yellow-400 font-semibold">
                                    Munggu Persetujuan 
                                    <svg className="w-4 h-4 ms-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10l-3.293-3.293a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                                </div>
                            </div>
                            
                            {/* Contoh Item Tabel Lainnya */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">BEM</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur...</div>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 me-4">1 Jam yang lalu</div>
                                <div className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                                    Approve 
                                    <svg className="w-4 h-4 ms-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">CIT</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur...</div>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 me-4">2 Jam yang lalu</div>
                                <div className="flex items-center text-yellow-600 dark:text-yellow-400 font-semibold">
                                    Pending 
                                    <svg className="w-4 h-4 ms-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L11 9.586V6z" clipRule="evenodd"></path></svg>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700"> {/* Tanpa border-b untuk item terakhir */}
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900 dark:text-gray-100">BAKPU</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Lorem ipsum dolor sit amet, consectetur...</div>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 me-4">3 Jam yang lalu</div>
                                <div className="flex items-center text-red-600 dark:text-red-400 font-semibold">
                                    Ditolak 
                                    <svg className="w-4 h-4 ms-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                                </div>
                            </div>

                            <div className="p-4 text-center border-t border-gray-200 dark:border-gray-700">
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