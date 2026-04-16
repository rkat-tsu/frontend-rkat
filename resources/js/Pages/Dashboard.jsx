import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

// Import Komponen Shadcn UI
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/Components/ui/card"; // Sesuaikan path alias @ Anda jika berbeda (misal: @/components/ui/card)

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/Components/ui/chart";

// Import Recharts (tetap dipakai di dalam ChartContainer Shadcn)
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

export default function Dashboard({ auth, grafikRkat, tahunAnggaran, summary }) {
    
    // Konfigurasi Warna & Label untuk Shadcn Chart
    const chartConfig = {
        Pengajuan: {
            label: "Total Pengajuan",
            color: "hsl(var(--chart-1))", // Menggunakan variabel warna tema bawaan Shadcn
        },
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Dashboard Overview</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* --- KARTU RINGKASAN (SHADCN CARDS) --- */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Dokumen</CardTitle>
                                <FileText className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary?.total || 0}</div>
                                <p className="text-xs text-muted-foreground">Seluruh pengajuan RKAT</p>
                            </CardContent>
                        </Card>
                        
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Dalam Review</CardTitle>
                                <Clock className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary?.review || 0}</div>
                                <p className="text-xs text-muted-foreground">Menunggu persetujuan</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary?.disetujui || 0}</div>
                                <p className="text-xs text-muted-foreground">Telah disetujui Final</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
                                <XCircle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{summary?.ditolak || 0}</div>
                                <p className="text-xs text-muted-foreground">Dikembalikan/Ditolak</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* --- GRAFIK AREA (SHADCN CHARTS) --- */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Statistik Pengajuan RKAT</CardTitle>
                            <CardDescription>
                                Menampilkan jumlah dokumen RKAT yang diajukan sepanjang tahun {tahunAnggaran}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={chartConfig} className="min-h-[200px] h-[350px] w-full">
                                <AreaChart
                                    accessibilityLayer
                                    data={grafikRkat}
                                    margin={{
                                        left: -20,
                                        right: 12,
                                        top: 12,
                                        bottom: 0,
                                    }}
                                >
                                    {/* Efek Gradasi di bawah garis grafik */}
                                    <defs>
                                        <linearGradient id="fillPengajuan" x1="0" y1="0" x2="0" y2="1">
                                            <stop
                                                offset="5%"
                                                stopColor="var(--color-Pengajuan)"
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor="var(--color-Pengajuan)"
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                    </defs>
                                    
                                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="name"
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        tickFormatter={(value) => value.slice(0, 3)} // Menyingkat bulan (Jan, Feb, dll)
                                    />
                                    <YAxis 
                                        tickLine={false}
                                        axisLine={false}
                                        tickMargin={8}
                                        allowDecimals={false} // Angka di sumbu Y dibulatkan (tidak ada RKAT 1.5)
                                    />
                                    
                                    {/* Tooltip khas Shadcn yang elegan */}
                                    <ChartTooltip
                                        cursor={false}
                                        content={<ChartTooltipContent indicator="line" />}
                                    />
                                    
                                    <Area
                                        dataKey="Pengajuan"
                                        type="natural" // Membuat garis melengkung (kurva halus)
                                        fill="url(#fillPengajuan)"
                                        fillOpacity={0.4}
                                        stroke="var(--color-Pengajuan)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}