import { Heart, Plus, Star, CheckCircle, Timer, Package2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Form, Link } from "react-router";

export default function ProductCard({ product }) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    if (product.reviews?.length > 0) {
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      setAverageRating((totalRating / product.reviews.length).toFixed(1));
    }
  }, [product.reviews]);

  const getStockStatusColor = (status) => {
    if (status < 5) return 'bg-red-500';
    if (status < 20) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div 
      className="relative group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-500 p-6"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Sale Badge */}
      {product.originalPrice && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            SALE
          </div>
        </div>
      )}

      {/* Favorite Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsFavorited(!isFavorited);
        }}
        aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
        className={`absolute top-4 right-4 z-10 p-2.5 rounded-full 
          ${isFavorited 
            ? "bg-red-50 text-red-500 hover:bg-red-100" 
            : "bg-white/90 text-gray-400 hover:text-gray-600 hover:bg-white"}
          transform transition-all duration-300 ${isHovering ? 'scale-110' : 'scale-100'}`}
      >
        <Heart className={`w-5 h-5 ${isFavorited ? "fill-current" : ""}`} />
      </button>

      {/* Product Image */}
      <Link 
        to={`/shop/products/${product._id}`}
        className="block overflow-hidden rounded-xl aspect-square mb-6 bg-gray-50"
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
      </Link>

      {/* Product Info */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
            {product.category}
          </span>
          <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1 rounded-full">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-yellow-700">{averageRating}</span>
          </div>
        </div>

        <Link 
          to={`/shop/products/${product._id}`}
          className="block group-hover:text-blue-600 transition-colors duration-300"
        >
          <h3 className="font-semibold text-gray-900 text-lg leading-snug">
            {product.name}
          </h3>
        </Link>

        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <div className="text-xl font-bold text-gray-900">
              Ksh{product.price}
            </div>
            {product.originalPrice && (
              <div className="text-sm text-gray-500 line-through">
                Ksh{product.originalPrice}
              </div>
            )}
          </div>

          <Form action="/cart" method="post">
            <input type="hidden" name="productId" value={product._id} />
            <button
              type="submit"
              name="_action"
              value="addCartItem"
              onClick={() => setIsAddedToCart(true)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium 
                transform transition-all duration-300 ${isHovering ? 'scale-105' : 'scale-100'}
                ${isAddedToCart 
                  ? "bg-green-50 text-green-600 hover:bg-green-100" 
                  : "bg-blue-600 text-white hover:bg-blue-700"}`}
            >
              {isAddedToCart ? (
                  <CheckCircle className="w-4 h-4" />
              ) : (
                  <Plus className="w-4 h-4" />
              )}
            </button>
          </Form>
        </div>

        {/* Quick Info */}
      </div>

      {/* Stock Status */}
      {product.stock !== undefined && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-medium ${
              product.stock < 5 ? 'text-red-600' : 
              product.stock < 20 ? 'text-yellow-600' : 
              'text-green-600'
            }`}>
              {product.stock < 20
                ? "Low in stock"
                : `Available`}
            </p>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${getStockStatusColor(product.stock)}`}
                style={{ 
                  width: `${product.stock}%`,
                  transform: isHovering ? 'scaleX(1.05)' : 'scaleX(1)'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};