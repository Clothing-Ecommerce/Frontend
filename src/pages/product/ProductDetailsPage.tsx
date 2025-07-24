import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  Plus,
  Minus,
  Check,
  Loader2, // Added for loading indicator
  Frown, // Added for error indicator
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";

import { formatPrice } from "@/utils/formatPrice";
import type { ColorOption, Product } from "@/types/productType";
import api from "@/utils/axios";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>(); // Get product ID from URL
  //   const productId = parseInt(id || "0") // Convert to number

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);
  const [errorProduct, setErrorProduct] = useState<string | null>(null);
  const [errorRelated, setErrorRelated] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoadingProduct(true);
      setErrorProduct(null);
      try {
        const response = await api.get<Product>(`/products/${id}`); // Adjust API endpoint
        setProduct(response.data);
        // Set initial selected color if product data is available
        if (response.data.colors && response.data.colors.length > 0) {
          setSelectedColor(response.data.colors[0]);
        }
      } catch (err) {
        setErrorProduct("Failed to load product details.");
        console.error("Error fetching product:", err);
      } finally {
        setIsLoadingProduct(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Fetch related products
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      setIsLoadingRelated(true);
      setErrorRelated(null);
      if (!product?.categoryId) {
        setIsLoadingRelated(false);
        return;
      }
      try {
        const response = await api.get<Product[]>(
          `products/related?categoryId=${product.categoryId}&currentProductId=${id}`
        );
        setRelatedProducts(response.data);
      } catch (err) {
        setErrorRelated("Failed to load related products.");
        console.error("Error fetching related products:", err);
      } finally {
        setIsLoadingRelated(false);
      }
    };

    if (product) {
      fetchRelatedProducts();
    }
  }, [product, id]);

  const handleAddToCart = () => {
    if (!product) return; // Ensure product data is loaded
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }
    // Add to cart logic here
    console.log("Added to cart:", {
      product: product.productId,
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
    // In a real app, you'd dispatch an action to a cart context/store
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="ml-3 text-lg text-gray-700">Loading product...</span>
      </div>
    );
  }

  if (errorProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-600">
        <Frown className="h-12 w-12 mb-4" />
        <p className="text-xl">{errorProduct}</p>
        <p className="text-sm text-gray-500">
          Please try again later or contact support.
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-600">
        <Frown className="h-12 w-12 mb-4" />
        <p className="text-xl">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/products/all"
                className="inline-flex items-center text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">CF</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  ClothingFashion
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>
              <Link to="/profile">
                <Button variant="outline">Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="relative">
              <img
                src={product.images?.[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-96 lg:h-[500px] object-cover rounded-lg shadow-lg"
              />
              {product.isSale && (
                <Badge className="absolute top-4 left-4 bg-red-500 text-white">
                  Sale
                </Badge>
              )}
              {product.isNew && (
                <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                  New
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {product.images?.map((image, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(index)}
                  className={`relative rounded-lg overflow-hidden ${
                    selectedImage === index ? "ring-2 ring-blue-600" : ""
                  }`}
                >
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-20 object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.category?.name || product.categoryId}{" "}
                {/* Display category name if available */}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {product.brand?.name || product.brandId}
              </p>{" "}
              {/* Display brand name if available */}
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">
                  {product.rating || 0} ({product.reviewsCount || 0} reviews)
                </span>
              </div>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                {product.originalPrice && (
                  <Badge className="bg-red-500">
                    Save{" "}
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100
                    )}
                    %
                  </Badge>
                )}
              </div>
            </div>
            {/* Color Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Color: {selectedColor?.name || "Select a color"}
              </h3>
              <div className="flex space-x-3">
                {product.colors?.map((color: ColorOption) => (
                  <motion.button
                    key={color.name}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 ${
                      selectedColor?.name === color.name
                        ? "border-blue-600 ring-2 ring-blue-200"
                        : "border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {selectedColor?.name === color.name && (
                      <Check className="h-4 w-4 text-white mx-auto" />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
            {/* Size Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Size</h3>
              <div className="grid grid-cols-6 gap-2">
                {product.sizes?.map((size: string) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    onClick={() => setSelectedSize(size)}
                    className="h-12"
                  >
                    {size}
                  </Button>
                ))}
              </div>
              <Link
                to="/size-guide"
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                Size Guide
              </Link>
            </div>
            {/* Quantity */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Quantity</h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-semibold w-12 text-center">
                  {quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setQuantity(Math.min(product.stockCount, quantity + 1))
                  }
                  disabled={quantity >= product.stockCount}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 ml-4">
                  {product.stockCount} items in stock
                </span>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 bg-transparent"
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isWishlisted ? "fill-current text-red-500" : ""
                    }`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 bg-transparent"
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full h-12 text-lg bg-transparent"
              >
                Buy Now
              </Button>
            </div>
            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b">
              <div className="text-center">
                <Truck className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Free Shipping</p>
                <p className="text-xs text-gray-600">Orders over 500k</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Easy Returns</p>
                <p className="text-xs text-gray-600">30-day policy</p>
              </div>
              <div className="text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Secure Payment</p>
                <p className="text-xs text-gray-600">SSL protected</p>
              </div>
            </div>
          </motion.div>
        </div>
        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({product.reviewsCount || 0})
              </TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-6">{product.description}</p>
                  {product.features && product.features.length > 0 && (
                    <>
                      <h4 className="font-semibold mb-4">Key Features:</h4>
                      <ul className="grid grid-cols-2 gap-2">
                        {product.features.map(
                          (feature: string, index: number) => (
                            <li key={index} className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              {feature}
                            </li>
                          )
                        )}
                      </ul>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {product.specifications &&
                  Object.keys(product.specifications).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(product.specifications).map(
                        ([key, value]) => (
                          <div
                            key={key}
                            className="flex justify-between py-2 border-b"
                          >
                            <span className="font-medium">{key}:</span>
                            <span className="text-gray-600">{value}</span>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      No specifications available.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* {product.reviewsCount.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold">{review.name}</span>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-600">{review.date}</span>
                        </div>
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))} */}
                    {Array.isArray(product.reviewsCount) &&
                    product.reviewsCount.length > 0 ? (
                      product.reviewsCount.map((review) => (
                        <div
                          key={review.id}
                          className="border-b pb-6 last:border-b-0"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold">
                                {review.name}
                              </span>
                              {review.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  Verified Purchase
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-gray-600">
                              {review.date}
                            </span>
                          </div>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-600">No reviews yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="shipping" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Shipping Options</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li>
                          • Standard Shipping (3-5 business days): Free for
                          orders over 500,000 VND
                        </li>
                        <li>
                          • Express Shipping (1-2 business days): 50,000 VND
                        </li>
                        <li>
                          • Same Day Delivery (Ho Chi Minh City only): 100,000
                          VND
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Return Policy</h4>
                      <p className="text-gray-700">
                        We offer a 30-day return policy for all items. Items
                        must be in original condition with tags attached.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
        {/* Related Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            You Might Also Like
          </h2>
          {isLoadingRelated ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">
                Loading related products...
              </span>
            </div>
          ) : errorRelated ? (
            <div className="flex flex-col items-center justify-center text-red-600 h-40">
              <Frown className="h-10 w-10 mb-2" />
              <p className="text-lg">{errorRelated}</p>
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <motion.div
                  key={relatedProduct.productId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-0">
                      <img
                        src={relatedProduct.images[0] || "/placeholder.svg"} // Use the first image from the array
                        alt={relatedProduct.name}
                        width={200}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {relatedProduct.name}
                        </h3>
                        <div className="flex items-center mb-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(relatedProduct.rating || 0)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-gray-600 ml-1">
                            {relatedProduct.rating || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">
                            {formatPrice(relatedProduct.price)}
                          </span>
                          <Link to={`/products/${relatedProduct.productId}`}>
                            <Button size="sm">View</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-600">No related products found.</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
