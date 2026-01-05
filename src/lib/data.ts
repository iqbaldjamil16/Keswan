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
    medicineType: 'Vitamin',
    medicineName: 'Injectamin',
    dosage: '10ml',
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
    medicineType: 'Antibiotik',
    medicineName: 'Sulfastrong',
    dosage: 'Sesuai anjuran',
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

export const medicineData = {
  "Antibiotik": ["Colibact Bolus", "Duodin", "Gusanex", "Interflox", "Intramox La", "Kaloxy La", "Limoxin La", "Limoxin Spray", "Medoxy La", "Penstrep", "Proxy Vet La", "Sulfastrong", "Vet Oxy La", "Vet oxy sb"],
  "Anti Radang Analgesia & Piretik": ["Dexapros", "Glucortin-20", "Sulpidon", "Sulprodon"],
  "Vitamin": ["B12", "B Kompleks", "B komp bolus", "Biodin", "Biopros", "Calcidex", "Fertilife", "Hematodin", "Injectamin", "Pro B Plek", "Vitol"],
  "Anti Helminthiasis & Ektoparasit": ["Fluconix", "Flukicide", "Intermectin", "Ivomec", "Verm O Bolus", "Verm O Kaplet", "Verm O Pros Bolus", "Wormectin", "Wormzole Bolus"],
  "Hormon": ["Capriglandin", "Intracin", "Juramate", "Ovalumon", "Pgf2@"],
  "Anastesia": ["Ketamine", "Lidocain"],
  "Sedasi": ["Xylazine"],
  "Antialergi": ["Vetadryl", "Prodryl"],
  "Antibloat": [],
  "Susu Mineral & As. Amino": [],
};

export type MedicineType = keyof typeof medicineData;

export const medicineTypes = Object.keys(medicineData) as MedicineType[];