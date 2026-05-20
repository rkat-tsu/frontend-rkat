<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>Pencairan Dana - {{ $pencairan->rkatHeader->nomor_dokumen }}</title>
    <style>
        @page {
            margin: 0.8cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 8pt;
            line-height: 1.15;
            color: #000;
        }

        .header {
            text-align: center;
            margin-bottom: 15px;
        }

        .header img {
            width: 120px;
            margin-bottom: 8px;
        }

        .header h1 {
            margin: 0;
            font-size: 10pt;
            text-transform: uppercase;
            font-weight: bold;
            text-decoration: underline;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
        }

        th,
        td {
            border: 1px solid #000;
            padding: 4px 6px;
            vertical-align: top;
        }

        .no-col {
            width: 25px;
            text-align: center;
        }

        .label-col {
            width: 140px;
            font-weight: bold;
        }

        .bg-gray {
            background-color: #f2f2f2;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .font-bold {
            font-weight: bold;
        }

        .checkbox-group {
            display: inline-block;
            margin-right: 8px;
        }

        .checkbox {
            display: inline-block;
            width: 10px;
            height: 10px;
            border: 1px solid #000;
            margin-right: 3px;
            vertical-align: middle;
            text-align: center;
            line-height: 9px;
            font-size: 7pt;
        }

        .signature-table {
            width: 100%;
            margin-top: 15px;
            border-collapse: collapse;
            page-break-inside: avoid;
        }

        .signature-table td {
            border: 1px solid #000;
            width: 33.33%;
            padding: 8px;
            height: 110px;
            position: relative;
            vertical-align: top;
        }

        .sig-title {
            font-weight: bold;
            font-size: 8.5pt;
            margin-bottom: 4px;
        }

        .sig-role {
            font-size: 8pt;
            color: #333;
            margin-bottom: 40px;
        }

        .sig-name {
            font-weight: bold;
            font-size: 8.5pt;
            margin-top: 30px;
            text-decoration: underline;
        }

        .sig-date {
            font-size: 7.5pt;
            margin-top: 2px;
        }

        .sig-status {
            position: absolute;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #2dd4bf;
            font-size: 16pt;
            font-weight: bold;
            opacity: 0.15;
            border: 2px solid #2dd4bf;
            padding: 1px 6px;
            border-radius: 6px;
            text-transform: uppercase;
            z-index: 0;
            pointer-events: none;
        }

        /* Specific layout for Program/Kegiatan rows */
        .sub-label {
            width: 50px;
            font-weight: bold;
        }
    </style>
</head>

