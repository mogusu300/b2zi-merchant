export interface Merchant {
  id: string;
  name: string;
  owner: string;
  location: string;
  status: 'Pending' | 'Onboarded' | 'Rejected';
  category: string;
  dateAdded: string;
}

export interface SalesStat {
  day: string;
  onboarded: number;
  leads: number;
}

export interface UserProfile {
  name: string;
  role: string;
  avatar: string;
  email: string;
}
