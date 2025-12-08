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
    label: "HOME",
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

  // load provinces when opening dialog
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

  // when provinceCode changes → load districts, reset wards
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!open) return;
      if (!formData.provinceCode) { setDistricts([]); setWards([]); return; }
      setLoadingDistricts(true);
      try {
        const list = await getDistricts(formData.provinceCode);
        if (alive) setDistricts(list);
        if (alive) setWards([]); // reset wards when district changes
      } finally {
        if (alive) setLoadingDistricts(false);
      }
    })();
    return () => { alive = false; };
  }, [open, formData.provinceCode, getDistricts]);

  // when districtCode changes → load wards
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

  // sync form when dialog opens or address changes
  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && address) {
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
            {mode === "add" ? "Add New Address" : "Edit Address"}
          </DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Add a new shipping address"
              : "Update shipping address information"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Address Label *</Label>
            <Select
              value={formData.label}
              onValueChange={(value: "HOME" | "WORK" | "OTHER") =>
                handleInputChange("label", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HOME">Home</SelectItem>
                <SelectItem value="WORK">Workplace</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Name *</Label>
              <Input
                id="recipient"
                value={formData.recipient}
                onChange={(e) => handleInputChange("recipient", e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
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
            <Label htmlFor="company">Company Name (optional)</Label>
            <Input
              id="company"
              value={formData.company || ""}
              onChange={(e) => handleInputChange("company", e.target.value)}
              placeholder="ABC Company Ltd."
            />
          </div>

          {/* Administrative Divisions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">Province/City *</Label>
              <Select
                value={formData.provinceCode ?? ""}
                onValueChange={handleProvinceChange}
                disabled={loadingProvinces}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select province/city" />
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
              <Label htmlFor="district">District *</Label>
              <Select
                value={formData.districtCode ?? ""}
                onValueChange={handleDistrictChange}
                disabled={!formData.provinceCode || loadingDistricts}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !formData.provinceCode
                      ? "Select province first"
                      : (loadingDistricts ? "Loading..." : "Select district")
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
              <Label htmlFor="ward">Ward/Commune *</Label>
              <Select
                value={formData.wardCode ?? ""}
                onValueChange={handleWardChange}
                disabled={!formData.districtCode || loadingWards}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !formData.districtCode
                      ? "Select district first"
                      : (loadingWards ? "Loading..." : "Select ward/commune")
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
              <Label htmlFor="houseNumber">House Number / Alley</Label>
              <Input
                id="houseNumber"
                value={formData.houseNumber || ""}
                onChange={(e) =>
                  handleInputChange("houseNumber", e.target.value)
                }
                placeholder="123, Alley 45"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="street">Street Name</Label>
              <Input
                id="street"
                value={formData.street || ""}
                onChange={(e) => handleInputChange("street", e.target.value)}
                placeholder="Lang Street"
              />
            </div>
          </div>

          {/* Building Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="building">Building / Area</Label>
              <Input
                id="building"
                value={formData.building || ""}
                onChange={(e) => handleInputChange("building", e.target.value)}
                placeholder="Building A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="block">Block / Lot</Label>
              <Input
                id="block"
                value={formData.block || ""}
                onChange={(e) => handleInputChange("block", e.target.value)}
                placeholder="Block B"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                value={formData.floor || ""}
                onChange={(e) => handleInputChange("floor", e.target.value)}
                placeholder="5th Floor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room">Room / Unit</Label>
              <Input
                id="room"
                value={formData.room || ""}
                onChange={(e) => handleInputChange("room", e.target.value)}
                placeholder="Unit 501"
              />
            </div>
          </div>

          {/* Postal Code */}
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
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
            <Label htmlFor="notes">Delivery Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Call before delivery, deliver during working hours..."
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
              Set as default address
            </Label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={!isFormValid}
              className="flex-1 bg-black text-white hover:bg-gray-800"
            >
              {mode === "add" ? "Add Address" : "Update Address"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
