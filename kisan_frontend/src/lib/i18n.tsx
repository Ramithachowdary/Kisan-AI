import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getProfile } from './storage';

export type AppLanguage = 'English' | 'Hindi' | 'Kannada' | 'Tamil' | 'Telugu' | 'Marathi';

export const LANGUAGE_KEY = 'kisan-language';
export const DEFAULT_LANGUAGE: AppLanguage = 'English';

export const LANGUAGE_CODES: Record<AppLanguage, string> = {
  English: 'en-IN',
  Hindi: 'hi-IN',
  Kannada: 'kn-IN',
  Tamil: 'ta-IN',
  Telugu: 'te-IN',
  Marathi: 'mr-IN',
};

export const SUPPORTED_LANGUAGES: AppLanguage[] = [
  'English',
  'Hindi',
  'Kannada',
  'Tamil',
  'Telugu',
  'Marathi',
];

const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  English: {
    app_name: 'Kisan+',
    dashboard: 'Dashboard',
    crop_advisory: 'Crop Advisory',
    marketplace: 'Marketplace',
    govt_schemes: 'Government Schemes',
    help_history: 'Help & History',
    profile: 'Profile',
    login: 'Login',
    create_account: 'Create Account',
    logout: 'Logout',
    search: 'Search',
    search_schemes: 'Search schemes...',
    filter: 'Filter',
    all_categories: 'All Categories',
    fruits: 'Fruits',
    vegetables: 'Vegetables',
    grains: 'Grains',
    dairy: 'Dairy',
    spices: 'Spices',
    other: 'Other',
    buy_now: 'Buy Now',
    read_aloud: 'Read Aloud',
    page_intro: 'Connect directly with buyers, get AI-powered farming advice, and grow your business.',
    marketplace_intro: 'Fresh farm produce, trusted buyers, and local delivery options in one place.',
    marketplace_search_placeholder: 'Search for crops, categories, states...',
    marketplace_categories: 'Filter by Category',
    marketplace_voice_button: 'Read aloud marketplace',
    market_prices_title: "Today's Mandi Prices",
    market_prices_last_updated: 'Last updated:',
    market_alerts_title: 'Price Alerts',
    schemes_title: 'Government Schemes',
    schemes_category_all: 'All',
    schemes_apply_now: 'Apply Now',
    schemes_no_results: 'No schemes found matching your criteria',
    benefits: 'Benefits',
    eligibility: 'Eligibility',
    deadline: 'Deadline',
    location: 'Location',
    active: 'Active',
    registration_open: 'Registration Open',
    proposal: 'Application opening soon!',
    profile_settings: 'Profile Settings',
    full_name: 'Full Name',
    mobile_number: 'Mobile Number',
    state: 'State',
    district: 'District',
    village: 'Village',
    land_size: 'Land Size (acres)',
    main_crops: 'Main Crops',
    preferred_language: 'Preferred Language',
    save_profile: 'Save Profile',
    profile_updated: 'Profile updated!',
    demo_data: 'Use Demo Data',
    select_state_district: 'Select state & district',
    select_one_crop: 'Select at least one crop',
    back: 'Back',
    next: 'Next',
    finish: 'Finish',
    welcome_back: 'Welcome back, {{name}}!',
    how_can_i_help: 'How can I help you today?',
    quick_tip: 'Use the floating mic button to quickly ask about crop prices, get diagnosis, or find government schemes. Just speak naturally in your language!',
    listen: 'Listen',
    refresh: 'Refresh',
    apply_now: 'Apply Now',
    voice_search_hint: 'Voice not available - use text input',
    type_question: 'Type your question...',
    tap_speak: 'Tap & speak — ask about crop, price or schemes',
    assistant_welcome: '👋 Hello! I am your farming assistant.',
    assistant_hint: 'Ask me about crop prices, diagnosis, or government schemes',
    language_selector_label: 'Language',
    hero_welcome: 'Welcome to Kisan+',
    hero_subtitle: 'Your Smart Farming Partner',
    smart_farming_partner: 'Your Smart Farming Partner',
    hero_description: 'Diagnose your crop, track prices, discover schemes — all by voice',
    hero_step_one: 'Speak naturally in your language or type your question',
    hero_step_two: 'Get instant AI-powered answers for your farming needs',
    hero_step_three: 'Access real-time data, schemes, and expert advice',
    ai_crop_diagnosis: 'AI Crop Diagnosis',
    live_market_prices: 'Live Market Prices',
    government_schemes: 'Government Schemes',
    quick_tip_title: 'Quick Tip',
    emergency_contacts: 'Emergency Contacts',
    faq_title: 'Frequently Asked Questions',
    voice_assistant_tips: 'Voice Assistant Tips',
    recent_activity: 'Recent Activity',
    no_history_yet: 'No History Yet',
    clear_history: 'Clear History',
    diagnosis: 'Diagnosis',
    schemes: 'Schemes',
    help: 'Help',
    assistant_title: 'Kisan+ Assistant',
    listening: 'Listening...',
    tap_to_speak: 'Tap mic to speak',
    play: 'Play',
    upload_image: 'Upload image',
    get_started: 'Get Started',
    create_account_cta: 'Create Account',
    crop: 'Crop',
    variety: 'Variety',
    current_price: 'Current Price',
    previous: 'Previous',
    change: 'Change',
    all_trends: 'All Trends',
    trend_all: 'All',
    trend_rising: 'Rising Prices',
    trend_falling: 'Falling Prices',
    trend_stable: 'Stable',
  },
  Tamil: {
    app_name: 'கிசான்+',
    dashboard: 'டாஷ்போர்டு',
    crop_advisory: 'பயிர் ஆலோசனை',
    marketplace: 'மார்க்கெட்ஃப்',
    govt_schemes: 'அரசு திட்டங்கள்',
    help_history: 'உதவி & வரலாறு',
    profile: 'சுயவிவரம்',
    login: 'உள்நுழைக',
    create_account: 'கணக்கு உருவாக்க',
    logout: 'வெளியேறு',
    search: 'தேடு',
    search_schemes: 'திட்டங்களைத் தேடு...',
    filter: 'வடிகட்டி',
    all_categories: 'அனைத்து வகைகள்',
    fruits: 'பழங்கள்',
    vegetables: 'காய்கறிகள்',
    grains: 'தானியங்கள்',
    dairy: 'பால் பொருட்கள்',
    spices: 'மசாலா',
    other: 'மற்றவை',
    buy_now: 'இப்போது வாங்க',
    read_aloud: 'ஒலிபுரி',
    page_intro: 'நேரடியாக வாங்குபவர்களுடன் இணைக்கவும், AI உதவியுடன் விவசாயம் வளர்க்கவும்.',
    marketplace_intro: 'சமீபத்திய பண்ணை பொருட்கள், நம்பகமான வாங்குபவர்கள் மற்றும் உள்ளூர் டெலிவரி ஒரே இடத்தில்.',
    marketplace_search_placeholder: 'பயிர், வகைகள், மாநிலங்களைத் தேடவும்...',
    marketplace_categories: 'வகைப்படி வடிகட்டி',
    marketplace_voice_button: 'மார்க்கெட்க்கு ஒலியாக வாசி',
    market_prices_title: 'இன்றைய மண்டி விலைகள்',
    market_prices_last_updated: 'இறுதியாக புதுப்பிக்கப்பட்டது:',
    market_alerts_title: 'விலை எச்சரிக்கை',
    schemes_title: 'அரசு திட்டங்கள்',
    schemes_category_all: 'அனைத்து',
    schemes_apply_now: 'இப்போது விண்ணப்பிக்கவும்',
    schemes_no_results: 'உங்கள் தேடலுக்கு பொருந்தும் திட்டங்கள் இல்லை',
    benefits: 'நன்மைகள்',
    eligibility: 'தகுதி',
    deadline: 'காலாவதி',
    location: 'இடம்',
    active: 'செயலில் உள்ளது',
    registration_open: 'பதிவு திறந்தது',
    proposal: 'விண்ணப்பம் விரைவில் திறக்கப்படும்!',
    profile_settings: 'சுயவிவரம் அமைப்புகள்',
    full_name: 'முழுப் பெயர்',
    mobile_number: 'மொபைல் எண்',
    state: 'மாநிலம்',
    district: 'மண்டலம்',
    village: 'ஊர்',
    land_size: 'உர நிலத்தின் அளவு (ஏக்கர்)',
    main_crops: 'முக்கிய பயிர்கள்',
    preferred_language: 'மொழி',
    save_profile: 'சுயவிவரம் சேமி',
    profile_updated: 'சுயவிவரம் புதுப்பிக்கப்பட்டது!',
    demo_data: 'அடிக்கடி தரவு பயன்படுத்து',
    select_state_district: 'மாநிலம் மற்றும் மண்டலத்தைத் தேர்ந்தெடுக்கவும்',
    select_one_crop: 'ஒரு பயிரையும் தேர்ந்தெடுக்கவும்',
    back: 'முந்தைய',
    next: 'அடுத்தது',
    finish: 'முடித்து',
    welcome_back: 'வரவிருக்கும், {{name}}!',
    how_can_i_help: 'இன்று உங்களுக்கு எப்படி உதவலாம்?',
    quick_tip: 'உயிரியல் வினையொலி பொத்தானை பயன்படுத்தி பயிர் விலைகளை, நோயை அல்லது அரசு திட்டங்களை கேளுங்கள். உங்கள் மொழியில் பழம்பெருக்கமாக பேசுங்கள்!',
    listen: 'கேளுங்கள்',
    refresh: 'புதுப்பிக்கவும்',
    apply_now: 'இப்போது விண்ணப்பிக்கவும்',
    voice_search_hint: 'குரல் கிடைக்கவில்லை - உரை உள்ளீட்டைப் பயன்படுத்தவும்',
    type_question: 'உங்கள் கேள்வியை உள்ளிடவும்...',
    tap_speak: 'தட்டவும் & பேசுங்கள் — பயிர், விலை அல்லது திட்டங்களை கேளுங்கள்',
    assistant_welcome: '👋 வணக்கம்! நான் உங்கள் விவசாய உதவியாளர்.',
    assistant_hint: 'பயிர் விலைகள், நோய்கள் அல்லது அரசு திட்டங்களைப் பற்றி என்னைக் கேளுங்கள்',
    language_selector_label: 'மொழி',
    hero_welcome: 'கிசான்+ க்கு வரவேற்கிறோம்',
    hero_subtitle: 'உங்கள் स्मार्ट விவசாய பங்குதாரி',
  },
  Hindi: {},
  Kannada: {},
  Telugu: {},
  Marathi: {},
};

export function translate(key: string, language: AppLanguage) {
  return TRANSLATIONS[language]?.[key] ?? TRANSLATIONS.English[key] ?? key;
}

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (key: string) => string;
  getVoiceLocale: () => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const initialLanguage = (localStorage.getItem(LANGUAGE_KEY) as AppLanguage) || getProfile()?.language || DEFAULT_LANGUAGE;
  const [language, setLanguageState] = useState<AppLanguage>(initialLanguage);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: setLanguageState,
      t: (key: string) => translate(key, language),
      getVoiceLocale: () => LANGUAGE_CODES[language] || LANGUAGE_CODES.English,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
};
