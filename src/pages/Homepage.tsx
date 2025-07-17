"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  Star,
  Truck,
  Shield,
  Headphones,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth";

export default function Homepage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(3);
  const [isLoaded, setIsLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { user, logout, isAuthenticated } = useAuth();
  const { toasts, toast, removeToast } = useToast();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const categories = [
    {
      name: "T-Shirts",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop",
      count: "120+ products",
    },
    {
      name: "Shirts",
      image:
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200&h=200&fit=crop",
      count: "85+ products",
    },
    {
      name: "Jeans",
      image:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=200&h=200&fit=crop",
      count: "95+ products",
    },
    {
      name: "Dresses",
      image:
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=200&fit=crop",
      count: "110+ products",
    },
    {
      name: "Jackets",
      image:
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop",
      count: "75+ products",
    },
    {
      name: "Accessories",
      image:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop",
      count: "150+ products",
    },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: "Premium Cotton T-Shirt",
      price: "$29.90",
      originalPrice: "$39.90",
      image:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
      rating: 4.8,
      reviews: 124,
      badge: "Best Seller",
    },
    {
      id: 2,
      name: "Slim Fit Jeans",
      price: "$59.90",
      originalPrice: "$79.90",
      image:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop",
      rating: 4.9,
      reviews: 89,
      badge: "25% OFF",
    },
    {
      id: 3,
      name: "Floral Maxi Dress",
      price: "$44.90",
      originalPrice: "$59.90",
      image:
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=300&fit=crop",
      rating: 4.7,
      reviews: 156,
      badge: "New",
    },
    {
      id: 4,
      name: "Business Shirt",
      price: "$35.90",
      originalPrice: "$45.90",
      image:
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=300&h=300&fit=crop",
      rating: 4.6,
      reviews: 78,
      badge: "22% OFF",
    },
  ];

  const handleAddToCart = (productName: string) => {
    setCartCount((prev) => prev + 1);
    toast.success(
      "Added to cart!",
      `${productName} has been added to your cart`
    );
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out", "You have been successfully logged out");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info("Search", `Searching for "${searchQuery}"...`);
    }
  };

  return (
    <div
      className={`min-h-screen bg-white transition-opacity duration-1000 ${
        isLoaded ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* <ToastContainer toasts={toasts} onClose={removeToast} /> */}

      <ToastContainer
        toasts={toasts.map((toastObj) => ({
          ...toastObj,
          onClose: removeToast,
        }))}
        onClose={removeToast}
      />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4">
          {/* Top Bar */}
          <div className="hidden md:flex justify-between items-center py-2 text-sm text-gray-600 border-b">
            <div className="flex items-center space-x-4">
              <span className="flex items-center hover:text-blue-600 transition-colors duration-200">
                <Truck className="w-4 h-4 mr-1" />
                Free shipping on orders over $50
              </span>
              <span className="flex items-center hover:text-green-600 transition-colors duration-200">
                <Shield className="w-4 h-4 mr-1" />
                Quality guaranteed
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/track-order"
                className="hover:text-blue-600 transition-colors duration-200"
              >
                Track Order
              </Link>
              <Link
                to="/support"
                className="hover:text-blue-600 transition-colors duration-200"
              >
                Support
              </Link>
            </div>
          </div>

          {/* Main Header */}
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                FashionStore
              </span>
            </Link>

            {/* Search Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="search"
                  placeholder="Search products, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-full focus:border-blue-500 transition-all duration-300 focus:shadow-lg"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1 rounded-full px-4 hover:scale-105 transition-transform duration-200"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="hidden md:inline text-gray-700 font-medium animate-in fade-in duration-500">
                    Hello, {user?.username || user?.email}
                  </span>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/auth/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden md:flex hover:scale-105 transition-transform duration-200"
                    >
                      <User className="w-5 h-5 mr-2" />
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth/register">
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden md:flex bg-transparent hover:scale-105 transition-transform duration-200"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}

              <Button variant="ghost" size="sm" className="relative group">
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs animate-pulse">
                    {cartCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5 rotate-90 transition-transform duration-300" />
                ) : (
                  <Menu className="w-5 h-5 transition-transform duration-300" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 ${
              isMenuOpen ? "max-h-96 py-4 border-t" : "max-h-0"
            }`}
          >
            <div className="space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-3"
                />
                <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              </form>
              <div className="flex space-x-2">
                <Link to="/auth/login" className="flex-1">
                  <Button variant="ghost" className="w-full">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth/register" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center space-x-8 py-3 overflow-x-auto">
            {[
              "T-Shirts",
              "Shirts",
              "Jeans",
              "Dresses",
              "Jackets",
              "Accessories",
            ].map((category, index) => (
              <Link
                key={category}
                to={`/category/${category.toLowerCase()}`}
                className="whitespace-nowrap text-gray-700 hover:text-blue-600 font-medium relative group transition-colors duration-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {category}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-in slide-in-from-left duration-1000">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                Modern
                <br />
                <span className="text-yellow-300 animate-pulse">Fashion</span>
                <br />
                For You
              </h1>
              <p className="text-xl text-blue-100 max-w-lg animate-in slide-in-from-left duration-1000 delay-200">
                Discover the latest fashion collection with high quality and
                affordable prices. Shop online easily with fast delivery.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-left duration-1000 delay-400">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 hover:scale-105 transition-transform duration-200"
                >
                  Shop Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 bg-transparent hover:scale-105 transition-all duration-200"
                >
                  View Collection
                </Button>
              </div>
            </div>
            <div className="relative animate-in slide-in-from-right duration-1000 delay-300">
              <img
                src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=500&fit=crop"
                alt="Fashion Model"
                className="w-full h-96 object-cover rounded-lg shadow-2xl hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -bottom-4 -left-4 bg-yellow-400 text-black p-4 rounded-lg shadow-lg animate-bounce">
                <div className="text-2xl font-bold">25%</div>
                <div className="text-sm">OFF</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-in fade-in duration-1000">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Product Categories
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore diverse fashion categories with hundreds of high-quality
              products
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Card
                key={index}
                className="group cursor-pointer hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-4 text-center">
                  <div className="relative mb-4 overflow-hidden rounded-lg">
                    <img
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      className="w-full h-32 object-cover group-hover:scale-125 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-200">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500">{category.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-in fade-in duration-1000">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Most loved products with excellent quality and attractive prices
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <Card
                key={product.id}
                className="group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 animate-in slide-in-from-bottom"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 animate-pulse">
                      {product.badge}
                    </Badge>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                      {product.name}
                    </h3>
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600 ml-1">
                          {product.rating}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 ml-2">
                        ({product.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-red-600">
                          {product.price}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {product.originalPrice}
                        </span>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200"
                      onClick={() => handleAddToCart(product.name)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8 animate-in fade-in duration-1000 delay-500">
            <Button
              variant="outline"
              size="lg"
              className="px-8 hover:scale-105 transition-transform duration-200 bg-transparent"
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Truck,
                title: "Free Shipping",
                desc: "Free shipping on orders over $50",
                color: "blue",
              },
              {
                icon: Shield,
                title: "Quality Guarantee",
                desc: "Committed to the best product quality and service",
                color: "green",
              },
              {
                icon: Headphones,
                title: "24/7 Support",
                desc: "Customer support team always ready to serve",
                color: "purple",
              },
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  className="text-center group animate-in slide-in-from-bottom duration-1000"
                  style={{ animationDelay: `${index * 200}ms` }}
                >
                  <div
                    className={`w-16 h-16 bg-${feature.color}-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent
                      className={`w-8 h-8 text-${feature.color}-600`}
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="animate-in slide-in-from-left duration-1000">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">F</span>
                </div>
                <span className="text-xl font-bold">FashionStore</span>
              </div>
              <p className="text-gray-400 mb-4">
                Leading online fashion platform, bringing you an amazing
                shopping experience.
              </p>
            </div>
            {[
              {
                title: "Categories",
                links: ["T-Shirts", "Shirts", "Jeans", "Dresses"],
              },
              {
                title: "Support",
                links: ["Contact", "Shipping", "Returns", "FAQ"],
              },
            ].map((section, index) => (
              <div
                key={section.title}
                className="animate-in slide-in-from-bottom duration-1000"
                style={{ animationDelay: `${(index + 1) * 200}ms` }}
              >
                <h4 className="text-lg font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2 text-gray-400">
                  {section.links.map((link) => (
                    <li key={link}>
                      <Link
                        to={`/${link.toLowerCase()}`}
                        className="hover:text-white transition-colors duration-200"
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="animate-in slide-in-from-right duration-1000 delay-600">
              <h4 className="text-lg font-semibold mb-4">Follow Us</h4>
              <p className="text-gray-400 mb-4">
                Subscribe to get the latest news and offers
              </p>
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Your email"
                  className="bg-gray-800 border-gray-700 text-white focus:border-blue-500 transition-colors duration-200"
                />
                <Button className="bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 animate-in fade-in duration-1000 delay-1000">
            <p>&copy; 2024 FashionStore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
