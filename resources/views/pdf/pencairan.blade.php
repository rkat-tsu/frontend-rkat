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
            color: #1f2937;
        }

        .header {
            text-align: center;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid #1e3a5f;
        }

        .header img {
            width: 105px;
            max-height: 52px;
            margin-bottom: 6px;
        }

        .header h1 {
            margin: 0;
            color: #1e3a5f;
            font-size: 11pt;
            text-transform: uppercase;
            font-weight: bold;
            letter-spacing: 0.3px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5px;
        }

        th,
        td {
            border: 1px solid #64748b;
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
            background-color: #f1f5f9;
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

        .item-table {
            table-layout: fixed;
            font-size: 7pt;
        }

        .item-table th,
        .item-table td {
            word-wrap: break-word;
            padding: 4px;
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

        $totalCair = $pencairan->items->sum('sub_total_pencairan');
    @endphp

    <div class="header">
        @if (file_exists($logoPath))
            <img src="data:image/svg+xml;base64,{{ base64_encode(file_get_contents($logoPath)) }}" alt="Logo">
        @endif
        <h1>PENGAJUAN PENCAIRAN ANGGARAN TAHUN {{ $year }}</h1>
        <div style="font-size: 8pt; margin-top: 4px;">{{ $pencairan->rkatHeader->nomor_dokumen }} | {{ $pencairan->nama_pencairan ?: 'Pencairan Dana' }} | Status: {{ $pencairan->status_pencairan }}</div>
    </div>

    @if ($pencairan->catatan)
        <div style="border: 1px solid #fbbf24; background-color: #fffbeb; padding: 6px 8px; margin-bottom: 8px;">
            <strong>Catatan Revisi / Penolakan:</strong> {{ $pencairan->catatan }}
        </div>
    @endif

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
            <td colspan="2" class="font-bold" style="font-size: 9pt; color: #0f766e;">
                Rp {{ number_format($totalCair, 0, ',', '.') }}
                @if($pencairan->nama_pencairan)
                   <br><span style="font-size: 8pt; color: #666; font-weight: normal;">(Keterangan: {{ $pencairan->nama_pencairan }})</span>
                @endif
            </td>
        </tr>
        <tr>
            <td class="no-col">13</td>
            <td class="label-col">Rincian Item Pencairan</td>
            <td colspan="2">
                <table class="item-table" style="width: 100%; border: 1px solid #ccc; border-collapse: collapse; margin-top: 5px;">
                    <thead>
                        <tr style="background-color: #f9fafb;">
                            <th style="border: 1px solid #ccc; padding: 4px; font-size: 8pt; text-align: left;">Deskripsi</th>
                            <th style="border: 1px solid #ccc; padding: 4px; font-size: 8pt; text-align: right;">Volume 1 / Satuan 1</th>
                            <th style="border: 1px solid #ccc; padding: 4px; font-size: 8pt; text-align: right;">Volume 2 / Satuan 2</th>
                            <th style="border: 1px solid #ccc; padding: 4px; font-size: 8pt; text-align: right;">Harga Satuan</th>
                            <th style="border: 1px solid #ccc; padding: 4px; font-size: 8pt; text-align: right;">Sub Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($pencairan->items as $item)
                            <tr>
                                <td style="border: 1px solid #ccc; padding: 4px; font-size: 8pt;">{{ $item->rkatRabItem->deskripsi_item ?? '-' }}</td>
                                <td style="border: 1px solid #ccc; padding: 4px; font-size: 8pt; text-align: right;">{{ rtrim(rtrim(number_format($item->volume_pencairan ?? 0, 2, ',', '.'), '0'), ',') }} {{ $item->rkatRabItem->satuan ?? '' }}</td>
                                <td style="border: 1px solid #ccc; padding: 4px; font-size: 8pt; text-align: right;">{{ rtrim(rtrim(number_format($item->volume_pencairan2 ?? 0, 2, ',', '.'), '0'), ',') }} {{ $item->rkatRabItem->satuan2 ?? '' }}</td>
                                <td style="border: 1px solid #ccc; padding: 4px; font-size: 8pt; text-align: right;">{{ number_format($item->nominal_pencairan, 0, ',', '.') }}</td>
                                <td style="border: 1px solid #ccc; padding: 4px; font-size: 8pt; text-align: right;">{{ number_format($item->sub_total_pencairan, 0, ',', '.') }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </td>
        </tr>
        <tr>
            <td class="no-col">14</td>
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

</body>

</html>
