
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
    "Desa Kambunong",
    "Desa Lara",
    "Desa Lembah Hopo",
    "Desa Salubiro",
    "Desa Sanjango",
    "Desa Sukamaju",
    "Desa Tasoskko",
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

export const pangaleDesaList = [
    "Desa Kombiling",
    "Desa Kuo",
    "Desa Lamba-lamba",
    "Desa Lemo-Lemo",
    "Desa Pangale",
    "Desa Polo Camba",
    "Desa Polo Lereng",
    "Desa Polo Pangale",
    "Desa Sartanamaju",
    "Lainnya",
].sort((a, b) => {
    if (a === "Lainnya") return 1;
    if (b === "Lainnya") return -1;
    return a.localeCompare(b);
});

export const tobadakDesaList = [
    "Desa Bambadaru",
    "Desa Batu Parigi",
    "Desa Mahahe",
    "Desa Polongaan",
    "Desa Saluadak",
    "Desa Sejati",
    "Desa Sulobaja",
    "Desa Tobadak",
    "Lainnya",
].sort((a, b) => {
    if (a === "Lainnya") return 1;
    if (b === "Lainnya") return -1;
    return a.localeCompare(b);
});

export const topoyoDesaList = [
    "Desa Bambamanurug",
    "Desa Budong-Budong",
    "Desa Kabubu",
    "Desa Pangalloang",
    "Desa Paraili",
    "Desa Salule'bo",
    "Desa Salupangkang",
    "Desa Salupangkang IV",
    "Desa Sinabatta",
    "Desa Tabolang",
    "Desa Tangkau",
    "Desa Tappilina",
    "Desa Topoyo",
    "Desa Tumbu",
    "Desa Waeputeh",
    "Lainnya",
].sort((a, b) => {
    if (a === "Lainnya") return 1;
    if (b === "Lainnya") return -1;
    return a.localeCompare(b);
});

export const budongBudongOfficerList = [
    "Anshari Saleh",
    "Suprapto",
    "Nur Fauzi",
    "Hadi",
    "Rahman",
    "Tadi Sole",
    "Lainnya",
].sort((a, b) => {
    if (a === "Lainnya") return 1;
    if (b === "Lainnya") return -1;
    return a.localeCompare(b);
});

export const karossaOfficerList = [
    "Asari Rasyid",
    "drh. Stephani",
    "Basuki",
    "Hasaruddin",
    "Nasaruddin",
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
