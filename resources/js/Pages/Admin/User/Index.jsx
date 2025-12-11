import React, { useState } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ users }) {
    const { props } = usePage();
    const authUser = props?.auth?.user;
    const [search, setSearch] = useState('');

    // client-side filter for the current page
    const filtered = users.data.filter(u => {
        const q = search.toLowerCase();
        const unitId = String(u.unit?.id_unit || u.id_unit || '').toLowerCase();
        return (
            u.nama_lengkap?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.username?.toLowerCase().includes(q) ||
            u.peran?.toLowerCase().includes(q) ||
            unitId.includes(q)
        );
    });

    return (
        <AuthenticatedLayout
            user={authUser}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Pengaturan Akun</h2>}
        >
            <Head title="Pengaturan Akun" />

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-80">
                                <TextInput
                                    placeholder="Cari nama, email, atau peran"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            {authUser?.peran === 'Admin' && (
                                <Link href={route('user.create')} className="ms-2">
                                    <PrimaryButton className="bg-teal-600 hover:bg-teal-700">Tambah User</PrimaryButton>
                                </Link>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nama</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Peran</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aktif</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filtered.length > 0 ? (
                                        filtered.map(user => (
                                            <tr key={user.id_user} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.nama_lengkap}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.username || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.peran}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.unit?.id_unit ?? user.id_unit ?? '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.unit?.nama_unit || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{user.is_aktif ? 'Ya' : 'Tidak'}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Tidak ada akun</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Simple pagination links */}
                        {/* <div className="mt-4">
                            {users.links && (
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    {/* Inertia's pagination links will be rendered by the server-provided `links` html.
                                    <div dangerouslySetInnerHTML={{ __html: users.links }} />
                                </div>
                            )}
                        </div> */}

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
