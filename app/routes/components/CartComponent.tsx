import { useState } from "react";
import { CreditCard, ShoppingCart, X, Trash2 } from "lucide-react";
import { useFetcher } from "react-router";

interface CartItem {
  productId: string;
  quantity: number;
  product: {
    name: string;
    price: string;
    imageUrl: string;
  };
}

interface CartComponentProps {
  cartItems: CartItem[];
}

export default function CartComponent({ cartItems }: CartComponentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalCost = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );
  const shippingCost = totalCost > 1500 ? 0 : 10;
  const finalTotal = totalCost + shippingCost;

  const handleCheckout = async () => {
    if (!phoneNumber) {
      alert("Please enter a valid phone number.");
      return;
    }

    setIsPaymentLoading(true);

    try {
      const response = await fetch("/api/stk-push", {
        method: "POST",
        body: JSON.stringify({
          phoneNumber: phoneNumber.startsWith("0") ? phoneNumber : `0${phoneNumber}`,
          amount: finalTotal,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Payment failed");
      }

      if (data.status === "success") {
        alert(data.data.CustomerMessage || "Payment initiated! Please confirm on your phone.");
      } else {
        alert("Failed to initiate payment: " + data.message);
      }
    } catch (error) {
      console.error("Payment failed:", error);
      alert("An error occurred while processing the payment.");
    } finally {
      setIsPaymentLoading(false);
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(true)} className="relative p-2 hover:bg-gray-100 rounded-full">
        <ShoppingCart className="w-6 h-6 text-gray-700" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setIsOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-blue-600">Your Cart ({totalItems} items)</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.length > 0 ? cartItems.map((item) => (
                <CartItem key={item.productId} item={item} />
              )) : (
                <div className="text-center text-gray-500 mt-8">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Your cart is empty</p>
                </div>
              )}
            </div>

            <div className="border-t bg-blue-700 p-4">
              <div className="flex justify-between">
                <span>Total:</span>
                <span>Ksh {finalTotal.toFixed(2)}</span>
              </div>

              <label className="block text-sm font-medium mt-2">Phone Number:</label>
              <input
                type="text"
                className="w-full p-2 border rounded-md mt-1"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 0712345678"
              />

              <button onClick={handleCheckout} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 mt-4" disabled={cartItems.length === 0 || !phoneNumber}>
                {isPaymentLoading ? "Processing..." : <><CreditCard className="w-5 h-5" /> Checkout</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CartItem({ item }) {
  let fetcher = useFetcher();
  let deleteFetcher = useFetcher();
  let isDeleting;
  let optimisticValue = item.quantity;
  if (deleteFetcher.formData) {
    isDeleting = deleteFetcher.formData.get("deleting");
  }

  if (fetcher.formData) {
    optimisticValue = Number(fetcher.formData.get("count"));
  }

  return (
    <div
      className={` ${isDeleting ? "hidden" : "flex"} items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100`}
    >
      <img
        src={item.product.imageUrl}
        alt={item.product.name}
        className="w-16 h-16 object-cover rounded-lg"
      />
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{item.product.name}</h3>
        <div className="text-sm text-gray-500">
          Ksh{parseFloat(item.product.price).toFixed(2)} each
        </div>
        <div className="mt-2 flex items-center gap-3">
          <fetcher.Form method="post" action="/cart">
            <input type="hidden" name="productId" value={item.productId} />
            <input type="hidden" name="count" value={optimisticValue - 1} />
            <button
              name="_action"
              value="decreaseQuantity"
              type="submit"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
              aria-label="Decrease quantity"
              disabled={optimisticValue <= 1}
            >
              -
            </button>
          </fetcher.Form>
          <span className="w-8 text-center text-gray-900">{optimisticValue}</span>
          <fetcher.Form method="post" action="/cart">
            <input type="hidden" name="productId" value={item.productId} />
            <input type="hidden" name="count" value={optimisticValue + 1} />
            <button
              name="_action"
              value="increaseQuantity"
              type="submit"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition-colors"
              aria-label="Increase quantity"
            >
              +
            </button>
          </fetcher.Form>
        </div>
      </div>
      <deleteFetcher.Form method="post" action="/cart">
        <input type="hidden" name="productId" value={item.productId} />
        <input type="hidden" name="deleting" value="true" />
        <button
          type="submit"
          name="_action"
          value="deleteCartItem"
          className="text-red-500 hover:text-red-600 p-1"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </deleteFetcher.Form>
    </div>
  );
}
