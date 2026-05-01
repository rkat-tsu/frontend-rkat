<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RKAT Disetujui</title>
    <style>
        body { font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #e5e7eb; margin: 0; padding: 0; }
        .wrapper { padding: 40px 20px; background-color: #e5e7eb; }
        .container { max-width: 600px; margin: 0 auto; background: linear-gradient(to right, #2563eb 0%, #14b8a6 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); }
        .header { padding: 50px 20px 40px 20px; text-align: center; }
        .header img { height: 50px; max-width: 100%; filter: brightness(0) invert(1); }
        
        .content-layer { background-color: #ffffff; border-radius: 32px 32px 0 0; padding: 40px; }
        .content { color: #475569; line-height: 1.6; font-size: 15px; text-align: left; }
        .content h1 { color: #0f766e; font-size: 24px; margin-top: 0; margin-bottom: 25px; font-weight: 700; text-align: left; }
        
        .greeting { font-weight: 600; color: #1e293b; font-size: 16px; margin-bottom: 12px; }
        .info-box { background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; border-radius: 0 12px 12px 0; color: #166534; margin: 25px 0; font-weight: 500; }
        
        .table { width: 100%; border-collapse: separate; border-spacing: 0; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; margin: 20px 0; }
        .table th, .table td { padding: 14px 16px; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .table tr:last-child th, .table tr:last-child td { border-bottom: none; }
        .table th { background-color: #f8fafc; color: #64748b; font-weight: 500; width: 40%; }
        .table td { color: #1e293b; font-weight: 600; }
        
        .btn-wrapper { text-align: center; margin: 35px 0; }
        .btn { display: inline-block; background: linear-gradient(to right, #0d9488, #0369a1); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: bold; text-align: center; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.2); }
        
        .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #f1f5f9; padding-top: 25px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <img src="{{ $message->embed(public_path('img/logo-full-tsu.svg')) }}" alt="TSU Logo">
            </div>
            
            <div class="content-layer">
                <div class="content">
                    <h1>Pemberitahuan Persetujuan RKAT</h1>
                    
                    <div class="greeting">
                        Yth. {{ $rkatHeader->user->nama_lengkap ?? 'Bapak/Ibu' }},
                    </div>
                    
                    <p>Kabar baik! Pengajuan Rencana Kegiatan dan Anggaran Tahunan (RKAT) Anda telah mendapatkan persetujuan dan siap untuk tahap selanjutnya.</p>
                    
                    <div class="info-box">
                        Dokumen RKAT Anda berhasil disetujui pada tahap terbaru.
                    </div>
                    
                    <table class="table">
                        <tr>
                            <th>Nomor Dokumen</th>
                            <td>{{ $rkatHeader->nomor_dokumen }}</td>
                        </tr>
                        <tr>
                            <th>Judul Kegiatan</th>
                            <td>{{ $judul ?? '-' }}</td>
                        </tr>
                        <tr>
                            <th>Unit Kerja</th>
                            <td>{{ $unit ?? '-' }}</td>
                        </tr>
                        <tr>
                            <th>Total Anggaran</th>
                            <td style="color: #0d9488;">Rp {{ number_format($rkatHeader->total_anggaran, 0, ',', '.') }}</td>
                        </tr>
                        <tr>
                            <th>Status Terbaru</th>
                            <td><span style="background-color: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: bold;">{{ str_replace('_', ' ', $rkatHeader->status_persetujuan) }}</span></td>
                        </tr>
                        <tr>
                            <th>Disetujui Oleh</th>
                            <td>{{ $approver ?? '-' }}</td>
                        </tr>
                    </table>
                    
                    <div class="btn-wrapper">
                        <a href="{{ route('rkat.show', $rkatHeader->uuid) }}" class="btn">Lihat Detail Pengajuan</a>
                    </div>
                    
                    <p style="font-size: 13px; color: #64748b;">Silakan pantau status pengajuan Anda secara berkala melalui dashboard sistem.</p>
                </div>
                
                <div class="footer">
                    &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.<br>
                    Email otomatis, mohon tidak membalas.
                </div>
            </div>
        </div>
    </div>
</body>
</html>