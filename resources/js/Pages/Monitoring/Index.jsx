import React, { useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import CustomSelect from '@/Components/CustomSelect';
import { Monitor, BarChart3, Clock, FileText, Eye, PieChart as PieChartIcon } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/Components/ui/chart';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

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

    const { isAdmin } = usePermission();
    
    const handleYearChange = (e) => {
        router.get('/monitoring', { tahun: e.target.value }, { preserveState: true });
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
            .filter(item => item.total_anggaran > 0)
            .sort((a, b) => b.total_anggaran - a.total_anggaran)
            .slice(0, 10) // Top 10 Unit dengan Anggaran Tertinggi
            .map(item => ({
                unit: item.nama_unit,
                anggaran: item.total_anggaran,
            }));
    }, [data]);

    const chartConfigBudget = {
        anggaran: {
            label: "Total Anggaran",
            color: "#4f46e5", // indigo-600
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
            color: "#0ea5e9", // sky-500
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
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pantau progres pengajuan dan serapan anggaran per tahun.</p>
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
                    <Stat title="Total Anggaran" value={formatRupiah(stats.total_anggaran_diajukan)} icon={<BarChart3 size={24} />} colorClass="text-amber-500 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" />
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
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2">
                        <FileText size={18} className="text-indigo-500 dark:text-indigo-400" />
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Progres RKAT {selectedYear}</h4>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                                <tr>
                                    <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-600 font-medium w-10 text-center">No</th>
                                    <th className="px-6 py-3 border-b border-l border-gray-200 dark:border-gray-600 font-medium">Unit Kerja</th>
                                    <th className="px-6 py-3 border-b border-l border-gray-200 dark:border-gray-600 font-medium text-center">Draft</th>
                                    <th className="px-6 py-3 border-b border-l border-gray-200 dark:border-gray-600 font-medium text-center">Proses</th>
                                    <th className="px-6 py-3 border-b border-l border-gray-200 dark:border-gray-600 font-medium text-center">Revisi</th>
                                    <th className="px-6 py-3 border-b border-l border-gray-200 dark:border-gray-600 font-medium text-center">Final</th>
                                    <th className="px-6 py-3 border-b border-l border-gray-200 dark:border-gray-600 font-medium text-center">Tolak</th>
                                    <th className="px-6 py-3 border-b border-l border-gray-200 dark:border-gray-600 font-medium text-right">Total Anggaran</th>
                                    {isAdmin() && <th className="px-6 py-3 border-b border-l border-gray-200 dark:border-gray-600 font-medium text-center">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? data.map((item, i) => (
                                    <tr key={item.id_unit} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 text-center text-gray-900 dark:text-gray-100">{i + 1}</td>
                                        <td className="px-6 py-4 border-b border-l border-gray-200 dark:border-gray-700">
                                            <div className="font-bold text-gray-900 dark:text-white mb-1">{item.nama_unit}</div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300 mr-2 border border-gray-200 dark:border-gray-600">{item.kode_unit}</span>
                                                {item.kepala_unit}
                                            </div>
                                        </td>
                                        <td className="px-2 py-4 border-b border-l border-gray-200 dark:border-gray-700 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.count_draft > 0 ? 'bg-blue-100 text-blue-800' : 'text-gray-300'}`}>
                                                {item.count_draft}
                                            </span>
                                        </td>
                                        <td className="px-2 py-4 border-b border-l border-gray-200 dark:border-gray-700 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.count_proses > 0 ? 'bg-indigo-100 text-indigo-800' : 'text-gray-300'}`}>
                                                {item.count_proses}
                                            </span>
                                        </td>
                                        <td className="px-2 py-4 border-b border-l border-gray-200 dark:border-gray-700 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.count_revisi > 0 ? 'bg-amber-100 text-amber-800' : 'text-gray-300'}`}>
                                                {item.count_revisi}
                                            </span>
                                        </td>
                                        <td className="px-2 py-4 border-b border-l border-gray-200 dark:border-gray-700 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.count_final > 0 ? 'bg-emerald-100 text-emerald-800' : 'text-gray-300'}`}>
                                                {item.count_final}
                                            </span>
                                        </td>
                                        <td className="px-2 py-4 border-b border-l border-gray-200 dark:border-gray-700 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${item.count_tolak > 0 ? 'bg-rose-100 text-rose-800' : 'text-gray-300'}`}>
                                                {item.count_tolak}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-l border-gray-200 dark:border-gray-700 text-right font-bold text-teal-600 dark:text-teal-400">
                                            {item.total_anggaran > 0 ? formatRupiah(item.total_anggaran) : '-'}
                                        </td>
                                        {isAdmin() && (
                                            <td className="px-6 py-4 border-b border-l border-gray-200 dark:border-gray-700 text-center">
                                                <div className="flex justify-center">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Link
                                                                    href={route('daftar-ajuan.index', { unit_id: item.id_unit, tahun: selectedYear })}
                                                                    className="inline-flex items-center justify-center w-8 h-8 border border-indigo-200 dark:border-indigo-900/50 rounded-md shadow-sm text-indigo-700 dark:text-indigo-300 bg-white hover:bg-indigo-50 dark:bg-gray-700 dark:hover:bg-indigo-900/20 transition-colors"
                                                                >
                                                                    <Eye size={16} />
                                                                </Link>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Detail RKAT</TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={isAdmin() ? 9 : 8} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 italic">
                                            Tidak ada data RKAT untuk tahun ini.
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
