import { ShoppingCart, DollarSign, Package, Users, Clock } from 'lucide-react';
import { useState } from 'react';
import { redirect, useLoaderData } from "react-router";
import { getSession } from '~/session.server';
import { getUser } from '~/supabase.server';

export const loader = async ({ request }: { request: Request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = await getUser(request);

  if (user && user.email !== process.env.ADMIN_EMAIL) {
    // Redirect to login if the user isn't authenticated
    return redirect("/");
  }

  return { user };
};

export default function EcommerceOverviewPage() {
  const [overviewData] = useState({
    totalRevenue: 125000,
    totalOrders: 2156,
    totalProducts: 320,
    totalCustomers: 867,
    pendingOrders: 12,
  });

  return (
    <div className="container min-h-screen bg-gray-900">
      <main className="max-w-7xl mx-auto p-6 sm:p-8 lg:p-10">
        <h1 className="text-3xl font-semibold text-white mb-8">E-Commerce Overview</h1>

        {/* Key Metrics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-900/50 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-2xl font-semibold text-white">${overviewData.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-900/50 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Orders</p>
                <p className="text-2xl font-semibold text-white">{overviewData.totalOrders.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-900/50 rounded-lg">
                <Users className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Customers</p>
                <p className="text-2xl font-semibold text-white">{overviewData.totalCustomers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Orders Section */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Pending Orders</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-4">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <p className="text-sm text-gray-300">Order #{item} is pending</p>
                </div>
                <span className="ml-auto text-sm text-gray-500">3h ago</span>
              </div>
            ))}
          </div>
        </div>

        {/* Products Management Section */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Products Management</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[1, 2, 3].map((product, index) => (
              <div key={index} className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                <h3 className="text-lg font-semibold text-white">Product {product}</h3>
                <p className="text-sm text-gray-400 mt-2">Stock: <span className="text-green-400">{(product % 3) * 15 + 30}</span></p>
                <div className="w-full h-2 mt-2 bg-gray-700 rounded-full">
                  <div style={{ width: `${(product % 3) * 30 + 30}%` }} className="h-full bg-blue-500 rounded-full"></div>
                </div>
                <p className="text-sm text-gray-400 mt-2">Price: Ksh {(product % 2 === 0 ? 45 : 99).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
