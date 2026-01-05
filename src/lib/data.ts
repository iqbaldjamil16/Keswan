
'use client';

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  Firestore,
  doc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { getSdks } from '@/firebase';
import type { HealthcareService } from './types';
import { serviceSchema } from './types';

// This function now fetches from Firestore
export async function getServices(): Promise<HealthcareService[]> {
  const { firestore } = getSdks();
  if (!firestore) {
      console.error("Firestore is not initialized.");
      return [];
  }
  const servicesCollection = collection(firestore, 'healthcareServices');
  const q = query(servicesCollection, orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  const services: HealthcareService[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    try {
      const service: HealthcareService = serviceSchema.parse({
        ...data,
        id: doc.id,
        date: (data.date as Timestamp).toDate(),
      });
      services.push(service);
    } catch(e) {
        console.error("Validation error parsing service data:", e)
        // Ignore validation errors for now
    }
  });
  return services;
}

export async function getServiceById(id: string): Promise<HealthcareService | null> {
    const { firestore } = getSdks();
    if (!firestore) {
      console.error("Firestore is not initialized.");
      return null;
    }
    const docRef = doc(firestore, 'healthcareServices', id);
    const docSnap = await getDoc(docRef);
  
    if (docSnap.exists()) {
      const data = docSnap.data();
      const service: HealthcareService = serviceSchema.parse({
        ...data,
        id: docSnap.id,
        date: (data.date as Timestamp).toDate(),
      });
      return service;
    } else {
      return null;
    }
  }

export async function deleteServiceById(serviceId: string): Promise<void> {
    const { firestore } = getSdks();
    if (!firestore) {
      throw new Error("Firestore is not initialized.");
    }
    const serviceDoc = doc(firestore, "healthcareServices", serviceId);
    await deleteDoc(serviceDoc);
  }

// This function now adds to Firestore using a non-blocking update
export async function addService(
  firestore: Firestore,
  service: Omit<HealthcareService, 'id'>
): Promise<void> {
  const validatedService = {
    ...service,
    date: Timestamp.fromDate(service.date),
  };
  const servicesCollection = collection(firestore, 'healthcareServices');
  // Use the non-blocking function to add the document.
  // This handles errors via the global error emitter.
  await addDoc(servicesCollection, validatedService);
}

export const puskeswanList = [
  'Puskeswan Budong-Budong',
  'Puskeswan Karossa',
  'Puskeswan Pangale',
  'Puskeswan Tobadak',
  'Puskeswan Topoyo',
];

export const livestockTypes = [
  'Anjing',
  'Anjing Ras',
  'Ayam Buras',
  'Ayam Domestik',
  'Ayam Petelur',
  'Babi',
  'Burung',
  'Itik',
  'Kambing Jawa Randu',
  'Kambing Kacang',
  'Kambing PE',
  'Kerbau',
  'Kucing Bengal',
  'Kucing British',
  'Kucing Domestik',
  'Kucing Himalaya',
  'Kucing MixDom',
  'Kucing Persia',
  'Kuda',
  'Manila',
  'Sapi Angus',
  'Sapi Bali',
  'Sapi Limosin',
  'Sapi Simental',
];

export const medicineData = {
  Antibiotik: [
    'Colibact Bolus',
    'Duodin',
    'Gusanex',
    'Interflox',
    'Intramox La',
    'Kaloxy La',
    'Limoxin La',
    'Limoxin Spray',
    'Medoxy La',
    'Penstrep',
    'Proxy Vet La',
    'Sulfastrong',
    'Vet Oxy La',
    'Vet oxy sb',
  ],
  'Anti Radang Analgesia & Piretik': [
    'Dexapros',
    'Glucortin-20',
    'Sulpidon',
    'Sulprodon',
  ],
  Vitamin: [
    'B12',
    'B Kompleks',
    'B komp bolus',
    'Biodin',
    'Biopros',
    'Calcidex',
    'Fertilife',
    'Hematodin',
    'Injectamin',
    'Pro B Plek',
    'Vitol',
  ],
  'Anti Helminthiasis & Ektoparasit': [
    'Fluconix',
    'Flukicide',
    'Intermectin',
    'Ivomec',
    'Verm O Bolus',
    'Verm O Kaplet',
    'Verm O Pros Bolus',
    'Wormectin',
    'Wormzole Bolus',
  ],
  Hormon: ['Capriglandin', 'Intracin', 'Juramate', 'Ovalumon', 'Pgf2@'],
  Anastesia: ['Ketamine', 'Lidocain'],
  Sedasi: ['Xylazine'],
  Antialergi: ['Vetadryl', 'Prodryl'],
  Antibloat: [],
  'Susu Mineral & As. Amino': [],
};

export type MedicineType = keyof typeof medicineData;

export const medicineTypes = Object.keys(medicineData) as MedicineType[];
