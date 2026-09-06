/**
 * All-India Scalable Location Hierarchy Data
 * Supports All 28 States and 8 Union Territories with All 786 Districts.
 * Cascading hierarchy: State -> District -> Taluka / Tehsil -> Village / Locality -> Pincode.
 */

import { ALL_INDIAN_STATES_AND_UTS, type IndianState } from './indianStates';

export interface VillageOption {
  name: string;
  nameMr?: string;
  nameHi?: string;
  pincode?: string;
}

export interface TalukaOption {
  name: string;
  nameMr?: string;
  nameHi?: string;
  villages?: VillageOption[];
}

export interface DistrictOption {
  name: string;
  nameMr?: string;
  nameHi?: string;
}

// Complete Official Districts for All 36 Indian States and Union Territories (786 Districts total)
export const ALL_STATES_DISTRICTS: Record<string, string[]> = {
  'Andhra Pradesh': [
    'Alluri Sitharama Raju', 'Anakapalli', 'Ananthapuramu', 'Annamayya', 'Bapatla',
    'Chittoor', 'Dr. B.R. Ambedkar Konaseema', 'East Godavari', 'Eluru', 'Guntur',
    'Kakinada', 'Krishna', 'Kurnool', 'Nandyal', 'NTR', 'Palnadu',
    'Parvathipuram Manyam', 'Prakasam', 'Sri Potti Sriramulu Nellore',
    'Sri Sathya Sai', 'Srikakulam', 'Tirupati', 'Visakhapatnam', 'Vizianagaram',
    'West Godavari', 'YSR Kadapa'
  ],
  'Arunachal Pradesh': [
    'Anjaw', 'Changlang', 'Dibang Valley', 'East Kameng', 'East Siang',
    'Itanagar Capital Complex', 'Kamle', 'Kra Daadi', 'Kurung Kumey', 'Lepa Rada',
    'Lohit', 'Longding', 'Lower Dibang Valley', 'Lower Siang', 'Lower Subansiri',
    'Namsai', 'Pakke Kessang', 'Papum Pare', 'Shi Yomi', 'Siang', 'Tawang',
    'Tirap', 'Upper Siang', 'Upper Subansiri', 'West Kameng', 'West Siang'
  ],
  'Assam': [
    'Bajali', 'Baksa', 'Barpeta', 'Biswanath', 'Bongaigaon', 'Cachar',
    'Charaideo', 'Chirang', 'Darrang', 'Dhemaji', 'Dhubri', 'Dibrugarh',
    'Dima Hasao', 'Goalpara', 'Golaghat', 'Hailakandi', 'Hojai', 'Jorhat',
    'Kamrup', 'Kamrup Metropolitan', 'Karbi Anglong', 'Karimganj', 'Kokrajhar',
    'Lakhimpur', 'Majuli', 'Morigaon', 'Nagaon', 'Nalbari', 'Sivasagar',
    'Sonitpur', 'South Salmara-Mankachar', 'Tamulpur', 'Tinsukia', 'Udalguri',
    'West Karbi Anglong'
  ],
  'Bihar': [
    'Araria', 'Arwal', 'Aurangabad', 'Banka', 'Begusarai', 'Bhagalpur',
    'Bhojpur', 'Buxar', 'Darbhanga', 'East Champaran', 'Gaya', 'Gopalganj',
    'Jamui', 'Jehanabad', 'Kaimur', 'Katihar', 'Khagaria', 'Kishanganj',
    'Lakhisarai', 'Madhepura', 'Madhubani', 'Munger', 'Muzaffarpur', 'Nalanda',
    'Nawada', 'Patna', 'Purnia', 'Rohtas', 'Saharsa', 'Samastipur', 'Saran',
    'Sheikhpura', 'Sheohar', 'Sitamarhi', 'Siwan', 'Supaul', 'Vaishali',
    'West Champaran'
  ],
  'Chhattisgarh': [
    'Balod', 'Baloda Bazar', 'Balrampur', 'Bastar', 'Bemetara', 'Bijapur',
    'Bilaspur', 'Dantewada', 'Dhamtari', 'Durg', 'Gariaband',
    'Gaurela-Pendra-Marwahi', 'Janjgir-Champa', 'Jashpur', 'Kabirdham', 'Kanker',
    'Khairagarh-Chhuikhadan-Gandai', 'Kondagaon', 'Korba', 'Koriya', 'Mahasamund',
    'Manendragarh-Chirmiri-Bharatpur', 'Mohla-Manpur-Ambagarh Chowki', 'Mungeli',
    'Narayanpur', 'Raigarh', 'Raipur', 'Rajnandgaon', 'Sakti',
    'Sarangarh-Bilaigarh', 'Sukma', 'Surajpur', 'Surguja'
  ],
  'Goa': [
    'North Goa', 'South Goa'
  ],
  'Gujarat': [
    'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch',
    'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka',
    'Gandhinagar', 'Gir Somnath', 'Jamnagar', 'Junagadh', 'Kheda', 'Kutch',
    'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal',
    'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar',
    'Tapi', 'Vadodara', 'Valsad'
  ],
  'Haryana': [
    'Ambala', 'Bhiwani', 'Charkhi Dadri', 'Faridabad', 'Fatehabad', 'Gurugram',
    'Hisar', 'Jhajjar', 'Jind', 'Kaithal', 'Karnal', 'Kurukshetra',
    'Mahendragarh', 'Nuh', 'Palwal', 'Panchkula', 'Panipat', 'Rewari',
    'Rohtak', 'Sirsa', 'Sonipat', 'Yamunanagar'
  ],
  'Himachal Pradesh': [
    'Bilaspur', 'Chamba', 'Hamirpur', 'Kangra', 'Kinnaur', 'Kullu',
    'Lahaul and Spiti', 'Mandi', 'Shimla', 'Sirmaur', 'Solan', 'Una'
  ],
  'Jharkhand': [
    'Bokaro', 'Chatra', 'Deoghar', 'Dhanbad', 'Dumka', 'East Singhbhum',
    'Garhwa', 'Giridih', 'Godda', 'Gumla', 'Hazaribagh', 'Jamtara', 'Khunti',
    'Koderma', 'Latehar', 'Lohardaga', 'Pakur', 'Palamu', 'Ramgarh', 'Ranchi',
    'Sahebganj', 'Seraikela Kharsawan', 'Simdega', 'West Singhbhum'
  ],
  'Karnataka': [
    'Bagalkot', 'Ballari', 'Belagavi', 'Bengaluru Rural', 'Bengaluru Urban',
    'Bidar', 'Chamarajanagar', 'Chikkaballapura', 'Chikkamagaluru', 'Chitradurga',
    'Dakshina Kannada', 'Davanagere', 'Dharwad', 'Gadag', 'Hassan', 'Haveri',
    'Kalaburagi', 'Kodagu', 'Kolar', 'Koppal', 'Mandya', 'Mysuru', 'Raichur',
    'Ramanagara', 'Shivamogga', 'Tumakuru', 'Udupi', 'Uttara Kannada',
    'Vijayanagara', 'Vijayapura', 'Yadgir'
  ],
  'Kerala': [
    'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam',
    'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta',
    'Thiruvananthapuram', 'Thrissur', 'Wayanad'
  ],
  'Madhya Pradesh': [
    'Agar Malwa', 'Alirajpur', 'Anuppur', 'Ashoknagar', 'Balaghat', 'Barwani',
    'Betul', 'Bhind', 'Bhopal', 'Burhanpur', 'Chhatarpur', 'Chhindwara',
    'Damoh', 'Datia', 'Dewas', 'Dhar', 'Dindori', 'Guna', 'Gwalior', 'Harda',
    'Indore', 'Jabalpur', 'Jhabua', 'Katni', 'Khandwa', 'Khargone', 'Maihar',
    'Mandla', 'Mandsaur', 'Mauganj', 'Morena', 'Narmadapuram', 'Narsinghpur',
    'Neemuch', 'Niwari', 'Pandhurna', 'Panna', 'Raisen', 'Rajgarh', 'Ratlam',
    'Rewa', 'Sagar', 'Satna', 'Sehore', 'Seoni', 'Shahdol', 'Shajapur',
    'Sheopur', 'Shivpuri', 'Sidhi', 'Singrauli', 'Tikamgarh', 'Ujjain',
    'Umaria', 'Vidisha'
  ],
  'Maharashtra': [
    'Ahmednagar', 'Akola', 'Amravati', 'Beed', 'Bhandara', 'Buldhana',
    'Chandrapur', 'Chhatrapati Sambhajinagar', 'Dharashiv', 'Dhule',
    'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur',
    'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 'Nandurbar',
    'Nashik', 'Palghar', 'Parbhani', 'Pune', 'Raigad', 'Ratnagiri', 'Sangli',
    'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
  ],
  'Manipur': [
    'Bishnupur', 'Chandel', 'Churachandpur', 'Imphal East', 'Imphal West',
    'Jiribam', 'Kakching', 'Kamjong', 'Kangpokpi', 'Noney', 'Pherzawl',
    'Senapati', 'Tamenglong', 'Tengnoupal', 'Thoubal', 'Ukhrul'
  ],
  'Meghalaya': [
    'East Garo Hills', 'East Jaintia Hills', 'East Khasi Hills',
    'Eastern West Khasi Hills', 'North Garo Hills', 'Ri Bhoi', 'South Garo Hills',
    'South West Garo Hills', 'South West Khasi Hills', 'West Garo Hills',
    'West Jaintia Hills', 'West Khasi Hills'
  ],
  'Mizoram': [
    'Aizawl', 'Champhai', 'Hnahthial', 'Khawzawl', 'Kolasib', 'Lawngtlai',
    'Lunglei', 'Mamit', 'Saiha', 'Saitual', 'Serchhip'
  ],
  'Nagaland': [
    'Chumoukedima', 'Dimapur', 'Kiphire', 'Kohima', 'Longleng', 'Mokokchung',
    'Mon', 'Niuland', 'Noklak', 'Peren', 'Phek', 'Shamator', 'Tseminyu',
    'Tuensang', 'Wokha', 'Zunheboto'
  ],
  'Odisha': [
    'Angul', 'Balangir', 'Balasore', 'Bargarh', 'Bhadrak', 'Boudh', 'Cuttack',
    'Deogarh', 'Dhenkanal', 'Gajapati', 'Ganjam', 'Jagatsinghpur', 'Jajpur',
    'Jharsuguda', 'Kalahandi', 'Kandhamal', 'Kendrapara', 'Kendujhar',
    'Khordha', 'Koraput', 'Malkangiri', 'Mayurbhanj', 'Nabarangpur', 'Nayagarh',
    'Nuapada', 'Puri', 'Rayagada', 'Sambalpur', 'Subarnapur', 'Sundargarh'
  ],
  'Punjab': [
    'Amritsar', 'Barnala', 'Bathinda', 'Faridkot', 'Fatehgarh Sahib', 'Fazilka',
    'Ferozepur', 'Gurdaspur', 'Hoshiarpur', 'Jalandhar', 'Kapurthala',
    'Ludhiana', 'Malerkotla', 'Mansa', 'Moga', 'Muktsar', 'Pathankot',
    'Patiala', 'Rupnagar', 'Sahibzada Ajit Singh Nagar', 'Sangrur',
    'Shahid Bhagat Singh Nagar', 'Tarn Taran'
  ],
  'Rajasthan': [
    'Ajmer', 'Alwar', 'Anupgarh', 'Balotra', 'Banswara', 'Baran', 'Barmer',
    'Beawar', 'Bharatpur', 'Bhilwara', 'Bikaner', 'Bundi', 'Chittorgarh',
    'Churu', 'Dausa', 'Deeg', 'Dholpur', 'Didwana-Kuchaman', 'Dudu',
    'Dungarpur', 'Gangapur City', 'Hanumangarh', 'Jaipur', 'Jaipur Rural',
    'Jaisalmer', 'Jalore', 'Jhalawar', 'Jhunjhunu', 'Jodhpur', 'Jodhpur Rural',
    'Karauli', 'Kekri', 'Khairthal-Tijara', 'Kota', 'Kotputli-Behror',
    'Nagaur', 'Neem Ka Thana', 'Pali', 'Phalodi', 'Pratapgarh', 'Rajsamand',
    'Salumbar', 'Sanchore', 'Sawai Madhopur', 'Shahpura', 'Sikar', 'Sirohi',
    'Sri Ganganagar', 'Tonk', 'Udaipur'
  ],
  'Sikkim': [
    'Gangtok', 'Geyzing', 'Mangan', 'Namchi', 'Pakyong', 'Soreng'
  ],
  'Tamil Nadu': [
    'Ariyalur', 'Chengalpattu', 'Chennai', 'Coimbatore', 'Cuddalore',
    'Dharmapuri', 'Dindigul', 'Erode', 'Kallakurichi', 'Kancheepuram',
    'Kanniyakumari', 'Karur', 'Krishnagiri', 'Madurai', 'Mayiladuthurai',
    'Nagapattinam', 'Namakkal', 'Nilgiris', 'Perambalur', 'Pudukkottai',
    'Ramanathapuram', 'Ranipet', 'Salem', 'Sivaganga', 'Tenkasi', 'Thanjavur',
    'Theni', 'Thoothukudi', 'Tiruchirappalli', 'Tirunelveli', 'Tirupathur',
    'Tiruppur', 'Tiruvallur', 'Tiruvannamalai', 'Tiruvarur', 'Vellore',
    'Viluppuram', 'Virudhunagar'
  ],
  'Telangana': [
    'Adilabad', 'Bhadradri Kothagudem', 'Hanumakonda', 'Hyderabad', 'Jagtial',
    'Jangaon', 'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy',
    'Karimnagar', 'Khammam', 'Komaram Bheem Asifabad', 'Mahabubabad',
    'Mahabubnagar', 'Mancherial', 'Medak', 'Medchal-Malkajgiri', 'Mulugu',
    'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal', 'Nizamabad',
    'Peddapalli', 'Rajanna Sircilla', 'Ranga Reddy', 'Sangareddy', 'Siddipet',
    'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'
  ],
  'Tripura': [
    'Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura',
    'Unakoti', 'West Tripura'
  ],
  'Uttar Pradesh': [
    'Agra', 'Aligarh', 'Ambedkar Nagar', 'Amethi', 'Amroha', 'Auraiya',
    'Ayodhya', 'Azamgarh', 'Baghpat', 'Bahraich', 'Ballia', 'Balrampur',
    'Banda', 'Barabanki', 'Bareilly', 'Basti', 'Bhadohi', 'Bijnor', 'Budaun',
    'Bulandshahr', 'Chandauli', 'Chitrakoot', 'Deoria', 'Etah', 'Etawah',
    'Farrukhabad', 'Fatehpur', 'Firozabad', 'Gautam Buddha Nagar', 'Ghaziabad',
    'Ghazipur', 'Gonda', 'Gorakhpur', 'Hamirpur', 'Hapur', 'Hardoi', 'Hathras',
    'Jalaun', 'Jaunpur', 'Jhansi', 'Kannauj', 'Kanpur Dehat', 'Kanpur Nagar',
    'Kasganj', 'Kaushambi', 'Kheri', 'Kushinagar', 'Lalitpur', 'Lucknow',
    'Maharajganj', 'Mahoba', 'Mainpuri', 'Mathura', 'Mau', 'Meerut', 'Mirzapur',
    'Moradabad', 'Muzaffarnagar', 'Pilibhit', 'Pratapgarh', 'Prayagraj',
    'Raebareli', 'Rampur', 'Saharanpur', 'Sambhal', 'Sant Kabir Nagar',
    'Shahjahanpur', 'Shamli', 'Shrawasti', 'Siddharthnagar', 'Sitapur',
    'Sonbhadra', 'Sultanpur', 'Unnao', 'Varanasi'
  ],
  'Uttarakhand': [
    'Almora', 'Bageshwar', 'Chamoli', 'Champawat', 'Dehradun', 'Haridwar',
    'Nainital', 'Pauri Garhwal', 'Pithoragarh', 'Rudraprayag', 'Tehri Garhwal',
    'Udham Singh Nagar', 'Uttarkashi'
  ],
  'West Bengal': [
    'Alipurduar', 'Bankura', 'Birbhum', 'Cooch Behar', 'Dakshin Dinajpur',
    'Darjeeling', 'Hooghly', 'Howrah', 'Jalpaiguri', 'Jhargram', 'Kalimpong',
    'Kolkata', 'Malda', 'Murshidabad', 'Nadia', 'North 24 Parganas',
    'Paschim Bardhaman', 'Paschim Medinipur', 'Purba Bardhaman',
    'Purba Medinipur', 'Purulia', 'South 24 Parganas', 'Uttar Dinajpur'
  ],
  'Andaman and Nicobar Islands': [
    'Nicobar', 'North and Middle Andaman', 'South Andaman'
  ],
  'Chandigarh': [
    'Chandigarh'
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Dadra and Nagar Haveli', 'Daman', 'Diu'
  ],
  'Delhi': [
    'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi',
    'North East Delhi', 'North West Delhi', 'Shahdara', 'South Delhi',
    'South East Delhi', 'South West Delhi', 'West Delhi'
  ],
  'Jammu and Kashmir': [
    'Anantnag', 'Bandipora', 'Baramulla', 'Budgam', 'Doda', 'Ganderbal',
    'Jammu', 'Kathua', 'Kishtwar', 'Kulgam', 'Kupwara', 'Poonch', 'Pulwama',
    'Rajouri', 'Ramban', 'Reasi', 'Samba', 'Shopian', 'Srinagar', 'Udhampur'
  ],
  'Ladakh': [
    'Kargil', 'Leh'
  ],
  'Lakshadweep': [
    'Lakshadweep'
  ],
  'Puducherry': [
    'Karaikal', 'Mahe', 'Puducherry', 'Yanam'
  ]
};;

