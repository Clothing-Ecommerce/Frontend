import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  Tag,
  Lock,
  Edit,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Mock cart data
interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
  inStock: boolean;
  maxQuantity: number;
  category: string;
  availableColors: { name: string; value: string; hex: string }[];
  availableSizes: { name: string; available: boolean }[];
}

const initialCartItems: CartItem[] = [
  {
    id: 1,
    name: "Classic Navy Blazer",
    price: 299,
    originalPrice: 399,
    image: "/placeholder.svg?height=200&width=200",
    color: "Navy",
    size: "L",
    quantity: 1,
    inStock: true,
    maxQuantity: 5,
    category: "blazers",
    availableColors: [
      { name: "Navy", value: "navy", hex: "#1e3a8a" },
      { name: "Black", value: "black", hex: "#000000" },
      { name: "Charcoal", value: "charcoal", hex: "#374151" },
    ],
    availableSizes: [
      { name: "S", available: true },
      { name: "M", available: true },
      { name: "L", available: true },
      { name: "XL", available: true },
      { name: "XXL", available: false },
    ],
  },
  {
    id: 2,
    name: "Cotton Dress Shirt",
    price: 79,
    originalPrice: 99,
    image: "/placeholder.svg?height=200&width=200",
    color: "White",
    size: "M",
    quantity: 2,
    inStock: true,
    maxQuantity: 10,
    category: "shirts",
    availableColors: [
      { name: "White", value: "white", hex: "#ffffff" },
      { name: "Blue", value: "blue", hex: "#3b82f6" },
      { name: "Light Gray", value: "light-gray", hex: "#d1d5db" },
    ],
    availableSizes: [
      { name: "S", available: true },
      { name: "M", available: true },
      { name: "L", available: true },
      { name: "XL", available: true },
      { name: "XXL", available: true },
    ],
  },
  {
    id: 3,
    name: "Oxford Leather Shoes",
    price: 159,
    originalPrice: 199,
    image: "/placeholder.svg?height=200&width=200",
    color: "Brown",
    size: "10",
    quantity: 1,
    inStock: true,
    maxQuantity: 3,
    category: "shoes",
    availableColors: [
      { name: "Brown", value: "brown", hex: "#92400e" },
      { name: "Black", value: "black", hex: "#000000" },
      { name: "Tan", value: "tan", hex: "#d2b48c" },
    ],
    availableSizes: [
      { name: "7", available: true },
      { name: "8", available: true },
      { name: "9", available: true },
      { name: "10", available: true },
      { name: "11", available: true },
      { name: "12", available: false },
    ],
  },
  {
    id: 4,
    name: "Premium Leather Watch",
    price: 199,
    originalPrice: 249,
    image: "/placeholder.svg?height=200&width=200",
    color: "Black",
    size: "One Size",
    quantity: 1,
    inStock: false,
    maxQuantity: 0,
    category: "accessories",
    availableColors: [
      { name: "Black", value: "black", hex: "#000000" },
      { name: "Brown", value: "brown", hex: "#92400e" },
    ],
    availableSizes: [{ name: "One Size", available: true }],
  },
];

