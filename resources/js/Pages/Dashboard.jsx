import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { 
    FileText, CheckCircle, Clock, XCircle, TrendingUp, 
    ArrowRight, Activity, PieChart 
} from 'lucide-react';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/Components/ui/card";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/Components/ui/chart";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";

export default function Dashboard({ auth, grafikRkat = [], tahunAnggaran = new Date().getFullYear(), summary = {} }) {
    
    // Konfigurasi Warna Shadcn Chart
    const chartConfig = {
        desktop: {
            label: "Pengajuan RKAT",
            color: "hsl(var(--chart-1))", 
        },
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 dark:text-gray-100 leading-tight tracking-tight">Ringkasan Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* --- BAGIAN 1: KARTU RINGKASAN (STATISTIC CARDS) YANG DIPERBARUI --- */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        
                        {/* Card 1: Total Dokumen */}
                        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                            <div className="absolute -right-6 -top-6 bg-blue-50 dark:bg-blue-900/20 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 rounded-xl shadow-inner">
                                        <FileText size={22} strokeWidth={2.5} />
                                    </div>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-full">Tahun Ini</span>
                                </div>
                                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                                    {summary.total || 0}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Pengajuan Dokumen</p>
                            </div>
                        </div>

                        {/* Card 2: Dalam Review */}
                        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                            <div className="absolute -right-6 -top-6 bg-amber-50 dark:bg-amber-900/20 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 rounded-xl shadow-inner">
                                        <Clock size={22} strokeWidth={2.5} />
                                    </div>
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                    </span>
                                </div>
                                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                                    {summary.review || 0}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Menunggu Persetujuan</p>
                            </div>
                        </div>

                        {/* Card 3: Disetujui */}
                        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                            <div className="absolute -right-6 -top-6 bg-emerald-50 dark:bg-emerald-900/20 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 rounded-xl shadow-inner">
                                        <CheckCircle size={22} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                                    {summary.disetujui || 0}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dokumen Disetujui Final</p>
                            </div>
                        </div>

                        {/* Card 4: Ditolak */}
                        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
                            <div className="absolute -right-6 -top-6 bg-rose-50 dark:bg-rose-900/20 w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-in-out"></div>
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="p-3 bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 rounded-xl shadow-inner">
                                        <XCircle size={22} strokeWidth={2.5} />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
                                    {summary.ditolak || 0}
                                </h3>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Ditolak / Butuh Revisi</p>
                            </div>
                        </div>
                    </div>


                    {/* --- BAGIAN 2: GRAFIK & QUICK ACTION --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* CHART AREA (Lebar 2 Kolom di Desktop) */}
                        <div className="lg:col-span-2">
                            <Card className="shadow-sm border-gray-100 dark:border-gray-700 h-full flex flex-col">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2 text-lg text-gray-900 dark:text-white">
                                                <Activity className="h-5 w-5 text-indigo-500" />
                                                Tren Pengajuan RKAT
                                            </CardTitle>
                                            <CardDescription className="mt-1 text-gray-500 dark:text-gray-400">
                                                Statistik pengajuan dokumen per bulan pada tahun anggaran {tahunAnggaran}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 pb-4">
                                    <div className="h-[300px] w-full mt-4">
                                        <ChartContainer config={chartConfig} className="h-full w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart
                                                    data={grafikRkat}
                                                    margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
                                                >
                                                    <defs>
                                                        <linearGradient id="fillPengajuan" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.4} />
                                                            <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.0} />
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid vertical={false} strokeDasharray="4 4" strokeOpacity={0.5} />
                                                    <XAxis
                                                        dataKey="month"
                                                        tickLine={false}
                                                        axisLine={false}
                                                        tickMargin={12}
                                                        tickFormatter={(value) => value.slice(0, 3)}
                                                        className="text-xs font-medium text-gray-500 dark:text-gray-100 fill-gray-500 dark:fill-gray-100"
                                                        tick={{ fill: 'currentColor' }}
                                                    />
                                                    <YAxis 
                                                        tickLine={false} 
                                                        axisLine={false} 
                                                        tickMargin={12} 
                                                        allowDecimals={false}
                                                        className="text-xs font-medium text-gray-500 dark:text-gray-100 fill-gray-500 dark:fill-gray-100"
                                                        tick={{ fill: 'currentColor' }}
                                                    />
                                                    <ChartTooltip 
                                                        cursor={{ stroke: 'rgba(99, 102, 241, 0.2)', strokeWidth: 2 }} 
                                                        content={<ChartTooltipContent indicator="dot" className="rounded-xl shadow-lg border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" />} 
                                                    />
                                                    <Area
                                                        dataKey="desktop"
                                                        type="monotone" // Melengkung halus
                                                        fill="url(#fillPengajuan)"
                                                        stroke="var(--color-desktop)"
                                                        strokeWidth={3}
                                                        activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-desktop)" }}
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-0 pb-6 mt-auto">
                                    <div className="flex w-full items-center justify-between text-sm pt-4">
                                        <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
                                            Data Real-time <TrendingUp className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <div className="text-gray-500 dark:text-gray-400">
                                            Januari - Desember {tahunAnggaran}
                                        </div>
                                    </div>
                                </CardFooter>
                            </Card>
                        </div>

                        {/* QUICK ACTION / INFO AREA (Kolom Kanan) */}
                        <div className="space-y-6">
                            
                            {/* Panel Pintasan */}
                            <Card className="shadow-sm border-gray-100 dark:border-gray-700 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-4 opacity-5">
                                    <PieChart size={100} />
                                </div>
                                <CardHeader>
                                    <CardTitle className="text-lg text-gray-900 dark:text-white">Aksi Cepat</CardTitle>
                                    <CardDescription className="text-gray-500 dark:text-gray-400">Akses menu yang sering digunakan.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-3 relative z-10">
                                    
                                    {/* Link ke Daftar RKAT */}
                                    <Link 
                                        href={route('rkat.index')}
                                        className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                                                <FileText size={18} className='group-hover:text-teal-600 dark:group-hover:text-teal-400 text-gray-500 dark:text-gray-400'/>
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Daftar RKAT</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Lihat semua pengajuan</p>
                                            </div>
                                        </div>
                                        <ArrowRight size={18} className="text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transform group-hover:translate-x-1 transition-all" />
                                    </Link>

                                    {/* Link ke Persetujuan (Hanya muncul jika bukan Staf) */}
                                    {auth.user.peran !== 'Staf_Unit' && (
                                        <Link 
                                            href={route('approval.index')}
                                            className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-700 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                    <CheckCircle size={18} className='group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-gray-500 dark:text-gray-400' />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Persetujuan</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Dokumen menunggu review</p>
                                                </div>
                                            </div>
                                            <ArrowRight size={18} className="text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transform group-hover:translate-x-1 transition-all" />
                                        </Link>
                                    )}

                                </CardContent>
                            </Card>

                            {/* Banner Informasi */}
                            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
                                <div className="absolute -right-4 -bottom-4 opacity-20">
                                    <FileText size={120} strokeWidth={1} />
                                </div>
                                <div className="relative z-10">
                                    <h4 className="text-lg font-bold mb-2">Tahun Anggaran Aktif</h4>
                                    <p className="text-teal-50 text-sm mb-4">
                                        Pastikan Anda menginput dokumen Rencana Kerja pada periode tahun yang sesuai.
                                    </p>
                                    <div className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold">
                                        Tahun: {tahunAnggaran}
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}