
export const puskeswanList = [
  'Puskeswan Budong-Budong',
  'Puskeswan Karossa',
  'Puskeswan Pangale',
  'Puskeswan Tobadak',
  'Puskeswan Topoyo',
];

export const karossaDesaList = [
    "Desa Benggaulu",
    "Desa Kadaila",
    "Desa Karossa",
    "Desa Kayucalla",
    "Desa Lara",
    "Desa Lembah Hopo",
    "Desa Salubiro",
    "Desa Sanjango",
    "Desa Sukamaju",
    "Desa Tasoskko",
    "Desa Kambunong",
    "Mora IV",
    "UPT Lara III",
    "Lainnya",
].sort((a, b) => {
    if (a === "Lainnya") return 1;
    if (b === "Lainnya") return -1;
    return a.localeCompare(b);
});

export const budongBudongDesaList = [
    "Desa Babana",
    "Desa Barakkang",
    "Desa Kire",
    "Desa Lumu",
    "Desa Pasapa",
    "Desa Salumanurung",
    "Desa Tinali",
    "Desa Bojo",
    "Desa Lembah Hada",
    "Desa Salogatta",
    "Desa Potantanakayyang",
    "Lainnya",
].sort((a, b) => {
    if (a === "Lainnya") return 1;
    if (b === "Lainnya") return -1;
    return a.localeCompare(b);
});

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
  'Lainnya',
];

export const treatmentTypes = [
  'Injeksi',
  'Per Oral',
  'Kutaneus/Topikal',
  'Subkutaneus',
  'Intravena',
  'Intrauteri',
  'Intraanal',
  'Intramamae',
  'Lainnya',
];

export const dosageUnits = [
  'ml',
  'mg',
  'g',
  'Bolus',
  'Kaplet',
  'Lainnya',
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
    'Lainnya',
  ],
  'Anti Radang Analgesia & Piretik': [
    'Dexapros',
    'Glucortin-20',
    'Sulpidon',
    'Sulprodon',
    'Lainnya',
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
    'Lainnya',
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
    'Lainnya',
  ],
  Hormon: ['Capriglandin', 'Intracin', 'Juramate', 'Ovalumon', 'Pgf2@', 'Lainnya'],
  Anastesia: ['Ketamine', 'Lidocain', 'Lainnya'],
  Sedasi: ['Xylazine', 'Lainnya'],
  Antialergi: ['Vetadryl', 'Prodryl', 'Lainnya'],
  Antibloat: ['Antibloat', 'Tympanol', 'Lainnya'],
  'Susu Mineral & As. Amino': [
    'Lactomax',
    'Lactova',
    'Langantor',
    'Maxinos',
    'Mineral Permix',
    'Mineral-10',
    'Pigmix',
    'ProLac',
    'Susu Nutrinos',
    'Ultra Mineral',
    'Lainnya',
  ],
  Lainnya: [],
};

export type MedicineType = keyof typeof medicineData;

export const medicineTypes = Object.keys(medicineData) as MedicineType[];
