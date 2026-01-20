
'use client';

import { useState, useTransition, useEffect, useCallback, useMemo } from "react";
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
}

function calculateStats(services: HealthcareService[], groupBy: 'month' | 'officerName' | 'puskeswan' | 'diagnosis'): StatItem[] {
  if (services.length === 0) return [];

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
      }))
      .sort((a, b) => b.count - a.count);
}

const StatChart = ({ title, data, officerToPuskeswanMap, puskeswanColors, defaultColor, showAll = false }: { 
  title: string; 
  data: StatItem[];
  officerToPuskeswanMap: { [key: string]: string };
  puskeswanColors: { [key: string]: string };
  defaultColor: string;
  showAll?: boolean;
}) => {
  const isMobile = useIsMobile();
  const [showLabel, setShowLabel] = useState(false);

  useEffect(() => {
    // This timeout is a workaround to ensure labels appear after the bar animation.
    const timer = setTimeout(() => {
      setShowLabel(true);
    }, 2000); // Duration should match animationDuration of the Bar
    return () => clearTimeout(timer);
  }, [data]); // Re-trigger if data changes
  
  const chartData = useMemo(() => showAll ? data : data.slice(0, 10), [data, showAll]);
  const yAxisWidth = isMobile ? 120 : 180;
  const rightMargin = isMobile ? 40 : 80;

  const barHeight = 28;
  const chartHeight = Math.max(150, chartData.length * barHeight);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-left">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pr-0 sm:pr-4">
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: rightMargin, left: 0, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tickLine={false}
                axisLine={false}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                interval={0}
                width={yAxisWidth}
                tickFormatter={(value) => value}
                tick={{ fontWeight: 'bold' }}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div
                        className="rounded-lg border bg-background p-2 shadow-sm text-sm"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        <span className="font-bold">{label}</span>
                        <span className="text-muted-foreground ml-2">
                          {`Jumlah: ${payload[0].value}`}
                        </span>
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
                animationDuration={2000}
                barSize={barHeight - 10}
              >
                {showLabel && <LabelList
                    dataKey="count"
                    position="right"
                    offset={8}
                    isAnimationActive={false}
                    className="font-semibold"
                    fill="hsl(var(--foreground))"
                    fontSize={12}
                />}
                {chartData.map((entry, index) => {
                    let color = defaultColor;
                    if (title === 'Statistik per Bulan') {
                        color = '#FA8072';
                    } else if (title === 'Statistik per Petugas') {
                      const puskeswan = officerToPuskeswanMap[entry.name];
                      if (puskeswan) {
                        color = puskeswanColors[puskeswan] || defaultColor;
                      }
                    } else if (title === 'Statistik per Puskeswan') {
                      color = puskeswanColors[entry.name] || defaultColor;
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

const StatPieChart = ({ title, data, colors, defaultColor }: {
  title: string;
  data: StatItem[];
  colors: { [key: string]: string };
  defaultColor: string;
}) => {
  const isMobile = useIsMobile();
  const total = useMemo(() => data.reduce((sum, item) => sum + item.count, 0), [data]);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-xs font-bold"
        style={{ textShadow: '0px 1px 2px rgba(0, 0, 0, 0.8)' }}
      >
        {value}
      </text>
    );
  };

  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg text-left">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={isMobile ? 60 : 100}
                    innerRadius={isMobile ? 25 : 40}
                    dataKey="count"
                    nameKey="name"
                    animationDuration={1500}
                >
                    <Label
                        value={total}
                        position="center"
                        fill="hsl(var(--foreground))"
                        className="text-xl font-bold"
                        dy={-8}
                    />
                    <Label
                        value="Total"
                        position="center"
                        fill="hsl(var(--muted-foreground))"
                        className="text-xs"
                        dy={12}
                    />
                    {data.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={colors[entry.name] || defaultColor} stroke={'hsl(var(--card))'} strokeWidth={2}/>
                    ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0];
                      const percentage = total > 0 ? (((item.value as number) / total) * 100).toFixed(1) : 0;
                      const name = item.name as string;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm text-sm">
                          <span className="font-bold">{name}: </span>
                          <span className="text-muted-foreground">
                            {`${item.value} (${percentage}%)`}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign={isMobile ? "bottom" : "right"}
                  align={isMobile ? "center" : "left"}
                  layout={isMobile ? 'horizontal' : 'vertical'}
                  wrapperStyle={{
                    fontSize: '12px',
                    paddingLeft: isMobile ? '0' : '20px',
                    color: 'hsl(var(--foreground))'
                  }}
                  iconSize={12}
                  iconType="circle"
                  formatter={(value) => <span style={{color: 'hsl(var(--foreground))'}}>{value}</span>}
                />
            </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};


function StatisticsDisplay({ services }: { services: HealthcareService[] }) {

  if (services.length === 0) {
      return (
        <Card>
            <CardHeader>
                <CardTitle className="text-left">Statistik Belum Tersedia</CardTitle>
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

  return (
    <div className="space-y-6">
        <StatChart 
          title="Statistik per Bulan" 
          data={statsByMonth} 
          officerToPuskeswanMap={officerToPuskeswanMap}
          puskeswanColors={puskeswanColors}
          defaultColor={defaultColor}
        />
        <StatChart 
          title="Statistik per Petugas" 
          data={statsByOfficer} 
          officerToPuskeswanMap={officerToPuskeswanMap}
          puskeswanColors={puskeswanColors}
          defaultColor={defaultColor}
          showAll={true}
        />
        <StatPieChart
          title="Statistik per Puskeswan"
          data={statsByPuskeswan}
          colors={puskeswanColors}
          defaultColor={defaultColor}
        />
        <StatChart 
          title="Statistik per Kasus/Penyakit" 
          data={statsByDiagnosis} 
          officerToPuskeswanMap={officerToPuskeswanMap}
          puskeswanColors={puskeswanColors}
          defaultColor={defaultColor}
          showAll={true}
        />
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
      
      <Card>
        <Tabs defaultValue="tabel" className="w-full">
            <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 md:flex md:justify-end gap-2">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-full">
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
                    <SelectTrigger className="w-full">
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
                    className="w-full col-span-2 md:w-64"
                    />
                </div>
                <div className="pt-4">
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
                </div>
            </CardContent>

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
                <div className="px-6 pb-6">
                    <StatisticsDisplay services={filteredServices} />
                </div>
            </TabsContent>
        </Tabs>
      </Card>
      
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
