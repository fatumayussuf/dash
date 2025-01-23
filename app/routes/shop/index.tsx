import { Link, useLoaderData, useSearchParams } from 'react-router';
import {
  Truck,
  Shield,
  Clock,
  Star,
  ArrowRight,
  TrendingUp,
  ChevronRight,
  Package,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Route } from '../../+types/root';
import { clientPromise } from '~/db.server';
import ProductCard from '../components/ProductCard';
import { getSession } from '~/session.server';
import { getUser } from '~/supabase.server';
import { ObjectId } from 'mongodb';

export const loader = async ({ request }: { request: Request }) => {
  const client = await clientPromise;
  const db = client.db("Smartshop");

  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  const products = await db.collection("products").find({}).toArray();
  const categories = Array.from(new Set(products.map(product => product.category)));

  const session = await getSession(request.headers.get("Cookie"));
  const user = await getUser(request);

  let cartItemsResults = [];

  if (user) {
    const userId = user.id;
    const userFromDb = await db.collection("users").findOne({ supabaseId: userId });

    if (userFromDb) {
      const cart = userFromDb.cart || [];
      const productIds = cart.map(item => new ObjectId(item.productId));
      const cartProducts = await db.collection("products")
        .find({ _id: { $in: productIds } })
        .toArray();

      cartItemsResults = cart.map(cartItem => {
        const product = cartProducts.find(p => p._id.toString() === cartItem.productId);
        return product
          ? { productId: product._id.toString(), quantity: cartItem.quantity, product }
          : null;
      }).filter(Boolean);
    }
  }

  return {
    products: JSON.parse(JSON.stringify(category
      ? products.filter(product => product.category === category)
      : products
    )),
    categories,
    cartItems: cartItemsResults
  };
};

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "ShopSmart - Your One-Stop Shopping Destination" },
    { name: "description", content: "Discover amazing deals on electronics, fashion, home goods and more." },
  ];
}

export default function Home() {
  const { products = [], cartItems = [], categories } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSticky, setIsSticky] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const filterSection = document.getElementById('filter-section');
      if (filterSection) {
        const filterPosition = filterSection.getBoundingClientRect().top;
        setIsSticky(filterPosition <= 0);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCategoryChange = (category) => {
    if (searchParams.get('category') === category) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
    setIsMobileFiltersOpen(false);
  };

  const activeCategory = searchParams.get('category');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#4f46e5,transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,#2563eb,transparent_50%)]" />
        </div>

        <div className="container mx-auto px-4 py-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative z-10 space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/20">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">New Collection 2025</span>
              </div>

              <h1 className="text-4xl lg:text-6xl font-bold text-white space-y-3">
                <span className="block">Discover Your</span>
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Perfect Style
                </span>
              </h1>

              <p className="text-gray-300 text-lg max-w-lg">
                Explore our curated collection of premium products with up to 50% off.
                Quality meets affordability in every purchase.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/shop/products"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 rounded-full hover:bg-blue-700 transition-colors font-medium text-white shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40"
                >
                  Shop Now
                  <ChevronRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/categories"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-colors font-medium backdrop-blur-sm"
                >
                  Browse Categories
                  <Package className="w-5 h-5" />
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
                {[
                  { label: 'Happy Customers', value: '200K+' },
                  { label: 'Exclusive Products', value: '15K+' },
                  { label: '5-Star Reviews', value: '75K+' },
                ].map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-gray-400">{stat.label}</div>
                  </div>
                ))}

              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZmFzaGlvbnxlbnwwfHwwfHx8MA%3D%3D"
                  alt="Fashion Collection"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="absolute -inset-4 -z-10">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Truck className="w-6 h-6 text-blue-600" />,
                title: "Free Shipping",
                description: "On orders over $50"
              },
              {
                icon: <Shield className="w-6 h-6 text-blue-600" />,
                title: "Secure Payment",
                description: "100% secure checkout"
              },
              {
                icon: <Clock className="w-6 h-6 text-blue-600" />,
                title: "Fast Delivery",
                description: "2-3 business days"
              },
              {
                icon: <Star className="w-6 h-6 text-blue-600" />,
                title: "Best Quality",
                description: "Certified products"
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-medium text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Filter Section */}
      <div id="filter-section" className="relative bg-white border-y border-gray-200">
        <div className={`${isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-lg' : ''} bg-white`}>
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Filter Button */}
            <button
              className="md:hidden w-full px-4 py-2 bg-blue-600 text-white rounded-lg mb-4 flex items-center justify-center gap-2"
              onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            >
              <span>Filter Categories</span>
              {activeCategory && `(${activeCategory})`}
            </button>

            {/* Mobile Filter Drawer */}
            <div className={`
              fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden transition-opacity duration-300
              ${isMobileFiltersOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}>
              <div className={`
                fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 transition-transform duration-300
                ${isMobileFiltersOpen ? 'translate-y-0' : 'translate-y-full'}
              `}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Categories</h3>
                  <button
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      className={`
                        px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200
                        ${activeCategory === category
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }
                      `}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Filters */}
            <div className="hidden md:flex flex-wrap gap-3 justify-center">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`
                    px-6 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${activeCategory === category
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }
                  `}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <Link
              to="/shop/products"
              className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {products.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-medium mb-4">About Us</h3>
              <p className="text-sm">
                ShopSmart is your one-stop destination for all your shopping needs.
                We offer quality products at competitive prices.
              </p>
            </div>
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link to="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link to="/shipping" className="hover:text-white">Shipping Info</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Customer Service</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/returns" className="hover:text-white">Returns</Link></li>
                <li><Link to="/track-order" className="hover:text-white">Track Order</Link></li>
                <li><Link to="/help" className="hover:text-white">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white text-lg font-medium mb-4">Newsletter</h3>
              <p className="text-sm mb-4">Subscribe to get special offers and updates</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 rounded-l-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2025 ShopSmart. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}