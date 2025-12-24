import React from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SecondaryButton from '@/Components/SecondaryButton';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Index({ rkatHeaders = [], accessScope = null, userRole = null }) {
	const { props } = usePage();
	const authUser = props?.auth?.user;

	const formatDate = (d) => {
		if (!d) return '-';
		try {
			return new Date(d).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
		} catch (e) {
			return d;
		}
	};

	const goToPage = (page) => {
		if (!page) return;
		router.get(route('monitoring.index'), { page }, { preserveState: true });
	};

	const items = (rkatHeaders && rkatHeaders.data) ? rkatHeaders.data : [];

	return (
		<AuthenticatedLayout
			user={authUser}
			header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Monitoring RKAT</h2>}
		>
			<Head title="Monitoring RKAT" />

			<div className="py-4">
				<div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
					<div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
						<div className="flex items-center justify-between mb-4">
							<div>
								<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Daftar RKAT</h3>
								<p className="text-sm text-gray-500 dark:text-gray-400">Menampilkan RKAT sesuai scope akses Anda.</p>
							</div>
						</div>

						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
								<thead className="bg-gray-50 dark:bg-gray-700">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tahun</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nomor / Judul</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal Pengajuan</th>
										<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
									</tr>
								</thead>

								<tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
									{items.length > 0 ? (
										items.map((rkat, idx) => (
											<tr key={rkat.id_header} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{rkat.id_header}</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{rkat.unit?.nama_unit || '-'}</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{rkat.tahun_anggaran}</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{rkat.nomor_dokumen || rkat.judul || '-'}</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
														{rkat.status_persetujuan ? rkat.status_persetujuan.replace(/_/g, ' ') : '-' }
													</span>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(rkat.tanggal_pengajuan)}</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-center">
													<div className="flex items-center justify-center gap-2">
														<SecondaryButton onClick={() => router.get(route('rkat.show', rkat.id_header))}>
															Lihat
														</SecondaryButton>
													</div>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">Tidak ada RKAT</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>

						{/* Pagination controls */}
						{rkatHeaders && rkatHeaders.meta && (
							<div className="mt-4 flex items-center justify-between">
								<div className="text-sm text-gray-500 dark:text-gray-400">Halaman {rkatHeaders.meta.current_page} dari {rkatHeaders.meta.last_page}</div>
								<div className="space-x-2">
									<SecondaryButton onClick={() => goToPage(rkatHeaders.meta.current_page - 1)} disabled={!rkatHeaders.links.prev}>
										Sebelumnya
									</SecondaryButton>
									<PrimaryButton onClick={() => goToPage(rkatHeaders.meta.current_page + 1)} disabled={!rkatHeaders.links.next}>
										Berikutnya
									</PrimaryButton>
								</div>
							</div>
						)}

					</div>
				</div>
			</div>
		</AuthenticatedLayout>
	);
}
