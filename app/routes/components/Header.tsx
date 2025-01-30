import { 
  Bell, ChevronDown, Gift, Headphones, Menu, Percent, Search, ShoppingBag, Truck, User, X 
} from "lucide-react";
import { Link } from "react-router";
import CartComponent from "./CartComponent";
import { useState } from "react";

interface Category {
  name: string;
  icon: JSX.Element;
}

interface HeaderProps {
  cartItems: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }>;
}

export default function Header({ cartItems }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(true);
  const [cartCount, setCartCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = () => {
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      // Replace the console.log with your search handling logic, e.g., API call or navigation
    }
  };

  const categories: Category[] = [
    { name: "Abayas", icon: <Headphones className="w-4 h-4" /> },
    { name: "Shoes", icon: <ShoppingBag className="w-4 h-4" /> },
    { name: "Watches", icon: <Percent className="w-4 h-4" /> },
  ];

  return (
    <div className="bg-white">
      {/* Top Banner */}
     

      {/* Main Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-8">
              <nav className="hidden lg:flex items-center gap-6">
                <div className="relative group">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 py-2">
                    Categories
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="p-4 space-y-2">
                      {categories.map((category, index) => (
                        <Link
                          key={index}
                          to={`/category/${category.name.toLowerCase()}`}
                          className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          {category.icon}
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
                <Link to="/shop/products" className="text-gray-600 hover:text-gray-900">
                  Deals
                </Link>
                <Link to="/shop/products" className="text-gray-600 hover:text-gray-900">
                  What's New
                </Link>
              </nav>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center gap-6">
              <div className="hidden lg:flex flex-1 max-w-xl">
                <div className="relative w-full">
                  <input
                    type="search"
                    placeholder="Search for products..."
                    className="w-full pl-12 pr-4 py-2.5 rounded-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              {/* User Actions */}
              <div className="flex items-center gap-4">
                <button
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="w-6 h-6 text-gray-600" />
                </button>
                <CartComponent cartItems={cartItems} />
                <div className="hidden md:block relative group">
                  <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-full">
                    <User className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
                <button
                  className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? (
                    <X className="w-6 h-6 text-gray-600" />
                  ) : (
                    <Menu className="w-6 h-6 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="bg-white p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input
                  type="search"
                  placeholder="Search products..."
                  className="w-full pl-12 pr-4 py-2.5 rounded-full border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  autoFocus
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              </div>
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