<body>
    @php
        \Carbon\Carbon::setLocale('id');
        $rkat = $pencairan->rkatHeader;
        $detail = $rkat->rkatDetails->first();
        $year = $rkat->tahun_anggaran;
        $logoPath = public_path('img/logo-full-tsu.svg');
    @endphp

    <div class="header">
        @if (file_exists($logoPath))
            <img src="data:image/svg+xml;base64,{{ base64_encode(file_get_contents($logoPath)) }}" alt="Logo">
        @endif
        <h1>PENGAJUAN PENCAIRAN ANGGARAN TAHUN {{ $year }}</h1>
    </div>

    <table>
        <tr>
            <td class="no-col">1</td>
            <td class="label-col">Unit Kerja/Sub Unit</td>
            <td colspan="2">{{ $rkat->unit->nama_unit }}</td>
        </tr>
        <tr>
            <td class="no-col" rowspan="2">2</td>
            <td class="label-col" rowspan="2">Program/Kegiatan</td>
            <td class="sub-label">IKU</td>
            <td>{{ $detail->iku->nama_iku ?? '-' }}</td>
        </tr>
        <tr>
            <td class="sub-label">IKK</td>
            <td>{{ $detail->ikk->nama_ikk ?? '-' }}</td>
        </tr>
        <tr>
            <td class="no-col">3</td>
            <td class="label-col">Judul Kegiatan</td>
            <td colspan="2">{{ $detail->judul_kegiatan }}</td>
        </tr>
        <tr>
            <td class="no-col">4</td>
            <td class="label-col">Latar Belakang</td>
            <td colspan="2">{!! nl2br(e($detail->latar_belakang)) !!}</td>
        </tr>
        <tr>
            <td class="no-col">5</td>
            <td class="label-col">Rasionalisasi</td>
            <td colspan="2">{!! nl2br(e($detail->rasional)) !!}</td>
        </tr>
        <tr>
            <td class="no-col">6</td>
            <td class="label-col">Tujuan</td>
            <td colspan="2">{!! nl2br(e($detail->tujuan)) !!}</td>
        </tr>
        <tr>
            <td class="no-col">7</td>
            <td class="label-col">Mekanisme & Rancangan</td>
            <td colspan="2">{!! nl2br(e($detail->mekanisme)) !!}</td>
        </tr>
        <tr>
            <td class="no-col">8</td>
            <td class="label-col">Jadwal Pelaksanaan</td>
            <td colspan="2">
                {{ \Carbon\Carbon::parse($detail->jadwal_pelaksanaan_mulai)->translatedFormat('d F Y') }}
                s.d
                {{ \Carbon\Carbon::parse($detail->jadwal_pelaksanaan_akhir)->translatedFormat('d F Y') }}
            </td>
        </tr>
        <tr>
            <td class="no-col">9</td>
            <td class="label-col">Lokasi Pelaksanaan</td>
            <td colspan="2">{{ $detail->lokasi_pelaksanaan }}</td>
        </tr>
        <tr>
            <td class="no-col">10</td>
            <td class="label-col">Target / Keberlanjutan</td>
            <td colspan="2">{{ $detail->target ?? '-' }}</td>
        </tr>
        <tr>
            <td class="no-col">11</td>
            <td class="label-col">Penanggung Jawab</td>
            <td colspan="2">{{ $detail->pjawab }}</td>
        </tr>
        <tr>
            <td class="no-col">12</td>
            <td class="label-col">Anggaran Dicairkan</td>
            <td colspan="2" class="font-bold text-teal-600" style="font-size: 9pt;">Rp {{ number_format($rkat->total_anggaran, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="no-col">13</td>
            <td class="label-col">Metode Pencairan</td>
            <td colspan="2">
                <div class="checkbox-group">
                    <div class="checkbox">{{ $detail->jenis_pencairan == 'Bank' ? 'v' : '' }}</div> Transfer ke Bank :
                    {{ $detail->nama_bank ?? '-' }}
                </div>
                <div style="margin-left: 15px;">No Rekening : {{ $detail->nomor_rekening ?? '-' }} (a.n
                    {{ $detail->atas_nama ?? '-' }})</div>
                <div class="checkbox-group" style="margin-top: 3px;">
                    <div class="checkbox">{{ $detail->jenis_pencairan == 'Tunai' ? 'v' : '' }}</div> Tunai
                </div>
            </td>
        </tr>
    </table>

    <!-- SIGNATURE SECTION 1 -->
    <table class="signature-table">
        <tr>
            <td>
                <div class="sig-title">Diajukan Oleh</div>
                <div class="sig-role">PIC Kegiatan dan atau Pembina UKM</div>
                
                @if($pencairan->tanggal_pengajuan)
                    <div class="sig-status">SUBMITTED</div>
                @endif
                
                <div class="sig-name">{{ $pencairan->pengaju->nama_lengkap }}</div>
                <div class="sig-date">Tgl: {{ $pencairan->tanggal_pengajuan ? \Carbon\Carbon::parse($pencairan->tanggal_pengajuan)->translatedFormat('d F Y') : '........................' }}</div>
            </td>
            <td>
                <div class="sig-title">Divalidasi Oleh</div>
                <div class="sig-role">Kepala BAAK</div>
                
                @if($pencairan->tanggal_divalidasi_baak)
                    <div class="sig-status">VALIDATED</div>
                @endif
                
                <div class="sig-name">Wahyu Catur Hastuti, S.Kom</div>
                <div class="sig-date">Tgl: {{ $pencairan->tanggal_divalidasi_baak ? \Carbon\Carbon::parse($pencairan->tanggal_divalidasi_baak)->translatedFormat('d F Y') : '........................' }}</div>
            </td>
            <td>
                <div class="sig-title">Mengetahui</div>
                <div class="sig-role">Kepala Kantor Urusan Kemahasiswaan</div>
                
                @if($pencairan->tanggal_diketahui_unit)
                    <div class="sig-status">ACKNOWLEDGED</div>
                @endif
                
                <div class="sig-name">Gege Noby Priohananto, S.Sn., M.Sn</div>
                <div class="sig-date">Tgl: {{ $pencairan->tanggal_diketahui_unit ? \Carbon\Carbon::parse($pencairan->tanggal_diketahui_unit)->translatedFormat('d F Y') : '........................' }}</div>
            </td>
        </tr>
    </table>

    <!-- SIGNATURE SECTION 2 -->
    <table class="signature-table" style="margin-top: 10px; width: 100%;">
        <tr>
            <td style="width: 50%;">
                <div class="sig-title">Diverifikasi Oleh</div>
                <div class="sig-role">Kepala BAUK</div>
                
                @if($pencairan->tanggal_diverifikasi_bauk)
                    <div class="sig-status">VERIFIED</div>
                @endif
                
                <div class="sig-name">Tri Irawati, S.E, M.Si</div>
                <div class="sig-date">Tgl: {{ $pencairan->tanggal_diverifikasi_bauk ? \Carbon\Carbon::parse($pencairan->tanggal_diverifikasi_bauk)->translatedFormat('d F Y') : '........................' }}</div>
            </td>
            <td style="width: 50%;">
                <div class="sig-title">Disetujui Oleh</div>
                <div class="sig-role">Wakil Rektor Bidang Sumber Daya & Kepemimpinan</div>
                
                @if($pencairan->tanggal_disetujui_wr2)
                    <div class="sig-status">APPROVED</div>
                @endif
                
                <div class="sig-name">Drs. Santoso Tri Hananto, M.Acc, Ak</div>
                <div class="sig-date">Tgl: {{ $pencairan->tanggal_disetujui_wr2 ? \Carbon\Carbon::parse($pencairan->tanggal_disetujui_wr2)->translatedFormat('d F Y') : '........................' }}</div>
            </td>
        </tr>
    </table>

</body>

</html>
