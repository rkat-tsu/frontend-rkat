import React from 'react';
import { usePage, Link } from '@inertiajs/react';
import { Home, ChevronRight } from 'lucide-react';

export default function AutomaticBreadcrumbs() {
    const { url } = usePage();
    
    // Hilangkan query string
    const path = url.split('?')[0];
    
    // Split segment path
    const pathSegments = path.split('/').filter(segment => segment);

    // Dictionary untuk nama tampilan yang lebih cantik
    const breadcrumbNameMap = {
        'dashboard': 'Dashboard',
        'rkat': 'RKAT',
        'input': 'Input Baru',
        'rkat-rab-items': 'Daftar Ajuan',
        'rincian-anggaran': 'SBO',
        'iku': 'IKU',
        'approval': 'Persetujuan',
        'monitoring': 'Monitoring',
        'unit': 'Unit Kerja',
        'user': 'Pengguna',
        'tahun': 'Tahun Anggaran',
        'create': 'Tambah',
        'edit': 'Ubah',
        'profile': 'Profil',
    };

    return (
        <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
                {/* Home Icon */}
                <li className="inline-flex items-center">
                    <Link href="/dashboard" className="inline-flex items-center text-xs font-medium text-gray-500 hover:text-teal-600 transition-colors">
                        <Home className="w-3 h-3 mr-1.5" />
                        Home
                    </Link>
                </li>

                {pathSegments.map((segment, index) => {
                    const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
                    const isLast = index === pathSegments.length - 1;
                    
                    // Format nama: Cek map dulu, kalau tidak ada, format title case dari segment
                    let displayName = breadcrumbNameMap[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

                    // Jika ini ID (angka), abaikan atau beri label "Detail"
                    if (!isNaN(segment)) {
                       displayName = `#${segment}`;
                    }

                    return (
                        <li key={index}>
                            <div className="flex items-center">
                                <ChevronRight className="w-4 h-4 text-gray-300 mx-1" />
                                {isLast ? (
                                    <span className="text-xs font-medium text-teal-600 dark:text-teal-400">
                                        {displayName}
                                    </span>
                                ) : (
                                    <Link 
                                        href={href} 
                                        className="text-xs font-medium text-gray-500 hover:text-teal-600 transition-colors"
                                    >
                                        {displayName}
                                    </Link>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}