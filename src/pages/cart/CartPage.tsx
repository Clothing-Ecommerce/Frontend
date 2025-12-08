import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import api from "@/utils/axios";
import { formatPrice } from "@/utils/formatPrice";
import type {
  CartItem,
  CartResponse,
  CartSummary,
  VariantOption,
} from "@/types/cartType";
import { useCartCount } from "@/hooks/useCartCount";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const { setCartQuantity } = useCartCount();

  // // Save appliedPromo from server (helps display "FREE (promo)" if the code has free shipping)
  // const [appliedPromo, setAppliedPromo] = useState<CartResponse["appliedPromo"] | undefined>(undefined);

  // ==== Edit dialog states ====
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [editFormData, setEditFormData] = useState<{ quantity: number }>({
    quantity: 1,
  });

  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const sortCartItems = (items: CartItem[]) =>
    [...items].sort((a, b) => a.id - b.id);

  // Initial cart
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await api.get<CartResponse>("/cart");
        refreshCartFromResponse(res);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setCartQuantity(0);
      }
    };
    fetchCart();
  }, [setCartQuantity]);

  const subtotal = summary?.subtotal ?? 0;
  const shipping = summary?.shipping ?? 0;
  const tax = summary?.tax ?? 0;
  const total = summary?.total ?? 0;
  const itemsCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  // ==== Helpers ====
  const refreshCartFromResponse = (res: { data: CartResponse }) => {
    const sortedItems = sortCartItems(res.data.items);
    setCartItems(sortedItems);
    setSummary(res.data.summary);
    const totalQuantity = sortedItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    setCartQuantity(totalQuantity);
    // setAppliedPromo(res.data.appliedPromo);
  };

  // ==== Cart item actions ====
  const handleQuantityChange = async (id: number, newQuantity: number) => {
    try {
      const res = await api.patch<CartResponse>(`/cart/items/${id}`, {
        quantity: newQuantity,
      });
      refreshCartFromResponse(res);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Unable to update quantity";
      alert(msg);
    }
  };

  const handleRemoveItem = async (id: number) => {
    try {
      const res = await api.delete<CartResponse>(`/cart/items/${id}`);
      refreshCartFromResponse(res);
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Unable to remove item";
      alert(msg);
    }
  };

  const handleEditItem = async (item: CartItem) => {
    setEditingItem(item);
    setEditFormData({ quantity: item.quantity });

    // set initial selection according to the current item
    setSelectedColor(item.color);
    setSelectedSize(item.size);

    try {
      // Endpoint: GET /products/:productId/variants
      const res = await api.get<VariantOption[]>(
        `/products/${item.product.id}/variants`
      );
      setVariants(res.data);
    } catch (e) {
      console.error(e);
    }

    setShowEditDialog(true);
  };

  // Create color/size list from variants (unique + available)
  const colorOptions = useMemo(() => {
    const map = new Map<
      string,
      { name: string; hex: string; available: boolean }
    >();
    variants.forEach((v) => {
      const name = v.colorName ?? "Default";
      const hex = v.colorHex ?? "#ccc";
      const available = v.isActive && v.stock > 0;
      const prev = map.get(name);
      map.set(name, {
        name,
        hex,
        available: prev ? prev.available || available : available,
      });
    });
    return Array.from(map.values());
  }, [variants]);

  const sizeOptions = useMemo(() => {
    const color = selectedColor ?? "Default";
    const map = new Map<string, { name: string; available: boolean }>();
    variants.forEach((v) => {
      if ((v.colorName ?? "Default") !== color) return;
      const name = v.sizeName ?? "One Size";
      const available = v.isActive && v.stock > 0;
      const prev = map.get(name);
      map.set(name, {
        name,
        available: prev ? prev.available || available : available,
      });
    });
    return Array.from(map.values());
  }, [variants, selectedColor]);

  const handleSaveEdit = async () => {
    if (!editingItem) return;
    // Find variantId corresponding to (selectedColor, selectedSize)
    const target = variants.find(
      (v) =>
        (v.colorName ?? "Default") === (selectedColor ?? "Default") &&
        (v.sizeName ?? "One Size") === (selectedSize ?? "One Size")
    );
    if (!target) {
      alert("Color/size combination is not available");
      return;
    }

    try {
      const desiredQuantity = Math.max(1, editFormData.quantity);
      const variantChanged = target.id !== editingItem.variantId;

      let currentItemId = editingItem.id;
      let currentQuantity = editingItem.quantity;

      if (variantChanged) {
        const res = await api.patch<CartResponse>(
          `/cart/items/${editingItem.id}`,
          { variantId: target.id }
        );
        refreshCartFromResponse(res);

        const updatedItem = res.data.items.find(
          (it) => it.variantId === target.id
        );

        if (!updatedItem) {
          throw new Error("Could not find item after updating variant");
        }

        currentItemId = updatedItem.id;
        currentQuantity = updatedItem.quantity;
      }

      if (desiredQuantity !== currentQuantity) {
        const res = await api.patch<CartResponse>(
          `/cart/items/${currentItemId}`,
          { quantity: desiredQuantity }
        );
        refreshCartFromResponse(res);

        currentQuantity =
          res.data.items.find((it) => it.id === currentItemId)?.quantity ??
          currentQuantity;
      }

      setShowEditDialog(false);
      setEditingItem(null);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Unable to save changes";
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {cartItems.length === 0 ? (
          // Empty Cart
          <div className="text-center py-16">
            <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Cart is empty
            </h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You have not added any items yet. Continue shopping!
            </p>
            <Button asChild className="bg-black text-white hover:bg-gray-800">
              <Link to="/products/all">Continue shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Cart
                </h1>
                <Link
                  to="/products/all"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Continue shopping
                </Link>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <img
                            src={item.product.imageUrl || "/placeholder.svg"}
                            alt={item.product.name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover rounded-md"
                          />
                          {!item.inStock && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-md flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                Out of stock
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {item.product.name}
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
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-gray-400 hover:text-red-500 p-1"
                                title="Remove"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-gray-900">
                                {formatPrice(item.unitPrice)}
                              </span>
                              {item.listPrice != null && (
                                <span className="text-sm text-gray-500 line-through">
                                  {formatPrice(item.listPrice)}
                                </span>
                              )}
                              {item.listPrice != null &&
                                item.listPrice > item.unitPrice && (
                                  <Badge className="bg-green-100 text-green-800 text-xs">
                                    Save{" "}
                                    {formatPrice(item.listPrice - item.unitPrice)}
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
                              <span className="text-lg font-bold text-gray-900 min-w-[120px] text-right">
                                {formatPrice(item.totalPrice)}
                              </span>
                            </div>
                          </div>

                          {!item.inStock && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-800">
                                This item is temporarily unavailable. Please remove it or save it for later.
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
                  <CardTitle>Order summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Subtotal ({itemsCount} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping fee</span>
                    <span>
                      {shipping === 0 ? "Free" : formatPrice(shipping)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>{formatPrice(tax)}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>

                  <Button className="w-full bg-black text-white hover:bg-gray-800 py-3">
                    <Lock className="w-4 h-4 mr-2" />
                    <Link to="/cart/checkout">
                      Place order
                    </Link>
                  </Button>

                  {/* Security / Policy */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4 text-green-600" />
                      <span>256-bit SSL encryption</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>Free shipping for eligible orders</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <RotateCcw className="w-4 h-4 text-amber-600" />
                      <span>30-day returns</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  {/* <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Payment methods:</p>
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
                  </div> */}
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
                Edit item
              </DialogTitle>
              <DialogDescription>
                Update options for {editingItem?.product.name}
              </DialogDescription>
            </DialogHeader>

            {editingItem && (
              <div className="space-y-6">
                {/* Product Preview */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={editingItem.product.imageUrl || "/placeholder.svg"}
                    alt={editingItem.product.name}
                    width={60}
                    height={60}
                    className="w-15 h-15 object-cover rounded-md"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {editingItem.product.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatPrice(editingItem.unitPrice)}
                    </p>
                  </div>
                </div>

                {/* Color Selection */}
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.name}
                        onClick={() =>
                          color.available && setSelectedColor(color.name)
                        }
                        disabled={!color.available}
                        className={`w-10 h-10 rounded-full border-2 ${
                          selectedColor === color.name
                            ? "border-gray-900"
                            : "border-gray-300"
                        } ${!color.available ? "opacity-40 cursor-not-allowed" : ""}`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    Selected: {selectedColor ?? "—"}
                  </p>
                </div>

                {/* Size Selection */}
                <div className="space-y-2">
                  <Label htmlFor="edit-size">Size</Label>
                  <div className="grid grid-cols-3 gap-2 max-w-[400px]">
                    {sizeOptions.map((size) => (
                      <button
                        key={size.name}
                        onClick={() =>
                          size.available && setSelectedSize(size.name)
                        }
                        disabled={!size.available}
                        className={`px-3 py-2 border rounded-lg text-sm font-medium transition-all ${
                          selectedSize === size.name
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
                        disabled={editFormData.quantity >= editingItem.maxQuantity}
                        className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">
                      Maximum: {editingItem.maxQuantity} items
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowEditDialog(false)}
                    className="flex-1 bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    className="flex-1 bg-black text-white hover:bg-gray-800"
                  >
                    Save changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      <Footer />
    </div>
  );
}
