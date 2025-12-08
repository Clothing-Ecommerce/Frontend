import type { ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Star, Film } from "lucide-react";
import type { OrderItemSummary, OrderItemReview } from "@/types/orderType";
import type { ReviewMediaType } from "@/types/orderType";

export type ReviewableOrderItem =
  | (OrderItemSummary & {
      orderId?: number;
      orderCode?: string;
      deliveredAt?: string | null;
    })
  | null;

export interface OrderReviewDialogProps {
  open: boolean;
  reviewItem: ReviewableOrderItem;
  reviewForm: {
    rating: number;
    details: string;
    files: File[];
  };
  reviewFilePreviews: string[];
  reviewLoading: boolean;
  existingReview: OrderItemReview | null;
  reviewError: string | null;
  reviewSubmitting: boolean;
  isSubmitDisabled: boolean;
  reviewDetailsMaxLength: number;
  reviewMaxFiles: number;
  reviewMaxFileSizeMb: number;
  formatOrderDate: (date: string) => string;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRatingChange: (value: number) => void;
  onDetailsChange: (value: string) => void;
  onFilesChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  mode?: "create" | "edit";
  title?: string;
  description?: string | null;
  submitButtonLabel?: string;
  cancelButtonLabel?: string;
  existingMediaPreviews?: {
    id: number | string;
    type: ReviewMediaType;
    url: string;
    thumbnailUrl?: string | null;
  }[];
}

