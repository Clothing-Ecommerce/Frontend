import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Address } from "@/types/addressType";
import {
  useVNAdmin,
  type Province,
  type District,
  type Ward,
} from "@/hooks/useVNAdmin";

interface AddressFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: Address | null;
  onSave: (address: Address) => void;
  mode: "add" | "edit";
}

export function AddressFormDialog({
  open,
  onOpenChange,
  address,
  onSave,
  mode,
}: AddressFormDialogProps) {
  const DEFAULT_FORM: Address = useMemo(() => ({
    label: "Home",
    recipient: "",
    phone: "",
    company: "",
    houseNumber: "",
    street: "",
    wardCode: "",
    wardName: "",
    districtCode: "",
    districtName: "",
    provinceCode: "",
    provinceName: "",
    postalCode: "",
    building: "",
    block: "",
    floor: "",
    room: "",
    notes: "",
    country: "Vietnam",
    isDefault: false,
  }), []);

  const [formData, setFormData] = useState<Address>(DEFAULT_FORM);
  const { getProvinces, getDistricts, getWards } = useVNAdmin();
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // load provinces khi mở dialog
  useEffect(() => {
    if (!open) return;
    let alive = true;
    (async () => {
      setLoadingProvinces(true);
      try {
        const list = await getProvinces();
        if (alive) setProvinces(list);
      } finally {
        if (alive) setLoadingProvinces(false);
      }
    })();
    return () => { alive = false; };
  }, [open, getProvinces]);

  // khi đổi provinceCode → load districts, reset wards
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!open) return;
      if (!formData.provinceCode) { setDistricts([]); setWards([]); return; }
      setLoadingDistricts(true);
      try {
        const list = await getDistricts(formData.provinceCode);
        if (alive) setDistricts(list);
        if (alive) setWards([]); // reset wards khi đổi quận
      } finally {
        if (alive) setLoadingDistricts(false);
      }
    })();
    return () => { alive = false; };
  }, [open, formData.provinceCode, getDistricts]);

  // khi đổi districtCode → load wards
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!open) return;
      if (!formData.districtCode) { setWards([]); return; }
      setLoadingWards(true);
      try {
        const list = await getWards(formData.districtCode);
        if (alive) setWards(list);
      } finally {
        if (alive) setLoadingWards(false);
      }
    })();
    return () => { alive = false; };
  }, [open, formData.districtCode, getWards]);

  // useEffect(() => {
  //   if (address && mode === "edit") {
  //     setFormData(address);
  //   } else {
  //     // Reset form for add mode
  //     setFormData({
  //       label: "Home",
  //       recipient: "",
  //       phone: "",
  //       company: "",
  //       houseNumber: "",
  //       street: "",
  //       wardCode: "",
  //       wardName: "",
  //       districtCode: "",
  //       districtName: "",
  //       provinceCode: "",
  //       provinceName: "",
  //       postalCode: "",
  //       building: "",
  //       block: "",
  //       floor: "",
  //       room: "",
  //       notes: "",
  //       country: "Vietnam",
  //       isDefault: false,
  //     });
  //   }
  // }, [address, mode, open]);
  
  // Đồng bộ form khi mở dialog hoặc khi đổi mode/địa chỉ (dựa trên id để tránh object mới mỗi render)
  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && address) {
      // gộp với DEFAULT_FORM để đảm bảo đủ field, và chỉ set khi khác thực sự
      const next = { ...DEFAULT_FORM, ...address };
      setFormData(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    } else if (mode === "add") {
      setFormData(DEFAULT_FORM);
    }
  }, [open, mode, address?.addressId, DEFAULT_FORM]);

  const handleInputChange = (field: keyof Address, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProvinceChange = (code: string) => {
    const p = provinces.find((p) => p.code === code);
    setFormData((prev) => ({
      ...prev,
      provinceCode: p?.code ?? "",
      provinceName: p?.name ?? "",
      districtCode: "",
      districtName: "",
      wardCode: "",
      wardName: "",
    }));
  };

  const handleDistrictChange = (code: string) => {
    const d = districts.find((d) => d.code === code);
    setFormData((prev) => ({
      ...prev,
      districtCode: d?.code ?? "",
      districtName: d?.name ?? "",
      wardCode: "",
      wardName: "",
    }));
  };

  const handleWardChange = (code: string) => {
    const w = wards.find((w) => w.code === code);
    setFormData((prev) => ({
      ...prev,
      wardCode: w?.code ?? "",
      wardName: w?.name ?? "",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const isFormValid =
    formData.recipient &&
    formData.provinceCode &&
    formData.districtCode &&
    formData.wardCode;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Thêm địa chỉ mới" : "Chỉnh sửa địa chỉ"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Thêm địa chỉ giao hàng mới"
              : "Cập nhật thông tin địa chỉ giao hàng"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Nhãn địa chỉ *</Label>
            <Select
              value={formData.label}
              onValueChange={(value: "Home" | "Work" | "Other") =>
                handleInputChange("label", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Home">Nhà riêng</SelectItem>
                <SelectItem value="Work">Văn phòng</SelectItem>
                <SelectItem value="Other">Khác</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Họ và tên người nhận *</Label>
              <Input
                id="recipient"
                value={formData.recipient}
                onChange={(e) => handleInputChange("recipient", e.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={formData.phone || ""}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="0901234567"
              />
            </div>
          </div>

          {/* Company (optional) */}
          <div className="space-y-2">
            <Label htmlFor="company">Tên công ty (nếu có)</Label>
            <Input
              id="company"
              value={formData.company || ""}
              onChange={(e) => handleInputChange("company", e.target.value)}
              placeholder="Công ty TNHH ABC"
            />
          </div>

          {/* Administrative Divisions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">Tỉnh/Thành phố *</Label>
              <Select
                value={formData.provinceCode ?? ""}
                onValueChange={handleProvinceChange}
                disabled={loadingProvinces}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tỉnh/thành phố" />
                </SelectTrigger>
                <SelectContent>
                  {provinces.map((p: { code: string; name: string }) => (
                    <SelectItem key={p.code} value={p.code}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">Quận/Huyện *</Label>
              <Select
                value={formData.districtCode ?? ""}
                onValueChange={handleDistrictChange}
                disabled={!formData.provinceCode || loadingDistricts}
              >
                <SelectTrigger>
                  {/* <SelectValue placeholder="Chọn quận/huyện" /> */}
                  <SelectValue placeholder={
                    !formData.provinceCode
                      ? "Chọn tỉnh/thành trước"
                      : (loadingDistricts ? "Đang tải..." : "Chọn quận/huyện")
                  } />
                </SelectTrigger>
                <SelectContent>
                  {districts.map((district: { code: string; name: string }) => (
                    <SelectItem key={district.code} value={district.code}>
                      {district.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ward">Phường/Xã *</Label>
              <Select
                value={formData.wardCode ?? ""}
                onValueChange={handleWardChange}
                disabled={!formData.districtCode || loadingWards}
              >
                <SelectTrigger>
                  {/* <SelectValue placeholder="Chọn phường/xã" /> */}
                  <SelectValue placeholder={
                    !formData.districtCode
                      ? "Chọn quận/huyện trước"
                      : (loadingWards ? "Đang tải..." : "Chọn phường/xã")
                  } />
                </SelectTrigger>
                <SelectContent>
                  {wards.map((ward: { code: string; name: string }) => (
                    <SelectItem key={ward.code} value={ward.code}>
                      {ward.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Street Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="houseNumber">Số nhà/Ngõ/Hẻm</Label>
              <Input
                id="houseNumber"
                value={formData.houseNumber || ""}
                onChange={(e) =>
                  handleInputChange("houseNumber", e.target.value)
                }
                placeholder="123, Ngõ 45"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Tên đường</Label>
              <Input
                id="street"
                value={formData.street || ""}
                onChange={(e) => handleInputChange("street", e.target.value)}
                placeholder="Đường Láng"
              />
            </div>
          </div>

          {/* Building Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="building">Tòa nhà/Khu vực</Label>
              <Input
                id="building"
                value={formData.building || ""}
                onChange={(e) => handleInputChange("building", e.target.value)}
                placeholder="Tòa A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="block">Block/Lô</Label>
              <Input
                id="block"
                value={formData.block || ""}
                onChange={(e) => handleInputChange("block", e.target.value)}
                placeholder="Block B"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Tầng</Label>
              <Input
                id="floor"
                value={formData.floor || ""}
                onChange={(e) => handleInputChange("floor", e.target.value)}
                placeholder="Tầng 5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room">Phòng/Căn</Label>
              <Input
                id="room"
                value={formData.room || ""}
                onChange={(e) => handleInputChange("room", e.target.value)}
                placeholder="Căn 501"
              />
            </div>
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <Label htmlFor="postalCode">Mã bưu điện</Label>
            <Input
              id="postalCode"
              value={formData.postalCode || ""}
              onChange={(e) => handleInputChange("postalCode", e.target.value)}
              placeholder="10000"
              maxLength={5}
            />
          </div>

          {/* Delivery Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú giao hàng</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Gọi điện trước khi giao hàng, giao hàng giờ hành chính..."
              rows={3}
            />
          </div>

          {/* Set as Default */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault || false}
              onChange={(e) => handleInputChange("isDefault", e.target.checked)}
              className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
            />
            <Label
              htmlFor="isDefault"
              className="text-sm font-medium text-gray-700"
            >
              Đặt làm địa chỉ mặc định
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={!isFormValid}
              className="flex-1 bg-black text-white hover:bg-gray-800"
            >
              {mode === "add" ? "Thêm địa chỉ" : "Cập nhật địa chỉ"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-transparent"
            >
              Hủy
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