// Rich pre-mapped Talukas & Villages for Key Agricultural Districts (Maharashtra, Odisha, Gujarat, MP, Karnataka, UP, etc.)
export const PRE_INDEXED_TALUKAS_AND_VILLAGES: Record<string, Record<string, TalukaOption[]>> = {
  "Maharashtra": {
    "Nashik": [
      {
        "name": "Niphad",
        "nameMr": "निफाड",
        "villages": [
          {
            "name": "Pimpalgaon Baswant",
            "nameMr": "पिंपळगाव बसवंत",
            "pincode": "422209"
          },
          {
            "name": "Niphad",
            "nameMr": "निफाड",
            "pincode": "422303"
          },
          {
            "name": "Ozar",
            "nameMr": "ओझर",
            "pincode": "422206"
          },
          {
            "name": "Saykheda",
            "nameMr": "सायखेडा",
            "pincode": "422210"
          },
          {
            "name": "Ranwad",
            "nameMr": "रानवड",
            "pincode": "422308"
          },
          {
            "name": "Kundewadi",
            "nameMr": "कुंदेवाडी",
            "pincode": "422303"
          },
          {
            "name": "Chandori",
            "nameMr": "चांदोरी",
            "pincode": "422201"
          },
          {
            "name": "Kasbe Sukene",
            "nameMr": "कसबे सुकेणे",
            "pincode": "422304"
          },
          {
            "name": "Vinchur",
            "nameMr": "विंचूर",
            "pincode": "422305"
          },
          {
            "name": "Lasalgaon",
            "nameMr": "लासलगाव",
            "pincode": "422306"
          },
          {
            "name": "Ugaon",
            "nameMr": "उगाव",
            "pincode": "422304"
          },
          {
            "name": "Pimplas",
            "nameMr": "पिंपळास",
            "pincode": "422209"
          }
        ]
      },
      {
        "name": "Nashik",
        "nameMr": "नाशिक",
        "villages": [
          {
            "name": "Makhmalabad",
            "nameMr": "मखमलाबाद",
            "pincode": "422003"
          },
          {
            "name": "Adgaon",
            "nameMr": "आडगाव",
            "pincode": "422003"
          },
          {
            "name": "Gangapur",
            "nameMr": "गंगापूर",
            "pincode": "422222"
          },
          {
            "name": "Deolali",
            "nameMr": "देवळाली",
            "pincode": "422401"
          },
          {
            "name": "Mhasrul",
            "nameMr": "म्हसरूळ",
            "pincode": "422004"
          },
          {
            "name": "Pathardi",
            "nameMr": "पाथर्डी",
            "pincode": "422010"
          },
          {
            "name": "Girnare",
            "nameMr": "गिरणारे",
            "pincode": "422203"
          }
        ]
      },
      {
        "name": "Sinnar",
        "nameMr": "सिन्नर",
        "villages": [
          {
            "name": "Sinnar",
            "nameMr": "सिन्नर",
            "pincode": "422103"
          },
          {
            "name": "Wavi",
            "nameMr": "वावी",
            "pincode": "422104"
          },
          {
            "name": "Musalgaon",
            "nameMr": "मुसळगाव",
            "pincode": "422112"
          },
          {
            "name": "Dapur",
            "nameMr": "दापूर",
            "pincode": "422102"
          },
          {
            "name": "Naygaon",
            "nameMr": "नायगाव",
            "pincode": "422102"
          },
          {
            "name": "Pandhurli",
            "nameMr": "पांढुर्ली",
            "pincode": "422103"
          }
        ]
      },
      {
        "name": "Dindori",
        "nameMr": "दिंडोरी",
        "villages": [
          {
            "name": "Dindori",
            "nameMr": "दिंडोरी",
            "pincode": "422202"
          },
          {
            "name": "Vani",
            "nameMr": "वणी",
            "pincode": "422215"
          },
          {
            "name": "Janori",
            "nameMr": "जानोरी",
            "pincode": "422206"
          },
          {
            "name": "Mohadi",
            "nameMr": "मोहाडी",
            "pincode": "422207"
          },
          {
            "name": "Nanashi",
            "nameMr": "नानाशी",
            "pincode": "422003"
          },
          {
            "name": "Umrale",
            "nameMr": "उमराळे",
            "pincode": "422202"
          }
        ]
      },
      {
        "name": "Yeola",
        "nameMr": "येवला",
        "villages": [
          {
            "name": "Yeola",
            "nameMr": "येवला",
            "pincode": "423401"
          },
          {
            "name": "Andarsul",
            "nameMr": "अंदरसूल",
            "pincode": "423402"
          },
          {
            "name": "Nagarsul",
            "nameMr": "नगरसूल",
            "pincode": "423403"
          },
          {
            "name": "Rajaapur",
            "nameMr": "राजापूर",
            "pincode": "423401"
          },
          {
            "name": "Savargaon",
            "nameMr": "सावरगाव",
            "pincode": "423401"
          }
        ]
      },
      {
        "name": "Kalwan",
        "nameMr": "कळवण",
        "villages": [
          {
            "name": "Kalwan",
            "nameMr": "कळवण",
            "pincode": "423501"
          },
          {
            "name": "Abhona",
            "nameMr": "अभona",
            "pincode": "423502"
          },
          {
            "name": "Manur",
            "nameMr": "मानूर",
            "pincode": "423501"
          },
          {
            "name": "Kanashi",
            "nameMr": "कणाशी",
            "pincode": "423502"
          }
        ]
      },
      {
        "name": "Malegaon",
        "nameMr": "मालेगाव",
        "villages": [
          {
            "name": "Malegaon",
            "nameMr": "मालेगाव",
            "pincode": "423203"
          },
          {
            "name": "Ravalgaon",
            "nameMr": "रावळगाव",
            "pincode": "423108"
          },
          {
            "name": "Vadner",
            "nameMr": "वडनेर",
            "pincode": "423201"
          },
          {
            "name": "Saundane",
            "nameMr": "सौंदाणे",
            "pincode": "423208"
          }
        ]
      },
      {
        "name": "Chandwad",
        "nameMr": "चांदवड",
        "villages": [
          {
            "name": "Chandwad",
            "nameMr": "चांदवड",
            "pincode": "423101"
          },
          {
            "name": "Vadbare",
            "nameMr": "वडबारे",
            "pincode": "423101"
          },
          {
            "name": "Rahud",
            "nameMr": "राहुड",
            "pincode": "423101"
          }
        ]
      },
      {
        "name": "Igatpuri",
        "nameMr": "इगतपुरी",
        "villages": [
          {
            "name": "Igatpuri",
            "nameMr": "इगतपुरी",
            "pincode": "422403"
          },
          {
            "name": "Ghoti",
            "nameMr": "घोfield",
            "pincode": "422402"
          },
          {
            "name": "Bhavali",
            "nameMr": "भावली",
            "pincode": "422403"
          }
        ]
      },
      {
        "name": "Trimbakeshwar",
        "nameMr": "त्र्यंबकेश्वर",
        "villages": [
          {
            "name": "Trimbakeshwar",
            "nameMr": "त्र्यंबकेश्वर",
            "pincode": "422212"
          },
          {
            "name": "Anjaneri",
            "nameMr": "अंजनेरी",
            "pincode": "422213"
          },
          {
            "name": "Pegalwadi",
            "nameMr": "पेगलवाडी",
            "pincode": "422212"
          }
        ]
      }
    ],
    "Pune": [
      {
        "name": "Haveli",
        "nameMr": "हवेली",
        "villages": [
          {
            "name": "Wagholi",
            "nameMr": "वाघोली",
            "pincode": "412207"
          },
          {
            "name": "Manjari",
            "nameMr": "मांजरी",
            "pincode": "412307"
          },
          {
            "name": "Loni Kalbhor",
            "nameMr": "लोणी काळभोर",
            "pincode": "412201"
          },
          {
            "name": "Uruli Kanchan",
            "nameMr": "उरुळी कांचन",
            "pincode": "412202"
          },
          {
            "name": "Khadakwasla",
            "nameMr": "खडकवासला",
            "pincode": "411024"
          }
        ]
      },
      {
        "name": "Baramati",
        "nameMr": "बारामती",
        "villages": [
          {
            "name": "Baramati",
            "nameMr": "बारामती",
            "pincode": "413102"
          },
          {
            "name": "Malegaon BK",
            "nameMr": "मालेगाव बु.",
            "pincode": "413115"
          },
          {
            "name": "Supe",
            "nameMr": "सुपे",
            "pincode": "412258"
          },
          {
            "name": "Morgaon",
            "nameMr": "मोरगाव",
            "pincode": "412304"
          }
        ]
      },
      {
        "name": "Shirur",
        "nameMr": "शिरूर",
        "villages": [
          {
            "name": "Shirur",
            "nameMr": "शिरूर",
            "pincode": "412210"
          },
          {
            "name": "Shikrapur",
            "nameMr": "शिक्रापूर",
            "pincode": "412208"
          },
          {
            "name": "Sanaswadi",
            "nameMr": "सणसवाडी",
            "pincode": "412208"
          },
          {
            "name": "Koregaon Bhima",
            "nameMr": "कोरेगाव भीमा",
            "pincode": "412216"
          }
        ]
      },
      {
        "name": "Junnar",
        "nameMr": "जुन्नर",
        "villages": [
          {
            "name": "Junnar",
            "nameMr": "जुन्नर",
            "pincode": "410502"
          },
          {
            "name": "Narayangaon",
            "nameMr": "नारायणगाव",
            "pincode": "410504"
          },
          {
            "name": "Otur",
            "nameMr": "ओतूर",
            "pincode": "412409"
          },
          {
            "name": "Alephata",
            "nameMr": "आळेफाटा",
            "pincode": "412411"
          }
        ]
      },
      {
        "name": "Daund",
        "nameMr": "दौंड",
        "villages": [
          {
            "name": "Daund",
            "nameMr": "दौंड",
            "pincode": "413801"
          },
          {
            "name": "Patas",
            "nameMr": "पाटस",
            "pincode": "412219"
          },
          {
            "name": "Kedgaon",
            "nameMr": "केडगाव",
            "pincode": "412203"
          },
          {
            "name": "Yawat",
            "nameMr": "यवत",
            "pincode": "412214"
          }
        ]
      },
      {
        "name": "Ambegaon",
        "nameMr": "आंबेगाव",
        "villages": [
          {
            "name": "Manchar",
            "nameMr": "मंचर",
            "pincode": "410503"
          },
          {
            "name": "Ghodegaon",
            "nameMr": "घोडेगाव",
            "pincode": "412408"
          },
          {
            "name": "Khedgaon",
            "nameMr": "खेडगाव",
            "pincode": "410503"
          }
        ]
      },
      {
        "name": "Khed",
        "nameMr": "खेड",
        "villages": [
          {
            "name": "Chakan",
            "nameMr": "चाकण",
            "pincode": "410501"
          },
          {
            "name": "Rajgurunagar",
            "nameMr": "राजगुरुनगर",
            "pincode": "410505"
          },
          {
            "name": "Alandi",
            "nameMr": "आळंदी",
            "pincode": "412105"
          }
        ]
      }
    ],
    "Ahmednagar": [
      {
        "name": "Sangamner",
        "nameMr": "संगमनेर",
        "villages": [
          {
            "name": "Sangamner",
            "nameMr": "संगमनेर",
            "pincode": "422605"
          },
          {
            "name": "Ashwi",
            "nameMr": "अश्वी",
            "pincode": "413738"
          },
          {
            "name": "Talegaon",
            "nameMr": "तळेगाव",
            "pincode": "422611"
          },
          {
            "name": "Sakur",
            "nameMr": "साकूर",
            "pincode": "422622"
          }
        ]
      },
      {
        "name": "Rahata",
        "nameMr": "राहाता",
        "villages": [
          {
            "name": "Rahata",
            "nameMr": "राहाता",
            "pincode": "423107"
          },
          {
            "name": "Shirdi",
            "nameMr": "शिर्डी",
            "pincode": "423109"
          },
          {
            "name": "Babhaleshwar",
            "nameMr": "बाभळेश्वर",
            "pincode": "413737"
          },
          {
            "name": "Loni",
            "nameMr": "लोणी",
            "pincode": "413736"
          }
        ]
      },
      {
        "name": "Kopargaon",
        "nameMr": "कोपरगाव",
        "villages": [
          {
            "name": "Kopargaon",
            "nameMr": "कोपरगाव",
            "pincode": "423601"
          },
          {
            "name": "Pohegaon",
            "nameMr": "पोहेगाव",
            "pincode": "423605"
          },
          {
            "name": "Suregaon",
            "nameMr": "सुरेगाव",
            "pincode": "423601"
          }
        ]
      },
      {
        "name": "Shrirampur",
        "nameMr": "श्रीरामपूर",
        "villages": [
          {
            "name": "Shrirampur",
            "nameMr": "श्रीरामपूर",
            "pincode": "413709"
          },
          {
            "name": "Belapur",
            "nameMr": "बेलापूर",
            "pincode": "413715"
          },
          {
            "name": "Taklibhan",
            "nameMr": "टाकळीभान",
            "pincode": "413725"
          }
        ]
      },
      {
        "name": "Newasa",
        "nameMr": "नेवासा",
        "villages": [
          {
            "name": "Newasa",
            "nameMr": "नेवासा",
            "pincode": "414603"
          },
          {
            "name": "Sonai",
            "nameMr": "सोनई",
            "pincode": "414105"
          },
          {
            "name": "Kukana",
            "nameMr": "कुकणा",
            "pincode": "414604"
          }
        ]
      }
    ]
  },
  "Odisha": {
    "Khordha": [
      {
        "name": "Bhubaneswar",
        "nameHi": "भुवनेश्वर",
        "villages": [
          {
            "name": "Patia",
            "pincode": "751024"
          },
          {
            "name": "Saheed Nagar",
            "pincode": "751007"
          },
          {
            "name": "Khandagiri",
            "pincode": "751030"
          },
          {
            "name": "Nayapalli",
            "pincode": "751012"
          },
          {
            "name": "Rasulgarh",
            "pincode": "751010"
          },
          {
            "name": "Chandrasekharpur",
            "pincode": "751016"
          },
          {
            "name": "Old Town",
            "pincode": "751002"
          },
          {
            "name": "Mancheswar",
            "pincode": "751017"
          }
        ]
      },
      {
        "name": "Khordha",
        "villages": [
          {
            "name": "Khurda Town",
            "pincode": "752055"
          },
          {
            "name": "Bajpur",
            "pincode": "752057"
          },
          {
            "name": "Gurujanga",
            "pincode": "752055"
          },
          {
            "name": "Jankia",
            "pincode": "752020"
          }
        ]
      },
      {
        "name": "Jatani",
        "villages": [
          {
            "name": "Jatni",
            "pincode": "752050"
          },
          {
            "name": "Khurda Road",
            "pincode": "752050"
          },
          {
            "name": "Retanga",
            "pincode": "752054"
          }
        ]
      },
      {
        "name": "Begunia",
        "villages": [
          {
            "name": "Begunia",
            "pincode": "752062"
          },
          {
            "name": "Bolagarh",
            "pincode": "752066"
          },
          {
            "name": "Pichukuli",
            "pincode": "752064"
          }
        ]
      },
      {
        "name": "Banapur",
        "villages": [
          {
            "name": "Banapur",
            "pincode": "752031"
          },
          {
            "name": "Balugaon",
            "pincode": "752030"
          },
          {
            "name": "Nachuni",
            "pincode": "752034"
          }
        ]
      },
      {
        "name": "Balianta",
        "villages": [
          {
            "name": "Balianta",
            "pincode": "752101"
          },
          {
            "name": "Pratapsasan",
            "pincode": "752100"
          },
          {
            "name": "Bhingarpur",
            "pincode": "752101"
          }
        ]
      }
    ],
    "Cuttack": [
      {
        "name": "Cuttack Sadar",
        "villages": [
          {
            "name": "Cuttack",
            "pincode": "753001"
          },
          {
            "name": "Chauliaganj",
            "pincode": "753003"
          },
          {
            "name": "Choudwar",
            "pincode": "754025"
          },
          {
            "name": "Jagatpur",
            "pincode": "754021"
          }
        ]
      },
      {
        "name": "Athagarh",
        "villages": [
          {
            "name": "Athagarh",
            "pincode": "754029"
          },
          {
            "name": "Khuntuni",
            "pincode": "754029"
          },
          {
            "name": "Rajnagar",
            "pincode": "754029"
          },
          {
            "name": "Radhakishorepur",
            "pincode": "754031"
          }
        ]
      },
      {
        "name": "Banki",
        "villages": [
          {
            "name": "Banki",
            "pincode": "754008"
          },
          {
            "name": "Kalapathar",
            "pincode": "754009"
          },
          {
            "name": "Baideswar",
            "pincode": "754008"
          }
        ]
      },
      {
        "name": "Salipur",
        "villages": [
          {
            "name": "Salipur",
            "pincode": "754202"
          },
          {
            "name": "Bahugram",
            "pincode": "754200"
          },
          {
            "name": "Machhagaon",
            "pincode": "754119"
          }
        ]
      },
      {
        "name": "Baramba",
        "villages": [
          {
            "name": "Baramba",
            "pincode": "754031"
          },
          {
            "name": "Maniabandha",
            "pincode": "754035"
          },
          {
            "name": "Gopinathpur",
            "pincode": "754031"
          }
        ]
      }
    ],
    "Puri": [
      {
        "name": "Puri Sadar",
        "villages": [
          {
            "name": "Puri",
            "pincode": "752001"
          },
          {
            "name": "Baliguali",
            "pincode": "752002"
          },
          {
            "name": "Samagara",
            "pincode": "752002"
          }
        ]
      },
      {
        "name": "Pipili",
        "villages": [
          {
            "name": "Pipili",
            "pincode": "752104"
          },
          {
            "name": "Dandamukundapur",
            "pincode": "752104"
          },
          {
            "name": "Teisipur",
            "pincode": "752104"
          },
          {
            "name": "Bharatipur",
            "pincode": "752104"
          }
        ]
      },
      {
        "name": "Brahmagiri",
        "villages": [
          {
            "name": "Brahmagiri",
            "pincode": "752011"
          },
          {
            "name": "Rebana Nuagaon",
            "pincode": "752011"
          },
          {
            "name": "Chapamanik",
            "pincode": "752011"
          }
        ]
      },
      {
        "name": "Gop",
        "villages": [
          {
            "name": "Gop",
            "pincode": "752110"
          },
          {
            "name": "Konark",
            "pincode": "752111"
          },
          {
            "name": "Nimapada",
            "pincode": "752106"
          }
        ]
      }
    ],
    "Balasore": [
      {
        "name": "Balasore Sadar",
        "villages": [
          {
            "name": "Balasore",
            "pincode": "756001"
          },
          {
            "name": "Remuna",
            "pincode": "756019"
          },
          {
            "name": "Kuruda",
            "pincode": "756056"
          },
          {
            "name": "Chandipur",
            "pincode": "756025"
          }
        ]
      },
      {
        "name": "Jaleswar",
        "villages": [
          {
            "name": "Jaleswar",
            "pincode": "756032"
          },
          {
            "name": "Raibania",
            "pincode": "756033"
          },
          {
            "name": "Sugo",
            "pincode": "756032"
          }
        ]
      },
      {
        "name": "Soro",
        "villages": [
          {
            "name": "Soro",
            "pincode": "756045"
          },
          {
            "name": "Bahanaga",
            "pincode": "756042"
          },
          {
            "name": "Simulia",
            "pincode": "756126"
          }
        ]
      }
    ],
    "Sambalpur": [
      {
        "name": "Sambalpur Sadar",
        "villages": [
          {
            "name": "Sambalpur",
            "pincode": "768001"
          },
          {
            "name": "Burla",
            "pincode": "768017"
          },
          {
            "name": "Hirakud",
            "pincode": "768016"
          },
          {
            "name": "Dhanupali",
            "pincode": "768005"
          }
        ]
      },
      {
        "name": "Rengali",
        "villages": [
          {
            "name": "Rengali",
            "pincode": "768212"
          },
          {
            "name": "Sason",
            "pincode": "768200"
          },
          {
            "name": "Lapanga",
            "pincode": "768212"
          }
        ]
      }
    ]
  },
  "Gujarat": {
    "Anand": [
      {
        "name": "Anand",
        "nameMr": "आणंद",
        "villages": [
          {
            "name": "Anand",
            "nameMr": "आणंद",
            "pincode": "388001"
          },
          {
            "name": "Mogar",
            "nameMr": "मोगर",
            "pincode": "388340"
          },
          {
            "name": "Bakrol",
            "pincode": "388315"
          },
          {
            "name": "Karamsad",
            "pincode": "388325"
          }
        ]
      },
      {
        "name": "Borsad",
        "villages": [
          {
            "name": "Borsad",
            "pincode": "388540"
          },
          {
            "name": "Anklav",
            "pincode": "388510"
          }
        ]
      }
    ],
    "Surat": [
      {
        "name": "Choryasi",
        "villages": [
          {
            "name": "Surat",
            "pincode": "395003"
          },
          {
            "name": "Dumas",
            "pincode": "395007"
          },
          {
            "name": "Sachin",
            "pincode": "394230"
          }
        ]
      },
      {
        "name": "Bardoli",
        "villages": [
          {
            "name": "Bardoli",
            "pincode": "394601"
          },
          {
            "name": "Baben",
            "pincode": "394601"
          }
        ]
      }
    ]
  },
  "Madhya Pradesh": {
    "Indore": [
      {
        "name": "Indore",
        "villages": [
          {
            "name": "Indore",
            "pincode": "452001"
          },
          {
            "name": "Rau",
            "pincode": "453331"
          },
          {
            "name": "Mhow",
            "pincode": "453441"
          }
        ]
      },
      {
        "name": "Sanwer",
        "villages": [
          {
            "name": "Sanwer",
            "pincode": "453551"
          },
          {
            "name": "Chandravatiganj",
            "pincode": "453551"
          }
        ]
      }
    ]
  },
  "Karnataka": {
    "Belagavi": [
      {
        "name": "Belagavi",
        "villages": [
          {
            "name": "Belagavi",
            "pincode": "590001"
          },
          {
            "name": "Peeranwadi",
            "pincode": "590014"
          }
        ]
      },
      {
        "name": "Chikodi",
        "villages": [
          {
            "name": "Chikodi",
            "pincode": "591201"
          },
          {
            "name": "Nipani",
            "pincode": "591237"
          }
        ]
      }
    ]
  },
  "Uttar Pradesh": {
    "Rampur": [
      {
        "name": "Rampur",
        "villages": [
          {
            "name": "Rampur",
            "pincode": "244901"
          },
          {
            "name": "Bilaspur",
            "pincode": "244921"
          },
          {
            "name": "Milak",
            "pincode": "243701"
          },
          {
            "name": "Shahabad",
            "pincode": "244922"
          }
        ]
      }
    ],
    "Varanasi": [
      {
        "name": "Varanasi Sadar",
        "villages": [
          {
            "name": "Varanasi",
            "pincode": "221001"
          },
          {
            "name": "Sarnath",
            "pincode": "221007"
          }
        ]
      }
    ]
  }
};

