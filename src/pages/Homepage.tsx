import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Truck, RotateCcw, Shield } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function HomePage() {
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
      <section className="bg-white py-12 px-4">
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

      {/* Product Categories Grid */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* Men's Sunglasses */}
          <div className="relative group overflow-hidden rounded-lg">
            <img
              src="/placeholder.svg?height=300&width=400"
              alt="Men's Sunglasses"
              width={400}
              height={300}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
              <p className="text-white text-sm mb-1">FOR MEN ONLINE</p>
              <h3 className="text-white text-xl font-bold mb-3">
                MEN'S SUNGLASSES
              </h3>
              <Button
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-black w-fit"
              >
                SHOP NOW
              </Button>
            </div>
          </div>

          {/* Men's Sneaker */}
          <div className="relative group overflow-hidden rounded-lg">
            <img
              src="/placeholder.svg?height=300&width=400"
              alt="Men's Sneaker"
              width={400}
              height={300}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
              <p className="text-white text-sm mb-1">MEN'S SNEAKER</p>
              <h3 className="text-white text-xl font-bold mb-3">
                MEN'S SNEAKER
              </h3>
              <Button
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-black w-fit"
              >
                SHOP NOW
              </Button>
            </div>
          </div>

          {/* Men's T-Shirt */}
          <div className="relative group overflow-hidden rounded-lg">
            <img
              src="/placeholder.svg?height=300&width=400"
              alt="Men's T-Shirt"
              width={400}
              height={300}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
              <p className="text-white text-sm mb-1">COLLECTION OF 2019</p>
              <h3 className="text-white text-xl font-bold mb-3">
                MEN'S T-SHIRT
              </h3>
              <Button
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-black w-fit"
              >
                SHOP NOW
              </Button>
            </div>
          </div>

          {/* Men's Shoes Collection */}
          <div className="relative group overflow-hidden rounded-lg">
            <img
              src="/placeholder.svg?height=300&width=400"
              alt="Men's Shoes Collection"
              width={400}
              height={300}
              className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
              <p className="text-white text-sm mb-1">MEN'S SHOES</p>
              <h3 className="text-white text-xl font-bold mb-3">COLLECTION</h3>
              <Button
                variant="outline"
                className="bg-transparent border-white text-white hover:bg-white hover:text-black w-fit"
              >
                SHOP NOW
              </Button>
            </div>
          </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Classic Blazer",
                price: "$299",
                originalPrice: "$399",
                image: "/placeholder.svg?height=300&width=250",
              },
              {
                name: "Premium Watch",
                price: "$199",
                originalPrice: "$249",
                image: "/placeholder.svg?height=300&width=250",
              },
              {
                name: "Leather Shoes",
                price: "$159",
                originalPrice: "$199",
                image: "/placeholder.svg?height=300&width=250",
              },
              {
                name: "Cotton Shirt",
                price: "$79",
                originalPrice: "$99",
                image: "/placeholder.svg?height=300&width=250",
              },
            ].map((product, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm overflow-hidden group hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={250}
                    height={300}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {product.price}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {product.originalPrice}
                    </span>
                  </div>
                  <Button className="w-full mt-3 bg-black text-white hover:bg-gray-800">
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
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
          <div className="relative">
            <img
              src="/placeholder.svg?height=400&width=500"
              alt="About Gentleman Jones"
              width={500}
              height={400}
              className="w-full h-auto object-cover rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-r from-amber-50 to-amber-100 py-16 px-4">
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
                  {/* {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-amber-400 text-lg">
                      ★
                    </span>
                  ))} */}
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
      </section>

      {/* Newsletter Section */}
      <section className="bg-black py-16 px-4">
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
      </section>
      <Footer />
    </div>
  );
}
