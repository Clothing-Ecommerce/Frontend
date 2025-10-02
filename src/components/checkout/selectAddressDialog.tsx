import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X, MapPin, Home, Briefcase } from "lucide-react";
import type { Address } from "@/types/addressType";

type CheckoutAddress = Address & { addressId: number };

interface SelectAddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addresses: CheckoutAddress[];
  selectedAddressId: number | null;
  onSelectAddress: (addressId: number) => void;
}

const getLabelInfo = (label: CheckoutAddress["label"] | null | undefined) => {
  switch (label) {
    case "HOME":
      return { text: "Home", Icon: Home };
    case "WORK":
      return { text: "Work", Icon: Briefcase };
    default:
      return { text: "Other", Icon: MapPin };
  }
};

const formatAddress = (address: CheckoutAddress) => {
  const mainParts = [
    address.houseNumber,
    address.street,
    address.wardName,
    address.districtName,
    address.provinceName,
    address.postalCode,
  ].filter(Boolean);

  const buildingParts = [address.building, address.block, address.floor, address.room].filter(Boolean);

  let formatted = mainParts.join(", ");
  if (buildingParts.length) {
    formatted = formatted ? `${buildingParts.join(", ")}, ${formatted}` : buildingParts.join(", ");
  }

  if (address.country) {
    formatted = formatted ? `${formatted}, ${address.country}` : address.country;
  }

  return formatted;
};

export function SelectAddressDialog({
  open,
  onOpenChange,
  addresses,
  selectedAddressId,
  onSelectAddress,
}: SelectAddressDialogProps) {
  const handleSelect = (addressId: number) => {
    onSelectAddress(addressId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold">Chọn địa chỉ giao hàng</DialogTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {addresses.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">
              You don't have any saved addresses yet.
            </div>
          ) : (
            addresses.map((address) => {
              const isSelected = address.addressId === selectedAddressId;
              const { text, Icon } = getLabelInfo(address.label);
              return (
                <button
                  key={address.addressId}
                  onClick={() => handleSelect(address.addressId)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">{address.recipient}</span>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 bg-gray-900 text-white text-xs rounded font-medium">Default</span>
                        )}
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium flex items-center gap-1">
                          <Icon className="w-3 h-3" />
                          {text}
                        </span>
                      </div>
                      {address.phone && <p className="text-sm text-gray-700 mb-1">{address.phone}</p>}
                      <p className="text-sm text-gray-600">{formatAddress(address)}</p>
                    </div>
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}