const availablePromoCodes = [
  {
    code: "SAVE10",
    discount: 10,
    description: "Save 10% on your order",
    minOrder: 0,
    expires: "Dec 31, 2024",
  },
  {
    code: "WELCOME15",
    discount: 15,
    description: "Welcome discount for new customers",
    minOrder: 100,
    expires: "Dec 31, 2024",
  },
  {
    code: "NEWCUSTOMER20",
    discount: 20,
    description: "Special discount for first-time buyers",
    minOrder: 150,
    expires: "Dec 31, 2024",
  },
  {
    code: "FREESHIP",
    discount: 0,
    description: "Free shipping on any order",
    minOrder: 0,
    expires: "Dec 31, 2024",
    freeShipping: true,
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
    freeShipping?: boolean;
  } | null>(null);
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [editFormData, setEditFormData] = useState<{
    quantity: number;
    color: string;
    size: string;
  }>({ quantity: 1, color: "", size: "" });

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const savings = cartItems.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);
  const promoDiscount = appliedPromo
    ? (subtotal * appliedPromo.discount) / 100
    : 0;
  const shipping = appliedPromo?.freeShipping || subtotal >= 200 ? 0 : 15;
  const tax = (subtotal - promoDiscount) * 0.08; // 8% tax
  const total = subtotal - promoDiscount + shipping + tax;

  const handleQuantityChange = (id: number, newQuantity: number) => {
    setCartItems((items) =>
      items
        .map((item) => {
          if (item.id === id) {
            const quantity = Math.max(
              0,
              Math.min(newQuantity, item.maxQuantity)
            );
            return { ...item, quantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const handleEditItem = (item: CartItem) => {
    setEditingItem(item);
    setEditFormData({
      quantity: item.quantity,
      color: item.color,
      size: item.size,
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (editingItem) {
      setCartItems((items) =>
        items.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                quantity: editFormData.quantity,
                color: editFormData.color,
                size: editFormData.size,
              }
            : item
        )
      );
      setShowEditDialog(false);
      setEditingItem(null);
    }
  };

  const handleApplyPromo = async (selectedCode?: string) => {
    const codeToApply = selectedCode || promoCode;
    setIsPromoLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const promoData = availablePromoCodes.find(
      (p) => p.code === codeToApply.toUpperCase()
    );

    if (promoData && subtotal >= promoData.minOrder) {
      setAppliedPromo({
        code: promoData.code,
        discount: promoData.discount,
        freeShipping: promoData.freeShipping,
      });
      setShowPromoDialog(false);
      setPromoCode("");
    } else if (promoData && subtotal < promoData.minOrder) {
      alert(
        `Minimum order of $${promoData.minOrder} required for this promo code`
      );
    } else {
      alert("Invalid promo code");
    }
    setIsPromoLoading(false);
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Breadcrumb */}
      {/* <div className="bg-gray-50 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">Shopping Cart</span>
          </nav>
        </div>
      </div> */}

      <div className="max-w-7xl mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          // Empty Cart
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Your Cart is Empty
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your cart yet. Start
              shopping to fill it up!
            </p>
            <Button asChild className="bg-black text-white hover:bg-gray-800">
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Shopping Cart
                </h1>
                <Link
                  to="/products"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover rounded-md"
                          />
                          {!item.inStock && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                Out of Stock
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {item.name}
                              </h3>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span>Color: {item.color}</span>
                                <span>Size: {item.size}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditItem(item)}
                                className="text-gray-400 hover:text-amber-600 p-1"
                                title="Edit item"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-gray-400 hover:text-red-500 p-1"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">
                                ${item.price}
                              </span>
                              {item.originalPrice && (
                                <span className="text-sm text-gray-500 line-through">
                                  ${item.originalPrice}
                                </span>
                              )}
                              {item.originalPrice && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Save ${item.originalPrice - item.price}
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="flex items-center border border-gray-300 rounded-md">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity - 1
                                    )
                                  }
                                  disabled={item.quantity <= 1 || !item.inStock}
                                  className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(
                                      item.id,
                                      item.quantity + 1
                                    )
                                  }
                                  disabled={
                                    item.quantity >= item.maxQuantity ||
                                    !item.inStock
                                  }
                                  className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <span className="text-lg font-bold text-gray-900 min-w-[80px] text-right">
                                ${(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {!item.inStock && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-800">
                                This item is currently out of stock. Remove it
                                or save it for later.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>You Save</span>
                      <span>-${savings.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Promo Code Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Promo Code</span>
                      {appliedPromo && (
                        <Badge className="bg-green-100 text-green-800">
                          {appliedPromo.code} (-{appliedPromo.discount}%)
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      className="w-full bg-transparent justify-between"
                      onClick={() => setShowPromoDialog(true)}
                    >
                      <span>
                        {appliedPromo
                          ? `${appliedPromo.code} applied`
                          : "Select or enter code"}
                      </span>
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>

                  <Button className="w-full bg-black text-white hover:bg-gray-800 py-3">
                    <Lock className="w-4 h-4 mr-2" />
                    Proceed to Checkout
                  </Button>

                  {/* Security Features */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>Secure 256-bit SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>Free shipping on orders over $200</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <RotateCcw className="w-4 h-4 text-amber-600" />
                      <span>30-day return policy</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">We accept:</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        VISA
                      </div>
                      <div className="w-8 h-6 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">
                        MC
                      </div>
                      <div className="w-8 h-6 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">
                        AMEX
                      </div>
                      <div className="w-8 h-6 bg-yellow-400 rounded text-black text-xs flex items-center justify-center font-bold">
                        PP
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Edit Item Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Edit Item
              </DialogTitle>
              <DialogDescription>
                Update the details for {editingItem?.name}
              </DialogDescription>
            </DialogHeader>

            {editingItem && (
              <div className="space-y-6">
                {/* Product Preview */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={editingItem.image || "/placeholder.svg"}
                    alt={editingItem.name}
                    width={60}
                    height={60}
                    className="w-15 h-15 object-cover rounded-md"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {editingItem.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ${editingItem.price}
                    </p>
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {editingItem.availableColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() =>
                          setEditFormData((prev) => ({
                            ...prev,
                            color: color.name,
                          }))
                        }
                        className={`w-10 h-10 rounded-full border-2 ${
                          editFormData.color === color.name
                            ? "border-gray-900"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Selected: {editFormData.color}
                  </p>
                </div>

                {/* Size Selection */}
                <div className="space-y-2">
                  <Label htmlFor="edit-size">Select Size</Label>
                  <div className="grid grid-cols-3 gap-2 max-w-[400px]">
                    {editingItem.availableSizes.map((size) => (
                      <button
                        key={size.name}
                        onClick={() =>
                          size.available &&
                          setEditFormData((prev) => ({
                            ...prev,
                            size: size.name,
                          }))
                        }
                        disabled={!size.available}
                        className={`px-3 py-2 border rounded-lg text-sm font-medium transition-all ${
                          editFormData.size === size.name
                            ? "border-black bg-black text-white"
                            : size.available
                            ? "border-gray-300 bg-white text-gray-900 hover:border-gray-400"
                            : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="space-y-3">
                  <Label htmlFor="edit-quantity">Quantity</Label>
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center justify-center border border-gray-300 rounded-md">
                      <button
                        onClick={() =>
                          setEditFormData((prev) => ({
                            ...prev,
                            quantity: Math.max(1, prev.quantity - 1),
                          }))
                        }
                        disabled={editFormData.quantity <= 1}
                        className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                        {editFormData.quantity}
                      </span>
                      <button
                        onClick={() =>
                          setEditFormData((prev) => ({
                            ...prev,
                            quantity: Math.min(
                              editingItem.maxQuantity,
                              prev.quantity + 1
                            ),
                          }))
                        }
                        disabled={
                          editFormData.quantity >= editingItem.maxQuantity
                        }
                        className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">
                      Max: {editingItem.maxQuantity} items available
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-black text-white hover:bg-gray-800"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowEditDialog(false)}
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Promo Code Dialog */}
        <Dialog open={showPromoDialog} onOpenChange={setShowPromoDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Select Promo Code
              </DialogTitle>
              <DialogDescription>
                Choose from available codes or enter your own
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Available Codes */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">
                  Available Codes
                </h4>
                <div className="max-h-[240px] overflow-y-auto space-y-2 pr-2">
                  {availablePromoCodes.map((promo) => (
                    <div
                      key={promo.code}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        subtotal >= promo.minOrder
                          ? "border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                          : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                      }`}
                      onClick={() =>
                        subtotal >= promo.minOrder &&
                        handleApplyPromo(promo.code)
                      }
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-amber-600">
                          {promo.code}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {promo.freeShipping
                            ? "Free Shipping"
                            : `-${promo.discount}%`}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        {promo.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Min. order: ${promo.minOrder}</span>
                        <span>Expires: {promo.expires}</span>
                      </div>
                      {subtotal < promo.minOrder && (
                        <p className="text-xs text-red-600 mt-1">
                          Add ${(promo.minOrder - subtotal).toFixed(2)} more to
                          qualify
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Entry */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">
                  Enter Code Manually
                </h4>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter promo code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleApplyPromo()}
                    disabled={!promoCode || isPromoLoading}
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    {isPromoLoading ? "Applying..." : "Apply"}
                  </Button>
                </div>
              </div>

              {appliedPromo && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-green-800">
                        {appliedPromo.code}
                      </span>
                      <p className="text-sm text-green-600">
                        {appliedPromo.freeShipping
                          ? "Free shipping applied"
                          : `${appliedPromo.discount}% discount applied`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemovePromo}
                      className="text-green-600 hover:text-green-800 hover:bg-green-100"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Footer />
    </div>
  );
}
