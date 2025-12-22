export interface UserProfile {
  id: number;
  phone: string;
  name: string;
  state: string;
  district: string;
  village: string;
  land_size: number;
  crops: string;        // comma-separated
  language: string;
  profile_complete: boolean;
}


export interface DiagnosisResult {
  disease: string;
  confidence: number;
  status: "high" | "medium" | "low";
  timestamp: string;
  image: string;
  advice: string[];
  scientific: string;
};

export interface MarketPrice {
  crop: string;
  market: string;
  unit: string;
  today: number;
  yesterday: number;
  trend: number;
  last7: number[];
  timestamp: string;
}

export interface Scheme {
  id: string;
  title: string;
  summary: string;
  eligibility: string[];
  documents: string[];
  apply: string;
  contact: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  type?: 'text' | 'voice' | 'image';
  data?: DiagnosisResult | MarketPrice | Scheme;
}

export interface HistoryItem {
  id: string;
  query: string;
  type: 'diagnosis' | 'market' | 'scheme' | 'chat';
  timestamp: string;
  preview: string;
  data?: any;
}
