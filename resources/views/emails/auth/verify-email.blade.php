<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifikasi Alamat Email</title>
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
        .info-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; color: #475569; margin: 30px 0; font-size: 14px; }
        .info-box ul { margin: 10px 0 0 0; padding-left: 20px; }
        .info-box li { margin-bottom: 8px; }
        
        .btn-wrapper { text-align: center; margin: 35px 0; }
        .btn { display: inline-block; background: linear-gradient(to right, #0d9488, #0369a1); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: bold; text-align: center; font-size: 15px; box-shadow: 0 4px 6px -1px rgba(13, 148, 136, 0.2); }
        
        .footer { margin-top: 40px; text-align: center; color: #94a3b8; font-size: 13px; border-top: 1px solid #f1f5f9; padding-top: 25px; }
        .link-fallback { font-size: 12px; color: #64748b; word-break: break-all; margin-top: 30px; padding: 15px; background-color: #f8fafc; border-radius: 8px; border: 1px dashed #cbd5e1; }
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
                    <h1>Verifikasi Alamat Email</h1>
                    
                    <div class="greeting">
                        Halo {{ $name ?? 'Pengguna Baru' }},
                    </div>
                    
                    <p>Selamat bergabung di <strong>ReKAT</strong>! Kami perlu memverifikasi alamat email Anda untuk memastikan keamanan akun Anda.</p>
                    
                    <div class="btn-wrapper">
                        <a href="{{ $verificationUrl ?? '#' }}" class="btn">Verifikasi Alamat Email</a>
                    </div>
                    
                    <div class="info-box">
                        <strong style="color: #334155;">Mengapa verifikasi ini penting?</strong>
                        <ul>
                            <li>Mengamankan akses ke akun Anda.</li>
                            <li>Menerima notifikasi penting terkait sistem.</li>
                            <li>Mengaktifkan fitur penuh di dashboard.</li>
                        </ul>
                    </div>
                    
                    <p style="margin-bottom: 0;">Jika Anda tidak merasa mendaftar di sistem kami, abaikan email ini.</p>
                    
                    <div class="link-fallback">
                        <span style="font-size: 11px; color: #94a3b8;">Jika tombol tidak berfungsi, salin URL berikut:</span><br>
                        <a href="{{ $verificationUrl ?? '#' }}" style="color: #0284c7; font-size: 11px;">{{ $verificationUrl ?? '#' }}</a>
                    </div>
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