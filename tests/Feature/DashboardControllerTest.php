<?php

namespace Tests\Feature;

use App\Models\RkatHeader;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardControllerTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_displays_dashboard_with_correct_stats_and_latest_rkats()
    {
        // Menyiapkan data untuk pengujian
        $user = User::factory()->create(); // Membuat user untuk login
        $this->actingAs($user); // Autentikasi user yang telah dibuat

        // Menambahkan data RKAT yang diperlukan
        RkatHeader::factory()->create([
            'status_persetujuan' => 'Pending',
            'tahun_anggaran' => 2024,
        ]);
        RkatHeader::factory()->create([
            'status_persetujuan' => 'Disetujui_Final',
            'tahun_anggaran' => 2024,
        ]);
        RkatHeader::factory()->create([
            'status_persetujuan' => 'Ditolak',
            'tahun_anggaran' => 2024,
        ]);

        // Kunjungi route dashboard dan pastikan data yang ditampilkan sudah benar
        $response = $this->get(route('dashboard'));

        // Menggunakan Inertia untuk memverifikasi data yang dikirim
        $response->assertInertia(fn (Assert $page) =>
            $page->component('Dashboard') // Pastikan komponen Dashboard dirender
                 ->has('stats', function ($stats) {
                     $stats->where('total', 3)
                           ->where('pending', 1)
                           ->where('approved', 1)
                           ->where('rejected', 1);
                 })
                 ->has('latestRkats', 3) // Pastikan 3 RKAT terbaru ditampilkan
        );
    }
}
