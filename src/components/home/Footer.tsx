import { Link } from "react-router-dom"; // Import Link if used
import { Button } from "@/components/ui/button"; // Import Button
import { Input } from "@/components/ui/input"; // Import Input

export default function Footer() {
  return (
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
              Leading online fashion platform, bringing you an amazing shopping
              experience.
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
  );
}