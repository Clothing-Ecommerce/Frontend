export interface Address {
  addressId?: number;
  label: "Home" | "Work" | "Other";
  recipient: string;
  phone?: string;
  company?: string;
  houseNumber?: string;
  street?: string;
  wardCode?: string;
  wardName?: string;
  districtCode?: string;
  districtName?: string;
  provinceCode?: string;
  provinceName?: string;
  postalCode?: string;
  building?: string;
  block?: string;
  floor?: string;
  room?: string;
  notes?: string;
  country: string;
  isDefault?: boolean;
}