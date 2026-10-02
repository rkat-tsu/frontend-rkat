import React, { useState } from 'react';
import CustomSelect from '@/Components/CustomSelect';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, Deferred, router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    FileText, CheckCircle, Clock, XCircle, TrendingUp,
    ArrowRight, Activity, PieChart, Bell, Info, Calendar,
    MessageCircle, Loader2, FileCheck, HelpCircle, ChevronDown,
    Sun, Moon, Mail, Copy, Filter, AlertTriangle, Building, Check,
    Layers, Wallet, Percent, ExternalLink, RefreshCw, BarChart2
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

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";

export default function Dashboard({
    auth,
    grafikRkat = [],
    tahunAnggaran = new Date().getFullYear(),
    tahunOptions = [],
    statusAnggaran = 'Aktif',
    rawStatus = 'None',
    unitInfo = null,
    summary = {},
    kegiatanTerdekat = []
}) {
    const [chartMode, setChartMode] = useState('area'); // 'area' or 'bar'

    const formatRupiahSingkat = (angka) => {
        if (!angka) return 'Rp 0';
        const num = parseFloat(angka);
        if (num >= 1e9) return `Rp ${(num / 1e9).toFixed(1)}M`;
        if (num >= 1e6) return `Rp ${(num / 1e6).toFixed(1)}Jt`;
        return `Rp ${num.toLocaleString('id-ID')}`;
    };

    const formatRupiahFull = (angka) => {
        if (!angka) return 'Rp 0';
        const num = parseFloat(angka);
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

    const handleYearChange = (e) => {
        const selectedYear = e.target.value;
        router.get(
            route('dashboard'),
            { tahun: selectedYear },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const chartConfig = {
        rkat: {
            label: "RKAT",
            color: "#6366f1",
        },
        pencairan: {
            label: "Pencairan",
            color: "#0284c7",
        },
        lpj: {
            label: "LPJ",
            color: "#a855f7",
        },
    };

    const handleContactSupport = (e) => {
        e.preventDefault();
        const email = 'pikdi@tsu.ac.id';

        if (navigator.clipboard) {
            navigator.clipboard.writeText(email);
        }

        window.open(`mailto:${email}?subject=Bantuan%20Sistem%20RKAT`, '_blank');

        toast.success("Alamat Email Disalin!", {
            description: `Email (${email}) berhasil disalin ke clipboard. Jika aplikasi email tidak terbuka otomatis, Anda dapat langsung menempelkannya di email Anda.`,
            duration: 6000
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h2 className="font-semibold text-2xl text-gray-800 dark:text-gray-100 leading-tight tracking-tight">
                        Dashboard
                    </h2>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                            Tiga Serangkai University
                        </span>
                    </div>
                </div>
            }
        >
            <Head title={`Dashboard TA ${tahunAnggaran}`} />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 space-y-8">

                    {/* --- KONTROL HEADER & FILTER TAHUN ANGGARAN --- */}
                    <div className="bg-white dark:bg-gray-800 p-5 md:p-6 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-3.5 bg-teal-500 text-white rounded-2xl shadow-md shadow-teal-500/20 shrink-0">
                                <Activity size={26} strokeWidth={2.5} />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                                        Dashboard Operasional RKAT
                                    </h1>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(rawStatus)}`}>
                                        TA {tahunAnggaran} • Status: {statusAnggaran}
                                    </span>
                                </div>
                                <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                                    {unitInfo ? (
                                        <span>Unit Kerja: <b className="text-teal-700 dark:text-teal-300 font-semibold">{unitInfo.nama_unit}</b> ({unitInfo.kode_unit})</span>
                                    ) : (
                                        <span>Ringkasan Eksekutif Pengajuan Anggaran, Pencairan & Realisasi LPJ</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Filter Tahun Selector Dropdown - CustomSelect */}
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-gray-900/60 p-3 rounded-2xl border border-slate-200 dark:border-gray-700 shrink-0 self-start md:self-auto">
                            <div className="p-2 bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 rounded-xl shrink-0">
                                <Filter size={18} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400">
                                    Filter Tahun Anggaran
                                </span>
                                <div className="w-56">
                                    <CustomSelect
                                        value={tahunAnggaran}
                                        onChange={handleYearChange}
                                        options={tahunOptions && tahunOptions.length > 0
                                            ? tahunOptions.map((item) => ({
                                                value: item.tahun,
                                                label: `Tahun ${item.tahun} (${item.status_label || item.status})`
                                            }))
                                            : [{ value: tahunAnggaran, label: `Tahun ${tahunAnggaran}` }]
                                        }
                                        className="h-10 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

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
                        </div>
                    }>
                        <div className="space-y-8">

                            {/* BANNER NOTIFIKASI TINDAK LANJUT / DOKUMEN PERLU PERHATIAN */}
                            {(summary.total_butuh_revisi > 0 || summary.total_dalam_review > 0) && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {summary.total_butuh_revisi > 0 && (
                                        <div className="bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4 shadow-sm">
                                            <div className="flex items-center gap-3.5">
                                                <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-sm shrink-0">
                                                    <AlertTriangle size={20} strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-amber-900 dark:text-amber-200">
                                                        {summary.total_butuh_revisi} Dokumen Butuh Revisi
                                                    </h4>
                                                    <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-0.5 font-medium">
                                                        Ada dokumen RKAT/Pencairan/LPJ yang memerlukan perbaikan dari Anda.
                                                    </p>
                                                </div>
                                            </div>
                                            <Link
                                                href={route('daftar-ajuan.index')}
                                                className="inline-flex items-center gap-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-2 rounded-xl transition-all shrink-0 shadow-sm"
                                            >
                                                Perbaiki <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    )}

                                    {summary.total_dalam_review > 0 && (
                                        <div className="bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-2xl p-4 md:p-5 flex items-center justify-between gap-4 shadow-sm">
                                            <div className="flex items-center gap-3.5">
                                                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-sm shrink-0">
                                                    <Clock size={20} strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm text-blue-900 dark:text-blue-200">
                                                        {summary.total_dalam_review} Dokumen Dalam Process Review
                                                    </h4>
                                                    <p className="text-xs text-blue-700 dark:text-blue-300/80 mt-0.5 font-medium">
                                                        Dokumen sedang dalam proses pemeriksaan oleh Verifikator / Pejabat.
                                                    </p>
                                                </div>
                                            </div>
                                            <Link
                                                href={route('daftar-ajuan.index')}
                                                className="inline-flex items-center gap-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl transition-all shrink-0 shadow-sm"
                                            >
                                                Cek Status <ExternalLink size={14} />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* --- ANALISIS PIPELINE & PENYERAPAN ANGGARAN --- */}
                            <div className="bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-xl border border-gray-100 dark:border-slate-700/60 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-slate-700/60">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-teal-100 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-xl border border-teal-200/60 dark:border-teal-500/30">
                                            <Wallet size={22} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
                                                Analisis Alur & Penyerapan Anggaran Tahun {tahunAnggaran}
                                            </h3>
                                            <p className="text-xs text-gray-500 dark:text-slate-300 font-medium">
                                                Kinerja alokasi anggaran disetujui, pencairan dana, dan realisasi pertanggungjawaban LPJ
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-mono font-bold px-3 py-1 bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 rounded-full border border-teal-200/60 dark:border-teal-500/40">
                                            Realisasi LPJ: {summary.persentase_total_realisasi || 0}%
                                        </span>
                                    </div>
                                </div>

                                {/* Grid 3 Nominal Utama */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* 1. Anggaran RKAT Disetujui */}
                                    <div className="bg-gray-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-gray-100 dark:border-slate-700/80 space-y-2">
                                        <div className="flex items-center justify-between text-gray-500 dark:text-slate-400">
                                            <span className="text-xs font-bold uppercase tracking-wider">1. Pagu Anggaran Disetujui</span>
                                            <PieChart size={18} className="text-indigo-500 dark:text-indigo-400" />
                                        </div>
                                        <div className="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                            {formatRupiahFull(summary.total_anggaran_disetujui)}
                                        </div>
                                        <p className="text-xs text-gray-400 dark:text-slate-400 font-medium">
                                            Total nilai RKAT status Disetujui Final
                                        </p>
                                    </div>

                                    {/* 2. Pencairan Dana Disetujui */}
                                    <div className="bg-gray-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-gray-100 dark:border-slate-700/80 space-y-2">
                                        <div className="flex items-center justify-between text-gray-500 dark:text-slate-400">
                                            <span className="text-xs font-bold uppercase tracking-wider">2. Total Pencairan Dana</span>
                                            <TrendingUp size={18} className="text-blue-500 dark:text-blue-400" />
                                        </div>
                                        <div className="text-2xl lg:text-3xl font-black text-blue-600 dark:text-blue-300 tracking-tight">
                                            {formatRupiahFull(summary.total_pencairan_disetujui)}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-300 font-semibold pt-1">
                                            <span>Rasio Pencairan:</span>
                                            <span className="text-blue-600 dark:text-blue-400">{summary.persentase_pencairan || 0}% dari Pagu</span>
                                        </div>
                                    </div>

                                    {/* 3. Realisasi LPJ */}
                                    <div className="bg-gray-50 dark:bg-slate-800/80 rounded-2xl p-5 border border-gray-100 dark:border-slate-700/80 space-y-2">
                                        <div className="flex items-center justify-between text-gray-500 dark:text-slate-400">
                                            <span className="text-xs font-bold uppercase tracking-wider">3. Realisasi LPJ Selesai</span>
                                            <FileCheck size={18} className="text-purple-500 dark:text-purple-400" />
                                        </div>
                                        <div className="text-2xl lg:text-3xl font-black text-purple-600 dark:text-purple-300 tracking-tight">
                                            {formatRupiahFull(summary.total_lpj_realisasi)}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-slate-300 font-semibold pt-1">
                                            <span>Kepatuhan LPJ:</span>
                                            <span className="text-purple-600 dark:text-purple-400">{summary.persentase_lpj || 0}% dari Pencairan</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Visual Absorpsi Bar */}
                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between text-xs font-bold text-gray-600 dark:text-slate-300">
                                        <span>Progres Penyerapan Anggaran (Alur Keuangan)</span>
                                        <span>Sisa Belum Dicairkan: {formatRupiahSingkat(summary.sisa_anggaran_belum_dicairkan)}</span>
                                    </div>
                                    <div className="h-4 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-gray-200 dark:border-slate-700 flex">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                                            style={{ width: `${Math.min(100, summary.persentase_pencairan || 0)}%` }}
                                            title={`Pencairan: ${summary.persentase_pencairan}%`}
                                        ></div>
                                    </div>
                                    <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-medium text-gray-500 dark:text-slate-400">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                                                Dicairkan ({summary.persentase_pencairan || 0}%)
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                                                Telah Di-LPJ ({summary.persentase_total_realisasi || 0}%)
                                            </span>
                                        </div>
                                        {summary.sisa_pencairan_belum_dilpj > 0 && (
                                            <span className="text-amber-600 dark:text-amber-400 font-semibold">
                                                * {formatRupiahSingkat(summary.sisa_pencairan_belum_dilpj)} belum di-LPJ-kan
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>


                            {/* SEKSI 1: PENGAJUAN RKAT */}
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
                                    <Link
                                        href={route('daftar-ajuan.index')}
                                        className="text-xs font-semibold px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded-full border border-indigo-200/60 dark:border-indigo-800/60 transition-colors inline-flex items-center gap-1"
                                    >
                                        Daftar Dokumen <ArrowRight size={12} />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        title="Disetujui RKAT"
                                        value={summary.disetujui}
                                        icon={<CheckCircle size={22} />}
                                        color="emerald"
                                        label="Disetujui"
                                        description="Dokumen Disetujui Final"
                                    />
                                    <StatCard
                                        title="Revisi"
                                        value={summary.revisi}
                                        icon={<Clock size={22} />}
                                        color="amber"
                                        label="Revisi"
                                        description="Memerlukan Revisi"
                                    />
                                    <StatCard
                                        title="Ditolak"
                                        value={summary.ditolak}
                                        icon={<XCircle size={22} />}
                                        color="rose"
                                        label="Ditolak"
                                        description="Dokumen Ditolak"
                                    />
                                    <StatCard
                                        title="Total Dokumen"
                                        value={summary.total}
                                        icon={<FileText size={22} />}
                                        color="blue"
                                        label={`TA ${tahunAnggaran}`}
                                        description="Total Pengajuan RKA"
                                    />
                                </div>
                            </div>


                            {/* SEKSI 2: PENCAIRAN DANA */}
                            <div className="bg-slate-50/80 dark:bg-gray-900/40 rounded-3xl p-6 md:p-7 border border-slate-200/80 dark:border-gray-700/70 shadow-sm space-y-5">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-200/70 dark:border-gray-700/70">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 rounded-xl">
                                            <TrendingUp size={20} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">Pencairan Dana</h3>
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Ringkasan status dokumen pengajuan pencairan anggaran</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={route('pencairan.index')}
                                        className="text-xs font-semibold px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-full border border-blue-200/60 dark:border-blue-800/60 transition-colors inline-flex items-center gap-1"
                                    >
                                        Daftar Pencairan <ArrowRight size={12} />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        title="Disetujui Pencairan"
                                        value={summary.pencairan_disetujui}
                                        icon={<CheckCircle size={22} />}
                                        color="emerald"
                                        label="Disetujui"
                                        description="Pencairan Disetujui"
                                    />
                                    <StatCard
                                        title="Revisi"
                                        value={summary.pencairan_revisi}
                                        icon={<Clock size={22} />}
                                        color="amber"
                                        label="Revisi"
                                        description="Pencairan Revisi"
                                    />
                                    <StatCard
                                        title="Ditolak"
                                        value={summary.pencairan_ditolak}
                                        icon={<XCircle size={22} />}
                                        color="rose"
                                        label="Diolak"
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
                                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Ringkasan status dokumen laporan realisasi kegiatan</p>
                                        </div>
                                    </div>
                                    <Link
                                        href={route('lpj.index')}
                                        className="text-xs font-semibold px-3 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 rounded-full border border-purple-200/60 dark:border-purple-800/60 transition-colors inline-flex items-center gap-1"
                                    >
                                        Daftar LPJ <ArrowRight size={12} />
                                    </Link>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        title="Disetujui LPJ"
                                        value={summary.lpj_disetujui}
                                        icon={<CheckCircle size={22} />}
                                        color="emerald"
                                        label="Disetujui"
                                        description="LPJ Disetujui"
                                    />
                                    <StatCard
                                        title="Revisi"
                                        value={summary.lpj_revisi}
                                        icon={<Clock size={22} />}
                                        color="amber"
                                        label="Revisi"
                                        description="LPJ Revisi"
                                    />
                                    <StatCard
                                        title="Ditolak"
                                        value={summary.lpj_ditolak}
                                        icon={<XCircle size={22} />}
                                        color="rose"
                                        label="Ditolak"
                                        description="LPJ Ditolak"
                                    />
                                    <StatCard
                                        title="Total Dokumen"
                                        value={summary.total_lpj_dokumen}
                                        icon={<FileText size={22} />}
                                        color="purple"
                                        label="LPJ"
                                        description="Total Laporan LPJ"
                                    />
                                </div>
                            </div>
                        </div>
                    </Deferred>


                    {/* --- BAGIAN 2: GRAFIK TREN DENGAN DEFERRED LOADING --- */}
                    <div className="grid grid-cols-1 gap-6">
                        <Deferred data="grafikRkat" fallback={
                            <Card className="shadow-sm border-gray-100 dark:border-gray-700 h-[450px] flex items-center justify-center bg-white dark:bg-gray-800">
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                                    <p className="text-sm font-medium text-gray-500 animate-pulse">Menghitung tren statistik pengajuan...</p>
                                </div>
                            </Card>
                        }>
                            <Card className="shadow-sm border-gray-100 dark:border-gray-700 h-full flex flex-col bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-md">
                                <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                                            <BarChart2 className="h-6 w-6 text-indigo-500" />
                                            Tren Pengajuan Dokumen Operasional Bulanan
                                        </CardTitle>
                                        <CardDescription className="mt-1 text-gray-500 dark:text-gray-400">
                                            Perbandingan intensitas pengajuan RKAT, Pencairan, dan LPJ pada Tahun Anggaran {tahunAnggaran}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center bg-gray-100 dark:bg-gray-700/60 p-1 rounded-xl text-xs font-semibold">
                                            <button
                                                type="button"
                                                onClick={() => setChartMode('area')}
                                                className={`px-3 py-1.5 rounded-lg transition-all ${chartMode === 'area' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                            >
                                                Grafik Area
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setChartMode('bar')}
                                                className={`px-3 py-1.5 rounded-lg transition-all ${chartMode === 'bar' ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
                                            >
                                                Grafik Batang
                                            </button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 pb-4">
                                    <div className="h-[360px] w-full mt-4">
                                        <ChartContainer config={chartConfig} className="h-full w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                {chartMode === 'area' ? (
                                                    <AreaChart data={grafikRkat} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="fillRkat" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                                                            </linearGradient>
                                                            <linearGradient id="fillPencairan" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
                                                            </linearGradient>
                                                            <linearGradient id="fillLpj" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={12} tickFormatter={(v) => v.slice(0, 3)} className="text-xs font-bold text-gray-600 dark:text-gray-300" />
                                                        <YAxis tickLine={false} axisLine={false} tickMargin={12} allowDecimals={false} className="text-xs font-bold text-gray-600 dark:text-gray-300" />
                                                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                                                        <Area dataKey="rkat" name="Pengajuan RKAT" type="monotone" fill="url(#fillRkat)" stroke="#6366f1" strokeWidth={3} />
                                                        <Area dataKey="pencairan" name="Pengajuan Pencairan" type="monotone" fill="url(#fillPencairan)" stroke="#0284c7" strokeWidth={3} />
                                                        <Area dataKey="lpj" name="Pengajuan LPJ" type="monotone" fill="url(#fillLpj)" stroke="#a855f7" strokeWidth={3} />
                                                    </AreaChart>
                                                ) : (
                                                    <BarChart data={grafikRkat} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
                                                        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={12} tickFormatter={(v) => v.slice(0, 3)} className="text-xs font-bold text-gray-600 dark:text-gray-300" />
                                                        <YAxis tickLine={false} axisLine={false} tickMargin={12} allowDecimals={false} className="text-xs font-bold text-gray-600 dark:text-gray-300" />
                                                        <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                                                        <Bar dataKey="rkat" name="Pengajuan RKAT" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                                        <Bar dataKey="pencairan" name="Pengajuan Pencairan" fill="#0284c7" radius={[4, 4, 0, 0]} />
                                                        <Bar dataKey="lpj" name="Pengajuan LPJ" fill="#a855f7" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                )}
                                            </ResponsiveContainer>
                                        </ChartContainer>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-3 pb-5 border-t border-gray-100 dark:border-gray-700/50 mx-6 flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-6 text-xs font-bold">
                                        <span className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                            <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block"></span> RKAT
                                        </span>
                                        <span className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                                            <span className="w-3 h-3 rounded-full bg-sky-500 inline-block"></span> Pencairan
                                        </span>
                                        <span className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span> LPJ
                                        </span>
                                    </div>
                                    <div className="font-medium text-gray-500 dark:text-gray-400 text-xs">
                                        Data Terfilter TA {tahunAnggaran} • Tiga Serangkai University
                                    </div>
                                </CardFooter>
                            </Card>
                        </Deferred>
                    </div>


                    {/* --- BAGIAN 3: INFO TERBARU --- */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-between transition-all duration-300 hover:shadow-md h-full">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg">
                                            <Calendar size={20} />
                                        </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">Status Anggaran {tahunAnggaran}</h4>
                                    </div>
                                    <span className={`text-[10px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full border ${getStatusColor(rawStatus)}`}>
                                        {statusAnggaran}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    Tahun Anggaran <b className="font-semibold text-gray-900 dark:text-white">{tahunAnggaran}</b> saat ini berstatus <b className="font-semibold text-gray-900 dark:text-white">{statusAnggaran}</b>. Pastikan semua dokumen diinput sesuai jadwal.
                                </p>
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Tiga Serangkai University</span>
                                <Link href={route('daftar-ajuan.index')} className="text-xs font-semibold text-gray-500 hover:text-indigo-600 flex items-center gap-1">
                                    Lihat RKAT <ArrowRight size={12} />
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full transition-all duration-300 hover:shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 rounded-lg">
                                    <Calendar size={20} />
                                </div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Kegiatan Terdekat (TA {tahunAnggaran})</h4>
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
                                        <div className="text-sm text-gray-500 text-center italic mt-4">Belum ada jadwal kegiatan terdekat untuk tahun ini.</div>
                                    )}
                                </div>
                            </Deferred>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 shadow-md text-white flex flex-col justify-between h-full transition-all duration-300 hover:shadow-lg">
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                                        <MessageCircle size={20} />
                                    </div>
                                    <h4 className="font-bold text-base">Butuh Bantuan?</h4>
                                </div>
                                <p className="text-sm text-indigo-50 leading-relaxed mb-4">
                                    Jika mengalami kendala teknis dalam penginputan RKAT atau filter tahun, silakan hubungi Tim IT TSU via email resmi:
                                </p>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20 text-xs font-mono font-semibold text-white">
                                    <Mail size={14} className="text-indigo-200" />
                                    <span>rekat@tsu.ac.id</span>
                                </div>
                            </div>
                            <div className="mt-5 flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleContactSupport}
                                    className="inline-flex items-center gap-2 text-xs font-bold bg-white text-indigo-600 px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-all shadow-sm cursor-pointer"
                                >
                                    <Mail size={14} /> Hubungi IT Support <ArrowRight size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (navigator.clipboard) {
                                            navigator.clipboard.writeText('rekat@tsu.ac.id');
                                            toast.success("Email (rekat@tsu.ac.id) disalin ke clipboard!");
                                        }
                                    }}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-800/60 hover:bg-indigo-800 text-white px-3 py-2.5 rounded-xl transition-all border border-indigo-500/40 cursor-pointer"
                                    title="Salin Email"
                                >
                                    <Copy size={13} /> Salin Email
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* --- SEKSI FAQ (PERTANYAAN FREKUEN & PANDUAN) --- */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-teal-100 text-teal-600 dark:bg-teal-900/40 dark:text-teal-400 rounded-xl">
                                    <HelpCircle size={22} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Pertanyaan Umum (FAQ) & Panduan Sistem</h3>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Jawaban cepat mengenai filter tahun, alur pencairan, dan pengajuan RKAT</p>
                                </div>
                            </div>
                            <span className="hidden sm:inline-flex text-xs font-semibold px-3 py-1 bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 rounded-full border border-teal-200/60 dark:border-teal-800/60">
                                Pusat Bantuan & Edukasi
                            </span>
                        </div>

                        <FaqAccordion />
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function FaqAccordion() {
    const [openIndex, setOpenIndex] = React.useState(null);

    const faqs = [
        {
            question: "Bagaimana cara mengubah Filter Tahun Anggaran di Dashboard?",
            badge: "Filter Tahun",
            answer: (
                <p>
                    Gunakan menu pilihan <strong>"Filter Tahun Anggaran"</strong> pada bagian kanan atas kartu header Dashboard. Pilih tahun anggaran yang ingin Anda analisis, maka secara otomatis seluruh statistik dokumen, grafik tren, dan nominal keuangan akan diperbarui sesuai tahun yang dipilih.
                </p>
            )
        },
        {
            question: "Bagaimana cara mengubah Mode Malam (Dark Mode) dan Mode Terang (Light Mode)?",
            badge: "Mode Tampilan",
            answer: (
                <div className="space-y-2">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                        Untuk mengubah tema tampilan sistem (Dark Mode / Light Mode):
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300 font-medium pl-1">
                        <li>
                            Klik pada <strong>Foto / Nama Profil</strong> Anda yang terletak di <strong>pojok kanan atas</strong> navigasi header.
                        </li>
                        <li>
                            Pilih menu <strong>"Tema Tampilan"</strong> (dengan ikon Bulan <Moon size={14} className="inline text-indigo-400 font-bold" /> / Matahari <Sun size={14} className="inline text-amber-500 font-bold" />).
                        </li>
                        <li>
                            Geser tombol saklar (<em>toggle switch</em>) untuk mengaktifkan <strong>Mode Malam (Dark Mode)</strong> atau <strong>Mode Terang (Light Mode)</strong>. Sistem akan langsung menyesuaikan tema tampilan secara otomatis.
                        </li>
                    </ol>
                </div>
            )
        },
        {
            question: "Bagaimana cara mengajukan dokumen RKAT baru?",
            badge: "Pengajuan RKAT",
            answer: (
                <p>
                    Navigasi ke menu <strong>Daftar Ajuan</strong> pada sidebar/menu utama, lalu klik tombol hijau <strong>"+ Baru"</strong>. Lengkapi form rincian kegiatan dan anggaran yang dibutuhkan, kemudian klik simpan sebagai Draft atau ajukan dokumen untuk proses verifikasi.
                </p>
            )
        },
        {
            question: "Bagaimana alur pencairan anggaran dan laporan LPJ?",
            badge: "Pencairan & LPJ",
            answer: (
                <p>
                    Setelah dokumen RKAT disetujui final, Anda dapat mengajukan pencairan secara bertahap melalui menu <strong>Pencairan Dana</strong>. Setelah pencairan dicairkan dan kegiatan selesai dilaksanakan, wajib mengunggah Laporan Pertanggungjawaban pada menu <strong>LPJ</strong>.
                </p>
            )
        },
        {
            question: "Bagaimana cara mengunduh data ke format Excel?",
            badge: "Export Data",
            answer: (
                <p>
                    Di setiap halaman tabel data (Daftar RKAT, Pencairan Dana, LPJ, dll), klik tombol hijau <strong>"Export Excel"</strong> di bagian atas tabel. Hasil export sudah dirancang dengan header berwarna (*contrast heading*) yang rapi dan siap cetak/lapor.
                </p>
            )
        }
    ];

    return (
        <div className="space-y-3">
            {faqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                    <div
                        key={idx}
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isOpen
                                ? 'bg-slate-50/80 dark:bg-gray-900/60 border-teal-400/80 dark:border-teal-700/80 shadow-sm'
                                : 'bg-white dark:bg-gray-800/80 border-gray-100 dark:border-gray-700/80 hover:border-gray-200 dark:hover:border-gray-600'
                            }`}
                    >
                        <button
                            type="button"
                            onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                            className="w-full p-4 md:p-5 text-left flex items-center justify-between gap-4 transition-colors cursor-pointer"
                        >
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl text-xs font-bold shrink-0 ${isOpen
                                        ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                    }`}>
                                    Q{idx + 1}
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">
                                    {faq.question}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <span className="hidden md:inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300 border border-gray-200/60 dark:border-gray-600/60">
                                    {faq.badge}
                                </span>
                                <div className={`p-1.5 rounded-full transition-transform duration-300 ${isOpen ? 'rotate-180 bg-teal-100 text-teal-700 dark:bg-teal-900/60 dark:text-teal-300' : 'text-gray-400'}`}>
                                    <ChevronDown size={18} />
                                </div>
                            </div>
                        </button>
                        {isOpen && (
                            <div className="px-5 pb-5 pt-2 text-xs md:text-sm text-gray-600 dark:text-gray-300 border-t border-gray-100/80 dark:border-gray-700/50 mt-1 leading-relaxed">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
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