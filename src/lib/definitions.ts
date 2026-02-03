
export const puskeswanList = [
  'Puskeswan Budong-Budong',
  'Puskeswan Karossa',
  'Puskeswan Pangale',
  'Puskeswan Tobadak',
  'Puskeswan Topoyo',
];

export const karossaDesaList = [
    "Benggaulu",
    "Kadaila",
    "Karossa",
    "Kayucalla",
    "Kambunong",
    "Lara",
    "Lembah Hopo",
    "Salubiro",
    "Sanjango",
    "Sukamaju",
    "Tasoskko",
    "Mora IV",
    "UPT Lara III",
    "Lainnya",
].sort((a, b) => {
    if (a === "Lainnya") return 1;
    if (b === "Lainnya") return -1;
    return a.localeCompare(b);
});

export const budongBudongDesaList = [
    "Babana",
    "Barakkang",
    "Kire",
    "Lumu",
    "Pasapa",
    "Salumanurung",
    "Tinali",
    "Bojo",
    "Lembah Hada",
    "Salogatta",
    "Potantanakayyang",
    "Lainnya",
].sort((a, b) => {
    if (a === "Lainnya") return 1;
    if (b === "Lainnya") return -1;
    return a.localeCompare(b);
});

export const pangaleDesaList = [
    "Kombiling",
    "Kuo",
    "Lamba-lamba",
    "Lemo-Lemo",
    "Pangale",
    "Polo Camba",
    "Polo Lereng",
    "Polo Pangale",
    "Sartanamaju",
    "Lainnya",
].sort((a, b) => {
    if (a === "Lainnya") return 1;
    if (b === "Lainnya") return -1;
    return a.localeCompare(b);
});

export const tobadakDesaList = [
    "Bambadaru",
    "Batu Parigi",
    "Mahahe",
    "Polongaan",
    "Saluadak",
    "Sejati",
    "Sulobaja",
    "Tobadak",
    "Lainnya",
].sort((a, b) => {
    if (a === "Lainnya") return 1;
    if (b === "Lainnya") return -1;
    return a.localeCompare(b);
});

export const topoyoDesaList = [
    "Bambamanurug",
    "Budong-Budong",
    "Kabubu",
    "Pangalloang",
    "Paraili",
    "Salule'bo",
    "Salupangkang",
    "Salupangkang IV",
    "Sinabatta",
    "Tabolang",
    "Tangkau",
    "Tappilina",
    "Topoyo",
    "Tumbu",
    "Waeputeh",
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
    "Basuki Budianto",
    "Hasaruddin",
    "Nasaruddin",
    "Lainnya",
].sort((a, b) => {
    if (a === "Lainnya") return 1;
    if (b === "Lainnya") return -1;
    return a.localeCompare(b);
});

export const pangaleOfficerList = [
    "Kamarudin",
    "Kamaruddin",
    "drh. Ketut Elok",
    "Mansyur",
    "Jawaril",
    "Sugeng",
    "Lainnya",
].sort((a, b) => {
    if (a === "Lainnya") return 1;
    if (b === "Lainnya") return -1;
    return a.localeCompare(b);
});

export const tobadakOfficerList = [
    "Endang",
    "Jupry",
    "drh. M Ishak",
    "Aser M",
    "Lainnya",
].sort((a, b) => {
    if (a === "Lainnya") return 1;
    if (b === "Lainnya") return -1;
    return a.localeCompare(b);
});

export const topoyoOfficerList = [
    "drh. Iqbal Djamil",
    "Alfons B",
    "Haslim",
    "Fitriani",
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

export const caseStatusOptions = [
  'Sembuh',
  'Tidak Sembuh',
  'Mati',
];

export const priorityOfficerList = [
    'drh. M Ishak',
    'drh. Iqbal Djamil',
    'drh. Stephani',
    'drh. Ketut Elok',
].sort();

export const prioritySyndromeOptions = [
  'Mati Meningkat Pada Unggas',
  'Mati Mendadak',
  'Gila Galak',
  'Demam Pada Babi',
  'Keguguran atau Sendi Bengkak',
  'Pincang AirLiur dan Lepuh',
  'Penyakit Luar Biasa',
  'Keringat Berdarah',
];

export const priorityDiagnosisOptions = [
  'Flu Burung',
  'Rabies',
  'Brucellosis',
  'Penyakit Mulut dan Kuku (PMK)',
  'Jembrana',
  'Lumpy Skin Disease (LSD)',
  'African Swine Fever (ASF)',
  'Anthrax',
].sort();

export const programVaksinasiOptions = [
  'Rabies',
  'PMK (Penyakit Mulut dan Kuku)',
  'ASF (African Swine Fever)',
  'Jembrana',
  'AI (Avian Influenza)',
  'ND (Newcastle Disease)',
  'Lainnya',
];

export const rabiesVaccineList = ['Neo Rabivet', 'Rabisin', 'Lainnya'];
export const pmkVaccineList = ['Aphthovet Pusvetma', 'Lainnya'];
export const jembranaVaccineList = ['JD-Vet', 'Lainnya'];
export const aiVaccineList = ['Medivac AI', 'Lainnya'];
export const ndVaccineList = ['Medivac ND', 'Lainnya'];
export const asfVaccineList = ['Serum ASF', 'Lainnya'];

export const vaccineListMap: Record<string, string[]> = {
  'Rabies': rabiesVaccineList,
  'PMK (Penyakit Mulut dan Kuku)': pmkVaccineList,
  'Jembrana': jembranaVaccineList,
  'AI (Avian Influenza)': aiVaccineList,
  'ND (Newcastle Disease)': ndVaccineList,
  'ASF (African Swine Fever)': asfVaccineList,
};