/**
 * Returns all 36 Indian States and Union Territories.
 */
export function getAllStates(): IndianState[] {
  return ALL_INDIAN_STATES_AND_UTS;
}

/**
 * Clean & match state name case-insensitively, supporting common aliases (e.g. Orissa -> Odisha).
 */
export function normalizeStateName(rawState?: string): string {
  if (!rawState) return '';
  const clean = rawState.trim().toLowerCase();
  
  if (clean === 'orissa') return 'Odisha';
  if (clean === 'pondicherry') return 'Puducherry';
  if (clean === 'uttaranchal') return 'Uttarakhand';

  const match = ALL_INDIAN_STATES_AND_UTS.find(
    (s) => s.name.toLowerCase() === clean || s.code.toLowerCase() === clean
  );
  if (match) return match.name;

  const partial = ALL_INDIAN_STATES_AND_UTS.find(
    (s) => clean.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(clean)
  );
  return partial ? partial.name : rawState.trim();
}

/**
 * Get all official districts for the specified State or UT.
 * Returns an empty array if state is invalid.
 */
export function getDistrictsForState(stateName: string): string[] {
  const normState = normalizeStateName(stateName);
  return ALL_STATES_DISTRICTS[normState] || [];
}

/**
 * Clean & match district name against the official districts of the given state.
 */
