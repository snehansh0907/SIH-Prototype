export interface IndianState {
  code: string;
  name: string;
  nameMr?: string;
  nameHi?: string;
  isUT?: boolean;
}

export const ALL_INDIAN_STATES_AND_UTS: IndianState[] = [
  // 28 States
  { code: 'AP', name: 'Andhra Pradesh', nameMr: 'आंध्र प्रदेश', nameHi: 'आंध्र प्रदेश' },
  { code: 'AR', name: 'Arunachal Pradesh', nameMr: 'अरुणाचल प्रदेश', nameHi: 'अरुणाचल प्रदेश' },
  { code: 'AS', name: 'Assam', nameMr: 'आसाम', nameHi: 'असम' },
  { code: 'BR', name: 'Bihar', nameMr: 'बिहार', nameHi: 'बिहार' },
  { code: 'CG', name: 'Chhattisgarh', nameMr: 'छत्तीसगढ', nameHi: 'छत्तीसगढ़' },
  { code: 'GA', name: 'Goa', nameMr: 'गोवा', nameHi: 'गोवा' },
  { code: 'GJ', name: 'Gujarat', nameMr: 'गुजरात', nameHi: 'गुजरात' },
  { code: 'HR', name: 'Haryana', nameMr: 'हरियाणा', nameHi: 'हरियाणा' },
  { code: 'HP', name: 'Himachal Pradesh', nameMr: 'हिमाचल प्रदेश', nameHi: 'हिमाचल प्रदेश' },
  { code: 'JH', name: 'Jharkhand', nameMr: 'झारखंड', nameHi: 'झारखंड' },
  { code: 'KA', name: 'Karnataka', nameMr: 'कर्नाटक', nameHi: 'कर्नाटक' },
  { code: 'KL', name: 'Kerala', nameMr: 'केरळ', nameHi: 'केरल' },
  { code: 'MP', name: 'Madhya Pradesh', nameMr: 'मध्य प्रदेश', nameHi: 'मध्य प्रदेश' },
  { code: 'MH', name: 'Maharashtra', nameMr: 'महाराष्ट्र', nameHi: 'महाराष्ट्र' },
  { code: 'MN', name: 'Manipur', nameMr: 'मणिपूर', nameHi: 'मणिपुर' },
  { code: 'ML', name: 'Meghalaya', nameMr: 'मेघालय', nameHi: 'मेघालय' },
  { code: 'MZ', name: 'Mizoram', nameMr: 'मिझोरम', nameHi: 'मिज़ोरम' },
  { code: 'NL', name: 'Nagaland', nameMr: 'नागालँड', nameHi: 'नागालैंड' },
  { code: 'OD', name: 'Odisha', nameMr: 'ओडिशा', nameHi: 'ओडिशा' },
  { code: 'PB', name: 'Punjab', nameMr: 'पंजाब', nameHi: 'पंजाब' },
  { code: 'RJ', name: 'Rajasthan', nameMr: 'राजस्थान', nameHi: 'राजस्थान' },
  { code: 'SK', name: 'Sikkim', nameMr: 'सिक्कीम', nameHi: 'सिक्किम' },
  { code: 'TN', name: 'Tamil Nadu', nameMr: 'तमिळनाडू', nameHi: 'तमिलनाडु' },
  { code: 'TS', name: 'Telangana', nameMr: 'तेलंगणा', nameHi: 'तेलंगाना' },
  { code: 'TR', name: 'Tripura', nameMr: 'त्रिपुरा', nameHi: 'त्रिपुरा' },
  { code: 'UP', name: 'Uttar Pradesh', nameMr: 'उत्तर प्रदेश', nameHi: 'उत्तर प्रदेश' },
  { code: 'UK', name: 'Uttarakhand', nameMr: 'उत्तराखंड', nameHi: 'उत्तराखंड' },
  { code: 'WB', name: 'West Bengal', nameMr: 'पश्चिम बंगाल', nameHi: 'पश्चिम बंगाल' },

  // 8 Union Territories
  { code: 'AN', name: 'Andaman and Nicobar Islands', nameMr: 'अंदमान आणि निकोबार', nameHi: 'अंडमान और निकोबार द्वीप समूह', isUT: true },
  { code: 'CH', name: 'Chandigarh', nameMr: 'चंदीगड', nameHi: 'चंडीगढ़', isUT: true },
  { code: 'DH', name: 'Dadra and Nagar Haveli and Daman and Diu', nameMr: 'दादरा आणि नगर हवेली आणि दमण आणि दीव', nameHi: 'दादरा और नगर हवेली और दमन और दीव', isUT: true },
  { code: 'DL', name: 'Delhi', nameMr: 'दिल्ली', nameHi: 'दिल्ली', isUT: true },
  { code: 'JK', name: 'Jammu and Kashmir', nameMr: 'जम्मू आणि काश्मीर', nameHi: 'जम्मू और कश्मीर', isUT: true },
  { code: 'LA', name: 'Ladakh', nameMr: 'लडाख', nameHi: 'लद्दाख', isUT: true },
  { code: 'LD', name: 'Lakshadweep', nameMr: 'लक्षद्वीप', nameHi: 'लक्षद्वीप', isUT: true },
  { code: 'PY', name: 'Puducherry', nameMr: 'पुडुचेरी', nameHi: 'पुदुचेरी', isUT: true },
];

export function getAllIndianStates(): IndianState[] {
  return ALL_INDIAN_STATES_AND_UTS;
}
