import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import React from 'react';

export default function Index({ items }) {
    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">RAB Items</h2>}>
            <Head title="RAB Items" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Daftar RAB Item</h3>
                            {/* Tombol 'Buat Baru' dihapus karena halaman create telah dihapus */}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">ID</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Rkat Detail</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Kode Akun</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300">Deskripsi</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Vol</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Harga</th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {items.data && items.data.length > 0 ? items.data.map(item => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{item.id}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{item.rkat_detail?.judul_kegiatan || item.id_rkat_detail}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{item.kode_anggaran}</td>
                                            <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200">{item.deskripsi_item}</td>
                                            <td className="px-4 py-2 text-sm text-right text-gray-700 dark:text-gray-200">{item.volume}</td>
                                            <td className="px-4 py-2 text-sm text-right text-gray-700 dark:text-gray-200">{item.harga_satuan}</td>
                                            <td className="px-4 py-2 text-sm text-right text-gray-700 dark:text-gray-200">{item.sub_total}</td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-6 text-center text-sm text-gray-500">Tidak ada data</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {items.meta && (
                            <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                                <div>Halaman {items.meta.current_page} dari {items.meta.last_page}</div>
                                <div className="space-x-2">
                                    {items.links && items.links.map((link, idx) => (
                                        <a key={idx} href={link.url || '#'} className={"px-2 py-1 rounded " + (link.active ? 'bg-teal-600 text-white' : 'text-gray-700 dark:text-gray-200') } dangerouslySetInnerHTML={{ __html: link.label }} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