export function OrderReviewDialog({
  open,
  reviewItem,
  reviewForm,
  reviewFilePreviews,
  reviewLoading,
  existingReview,
  reviewError,
  reviewSubmitting,
  isSubmitDisabled,
  reviewDetailsMaxLength,
  reviewMaxFiles,
  reviewMaxFileSizeMb,
  formatOrderDate,
  onOpenChange,
  onClose,
  onSubmit,
  onRatingChange,
  onDetailsChange,
  onFilesChange,
  onRemoveFile,
  mode = "create",
  title,
  description,
  submitButtonLabel,
  cancelButtonLabel,
  existingMediaPreviews = [],
}: OrderReviewDialogProps) {
  const isEditMode = mode === "edit";
  const effectiveTitle =
    title ?? (isEditMode ? "Edit review" : "Write a review");
  const effectiveDescription =
    description ??
    (isEditMode
      ? "Update your sharing about the product."
      : "Share your thoughts about the product to help other buyers.");
  const effectiveCancelLabel = cancelButtonLabel ?? "Cancel";
  const effectiveSubmitLabel =
    submitButtonLabel ?? (isEditMode ? "Save changes" : "Submit review");
  const shouldDisableInputs =
    reviewLoading || (!isEditMode && !!existingReview);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto overflow-x-hidden px-6 pt-4 pb-0 scrollbar-hide bg-white">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-semibold">
            {effectiveTitle}
          </DialogTitle>
          {effectiveDescription && (
            <DialogDescription>{effectiveDescription}</DialogDescription>
          )}
        </DialogHeader>

        {reviewItem && (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-lg border border-gray-200 bg-white">
                <img
                  src={reviewItem.imageUrl || "/placeholder.svg"}
                  alt={reviewItem.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {reviewItem.name}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-600">
                    {reviewItem.color && <span>Color: {reviewItem.color}</span>}
                    {reviewItem.size && (
                      <span className="rounded-full border border-gray-200 bg-white px-2 py-0.5 font-medium">
                        Size {reviewItem.size}
                      </span>
                    )}
                  </div>
                </div>
                {(reviewItem.orderCode || reviewItem.deliveredAt) && (
                  <div className="text-xs text-gray-500">
                    {reviewItem.orderCode && (
                      <span className="font-medium text-gray-700">
                        Order #{reviewItem.orderCode}
                      </span>
                    )}
                    {reviewItem.deliveredAt && (
                      <span>
                        {reviewItem.orderCode ? " – " : ""}
                        Delivered on {formatOrderDate(reviewItem.deliveredAt)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {reviewLoading && (
          <p className="mt-3 text-sm text-gray-500">
            Checking previous review...
          </p>
        )}
        {reviewError && (
          <p className="mt-3 text-sm text-red-600">{reviewError}</p>
        )}
        {!isEditMode && existingReview && (
          <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            <p className="font-semibold">You have already reviewed this product</p>
            <p className="mt-2">
              Rating {existingReview.rating}/5
              {existingReview.content
                ? ` – ${existingReview.content}`
                : " – No detailed content."}
            </p>
          </div>
        )}

        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-900">
                Rating
              </Label>
              <span className="text-xs text-gray-500">
                {reviewForm.rating > 0
                  ? `${reviewForm.rating}/5`
                  : "Select a star rating"}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, index) => {
                const value = index + 1;
                const isActive = reviewForm.rating >= value;
                return (
                  <button
                    key={`rating-${value}`}
                    type="button"
                    onClick={() => onRatingChange(value)}
                    className="rounded-full p-1 transition hover:-translate-y-0.5 hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                    disabled={shouldDisableInputs}
                    aria-label={`Select ${value} stars`}
                  >
                    <Star
                      className={`h-7 w-7 ${
                        isActive ? "text-amber-400" : "text-gray-300"
                      }`}
                      fill={isActive ? "currentColor" : "none"}
                      strokeWidth={isActive ? 1.5 : 1.25}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label
                htmlFor="review-details"
                className="text-sm font-medium text-gray-900"
              >
                Review content
              </Label>
              <span className="text-xs text-gray-500">
                {reviewForm.details.length}/{reviewDetailsMaxLength}
              </span>
            </div>
            <Textarea
              id="review-details"
              placeholder="Share more details about the quality, size, or your experience using the product"
              value={reviewForm.details}
              maxLength={reviewDetailsMaxLength}
              onChange={(event) => onDetailsChange(event.target.value)}
              className="mt-2 min-h-[120px] resize-none"
              disabled={shouldDisableInputs}
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-900">
              Images or videos{" "}
              <span className="text-gray-400">(Optional)</span>
            </Label>
            <p className="mt-1 text-xs text-gray-500">
              Up to {reviewMaxFiles} files, each {reviewMaxFileSizeMb}MB
            </p>
            <div className="mt-3">
              <label
                htmlFor="review-media-upload"
                className={`flex h-28 w-full flex-col items-center justify-center rounded-xl border border-dashed border-[#E8D7BF] bg-[#F8F3ED] text-center transition hover:border-[#D1A679] hover:bg-[#F3E9DC] ${
                  shouldDisableInputs
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer"
                }`}
                aria-disabled={shouldDisableInputs}
              >
                <Upload className="h-8 w-8 text-[#C59660]" />
                <span className="mt-2 text-sm font-medium text-[#A97B50]">
                  Click to upload images or videos
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  Supports JPG, PNG, MP4 formats
                </span>
              </label>
              <Input
                id="review-media-upload"
                type="file"
                className="sr-only"
                accept="image/*,video/*"
                multiple
                onChange={onFilesChange}
                disabled={shouldDisableInputs}
              />
            </div>

            {existingMediaPreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {existingMediaPreviews.map((media) => {
                  const isImage = media.type === "IMAGE";
                  const previewUrl = media.thumbnailUrl ?? media.url;
                  return (
                    <div
                      key={`existing-${media.id}`}
                      className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                    >
                      {isImage ? (
                        <img
                          src={previewUrl}
                          alt="Uploaded file"
                          className="h-28 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-28 w-full flex-col items-center justify-center gap-2 bg-gray-50 text-center text-xs text-gray-600">
                          <Film className="h-8 w-8 text-gray-400" />
                          <span className="px-2 text-[11px] font-medium">
                            Uploaded video
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-black/40 p-1 text-center text-[11px] font-medium text-white">
                        Uploaded
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {reviewForm.files.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {reviewForm.files.map((file, index) => {
                  const isImage = file.type.startsWith("image/");
                  const preview = reviewFilePreviews[index];

                  return (
                    <div
                      key={`${file.name}-${index}`}
                      className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                    >
                      {isImage && preview ? (
                        <img
                          src={preview}
                          alt={file.name}
                          className="h-28 w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-28 w-full flex-col items-center justify-center gap-2 bg-gray-50 text-center text-xs text-gray-600">
                          <Film className="h-8 w-8 text-gray-400" />
                          <span className="px-2 text-[11px] font-medium">
                            {file.name}
                          </span>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveFile(index)}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow transition hover:bg-white hover:text-gray-900"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 py-4 bg-white">
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={reviewSubmitting}
                className="w-1/2"
              >
                {effectiveCancelLabel}
              </Button>
              <Button
                type="submit"
                className="w-1/2 bg-[#D1A679] text-white hover:bg-[#C59660]"
                disabled={isSubmitDisabled}
              >
                {reviewSubmitting
                  ? isEditMode
                    ? "Saving..."
                    : "Submitting..."
                  : effectiveSubmitLabel}
              </Button>
            </DialogFooter>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default OrderReviewDialog;
