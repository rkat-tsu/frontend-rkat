<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Export PDF Gagal</title>
    <style>
        * { box-sizing: border-box; }
        body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; background: #f1f5f9; color: #1f2937; font-family: Arial, sans-serif; }
        .card { width: 100%; max-width: 520px; padding: 32px; background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 12px 32px rgba(15, 23, 42, .08); }
        .icon { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 50%; background: #fff7ed; color: #c2410c; font-size: 25px; font-weight: bold; }
        h1 { margin: 18px 0 8px; font-size: 22px; color: #0f172a; }
        p { margin: 0; color: #475569; line-height: 1.6; }
        .details { margin: 22px 0; padding: 14px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; }
        .row { display: flex; justify-content: space-between; gap: 16px; padding: 5px 0; font-size: 14px; }
        .label { color: #64748b; }
        .value { font-weight: 600; text-align: right; }
        code { color: #334155; font-size: 12px; overflow-wrap: anywhere; }
        .back-link { display: block; width: 100%; border-radius: 9px; padding: 12px 16px; background: #1e3a5f; color: #fff; font-size: 14px; font-weight: 600; text-align: center; text-decoration: none; }
        .back-link:hover { background: #172f4d; }
        .hint { margin-top: 14px; font-size: 12px; color: #64748b; }
    </style>
</head>
<body>
    <main class="card">
        <div class="icon" aria-hidden="true">!</div>
        <h1>PDF {{ $documentType }} gagal dibuat</h1>
        <p>Terjadi kendala saat menyiapkan dokumen. Silakan coba lagi. Jika masih gagal, kirimkan informasi di bawah kepada administrator.</p>
        <div class="details">
            <div class="row"><span class="label">Tahap</span><span class="value">{{ $stageLabel }}</span></div>
            <div class="row"><span class="label">ID referensi</span><code>{{ $reference }}</code></div>
        </div>
        <a class="back-link" href="{{ route('dashboard') }}">Kembali ke aplikasi</a>
        <p class="hint">Detail teknis tersimpan di log server dengan ID referensi tersebut.</p>
    </main>
</body>
</html>
