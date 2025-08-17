import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  User,
  ChevronDown,
  Phone,
  Search,
  Heart,
  ShoppingBag,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";

type HeaderProps = {
  cartCount?: number;
  wishlistCount?: number;
};

export default function Header({
  cartCount = 0,
  wishlistCount = 0,
}: HeaderProps) {
  const { isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out", "You have been successfully logged out");
    setIsDropdownOpen(false);
  };

  return (
    <div>
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3" />
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative">
                <div
                  className="flex items-center gap-2 text-white text-sm cursor-pointer hover:text-yellow-200 transition-colors"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <User className="w-4 h-4" />
                  <span>My Account</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                    <Link
                      to="/user/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <Link
                      to="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Orders
                    </Link>
                    <Link
                      to="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3">
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
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-gradient-to-r from-amber-50 to-amber-100 px-4 py-4 border-b border-amber-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Phone className="w-4 h-4" />
            <span>(123) 456 7890</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-yellow-700 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-gray-700 tracking-widest">
                FASHION STORE
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Search className="w-5 h-5 text-gray-600 hover:text-amber-600 cursor-pointer transition-colors" />
            <div className="relative">
              <Heart className="w-5 h-5 text-gray-600 hover:text-amber-600 cursor-pointer transition-colors" />
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            </div>
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-gray-600 hover:text-amber-600 cursor-pointer transition-colors" />
              <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <ul className="flex items-center justify-center gap-8 text-sm font-medium text-gray-600">
            <li>
              <Link to="/" className="hover:text-gray-900">
                HOME
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-gray-900">
                NEW ARRIVALS
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-gray-900">
                SALE
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-gray-900">
                MEN
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-gray-900">
                WOMEN
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-gray-900">
                ABOUT US
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}
