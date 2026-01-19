
'use client';

import { useState, useTransition, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from 'xlsx';
import { getYear, getMonth, format, subYears } from "date-fns";
import { id } from 'date-fns/locale';
import { collection, query, orderBy, getDocs, Timestamp } from 'firebase/firestore';

import { ServiceTable } from "@/components/service-table";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CornerUpLeft, Download, LayoutGrid, BarChart2 } from "lucide-react";
import { type HealthcareService, serviceSchema } from "@/lib/types";
import { PasswordDialog } from "@/components/password-dialog";
import { puskeswanList } from "@/lib/definitions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList, Cell, PieChart, Pie, Legend } from 'recharts';
import { useIsMobile } from "@/hooks/use-mobile";
import { useFirebase } from "@/firebase";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface StatItem {
  name: string;
  count: number;
  percentage: number;
}

function calculateStats(services: HealthcareService[], groupBy: 'month' | 'officerName' | 'puskeswan' | 'diagnosis'): StatItem[] {
  if (services.length === 0) return [];

  const total = services.length;
  const counts: { [key: string]: number } = {};

  services.forEach(service => {
      let key: string;
      if (groupBy === 'month') {
          key = format(new Date(service.date), 'MMMM yyyy', { locale: id });
      } else {
          key = service[groupBy as keyof HealthcareService] as string;
      }
      counts[key] = (counts[key] || 0) + 1;
  });

  return Object.entries(counts)
      .map(([name, count]) => ({
          name,
          count,
          percentage: (count / total) * 100,
      }))
      .sort((a, b) => b.count - a.count);
}

function StatisticsDisplay({ services }: { services: HealthcareService[] }) {
  const isMobile = useIsMobile();
  if (services.length === 0) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Statistik Belum Tersedia</CardTitle>
                <CardDescription>
                    Tidak ada data untuk ditampilkan statistiknya pada periode yang dipilih.
                </CardDescription>
            </CardHeader>
        </Card>
      );
  }

  const statsByMonth = calculateStats(services, 'month');
  const statsByOfficer = calculateStats(services, 'officerName');
  const statsByPuskeswan = calculateStats(services, 'puskeswan');
  const statsByDiagnosis = calculateStats(services, 'diagnosis');

  const officerToPuskeswanMap: { [key: string]: string } = {};
  services.forEach(service => {
      if (service.officerName && service.puskeswan && !officerToPuskeswanMap[service.officerName]) {
          officerToPuskeswanMap[service.officerName] = service.puskeswan;
      }
  });

  const puskeswanColors: { [key: string]: string } = {
    'Puskeswan Topoyo': '#00008B',
    'Puskeswan Tobadak': '#006400',
    'Puskeswan Karossa': '#FF0000',
    'Puskeswan Budong-Budong': '#FFFF00',
    'Puskeswan Pangale': '#4B0082',
  };
  const defaultColor = '#808080';

  const StatChart = ({ title, data }: { title: string; data: StatItem[] }) => {
    const chartData = data;

    const CustomLabel = (props: any) => {
        const { x, y, width, index } = props;
        const item = chartData[index];
    
        if (!item) {
          return null;
        }
    
        const labelText = `${item.count} (${item.percentage.toFixed(0)}%)`;
    
        return (
          <text
            x={x + width + 8}
            y={y + 13}
            dominantBaseline="middle"
            fill="hsl(var(--foreground))"
            fontSize={12}
            className="font-semibold"
          >
            {labelText}
          </text>
        );
      };

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={Math.max(150, chartData.length * 26)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 90, left: 10, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) =>
                  value.length > 20 ? `${value.substring(0, 20)}...` : value
                }
                interval={0}
                width={140}
                tick={{ fontWeight: 'bold' }}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
                        <p className="font-bold">{label}</p>
                        <p className="text-muted-foreground">
                          {`Jumlah: ${
                            payload[0].value
                          } (${(payload[0].payload as StatItem).percentage.toFixed(0)}%)`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                name="Jumlah"
                radius={[0, 4, 4, 0]}
              >
                <LabelList content={<CustomLabel />} />
                {chartData.map((entry, index) => {
                    let color = defaultColor;
                    if (title === 'Statistik per Bulan') {
                        color = '#FA8072';
                    } else if (title === 'Statistik per Petugas') {
                      const puskeswan = officerToPuskeswanMap[entry.name];
                      if (puskeswan) {
                        color = puskeswanColors[puskeswan] || defaultColor;
                      }
                    } else if (title === 'Statistik per Kasus/Penyakit') {
                      color = '#006400';
                    }
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };
  
  const StatPieChart = ({ title, data, colorMap }: { title: string; data: StatItem[]; colorMap: { [key: string]: string } }) => {
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value, name }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
        if (percent * 100 < 5) return null;
  
        return (
          <text x={x} y={y} fill="black" textAnchor="middle" dominantBaseline="central" className="font-bold text-sm">
            {`${value} (${(percent * 100).toFixed(0)}%)`}
          </text>
        );
      };

    const renderLegendText = (value: string) => {
      return <span style={{ color: 'black' }}>{value}</span>;
    };
  
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={isMobile ? 450 : 350}>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="name"
                cx={isMobile ? '50%' : '65%'}
                cy={isMobile ? '45%' : '50%'}
                outerRadius={isMobile ? 100 : 120}
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorMap[entry.name] || defaultColor} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const dataPayload = payload[0];
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dataPayload.payload.fill }}></div>
                          <p className="font-bold">{dataPayload.name}</p>
                        </div>
                        <p className="text-muted-foreground pl-4">
                          {`Jumlah: ${dataPayload.value} (${(dataPayload.payload.percentage).toFixed(0)}%)`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                layout={isMobile ? 'horizontal' : 'vertical'}
                align={isMobile ? 'center' : 'left'}
                verticalAlign={isMobile ? 'bottom' : 'middle'}
                wrapperStyle={isMobile ? { paddingTop: '20px' } : { paddingLeft: '20px' }}
                formatter={renderLegendText}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
        <StatChart title="Statistik per Bulan" data={statsByMonth} />
        <StatChart title="Statistik per Petugas" data={statsByOfficer.sort((a, b) => b.count - a.count)} />
        <StatPieChart title="Statistik per Puskeswan" data={statsByPuskeswan} colorMap={puskeswanColors} />
        <StatChart title="Statistik per Kasus/Penyakit" data={statsByDiagnosis} />
    </div>
  );
}

