import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/utils/formatPrice";

export interface ProductSummaryInfo {
  id: number;
  name: string;
  brandName?: string | null;
  price: number;
  originalPrice?: number | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  inStock?: boolean | null;
  description?: string | null;
}

export interface ProductCardOverlays {
  topLeft?: ReactNode;
  topRight?: ReactNode;
  bottomLeft?: ReactNode;
  bottomRight?: ReactNode;
}

export interface ProductCardProps {
  product: ProductSummaryInfo;
  viewMode?: "grid" | "list";
  to?: string;
  onCardClick?: () => void;
  overlays?: ProductCardOverlays;
  showStockBadge?: boolean;
  showDescription?: boolean;
  priceSlot?: ReactNode;
  badgeSlot?: ReactNode;
  children?: ReactNode;
  className?: string;
  imageClassName?: string;
  contentClassName?: string;
}

export default function ProductCard({
  product,
  viewMode = "grid",
  to,
  onCardClick,
  overlays,
  showStockBadge = true,
  showDescription,
  priceSlot,
  badgeSlot,
  children,
  className,
  imageClassName,
  contentClassName,
}: ProductCardProps) {
  const {
    name,
    brandName,
    price,
    originalPrice,
    imageUrl,
    imageAlt,
    inStock,
    description,
  } = product;

  const resolvedImageUrl = imageUrl ?? "/placeholder.svg";
  const resolvedAlt = imageAlt ?? name;
  const resolvedShowDescription =
    typeof showDescription === "boolean" ? showDescription : viewMode === "list";

  const hasDiscount =
    typeof originalPrice === "number" && originalPrice > price && price >= 0;

  const defaultPriceSlot = (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "font-semibold text-amber-600",
          viewMode === "list" ? "text-xl" : "text-lg"
        )}
      >
        {formatPrice(price)}
      </span>
      {hasDiscount && (
        <span className="text-sm text-gray-500 line-through">
          {formatPrice(originalPrice)}
        </span>
      )}
    </div>
  );

  const defaultBadgeSlot =
    showStockBadge && typeof inStock === "boolean" ? (
      <Badge
        variant="secondary"
        className={cn(
          inStock
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : "bg-rose-50 text-rose-700 border border-rose-100"
        )}
      >
        {inStock ? "Còn hàng" : "Hết hàng"}
      </Badge>
    ) : null;

  return (
    <Card
      className={cn(
        "group overflow-hidden border-amber-100/70 hover:border-amber-200 hover:shadow-lg transition-all cursor-pointer",
        viewMode === "list"
          ? "flex flex-col sm:flex-row"
          : "relative",
        className
      )}
      onClick={onCardClick}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-amber-50/60",
          viewMode === "list"
            ? "sm:w-56 flex-shrink-0"
            : "aspect-[4/5] mx-4 mt-2 rounded-xl",
          imageClassName
        )}
      >
        {to ? (
          <Link to={to} className="block h-full">
            <img
              src={resolvedImageUrl}
              alt={resolvedAlt}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
        ) : (
          <img
            src={resolvedImageUrl}
            alt={resolvedAlt}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {overlays?.topLeft && (
          <div className="absolute left-3 top-3">{overlays.topLeft}</div>
        )}
        {overlays?.topRight && (
          <div className="absolute right-3 top-3">{overlays.topRight}</div>
        )}
        {overlays?.bottomLeft && (
          <div className="absolute left-3 bottom-3">{overlays.bottomLeft}</div>
        )}
        {overlays?.bottomRight && (
          <div className="absolute right-3 bottom-3">{overlays.bottomRight}</div>
        )}
      </div>

      <CardContent
        className={cn(
          viewMode === "list"
            ? "flex-1 p-6 space-y-4"
            : "px-6 pb-4 pt-4 space-y-2",
          contentClassName
        )}
      >
        <div className="space-y-1">
          {brandName && (
            <p className="text-xs uppercase tracking-wide text-amber-500">
              {brandName}
            </p>
          )}
          {to ? (
            <Link to={to} className="block">
              <h3
                className={cn(
                  "font-semibold text-gray-900 transition-colors",
                  viewMode === "list" ? "text-xl" : "text-lg",
                  "group-hover:text-amber-600"
                )}
              >
                {name}
              </h3>
            </Link>
          ) : (
            <h3
              className={cn(
                "font-semibold text-gray-900",
                viewMode === "list" ? "text-xl" : "text-lg"
              )}
            >
              {name}
            </h3>
          )}
        </div>

        {priceSlot ?? defaultPriceSlot}

        {badgeSlot ?? defaultBadgeSlot}

        {resolvedShowDescription && description && (
          <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
        )}

        {children}
      </CardContent>
    </Card>
  );
}