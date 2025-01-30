import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/stk-push", "routes/api.stk-push.ts"), // Add this line
  route("signup", "routes/signup.tsx"),
  route("login", "routes/login.tsx"),
  route("logout", "routes/logout.ts"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("update-password", "routes/update-password.tsx"),
  route("cart", "routes/cart.ts"),
  route("auth/confirm", "routes/confirm.ts"),
  route("shop", "routes/shop/shop.tsx", [
    index("routes/shop/index.tsx"),
    route("products", "routes/shop/products.tsx"),
    route("/shop/products/:productId", "routes/shop/product.tsx")
  ]),
  route("dashboard", "dashboard/dashboard.tsx", [
    index("dashboard/index.tsx"),
    route("customers", "dashboard/customers.tsx"),
    route("analytics", "dashboard/analytics.tsx"),
    route("settings", "dashboard/settings.tsx"),
    route("help", "dashboard/help.tsx"),
    route("orders", "dashboard/orders.tsx"),
    route("products", "dashboard/products.tsx"),
  ])
] satisfies RouteConfig;