export function normalizeDistrictName(stateName: string, rawDistrict?: string): string {
  if (!rawDistrict) return '';
  const districts = getDistrictsForState(stateName);
  if (!districts.length) return rawDistrict.trim();

  const clean = rawDistrict
    .replace(/\b(District|Dist|Zilla|Dt)\b/gi, '')
    .trim()
    .toLowerCase();

  // Exact or case-insensitive match
  const exact = districts.find((d) => d.toLowerCase() === clean);
  if (exact) return exact;

  // Partial / alias match
  const aliasMap: Record<string, string> = {
    'nasik': 'Nashik',
    'aurangabad': 'Chhatrapati Sambhajinagar',
    'osmanabad': 'Dharashiv',
    'khurda': 'Khordha',
    'balasore': 'Balasore',
    'baleshwar': 'Balasore',
    'angul': 'Angul',
    'keonjhar': 'Kendujhar',
    'sonepur': 'Subarnapur',
    'allahabad': 'Prayagraj',
    'faizabad': 'Ayodhya'
  };
  if (aliasMap[clean]) {
    const aliased = aliasMap[clean];
    const foundAliased = districts.find((d) => d.toLowerCase() === aliased.toLowerCase());
    if (foundAliased) return foundAliased;
  }

  const partial = districts.find(
    (d) => clean.includes(d.toLowerCase()) || d.toLowerCase().includes(clean)
  );
  return partial || rawDistrict.trim();
}

