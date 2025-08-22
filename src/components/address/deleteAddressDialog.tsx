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
              <DialogTitle>Xóa địa chỉ</DialogTitle>
              <DialogDescription>Bạn có chắc chắn muốn xóa địa chỉ "{addressLabel}" không?</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Lưu ý:</strong> Hành động này không thể hoàn tác. Địa chỉ sẽ bị xóa vĩnh viễn khỏi tài khoản của
              bạn.
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleConfirm} className="flex-1 bg-red-600 text-white hover:bg-red-700">
              Xóa địa chỉ
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 bg-transparent">
              Hủy
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
