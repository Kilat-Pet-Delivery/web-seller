export type PetShopCategory = 'grooming' | 'vet' | 'boarding' | 'pet_store';

export interface PetShop {
  id: string;
  owner_id?: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  category: PetShopCategory;
  services: string[];
  rating: number;
  image_url?: string;
  opening_hours: string;
  description: string;
  created_at: string;
}
