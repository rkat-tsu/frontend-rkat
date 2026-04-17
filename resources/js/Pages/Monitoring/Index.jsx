import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import CustomSelect from '@/Components/CustomSelect';
import { Monitor, BarChart3, Clock, FileText, Eye } from 'lucide-react';

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

    // ⛔ TANPA route()
    const handleYearChange = (value) => {
        router.get('/monitoring', { tahun: value }, { preserveState: true });
    };

    const formatRupiah = (num = 0) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(num);

    return (
        <AuthenticatedLayout
            user={auth?.user ?? null}
            header={<h2 className="font-semibold text-xl">Monitoring RKAT</h2>}
        >
            <Head title="Monitoring RKAT" />

            <div className="py-6 max-w-7xl mx-auto space-y-6">

                {/* FILTER */}
                <div className="bg-white p-4 rounded shadow">
                    <label className="text-xs font-bold uppercase text-gray-500 mb-1 block">
                        Tahun Anggaran
                    </label>
                    <CustomSelect
                        value={selectedYear}
                        onChange={handleYearChange}
                        options={tahunOptions.map(t => ({
                            value: t.tahun_anggaran,
                            label: t.tahun_anggaran
                        }))}
                    />
                </div>

                {/* STAT */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Stat title="Total Unit" value={stats.total_unit} icon={<Monitor />} />
                    <Stat title="Sudah Submit" value={`${stats.sudah_submit} / ${stats.total_unit}`} icon={<Clock />} />
                    <Stat title="Total Anggaran" value={formatRupiah(stats.total_anggaran_diajukan)} icon={<BarChart3 />} />
                </div>

                {/* TABLE */}
                <div className="bg-white rounded shadow overflow-x-auto">
                    <div className="px-4 py-3 border-b font-semibold flex items-center gap-2">
                        <FileText size={18} /> Progres RKAT {selectedYear}
                    </div>

                    <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3">No</th>
                                <th className="p-3">Unit</th>
                                <th className="p-3">Status</th>
                                <th className="p-3 text-right">Anggaran</th>
                                <th className="p-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? data.map((item, i) => (
                                <tr key={item.id_unit} className="border-t">
                                    <td className="p-3 text-center">{i + 1}</td>
                                    <td className="p-3">
                                        <div className="font-bold">{item.nama_unit}</div>
                                        <div className="text-xs text-gray-500">
                                            {item.kode_unit} | {item.kepala_unit}
                                        </div>
                                    </td>
                                    <td className="p-3">{item.status}</td>
                                    <td className="p-3 text-right">
                                        {item.total_anggaran > 0
                                            ? formatRupiah(item.total_anggaran)
                                            : '-'}
                                    </td>
                                    <td className="p-3 text-center">
                                        {item.id_header ? (
                                            <Link
                                                href={`/rkat/${item.id_header}`}
                                                className="inline-flex items-center text-xs border px-3 py-1 rounded"
                                            >
                                                <Eye size={14} className="mr-1" /> Detail
                                            </Link>
                                        ) : '-'}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="p-6 text-center text-gray-400 italic">
                                        Tidak ada data RKAT
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}

function Stat({ title, value, icon }) {
    return (
        <div className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
                <p className="text-xs uppercase text-gray-500 font-bold">{title}</p>
                <p className="text-lg font-bold">{value}</p>
            </div>
            {icon}
        </div>
    );
}
