// components/products/ProductListItem.tsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import type { Product } from "@/types/productType"; // Đảm bảo import đúng

interface ProductListItemProps {
  product: Product;
}

export function ProductListItem({ product }: ProductListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-0">
          <div className="flex p-6 gap-6">
            <div className="relative flex-shrink-0">
              <img
                src={product.images?.[0] || "/placeholder.svg"}
                alt={product.name}
                width={150}
                height={150}
                className="w-32 h-32 object-cover rounded-lg"
              />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isNew && (
                  <Badge variant="secondary" className="bg-blue-500 text-white">
                    New
                  </Badge>
                )}
                {product.isSale && (
                  <Badge variant="destructive" className="bg-red-500 text-white">
                    Sale
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                <Link to={`/products/${product.productId}`}>{product.name}</Link> {/* Sử dụng product_id */}
              </h3>
              <p className="text-sm text-gray-600 mb-2">Brand: {product.brand?.name || "Unknown Brand"}</p> {/* Sử dụng product.brand?.name */}
              <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                {product.description || "No description available."} {/* Sử dụng description */}
              </p>
              <div className="flex items-center gap-4 mb-4">
                <Button size="sm" variant="outline">
                  <Heart className="h-4 w-4 mr-2" /> Wishlist
                </Button>
                <Button size="sm">
                  <ShoppingCart className="h-4 w-4 mr-2" /> Add to cart
                </Button>
              </div>
              <div className="flex items-center mb-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  ({product.reviews})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-gray-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                <Link to={`/products/${product.productId}`}> {/* Sử dụng product_id */}
                  <Button>View Details</Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}