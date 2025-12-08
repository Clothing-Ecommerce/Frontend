import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertTriangle } from "lucide-react"

interface DeleteAddressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  addressLabel: string
  onConfirm: () => void
}

export function DeleteAddressDialog({ open, onOpenChange, addressLabel, onConfirm }: DeleteAddressDialogProps) {
  const handleConfirm = () => {
    onConfirm()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete Address</DialogTitle>
              <DialogDescription>Are you sure you want to delete the address "{addressLabel}"?</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Note:</strong> This action cannot be undone. The address will be permanently deleted from your
              account.
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleConfirm} className="flex-1 bg-red-600 text-white hover:bg-red-700">
              Delete Address
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
