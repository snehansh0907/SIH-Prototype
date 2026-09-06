export interface VillageOption {
  id: string;
  name: string;
  nameMr?: string;
}

export interface TalukaOption {
  id: string;
  name: string;
  nameMr?: string;
  villages: VillageOption[];
}

export interface DistrictOption {
  id: string;
  name: string;
  nameMr?: string;
  talukas: TalukaOption[];
}

export interface StateOption {
  id: string;
  name: string;
  nameMr?: string;
  districts: DistrictOption[];
}

export const LOCATION_DATA: StateOption[] = [
  {
    id: 'MH',
    name: 'Maharashtra',
    nameMr: 'महाराष्ट्र',
    districts: [
      {
        id: 'nashik',
        name: 'Nashik',
        nameMr: 'नाशिक',
        talukas: [
          {
            id: 'niphad',
            name: 'Niphad',
            nameMr: 'निफाड',
            villages: [
              { id: 'pimpalgaon', name: 'Pimpalgaon Baswant', nameMr: 'पिंपळगाव बसवंत' },
              { id: 'niphad_v', name: 'Niphad', nameMr: 'निफाड' },
              { id: 'ozar', name: 'Ozar', nameMr: 'ओझर' },
              { id: 'saykheda', name: 'Saykheda', nameMr: 'सायखेडा' },
              { id: 'ranwad', name: 'Ranwad', nameMr: 'रानवड' },
              { id: 'kundewadi', name: 'Kundewadi', nameMr: 'कुंदेवाडी' },
              { id: 'chandori', name: 'Chandori', nameMr: 'चांदोरी' },
              { id: 'kasbe_sukene', name: 'Kasbe Sukene', nameMr: 'कसबे सुकेणे' },
              { id: 'vinchur', name: 'Vinchur', nameMr: 'विंचूर' },
              { id: 'lasalgaon', name: 'Lasalgaon', nameMr: 'लासलगाव' },
              { id: 'ugaon', name: 'Ugaon', nameMr: 'उगाव' },
              { id: 'pimplas', name: 'Pimplas', nameMr: 'पिंपळास' },
            ],
          },
          {
            id: 'nashik_t',
            name: 'Nashik',
            nameMr: 'नाशिक',
            villages: [
              { id: 'makhmalabad', name: 'Makhmalabad', nameMr: 'मखमलाबाद' },
              { id: 'adgaon', name: 'Adgaon', nameMr: 'आडगाव' },
              { id: 'gangapur', name: 'Gangapur', nameMr: 'गंगापूर' },
              { id: 'deolali', name: 'Deolali', nameMr: 'देवळाली' },
              { id: 'mhasrul', name: 'Mhasrul', nameMr: 'म्हसरूळ' },
              { id: 'pathardi', name: 'Pathardi', nameMr: 'पाथर्डी' },
              { id: 'girnare', name: 'Girnare', nameMr: 'गिरणारे' },
            ],
          },
          {
            id: 'sinnar',
            name: 'Sinnar',
            nameMr: 'सिन्नर',
            villages: [
              { id: 'sinnar_v', name: 'Sinnar', nameMr: 'सिन्नर' },
              { id: 'wavi', name: 'Wavi', nameMr: 'वावी' },
              { id: 'musalgaon', name: 'Musalgaon', nameMr: 'मुसळगाव' },
              { id: 'dapur', name: 'Dapur', nameMr: 'दापूर' },
              { id: 'naygaon', name: 'Naygaon', nameMr: 'नायगाव' },
              { id: 'pandhurli', name: 'Pandhurli', nameMr: 'पांढुर्ली' },
            ],
          },
          {
            id: 'dindori',
            name: 'Dindori',
            nameMr: 'दिंडोरी',
            villages: [
              { id: 'dindori_v', name: 'Dindori', nameMr: 'दिंडोरी' },
              { id: 'vani', name: 'Vani', nameMr: 'वणी' },
              { id: 'janori', name: 'Janori', nameMr: 'जानोरी' },
              { id: 'mohadi', name: 'Mohadi', nameMr: 'मोहाडी' },
              { id: 'nanashi', name: 'Nanashi', nameMr: 'नानाशी' },
              { id: 'umrale', name: 'Umrale', nameMr: 'उमराळे' },
            ],
          },
          {
            id: 'yeola',
            name: 'Yeola',
            nameMr: 'येवला',
            villages: [
              { id: 'yeola_v', name: 'Yeola', nameMr: 'येवला' },
              { id: 'andarsul', name: 'Andarsul', nameMr: 'अंदरसूल' },
              { id: 'nagarsul', name: 'Nagarsul', nameMr: 'नगरसूल' },
              { id: 'rajaapur', name: 'Rajaapur', nameMr: 'राजापूर' },
              { id: 'savargaon', name: 'Savargaon', nameMr: 'सावरगाव' },
            ],
          },
          {
            id: 'kalwan',
            name: 'Kalwan',
            nameMr: 'कळवण',
            villages: [
              { id: 'kalwan_v', name: 'Kalwan', nameMr: 'कळवण' },
              { id: 'abhona', name: 'Abhona', nameMr: 'अभona' },
              { id: 'manur', name: 'Manur', nameMr: 'मानूर' },
              { id: 'kanashi', name: 'Kanashi', nameMr: 'कणाशी' },
            ],
          },
          {
            id: 'malegaon',
            name: 'Malegaon',
            nameMr: 'मालेगाव',
            villages: [
              { id: 'malegaon_v', name: 'Malegaon', nameMr: 'मालेगाव' },
              { id: 'ravalgaon', name: 'Ravalgaon', nameMr: 'रावळगाव' },
              { id: 'vadner', name: 'Vadner', nameMr: 'वडनेर' },
              { id: 'saundane', name: 'Saundane', nameMr: 'सौंदाणे' },
            ],
          },
        ],
      },
      {
        id: 'pune',
        name: 'Pune',
        nameMr: 'पुणे',
        talukas: [
          {
            id: 'haveli',
            name: 'Haveli',
            nameMr: 'हवेली',
            villages: [
              { id: 'wagholi', name: 'Wagholi', nameMr: 'वाघोली' },
              { id: 'manjari', name: 'Manjari', nameMr: 'मांजरी' },
              { id: 'loni_kalbhor', name: 'Loni Kalbhor', nameMr: 'लोणी काळभोर' },
              { id: 'uruli_kanchan', name: 'Uruli Kanchan', nameMr: 'उरुळी कांचन' },
            ],
          },
          {
            id: 'junnar',
            name: 'Junnar',
            nameMr: 'जुन्नर',
            villages: [
              { id: 'junnar_v', name: 'Junnar', nameMr: 'जुन्नर' },
              { id: 'narayangaon', name: 'Narayangaon', nameMr: 'नारायणगाव' },
              { id: 'otur', name: 'Otur', nameMr: 'ओतूर' },
              { id: 'alephata', name: 'Alephata', nameMr: 'आळेफाटा' },
            ],
          },
          {
            id: 'shirur',
            name: 'Shirur',
            nameMr: 'शिरूर',
            villages: [
              { id: 'shirur_v', name: 'Shirur', nameMr: 'शिरूर' },
              { id: 'shikrapur', name: 'Shikrapur', nameMr: 'शिक्रापूर' },
              { id: 'sanaswadi', name: 'Sanaswadi', nameMr: 'सणसवाडी' },
            ],
          },
          {
            id: 'baramati',
            name: 'Baramati',
            nameMr: 'बारामती',
            villages: [
              { id: 'baramati_v', name: 'Baramati', nameMr: 'बारामती' },
              { id: 'malegaon_bk', name: 'Malegaon', nameMr: 'माळेगाव' },
              { id: 'supa', name: 'Supa', nameMr: 'सुपा' },
              { id: 'someshwar', name: 'Someshwar', nameMr: 'सोमेश्वर' },
            ],
          },
          {
            id: 'khed',
            name: 'Khed',
            nameMr: 'खेड',
            villages: [
              { id: 'chakan', name: 'Chakan', nameMr: 'चाकण' },
              { id: 'rajgurunagar', name: 'Rajgurunagar', nameMr: 'राजगुरुनगर' },
              { id: 'alandi', name: 'Alandi', nameMr: 'आळंदी' },
            ],
          },
        ],
      },
      {
        id: 'ahmednagar',
        name: 'Ahmednagar',
        nameMr: 'अहिल्यानगर (अहमदनगर)',
        talukas: [
          {
            id: 'sangamner',
            name: 'Sangamner',
            nameMr: 'संगमनेर',
            villages: [
              { id: 'sangamner_v', name: 'Sangamner', nameMr: 'संगमनेर' },
              { id: 'ashwi', name: 'Ashwi', nameMr: 'अश्वी' },
              { id: 'talegaon_s', name: 'Talegaon', nameMr: 'तळेगाव' },
              { id: 'sakur', name: 'Sakur', nameMr: 'साकूर' },
            ],
          },
          {
            id: 'rahata',
            name: 'Rahata',
            nameMr: 'राहाता',
            villages: [
              { id: 'rahata_v', name: 'Rahata', nameMr: 'राहाता' },
              { id: 'shirdi', name: 'Shirdi', nameMr: 'शिर्डी' },
              { id: 'babhaleshwar', name: 'Babhaleshwar', nameMr: 'बाभळेश्वर' },
              { id: 'loni', name: 'Loni', nameMr: 'लोणी' },
            ],
          },
          {
            id: 'kopargaon',
            name: 'Kopargaon',
            nameMr: 'कोपरगाव',
            villages: [
              { id: 'kopargaon_v', name: 'Kopargaon', nameMr: 'कोपरगाव' },
              { id: 'pohegaon', name: 'Pohegaon', nameMr: 'पोहेगाव' },
              { id: 'suregaon', name: 'Suregaon', nameMr: 'सुरेगाव' },
            ],
          },
          {
            id: 'shrirampur',
            name: 'Shrirampur',
            nameMr: 'श्रीरामपूर',
            villages: [
              { id: 'shrirampur_v', name: 'Shrirampur', nameMr: 'श्रीरामपूर' },
              { id: 'belapur', name: 'Belapur', nameMr: 'बेलापूर' },
              { id: 'taklibhan', name: 'Taklibhan', nameMr: 'टाकळीभान' },
            ],
          },
          {
            id: 'newasa',
            name: 'Newasa',
            nameMr: 'नेवासा',
            villages: [
              { id: 'newasa_v', name: 'Newasa', nameMr: 'नेवासा' },
              { id: 'sonai', name: 'Sonai', nameMr: 'सोनई' },
              { id: 'kukana', name: 'Kukana', nameMr: 'कुकणा' },
            ],
          },
        ],
      },
      {
        id: 'chhatrapati_sambhajinagar',
        name: 'Chhatrapati Sambhajinagar',
        nameMr: 'छत्रपती संभाजीनगर',
        talukas: [
          {
            id: 'aurangabad',
            name: 'Sambhajinagar',
            nameMr: 'संभाजीनगर',
            villages: [
              { id: 'chikalthana', name: 'Chikalthana', nameMr: 'चिकलठाणा' },
              { id: 'waluj', name: 'Waluj', nameMr: 'वाळूज' },
              { id: 'harsul', name: 'Harsul', nameMr: 'हर्सूल' },
            ],
          },
          {
            id: 'paithan',
            name: 'Paithan',
            nameMr: 'पैठण',
            villages: [
              { id: 'paithan_v', name: 'Paithan', nameMr: 'पैठण' },
              { id: 'pachod', name: 'Pachod', nameMr: 'पाचोड' },
              { id: 'bidkin', name: 'Bidkin', nameMr: 'बिडकीन' },
            ],
          },
          {
            id: 'gangapur_cs',
            name: 'Gangapur',
            nameMr: 'गंगापूर',
            villages: [
              { id: 'gangapur_v', name: 'Gangapur', nameMr: 'गंगापूर' },
              { id: 'lasur', name: 'Lasur', nameMr: 'लासूर' },
            ],
          },
          {
            id: 'vaijapur',
            name: 'Vaijapur',
            nameMr: 'वैजापूर',
            villages: [
              { id: 'vaijapur_v', name: 'Vaijapur', nameMr: 'वैजापूर' },
              { id: 'shiur', name: 'Shiur', nameMr: 'शिऊर' },
            ],
          },
        ],
      },
      {
        id: 'solapur',
        name: 'Solapur',
        nameMr: 'सोलापूर',
        talukas: [
          {
            id: 'pandharpur',
            name: 'Pandharpur',
            nameMr: 'पंढरपूर',
            villages: [
              { id: 'pandharpur_v', name: 'Pandharpur', nameMr: 'पंढरपूर' },
              { id: 'bhalwani', name: 'Bhalwani', nameMr: 'भालवणी' },
              { id: 'kasegaon', name: 'Kasegaon', nameMr: 'कासेगाव' },
            ],
          },
          {
            id: 'barshi',
            name: 'Barshi',
            nameMr: 'बार्शी',
            villages: [
              { id: 'barshi_v', name: 'Barshi', nameMr: 'बार्शी' },
              { id: 'vairag', name: 'Vairag', nameMr: 'वैराग' },
              { id: 'pangri', name: 'Pangri', nameMr: 'पांगरी' },
            ],
          },
          {
            id: 'malshiras',
            name: 'Malshiras',
            nameMr: 'माळशिरस',
            villages: [
              { id: 'akluj', name: 'Akluj', nameMr: 'अकलूज' },
              { id: 'natepute', name: 'Natepute', nameMr: 'नातेपुते' },
              { id: 'velapur', name: 'Velapur', nameMr: 'वेळापूर' },
            ],
          },
        ],
      },
      {
        id: 'nagpur',
        name: 'Nagpur',
        nameMr: 'नागपूर',
        talukas: [
          {
            id: 'nagpur_rural',
            name: 'Nagpur Rural',
            nameMr: 'नागपूर ग्रामीण',
            villages: [
              { id: 'hingna', name: 'Hingna', nameMr: 'हिंगणा' },
              { id: 'wadi', name: 'Wadi', nameMr: 'वाडी' },
              { id: 'besa', name: 'Besa', nameMr: 'बेसा' },
              { id: 'butibori', name: 'Butibori', nameMr: 'बुटीबोरी' },
            ],
          },
          {
            id: 'saoner',
            name: 'Saoner',
            nameMr: 'सावनेर',
            villages: [
              { id: 'saoner_v', name: 'Saoner', nameMr: 'सावनेर' },
              { id: 'kelod', name: 'Kelod', nameMr: 'केळोद' },
              { id: 'khapa', name: 'Khapa', nameMr: 'खापा' },
            ],
          },
          {
            id: 'katol',
            name: 'Katol',
            nameMr: 'काटोल',
            villages: [
              { id: 'katol_v', name: 'Katol', nameMr: 'काटोल' },
              { id: 'kondhali', name: 'Kondhali', nameMr: 'कोंढाळी' },
              { id: 'paradsinga', name: 'Paradsinga', nameMr: 'पारडसिंगा' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'GJ',
    name: 'Gujarat',
    nameMr: 'गुजरात',
    districts: [
      {
        id: 'surat',
        name: 'Surat',
        nameMr: 'सुरत',
        talukas: [
          {
            id: 'olpad',
            name: 'Olpad',
            nameMr: 'ओलपाड',
            villages: [
              { id: 'olpad_v', name: 'Olpad', nameMr: 'ओलपाड' },
              { id: 'sayan', name: 'Sayan', nameMr: 'सायण' },
            ],
          },
          {
            id: 'bardoli',
            name: 'Bardoli',
            nameMr: 'बारडोली',
            villages: [
              { id: 'bardoli_v', name: 'Bardoli', nameMr: 'बारडोली' },
              { id: 'baben', name: 'Baben', nameMr: 'बाबेन' },
            ],
          },
        ],
      },
      {
        id: 'anand',
        name: 'Anand',
        nameMr: 'आणंद',
        talukas: [
          {
            id: 'anand_t',
            name: 'Anand',
            nameMr: 'आणंद',
            villages: [
              { id: 'anand_v', name: 'Anand', nameMr: 'आणंद' },
              { id: 'mogar', name: 'Mogar', nameMr: 'मोगर' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'MP',
    name: 'Madhya Pradesh',
    nameMr: 'मध्य प्रदेश',
    districts: [
      {
        id: 'indore',
        name: 'Indore',
        nameMr: 'इंदूर',
        talukas: [
          {
            id: 'sanwer',
            name: 'Sanwer',
            nameMr: 'सांवेर',
            villages: [
              { id: 'sanwer_v', name: 'Sanwer', nameMr: 'सांवेर' },
              { id: 'chandravatiganj', name: 'Chandravatiganj', nameMr: 'चंद्रावतीगंज' },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'KA',
    name: 'Karnataka',
    nameMr: 'कर्नाटक',
    districts: [
      {
        id: 'belagavi',
        name: 'Belagavi',
        nameMr: 'बेळगाव',
        talukas: [
          {
            id: 'chikodi',
            name: 'Chikodi',
            nameMr: 'चिकोडी',
            villages: [
              { id: 'chikodi_v', name: 'Chikodi', nameMr: 'चिकोडी' },
              { id: 'nipani', name: 'Nipani', nameMr: 'निपाणी' },
            ],
          },
        ],
      },
    ],
  },
];

export function getStates(): StateOption[] {
  return LOCATION_DATA;
}

export function getDistricts(stateName: string): DistrictOption[] {
  const match = LOCATION_DATA.find(
    (s) => s.name.toLowerCase() === stateName.trim().toLowerCase() || s.id.toLowerCase() === stateName.trim().toLowerCase()
  );
  return match ? match.districts : [];
}

export function getTalukas(stateName: string, districtName: string): TalukaOption[] {
  const districts = getDistricts(stateName);
  const match = districts.find(
    (d) => d.name.toLowerCase() === districtName.trim().toLowerCase() || d.id.toLowerCase() === districtName.trim().toLowerCase()
  );
  return match ? match.talukas : [];
}

export function getVillages(stateName: string, districtName: string, talukaName: string): VillageOption[] {
  const talukas = getTalukas(stateName, districtName);
  const match = talukas.find(
    (t) => t.name.toLowerCase() === talukaName.trim().toLowerCase() || t.id.toLowerCase() === talukaName.trim().toLowerCase()
  );
  return match ? match.villages : [];
}
