import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ActionButton, { ActionGroup } from '@/Components/ActionButton';
import { Edit2, Trash2, Search, Plus, Save, ArrowUp, ArrowDown, ArrowUpDown, Loader2, X, Users, UserCheck, Phone, Mail, Building2, Briefcase, Copy, FileSpreadsheet, Upload, Download, CheckCircle2, AlertCircle, RefreshCw, FileUp, HelpCircle, Info, Check } from 'lucide-react';
import CustomSelect from '@/Components/CustomSelect';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/usePermission';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import FieldTooltipError from '@/Components/FieldTooltipError';
import * as XLSX from 'xlsx';
import { exportToExcel } from '@/Utils/exportToExcel';
import { useResizableTable } from '@/hooks/useResizableTable';

export default function Index({ auth, karyawans = {}, units = [], filters = {}, statusPegawaiOptions = [] }) {
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [unitFilter, setUnitFilter] = useState(filters?.unit_id || '');
    const [statusPegawaiFilter, setStatusPegawaiFilter] = useState(filters?.status_pegawai || '');
    const [statusAktifFilter, setStatusAktifFilter] = useState(filters?.status_aktif || '');
    const [perPage, setPerPage] = useState(filters?.per_page || '15');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'nama');
    const [sortDirection, setSortDirection] = useState(filters?.sort_direction || 'asc');
    const [isSearching, setIsSearching] = useState(false);

    const { isAdmin } = usePermission();
    const { tableRef } = useResizableTable('admin_karyawan');

    const applyFilters = (newSearch, newUnit, newStatusPegawai, newStatusAktif, newPerPage, newSortBy = sortBy, newSortDirection = sortDirection) => {
        setIsSearching(true);
        router.get(
            route('karyawan.index'),
            {
                search: newSearch,
                unit_id: newUnit,
                status_pegawai: newStatusPegawai,
                status_aktif: newStatusAktif,
                per_page: newPerPage,
                sort_by: newSortBy,
                sort_direction: newSortDirection
            },
            {
                only: ['karyawans'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onFinish: () => setIsSearching(false)
            }
        );
    };

    const handleSort = (field) => {
        const newDirection = (sortBy === field && sortDirection === 'asc') ? 'desc' : 'asc';
        setSortBy(field);
        setSortDirection(newDirection);
        applyFilters(searchTerm, unitFilter, statusPegawaiFilter, statusAktifFilter, perPage, field, newDirection);
    };

    const handleInstantSearch = () => {
        applyFilters(searchTerm, unitFilter, statusPegawaiFilter, statusAktifFilter, perPage, sortBy, sortDirection);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        applyFilters('', unitFilter, statusPegawaiFilter, statusAktifFilter, perPage, sortBy, sortDirection);
    };

    const copyValue = async (value, label) => {
        if (!value) return;
        try {
            await navigator.clipboard.writeText(value);
            toast.success(`${label} tersalin`, { description: value });
        } catch {
            toast.error(`${label} tidak dapat disalin`, { description: 'Periksa izin clipboard browser Anda.' });
        }
    };

    // Modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedKaryawan, setSelectedKaryawan] = useState(null);
    const [editingKaryawan, setEditingKaryawan] = useState(null);
    const [createFormErrors, setCreateFormErrors] = useState({});
    const [editFormErrors, setEditFormErrors] = useState({});

    const { data: createData, setData: setCreateData, post, processing: createProcessing, errors: createErrors, reset: resetCreate } = useForm({
        nik: '',
        nama: '',
        email: '',
        no_telepon: '',
        id_unit: '',
        jabatan: '',
        status_pegawai: statusPegawaiOptions.find(option => option.is_active && option.nama === 'Tetap')?.nama || statusPegawaiOptions.find(option => option.is_active)?.nama || '',
        is_aktif: true,
        nidn: '',
        nuptk: '',
    });

    const { data: editData, setData: setEditData, patch, processing: editProcessing, errors: editErrors, reset: resetEdit } = useForm({
        nik: '',
        nama: '',
        email: '',
        no_telepon: '',
        id_unit: '',
        jabatan: '',
        status_pegawai: statusPegawaiOptions.find(option => option.is_active && option.nama === 'Tetap')?.nama || statusPegawaiOptions.find(option => option.is_active)?.nama || '',
        is_aktif: true,
        nidn: '',
        nuptk: '',
    });

    const handleCreateChange = (field, value) => {
        setCreateData(field, value);
        if (createFormErrors[field]) {
            setCreateFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleEditChange = (field, value) => {
        setEditData(field, value);
        if (editFormErrors[field]) {
            setEditFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        const errorsObj = {};
        if (!createData.nama || !createData.nama.trim()) {
            errorsObj.nama = 'Nama lengkap wajib diisi.';
        }
        if (!createData.status_pegawai) {
            errorsObj.status_pegawai = 'Status kepegawaian wajib dipilih.';
        }

        if (Object.keys(errorsObj).length > 0) {
            setCreateFormErrors(errorsObj);
            toast.error("Form Belum Lengkap", { description: "Harap periksa kolom yang wajib diisi." });
            return;
        }

        setCreateFormErrors({});
        const toastId = toast.loading("Menyimpan data SDM...");
        post(route('karyawan.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Berhasil", { id: toastId, description: `Data SDM ${createData.nama} berhasil ditambahkan.` });
                setIsCreateModalOpen(false);
                resetCreate();
            },
            onError: () => toast.error("Gagal Menyimpan", { id: toastId, description: "Terdapat kesalahan saat menyimpan data." })
        });
    };

    const openEditModal = (item) => {
        setEditingKaryawan(item);
        setEditFormErrors({});
        setEditData({
            nik: item.nik || '',
            nama: item.nama || '',
            email: item.email || '',
            no_telepon: item.no_telepon || '',
            id_unit: item.id_unit ? String(item.id_unit) : '',
            jabatan: item.jabatan || '',
            status_pegawai: item.status_pegawai || 'Tetap',
            is_aktif: item.is_aktif ?? true,
            nidn: item.nidn || '',
            nuptk: item.nuptk || '',
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        const errorsObj = {};
        if (!editData.nama || !editData.nama.trim()) {
            errorsObj.nama = 'Nama lengkap wajib diisi.';
        }

        if (Object.keys(errorsObj).length > 0) {
            setEditFormErrors(errorsObj);
            toast.error("Form Belum Lengkap", { description: "Harap periksa kolom yang wajib diisi." });
            return;
        }

        setEditFormErrors({});
        const toastId = toast.loading("Memperbarui data SDM...");
        patch(route('karyawan.update', editingKaryawan.uuid || editingKaryawan.id_karyawan), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Berhasil", { id: toastId, description: `Data SDM berhasil diperbarui.` });
                setIsEditModalOpen(false);
                resetEdit();
                setEditingKaryawan(null);
            },
            onError: () => toast.error("Gagal Memperbarui", { id: toastId, description: "Terdapat kesalahan saat memperbarui data." })
        });
    };

    const handleDelete = (item) => {
        toast.warning("Konfirmasi Hapus", {
            description: `Apakah Anda yakin ingin menghapus data SDM "${item.nama}"?`,
            action: {
                label: "Ya, Hapus",
                onClick: () => {
                    const toastId = toast.loading("Sedang menghapus...");
                    router.delete(route('karyawan.destroy', item.uuid || item.id_karyawan), {
                        preserveScroll: true,
                        onSuccess: () => toast.success("Berhasil dihapus", { id: toastId }),
                        onError: () => toast.error("Gagal menghapus data", { id: toastId })
                    });
                }
            },
            cancel: { label: "Batal" }
        });
    };

    const items = karyawans.data || [];

    const statusOptions = [
        { value: '', label: 'Semua Status Pegawai' },
        ...statusPegawaiOptions.filter(option => option.is_active).map(option => ({ value: option.nama, label: option.nama })),
    ];
    const createStatusOptions = statusOptions.filter(option => option.value !== '');
    const editStatusOptions = statusPegawaiOptions.map(option => ({
        value: option.nama,
        label: `${option.nama}${option.is_active ? '' : ' (Nonaktif)'}`,
    }));

    // Modal & Import Excel States
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [importFile, setImportFile] = useState(null);
    const [importedRows, setImportedRows] = useState([]);
    const [importStats, setImportStats] = useState({ total: 0, newCount: 0, updateCount: 0, invalidCount: 0 });
    const [replaceExisting, setReplaceExisting] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleExportData = () => {
        if (!items || items.length === 0) {
            toast.warning('Tidak ada data karyawan untuk diexport.');
            return;
        }
        const exportData = items.map((k, index) => ({
            'No': index + 1,
            'NIK': k.nik || '',
            'Nama Lengkap': k.nama || '',
            'Email': k.email || '',
            'No Telepon': k.no_telepon || '',
            'Kode Unit': k.unit?.kode_unit || '',
            'Nama Unit Kerja': k.unit?.nama_unit || '',
            'Jabatan': k.jabatan || '',
            'Status Pegawai': k.status_pegawai || '',
            'Status Aktif': k.is_aktif ? 'Aktif' : 'Nonaktif',
            'NIDN': k.nidn || '',
            'NUPTK': k.nuptk || '',
        }));
        exportToExcel(exportData, `Data_Karyawan_${new Date().toISOString().slice(0, 10)}.xlsx`, 'Data Karyawan');
        toast.success('Data Karyawan berhasil diexport!');
    };

    const handleDownloadTemplate = () => {
        try {
            const wb = XLSX.utils.book_new();

            const templateData = [
                {
                    'NO': 1,
                    '(Gelar Depan)': 'Dr. Ir.',
                    'NAMA LENGKAP': 'Budi Santoso, M.Kom.',
                    'EMAIL TSU': 'budi.santoso@tsu.ac.id',
                    'NOMOR WA': '081234567890',
                    'JENIS PEGAWAI': 'Dosen Tetap',
                    'JABATAN STRUKTURAL': 'Dekan FTI',
                    'UNIT': '',
                    'JENIS KELAMIN': 'Laki-laki',
                    'NIK TSU': '202301001',
                    'NIDN': '0123456789',
                    'NUPTK': '',
                    'REKOMENDATOR': '',
                    'JABATAN FUNGSIONAL': 'Lektor Kepala',
                    'PANGKAT JABATAN FUNGSIONAL': 'Pembina / IV a',
                    'STATUS': 'Aktif'
                },
                {
                    'NO': 2,
                    '(Gelar Depan)': '',
                    'NAMA LENGKAP': 'Siti Aminah, S.E., M.M.',
                    'EMAIL TSU': 'siti.aminah@tsu.ac.id',
                    'NOMOR WA': '081298765432',
                    'JENIS PEGAWAI': 'Tendik',
                    'JABATAN STRUKTURAL': 'Kepala Bagian Keuangan',
                    'UNIT': '',
                    'JENIS KELAMIN': 'Perempuan',
                    'NIK TSU': '202302002',
                    'NIDN': '',
                    'NUPTK': '1234567890123456',
                    'REKOMENDATOR': '',
                    'JABATAN FUNGSIONAL': '',
                    'PANGKAT JABATAN FUNGSIONAL': '',
                    'STATUS': 'Aktif'
                },
                {
                    'NO': 3,
                    '(Gelar Depan)': '',
                    'NAMA LENGKAP': 'Ahmad Fauzi, S.Kom., M.T.',
                    'EMAIL TSU': 'ahmad.fauzi@tsu.ac.id',
                    'NOMOR WA': '085712345678',
                    'JENIS PEGAWAI': 'Kontrak',
                    'JABATAN STRUKTURAL': 'Dosen Pengajar',
                    'UNIT': '',
                    'JENIS KELAMIN': 'Laki-laki',
                    'NIK TSU': '202403003',
                    'NIDN': '0987654321',
                    'NUPTK': '',
                    'REKOMENDATOR': '',
                    'JABATAN FUNGSIONAL': 'Asisten Ahli',
                    'PANGKAT JABATAN FUNGSIONAL': 'Penata Muda / III a',
                    'STATUS': 'Aktif'
                }
            ];

            const ws = XLSX.utils.json_to_sheet(templateData);
            ws['!cols'] = [
                { wch: 6 },  // NO
                { wch: 14 }, // (Gelar Depan)
                { wch: 30 }, // NAMA LENGKAP
                { wch: 28 }, // EMAIL TSU
                { wch: 18 }, // NOMOR WA
                { wch: 18 }, // JENIS PEGAWAI
                { wch: 26 }, // JABATAN STRUKTURAL
                { wch: 14 }, // UNIT
                { wch: 15 }, // JENIS KELAMIN
                { wch: 16 }, // NIK TSU
                { wch: 15 }, // NIDN
                { wch: 18 }, // NUPTK
                { wch: 16 }, // REKOMENDATOR
                { wch: 22 }, // JABATAN FUNGSIONAL
                { wch: 26 }, // PANGKAT JABATAN FUNGSIONAL
                { wch: 12 }, // STATUS
            ];
            XLSX.utils.book_append_sheet(wb, ws, 'Data Karyawan');

            XLSX.writeFile(wb, 'Template_Dokumen_Karyawan.xlsx');
            toast.success('Template Excel berhasil diunduh!');
        } catch (err) {
            console.error('Error generating template:', err);
            toast.error('Gagal membuat template Excel.');
        }
    };

    const cleanAcademicTitles = (str) => {
        return String(str || '')
            .toLowerCase()
            .replace(/\b(prof|dr|dra|drs|ir|s\.kom|m\.kom|s\.e|m\.e|m\.si|s\.t|m\.eng|m\.cs|s\.sn|m\.hum|s\.m|m\.acc|akt|dea)\b/gi, '')
            .replace(/[^a-z0-9]/g, '');
    };

    const cleanImportIdentifier = (value) => {
        if (value === null || value === undefined) return null;
        const normalized = String(value).trim();
        if (!normalized || /^[-–—]+$/.test(normalized) || ['n/a', 'na', 'null', 'undefined'].includes(normalized.toLowerCase())) {
            return null;
        }
        return normalized;
    };

    const normalizeImportedRow = (rawRow, nikLookup = {}) => {
        const row = {
            nik: null,
            nama: null,
            email: null,
            no_telepon: null,
            id_unit: null,
            unit: null,
            jabatan: null,
            status_pegawai: null,
            is_aktif: true,
            nidn: null,
            nuptk: null,
        };

        let gelarDepan = '';
        let namaLengkap = '';
        let jabatanStruktural = '';
        let jabatanLain = '';

        for (const [key, val] of Object.entries(rawRow)) {
            const cleanKey = String(key).toLowerCase().replace(/[^a-z0-9]/g, '');
            if (val === null || val === undefined || String(val).trim() === '') continue;
            const strVal = String(val).trim();

            // NIK: NIK TSU, NIK, No Induk, No KTP
            if (cleanKey === 'niktsu' || cleanKey === 'nik' || ['noinduk', 'noktp', 'nomorindukkaryawan'].includes(cleanKey) || (cleanKey.includes('nik') && !cleanKey.includes('klinik'))) {
                row.nik = cleanImportIdentifier(strVal);
            }
            // Gelar Depan: (Gelar Depan), Gelar Depan
            else if (cleanKey.includes('gelardepan') || cleanKey === 'gelar') {
                gelarDepan = strVal;
            }
            // Nama Lengkap: NAMA LENGKAP, Nama, Fullname
            else if (cleanKey.includes('namalengkap') || cleanKey.includes('nama') || ['name', 'fullname'].includes(cleanKey)) {
                namaLengkap = strVal;
            }
            // Email: EMAIL TSU, Email, Surel
            else if (cleanKey.includes('email') || cleanKey.includes('surel') || cleanKey === 'mail') {
                row.email = cleanImportIdentifier(strVal);
            }
            // Jenis Pegawai: JENIS PEGAWAI, Status Kepegawaian
            else if (cleanKey.includes('jenispegawai') || cleanKey.includes('statuspegawai') || cleanKey.includes('kepegawaian')) {
                row.status_pegawai = strVal;
            }
            // Nomor Telepon / WA: NOMOR WA, No Telp, HP, Phone (tidak boleh mencocokkan 'wa' pada 'pegawai')
            else if (cleanKey === 'wa' || cleanKey === 'nomorwa' || cleanKey === 'nowa' || cleanKey.includes('whatsapp') || cleanKey.includes('telepon') || cleanKey.includes('telp') || ['hp', 'nohp', 'phone'].includes(cleanKey)) {
                row.no_telepon = strVal;
            }
            // Jabatan Struktural (diprioritaskan sesuai instruksi: jabatan yg dipake adalah JABATAN STRUKTURAL)
            else if (cleanKey.includes('struktural') || cleanKey === 'jabatanstruktural') {
                jabatanStruktural = strVal;
            }
            // Abaikan Jabatan Fungsional
            else if (cleanKey.includes('fungsional')) {
                continue;
            }
            // Jabatan umum jika tidak ada kolom struktural
            else if (cleanKey.includes('jabatan') || cleanKey.includes('posisi') || cleanKey.includes('role')) {
                jabatanLain = strVal;
            }
            // Status Keaktifan: STATUS, Status Aktif
            else if (cleanKey === 'status' || cleanKey.includes('aktif') || cleanKey.includes('statusaktif') || cleanKey.includes('keaktifan') || cleanKey === 'isaktif') {
                const lowerVal = strVal.toLowerCase();
                if (['nonaktif', 'non aktif', 'tidak aktif', 'pensiun', 'keluar', 'tidak', '0', 'false'].includes(lowerVal)) {
                    row.is_aktif = false;
                } else {
                    row.is_aktif = true;
                }
            }
            // NIDN
            else if (cleanKey.includes('nidn')) {
                row.nidn = cleanImportIdentifier(strVal);
            }
            // NUPTK
            else if (cleanKey.includes('nuptk')) {
                row.nuptk = cleanImportIdentifier(strVal);
            }
            // Unit: (Sesuai instruksi: untuk unitnya kosongan aja dulu)
            else if (cleanKey.includes('unit') || cleanKey.includes('prodi') || cleanKey.includes('fakultas')) {
                row.unit = null;
                row.id_unit = null;
            }
        }

        // Tentukan Jabatan yang dipakai (Jabatan Struktural diprioritaskan, bersihkan karakter '-')
        let finalJabatan = jabatanStruktural || jabatanLain || null;
        if (finalJabatan === '-' || finalJabatan === '--' || finalJabatan === '---') {
            finalJabatan = null;
        }
        row.jabatan = finalJabatan;

        // Gabungkan Gelar Depan dengan Nama Lengkap jika ada
        if (gelarDepan && namaLengkap) {
            if (!namaLengkap.toLowerCase().startsWith(gelarDepan.toLowerCase())) {
                row.nama = `${gelarDepan} ${namaLengkap}`.trim();
            } else {
                row.nama = namaLengkap;
            }
        } else {
            row.nama = namaLengkap || null;
        }

        // Auto-lookup NIK jika NIK kosong dan terdapat referensi NIK (seperti dari sheet URUTAN NIK)
        if (!row.nik && row.nama && nikLookup) {
            const exactKey = row.nama.toLowerCase().replace(/[^a-z0-9]/g, '');
            const cleanKey = cleanAcademicTitles(row.nama);
            row.nik = (nikLookup.exact && nikLookup.exact[exactKey]) || (nikLookup.clean && nikLookup.clean[cleanKey]) || null;
        }

        return row;
    };

    const processFile = (file) => {
        setIsParsing(true);
        setImportFile(file);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });

                // Cari sheet data utama (misal: 'REKAP', 'KARYAWAN', 'DATA', atau sheet pertama)
                let targetSheetName = wb.SheetNames[0];
                const preferredSheet = wb.SheetNames.find(s => ['rekap', 'karyawan', 'data', 'dosen'].includes(s.toLowerCase()));
                if (preferredSheet) {
                    targetSheetName = preferredSheet;
                }
                const ws = wb.Sheets[targetSheetName];

                if (!ws) {
                    toast.error('Berkas Excel tidak memiliki sheet yang dapat dibaca.');
                    setIsParsing(false);
                    return;
                }

                // Ekstrak referensi NIK jika ada sheet 'URUTAN NIK'
                const nikLookup = { exact: {}, clean: {} };
                const urutanSheetName = wb.SheetNames.find(s => s.toLowerCase().includes('urutan') || s.toLowerCase() === 'nik');
                if (urutanSheetName && wb.Sheets[urutanSheetName]) {
                    const urutanRows = XLSX.utils.sheet_to_json(wb.Sheets[urutanSheetName], { header: 1, defval: '' });
                    let uNameIdx = 1;
                    let uNikIdx = 2;
                    for (let r = 0; r < Math.min(urutanRows.length, 5); r++) {
                        const row = urutanRows[r];
                        if (!row) continue;
                        row.forEach((cell, idx) => {
                            const str = String(cell).toLowerCase().replace(/[^a-z0-9]/g, '');
                            if (str === 'nama' || str.includes('namalengkap')) uNameIdx = idx;
                            if (str.includes('nik')) uNikIdx = idx;
                        });
                    }

                    for (let r = 0; r < urutanRows.length; r++) {
                        const row = urutanRows[r];
                        if (!row) continue;
                        const nameVal = row[uNameIdx];
                        const nikVal = row[uNikIdx];
                        if (nameVal && nikVal && String(nameVal).trim() !== '' && String(nikVal).trim() !== '') {
                            const rawName = String(nameVal).trim();
                            const rawNik = String(nikVal).trim();
                            nikLookup.exact[rawName.toLowerCase().replace(/[^a-z0-9]/g, '')] = rawNik;
                            nikLookup.clean[cleanAcademicTitles(rawName)] = rawNik;
                        }
                    }
                }

                // Baca sheet utama sebagai 2D array untuk mendeteksi baris header secara dinamis
                const raw2D = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
                if (!raw2D || raw2D.length === 0) {
                    toast.error('Berkas Excel kosong atau tidak memiliki baris data.');
                    setIsParsing(false);
                    return;
                }

                // Deteksi indeks baris header (mencari kolom kunci seperti NAMA LENGKAP, NIK, JABATAN)
                let headerRowIndex = 0;
                let detectedHeaders = [];

                for (let r = 0; r < Math.min(raw2D.length, 15); r++) {
                    const row = raw2D[r] || [];
                    const joined = row.map(c => String(c).toLowerCase().replace(/[^a-z0-9]/g, '')).join(' ');
                    if (joined.includes('namalengkap') || (joined.includes('nama') && (joined.includes('nik') || joined.includes('jabatan') || joined.includes('pegawai')))) {
                        headerRowIndex = r;
                        detectedHeaders = row;
                        break;
                    }
                }

                if (detectedHeaders.length === 0 && raw2D.length > 0) {
                    headerRowIndex = 0;
                    detectedHeaders = raw2D[0];
                }

                // Susun data baris
                const rawData = [];
                for (let r = headerRowIndex + 1; r < raw2D.length; r++) {
                    const rowCells = raw2D[r];
                    if (!rowCells) continue;

                    // Lewati baris yang benar-benar kosong
                    const hasAnyContent = rowCells.some(c => c !== null && c !== undefined && String(c).trim() !== '');
                    if (!hasAnyContent) continue;

                    // Lewati baris catatan / footer
                    const firstCell = String(rowCells[0] || '').trim().toLowerCase();
                    if (firstCell.startsWith('catatan') || firstCell.startsWith('total') || firstCell.startsWith('keterangan')) {
                        continue;
                    }

                    const rowObj = {};
                    detectedHeaders.forEach((colName, cIdx) => {
                        const cleanCol = String(colName || '').trim();
                        if (cleanCol) {
                            rowObj[cleanCol] = rowCells[cIdx] !== undefined ? rowCells[cIdx] : '';
                        } else if (cIdx === 1) {
                            rowObj['(Gelar Depan)'] = rowCells[cIdx] !== undefined ? rowCells[cIdx] : '';
                        }
                    });

                    rawData.push({ obj: rowObj, rowNum: r + 1 });
                }

                if (rawData.length === 0) {
                    toast.error('Tidak ditemukan baris data karyawan yang valid di dalam berkas.');
                    setIsParsing(false);
                    return;
                }

                // Kumpulan data eksisting untuk cek replace / insert baru
                const existingNikSet = new Set(items.filter(k => k.nik).map(k => String(k.nik).trim().toLowerCase()));
                const existingEmailSet = new Set(items.filter(k => k.email).map(k => String(k.email).trim().toLowerCase()));
                const existingNidnSet = new Set(items.filter(k => k.nidn).map(k => String(k.nidn).trim().toLowerCase()));
                const existingNuptkSet = new Set(items.filter(k => k.nuptk).map(k => String(k.nuptk).trim().toLowerCase()));
                const existingNameSet = new Set(items.filter(k => k.nama).map(k => String(k.nama).trim().toLowerCase()));

                let newCount = 0;
                let updateCount = 0;
                let invalidCount = 0;

                const parsed = rawData.map(({ obj, rowNum }) => {
                    const norm = normalizeImportedRow(obj, nikLookup);
                    const hasName = Boolean(norm.nama && norm.nama.trim());

                    if (!hasName) {
                        invalidCount++;
                        return { ...norm, _status: 'invalid', _rowNumber: rowNum };
                    }

                    const isNikMatch = norm.nik && existingNikSet.has(norm.nik.toLowerCase());
                    const isEmailMatch = norm.email && existingEmailSet.has(norm.email.toLowerCase());
                    const isNidnMatch = norm.nidn && existingNidnSet.has(norm.nidn.toLowerCase());
                    const isNuptkMatch = norm.nuptk && existingNuptkSet.has(norm.nuptk.toLowerCase());
                    const isNameMatch = norm.nama && existingNameSet.has(norm.nama.toLowerCase());

                    const isUpdate = isNikMatch || isEmailMatch || isNidnMatch || isNuptkMatch || isNameMatch;

                    if (isUpdate) {
                        updateCount++;
                        return { ...norm, _status: 'update', _rowNumber: rowNum };
                    } else {
                        newCount++;
                        return { ...norm, _status: 'new', _rowNumber: rowNum };
                    }
                });

                setImportedRows(parsed);
                setImportStats({
                    total: parsed.length,
                    newCount,
                    updateCount,
                    invalidCount
                });
                setIsParsing(false);
                toast.success(`Berhasil membaca ${parsed.length} data karyawan dari ${file.name}`);
            } catch (err) {
                console.error('Error reading excel:', err);
                toast.error('Gagal membaca berkas Excel. Pastikan format berkas valid.');
                setIsParsing(false);
            }
        };
        reader.onerror = () => {
            toast.error('Gagal membaca file.');
            setIsParsing(false);
        };
        reader.readAsBinaryString(file);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        processFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        processFile(file);
    };

    const handleExecuteImport = () => {
        if (!importedRows || importedRows.length === 0) {
            toast.warning('Tidak ada data untuk diimpor.');
            return;
        }

        const validRows = importedRows.filter(r => r._status !== 'invalid');
        if (validRows.length === 0) {
            toast.error('Semua baris dalam berkas tidak valid (Nama Lengkap wajib terisi).');
            return;
        }

        setIsImporting(true);
        const toastId = toast.loading('Sedang mengimpor dan memperbarui data SDM ke database...');

        router.post(
            route('karyawan.import'),
            {
                rows: validRows.map(({ _status, _rowNumber, ...data }) => data),
                replace_existing: replaceExisting
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsImporting(false);
                    setIsImportModalOpen(false);
                    setImportFile(null);
                    setImportedRows([]);
                    toast.success('Impor Berhasil Diselesaikan!', { id: toastId });
                },
                onError: (err) => {
                    setIsImporting(false);
                    toast.error('Gagal Mengimpor Data', {
                        id: toastId,
                        description: err?.message || 'Terjadi kesalahan saat memproses data pada database.'
                    });
                }
            }
        );
    };

    const handleCloseImportModal = () => {
        if (isImporting) return;
        setIsImportModalOpen(false);
        setImportFile(null);
        setImportedRows([]);
        setImportStats({ total: 0, newCount: 0, updateCount: 0, invalidCount: 0 });
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Data SDM / Karyawan</h2>}>
            <Head title="Data SDM / Karyawan" />

            <div className="py-8">
                <div className="w-full max-w-none px-2 sm:px-6 lg:px-8 space-y-6">

                    {/* Header Judul & Tombol Aksi */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                                <Users className="text-teal-600 dark:text-teal-400" size={32} />
                                Data SDM / Karyawan
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Master database profil dosen, staf, dan tenaga kependidikan.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <button
                                type="button"
                                onClick={handleExportData}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl text-sm font-semibold transition shadow-sm"
                                title="Export data karyawan ke file Excel"
                            >
                                <Download size={17} className="text-emerald-600 dark:text-emerald-400" />
                                <span>Export Excel</span>
                            </button>
                            {isAdmin() && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImportFile(null);
                                            setImportedRows([]);
                                            setImportStats({ total: 0, newCount: 0, updateCount: 0, invalidCount: 0 });
                                            setIsImportModalOpen(true);
                                        }}
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl text-sm font-bold transition shadow-sm"
                                        title="Impor data karyawan dari dokumen Excel"
                                    >
                                        <FileSpreadsheet size={17} className="text-emerald-600 dark:text-emerald-400" />
                                        <span>Import Excel</span>
                                    </button>
                                    <button
                                        onClick={() => setIsCreateModalOpen(true)}
                                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-teal-600/20"
                                    >
                                        <Plus size={18} /> Tambah Data SDM
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Filter Card */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl p-5 border border-gray-100 dark:border-gray-700 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {/* Search Box */}
                            <div className="relative col-span-1 sm:col-span-2">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    {isSearching ? (
                                        <Loader2 size={18} className="text-teal-500 animate-spin" />
                                    ) : (
                                        <Search size={18} className="text-gray-400" />
                                    )}
                                </div>
                                <input
                                    type="text"
                                    className="pl-10 pr-10 h-11 block w-full bg-gray-50 border-gray-200 rounded-xl focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all"
                                    placeholder="Cari nama, NIK, jabatan atau email"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleInstantSearch();
                                        }
                                    }}
                                />
                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={handleClearSearch}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                        title="Hapus pencarian"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Filter Unit Kerja */}
                            <div>
                                <CustomSelect
                                    value={unitFilter}
                                    onChange={(e) => {
                                        setUnitFilter(e.target.value);
                                        applyFilters(searchTerm, e.target.value, statusPegawaiFilter, statusAktifFilter, perPage, sortBy, sortDirection);
                                    }}
                                    options={[
                                        { value: '', label: 'Semua Unit Kerja' },
                                        ...units.map(u => ({ value: String(u.id_unit), label: `${u.kode_unit} - ${u.nama_unit}` }))
                                    ]}
                                    placeholder="Pilih Unit Kerja"
                                    className="h-11 w-full text-sm"
                                />
                            </div>

                            {/* Filter Status Pegawai */}
                            <div>
                                <CustomSelect
                                    value={statusPegawaiFilter}
                                    onChange={(e) => {
                                        setStatusPegawaiFilter(e.target.value);
                                        applyFilters(searchTerm, unitFilter, e.target.value, statusAktifFilter, perPage, sortBy, sortDirection);
                                    }}
                                    options={statusOptions}
                                    placeholder="Pilih Status"
                                    className="h-11 w-full text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white dark:bg-gray-800 shadow-sm rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table ref={tableRef} className="min-w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                                <thead className="bg-gray-50/80 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 font-semibold">
                                    <tr>
                                        <th className="w-12 px-4 py-3.5 text-center">No</th>
                                        <th className="px-4 py-3.5">
                                            <button type="button" onClick={() => handleSort('nama')} className="inline-flex items-center gap-1 select-none group w-full">
                                                <span>Nama Lengkap &amp; NIK</span>
                                                {sortBy === 'nama' ? (
                                                    sortDirection === 'asc' ? <ArrowUp size={14} className="text-teal-600" /> : <ArrowDown size={14} className="text-teal-600" />
                                                ) : (
                                                    <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-4 py-3.5">Unit Kerja</th>
                                        <th className="px-4 py-3.5">
                                            <button type="button" onClick={() => handleSort('jabatan')} className="inline-flex items-center gap-1 select-none group w-full">
                                                <span>Jabatan / Posisi</span>
                                                {sortBy === 'jabatan' ? (
                                                    sortDirection === 'asc' ? <ArrowUp size={14} className="text-teal-600" /> : <ArrowDown size={14} className="text-teal-600" />
                                                ) : (
                                                    <ArrowUpDown size={14} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-4 py-3.5">Status Pegawai</th>
                                        <th className="px-4 py-3.5 text-center">Status</th>
                                        <th className="px-4 py-3.5 text-center w-28">Detail / Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {items.length > 0 ? items.map((item, idx) => (
                                        <tr key={item.id_karyawan} className="hover:bg-teal-50/30 dark:hover:bg-gray-700/50 transition">
                                            <td className="px-4 py-3.5 text-center text-gray-400 font-medium">
                                                {(karyawans.from || 1) + idx}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-semibold text-gray-900 dark:text-white">
                                                    {item.nama}
                                                </div>
                                                <div className="mt-1 flex flex-col items-start gap-1 text-xs">
                                                    {item.nik && (
                                                        <button type="button" onClick={() => copyValue(item.nik, 'NIK')} title="Salin NIK" className="group inline-flex items-center gap-1 font-mono text-gray-500 transition hover:text-teal-700 dark:text-gray-400 dark:hover:text-teal-300">
                                                            <span>NIK: {item.nik}</span><Copy size={11} className="opacity-50 group-hover:opacity-100" />
                                                        </button>
                                                    )}
                                                    {item.email && (
                                                        <button type="button" onClick={() => copyValue(item.email, 'Email')} title="Salin email" className="group inline-flex max-w-[260px] items-center gap-1.5 rounded-md text-left text-teal-700 transition hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100">
                                                            <Mail size={13} className="shrink-0 text-teal-600 dark:text-teal-400" />
                                                            <span className="truncate">{item.email}</span>
                                                            <Copy size={12} className="shrink-0 opacity-60 transition group-hover:opacity-100" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {item.unit ? (
                                                    <div>
                                                        <span className="font-medium text-gray-800 dark:text-gray-200">{item.unit.nama_unit}</span>
                                                        <span className="text-xs text-gray-400 ml-1">({item.unit.kode_unit})</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300">
                                                {item.jabatan || '-'}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                                    {item.status_pegawai}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${item.is_aktif ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                                    {item.is_aktif ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <ActionGroup>
                                                    <ActionButton
                                                        variant="detail"
                                                        tooltip="Lihat Detail Karyawan"
                                                        onClick={() => { setSelectedKaryawan(item); setIsDetailModalOpen(true); }}
                                                    />
                                                    {isAdmin() && <>
                                                        <ActionButton
                                                            variant="edit"
                                                            tooltip="Edit Data SDM"
                                                            onClick={() => openEditModal(item)}
                                                        />
                                                        <ActionButton
                                                            variant="delete"
                                                            tooltip="Hapus Data SDM"
                                                            onClick={() => handleDelete(item)}
                                                        />
                                                    </>}
                                                </ActionGroup>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Users size={36} className="text-gray-300 dark:text-gray-600" />
                                                    <p className="text-sm">Tidak ada data SDM / Karyawan yang sesuai.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {karyawans.links && (
                            <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <span>Tampilkan</span>
                                        <div className="w-20">
                                            <CustomSelect
                                                value={perPage}
                                                onChange={(e) => {
                                                    setPerPage(e.target.value);
                                                    applyFilters(searchTerm, unitFilter, statusPegawaiFilter, statusAktifFilter, e.target.value, sortBy, sortDirection);
                                                }}
                                                options={[
                                                    { value: '10', label: '10' },
                                                    { value: '15', label: '15' },
                                                    { value: '25', label: '25' },
                                                    { value: '50', label: '50' },
                                                    { value: 'all', label: 'Semua' }
                                                ]}
                                                className="h-8 text-xs py-1 px-2"
                                            />
                                        </div>
                                    </div>
                                    <span>
                                        Menampilkan <span className="font-bold text-gray-700 dark:text-gray-300">{karyawans.from || 0}</span> - <span className="font-bold text-gray-700 dark:text-gray-300">{karyawans.to || 0}</span> dari <span className="font-bold text-gray-700 dark:text-gray-300">{karyawans.total || 0}</span> data
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {karyawans.links.map((link, k) => (
                                        link.url ? (
                                            <Link
                                                key={k}
                                                href={link.url}
                                                only={['karyawans']}
                                                preserveState
                                                preserveScroll
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${link.active
                                                    ? 'bg-teal-600 text-white shadow-sm'
                                                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                                                    }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ) : (
                                            <span
                                                key={k}
                                                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Detail Karyawan */}
            <Modal show={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} maxWidth="4xl">
                {selectedKaryawan && (
                    <div className="p-6 sm:p-7">
                        <div className="mb-6 flex items-center justify-between gap-4 border-b border-gray-100 pb-5 dark:border-gray-700">
                            <div className="flex min-w-0 items-center gap-4">
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300"><Users size={25} /></div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-wider text-teal-700 dark:text-teal-300">Profil Karyawan</p>
                                    <h2 className="mt-1 truncate text-xl font-bold text-gray-900 dark:text-white">{selectedKaryawan.nama || 'Tanpa Nama'}</h2>
                                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{selectedKaryawan.jabatan || selectedKaryawan.status_pegawai || 'Data SDM / Karyawan'}</p>
                                </div>
                            </div>
                            <span className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${selectedKaryawan.is_aktif ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                {selectedKaryawan.is_aktif ? 'Aktif' : 'Nonaktif'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <section className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                                <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-gray-100">Identitas & Kontak</h3>
                                <div className="space-y-3">
                                    {[
                                        ['NIK TSU', selectedKaryawan.nik, true],
                                        ['NIDN', selectedKaryawan.nidn, true],
                                        ['NUPTK', selectedKaryawan.nuptk, true],
                                        ['Nomor WA', selectedKaryawan.no_telepon, false],
                                    ].map(([label, value, copyable]) => (
                                        <div key={label} className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                                            {copyable && value ? (
                                                <button type="button" onClick={() => copyValue(value, label)} title={`Salin ${label}`} className="group inline-flex items-center gap-1.5 break-all text-left text-sm font-semibold text-gray-800 transition hover:text-teal-700 dark:text-gray-100 dark:hover:text-teal-300">
                                                    <span>{value}</span><Copy size={13} className="shrink-0 opacity-50 group-hover:opacity-100" />
                                                </button>
                                            ) : <span className="break-all text-sm font-semibold text-gray-800 dark:text-gray-100">{value || '-'}</span>}
                                        </div>
                                    ))}
                                    <div className="flex flex-col gap-0.5 border-t border-gray-200 pt-3 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Email</span>
                                        {selectedKaryawan.email ? (
                                            <button type="button" onClick={() => copyValue(selectedKaryawan.email, 'Email')} title="Salin email" className="group inline-flex min-w-0 items-center gap-2 text-left text-sm font-semibold text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100">
                                                <Mail size={14} className="shrink-0" />
                                                <span className="truncate">{selectedKaryawan.email}</span>
                                                <Copy size={13} className="shrink-0 opacity-60 group-hover:opacity-100" />
                                            </button>
                                        ) : <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">-</span>}
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 dark:border-gray-700 dark:bg-gray-900/40">
                                <h3 className="mb-3 text-sm font-bold text-gray-900 dark:text-gray-100">Penempatan & Kepegawaian</h3>
                                <div className="space-y-3">
                                    {[
                                        ['Unit Kerja', selectedKaryawan.unit ? `${selectedKaryawan.unit.kode_unit} - ${selectedKaryawan.unit.nama_unit}` : null],
                                        ['Jabatan Struktural', selectedKaryawan.jabatan],
                                        ['Jenis Pegawai', selectedKaryawan.status_pegawai],
                                        ['Status', selectedKaryawan.is_aktif ? 'Aktif' : 'Nonaktif'],
                                    ].map(([label, value]) => (
                                        <div key={label} className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
                                            <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                                            <span className="break-words text-sm font-semibold text-gray-800 dark:text-gray-100 sm:text-right">{value || '-'}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                        <div className="mt-6 flex justify-end border-t border-gray-100 pt-4 dark:border-gray-700">
                            <SecondaryButton type="button" onClick={() => setIsDetailModalOpen(false)}>Tutup</SecondaryButton>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Tambah SDM */}
            <Modal show={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setCreateFormErrors({}); }} maxWidth="2xl">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Plus className="text-teal-600" size={20} /> Tambah Data SDM / Karyawan
                    </h2>
                </div>
                <form id="create-karyawan-form" onSubmit={handleCreateSubmit} className="px-6 pt-6 pb-6 space-y-4">
                    <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/60">
                        <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-700">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Identitas & Nomor Induk</h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Isi nama dan nomor identitas karyawan yang tersedia.</p>
                        </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nama Lengkap & Gelar <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Dr. Ir. Budi Santoso, M.Kom."
                                value={createData.nama}
                                onChange={(e) => handleCreateChange('nama', e.target.value)}
                                className={`w-full bg-gray-50 border ${(createFormErrors.nama || createErrors.nama) ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-200 focus:ring-teal-500 focus:border-teal-500'} text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm`}
                            />
                            <FieldTooltipError message={createFormErrors.nama || createErrors.nama} />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                NIK
                            </label>
                            <input
                                type="text"
                                placeholder="Nomor Induk Karyawan"
                                value={createData.nik}
                                onChange={(e) => handleCreateChange('nik', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                NIDN
                            </label>
                            <input
                                type="text"
                                placeholder="Nomor Induk Dosen Nasional"
                                value={createData.nidn}
                                onChange={(e) => handleCreateChange('nidn', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm font-mono" />
                            <FieldTooltipError message={createErrors.nidn} />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                NUPTK
                            </label>
                            <input
                                type="text"
                                placeholder="Nomor Unik Pendidik dan Tenaga Kependidikan"
                                value={createData.nuptk}
                                onChange={(e) => handleCreateChange('nuptk', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm font-mono" />
                            <FieldTooltipError message={createErrors.nuptk} />
                        </div>
                    </div>

                    </section>
                    <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/60">
                        <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-700">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Penempatan & Kepegawaian</h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Tentukan unit kerja, jabatan, jenis, dan status keaktifan.</p>
                        </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Unit Kerja / Penempatan
                            </label>
                            <CustomSelect
                                value={createData.id_unit}
                                onChange={(e) => handleCreateChange('id_unit', e.target.value)}
                                options={[
                                    { value: '', label: '-- Pilih Unit Kerja --' },
                                    ...units.map(u => ({ value: String(u.id_unit), label: `${u.kode_unit} - ${u.nama_unit}` }))
                                ]}
                                placeholder="Pilih Unit Kerja"
                                className="h-10 text-sm"
                            />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Jabatan / Posisi
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Dosen / Ka. Lab / Staf Keuangan"
                                value={createData.jabatan}
                                onChange={(e) => handleCreateChange('jabatan', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status Kepegawaian <span className="text-red-500">*</span>
                            </label>
                            <CustomSelect
                                value={createData.status_pegawai}
                                onChange={(e) => handleCreateChange('status_pegawai', e.target.value)}
                                options={createStatusOptions}
                                placeholder="Pilih Status"
                                className="h-10 text-sm"
                            />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status Keaktifan
                            </label>
                            <div className="flex items-center gap-4 mt-2">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={createData.is_aktif}
                                        onChange={e => handleCreateChange('is_aktif', e.target.checked)}
                                        className="rounded border-gray-300 text-teal-600 shadow-sm focus:ring-teal-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Pegawai Aktif</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    </section>
                    <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/60">
                        <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-700">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Informasi Kontak</h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Masukkan email TSU dan nomor telepon atau WhatsApp.</p>
                        </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="email@tsu.ac.id"
                                value={createData.email}
                                onChange={(e) => handleCreateChange('email', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                No. Telepon / WhatsApp
                            </label>
                            <input
                                type="text"
                                placeholder="08xxxxxxxxxx"
                                value={createData.no_telepon}
                                onChange={(e) => handleCreateChange('no_telepon', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                    </div>
                    </section>

                </form>
                <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600 rounded-b-lg">
                    <SecondaryButton type="button" onClick={() => { setIsCreateModalOpen(false); setCreateFormErrors({}); }}>
                        Batal
                    </SecondaryButton>
                    <PrimaryButton
                        type="submit"
                        form="create-karyawan-form"
                        disabled={createProcessing}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 shadow-teal-200 hover:shadow-teal-400"
                    >
                        <Save size={18} /> Simpan Data SDM
                    </PrimaryButton>
                </div>
            </Modal>

            {/* Modal Edit SDM */}
            <Modal show={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setEditFormErrors({}); }} maxWidth="2xl">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <Edit2 className="text-teal-600" size={20} /> Edit Data SDM / Karyawan
                    </h2>
                </div>
                <form id="edit-karyawan-form" onSubmit={handleEditSubmit} className="px-6 pt-6 pb-6 space-y-4">
                    <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/60">
                        <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-700">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Identitas & Nomor Induk</h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Perbarui nama dan nomor identitas karyawan.</p>
                        </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Nama Lengkap & Gelar <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Dr. Ir. Budi Santoso, M.Kom."
                                value={editData.nama}
                                onChange={(e) => handleEditChange('nama', e.target.value)}
                                className={`w-full bg-gray-50 border ${(editFormErrors.nama || editErrors.nama) ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-200 focus:ring-teal-500 focus:border-teal-500'} text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm`}
                            />
                            <FieldTooltipError message={editFormErrors.nama || editErrors.nama} />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                NIK
                            </label>
                            <input
                                type="text"
                                placeholder="Nomor Induk Karyawan"
                                value={editData.nik}
                                onChange={(e) => handleEditChange('nik', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm font-mono"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                NIDN
                            </label>
                            <input
                                type="text"
                                placeholder="Nomor Induk Dosen Nasional"
                                value={editData.nidn}
                                onChange={(e) => handleEditChange('nidn', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm font-mono" />
                            <FieldTooltipError message={editErrors.nidn} />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                NUPTK
                            </label>
                            <input
                                type="text"
                                placeholder="Nomor Unik Pendidik dan Tenaga Kependidikan"
                                value={editData.nuptk}
                                onChange={(e) => handleEditChange('nuptk', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm font-mono" />
                            <FieldTooltipError message={editErrors.nuptk} />
                        </div>
                    </div>

                    </section>
                    <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/60">
                        <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-700">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Penempatan & Kepegawaian</h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Perbarui unit kerja, jabatan, jenis, dan status keaktifan.</p>
                        </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Unit Kerja / Penempatan
                            </label>
                            <CustomSelect
                                value={editData.id_unit}
                                onChange={(e) => handleEditChange('id_unit', e.target.value)}
                                options={[
                                    { value: '', label: '-- Pilih Unit Kerja --' },
                                    ...units.map(u => ({ value: String(u.id_unit), label: `${u.kode_unit} - ${u.nama_unit}` }))
                                ]}
                                placeholder="Pilih Unit Kerja"
                                className="h-10 text-sm"
                            />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Jabatan / Posisi
                            </label>
                            <input
                                type="text"
                                placeholder="Contoh: Dosen / Ka. Lab / Staf Keuangan"
                                value={editData.jabatan}
                                onChange={(e) => handleEditChange('jabatan', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status Kepegawaian <span className="text-red-500">*</span>
                            </label>
                            <CustomSelect
                                value={editData.status_pegawai}
                                onChange={(e) => handleEditChange('status_pegawai', e.target.value)}
                                options={editStatusOptions}
                                placeholder="Pilih Status"
                                className="h-10 text-sm"
                            />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Status Keaktifan
                            </label>
                            <div className="flex items-center gap-4 mt-2">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editData.is_aktif}
                                        onChange={e => handleEditChange('is_aktif', e.target.checked)}
                                        className="rounded border-gray-300 text-teal-600 shadow-sm focus:ring-teal-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300 font-medium">Pegawai Aktif</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    </section>
                    <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/60">
                        <div className="mb-4 border-b border-gray-100 pb-3 dark:border-gray-700">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Informasi Kontak</h3>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Perbarui email TSU dan nomor telepon atau WhatsApp.</p>
                        </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="email@tsu.ac.id"
                                value={editData.email}
                                onChange={(e) => handleEditChange('email', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                        <div className="relative pb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                No. Telepon / WhatsApp
                            </label>
                            <input
                                type="text"
                                placeholder="08xxxxxxxxxx"
                                value={editData.no_telepon}
                                onChange={(e) => handleEditChange('no_telepon', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 focus:ring-teal-500 focus:border-teal-500 text-gray-900 rounded-xl p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                            />
                        </div>
                    </div>
                    </section>

                </form>
                <div className="flex justify-end gap-3 bg-gray-50 px-6 py-4 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-600 rounded-b-lg">
                    <SecondaryButton type="button" onClick={() => { setIsEditModalOpen(false); setEditFormErrors({}); }}>
                        Batal
                    </SecondaryButton>
                    <PrimaryButton
                        type="submit"
                        form="edit-karyawan-form"
                        disabled={editProcessing}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 shadow-teal-200 hover:shadow-teal-400"
                    >
                        <Save size={18} /> Simpan Perubahan
                    </PrimaryButton>
                </div>
            </Modal>

            {/* Modal Impor Excel Data SDM / Karyawan */}
            <Modal show={isImportModalOpen} onClose={handleCloseImportModal} maxWidth="4xl">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <FileSpreadsheet size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                Impor Dokumen Excel Data Karyawan
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Unggah dokumen spreadsheet (.xlsx, .xls, .csv) untuk menambah atau memperbarui data SDM.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleCloseImportModal}
                        disabled={isImporting}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                    {/* Kotak Panduan & Unduh Template */}
                    <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/70 dark:border-teal-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                            <Info size={20} className="text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                            <div className="text-xs text-teal-900 dark:text-teal-200 space-y-1">
                                <p className="font-semibold text-sm">Format Dokumen Excel Sesuai Data Anda</p>
                                <p className="text-teal-700 dark:text-teal-300 leading-relaxed">
                                    Sistem mendukung langsung susunan kolom Excel Anda (<code className="font-mono bg-teal-100 dark:bg-teal-900/50 px-1 py-0.5 rounded">Gelar Depan</code>, <code className="font-mono bg-teal-100 dark:bg-teal-900/50 px-1 py-0.5 rounded">NAMA LENGKAP</code>, <code className="font-mono bg-teal-100 dark:bg-teal-900/50 px-1 py-0.5 rounded">EMAIL TSU</code>, <code className="font-mono bg-teal-100 dark:bg-teal-900/50 px-1 py-0.5 rounded">NOMOR WA</code>, <code className="font-mono bg-teal-100 dark:bg-teal-900/50 px-1 py-0.5 rounded">JENIS PEGAWAI</code>, <code className="font-mono bg-teal-100 dark:bg-teal-900/50 px-1 py-0.5 rounded">JABATAN STRUKTURAL</code>, <code className="font-mono bg-teal-100 dark:bg-teal-900/50 px-1 py-0.5 rounded">NIK TSU</code>, <code className="font-mono bg-teal-100 dark:bg-teal-900/50 px-1 py-0.5 rounded">NIDN</code>, <code className="font-mono bg-teal-100 dark:bg-teal-900/50 px-1 py-0.5 rounded">NUPTK</code>, <code className="font-mono bg-teal-100 dark:bg-teal-900/50 px-1 py-0.5 rounded">STATUS</code>). Kolom unit otomatis dikosongkan dan jabatan menggunakan Jabatan Struktural.
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleDownloadTemplate}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition shadow-sm shrink-0"
                        >
                            <Download size={15} /> Unduh Template Excel
                        </button>
                    </div>

                    {/* Area Unggah Berkas Drag & Drop */}
                    {!importFile ? (
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center cursor-pointer ${
                                isDragOver
                                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-emerald-400 bg-gray-50/50 dark:bg-gray-800/40'
                            }`}
                            onClick={() => document.getElementById('karyawan-excel-file-input')?.click()}
                        >
                            <input
                                id="karyawan-excel-file-input"
                                type="file"
                                accept=".xlsx, .xls, .csv"
                                className="hidden"
                                onChange={handleFileUpload}
                            />
                            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                                {isParsing ? <Loader2 size={26} className="animate-spin" /> : <Upload size={26} />}
                            </div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-1">
                                {isParsing ? 'Membaca dan memproses berkas...' : 'Tarik & lepas file spreadsheet di sini, atau klik untuk memilih'}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Mendukung format .xlsx, .xls, dan .csv (Maksimal 10 MB)
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                    <FileSpreadsheet size={20} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                                        {importFile.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {(importFile.size / 1024).toFixed(1)} KB &bull; {importedRows.length} baris data terbaca
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                disabled={isImporting}
                                onClick={() => {
                                    setImportFile(null);
                                    setImportedRows([]);
                                    setImportStats({ total: 0, newCount: 0, updateCount: 0, invalidCount: 0 });
                                }}
                                className="text-xs font-semibold text-rose-600 hover:text-rose-700 dark:text-rose-400 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shrink-0 self-start sm:self-auto"
                            >
                                Ganti Berkas
                            </button>
                        </div>
                    )}

                    {/* Ringkasan & Pengaturan Replace Data */}
                    {importedRows.length > 0 && (
                        <div className="space-y-4">
                            {/* Kartu Statistik */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center">
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Total Baris</span>
                                    <p className="text-xl font-bold text-gray-800 dark:text-gray-200">{importStats.total}</p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800 text-center">
                                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Data Baru</span>
                                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">+{importStats.newCount}</p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800 text-center">
                                    <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Akan Di-replace</span>
                                    <p className="text-xl font-bold text-amber-700 dark:text-amber-300">{importStats.updateCount}</p>
                                </div>
                                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-800 text-center">
                                    <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Tidak Valid</span>
                                    <p className="text-xl font-bold text-rose-700 dark:text-rose-300">{importStats.invalidCount}</p>
                                </div>
                            </div>

                            {/* Opsi Timpa / Replace Data */}
                            <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/60">
                                <label className="inline-flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={replaceExisting}
                                        onChange={(e) => setReplaceExisting(e.target.checked)}
                                        className="mt-0.5 rounded border-amber-400 text-amber-600 shadow-sm focus:ring-amber-500"
                                    />
                                    <div className="text-xs text-amber-900 dark:text-amber-200">
                                        <p className="font-bold text-sm">Optimalkan & Timpa (Replace) data yang sudah ada</p>
                                        <p className="text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
                                            Jika dicentang, data SDM yang memiliki kecocokan NIK, NIDN, NUPTK, atau Email dengan database akan langsung diperbarui dengan nilai terbaru dari dokumen Excel.
                                        </p>
                                    </div>
                                </label>
                            </div>

                            {/* Pratinjau Tabel Data */}
                            <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                                <div className="px-4 py-2.5 bg-gray-50/80 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        Pratinjau Data (Menampilkan {Math.min(importedRows.length, 10)} dari {importedRows.length} baris)
                                    </span>
                                    {importedRows.length > 10 && (
                                        <span className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                                            Seluruh {importedRows.length} baris akan diproses saat impor
                                        </span>
                                    )}
                                </div>
                                <div className="overflow-x-auto max-h-60">
                                    <table className="min-w-full text-xs text-left text-gray-600 dark:text-gray-300">
                                        <thead className="bg-gray-100/70 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold sticky top-0">
                                            <tr>
                                                <th className="px-3 py-2 text-center w-12">Baris</th>
                                                <th className="px-3 py-2 text-center">Status</th>
                                                <th className="px-3 py-2">NIK</th>
                                                <th className="px-3 py-2">Nama Lengkap</th>
                                                <th className="px-3 py-2">Unit Kerja</th>
                                                <th className="px-3 py-2">Jabatan</th>
                                                <th className="px-3 py-2">Status Pegawai</th>
                                                <th className="px-3 py-2 text-center">Status Aktif</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {importedRows.slice(0, 10).map((row, idx) => (
                                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="px-3 py-2 text-center text-gray-400 font-mono">
                                                        {row._rowNumber}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        {row._status === 'new' && (
                                                            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                                                                Baru
                                                            </span>
                                                        )}
                                                        {row._status === 'update' && (
                                                            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
                                                                Replace
                                                            </span>
                                                        )}
                                                        {row._status === 'invalid' && (
                                                            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                                                                Nama Kosong
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-3 py-2 font-mono text-gray-700 dark:text-gray-300">
                                                        {row.nik || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 font-semibold text-gray-900 dark:text-gray-100">
                                                        {row.nama || <span className="text-rose-500 italic font-normal">[Wajib Diisi]</span>}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                                        {row.unit || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                                        {row.jabatan || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                                        {row.status_pegawai || 'Tetap'}
                                                    </td>
                                                    <td className="px-3 py-2 text-center">
                                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                                            row.is_aktif !== false
                                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                                                                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                        }`}>
                                                            {row.is_aktif !== false ? 'Aktif' : 'Nonaktif'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center gap-3 bg-gray-50 px-6 py-4 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 rounded-b-lg">
                    <SecondaryButton
                        type="button"
                        onClick={handleCloseImportModal}
                        disabled={isImporting}
                    >
                        Batal
                    </SecondaryButton>
                    <PrimaryButton
                        type="button"
                        onClick={handleExecuteImport}
                        disabled={isImporting || importedRows.length === 0 || importStats.total === importStats.invalidCount}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 shadow-emerald-200 hover:shadow-emerald-400 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
                    >
                        {isImporting ? (
                            <>
                                <Loader2 size={17} className="animate-spin" />
                                <span>Sedang Mengimpor...</span>
                            </>
                        ) : (
                            <>
                                <FileUp size={17} />
                                <span>Proses Impor ({importStats.total - importStats.invalidCount} Data)</span>
                            </>
                        )}
                    </PrimaryButton>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
