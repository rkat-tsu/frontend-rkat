import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        kode_anggaran: '',
        nama_anggaran: '',
        kelompok_anggaran: '',
        pagu_limit: 0,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('rincian.store'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tambah Rincian Anggaran</h2>}>
            <Head title="Tambah Rincian Anggaran" />

            <div className="py-6">
                <div className="max-w-3xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="bg-white dark:bg-gray-800 p-6 shadow sm:rounded-lg">
                        <div className="mt-4">
                            <InputLabel value="Kode Anggaran" />
                            <TextInput value={data.kode_anggaran} onChange={e => setData('kode_anggaran', e.target.value)} className="mt-1 block w-full h-11" />
                            <InputError message={errors.kode_anggaran} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel value="Nama Anggaran" />
                            <TextInput value={data.nama_anggaran} onChange={e => setData('nama_anggaran', e.target.value)} className="mt-1 block w-full h-11" />
                            <InputError message={errors.nama_anggaran} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel value="Kelompok Anggaran" />
                            <TextInput value={data.kelompok_anggaran} onChange={e => setData('kelompok_anggaran', e.target.value)} className="mt-1 block w-full h-11" />
                            <InputError message={errors.kelompok_anggaran} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <InputLabel value="Pagu Limit" />
                            <TextInput type="number" value={data.pagu_limit} onChange={e => setData('pagu_limit', e.target.value)} className="mt-1 block w-full h-11" />
                            <InputError message={errors.pagu_limit} className="mt-2" />
                        </div>

                        <div className="flex justify-end mt-6">
                            <PrimaryButton type="submit" disabled={processing}>Simpan</PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
