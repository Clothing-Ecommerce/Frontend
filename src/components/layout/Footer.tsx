import { Link } from "react-router-dom";
import { Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold">GENTLEMAN JONES</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your premier destination for sophisticated men's fashion and timeless style.
            </p>
            <div className="flex items-center gap-2 text-gray-400">
              <Phone className="w-4 h-4" />
              <span>(123) 456 7890</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="#" className="hover:text-white">About Us</Link></li>
              <li><Link to="#" className="hover:text-white">New Collection</Link></li>
              <li><Link to="#" className="hover:text-white">Sale</Link></li>
              <li><Link to="#" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="#" className="hover:text-white">Suits & Blazers</Link></li>
              <li><Link to="#" className="hover:text-white">Shirts</Link></li>
              <li><Link to="#" className="hover:text-white">Shoes</Link></li>
              <li><Link to="#" className="hover:text-white">Accessories</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="#" className="hover:text-white">Size Guide</Link></li>
              <li><Link to="#" className="hover:text-white">Shipping Info</Link></li>
              <li><Link to="#" className="hover:text-white">Returns</Link></li>
              <li><Link to="#" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">© 2024 Gentleman Jones. All rights reserved.</p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <Link to="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</Link>
            <Link to="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</Link>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">Follow Us:</span>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-xs">f</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-xs">t</span>
                </div>
                <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-xs">i</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
