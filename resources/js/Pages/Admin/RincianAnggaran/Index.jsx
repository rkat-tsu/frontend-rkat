import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Edit2, Trash2, Plus, Search } from 'lucide-react';

export default function Index({ items = [] }) {
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = items.data ? items.data.filter(i => 
        (i.kode_anggaran || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.nama_anggaran || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.kelompok_anggaran || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Rincian Anggaran</h2>}>
            <Head title="Rincian Anggaran" />

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-lg overflow-hidden">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
                            <Search size={18} className="text-gray-400" />
                            <TextInput type="text" placeholder="Search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-gray-100 dark:bg-gray-900 border-0 flex-1" />
                            <Link href={route('rincian.create')}>
                                <PrimaryButton className="flex items-center gap-2"><Plus size={16} /> Tambah</PrimaryButton>
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kode</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama Anggaran</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Kelompok</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Pagu</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filtered.length > 0 ? filtered.map(item => (
                                        <tr key={item.kode_anggaran} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{item.kode_anggaran}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{item.nama_anggaran}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{item.kelompok_anggaran || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-right text-gray-700 dark:text-gray-200">{item.pagu_limit}</td>
                                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                <Link href={route('rincian.edit', item.kode_anggaran)} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition">
                                                    <Edit2 size={14} /> Edit
                                                </Link>
                                                <form method="post" action={route('rincian.destroy', item.kode_anggaran)} onSubmit={(e) => { if(!confirm('Hapus item ini?')) e.preventDefault(); }}>
                                                    <input type="hidden" name="_method" value="delete" />
                                                    <input type="hidden" name="_token" value={document.querySelector('meta[name=csrf-token]')?.getAttribute('content') || ''} />
                                                    <button type="submit" className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition"><Trash2 size={14} /> Hapus</button>
                                                </form>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-6 text-center text-sm text-gray-500">Tidak ada data</td>
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
                                        <a key={idx} href={link.url || '#'} className={"px-2 py-1 rounded " + (link.active ? 'bg-teal-600 text-white' : 'text-gray-700 dark:text-gray-200')} dangerouslySetInnerHTML={{ __html: link.label }} />
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
