import React from 'react';
import Modal from '@/Components/Modal'; // Asumsi komponen Modal ada
import InputLabel from '@/Components/InputLabel';
//import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function ApprovalModal({ 
    show, onClose, title, submit, processing, data, setData, errors, actionType 
}) {
    // Tentukan warna tombol berdasarkan aksi
    const buttonClass = actionType === 'Setuju' 
        ? 'bg-green-600 hover:bg-green-700' 
        : (actionType === 'Revisi' 
            ? 'bg-blue-500 hover:bg-blue-600' 
            : 'bg-red-600 hover:bg-red-700');

    return (
        <Modal show={show} onClose={onClose}>
            <form onSubmit={submit} className="p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Anda akan melakukan aksi **{actionType}** pada dokumen ini.
                    {actionType !== 'Setuju' && (
                        <span className='font-semibold text-red-500'> Catatan diperlukan untuk Revisi atau Tolak.</span>
                    )}
                </p>

                <div className="mt-6">
                    <InputLabel htmlFor="catatan" value="Catatan (Opsional / Diperlukan)" />

                    <textarea
                        id="catatan"
                        value={data.catatan}
                        onChange={(e) => setData('catatan', e.target.value)}
                        className="mt-1 block w-full border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-teal-500 dark:focus:border-teal-600 focus:ring-teal-500 dark:focus:ring-teal-600 rounded-md shadow-sm"
                        rows="4"
                    />

                    <InputError message={errors.catatan} className="mt-2" />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <SecondaryButton onClick={onClose}>Batal</SecondaryButton>

                    <PrimaryButton disabled={processing} className={buttonClass}>
                        {processing ? 'Memproses...' : actionType}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}