import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import DateInput from '@/Components/DateInput';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/Components/ui/dropdown-menu';
import PrimaryButton from '@/Components/PrimaryButton';
import { usePage } from '@inertiajs/react';

export default function Create() {
    const { props } = usePage();
    const authUser = props?.auth?.user;

    const { data, setData, post, errors, processing } = useForm({
        tahun_anggaran: '',
        tanggal_mulai: '',
        tanggal_akhir: '',
        status_rkat: 'Drafting',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('tahun.store'));
    };

    const statusOptions = ['Drafting', 'Submission', 'Approved', 'Closed'];

    return (
        <AuthenticatedLayout
            user={authUser}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tambah Tahun Anggaran</h2>}
        >
            <Head title="Tambah Tahun Anggaran" />

            <div className="py-4">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Tahun Anggaran */}
                            <div>
                                <InputLabel htmlFor="tahun_anggaran" value="Tahun Anggaran" />
                                <TextInput
                                    id="tahun_anggaran"
                                    type="number"
                                    value={data.tahun_anggaran}
                                    onChange={(e) => setData('tahun_anggaran', e.target.value)}
                                    placeholder="Contoh: 2025"
                                    className="mt-1 block w-full"
                                />
                                {errors.tahun_anggaran && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.tahun_anggaran}</p>
                                )}
                            </div>

                            {/* Tanggal Mulai */}
                            <div>
                                <InputLabel htmlFor="tanggal_mulai" value="Tanggal Mulai" />
                                <DateInput
                                    id="tanggal_mulai"
                                    value={data.tanggal_mulai}
                                    onChange={(val) => setData('tanggal_mulai', val)}
                                    className="mt-1 block w-full"
                                />
                                {errors.tanggal_mulai && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.tanggal_mulai}</p>
                                )}
                            </div>

                            {/* Tanggal Akhir */}
                            <div>
                                <InputLabel htmlFor="tanggal_akhir" value="Tanggal Akhir" />
                                <DateInput
                                    id="tanggal_akhir"
                                    value={data.tanggal_akhir}
                                    onChange={(val) => setData('tanggal_akhir', val)}
                                    className="mt-1 block w-full"
                                />
                                {errors.tanggal_akhir && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.tanggal_akhir}</p>
                                )}
                            </div>

                            {/* Status RKAT */}
                            <div>
                                <InputLabel htmlFor="status_rkat" value="Status RKAT" />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <div className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-left cursor-pointer">
                                            {data.status_rkat}
                                        </div>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent sideOffset={6} className="w-56">
                                        {statusOptions.map((status) => (
                                            <DropdownMenuItem key={status} onSelect={() => setData('status_rkat', status)} className={data.status_rkat === status ? 'bg-teal-100 dark:bg-teal-800 font-semibold' : ''}>
                                                {status}
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                {errors.status_rkat && (
                                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.status_rkat}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={processing} className="bg-teal-600 hover:bg-teal-700">
                                    Simpan
                                </PrimaryButton>
                                <Link href={route('tahun.index')}>
                                    <button
                                        type="button"
                                        className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition"
                                    >
                                        Batal
                                    </button>
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
