// resources/js/Pages/Rkat/Create.jsx - Disesuaikan dengan tampilan gambar

import React, { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';
import InputError from '@/Components/InputError';
import TextArea from '@/Components/TextArea';
import RupiahInput from '@/Components/RupiahInput';
import Dropdown from '@/Components/Dropdown';

// Asumsi: Kita mengirimkan ID IKU/SubIKU/IKK/Proker yang dipilih.
// Di form ini, kita akan memilih Proker, lalu menampilkan IKU/Sub IKU/IKK terkait.

export default function RkatCreate({
    auth, tahunAnggarans, departemens, programKerjas, akunAnggarans, ikusubs, ikks
}) {
    const { data, setData, post, processing, errors } = useForm({
        // Header
        tahun_anggaran: tahunAnggarans.length > 0 ? tahunAnggarans[0].tahun_anggaran : '',
        id_departemen: '', // Unit Kerja/Sub Unit
        nomor_dokumen: '', // Kode Kegiatan (opsional)
        kode_akun: '', // Perlu ditambahkan di form!

        // Detail
        id_program: '',
        judul_pengajuan: '', // Judul Kegiatan
        jadwal_pelaksanaan: '', // Jadwal Pelaksanaan
        lokasi_pelaksanaan: '', // Kolom tambahan, jika perlu
        anggaran: 0, // RAB, harus ditambahkan di form!
        kegiatan: 'Rutin', // Default, jika tidak ada input

        // Deskripsi (Latar Belakang hingga Indikator Kerja)
        latar_belakang: '',
        rasional: '',
        tujuan: '',
        mekanisme: '',
        indikator_keberhasilan: '',
    });

    // State untuk menampilkan IKU/Sub IKU/IKK berdasarkan Proker yang dipilih
    const [selectedIkuHierarchy, setSelectedIkuHierarchy] = useState({ iku: '', ikusub: '', ikk: '' });

    // Fungsi untuk mencari dan menampilkan IKU Hierarchy
    useEffect(() => {
        const selectedProgram = programKerjas.find(p => p.id_proker == data.id_program);
        if (selectedProgram) {
            setSelectedIkuHierarchy({
                iku: selectedProgram.ikk.ikusub.iku.nama_iku,
                ikusub: selectedProgram.ikk.ikusub.nama_ikusub,
                ikk: selectedProgram.ikk.nama_ikk,
            });
        } else {
            setSelectedIkuHierarchy({ iku: '', ikusub: '', ikk: '' });
        }
    }, [data.id_program, programKerjas]);


    const submit = (e) => {
        e.preventDefault();
        post(route('rkat.store'));
    };

    const getProgramLabel = (program) => {
        return `${program.kode_proker} - ${program.nama_proker}`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Form RKAT</h2>}
        >
            <Head title="Input Form" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <form onSubmit={submit} className="bg-white dark:bg-gray-800 p-8 shadow sm:rounded-lg space-y-6">

                        {/* BARIS ATAS (Kode Kegiatan & Unit Kerja) */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="nomor_dokumen" value="Kode Kegiatan (Opsional)" />
                                <TextInput
                                    id="nomor_dokumen"
                                    value={data.nomor_dokumen}
                                    onChange={(e) => setData('nomor_dokumen', e.target.value)}
                                    className="mt-1 block w-full"
                                    placeholder="Contoh: I.A.S.LI"
                                />
                                <InputError message={errors.nomor_dokumen} />
                            </div>
                            <div>
                                <InputLabel htmlFor="id_departemen" value="Unit Kerja/Sub Unit" />
                                <SelectInput
                                    id="id_departemen"
                                    value={data.id_departemen}
                                    onChange={(e) => setData('id_departemen', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                >
                                    <option value="">Pilih Unit</option>
                                    {departemens.map((dep) => (
                                        <option key={dep.id_departemen} value={dep.id_departemen}>
                                            {dep.nama_departemen}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.id_departemen} />
                            </div>
                        </div>

                        {/* <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="id_program" value="Pilih Program Kerja" />
                                <SelectInput
                                    id="id_program"
                                    value={data.id_program}
                                    onChange={(e) => setData('id_program', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                >
                                    <option value="">Pilih Proker</option>
                                    {programKerjas.map((prog) => (
                                        <option key={prog.id_proker} value={prog.id_proker}>
                                            {getProgramLabel(prog)}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.id_program} />
                            </div>
                            {/* Tambahkan kolom Kode Akun di sini
                            <div>
                                <InputLabel htmlFor="kode_akun" value="Kode Akun Anggaran" />
                                <SelectInput
                                    id="kode_akun"
                                    value={data.kode_akun}
                                    onChange={(e) => setData('kode_akun', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                >
                                    <option value="">Pilih Akun</option>
                                    {akunAnggarans.map((akun) => (
                                        <option key={akun.kode_akun} value={akun.kode_akun}>
                                            {akun.kode_akun} - {akun.nama_akun}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.kode_akun} />
                            </div>
                        </div>

                        {/* DISPLAY HIERARKI IKU */}
                        <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                            <div>
                                <InputLabel value="IKU" className="text-sm font-medium" />
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedIkuHierarchy.iku || '—'}</p>
                            </div>
                            <div>
                                <InputLabel value="Sub IKU" className="text-sm font-medium" />
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedIkuHierarchy.ikusub || '—'}</p>
                            </div>
                            <div>
                                <InputLabel value="IKK" className="text-sm font-medium" />
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedIkuHierarchy.ikk || '—'}</p>
                                <InputError message={errors.id_program} /> {/* Error akan muncul di sini jika proker tidak dipilih */}
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="judul_pengajuan" value="Judul Kegiatan" />
                            <TextArea
                                id="judul_pengajuan"
                                value={data.judul_pengajuan}
                                onChange={(e) => setData('judul_pengajuan', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.judul_pengajuan} />
                        </div>

                        {/* JUDUL KEGIATAN & JADWAL */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="jadwal_pelaksanaan" value="Jadwal Pelaksanaan" />
                                <TextInput
                                    id="jadwal_pelaksanaan"
                                    type="date"
                                    value={data.jadwal_pelaksanaan}
                                    onChange={(e) => setData('jadwal_pelaksanaan', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                                <InputError message={errors.waktu_pelaksanaan} />
                            </div>
                            <div>
                                <InputLabel htmlFor="lokasi_pelaksanaan" value="Lokasi Pelaksanaan" />
                                <TextInput
                                    id="lokasi_pelaksanaan"
                                    value={data.lokasi_pelaksanaan}
                                    onChange={(e) => setData('lokasi_pelaksanaan', e.target.value)}
                                    className="mt-1 block w-full"
                                />
                            </div>
                        </div>

                        {/* LOKASI & ANGGARAN 
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="anggaran" value="Anggaran (RAB)" />
                                <TextInput
                                    id="anggaran"
                                    type="number"
                                    step="0.01"
                                    value={data.anggaran}
                                    onChange={(e) => setData('anggaran', e.target.value)}
                                    className="mt-1 block w-full"
                                    required
                                />
                                <InputError message={errors.anggaran} />
                            </div>
                        </div>*/}

                        {/* TEXTAREAS (Latar Belakang sampai Indikator Kerja) */}
                        <hr className="my-4" />

                        <div>
                            <InputLabel htmlFor="latar_belakang" value="Latar Belakang" />
                            <TextArea
                                id="latar_belakang"
                                rows="3"
                                value={data.latar_belakang}
                                onChange={(e) => setData('latar_belakang', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.latar_belakang} />
                        </div>

                        <div>
                            <InputLabel htmlFor="rasional" value="Rasionalisasi" />
                            <TextArea
                                id="rasional"
                                rows="3"
                                value={data.rasional}
                                onChange={(e) => setData('rasional', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.rasional} />
                        </div>

                        <div>
                            <InputLabel htmlFor="tujuan" value="Tujuan" />
                            <TextArea
                                id="tujuan"
                                rows="3"
                                value={data.tujuan}
                                onChange={(e) => setData('tujuan', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.tujuan} />
                        </div>

                        <div>
                            <InputLabel htmlFor="mekanisme" value="Mekanisme & Rancangan" />
                            <TextArea
                                id="mekanisme"
                                rows="3"
                                value={data.mekanisme}
                                onChange={(e) => setData('mekanisme', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.mekanisme} />
                        </div>

                        <div>
                            <InputLabel htmlFor="indikator_keberhasilan" value="Indikator Kerja" />
                            <TextArea
                                id="indikator_keberhasilan"
                                rows="3"
                                value={data.indikator_keberhasilan}
                                onChange={(e) => setData('indikator_keberhasilan', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.indikator_keberhasilan} />
                        </div>

                        {/* TOMBOL AKSI */}
                        <div className="flex justify-end pt-4 space-x-4">
                            <PrimaryButton
                                type="submit"
                                onClick={() => {/* Logika simpan draft, jika berbeda dengan kirim */ }}
                                disabled={processing}
                                className="bg-green-500 hover:bg-green-600"
                            >
                                Simpan (Draft)
                            </PrimaryButton>
                            <PrimaryButton
                                type="submit"
                                disabled={processing}
                                className="bg-blue-500 hover:bg-blue-600"
                            >
                                Kirim
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}