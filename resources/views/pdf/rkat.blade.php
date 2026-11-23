<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <title>TOR - {{ $rkat->nomor_dokumen }}</title>
    <style>
        @page {
            margin: 0.9cm;
        }

        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            font-size: 8.5pt;
            line-height: 1.25;
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
            letter-spacing: 0.4px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 7px;
        }

        th,
        td {
            border: 1px solid #64748b;
            padding: 4px 6px;
            vertical-align: top;
            word-wrap: break-word;
        }

        .no-col {
            width: 25px;
            text-align: center;
        }

        .label-col {
            width: 130px;
            font-weight: bold;
            background-color: #f1f5f9;
        }

        .bg-gray {
            background-color: #e2e8f0;
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

        .indicator-table th {
            font-size: 7pt;
            text-align: center;
            background-color: #f1f5f9;
        }

        .indicator-table {
            width: 100%;
            table-layout: fixed;
            font-size: 6.5pt;
        }

        .indicator-table th,
        .indicator-table td {
            padding: 3px;
            word-wrap: break-word;
        }

        .section-title {
            color: #1e3a5f;
            border-bottom: 1px solid #64748b;
            padding-bottom: 3px;
        }

        .revision-note {
            margin-top: 8px;
            border: 1px solid #000;
            padding: 4px;
            background-color: #fffde7;
            font-size: 7.5pt;
        }

        .bauk-container {
            width: 150px;
            padding-left: 8px;
        }

        .bauk-box {
            border: 1px solid #000;
            height: 120px;
            /* Fixed height to prevent stretching */
        }

        .bauk-header {
            border-bottom: 1px solid #000;
            font-size: 6.5pt;
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
        $detail = $rkat->rkatDetails->first();
        $year = $rkat->tahun_anggaran;
        $logoPath = public_path('img/logo-full-tsu.svg');

        // Labels
        $yearNumber = (int) $rkat->tahun_anggaran;
        $labels = $rkat->tahun_obj->indikator_labels ?? [];
        $labelCondition = $labels['col_kondisi'] ?? 'Kondisi Tahun ' . ($yearNumber - 1);
        $labelRenstra = $labels['col_renstra'] ?? 'RENSTRA Tahun ' . $yearNumber;
        $labelAccreditation = $labels['col_akreditasi'] ?? 'Kontribusi Akreditasi';
        $labelGap = $labels['col_gap'] ?? 'Kontribusi GAP';
        $labelKpi = $labels['col_kpi'] ?? 'Kontribusi KPI';

        $revisions = $rkat->logPersetujuans->where('aksi', 'Revisi');

        // Calculate real RAB total
        $rabTotal = $detail ? $detail->rabItems->sum('sub_total') : 0;
        $nonSboIndex = 0;
    @endphp

    <div class="header">
        @if (file_exists($logoPath))
            <img src="data:image/svg+xml;base64,{{ base64_encode(file_get_contents($logoPath)) }}" alt="Logo">
        @endif
        <h1>TAHUN ANGGARAN {{ $year }}</h1>
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
            <td class="label-col">Target Capaian</td>
            <td colspan="2" style="padding: 0;">
                <table class="indicator-table" style="border: none; margin: 0;">
                    <colgroup>
                        <col style="width: 4%;">
                        <col style="width: 15%;">
                        <col style="width: 16.2%;">
                        <col style="width: 16.2%;">
                        <col style="width: 16.2%;">
                        <col style="width: 16.2%;">
                        <col style="width: 16.2%;">
                    </colgroup>
                    <thead>
                        <tr>
                            <th>No</th>
                            <th>Indikator</th>
                            <th>{{ $labelCondition }}</th>
                            <th>{{ $labelRenstra }}</th>
                            <th>{{ $labelAccreditation }}</th>
                            <th>{{ $labelGap }}</th>
                            <th>{{ $labelKpi }}</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($detail->indikators as $ind)
                            <tr>
                                <td class="text-center">{{ $loop->iteration }}</td>
                                <td>{{ $ind->nama_indikator }}</td>
                                <td>{{ $ind->past_capaian ?? '-' }}</td>
                                <td>{{ $ind->current_target ?? '-' }}</td>
                                <td>{{ $ind->current_capaian ?? '-' }}</td>
                                <td>{{ $ind->future_target ?? '-' }}</td>
                                <td>{{ $ind->future_capaian ?? '-' }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="7" class="text-center">
                                    Tidak ada indikator</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </td>
        </tr>
        <tr>
            <td class="no-col">11</td>
            <td class="label-col">Keberlanjutan</td>
            <td colspan="2">{{ $detail->target ?? '-' }}</td>
        </tr>
        <tr>
            <td class="no-col">12</td>
            <td class="label-col">Penanggung Jawab</td>
            <td colspan="2">{{ $detail->pjawab }}</td>
        </tr>
    </table>

    <div class="section-title" style="text-align: center; margin: 10px 0 6px; font-weight: bold; font-size: 9pt;">
        RENCANA ANGGARAN</div>

    <table>
        <tr>
            <td class="label-col">Kegiatan <br><i style="font-weight: normal; font-size: 7pt;">diisi sesuai RKA</i></td>
            <td>{{ $detail->judul_kegiatan }}</td>
        </tr>
        <tr>
            <td class="label-col">Target <br><i style="font-weight: normal; font-size: 7pt;">diisi sesuai RKA</i></td>
            <td>{{ $detail->target ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label-col">Jenis Kegiatan</td>
            <td>{{ $detail->jenis_kegiatan ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label-col">Dokumen Pendukung</td>
            <td>
                @php
                    $docs = $detail->dokumen_pendukung ?? [];
                @endphp
                @if (is_array($docs) && count($docs))
                    @foreach ($docs as $index => $doc)
                        <div style="margin-bottom: 3px; word-break: break-word;">
                            {{ is_array($doc) ? ($doc['name'] ?? $doc['url'] ?? 'Dokumen') : $doc }}
                            @if (is_array($doc) && (($doc['type'] ?? '') === 'link' || ($doc['type'] ?? '') === 'file'))
                                — {{ ($doc['type'] ?? '') === 'link' ? ($doc['url'] ?? '') : route('daftar-ajuan.dokumen', [$rkat->uuid, $index]) }}
                            @endif
                        </div>
                    @endforeach
                @else
                    -
                @endif
            </td>
        </tr>
        <tr>
            <td class="label-col">Waktu Pelaksanaan</td>
            <td>{{ \Carbon\Carbon::parse($detail->jadwal_pelaksanaan_mulai)->translatedFormat('d F Y') }} s.d
                {{ \Carbon\Carbon::parse($detail->jadwal_pelaksanaan_akhir)->translatedFormat('d F Y') }}</td>
        </tr>
        <tr>
            <td class="label-col">Anggaran</td>
            <td class="font-bold">Rp {{ number_format($rabTotal, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label-col">Pencairan Dana</td>
            <td>
                <div class="checkbox-group">
                    <div class="checkbox">{{ $detail->jenis_pencairan == 'Bank' ? 'v' : '' }}</div> Transfer ke Bank :
                    {{ $detail->nama_bank ?? '-' }}
                </div>
                <div style="margin-left: 15px;">No Rekening : {{ $detail->nomor_rekening ?? '-' }} (a.n
                    {{ $detail->atas_nama ?? '-' }})</div>
                <div class="checkbox-group" style="margin-top: 3px;">
                    <div class="checkbox">{{ $detail->jenis_pencairan == 'Tunai' ? 'v' : '' }}</div> Tunai
                </div>
                @if ($detail->jenis_pencairan == 'Tunai')
                <div style="margin-left: 15px; margin-top: 2px;">
                    <table style="border: none; margin: 0; padding: 0;">
                        <tr>
                            <td style="border: none; padding: 0; width: 100px;">Nama Pengusul</td>
                            <td style="border: none; padding: 0;">: {{ $detail->pjawab ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 0;">Nama Pemberi</td>
                            <td style="border: none; padding: 0;">: BAUK</td>
                        </tr>
                        <tr>
                            <td style="border: none; padding: 0;">Nama Penerima</td>
                            <td style="border: none; padding: 0;">: {{ $detail->nama_penerima ?? '-' }}</td>
                        </tr>
                    </table>
                </div>
                @endif
            </td>
        </tr>
    </table>

    <div style="font-weight: bold; margin-top: 5px; margin-bottom: 3px;">Rincian</div>
    <div style="width: 100%; display: table;">
        <div style="display: table-cell; vertical-align: top;">
            <table class="data-table" style="margin-bottom: 0;">
                <thead>
                    <tr class="bg-gray">
                        <th style="width: 25px;">No.</th>
                        <th style="width: 80px;">Kode Akun</th>
                        <th>Keterangan</th>
                        <th style="width: 30px;">Vol 1</th>
                        <th style="width: 40px;">Satuan 1</th>
                        <th style="width: 30px;">Vol 2</th>
                        <th style="width: 40px;">Satuan 2</th>
                        <th style="width: 80px;">Biaya Satuan</th>
                        <th style="width: 80px;">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($detail->rabItems as $idx => $rab)
                        <tr>
                            <td class="text-center">{{ $idx + 1 }}</td>
                            <td class="text-center">{{ $rab->kode_anggaran ?: 'NON-SBO/NS.' . (++$nonSboIndex) }}</td>
                            <td>{{ $rab->deskripsi_item }}</td>
                            <td class="text-center">{{ rtrim(rtrim(number_format($rab->volume ?? 0, 2, ',', '.'), '0'), ',') }}</td>
                            <td class="text-center">{{ $rab->satuan ?? '-' }}</td>
                            <td class="text-center">{{ rtrim(rtrim(number_format($rab->volume2 ?? 0, 2, ',', '.'), '0'), ',') }}</td>
                            <td class="text-center">{{ $rab->satuan2 ?? '-' }}</td>
                            <td class="text-right">{{ number_format($rab->harga_satuan, 0, ',', '.') }}</td>
                            <td class="text-right">{{ number_format($rab->sub_total, 0, ',', '.') }}</td>
                        </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr class="font-bold">
                        <td colspan="8" class="text-right">Total</td>
                        <td class="text-right">{{ number_format($rabTotal, 0, ',', '.') }}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
        <div style="display: table-cell; vertical-align: top;" class="bauk-container">
            <div class="bauk-box">
                <div class="bauk-header">
                    <table style="border:none; margin:0; width:100%;">
                        <tr>
                            <td
                                style="border:none; border-right:1px solid #000; width:50%; text-align:center; padding: 2px;">
                                Verifikasi</td>
                            <td style="border:none; text-align:center; padding: 2px;">Note</td>
                        </tr>
                    </table>
                    <div style="text-align:center; border-top:1px solid #000; padding:1px; font-style:italic;">(diisi
                        oleh BAUK)</div>
                </div>
            </div>
        </div>
    </div>

    @if ($revisions->count() > 0)
        <div class="revision-note">
            <div class="font-bold" style="text-decoration: underline; margin-bottom: 2px;">Catatan Revisi:</div>
            @foreach ($revisions as $rev)
                <div style="margin-bottom: 2px;">- <strong>{{ $rev->approver->nama_lengkap }}
                        ({{ str_replace('_', ' ', $rev->level_persetujuan) }}):</strong> {{ $rev->catatan }}</div>
            @endforeach
        </div>
    @endif

</body>

</html>
