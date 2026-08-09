<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>LPJ - {{ $lpj->nomor_lpj }}</title>
    <style>
        @page {
            margin: 0.8cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 8pt;
            line-height: 1.2;
            color: #111;
        }

        .header {
            text-align: center;
            margin-bottom: 12px;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
        }

        .header h1 {
            margin: 0;
            font-size: 12pt;
            text-transform: uppercase;
            font-weight: bold;
        }

        .header h2 {
            margin: 2px 0 0 0;
            font-size: 10pt;
            font-weight: normal;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }

        .info-table td {
            border: none;
            padding: 3px 4px;
            vertical-align: top;
        }

        .info-label {
            font-weight: bold;
            width: 22%;
        }

        .info-colon {
            width: 2%;
        }

        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 12px;
        }

        .data-table th,
        .data-table td {
            border: 1px solid #000;
            padding: 5px 6px;
            vertical-align: middle;
        }

        .data-table th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            font-size: 7.5pt;
        }

        .text-center {
            text-align: center;
        }

        .text-right {
            text-align: right;
        }

        .text-left {
            text-align: left;
        }

        .summary-box {
            margin-top: 10px;
            width: 50%;
            float: right;
            border-collapse: collapse;
        }

        .summary-box td {
            border: 1px solid #000;
            padding: 4px 8px;
        }

        .clear {
            clear: both;
        }

        .signature-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
        }

        .signature-table td {
            border: none;
            text-align: center;
            vertical-align: top;
            width: 50%;
        }

        .signature-space {
            height: 60px;
        }

        .badge-status {
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>LAPORAN PERTANGGUNGJAWABAN (LPJ)</h1>
        <h2>RENCANA KERJA DAN ANGGARAN TAHUNAN (RKAT)</h2>
    </div>

    <table class="info-table">
        <tr>
            <td class="info-label">Nomor LPJ</td>
            <td class="info-colon">:</td>
            <td><strong>{{ $lpj->nomor_lpj }}</strong></td>
            <td class="info-label">Unit Kerja</td>
            <td class="info-colon">:</td>
            <td>{{ $lpj->pencairanDana->rkatHeader->unit->nama_unit ?? '-' }}</td>
        </tr>
        <tr>
            <td class="info-label">Judul LPJ / Kegiatan</td>
            <td class="info-colon">:</td>
            <td>{{ $lpj->judul_lpj }}</td>
            <td class="info-label">Tahun Anggaran</td>
            <td class="info-colon">:</td>
            <td>{{ $lpj->pencairanDana->rkatHeader->tahun_anggaran ?? '-' }}</td>
        </tr>
        <tr>
            <td class="info-label">Ref. Pencairan Dana</td>
            <td class="info-colon">:</td>
            <td>{{ $lpj->pencairanDana->nama_pencairan ?? '-' }} ({{ $lpj->pencairanDana->rkatHeader->nomor_dokumen ?? '-' }})</td>
            <td class="info-label">Tanggal Pelaksanaan</td>
            <td class="info-colon">:</td>
            <td>
                @if($lpj->tanggal_pelaksanaan_mulai)
                    {{ \Carbon\Carbon::parse($lpj->tanggal_pelaksanaan_mulai)->translatedFormat('d M Y') }}
                    @if($lpj->tanggal_pelaksanaan_selesai)
                        s/d {{ \Carbon\Carbon::parse($lpj->tanggal_pelaksanaan_selesai)->translatedFormat('d M Y') }}
                    @endif
                @else
                    -
                @endif
            </td>
        </tr>
        <tr>
            <td class="info-label">Tanggal Laporan</td>
            <td class="info-colon">:</td>
            <td>{{ \Carbon\Carbon::parse($lpj->tanggal_lpj)->translatedFormat('d F Y') }}</td>
            <td class="info-label">Status Dokumen</td>
            <td class="info-colon">:</td>
            <td><strong>{{ strtoupper($lpj->status_lpj) }}</strong></td>
        </tr>
    </table>

    <h3 style="margin-bottom: 5px; font-size: 9pt; text-transform: uppercase;">A. Rincian Realisasi Pengeluaran</h3>

    <table class="data-table">
        <thead>
            <tr>
                <th width="4%">No</th>
                <th width="28%">Deskripsi Item / Kwitansi</th>
                <th width="14%">Pencairan (Rp)</th>
                <th width="10%">Vol Realisasi</th>
                <th width="14%">Harga Satuan (Rp)</th>
                <th width="15%">Realisasi Total (Rp)</th>
                <th width="15%">Selisih / Sisa (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @php 
                $grandPencairan = 0;
                $grandRealisasi = 0;
                $grandSelisih = 0;
            @endphp
            @foreach($lpj->items as $index => $item)
                @php
                    $pencairanSub = $item->pencairanItem->sub_total_pencairan ?? 0;
                    $grandPencairan += $pencairanSub;
                    $grandRealisasi += $item->sub_total_realisasi;
                    $grandSelisih += $item->selisih;
                @endphp
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>
                        <strong>{{ $item->pencairanItem->rkatRabItem->deskripsi_item ?? 'Item' }}</strong>
                        @if($item->nomor_kwitansi)
                            <br><small style="color: #444;">No Kwitansi: {{ $item->nomor_kwitansi }}</small>
                        @endif
                        @if($item->keterangan)
                            <br><small style="color: #666;">Catatan: {{ $item->keterangan }}</small>
                        @endif
                    </td>
                    <td class="text-right">Rp {{ number_format($pencairanSub, 0, ',', '.') }}</td>
                    <td class="text-center">{{ number_format($item->volume_realisasi, 0, ',', '.') }}</td>
                    <td class="text-right">Rp {{ number_format($item->harga_satuan_realisasi, 0, ',', '.') }}</td>
                    <td class="text-right"><strong>Rp {{ number_format($item->sub_total_realisasi, 0, ',', '.') }}</strong></td>
                    <td class="text-right" style="color: {{ $item->selisih < 0 ? '#c00' : '#080' }};">
                        Rp {{ number_format($item->selisih, 0, ',', '.') }}
                    </td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr style="background-color: #f9f9f9; font-weight: bold;">
                <td colspan="2" class="text-center">TOTAL REALISASI</td>
                <td class="text-right">Rp {{ number_format($grandPencairan, 0, ',', '.') }}</td>
                <td></td>
                <td></td>
                <td class="text-right">Rp {{ number_format($grandRealisasi, 0, ',', '.') }}</td>
                <td class="text-right" style="color: {{ $grandSelisih < 0 ? '#c00' : '#080' }};">
                    Rp {{ number_format($grandSelisih, 0, ',', '.') }}
                </td>
            </tr>
        </tfoot>
    </table>

    <div class="clear"></div>

    <h3 style="margin-bottom: 5px; font-size: 9pt; text-transform: uppercase;">B. Ringkasan Pertanggungjawaban</h3>
    <table class="data-table" style="width: 60%;">
        <tr>
            <td width="60%">Total Dana Dicairkan</td>
            <td width="40%" class="text-right"><strong>Rp {{ number_format($lpj->total_pencairan, 0, ',', '.') }}</strong></td>
        </tr>
        <tr>
            <td>Total Pengeluaran Realisasi</td>
            <td class="text-right"><strong>Rp {{ number_format($lpj->total_realisasi, 0, ',', '.') }}</strong></td>
        </tr>
        <tr style="background-color: #f2f2f2;">
            <td><strong>Status Pengembalian / Sisa Dana</strong></td>
            <td class="text-right" style="font-size: 9pt;">
                @if($lpj->sisa_dana > 0)
                    <strong style="color: #080;">Sisa Pengembalian: Rp {{ number_format($lpj->sisa_dana, 0, ',', '.') }}</strong>
                @elseif($lpj->sisa_dana < 0)
                    <strong style="color: #c00;">Defisit Pengeluaran: Rp {{ number_format(abs($lpj->sisa_dana), 0, ',', '.') }}</strong>
                @else
                    <strong>Nihil (Rp 0)</strong>
                @endif
            </td>
        </tr>
    </table>

    @if($lpj->ringkasan_kegiatan)
        <h3 style="margin-bottom: 5px; margin-top: 10px; font-size: 9pt; text-transform: uppercase;">C. Ringkasan & Evaluasi Kegiatan</h3>
        <p style="border: 1px solid #ccc; padding: 8px; background-color: #fafafa; margin: 0 0 10px 0;">
            {{ $lpj->ringkasan_kegiatan }}
        </p>
    @endif

    <table class="signature-table">
        <tr>
            <td>
                Yang Mengajukan LPJ,
                <br><br>
                <strong>{{ $lpj->pencairanDana->rkatHeader->unit->nama_unit ?? 'Unit Kerja' }}</strong>
                <div class="signature-space"></div>
                <strong><u>{{ $lpj->pengaju->name ?? 'Pengaju' }}</u></strong><br>
                NIP/NIK: {{ $lpj->pengaju->nip ?? '-' }}
            </td>
            <td>
                Mengetahui & Menyetujui,
                <br><br>
                <strong>Pejabat Berwenang / Keuangan</strong>
                <div class="signature-space"></div>
                <strong><u>{{ $lpj->approver->name ?? '(..........................................)' }}</u></strong><br>
                @if($lpj->tanggal_persetujuan)
                    Tanggal: {{ \Carbon\Carbon::parse($lpj->tanggal_persetujuan)->translatedFormat('d F Y') }}
                @endif
            </td>
        </tr>
    </table>
</body>

</html>
