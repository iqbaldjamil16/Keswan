
import type { HealthcareService } from './types';

let services: HealthcareService[] = [
  {
    id: '1',
    date: new Date('2024-05-20'),
    officerName: 'Dr. Budi Santoso',
    ownerName: 'Pak Tono',
    ownerAddress: 'Desa Sukamaju RT 01 RW 02',
    caseId: 'ISIKHNAS-2024-001',
    livestockType: 'Sapi',
    livestockCount: 5,
    clinicalSymptoms: 'Nafsu makan menurun, demam',
    diagnosis: 'Demam Tiga Hari (Bovine Ephemeral Fever)',
    handling: 'Pemberian antipiretik dan vitamin',
    treatmentType: 'Injeksi',
    treatment: 'Injeksi Analgin 10ml, Vitamin B-Complex 10ml',
  },
  {
    id: '2',
    date: new Date('2024-05-21'),
    officerName: 'Drh. Siti Aminah',
    ownerName: 'Ibu Wati',
    ownerAddress: 'Dusun Mekarsari Blok C',
    caseId: 'ISIKHNAS-2024-002',
    livestockType: 'Kambing',
    livestockCount: 12,
    clinicalSymptoms: 'Diare, lemas, dehidrasi',
    diagnosis: 'Scouring (Mencret)',
    handling: 'Pemberian antibiotik dan cairan elektrolit',
    treatmentType: 'Oral',
    treatment: 'Sulfa Strong, oralit',
  },
];

let nextId = services.length + 1;

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getServices(): Promise<HealthcareService[]> {
  await delay(50); 
  return services.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function addService(service: Omit<HealthcareService, 'id'>): Promise<HealthcareService> {
  await delay(50);
  const newService: HealthcareService = {
    ...service,
    id: String(nextId++),
  };
  services.unshift(newService);
  return newService;
}
