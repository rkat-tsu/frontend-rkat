import React, { useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import CustomSelect from '@/Components/CustomSelect';
import { Monitor, BarChart3, Clock, FileText, PieChart as PieChartIcon, FileSpreadsheet } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/Components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { exportToExcel } from '@/Utils/exportToExcel';

export default function Index({
    auth = {},
    data = [],
    tahunOptions = [],
    selectedYear = '',
    stats = {
        total_unit: 0,
        sudah_submit: 0,
        total_anggaran_diajukan: 0
    }
}) {
    const handleYearChange = (e) => {
        router.get('/monitoring', { tahun: e.target.value }, { preserveState: true });
    };

    const handleExportExcel = () => {
        if (!data || data.length === 0) return;
        const exportData = data.map((item, index) => ({
            'No': index + 1,
            'Kode Unit': item.kode_unit || '-',
            'Nama Unit': item.nama_unit || '-',
            'Kepala Unit': item.kepala_unit || '-',
            'RKAT (Jumlah Kegiatan)': item.count_rkat || 0,
            'RKAT (Total Anggaran Rp)': item.total_anggaran_rkat || 0,
            'Pencairan (Jumlah Kegiatan)': item.count_pencairan || 0,
            'Pencairan (Total Anggaran Rp)': item.total_anggaran_pencairan || 0,
            'Laporan (Jumlah Kegiatan)': item.count_laporan || 0,
            'Laporan (Total Realisasi Rp)': item.total_anggaran_laporan || 0
        }));

        exportToExcel(exportData, `Monitoring_RKAT_${selectedYear || new Date().getFullYear()}.xlsx`, 'Monitoring Unit');
    };

    const formatRupiah = (num = 0) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(num);

    // Chart Data Processing
    const chartDataBudget = useMemo(() => {
        return data
            .filter(item => (item.total_anggaran_rkat || item.total_anggaran) > 0)
            .sort((a, b) => (b.total_anggaran_rkat || b.total_anggaran) - (a.total_anggaran_rkat || a.total_anggaran))
            .slice(0, 10)
            .map(item => ({
                unit: item.nama_unit,
                anggaran: item.total_anggaran_rkat || item.total_anggaran || 0,
            }));
    }, [data]);

    const chartConfigBudget = {
        anggaran: {
            label: "Total Anggaran",
            color: "#4f46e5",
        },
    };

    const chartDataStatus = useMemo(() => {
        const counts = {
            'Draft': 0,
            'Proses': 0,
            'Revisi': 0,
            'Final': 0,
            'Tolak': 0
        };
        data.forEach(item => {
            counts['Draft'] += item.count_draft || 0;
            counts['Proses'] += item.count_proses || 0;
            counts['Revisi'] += item.count_revisi || 0;
            counts['Final'] += item.count_final || 0;
            counts['Tolak'] += item.count_tolak || 0;
        });
        return Object.keys(counts).map(status => ({
            status,
            count: counts[status]
        })).sort((a, b) => b.count - a.count);
    }, [data]);

    const chartConfigStatus = {
        count: {
            label: "Jumlah Unit",
            color: "#0ea5e9",
        },
    };

    return (
        <AuthenticatedLayout
            user={auth?.user ?? null}
            header={<h2 className="font-semibold text-xl">Monitoring RKAT</h2>}
        >
            <Head title="Monitoring RKAT" />

            <div className="py-6 max-w-7xl mx-auto space-y-6">
                {/* TABS */}
                <div className="flex space-x-1 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl max-w-md mx-auto border border-gray-200 dark:border-gray-700">
                    <Link
                        href={route('monitoring.index')}
                        className="w-full py-2.5 text-sm font-bold leading-5 rounded-lg text-indigo-700 dark:text-indigo-400 bg-white dark:bg-gray-800 shadow ring-1 ring-black/5 flex items-center justify-center gap-2"
                    >
                        Berdasarkan Unit
                    </Link>
                    <Link
                        href={route('monitoring.iku_ikk')}
                        className="w-full py-2.5 text-sm font-medium leading-5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 transition flex items-center justify-center gap-2"
                    >
                        Berdasarkan IKU & IKK
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-indigo-500 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Monitor className="text-indigo-500" />
                            Dashboard Monitoring RKAT
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pantau progres pengajuan, pencairan, dan laporan per unit.</p>
                    </div>
                    <div className="w-full md:w-64">
                        <CustomSelect
                            value={selectedYear}
                            onChange={handleYearChange}
                            className="h-11 rounded-lg border-transparent bg-gray-100 dark:bg-gray-700 dark:text-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-0 text-sm w-full"
                            options={tahunOptions.map(t => ({
                                value: t.tahun_anggaran,
                                label: t.tahun_anggaran
                            }))}
                        />
                    </div>
                </div>

                {/* STAT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Stat title="Total Unit" value={stats.total_unit} icon={<Monitor size={24} />} colorClass="text-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" />
                    <Stat title="Sudah Submit" value={`${stats.sudah_submit} / ${stats.total_unit}`} icon={<Clock size={24} />} colorClass="text-green-500 bg-green-50 dark:bg-green-900/30 dark:text-green-400" />
                    <Stat title="Total Anggaran RKAT" value={formatRupiah(stats.total_anggaran_diajukan)} icon={<BarChart3 size={24} />} colorClass="text-amber-500 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" />
                </div>

                {/* CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* CHART 1: Bar Chart Anggaran per Unit */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <BarChart3 className="text-indigo-500 w-5 h-5" />
                            Top 10 Anggaran Unit Tertinggi
                        </h4>
                        <div className="h-[300px] w-full">
                            {chartDataBudget.length > 0 ? (
                                <ChartContainer config={chartConfigBudget} className="h-full w-full">
                                    <BarChart data={chartDataBudget} margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
                                        <XAxis dataKey="unit" tickLine={false} axisLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
                                        <YAxis tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}Jt`} tickLine={false} axisLine={false} tick={{fill: '#9ca3af', fontSize: 11}} width={70} />
                                        <ChartTooltip 
                                            content={
                                                <ChartTooltipContent 
                                                    formatter={(value) => (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2.5 h-2.5 rounded-[2px] bg-indigo-500"></div>
                                                            <span className="text-gray-500 dark:text-gray-400">Total Anggaran</span>
                                                            <span className="font-mono font-medium text-gray-900 dark:text-gray-50">{new Intl.NumberFormat('id-ID').format(value)}</span>
                                                        </div>
                                                    )}
                                                />
                                            } 
                                        />
                                        <Bar dataKey="anggaran" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 italic">Belum ada data anggaran.</div>
                            )}
                        </div>
                    </div>

                    {/* CHART 2: Status RKAT */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <PieChartIcon className="text-sky-500 w-5 h-5" />
                            Status Persetujuan RKAT
                        </h4>
                        <div className="h-[300px] w-full">
                            {chartDataStatus.length > 0 ? (
                                <ChartContainer config={chartConfigStatus} className="h-full w-full">
                                    <BarChart data={chartDataStatus} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-gray-200 dark:stroke-gray-700" />
                                        <XAxis type="number" tickLine={false} axisLine={false} tick={{fill: '#9ca3af', fontSize: 11}} />
                                        <YAxis dataKey="status" type="category" tickLine={false} axisLine={false} tick={{fill: '#9ca3af', fontSize: 11}} width={100} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} maxBarSize={40} />
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 italic">Belum ada data status.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <FileText size={18} className="text-indigo-500 dark:text-indigo-400" />
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Progres RKAT, Pencairan, dan Laporan {selectedYear}</h4>
                        </div>
                        <button
                            onClick={handleExportExcel}
                            disabled={!data || data.length === 0}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FileSpreadsheet size={16} />
                            Export Excel
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left border-collapse">
                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                                <tr>
                                    <th rowSpan="2" className="px-4 py-3 border-b border-gray-300 dark:border-gray-600 font-medium w-12 text-center">No</th>
                                    <th rowSpan="2" className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Unit</th>
                                    <th colSpan="2" className="px-6 py-2 border-b border-l border-gray-300 dark:border-gray-600 font-bold text-center bg-indigo-50/70 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-200">RKAT</th>
                                    <th colSpan="2" className="px-6 py-2 border-b border-l border-gray-300 dark:border-gray-600 font-bold text-center bg-blue-50/70 dark:bg-blue-900/30 text-blue-900 dark:text-blue-200">Pencairan</th>
                                    <th colSpan="2" className="px-6 py-2 border-b border-l border-gray-300 dark:border-gray-600 font-bold text-center bg-teal-50/70 dark:bg-teal-900/30 text-teal-900 dark:text-teal-200">Laporan</th>
                                </tr>
                                <tr>
                                    <th className="px-4 py-2 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center text-xs bg-indigo-50/30 dark:bg-indigo-900/10">Jumlah Kegiatan</th>
                                    <th className="px-4 py-2 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-right text-xs bg-indigo-50/30 dark:bg-indigo-900/10">Anggaran</th>
                                    
                                    <th className="px-4 py-2 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center text-xs bg-blue-50/30 dark:bg-blue-900/10">Jumlah Kegiatan</th>
                                    <th className="px-4 py-2 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-right text-xs bg-blue-50/30 dark:bg-blue-900/10">Anggaran</th>

                                    <th className="px-4 py-2 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center text-xs bg-teal-50/30 dark:bg-teal-900/10">Jumlah Kegiatan</th>
                                    <th className="px-4 py-2 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-right text-xs bg-teal-50/30 dark:bg-teal-900/10">Anggaran</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? data.map((item, i) => (
                                    <tr key={item.id_unit} className="bg-white dark:bg-gray-800 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20 transition-colors">
                                        {/* 1. No */}
                                        <td className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 text-center text-gray-900 dark:text-gray-100 font-medium">
                                            {i + 1}
                                        </td>

                                        {/* 2. Unit (dapat diklik menggantikan fungsi detail) */}
                                        <td className="px-6 py-4 border-b border-l border-gray-200 dark:border-gray-700">
                                            <Link
                                                href={route('rkat.index', { unit_id: item.id_unit, tahun: selectedYear })}
                                                className="font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 hover:underline inline-flex flex-col group"
                                                title={`Lihat RKAT ${item.nama_unit}`}
                                            >
                                                <span className="text-sm">{item.nama_unit}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 font-normal mt-0.5">
                                                    <span className="bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-[11px] text-gray-700 dark:text-gray-300 mr-2 border border-gray-200 dark:border-gray-600">
                                                        {item.kode_unit}
                                                    </span>
                                                    {item.kepala_unit}
                                                </span>
                                            </Link>
                                        </td>

                                        {/* 3. RKAT - Jumlah Kegiatan */}
                                        <td className="px-4 py-4 border-b border-l border-gray-200 dark:border-gray-700 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.count_rkat > 0 ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300' : 'text-gray-400'}`}>
                                                {item.count_rkat}
                                            </span>
                                        </td>
                                        {/* 3. RKAT - Anggaran */}
                                        <td className="px-4 py-4 border-b border-l border-gray-200 dark:border-gray-700 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                            {item.total_anggaran_rkat > 0 ? formatRupiah(item.total_anggaran_rkat) : '-'}
                                        </td>

                                        {/* 4. Pencairan - Jumlah Kegiatan */}
                                        <td className="px-4 py-4 border-b border-l border-gray-200 dark:border-gray-700 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.count_pencairan > 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' : 'text-gray-400'}`}>
                                                {item.count_pencairan}
                                            </span>
                                        </td>
                                        {/* 4. Pencairan - Anggaran */}
                                        <td className="px-4 py-4 border-b border-l border-gray-200 dark:border-gray-700 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                            {item.total_anggaran_pencairan > 0 ? formatRupiah(item.total_anggaran_pencairan) : '-'}
                                        </td>

                                        {/* 5. Laporan - Jumlah Kegiatan */}
                                        <td className="px-4 py-4 border-b border-l border-gray-200 dark:border-gray-700 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.count_laporan > 0 ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' : 'text-gray-400'}`}>
                                                {item.count_laporan}
                                            </span>
                                        </td>
                                        {/* 5. Laporan - Anggaran */}
                                        <td className="px-4 py-4 border-b border-l border-gray-200 dark:border-gray-700 text-right font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                            {item.total_anggaran_laporan > 0 ? formatRupiah(item.total_anggaran_laporan) : '-'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 italic">
                                            Tidak ada data monitoring untuk tahun ini.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}

function Stat({ title, value, icon, colorClass = "text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400" }) {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700 flex justify-between items-center transition-all hover:shadow-md gap-4">
            <div className="min-w-0 flex-1">
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-bold mb-1 truncate">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white truncate" title={value}>{value}</p>
            </div>
            <div className={`p-3 rounded-full shrink-0 ${colorClass}`}>
                {icon}
            </div>
        </div>
    );
}
