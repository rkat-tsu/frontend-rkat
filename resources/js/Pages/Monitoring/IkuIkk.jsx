import React, { useMemo } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import CustomSelect from '@/Components/CustomSelect';
import { Monitor, BarChart3, Target, Crosshair, ListChecks, PieChart as PieChartIcon } from 'lucide-react';
import { usePermission } from '@/hooks/usePermission';

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/Components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart as RechartsPieChart, Pie, Cell, Tooltip, Label, Sector } from 'recharts';

export default function IkuIkk({
    auth = {},
    data = [],
    tahunOptions = [],
    selectedYear = '',
    stats = {
        total_iku: 0,
        total_ikk: 0,
        total_anggaran_terserap: 0,
        total_kegiatan: 0
    }
}) {
    const { isAdmin } = usePermission();
    
    const handleYearChange = (e) => {
        router.get('/monitoring/iku-ikk', { tahun: e.target.value }, { preserveState: true });
    };

    const formatRupiah = (num = 0) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(num);

    const chartDataAnggaran = useMemo(() => {
        return data
            .filter(item => item.total_anggaran_iku > 0)
            .sort((a, b) => b.total_anggaran_iku - a.total_anggaran_iku)
            .map(item => ({
                name: item.nama_iku.includes(':') ? item.nama_iku.split(':')[0].trim() : (item.nama_iku.length > 15 ? item.nama_iku.substring(0, 15) + '...' : item.nama_iku),
                full_name: item.nama_iku,
                anggaran: item.total_anggaran_iku,
            }));
    }, [data]);

    const chartDataKegiatan = useMemo(() => {
        return data
            .filter(item => item.count_kegiatan_iku > 0)
            .sort((a, b) => b.count_kegiatan_iku - a.count_kegiatan_iku)
            .map(item => ({
                name: item.nama_iku.includes(':') ? item.nama_iku.split(':')[0].trim() : (item.nama_iku.length > 15 ? item.nama_iku.substring(0, 15) + '...' : item.nama_iku),
                full_name: item.nama_iku,
                kegiatan: item.count_kegiatan_iku,
            }));
    }, [data]);

    const chartConfigAnggaran = {
        anggaran: {
            label: "Total Anggaran",
            color: "#0ea5e9", // sky-500
        },
    };

    const chartConfigKegiatan = {
        kegiatan: {
            label: "Jumlah Kegiatan",
            color: "#10b981", // emerald-500
        },
    };

    const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'];

    return (
        <AuthenticatedLayout
            user={auth?.user ?? null}
            header={<h2 className="font-semibold text-xl">Monitoring RKAT (IKU & IKK)</h2>}
        >
            <Head title="Monitoring IKU & IKK" />

            <div className="py-6 max-w-7xl mx-auto space-y-6">
                {/* TABS */}
                <div className="flex space-x-1 p-1 bg-gray-100/50 dark:bg-gray-800/50 rounded-xl max-w-md mx-auto border border-gray-200 dark:border-gray-700">
                    <Link
                        href={route('monitoring.index')}
                        className="w-full py-2.5 text-sm font-medium leading-5 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50 transition flex items-center justify-center gap-2"
                    >
                        Berdasarkan Unit
                    </Link>
                    <Link
                        href={route('monitoring.iku_ikk')}
                        className="w-full py-2.5 text-sm font-bold leading-5 rounded-lg text-indigo-700 dark:text-indigo-400 bg-white dark:bg-gray-800 shadow ring-1 ring-black/5 flex items-center justify-center gap-2"
                    >
                        Berdasarkan IKU & IKK
                    </Link>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-indigo-500 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <Target className="text-indigo-500" />
                            Monitoring IKU & IKK
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Pantau serapan anggaran dan jumlah kegiatan berdasarkan Indikator Kinerja.</p>
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

                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Stat title="Total IKU" value={stats.total_iku} icon={<Target size={24} />} colorClass="text-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" />
                    <Stat title="Total IKK" value={stats.total_ikk} icon={<Crosshair size={24} />} colorClass="text-sky-500 bg-sky-50 dark:bg-sky-900/30 dark:text-sky-400" />
                    <Stat title="Total Kegiatan" value={stats.total_kegiatan} icon={<ListChecks size={24} />} colorClass="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400" />
                    <Stat title="Total Anggaran" value={formatRupiah(stats.total_anggaran_terserap)} icon={<BarChart3 size={24} />} colorClass="text-amber-500 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400" />
                </div>

                {/* CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* CHART 1: Anggaran per IKU */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <BarChart3 className="text-sky-500 w-5 h-5" />
                            Sebaran Anggaran per IKU
                        </h4>
                        <div className="h-[300px] w-full">
                            {chartDataAnggaran.length > 0 ? (
                                <ChartContainer config={chartConfigAnggaran} className="h-full w-full">
                                    <BarChart data={chartDataAnggaran} margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#9ca3af', fontSize: 11}} angle={-45} textAnchor="end" />
                                        <YAxis tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(0)}Jt`} tickLine={false} axisLine={false} tick={{fill: '#9ca3af', fontSize: 11}} width={70} />
                                        <ChartTooltip 
                                            content={
                                                <ChartTooltipContent 
                                                    hideLabel
                                                    formatter={(value, name, props) => (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-bold text-gray-900 dark:text-white">{props.payload.full_name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2.5 h-2.5 rounded-[2px] bg-sky-500"></div>
                                                                <span className="text-gray-500 dark:text-gray-400">Total Anggaran:</span>
                                                                <span className="font-mono font-medium text-gray-900 dark:text-gray-50">{new Intl.NumberFormat('id-ID').format(value)}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                />
                                            } 
                                        />
                                        <Bar dataKey="anggaran" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 italic">Belum ada data anggaran.</div>
                            )}
                        </div>
                    </div>

                    {/* CHART 2: Proporsi Anggaran (Pie) */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                        <InteractivePieChart data={chartDataAnggaran} colors={COLORS} selectedYear={selectedYear} />
                    </div>

                    {/* CHART 3: Kegiatan per IKU */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                            <ListChecks className="text-emerald-500 w-5 h-5" />
                            Jumlah Kegiatan per IKU
                        </h4>
                        <div className="h-[300px] w-full">
                            {chartDataKegiatan.length > 0 ? (
                                <ChartContainer config={chartConfigKegiatan} className="h-full w-full">
                                    <BarChart data={chartDataKegiatan} margin={{ top: 0, right: 0, left: 0, bottom: 40 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-200 dark:stroke-gray-700" />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{fill: '#9ca3af', fontSize: 11}} angle={-45} textAnchor="end" />
                                        <YAxis tickLine={false} axisLine={false} tick={{fill: '#9ca3af', fontSize: 11}} width={40} />
                                        <ChartTooltip 
                                            content={
                                                <ChartTooltipContent 
                                                    hideLabel
                                                    formatter={(value, name, props) => (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-bold text-gray-900 dark:text-white">{props.payload.full_name}</span>
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500"></div>
                                                                <span className="text-gray-500 dark:text-gray-400">Jumlah Kegiatan:</span>
                                                                <span className="font-mono font-medium text-gray-900 dark:text-gray-50">{value}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                />
                                            } 
                                        />
                                        <Bar dataKey="kegiatan" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 italic">Belum ada data kegiatan.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* TABLE IKU & IKK */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-2">
                        <Target size={18} className="text-indigo-500 dark:text-indigo-400" />
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">Serapan IKU & IKK {selectedYear}</h4>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
                                <tr>
                                    <th className="px-6 py-3 border-b border-gray-200 dark:border-gray-600 font-medium">Indikator Kinerja</th>
                                    <th className="px-6 py-3 border-b border-l border-gray-200 dark:border-gray-600 font-medium text-center w-32">Jml Kegiatan</th>
                                    <th className="px-6 py-3 border-b border-l border-gray-200 dark:border-gray-600 font-medium text-right w-48">Total Anggaran</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? data.map((iku, i) => (
                                    <React.Fragment key={iku.id_iku}>
                                        {/* Row IKU */}
                                        <tr className="bg-indigo-50/50 dark:bg-indigo-900/10 border-b border-gray-200 dark:border-gray-700">
                                            <td className="px-6 py-3">
                                                <div className="font-bold text-indigo-700 dark:text-indigo-400">{iku.nama_iku}</div>
                                            </td>
                                            <td className="px-6 py-3 border-l border-gray-200 dark:border-gray-700 text-center font-semibold text-gray-700 dark:text-gray-300">
                                                {iku.count_kegiatan_iku}
                                            </td>
                                            <td className="px-6 py-3 border-l border-gray-200 dark:border-gray-700 text-right font-bold text-teal-600 dark:text-teal-400">
                                                {formatRupiah(iku.total_anggaran_iku)}
                                            </td>
                                        </tr>
                                        
                                        {/* Row IKKs */}
                                        {iku.ikks.length > 0 ? (
                                            iku.ikks.map((ikk, idx) => (
                                                <tr key={ikk.id_ikk} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-750">
                                                    <td className="px-6 py-3 pl-12 relative">
                                                        <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-300 dark:bg-gray-600"></div>
                                                        <div className="absolute left-6 top-1/2 w-4 h-px bg-gray-300 dark:bg-gray-600"></div>
                                                        <div className="text-gray-700 dark:text-gray-300 ml-2">{ikk.nama_ikk}</div>
                                                    </td>
                                                    <td className="px-6 py-3 border-l border-gray-100 dark:border-gray-750 text-center text-gray-600 dark:text-gray-400">
                                                        {ikk.count_kegiatan}
                                                    </td>
                                                    <td className="px-6 py-3 border-l border-gray-100 dark:border-gray-750 text-right text-gray-600 dark:text-gray-400">
                                                        {formatRupiah(ikk.total_anggaran)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-750">
                                                <td colSpan={3} className="px-6 py-2 pl-12 text-sm italic text-gray-400">Belum ada IKK</td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400 italic">
                                            Tidak ada data IKU & IKK untuk tahun ini.
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

function InteractivePieChart({ data, colors, selectedYear }) {
    const [activeIku, setActiveIku] = React.useState('all');

    const totalAnggaran = React.useMemo(() => {
        return data.reduce((acc, curr) => acc + curr.anggaran, 0);
    }, [data]);

    const activeIndex = React.useMemo(
        () => data.findIndex((item) => item.full_name === activeIku),
        [activeIku, data]
    );

    const renderPieShape = React.useCallback(
        (props) => {
            const { outerRadius = 0, innerRadius = 0, cx, cy, startAngle, endAngle, fill, index } = props;
            if (index === activeIndex) {
                return (
                    <g>
                        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8} startAngle={startAngle} endAngle={endAngle} fill={fill} />
                        <Sector
                            cx={cx} cy={cy}
                            startAngle={startAngle}
                            endAngle={endAngle}
                            outerRadius={outerRadius + 18}
                            innerRadius={outerRadius + 10}
                            fill={fill}
                        />
                    </g>
                );
            }
            return <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />;
        },
        [activeIndex]
    );

    if (data.length === 0) {
        return (
            <div className="h-full flex flex-col">
                <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                    <PieChartIcon className="text-amber-500 w-5 h-5" />
                    Proporsi Anggaran IKU
                </h4>
                <div className="flex-1 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 italic">Belum ada data anggaran.</div>
            </div>
        );
    }

    const formatRupiahSingkat = (num) => {
        if (num >= 1e9) return `Rp ${(num / 1e9).toFixed(1)}M`;
        if (num >= 1e6) return `Rp ${(num / 1e6).toFixed(1)}Jt`;
        return `Rp ${new Intl.NumberFormat('id-ID').format(num)}`;
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col gap-3 mb-4">
                <div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-start gap-2">
                        <PieChartIcon className="text-amber-500 w-5 h-5 shrink-0 mt-0.5" />
                        <span>Proporsi Anggaran IKU</span>
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 ml-7">Tahun Anggaran {selectedYear}</p>
                </div>
                <div className="w-full">
                    <CustomSelect 
                        value={activeIku} 
                        onChange={(e) => setActiveIku(e.target.value)}
                        options={[
                            { value: 'all', label: 'Semua Anggaran' },
                            ...data.map(item => ({
                                value: item.full_name,
                                label: item.name
                            }))
                        ]}
                        className="h-9 py-1 px-3 text-xs rounded-lg border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 w-full"
                    />
                </div>
            </div>
            
            <div className="flex-1 flex justify-center items-center h-[260px]">
                <ChartContainer config={{}} className="h-full w-full">
                    <RechartsPieChart onMouseLeave={() => setActiveIku('all')}>
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent 
                                    formatter={(value, name, props) => (
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-gray-900 dark:text-white">{props.payload.full_name}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-[2px]" style={{backgroundColor: props.payload.fill}}></div>
                                                <span className="text-gray-500 dark:text-gray-400">Total Anggaran:</span>
                                                <span className="font-mono font-medium text-gray-900 dark:text-gray-50">{new Intl.NumberFormat('id-ID').format(value)}</span>
                                            </div>
                                        </div>
                                    )}
                                />
                            }
                        />
                        <Pie
                            data={data}
                            dataKey="anggaran"
                            nameKey="full_name"
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={95}
                            strokeWidth={2}
                            activeIndex={activeIndex}
                            activeShape={renderPieShape}
                            onMouseEnter={(_, index) => setActiveIku(data[index].full_name)}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text
                                                x={viewBox.cx}
                                                y={viewBox.cy}
                                                textAnchor="middle"
                                                dominantBaseline="middle"
                                            >
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy - 5}
                                                    className="fill-gray-900 dark:fill-white text-xl font-extrabold"
                                                >
                                                    {activeIndex !== -1 
                                                        ? formatRupiahSingkat(data[activeIndex].anggaran) 
                                                        : formatRupiahSingkat(totalAnggaran)}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={viewBox.cy + 15}
                                                    className="fill-gray-500 dark:fill-gray-400 text-xs font-medium"
                                                >
                                                    {activeIndex !== -1 ? 'Anggaran IKU' : 'Total Anggaran'}
                                                </tspan>
                                            </text>
                                        )
                                    }
                                }}
                            />
                        </Pie>
                    </RechartsPieChart>
                </ChartContainer>
            </div>
        </div>
    );
}
