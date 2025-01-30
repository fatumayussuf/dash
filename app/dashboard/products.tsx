import { Edit, Trash2, PlusCircle, X, Package, Tags, ListPlus, Wallet, Box, FileText, Activity, Image } from "lucide-react";
import { useState } from "react";
import { Form, redirect, useLoaderData } from "react-router";
import { clientPromise, ObjectId } from "~/db.server";
import type { Route } from "./+types";

export async function action({ request }: Route.ActionArgs) {
    const formData = await request.formData();
    const name = formData.get("name")?.toString().trim();
    const category = formData.get("category")?.toString().trim();
    const price = formData.get("price")?.toString().trim();
    const stock = formData.get("stock")?.toString().trim();
    const status = formData.get("status")?.toString().trim();
    const imageUrl = formData.get("imageUrl")?.toString().trim();
    const description = formData.get("description")?.toString().trim();
    const featuresInput = formData.get("features")?.toString().trim();

    // Convert features input to an array
    const features = featuresInput ? featuresInput.split("\n").map(f => f.trim()).filter(f => f !== "") : [];

    const action = formData.get("_action");
    const client = await clientPromise;
    const db = client.db("Smartshop");
    const productsCollection = db.collection("products");

    if (action === "addProduct") {
        if (name && category && price && stock && status && description && features.length > 0) {
            await productsCollection.insertOne({ name, category, price, stock, status, imageUrl, description, features });
            return redirect("/dashboard/products");
        }
        return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    } else if (action === "updateProduct") {
        const productId = formData.get("productId")?.toString();
        if (productId && name && category && price && stock && status && description && features.length > 0) {
            await productsCollection.updateOne(
                { _id: new ObjectId(productId) },
                { $set: { name, category, price, stock, status, imageUrl, description, features } }
            );
            return redirect("/dashboard/products");
        }
    } else if (action === "deleteProduct") {
        const productId = formData.get("productId")?.toString();
        if (productId) {
            await productsCollection.deleteOne({ _id: new ObjectId(productId) });
            return redirect("/dashboard/products");
        }
    }

    return null;
}

export const loader = async () => {
    const client = await clientPromise;
    const db = client.db("Smartshop");
    const products = await db.collection("products").find({}).toArray();
    return { products: JSON.parse(JSON.stringify(products)) };
};

function AddOrUpdateProduct({ product, closeModal }: { product?: any; closeModal: () => void }) {
    const [formData, setFormData] = useState({
        name: product?.name || "",
        category: product?.category || "",
        price: product?.price || "",
        stock: product?.stock || "",
        status: product?.status || "Active",
        imageUrl: product?.imageUrl || "",
        description: product?.description || "",
        features: product?.features || ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-gray-900 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                        <Package className="h-6 w-6" />
                        {product ? "Update Product" : "Add New Product"}
                    </h2>
                    <button 
                        onClick={closeModal}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <Form method="post" className="space-y-6" onSubmit={closeModal}>
                    {product && <input type="hidden" name="productId" value={product._id} />}
                    
                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2" htmlFor="name">
                            <Tags className="h-4 w-4" />
                            Product Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter product name"
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2" htmlFor="category">
                                <ListPlus className="h-4 w-4" />
                                Category
                            </label>
                            <input
                                type="text"
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                                placeholder="Enter product category"
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2" htmlFor="price">
                            <Wallet className="h-4 w-4" />
                                Price
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                placeholder="Enter product price"
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2" htmlFor="stock">
                                <Box className="h-4 w-4" />
                                Stock Quantity
                            </label>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                placeholder="Enter stock quantity"
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2" htmlFor="imageUrl">
                                <Image className="h-4 w-4" />
                                Product Image Url
                            </label>
                            <input
                                type="url"
                                id="imageUrl"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                placeholder="Enter product image URL"
                                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2" htmlFor="description">
                            <FileText className="h-4 w-4" />
                            Product Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter product description"
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2" htmlFor="features">
                            <ListPlus className="h-4 w-4" />
                            Product Features
                        </label>
                        <textarea
                            id="features"
                            name="features"
                            value={formData.features}
                            onChange={handleChange}
                            placeholder="Enter product features (one per line)"
                            rows={4}
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2" htmlFor="status">
                            <Activity className="h-4 w-4" />
                            Status
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        name="_action"
                        value={product ? "updateProduct" : "addProduct"}
                        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                        <Package className="h-5 w-5" />
                        {product ? "Update Product" : "Add Product"}
                    </button>
                </Form>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const { products } = useLoaderData();

    return (
        <div className="container mx-auto p-6 bg-gray-900 min-h-screen">
            <header className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-semibold text-white">Products</h1>
                <button
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
                    onClick={() => {
                        setIsOpen(true);
                        setSelectedProduct(null);
                    }}
                >
                    <PlusCircle className="w-5 h-5" />
                    Add Product
                </button>
            </header>
            {isOpen && (
                <AddOrUpdateProduct
                    product={selectedProduct}
                    closeModal={() => setIsOpen(false)}
                />
            )}
            <div className="overflow-x-auto bg-gray-800 p-6 rounded-lg border border-gray-700">
                <table className="w-full table-auto text-left text-gray-300">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="py-3 px-4">Name</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Price</th>
                            <th className="py-3 px-4">Stock</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id} className="border-b border-gray-700 hover:bg-gray-750">
                                <td className="py-3 px-4">{product.name}</td>
                                <td className="py-3 px-4">{product.category}</td>
                                <td className="py-3 px-4">{product.price}</td>
                                <td className="py-3 px-4">{product.stock}</td>
                                <td className="py-3 px-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm ${
                                            product.status === "Active"
                                                ? "bg-green-600 text-green-200"
                                                : "bg-red-600 text-red-200"
                                        }`}
                                    >
                                        {product.status}
                                    </span>
                                </td>
                                <td className="py-3 px-4 flex gap-2">
                                    <button
                                        className="p-2 bg-gray-700 rounded-lg"
                                        onClick={() => {
                                            setSelectedProduct(product);
                                            setIsOpen(true);
                                        }}
                                    >
                                        <Edit className="w-5 h-5 text-blue-400" />
                                    </button>
                                    <Form method="post" className="p-2 bg-gray-700 rounded-lg">
                                        <input type="hidden" name="productId" value={product._id} />
                                        <button type="submit" name="_action" value="deleteProduct">
                                            <Trash2 className="w-5 h-5 text-red-400" />
                                        </button>
                                    </Form>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
