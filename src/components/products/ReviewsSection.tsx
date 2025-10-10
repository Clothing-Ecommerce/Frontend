import { useMemo, useState } from "react";
import { Star, MessageSquare, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Review } from "@/types/productType";

interface ReviewsSectionProps {
  reviews?: Review[] | null;
  isLoading?: boolean;
  highlightedReviewId?: number | null;
}

const ratingFilters = [5, 4, 3, 2, 1] as const;

const RatingStars = ({ rating }: { rating: number }) => {
  const roundedRating = Math.round(rating * 2) / 2;
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = roundedRating >= starValue;
        const isHalf = !isFilled && roundedRating + 0.5 >= starValue;
        return (
          <Star
            key={starValue}
            className={`h-4 w-4 ${isFilled ? "text-yellow-400" : "text-gray-300"}`}
            fill={isFilled || isHalf ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
        );
      })}
    </div>
  );
};

const formatReviewDate = (value?: string | null) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsed);
};

export const ReviewsSection = ({
  reviews = [],
  isLoading = false,
  highlightedReviewId = null,
}: ReviewsSectionProps) => {
  const safeReviews = reviews ?? [];
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const totalReviews = safeReviews.length;

  const averageRating = useMemo(() => {
    if (totalReviews === 0) {
      return 0;
    }
    const total = safeReviews.reduce(
      (acc, review) => acc + (review.rating || 0),
      0
    );
    return total / totalReviews;
  }, [safeReviews, totalReviews]);

  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    safeReviews.forEach((review) => {
      const rounded = Math.min(5, Math.max(1, Math.round(review.rating)));
      counts[rounded] += 1;
    });
    return counts;
  }, [safeReviews]);

  const sortedReviews = useMemo(() => {
    return [...safeReviews].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [safeReviews]);

  const filteredReviews = useMemo(() => {
    if (!selectedRating) {
      return sortedReviews;
    }
    return sortedReviews.filter(
      (review) => Math.round(review.rating) === selectedRating
    );
  }, [sortedReviews, selectedRating]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse rounded-2xl border bg-white p-6 shadow-sm lg:p-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-3">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-10 w-20 rounded bg-gray-200" />
              <div className="h-4 w-16 rounded bg-gray-200" />
            </div>
            <div className="space-y-2 lg:col-span-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-3 rounded-full bg-gray-200" />
              ))}
            </div>
          </div>
        </div>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-2xl border bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4">
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-3/4 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-white p-6 shadow-sm lg:p-8">
        {totalReviews > 0 ? (
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="lg:w-1/4">
              <p className="text-sm font-medium text-gray-500">Điểm trung bình</p>
              <div className="mt-3 flex items-end gap-2">
                <span className="text-4xl font-semibold text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">/5</span>
              </div>
              <div className="mt-2">
                <RatingStars rating={averageRating} />
              </div>
              <p className="mt-4 text-sm text-gray-500">
                Dựa trên {totalReviews} đánh giá từ khách hàng thực tế.
              </p>
            </div>
            <div className="lg:w-2/4 space-y-3">
              {ratingFilters.map((rating) => {
                const count = ratingCounts[rating] ?? 0;
                const percent = totalReviews
                  ? Math.round((count / totalReviews) * 100)
                  : 0;
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="w-10 text-sm font-medium text-gray-600">
                      {rating}★
                    </span>
                    <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-yellow-400 transition-all"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm text-gray-500">
                      {percent}%
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="lg:w-1/4">
              <div className="rounded-2xl bg-blue-50 p-6 text-center">
                <h4 className="text-base font-semibold text-blue-700">
                  Chia sẻ trải nghiệm
                </h4>
                <p className="mt-3 text-sm text-blue-600">
                  Giúp những người mua khác bằng cách để lại bình luận về sản
                  phẩm.
                </p>
                <Button className="mt-6 w-full" type="button">
                  Viết đánh giá
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="rounded-full bg-blue-50 p-4 text-blue-600">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Chưa có bình luận nào
              </h3>
              <p className="text-sm text-gray-500">
                Hãy là người đầu tiên chia sẻ cảm nhận của bạn về sản phẩm này.
              </p>
            </div>
            <Button type="button">Viết đánh giá ngay</Button>
          </div>
        )}
      </div>

      {totalReviews > 0 && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Bình luận từ khách hàng
              </h3>
              <p className="text-sm text-gray-500">
                Xem những chia sẻ thực tế sau khi trải nghiệm sản phẩm.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant={selectedRating === null ? "default" : "outline"}
                onClick={() => setSelectedRating(null)}
              >
                Tất cả ({totalReviews})
              </Button>
              {ratingFilters.map((rating) => {
                const count = ratingCounts[rating] ?? 0;
                return (
                  <Button
                    key={rating}
                    type="button"
                    variant={selectedRating === rating ? "default" : "outline"}
                    onClick={() =>
                      setSelectedRating((current) =>
                        current === rating ? null : rating
                      )
                    }
                    disabled={count === 0}
                    className={
                      count === 0
                        ? "pointer-events-none opacity-50"
                        : undefined
                    }
                  >
                    {rating} sao ({count})
                  </Button>
                );
              })}
            </div>
          </div>

          {filteredReviews.length > 0 ? (
            <div className="space-y-4">
              {filteredReviews.map((review) => {
                const isHighlighted =
                  highlightedReviewId != null &&
                  review.id === highlightedReviewId;
                const username = review.user?.username
                  ? review.user.username.trim()
                  : "";
                const reviewerName =
                  username.length > 0 ? username : "Khách hàng";
                const avatarUrl = review.user?.avatar ?? null;
                return (
                <article
                  key={review.id}
                  className={`rounded-2xl border bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
                    isHighlighted
                      ? "border-amber-300 ring-2 ring-amber-200"
                      : ""
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`Ảnh đại diện của ${reviewerName}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <UserRound className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {reviewerName}
                        </span>
                        <RatingStars rating={review.rating} />
                        {isHighlighted && (
                          <Badge variant="default" className="rounded-full bg-amber-100 text-amber-700">
                            Đánh giá của bạn
                          </Badge>
                        )}
                        {review.isPublished === false && (
                          <Badge variant="outline" className="rounded-full">
                            Chờ duyệt
                          </Badge>
                        )}
                      </div>
                      {review.content && (
                        <p className="text-sm leading-relaxed text-gray-600">
                          {review.content}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {formatReviewDate(review.createdAt) && (
                          <span>Đăng ngày {formatReviewDate(review.createdAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed bg-gray-50 p-10 text-center text-sm text-gray-500">
              Chưa có bình luận {selectedRating} sao.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;