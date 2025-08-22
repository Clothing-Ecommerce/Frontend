import api from "@/utils/axios";

export interface Province {
  code: string;
  name: string;
  type?: string | null;
}
export interface District {
  code: string;
  name: string;
  type?: string | null;
  provinceCode: string;
}
export interface Ward {
  code: string;
  name: string;
  type?: string | null;
  districtCode: string;
}

let provinceCache: Province[] | null = null;
const districtCache = new Map<string, District[]>();
const wardCache = new Map<string, Ward[]>();

export function useVNAdmin() {
  const getProvinces = async (): Promise<Province[]> => {
    if (provinceCache?.length) return provinceCache;
    const { data } = await api.get<Province[]>("/admin/provinces");
    provinceCache = data;
    return data;
  };
  const getDistricts = async (
    provinceCode?: string | null
  ): Promise<District[]> => {
    if (!provinceCode) return [];
    if (districtCache.has(provinceCode))
      return districtCache.get(provinceCode)!;
    const { data } = await api.get<District[]>("/admin/districts", {
      params: { provinceCode },
    });
    districtCache.set(provinceCode, data);
    return data;
  };
  const getWards = async (districtCode?: string | null): Promise<Ward[]> => {
    if (!districtCode) return [];
    if (wardCache.has(districtCode)) return wardCache.get(districtCode)!;
    const { data } = await api.get<Ward[]>("/admin/wards", {
      params: { districtCode },
    });
    wardCache.set(districtCode, data);
    return data;
  };

  return { getProvinces, getDistricts, getWards };
}
