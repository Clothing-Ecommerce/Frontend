import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, X, Wallet, CreditCard } from "lucide-react"

interface PaymentMethod {
  id: string
  name: string
  description: string
  icon: "momo" | "cod" | "card"
}

interface SelectPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentMethods: PaymentMethod[]
  selectedPaymentId: string
  onSelectPayment: (paymentId: string) => void
}

export function SelectPaymentDialog({
  open,
  onOpenChange,
  paymentMethods,
  selectedPaymentId,
  onSelectPayment,
}: SelectPaymentDialogProps) {
  const handleSelect = (paymentId: string) => {
    onSelectPayment(paymentId)
    onOpenChange(false)
  }

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case "momo":
        return (
          <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center">
            <span className="text-pink-600 font-bold text-xl">M</span>
          </div>
        )
      case "cod":
        return (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-gray-600" />
          </div>
        )
      case "card":
        return (
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-600" />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-xl font-semibold">Select Payment Method</DialogTitle>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const isSelected = method.id === selectedPaymentId
            return (
              <button
                key={method.id}
                onClick={() => handleSelect(method.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {getIcon(method.icon)}
                    <div>
                      <p className="font-medium text-gray-900">{method.name}</p>
                      <p className="text-sm text-gray-600">{method.description}</p>
                    </div>
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
