'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { HealthcareService } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { Label } from './ui/label';

// Expected column names in the Excel file.
const columnMapping: { [key: string]: string } = {
  'Tanggal Pelayanan': 'date',
  'Puskeswan': 'puskeswan',
  'Nama Petugas': 'officerName',
  'Nama Pemilik': 'ownerName',
  'Alamat Pemilik': 'ownerAddress',
  'NIK KTP': 'nik',
  'No. Hp': 'phoneNumber',
  'Program Vaksinasi': 'programVaksinasi',
  'Jenis Vaksin': 'vaccinations.0.jenisVaksin',
  'Jenis Ternak': 'vaccinations.0.jenisTernak',
  'Jumlah Ternak': 'vaccinations.0.jumlahTernak',
};

export function FileImporter() {
  const { setValue } = useFormContext<HealthcareService>();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.includes('spreadsheetml') && !file.type.includes('excel')) {
        toast({
            variant: 'destructive',
            title: 'File Tidak Didukung',
            description: 'Saat ini hanya file Excel (.xlsx, .xls) yang didukung.',
        });
        if (event.target) event.target.value = '';
        return;
    }

    setIsLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      if (json.length < 1) {
          throw new Error("File Excel kosong atau tidak memiliki data.");
      }

      const dataRow: any = json[0];
      
      const parsedData: { [key: string]: any } = {};
      for (const excelHeader in dataRow) {
          const lowerExcelHeader = excelHeader.toLowerCase();
          const mappedKey = Object.keys(columnMapping).find(key => key.toLowerCase() === lowerExcelHeader);
          if (mappedKey) {
            const formKey = columnMapping[mappedKey];
            parsedData[formKey] = dataRow[excelHeader];
          }
      }
      
      Object.entries(parsedData).forEach(([key, value]) => {
        if (key === 'date') {
            let dateValue: Date;
            if (typeof value === 'number') {
                dateValue = new Date((value - 25569) * 86400 * 1000);
            } else if (typeof value === 'string') {
                dateValue = new Date(value);
            } else {
                return;
            }
             if (!isNaN(dateValue.getTime())) {
                setValue('date', dateValue);
            }
        } else if (!key.startsWith('vaccinations.')) {
          setValue(key as keyof HealthcareService, value ? String(value) : '');
        }
      });

      const vaxData = {
          jenisVaksin: parsedData['vaccinations.0.jenisVaksin'] || '',
          jenisTernak: parsedData['vaccinations.0.jenisTernak'] || '',
          jumlahTernak: Number(parsedData['vaccinations.0.jumlahTernak']) || 1,
      }
      
      if (vaxData.jenisVaksin || vaxData.jenisTernak) {
        setValue('vaccinations', [vaxData]);
      } else {
        setValue('vaccinations', [{ jenisVaksin: '', jenisTernak: '', jumlahTernak: 1 }]);
      }


      toast({
        title: 'Impor Berhasil',
        description: 'Data dari file Excel telah dimuat ke dalam formulir.',
      });

    } catch (error) {
      console.error('Gagal memproses file:', error);
      toast({
        variant: 'destructive',
        title: 'Impor Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat memproses file.',
      });
    } finally {
      setIsLoading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">Impor dari File</Label>
      <div className="flex items-center gap-2">
        <Input
          id="file-upload"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          disabled={isLoading}
          className="file:text-primary file:font-semibold file:cursor-pointer cursor-pointer"
        />
        {isLoading && <Loader2 className="h-6 w-6 animate-spin" />}
      </div>
      <p className="text-xs text-muted-foreground">
        Unggah file Excel untuk mengisi formulir secara otomatis. Fitur untuk PDF dan Doc akan segera hadir.
      </p>
    </div>
  );
}
