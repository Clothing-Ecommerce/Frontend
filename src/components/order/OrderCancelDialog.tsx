import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

export interface CancelReasonOption {
  value: string;
  label: string;
  description?: string;
  requiresDetails?: boolean;
}

export interface OrderCancelDialogProps {
  open: boolean;
  reasons: CancelReasonOption[];
  selectedReason: string;
  customReason: string;
  submitting?: boolean;
  errorMessage?: string | null;
  onOpenChange: (open: boolean) => void;
  onSelectReason: (value: string) => void;
  onCustomReasonChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function OrderCancelDialog({
  open,
  reasons,
  selectedReason,
  customReason,
  submitting = false,
  errorMessage,
  onOpenChange,
  onSelectReason,
  onCustomReasonChange,
  onSubmit,
}: OrderCancelDialogProps) {
  const selectedReasonConfig = reasons.find(
    (reason) => reason.value === selectedReason
  );
  const showCustomTextarea = selectedReasonConfig?.requiresDetails;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(event);
          }}
        >
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-lg font-semibold">
              Hủy đơn hàng
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Chúng tôi rất tiếc khi phải hủy đơn hàng của bạn. Xin vui lòng
              cho chúng tôi biết lý do hủy để cải thiện dịch vụ trong tương lai.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-900">
                Chọn lý do hủy đơn hàng
              </Label>
              <RadioGroup className="space-y-3">
                {reasons.map((reason) => {
                  const isSelected = selectedReason === reason.value;
                  return (
                    <label
                      key={reason.value}
                      className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300"
                    >
                      <RadioGroupItem
                        name="order-cancel-reason"
                        value={reason.value}
                        checked={isSelected}
                        onChange={() => onSelectReason(reason.value)}
                        disabled={submitting}
                        className="mt-1"
                        aria-describedby={
                          reason.description
                            ? `order-cancel-reason-${reason.value}`
                            : undefined
                        }
                      />
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900">
                          {reason.label}
                        </p>
                        {reason.description && (
                          <p
                            id={`order-cancel-reason-${reason.value}`}
                            className="text-sm text-gray-500"
                          >
                            {reason.description}
                          </p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>

            {showCustomTextarea && (
              <div className="space-y-2">
                <Label htmlFor="cancel-order-custom-reason">
                  Mô tả chi tiết lý do hủy
                </Label>
                <Textarea
                  id="cancel-order-custom-reason"
                  placeholder="Vui lòng chia sẻ thêm thông tin..."
                  value={customReason}
                  onChange={(event) => onCustomReasonChange(event.target.value)}
                  disabled={submitting}
                  rows={4}
                />
              </div>
            )}

            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Quay lại
            </Button>
            <Button type="submit" variant="destructive" disabled={submitting}>
              {submitting ? "Đang hủy..." : "Xác nhận hủy đơn"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}