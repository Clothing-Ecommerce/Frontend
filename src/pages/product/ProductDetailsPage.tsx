import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
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
  Loader2,
  Frown,
} from "lucide-react";
import { motion } from "framer-motion";
import api from "@/utils/axios";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/useToast";
import axios from "axios";
import { formatPrice } from "@/utils/formatPrice";
import type { Product, ProductVariant, ColorOption } from "@/types/productType";
import type { ProductListResponse } from "@/types/productType";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [isLoadingRelated, setIsLoadingRelated] = useState(true);
  const [errorProduct, setErrorProduct] = useState<string | null>(null);
  const [errorRelated, setErrorRelated] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState(0);
  const [colorOptions, setColorOptions] = useState<ColorOption[]>([]);
  const [sizeOptions, setSizeOptions] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { toasts, toast, removeToast } = useToast();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoadingProduct(true);
      setErrorProduct(null);
      try {
        const res = await api.get(`/products/${id}`);
        const data: Product = {
          ...res.data,
          basePrice: Number(res.data.basePrice),
          images: res.data.images || [],
          variants: res.data.variants?.map(
            (v: Omit<ProductVariant, "price"> & { price: string | null }) => ({
              ...v,
              price: v.price ? Number(v.price) : null,
            })
          ),
        };
        setProduct(data);
        // build color and size options from variants
        const colorsMap = new Map<number, ColorOption>();
        const sizesSet = new Set<string>();
        data.variants?.forEach((variant) => {
          if (variant.color) {
            colorsMap.set(variant.color.id, {
              name: variant.color.name,
              value: variant.color.hex || "#000000",
            });
          }
          if (variant.size?.name) {
            sizesSet.add(variant.size.name);
          }
        });
        const colors = Array.from(colorsMap.values());
        const sizes = Array.from(sizesSet.values());
        setColorOptions(colors);
        setSizeOptions(sizes);
        if (colors.length > 0) setSelectedColor(colors[0]);
        if (sizes.length > 0) setSelectedSize(sizes[0]);
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
        const res = await api.get<ProductListResponse>(`/products`, {
          params: { category: String(product.categoryId), pageSize: 4 },
        });
        const productsData: Product[] = res.data.products
          .filter((p: any) => p.id !== product.id)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            description: "",
            basePrice: Number(p.effectivePrice),
            categoryId: p.category?.id ?? 0,
            brandId: p.brand?.id ?? null,
            createdAt: "",
            updatedAt: "",
            category: p.category
              ? { id: p.category.id, name: p.category.name }
              : undefined,
            brand: p.brand ? { id: p.brand.id, name: p.brand.name } : undefined,
            images: p.image
              ? [
                  {
                    id: p.image.id,
                    productId: p.id,
                    url: p.image.url,
                    alt: p.image.alt ?? null,
                    isPrimary: true,
                    sortOrder: 0,
                  },
                ]
              : [],
            variants: [],
          }));
        setRelatedProducts(productsData);
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
  }, [product]);

  // helpers for active SALE & effective price
  const nowActive = (startAt?: string | null, endAt?: string | null) => {
    const now = Date.now();
    const sOk = !startAt || new Date(startAt).getTime() <= now;
    const eOk = !endAt || new Date(endAt).getTime() >= now;
    return sOk && eOk;
  };
  const getVariantEffectivePrice = (
    prodBase: number,
    v?: ProductVariant | null
  ) => {
    if (!v) return prodBase;
    const sale = v.prices?.find(
      (p) => p.type === "SALE" && nowActive(p.startAt, p.endAt)
    );
    if (sale) return Number(sale.amount);
    if (v.price != null) return v.price;
    return prodBase;
  };

  const selectedVariant = product?.variants?.find(
    (v) =>
      (!selectedSize || v.size?.name === selectedSize) &&
      (!selectedColor || v.color?.name === selectedColor.name)
  );
  const displayPrice = getVariantEffectivePrice(
    product?.basePrice ?? 0,
    selectedVariant
  );
  const stockCount = selectedVariant?.stock ?? 0;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error("Selection required", "Please select a size");
      return;
    }
    if (!selectedVariant) {
      toast.error("Unavailable", "Selected variant is unavailable");
      return;
    }
    try {
      await api.post("/cart/", {
        variantId: selectedVariant.id,
        quantity,
      });
      toast.success("Added to Cart", "Product added to your cart");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error("Error", error.response.data.message);
      } else {
        toast.error("Error", "Failed to add to cart");
      }
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <span className="ml-3 text-lg text-gray-700">Loading product...</span>
      </div>
    );
  }

  if (errorProduct || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-red-600">
        <Frown className="h-12 w-12 mb-4" />
        <p className="text-xl">{errorProduct || "Product not found."}</p>
      </div>
    );
  }

  const features = Array.isArray(product.features)
    ? (product.features as string[])
    : [];
  const specifications = product.specifications || {};

  return (
    <div className="min-h-screen bg-white">
      <ToastContainer
        toasts={toasts.map((toastObj) => ({
          ...toastObj,
          onClose: removeToast,
        }))}
        onClose={removeToast}
      />

      {/* Header */}
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link to="/products/all" className="hover:text-gray-900">
              Products
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

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
                src={product.images?.[selectedImage]?.url || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-96 lg:h-[500px] object-cover rounded-lg shadow-lg"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {product.images?.map((image, index) => (
                <motion.button
                  key={image.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedImage(index)}
                  className={`relative rounded-lg overflow-hidden ${
                    selectedImage === index ? "ring-2 ring-blue-600" : ""
                  }`}
                >
                  <img
                    src={image.url}
                    alt={image.alt || `${product.name} ${index + 1}`}
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
                {/* Display category name if available */}
                {product.category?.name || product.categoryId}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {/* Display brand name if available */}
                {product.brand?.name || product.brandId}
              </p>
              <div className="flex items-center mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 ml-2">0 reviews</span>
              </div>
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(displayPrice)}
                </span>
              </div>
            </div>
            {/* color selection */}
            {colorOptions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">
                  Color: {selectedColor?.name || "Select a color"}
                </h3>
                <div className="flex space-x-3">
                  {colorOptions.map((color) => (
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
            )}
            {/* size selection */}
            {sizeOptions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Size</h3>
                <div className="grid grid-cols-6 gap-2">
                  {sizeOptions.map((size) => (
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
            )}
            {/* quantity */}
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
                    setQuantity(Math.min(stockCount, quantity + 1))
                  }
                  disabled={quantity >= stockCount}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 ml-4">
                  {stockCount} items in stock
                </span>
              </div>
            </div>
            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 h-12 text-lg font-semibold w-full bg-black text-white hover:bg-gray-800"
                  disabled={stockCount <= 0}
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
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-700 mb-6">{product.description}</p>
                  {features.length > 0 && (
                    <>
                      <h4 className="font-semibold mb-4">Key Features:</h4>
                      <ul className="grid grid-cols-2 gap-2">
                        {features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <Check className="h-4 w-4 text-green-500 mr-2" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {Object.keys(specifications).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(specifications).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between py-2 border-b"
                        >
                          <span className="font-medium">{key}:</span>
                          <span className="text-gray-600">{String(value)}</span>
                        </div>
                      ))}
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
                  <p className="text-gray-600">No reviews yet.</p>
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
                  key={relatedProduct.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-0">
                      <img
                        src={
                          relatedProduct.images[0]?.url || "/placeholder.svg"
                        }
                        alt={relatedProduct.name}
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
                                  i < Math.floor(0)
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">
                            {formatPrice(relatedProduct.basePrice)}
                          </span>
                          <Link to={`/products/${relatedProduct.id}`}>
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
      <Footer />
    </div>
  );
}
