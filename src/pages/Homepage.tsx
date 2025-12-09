import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Heart, Loader2, RotateCcw, Shield, Truck } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Input } from "@/components/ui/input";
import api from "@/utils/axios";
import type { BestSellingProduct } from "@/types/productType";

type Brand = {
  id: string;
  name: string;
  logoUrl: string | null;
};

export default function HomePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [bestSellingProducts, setBestSellingProducts] = useState<BestSellingProduct[]>([]);
  const [loadingBestSellers, setLoadingBestSellers] = useState(false);
  const [bestSellerError, setBestSellerError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    (async () => {
      try {
        const response = await api.get<Brand[]>("/brands/");
        if (isCancelled) return;

        const normalized = Array.isArray(response.data)
          ? response.data
              .filter((brand) => brand.id !== "all")
              .map((brand) => ({
                id: String(brand.id),
                name: brand.name ?? "",
                logoUrl: brand.logoUrl ?? null,
              }))
              .filter((brand) => brand.name.length)
          : [];

        setBrands(normalized);
      } catch (error) {
        console.error("Failed to load brands for homepage", error);
      } finally {
        if (!isCancelled) {
          setLoadingBrands(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchBestSellers = async () => {
      setLoadingBestSellers(true);
      setBestSellerError(null);

      try {
        const res = await api.get<{ products: BestSellingProduct[] }>(
          "/products/best-sellers",
          {
            params: { limit: 8 },
            signal: controller.signal,
          }
        );

        setBestSellingProducts(res.data.products);
      } catch (error) {
        if (axios.isCancel(error)) return;
        console.error("Error fetching best selling products:", error);
        setBestSellerError("Unable to load best-selling products at the moment.");
      } finally {
        setLoadingBestSellers(false);
      }
    };

    fetchBestSellers();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {/* men's
                <br />
                collection */}
                EXPLORE
              </h1>
              <p className="text-gray-600 mt-4 text-lg">
                From t-shirts, jeans, jacket shirt, watches long, sunglasses
              </p>
            </div>
            <Link to="/products/all" className="w-full sm:w-auto">
              <Button className="bg-black text-white px-8 py-3 text-sm font-medium hover:bg-gray-800">
                SHOP NOW
              </Button>
            </Link>
          </div>
          <div className="relative">
            <img
              src="/image.png?height=500&width=400"
              alt="Man in gray blazer"
              width={400}
              height={500}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">FREE SHIPPING</h3>
              <p className="text-sm text-gray-600">
                Free shipping on all US order or order above $200
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <RotateCcw className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">30 Days Return</h3>
              <p className="text-sm text-gray-600">
                Simply return it within 30 days for an exchange
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">100% Payment Secure</h3>
              <p className="text-sm text-gray-600">
                Simply return it within 30 days for an exchange
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Brands */}
      <section className="bg-white py-16 px-4">
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Famous Brands
            </h2>
            <p className="text-gray-600">Discover our most popular items</p>
        </div>
        <div className="max-w-7xl mx-auto">
          {loadingBrands ? (
            <p className="text-center text-gray-500">Loading brands...</p>
          ) : brands.length === 0 ? (
            <p className="text-center text-gray-500">No brands available right now.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {brands.map((brand) => (
                <div
                  key={brand.id}
                  className="group rounded-lg border border-gray-100 bg-gray-50 p-4 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-24 items-center justify-center bg-white rounded-md overflow-hidden">
                    {brand.logoUrl ? (
                      <img
                        src={brand.logoUrl}
                        alt={brand.name}
                        className="h-16 w-full object-contain transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-amber-50 text-amber-700 font-semibold">
                        {brand.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-center text-sm font-semibold text-gray-800">{brand.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Best Selling Products
            </h2>
            <p className="text-gray-600">Discover our most popular items</p>
          </div>

          <div className="relative px-12">
            {loadingBestSellers ? (
              <div className="flex flex-col items-center gap-3 py-12 text-gray-600">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading best sellers...</span>
              </div>
            ) : bestSellerError ? (
              <p className="text-center text-sm text-red-500 py-8">
                {bestSellerError}
              </p>
            ) : !bestSellingProducts.length ? (
              <p className="text-center text-sm text-gray-500 py-8">
                No best-selling products to show yet.
              </p>
            ) : (
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {bestSellingProducts.map((product) => {
                    const productImage = product.image?.url ?? "/placeholder.svg";
                    const productAlt = product.image?.alt ?? product.name;
                    const isInStock =
                      typeof product.inStock === "boolean"
                        ? product.inStock
                        : product.totalStock > 0;

                    return (
                      <CarouselItem
                        key={product.id}
                        className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                      >
                        <ProductCard
                          product={{
                            id: product.id,
                            name: product.name,
                            brandName: product.brand?.name ?? undefined,
                            price: product.effectivePrice,
                            originalPrice: product.compareAtPrice ?? undefined,
                            imageUrl: productImage,
                            imageAlt: productAlt,
                            inStock: isInStock,
                          }}
                          className="h-full"
                          to={`/products/${product.id}`}
                          overlays={{
                            topRight: (
                              <button
                                type="button"
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-sm ring-1 ring-black/5 transition hover:bg-rose-50 hover:text-rose-500"
                              >
                                <Heart className="w-4 h-4" />
                              </button>
                            ),
                          }}
                          badgeSlot={
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                                Best Seller
                              </Badge>
                              <Badge variant="outline" className="border-gray-200 text-gray-700">
                                Sold {product.unitsSold.toLocaleString("vi-VN")}
                              </Badge>
                            </div>
                          }
                        />
                      </CarouselItem>
                    );
                  })}
                </CarouselContent>
                <CarouselPrevious className="bg-white border-gray-300 hover:bg-gray-50" />
                <CarouselNext className="bg-white border-gray-300 hover:bg-gray-50" />
              </Carousel>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              About Gentleman Jones
            </h2>
            <p className="text-gray-600 mb-4">
              For over a decade, Gentleman Jones has been the premier
              destination for sophisticated men's fashion. We curate the finest
              collection of clothing, accessories, and lifestyle products that
              embody timeless elegance and modern style.
            </p>
            <p className="text-gray-600 mb-6">
              From boardroom to weekend, our carefully selected pieces ensure
              you look your absolute best for every occasion. Quality
              craftsmanship and attention to detail are at the heart of
              everything we do.
            </p>
            <Button
              variant="outline"
              className="border-black text-black hover:bg-black hover:text-white"
            >
              Learn More
            </Button>
          </div>
          {/* <div className="relative">
            <img
              src="/placeholder.svg?height=400&width=500"
              alt="About Gentleman Jones"
              width={500}
              height={400}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div> */}
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section className="bg-gradient-to-r from-amber-50 to-amber-100 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-gray-600">
              Trusted by thousands of satisfied customers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Michael Chen",
                role: "Business Executive",
                content:
                  "Exceptional quality and service. The blazer I purchased fits perfectly and the attention to detail is remarkable.",
                rating: 5,
              },
              {
                name: "David Rodriguez",
                role: "Entrepreneur",
                content:
                  "Gentleman Jones has become my go-to for professional attire. Their style advice is invaluable.",
                rating: 5,
              },
              {
                name: "James Wilson",
                role: "Creative Director",
                content:
                  "From casual to formal, they have everything I need. The quality is consistently outstanding.",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-lg">
                      ★
                    </span>
                  ))}
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <span key={i} className="text-amber-400 text-lg">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-semibold text-gray-900">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Newsletter Section */}
      {/* <section className="bg-black py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stay in Style</h2>
          <p className="text-gray-300 mb-8">
            Subscribe to our newsletter and be the first to know about new
            arrivals, exclusive offers, and style tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 bg-white border-white"
            />
            <Button className="bg-amber-600 text-white hover:bg-amber-700 px-8">
              Subscribe
            </Button>
          </div>
          <p className="text-gray-400 text-sm mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section> */}
      <Footer />
    </div>
  );
}
