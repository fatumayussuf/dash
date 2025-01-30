import { clientPromise } from "~/db.server";
import { ObjectId } from "mongodb";
import { Form, redirect, useLoaderData, useSubmit } from "react-router";
import { Star, Send, Package, Truck, Shield, MessageCircle, Package2, Share2, ZoomIn, ChevronRight, Heart } from "lucide-react";
import { useState } from "react";
import { getSession, setSuccessMessage } from "~/session.server";
import { getUser } from "~/supabase.server";

export const action = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const formData = await request.formData();
  const productId = formData.get("productId");
  const rating = formData.get("rating");
  const reviewText = formData.get("review");
  const userId = formData.get("userId");

  if (!userId) {
    setSuccessMessage(session, "You must be logged in to leave a review.");
    return redirect(`/shop/product/${productId}`);
  }

  const client = await clientPromise;
  const db = client.db("Smartshop");
  const product = await db.collection("products").findOne({ _id: new ObjectId(productId) });

  if (!product) {
    throw new Error("Product not found");
  }

  const reviews = product.reviews || [];
  reviews.push({ rating: Number(rating), review: reviewText, userId, date: new Date() });

  await db.collection("products").updateOne(
    { _id: new ObjectId(productId) },
    { $set: { reviews } }
  );
  setSuccessMessage(session, "Thank you for your review!");
  return redirect(`/shop/products/${productId}`);
};

export const loader = async ({ request, params }) => {
  const productId = params.productId?.trim();

  if (!productId || !ObjectId.isValid(productId)) {
    throw new Response("Invalid Product ID", { status: 404 });
  }

  const client = await clientPromise;
  const db = client.db("Smartshop");
  const product = await db.collection("products").findOne({ _id: new ObjectId(productId) });

  if (!product) {
    throw Error("Product not found");
  }

  const user = await getUser(request);
  const userEmail = user?.email || null;
  const userId = user?.id || null;

  return {
    id: product._id.toString(),
    name: product.name,
    description: product.description,
    price: product.price,
    imageUrl: product.imageUrl,
    features: product.features,
    reviews: product.reviews || [],
    userEmail,
    userId,
  };
};


export default function ProductPage() {
  const product = useLoaderData();
  const userId = product.userId;
  const productId = product.id;
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [reviews, setReviews] = useState(product.reviews);
  const [isHoveringRating, setIsHoveringRating] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [activeImageZoom, setActiveImageZoom] = useState(false);
  const submit = useSubmit();

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    formData.append("userId", userId);
    submit(formData, { method: "post" });
    setReview("");
    setRating(0);
  };

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "Ksh",
  }).format(product.price);

  const features = [
    { icon: Package2, text: "Free shipping on orders over Ksh10,000", color: "text-purple-500" },
    { icon: Truck, text: "Same-day delivery available", color: "text-emerald-500" },
    { icon: Shield, text: "2-year warranty included", color: "text-blue-500" },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="bg-white backdrop-blur-lg bg-opacity-90 rounded-3xl p-8 shadow-2xl space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image Section */}
            <div className="relative group">
              <div className={`aspect-w-1 aspect-h-1 overflow-hidden rounded-3xl bg-gray-100 
                ${activeImageZoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className={`object-cover w-full h-full transition-all duration-700 ease-in-out
                    ${activeImageZoom ? 'scale-150' : 'group-hover:scale-110'}`}
                  onClick={() => setActiveImageZoom(!activeImageZoom)}
                />
                <div className="absolute top-4 right-4 flex space-x-3">
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className="p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all duration-300"
                  >
                    <Heart 
                      className={`w-5 h-5 transition-colors duration-300 
                        ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                    />
                  </button>
                  <button className="p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all duration-300">
                    <Share2 className="w-5 h-5 text-gray-400" />
                  </button>
                  <button 
                    onClick={() => setActiveImageZoom(!activeImageZoom)}
                    className="p-3 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all duration-300"
                  >
                    <ZoomIn className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Details Section */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  {product.name}
                </h1>
                <p className="text-3xl font-semibold text-gray-900">{formattedPrice}</p>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-center p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300"
                  >
                    <feature.icon className={`w-6 h-6 ${feature.color}`} />
                    <span className="ml-4 text-gray-700">{feature.text}</span>
                    <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
                  </div>
                ))}
              </div>

              <Form method="post" action="/cart">
                <input type="hidden" name="productId" value={product.id} />
                  <button type="submit" name="_action" value="addToCart" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 
                  text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all duration-300 
                  hover:shadow-blue-200 hover:shadow-xl">
                  Add to Cart
                  </button>

              </Form>

            </div>
          </div>

          {/* Reviews Section */}
          <div className="pt-10 border-t border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Customer Reviews</h2>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-6 h-6 text-blue-500" />
                <span className="text-lg text-gray-600">{reviews.length} reviews</span>
              </div>
            </div>

            {/* Review Form */}
            {userId ? (
              <Form onSubmit={handleReviewSubmit} className="space-y-6 w-full max-w-2xl mx-auto mb-12">
                <div className="bg-gray-50 p-8 rounded-2xl space-y-6">
                  <div className="flex items-center justify-center space-x-3">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-8 h-8 cursor-pointer transition-all duration-300 
                          ${idx < (isHoveringRating || rating) ? 
                            'text-yellow-400 scale-110' : 'text-gray-300'}`}
                        onMouseEnter={() => setIsHoveringRating(idx + 1)}
                        onMouseLeave={() => setIsHoveringRating(0)}
                        onClick={() => setRating(idx + 1)}
                      />
                    ))}
                  </div>
                  <textarea
                    name="review"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:outline-none 
                      focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Share your thoughts about this product..."
                  />
                  <input type="hidden" name="userId" value={userId} />
                  <input type="hidden" name="productId" value={productId} />
                  <input type="hidden" name="rating" value={rating} />

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 
                      rounded-xl shadow-md transition-all duration-300 disabled:opacity-50 
                      disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    disabled={!rating || !review.trim()}
                  >
                    <Send className="w-5 h-5" />
                    <span>Submit Review</span>
                  </button>
                </div>
              </Form>
            ) : (
              <div className="bg-blue-50 p-8 rounded-2xl mb-12 text-center">
                <p className="text-blue-800 font-medium">Please sign in to leave a review</p>
              </div>
            )}

            {/* Display Reviews */}
            <div className="grid gap-6 md:grid-cols-2">
              {reviews.sort((a, b) => new Date(b.date) - new Date(a.date)).map((review, index) => (
                <div 
                  key={index} 
                  className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm 
                    hover:shadow-md transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-5 h-5 ${
                            idx < review.rating ? 'text-yellow-400' : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{review.review}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