/**
 * Get pre-indexed talukas/tehsils for a district.
 * If not pre-indexed, returns empty array allowing custom entry.
 */
export function getTalukasForDistrict(stateName: string, districtName: string): TalukaOption[] {
  const normState = normalizeStateName(stateName);
  const normDistrict = normalizeDistrictName(normState, districtName);

  const stateObj = PRE_INDEXED_TALUKAS_AND_VILLAGES[normState];
  if (!stateObj) return [];

  // Match district key case-insensitively
  const districtKey = Object.keys(stateObj).find(
    (k) => k.toLowerCase() === normDistrict.toLowerCase()
  );
  return districtKey ? stateObj[districtKey] : [];
}

/**
 * Get pre-indexed villages for a given taluka in a district.
 */
export function getVillagesForTaluka(
  stateName: string,
  districtName: string,
  talukaName: string
): VillageOption[] {
  const talukas = getTalukasForDistrict(stateName, districtName);
  const cleanTaluka = talukaName
    .replace(/\b(Taluka|Tehsil|Subdistrict|Block)\b/gi, '')
    .trim()
    .toLowerCase();

  const match = talukas.find(
    (t) =>
      t.name.toLowerCase() === cleanTaluka ||
      cleanTaluka.includes(t.name.toLowerCase()) ||
      t.name.toLowerCase().includes(cleanTaluka)
  );

  return match && match.villages ? match.villages : [];
}

/**
 * Find pincode for a village if mapped in pre-indexed data.
 */
export function findPincodeForVillage(
  stateName: string,
  districtName: string,
  talukaName: string,
  villageName: string
): string | undefined {
  const villages = getVillagesForTaluka(stateName, districtName, talukaName);
  const cleanVillage = villageName.trim().toLowerCase();

  const match = villages.find(
    (v) =>
      v.name.toLowerCase() === cleanVillage ||
      cleanVillage.includes(v.name.toLowerCase()) ||
      v.name.toLowerCase().includes(cleanVillage)
  );

  return match ? match.pincode : undefined;
}
