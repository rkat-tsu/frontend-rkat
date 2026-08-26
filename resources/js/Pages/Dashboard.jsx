import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, Deferred } from '@inertiajs/react';
import {
    FileText, CheckCircle, Clock, XCircle, TrendingUp,
    ArrowRight, Activity, PieChart, Bell, Info, Calendar,
    MessageCircle, Loader2, FileCheck
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

export default function Dashboard({ auth, grafikRkat = [], tahunAnggaran = new Date().getFullYear(), statusAnggaran = 'Aktif', rawStatus = 'None', summary = {}, kegiatanTerdekat = [] }) {

    const formatRupiahSingkat = (angka) => {
        if (!angka) return 'Rp 0';
        const num = parseFloat(angka);
        if (num >= 1e9) return `Rp ${(num / 1e9).toFixed(1)}M`;
        if (num >= 1e6) return `Rp ${(num / 1e6).toFixed(1)}Jt`;
        return `Rp ${num.toLocaleString('id-ID')}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Drafting': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'Submission': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
            case 'Approved': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
            case 'Closed': return 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300 border-gray-200 dark:border-gray-800';
        }
    };

    const chartConfig = {
        desktop: {
            label: "Pengajuan RKAT",
            color: "hsl(var(--chart-1))",
        },
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-2xl text-gray-800 dark:text-gray-100 leading-tight tracking-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-8">

                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 space-y-8">

                    {/* --- BAGIAN 1: KARTU RINGKASAN DENGAN DEFERRED LOADING --- */}
                    <Deferred data="summary" fallback={
                        <div className="space-y-6">
                            <div className="bg-slate-50/80 dark:bg-gray-900/40 rounded-3xl border border-slate-200/80 dark:border-gray-700/70 p-6 md:p-8 space-y-4">
                                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-32 bg-white dark:bg-gray-800 animate-pulse rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="h-32 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            </div>
                            <div className="bg-slate-50/80 dark:bg-gray-900/40 rounded-3xl border border-slate-200/80 dark:border-gray-700/70 p-6 md:p-8 space-y-4">
                                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="h-32 bg-white dark:bg-gray-800 animate-pulse rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    }>
                        <div className="space-y-8">
                            {/* SEKSI 1: PENGAJUAN RKAT (GROUP CONTAINER LAYER) */}
                            <div className="bg-slate-50/80 dark:bg-gray-900/40 rounded-3xl p-6 md:p-7 border border-slate-200/80 dark:border-gray-700/70 shadow-sm space-y-5">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 dark:border-gray-700/70">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 rounded-xl">
                                            <FileText size={20} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Pengajuan RKAT</h3>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Ringkasan status dokumen pengajuan anggaran RKA</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full border border-indigo-200/60 dark:border-indigo-800/60">
                                        Dokumen RKA
                                    </span>
                                </div>

                                {/* Baris Atas: 4 Kotak Status RKA */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        title="Disetujui RKAT"
                                        value={summary.disetujui}
                                        icon={<CheckCircle size={22} />}
                                        color="emerald"
                                        label="Setuju"
                                        description="Dokumen Disetujui"
                                    />
                                    <StatCard
                                        title="Revisi"
                                        value={summary.revisi}
                                        icon={<Clock size={22} />}
                                        color="amber"
                                        label="Revisi"
                                        description="Butuh Revisi"
                                    />
                                    <StatCard
                                        title="Ditolak"
                                        value={summary.ditolak}
                                        icon={<XCircle size={22} />}
                                        color="rose"
                                        label="Tolak"
                                        description="Dokumen Ditolak"
                                    />
                                    <StatCard
                                        title="Total Dokumen"
                                        value={summary.total}
                                        icon={<FileText size={22} />}
                                        color="blue"
                                        label="Tahun Ini"
                                        description="Total Pengajuan RKA"
                                    />
                                </div>
                            </div>

                            {/* Kotak Group untuk Memisah Nominal RKA, Pencairan, dan LPJ */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 md:p-8 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100 dark:divide-gray-700">
                                    {/* Bagian Anggaran RKA */}
                                    <div className="flex items-start gap-4 pb-4 md:pb-0">
                                        <div className="p-3.5 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 rounded-2xl shadow-inner shrink-0">
                                            <PieChart size={26} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Anggaran RKA</p>
                                            <h3 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{formatRupiahSingkat(summary.total_anggaran_disetujui)}</h3>
                                            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1.5">Total Dana Disetujui</p>
                                        </div>
                                    </div>

                                    {/* Bagian Pencairan Dana */}
                                    <div className="flex items-start gap-4 pt-4 md:pt-0 md:pl-6">
                                        <div className="p-3.5 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-2xl shadow-inner shrink-0">
                                            <TrendingUp size={26} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Pencairan Dana</p>
                                            <h3 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{formatRupiahSingkat(summary.total_pencairan_disetujui)}</h3>
                                            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1.5">Total Dana Dicairkan</p>
                                        </div>
                                    </div>

                                    {/* Bagian Realisasi LPJ */}
                                    <div className="flex items-start gap-4 pt-4 md:pt-0 md:pl-6">
                                        <div className="p-3.5 bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 rounded-2xl shadow-inner shrink-0">
                                            <FileCheck size={26} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Realisasi LPJ</p>
                                            <h3 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{formatRupiahSingkat(summary.total_lpj_realisasi)}</h3>
                                            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mt-1.5">Total Realisasi Penggunaan</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SEKSI 2: PENCAIRAN DANA (GROUP CONTAINER LAYER) */}
                            <div className="bg-slate-50/80 dark:bg-gray-900/40 rounded-3xl p-6 md:p-7 border border-slate-200/80 dark:border-gray-700/70 shadow-sm space-y-5">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 dark:border-gray-700/70">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-xl">
                                            <TrendingUp size={20} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Pencairan Dana</h3>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Ringkasan status dokumen pencairan dana</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full border border-blue-200/60 dark:border-blue-800/60">
                                        Pencairan
                                    </span>
                                </div>

                                {/* Baris Bawah: 4 Kotak Status Pencairan */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        title="Disetujui Pencairan"
                                        value={summary.pencairan_disetujui}
                                        icon={<CheckCircle size={22} />}
                                        color="emerald"
                                        label="Setuju"
                                        description="Pencairan Disetujui"
                                    />
                                    <StatCard
                                        title="Revisi"
                                        value={summary.pencairan_revisi}
                                        icon={<Clock size={22} />}
                                        color="amber"
                                        label="Revisi"
                                        description="Butuh Revisi"
                                    />
                                    <StatCard
                                        title="Ditolak"
                                        value={summary.pencairan_ditolak}
                                        icon={<XCircle size={22} />}
                                        color="rose"
                                        label="Tolak"
                                        description="Pencairan Ditolak"
                                    />
                                    <StatCard
                                        title="Total Dokumen"
                                        value={summary.total_pencairan_dokumen}
                                        icon={<FileText size={22} />}
                                        color="blue"
                                        label="Pencairan"
                                        description="Total Pengajuan Pencairan"
                                    />
                                </div>
                            </div>

                            {/* SEKSI 3: LAPORAN PERTANGGUNGJAWABAN (LPJ) */}
                            <div className="bg-slate-50/80 dark:bg-gray-900/40 rounded-3xl p-6 md:p-7 border border-slate-200/80 dark:border-gray-700/70 shadow-sm space-y-5">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 dark:border-gray-700/70">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 rounded-xl">
                                            <FileCheck size={20} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Laporan Pertanggungjawaban (LPJ)</h3>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Ringkasan status dokumen laporan pertanggungjawaban</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold px-3 py-1 bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 rounded-full border border-purple-200/60 dark:border-purple-800/60">
                                        Dokumen LPJ
                                    </span>
                                </div>

                                {/* Baris 4 Kotak Status LPJ */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        title="Disetujui LPJ"
                                        value={summary.lpj_disetujui}
                                        icon={<CheckCircle size={22} />}
                                        color="emerald"
                                        label="Setuju"
                                        description="LPJ Disetujui"
                                    />
                                    <StatCard
                                        title="Revisi"
                                        value={summary.lpj_revisi}
                                        icon={<Clock size={22} />}
                                        color="amber"
                                        label="Revisi"
                                        description="Butuh Revisi"
                                    />
                                    <StatCard
                                        title="Ditolak"
                                        value={summary.lpj_ditolak}
                                        icon={<XCircle size={22} />}
                                        color="rose"
                                        label="Tolak"
                                        description="LPJ Ditolak"
                                    />
                                    <StatCard
                                        title="Total Dokumen"
                                        value={summary.total_lpj_dokumen}
                                        icon={<FileText size={22} />}
                                        color="purple"
                                        label="LPJ"
                                        description="Total Pengajuan LPJ"
                                    />
                                </div>
                            </div>
                        </div>
                    </Deferred>


                    {/* --- BAGIAN 2: GRAFIK TREN DENGAN DEFERRED LOADING --- */}
                    <div className="grid grid-cols-1 gap-6">
                        <div className="lg:col-span-1">
                            <Deferred data="grafikRkat" fallback={
                                <Card className="shadow-sm border-gray-100 dark:border-gray-700 h-[450px] flex items-center justify-center bg-white dark:bg-gray-800">
                                    <div className="flex flex-col items-center gap-4">
                                        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                                        <p className="text-sm font-medium text-gray-500 animate-pulse">Menghitung statistik pengajuan...</p>
                                    </div>
                                </Card>
                            }>
                                <Card className="shadow-sm border-gray-100 dark:border-gray-700 h-full flex flex-col bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                                            <Activity className="h-6 w-6 text-indigo-500" />
                                            Tren Pengajuan RKAT Bulanan
                                        </CardTitle>
                                        <CardDescription className="mt-1 text-gray-500 dark:text-gray-400">
                                            Statistik pengajuan dokumen per bulan pada tahun anggaran {tahunAnggaran}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 pb-4">
                                        <div className="h-[350px] w-full mt-6">
                                            <ChartContainer config={chartConfig} className="h-full w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={grafikRkat} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="fillPengajuan" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={15} tickFormatter={(v) => v.slice(0, 3)} className="text-xs font-bold text-gray-600 dark:text-gray-300" />
                                                        <YAxis tickLine={false} axisLine={false} tickMargin={15} allowDecimals={false} className="text-xs font-bold text-gray-600 dark:text-gray-300" />
                                                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                                                        <Area dataKey="desktop" type="monotone" fill="url(#fillPengajuan)" stroke="#6366f1" strokeWidth={4} activeDot={{ r: 8 }} />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </ChartContainer>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-2 pb-6 border-t border-gray-50 dark:border-gray-700/50 mx-6 flex items-center justify-between">
                                        <div className="flex items-center gap-2 font-bold text-gray-700 dark:text-gray-300 text-sm">
                                            Status: Real-time <TrendingUp className="h-4 w-4 text-emerald-500 animate-pulse" />
                                        </div>
                                        <div className="font-medium text-gray-500 dark:text-gray-400 text-sm">
                                            Periode {tahunAnggaran} • Tiga Serangkai University
                                        </div>
                                    </CardFooter>
                                </Card>
                            </Deferred>
                        </div>
                    </div>

                    {/* --- BAGIAN 3: INFO TERBARU --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:-translate-y-1 h-full">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">
                                            <Calendar size={20} />
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Status Anggaran</h4>
                                    </div>
                                    <span className={`text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full border ${getStatusColor(rawStatus)}`}>
                                        {statusAnggaran}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Tahun Anggaran <b className="font-semibold text-gray-900 dark:text-white">{tahunAnggaran}</b> saat ini dalam tahap <b className="font-semibold text-gray-900 dark:text-white">{statusAnggaran}</b>. Pastikan semua dokumen diinput sesuai jadwal.
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/50">
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Tiga Serangkai University</span>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 rounded-lg">
                                    <Calendar size={20} />
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Kegiatan Terdekat</h4>
                            </div>
                            <Deferred data="kegiatanTerdekat" fallback={
                                <div className="flex-1 flex items-center justify-center min-h-[100px]">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                                </div>
                            }>
                                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                                    {kegiatanTerdekat && kegiatanTerdekat.length > 0 ? (
                                        kegiatanTerdekat.map((kegiatan, idx) => (
                                            <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
                                                <div className="font-semibold text-sm text-gray-800 dark:text-gray-200 line-clamp-1">{kegiatan.judul}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1.5 font-medium">
                                                    <Calendar size={12} className="text-teal-500" />
                                                    {new Date(kegiatan.mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                    {kegiatan.mulai !== kegiatan.akhir && ` - ${new Date(kegiatan.akhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}`}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-gray-500 text-center italic mt-4">Belum ada jadwal terdekat.</div>
                                    )}
                                </div>
                            </Deferred>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 shadow-md text-white flex flex-col justify-between h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                                        <MessageCircle size={20} />
                                    </div>
                                    <h4 className="font-bold">Butuh Bantuan?</h4>
                                </div>
                                <p className="text-sm text-indigo-50 leading-relaxed">
                                    Jika Anda mengalami kendala teknis dalam penginputan RKAT, silakan hubungi Tim IT TSU melalui kanal resmi.
                                </p>
                            </div>
                            <div className="mt-4">
                                <a href="#" className="inline-flex items-center gap-2 text-xs font-bold bg-white text-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all shadow-sm">
                                    Hubungi IT Support <ArrowRight size={14} />
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ title, value, icon, color, label, description, isLive }) {
    const colors = {
        blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20",
        amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20",
        emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20",
        rose: "bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20",
        purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20"
    };

    const colorParts = colors[color].split(' ');

    return (
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-1 group">
            <div className={`absolute -right-6 -top-6 ${colorParts[colorParts.length - 1]} w-24 h-24 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500 ease-in-out`}></div>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 ${colorParts[0]} ${colorParts[1]} ${colorParts[2]} ${colorParts[3]} rounded-xl shadow-inner`}>
                        {React.cloneElement(icon, { strokeWidth: 2.5 })}
                    </div>
                    {label && (
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-full">
                            {label}
                        </span>
                    )}
                    {isLive && (
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                    )}
                </div>
                <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{value || 0}</h3>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{description}</p>
            </div>
        </div>
    );
}