const years = Array.from({ length: 5 }, (_, i) => getYear(subYears(new Date(), i)).toString());
const months = Array.from({ length: 12 }, (_, i) => ({
  value: i.toString(),
  label: new Date(0, i).toLocaleString('id-ID', { month: 'long' })
}));

export default function ReportPage() {
  const router = useRouter();
  const { firestore } = useFirebase();
  const [allServices, setAllServices] = useState<HealthcareService[]>([]);
  const [filteredServices, setFilteredServices] = useState<HealthcareService[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIds, setHighlightedIds] = useState<string[]>([]);

  useEffect(() => {
    const updateHighlighted = () => {
      const storedEntries = JSON.parse(localStorage.getItem('newEntries') || '[]');
      const now = Date.now();
      const oneHour = 3600 * 1000;
      
      const validEntries = storedEntries.filter(
        (entry: { id: string, timestamp: number }) => (now - entry.timestamp) < oneHour
      );

      if (validEntries.length !== storedEntries.length) {
        localStorage.setItem('newEntries', JSON.stringify(validEntries));
      }
      
      setHighlightedIds(validEntries.map((entry: { id: string }) => entry.id));
    };

    updateHighlighted();
    const interval = setInterval(updateHighlighted, 60000);

    return () => clearInterval(interval);
  }, []);

  const loadAllServices = useCallback(async () => {
    if (!firestore) return;
    setLoading(true);
    try {
      const servicesCollection = collection(firestore, 'healthcareServices');
      const q = query(servicesCollection, orderBy('date', 'desc'));

      const querySnapshot = await getDocs(q);
      const fetchedServices: HealthcareService[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        try {
          const service = serviceSchema.parse({
            ...data,
            id: doc.id,
            date: (data.date as Timestamp).toDate(),
          });
          fetchedServices.push(service);
        } catch (e) {
          console.error('Validation error parsing service data:', e);
        }
      });
      setAllServices(fetchedServices);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setAllServices([]);
    } finally {
      setLoading(false);
    }
  }, [firestore]);

  useEffect(() => {
    loadAllServices();
  }, [loadAllServices]);

  useEffect(() => {
    startTransition(() => {
      let servicesToFilter = allServices;

      const year =
        selectedYear === 'all-years' || selectedYear === ''
          ? null
          : parseInt(selectedYear, 10);
      const month =
        selectedMonth === 'all-months' || selectedMonth === ''
          ? null
          : parseInt(selectedMonth, 10);

      if (year || month !== null) {
        servicesToFilter = allServices.filter((service) => {
          const serviceDate = new Date(service.date);
          const isYearMatch = year ? getYear(serviceDate) === year : true;
          const isMonthMatch =
            month !== null ? getMonth(serviceDate) === month : true;
          return isYearMatch && isMonthMatch;
        });
      }

      const lowercasedFilter = searchTerm.toLowerCase();
      if (lowercasedFilter) {
        servicesToFilter = servicesToFilter.filter((service) => {
          const ownerName = service.ownerName.toLowerCase();
          const officerName = service.officerName.toLowerCase();
          const puskeswan = service.puskeswan.toLowerCase();
          const diagnosis = service.diagnosis.toLowerCase();
          const livestockType = service.livestockType.toLowerCase();
          const formattedDate = format(new Date(service.date), 'dd MMM yyyy', {
            locale: id,
          }).toLowerCase();

          return (
            ownerName.includes(lowercasedFilter) ||
            officerName.includes(lowercasedFilter) ||
            puskeswan.includes(lowercasedFilter) ||
            diagnosis.includes(lowercasedFilter) ||
            livestockType.includes(lowercasedFilter) ||
            formattedDate.includes(lowercasedFilter)
          );
        });
      }
      
      if (highlightedIds.length > 0) {
        const highlightedItems = servicesToFilter.filter(s => s.id! && highlightedIds.includes(s.id));
        const restItems = servicesToFilter.filter(s => !s.id || !highlightedIds.includes(s.id));
        servicesToFilter = [...highlightedItems, ...restItems];
      }

      setFilteredServices(servicesToFilter);
    });
  }, [selectedMonth, selectedYear, searchTerm, allServices, highlightedIds]);

  const handleLocalDelete = (serviceId: string) => {
    setAllServices((currentServices) =>
      currentServices.filter((s) => s.id !== serviceId)
    );
     const newEntries = JSON.parse(localStorage.getItem('newEntries') || '[]');
     const updatedEntries = newEntries.filter((entry: {id: string}) => entry.id !== serviceId);
     if(newEntries.length !== updatedEntries.length) {
       localStorage.setItem('newEntries', JSON.stringify(updatedEntries));
       setHighlightedIds(updatedEntries.map((e: {id: string}) => e.id));
     }
  };

  const handleDownload = () => {
    const wb = XLSX.utils.book_new();
  
    puskeswanList.forEach((puskeswan) => {
      const servicesByPuskeswan = filteredServices.filter(
        (s) => s.puskeswan === puskeswan
      );
  
      if (servicesByPuskeswan.length === 0) return;
  
      const sortedServices = servicesByPuskeswan.sort((a, b) => {
        const officerComparison = a.officerName.localeCompare(b.officerName);
        if (officerComparison !== 0) {
          return officerComparison;
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });
  
      const servicesByOfficer: { [key: string]: HealthcareService[] } = {};
      sortedServices.forEach(service => {
        if (!servicesByOfficer[service.officerName]) {
          servicesByOfficer[service.officerName] = [];
        }
        servicesByOfficer[service.officerName].push(service);
      });
  
      const allDataForSheet: any[] = [];
      const headers = ['Tanggal', 'Nama Pemilik', 'Alamat Pemilik', 'Jenis Ternak', 'Gejala Klinis', 'Diagnosa', 'Jenis Penanganan', 'Obat yang Digunakan', 'Dosis', 'Jumlah Ternak'];
      
      const officerNames = Object.keys(servicesByOfficer).sort();

      officerNames.forEach(officerName => {
        allDataForSheet.push({});
        allDataForSheet.push({});
        allDataForSheet.push({ 'Nama Petugas': officerName }); 
        allDataForSheet.push(Object.fromEntries(headers.map(h => [h, h])));

        const officerServices = servicesByOfficer[officerName];
        const data = officerServices.map((service) => ({
            'Tanggal': format(new Date(service.date), 'dd-MM-yyyy'),
            'Nama Pemilik': service.ownerName,
            'Alamat Pemilik': service.ownerAddress,
            'Jenis Ternak': service.livestockType,
            'Gejala Klinis': service.clinicalSymptoms,
            'Diagnosa': service.diagnosis,
            'Jenis Penanganan': service.treatmentType,
            'Obat yang Digunakan': service.treatments.map((t) => t.medicineName).join(', '),
            'Dosis': service.treatments.map((t) => `${t.dosageValue} ${t.dosageUnit}`).join(', '),
            'Jumlah Ternak': service.livestockCount,
        }));
        allDataForSheet.push(...data);
      });

      const sheetName = puskeswan
        .replace('Puskeswan ', '')
        .replace(/[/\\?*:[\]]/g, ''); 

      const ws = XLSX.utils.json_to_sheet(allDataForSheet, { skipHeader: true });

      const columnWidths = headers.map((header) => {
        const allValues = allDataForSheet.map(row => row[header]).filter(Boolean);
        const maxLength = allValues.reduce((max, cellValue) => {
          const cellLength = cellValue ? String(cellValue).length : 0;
          return Math.max(max, cellLength);
        }, header.length);
        return { wch: maxLength + 2 }; 
      });
      ws['!cols'] = columnWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
    });
  
    const monthLabel =
      selectedMonth === 'all-months'
        ? 'SemuaBulan'
        : months.find((m) => m.value === selectedMonth)?.label || 'SemuaBulan';
    const yearLabel =
      selectedYear === 'all-years'
        ? 'SemuaTahun'
        : selectedYear === ''
        ? getYear(new Date()).toString()
        : selectedYear;
  
    XLSX.writeFile(wb, `laporan_pelayanan_${monthLabel}_${yearLabel}.xlsx`);
  };

  return (
    <div className="container px-4 sm:px-8 py-4 md:py-8 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight font-headline">
                Laporan Pelayanan
              </CardTitle>
              <CardDescription className="mt-1 text-sm md:text-base">
                Cari, lihat, dan unduh semua data pelayanan yang telah
                diinput.
              </CardDescription>
            </div>
            <div className="w-full flex justify-end sm:w-auto">
              <PasswordDialog
                title="Akses Terbatas"
                description="Silakan masukkan kata sandi untuk mengunduh laporan."
                onSuccess={handleDownload}
                trigger={
                  <Button disabled={filteredServices.length === 0}>
                    <Download className="mr-2 h-5 w-5" />
                    Unduh Laporan
                  </Button>
                }
              />
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="tabel" className="w-full">
        <Card>
            <CardContent className="p-6 flex flex-col gap-4">
                 <div className="flex flex-col md:flex-row md:justify-end gap-2">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Pilih Bulan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all-months">Semua Bulan</SelectItem>
                        {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                            {month.label}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full sm:w-[120px]">
                        <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all-years">Semua Tahun</SelectItem>
                        {years.map((year) => (
                        <SelectItem key={year} value={year}>
                            {year}
                        </SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                    <Input
                    placeholder="Cari data..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-64"
                    />
                </div>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="tabel">
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Tabel
                    </TabsTrigger>
                    <TabsTrigger value="statistik">
                    <BarChart2 className="mr-2 h-4 w-4" />
                    Statistik
                    </TabsTrigger>
                </TabsList>
            </CardContent>
        </Card>

        <div className="mt-6">
            <TabsContent value="tabel">
                <ServiceTable
                    services={filteredServices}
                    loading={loading && allServices.length === 0}
                    highlightedIds={highlightedIds}
                    searchTerm={searchTerm}
                    onDelete={handleLocalDelete}
                    isPending={isPending}
                />
            </TabsContent>
            <TabsContent value="statistik">
                <StatisticsDisplay services={filteredServices} />
            </TabsContent>
        </div>
      </Tabs>
      
      <Button
          variant="default"
          className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-lg"
          aria-label="Kembali ke halaman utama"
          onClick={() => router.back()}
        >
          <CornerUpLeft className="h-7 w-7" />
        </Button>
    </div>
  );
}
