<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>TOR - {{ $rkat->nomor_dokumen }}</title>
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
        th, td {
            border: 1px solid #000;
            padding: 3px 5px;
            vertical-align: top;
        }
        
        .no-col { width: 25px; text-align: center; }
        .label-col { width: 140px; font-weight: bold; }
        
        .bg-gray { background-color: #f2f2f2; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        
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
        
        .signature-section {
            margin-top: 15px;
            width: 100%;
        }
        .sig-box {
            width: 48%;
            display: inline-block;
            vertical-align: top;
            min-height: 80px;
        }
        .sig-space {
            height: 45px;
            position: relative;
        }
        .sig-status {
            position: absolute;
            top: 5px;
            left: 50%;
            transform: translateX(-50%);
            color: #ddd;
            font-size: 18pt;
            font-weight: bold;
            opacity: 0.4;
            border: 2px solid #ddd;
            padding: 2px 10px;
            border-radius: 8px;
            z-index: 0;
            text-transform: uppercase;
        }
        
        .indicator-table th {
            font-size: 7pt;
            text-align: center;
            background-color: #fff;
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
            height: 120px; /* Fixed height to prevent stretching */
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
        $detail = $rkat->rkatDetails->first();
        $year = $rkat->tahun_anggaran;
        $logoPath = public_path('img/logo-full-tsu.svg');
        
        // Labels
        $labelPrevYear = 2025;
        $labelCurrYear = 2026;
        
        // Approval logic
        $isRenbangAcc = $rkat->logPersetujuans->where('level_persetujuan', 'Tim_Renbang')->where('aksi', 'Setuju')->last();
        $isUnitAcc = $rkat->logPersetujuans->whereIn('level_persetujuan', ['Kepala_Unit', 'Dekan'])->where('aksi', 'Setuju')->last();
        $isWRAcc = $rkat->logPersetujuans->whereIn('level_persetujuan', ['WR_1', 'WR_2', 'WR_3'])->where('aksi', 'Setuju')->last();
        
        $renbangApprover = $isRenbangAcc ? $isRenbangAcc->approver : null;
        $unitApprover = $isUnitAcc ? $isUnitAcc->approver : null;
        $wrApprover = $isWRAcc ? $isWRAcc->approver : null;

        $revisions = $rkat->logPersetujuans->where('aksi', 'Revisi');
        
        // Calculate real RAB total
        $rabTotal = $detail->rabItems->sum('sub_total');
    @endphp

    <div class="header">
        @if(file_exists($logoPath))
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
                    <thead>
                        <tr>
                            <th rowspan="2" style="border-top:none; border-left:none;">Indikator</th>
                            <th style="width: 80px;">Kondisi Akhir {{ $labelPrevYear }}</th>
                            <th colspan="2">Tahun {{ $labelCurrYear }}</th>
                            <th colspan="2" style="border-right:none;">Akhir 2029</th>
                        </tr>
                        <tr>
                            <th>Capaian</th>
                            <th>Target</th>
                            <th>Capaian</th>
                            <th>Target</th>
                            <th style="border-right:none;">Capaian</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($detail->indikators as $ind)
                        <tr>
                            <td style="border-left:none;">{{ $ind->nama_indikator }}</td>
                            <td class="text-center">{{ $ind->capai_2025 ?? '-' }}</td>
                            <td class="text-center">{{ $ind->target_2026 ?? '-' }}</td>
                            <td class="text-center">{{ $ind->capai_2026 ?? '-' }}</td>
                            <td class="text-center">{{ $ind->target_2029 ?? '-' }}</td>
                            <td class="text-center" style="border-right:none;">{{ $ind->capai_2029 ?? '-' }}</td>
                        </tr>
                        @empty
                        <tr>
                            <td colspan="6" class="text-center" style="border-left:none; border-right:none;">Tidak ada indikator</td>
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

    <div style="text-align: center; margin: 10px 0; font-weight: bold; text-decoration: underline; font-size: 9pt;">RENCANA ANGGARAN</div>

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
            <td>
                <div class="checkbox-group"><div class="checkbox">{{ $detail->jenis_kegiatan == 'Rutin' ? 'v' : '' }}</div> Rutin</div>
                <div class="checkbox-group"><div class="checkbox">{{ $detail->jenis_kegiatan == 'Inovasi' ? 'v' : '' }}</div> Inovasi</div>
            </td>
        </tr>
        <tr>
            <td class="label-col">Dokumen Pendukung</td>
            <td>
                @php $docs = $detail->dokumen_pendukung ?? []; @endphp
                <div class="checkbox-group"><div class="checkbox">{{ in_array('Pengajuan Rutin', $docs) ? 'v' : '' }}</div> Pengajuan Rutin</div>
                <div class="checkbox-group"><div class="checkbox">{{ in_array('Proposal', $docs) ? 'v' : '' }}</div> Proposal</div>
                <div class="checkbox-group"><div class="checkbox">{{ in_array('TOR', $docs) ? 'v' : '' }}</div> TOR</div>
                <div class="checkbox-group"><div class="checkbox">{{ in_array('Usulan', $docs) ? 'v' : '' }}</div> Usulan</div>
            </td>
        </tr>
        <tr>
            <td class="label-col">Waktu Pelaksanaan</td>
            <td>{{ \Carbon\Carbon::parse($detail->jadwal_pelaksanaan_mulai)->translatedFormat('d F Y') }} s.d {{ \Carbon\Carbon::parse($detail->jadwal_pelaksanaan_akhir)->translatedFormat('d F Y') }}</td>
        </tr>
        <tr>
            <td class="label-col">Anggaran</td>
            <td class="font-bold">Rp {{ number_format($rabTotal, 0, ',', '.') }}</td>
        </tr>
        <tr>
            <td class="label-col">Pencairan Dana</td>
            <td>
                <div class="checkbox-group"><div class="checkbox">{{ $detail->jenis_pencairan == 'Bank' ? 'v' : '' }}</div> Transfer ke Bank : {{ $detail->nama_bank ?? '-' }}</div>
                <div style="margin-left: 15px;">No Rekening : {{ $detail->nomor_rekening ?? '-' }} (a.n {{ $detail->atas_nama ?? '-' }})</div>
                <div class="checkbox-group" style="margin-top: 3px;"><div class="checkbox">{{ $detail->jenis_pencairan == 'Tunai' ? 'v' : '' }}</div> Tunai</div>
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
                        <th style="width: 30px;">Vol</th>
                        <th style="width: 40px;">Satuan</th>
                        <th style="width: 80px;">Biaya Satuan</th>
                        <th style="width: 80px;">Jumlah</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($detail->rabItems as $idx => $rab)
                    <tr>
                        <td class="text-center">{{ $idx + 1 }}</td>
                        <td class="text-center">{{ $rab->kode_anggaran }}</td>
                        <td>{{ $rab->deskripsi_item }}</td>
                        <td class="text-center">{{ number_format($rab->volume, 2, '.', ',') }}</td>
                        <td class="text-center">{{ $rab->satuan }}</td>
                        <td class="text-right">{{ number_format($rab->harga_satuan, 0, ',', '.') }}</td>
                        <td class="text-right">{{ number_format($rab->sub_total, 0, ',', '.') }}</td>
                    </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr class="font-bold">
                        <td colspan="6" class="text-right">Total</td>
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
                            <td style="border:none; border-right:1px solid #000; width:50%; text-align:center; padding: 2px;">Verifikasi</td>
                            <td style="border:none; text-align:center; padding: 2px;">Note</td>
                        </tr>
                    </table>
                    <div style="text-align:center; border-top:1px solid #000; padding:1px; font-style:italic;">(diisi oleh BAUK)</div>
                </div>
            </div>
        </div>
    </div>

    @if($revisions->count() > 0)
    <div class="revision-note">
        <div class="font-bold" style="text-decoration: underline; margin-bottom: 2px;">Catatan Revisi:</div>
        @foreach($revisions as $rev)
            <div style="margin-bottom: 2px;">- <strong>{{ $rev->approver->nama_lengkap }} ({{ str_replace('_', ' ', $rev->level_persetujuan) }}):</strong> {{ $rev->catatan }}</div>
        @endforeach
    </div>
    @endif

    <div class="signature-section">
        <div style="width: 100%; margin-bottom: 20px;">
            <div class="sig-box">
                <p>Verifikasi</p>
                <p>Tim Renbang</p>
                <div class="sig-space">
                    @if($isRenbangAcc)
                        <div class="sig-status">ACC</div>
                    @endif
                </div>
                <p class="font-bold">{{ $renbangApprover ? $renbangApprover->nama_lengkap : 'Sapto Nugroho, S.T' }}</p>
                <p>NIK. {{ $renbangApprover ? ($renbangApprover->nik ?? '212013066') : '212013066' }}</p>
            </div>
            <div class="sig-box text-right" style="float: right;">
                <p>Surakarta, {{ \Carbon\Carbon::now()->translatedFormat('d F Y') }}</p>
                <p>PIC Kegiatan / Pembina UKM</p>
                <div class="sig-space">
                    <div class="sig-status" style="border: none; opacity: 0.1; color: #eee;">DRAFT</div>
                </div>
                <p class="font-bold">{{ $rkat->user->nama_lengkap }}</p>
                <p>NIK. {{ $rkat->user->nik ?? '............................' }}</p>
            </div>
            <div style="clear: both;"></div>
        </div>

        <div style="width: 100%;">
            <div class="sig-box">
                <p>Mengetahui,</p>
                <p>Kepala Kantor Kemahasiswaan</p>
                <div class="sig-space">
                    @if($isUnitAcc)
                        <div class="sig-status">ACC</div>
                    @endif
                </div>
                <p class="font-bold">{{ $unitApprover ? $unitApprover->nama_lengkap : 'Gege Noby Priohananto, S.Sn, M.Sn' }}</p>
                <p>NIK. {{ $unitApprover ? ($unitApprover->nik ?? '112025133') : '112025133' }}</p>
            </div>
            <div class="sig-box text-right" style="float: right;">
                <p>Menyetujui,</p>
                <p>Wakil Rektor</p>
                <div class="sig-space">
                    @if($isWRAcc)
                        <div class="sig-status">ACC</div>
                    @endif
                </div>
                <p class="font-bold">{{ $wrApprover ? $wrApprover->nama_lengkap : 'Prof. Dr. Drajat Tri Kartono, M.SI' }}</p>
                <p>NIK. {{ $wrApprover ? ($wrApprover->nik ?? '102024039') : '102024039' }}</p>
            </div>
            <div style="clear: both;"></div>
        </div>
    </div>
</body>
</html>
