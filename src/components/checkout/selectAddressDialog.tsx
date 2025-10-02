import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, X, MapPin, Home, Briefcase } from "lucide-react"

interface Address {
  id: number
  name: string
  phone: string
  address: string
  isDefault: boolean
  type: "Home" | "Work" | "Other"
}

interface SelectAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addresses: Address[]
  selectedAddressId: number
  onSelectAddress: (addressId: number) => void
}

export function SelectAddressDialog({
  open,
  onOpenChange,
  addresses,
  selectedAddressId,
  onSelectAddress,
}: SelectAddressDialogProps) {
  const handleSelect = (addressId: number) => {
    onSelectAddress(addressId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold">Select Shipping Address</DialogTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {addresses.map((address) => {
            const isSelected = address.id === selectedAddressId
            return (
              <button
                key={address.id}
                onClick={() => handleSelect(address.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">{address.name}</span>
                      {address.isDefault && (
                        <span className="px-2 py-0.5 bg-gray-900 text-white text-xs rounded font-medium">Default</span>
                      )}
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium flex items-center gap-1">
                        {address.type === "Home" ? (
                          <>
                            <Home className="w-3 h-3" />
                            Home
                          </>
                        ) : address.type === "Work" ? (
                          <>
                            <Briefcase className="w-3 h-3" />
                            Work
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3 h-3" />
                            Other
                          </>
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1">{address.phone}</p>
                    <p className="text-sm text-gray-600">{address.address}</p>
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
            )
          })}
        </div>
      </DialogContent>
    </Dialog>
  )
}
