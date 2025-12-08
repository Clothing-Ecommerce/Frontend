import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Edit, Package, ChevronRight, Tag, Wallet } from "lucide-react";
import { SelectAddressDialog } from "@/components/checkout/selectAddressDialog";
import { SelectPaymentDialog } from "@/components/checkout/selectPaymentDialog";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import api from "@/utils/axios";
import type { Address } from "@/types/addressType";
import { formatPrice } from "@/utils/formatPrice";
import type { AvailableCoupon, CartItem, CartResponse, CartSummary } from "@/types/cartType";
import { saveLatestMomoAttempt } from "@/utils/paymentStorage";
import { useCartCount } from "@/hooks/useCartCount";

type CheckoutAddress = Address & { addressId: number };

const getLabelText = (label: CheckoutAddress["label"] | null | undefined) => {
  switch (label) {
    case "HOME":
      return "Home";
    case "WORK":
      return "Workplace";
    case "OTHER":
      return "Other";
    default:
      return "Other";
  }
};

const formatAddress = (address: CheckoutAddress) => {
  const segments = [
    address.houseNumber,
    address.street,
    address.wardName,
    address.districtName,
    address.provinceName,
    address.postalCode,
  ].filter(Boolean);

  const buildingSegments = [address.building, address.block, address.floor, address.room].filter(Boolean);

  let formatted = segments.join(", ");
  if (buildingSegments.length) {
    formatted = formatted ? `${buildingSegments.join(", ")}, ${formatted}` : buildingSegments.join(", ");
  }

  if (address.country) {
    formatted = formatted ? `${formatted}, ${address.country}` : address.country;
  }

  return formatted;
};

type PaymentOptionId = "momo" | "cod";

type PaymentMethodCode = "COD" | "MOMO";

interface PlaceOrderResponse {
  order: {
    id: number;
    status: string;
    subtotal: number;
    discount: number;
    shippingFee: number;
    tax: number;
    total: number;
    createdAt: string;
  };
  paymentMethod: PaymentMethodCode;
  appliedPromo?: {
    code: string;
    discount: number;
    freeShipping: boolean;
  };
  paymentAttempt?: {
    paymentId: number;
    payUrl: string | null;
    gateway?: any;
  };
  paymentError?: {
    code: string;
    message?: string;
  };
}

const paymentMethods: {
  id: PaymentOptionId;
  name: string;
  description: string;
  icon: "momo" | "cod";
}[] = [
  {
    id: "momo",
    name: "MoMo E-Wallet",
    description: "Pay securely with MoMo",
    icon: "momo" as const,
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay when you receive",
    icon: "cod" as const,
  },
];

export default function CheckoutPage() {
  const [addresses, setAddresses] = useState<CheckoutAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<PaymentOptionId>("cod");
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [summary, setSummary] = useState<CartSummary | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<CartResponse["appliedPromo"]>();
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);
  const [promoCode, setPromoCode] = useState("");
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [showPromoDialog, setShowPromoDialog] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const { setCartQuantity } = useCartCount();

  const sortCartItems = (items: CartItem[]) => [...items].sort((a, b) => a.id - b.id);

  useEffect(() => {
    let isMounted = true;

    const fetchAddresses = async () => {
      try {
        setIsLoadingAddresses(true);
        const { data } = await api.get<Address[]>("/user/addresses");
        if (!isMounted) return;

        const sanitized = (data ?? []).filter((item): item is CheckoutAddress =>
          typeof item.addressId === "number"
        );

        setAddresses(sanitized);
        setSelectedAddressId((prev) => {
          if (prev && sanitized.some((addr) => addr.addressId === prev)) {
            return prev;
          }
          const defaultAddress = sanitized.find((addr) => addr.isDefault);
          const fallback = defaultAddress ?? sanitized[0];
          return fallback ? fallback.addressId : null;
        });
      } catch (error) {
        console.error("Failed to fetch user addresses", error);
        if (isMounted) {
          setAddresses([]);
          setSelectedAddressId(null);
        }
      } finally {
        if (isMounted) {
          setIsLoadingAddresses(false);
        }
      }
    };

    fetchAddresses();

    return () => {
      isMounted = false;
    };
  }, [setCartQuantity]);

  const refreshCartFromResponse = (res: { data: CartResponse }) => {
    const sortedItems = sortCartItems(res.data.items);
    setCartItems(sortedItems);
    setSummary(res.data.summary);
    setAppliedPromo(res.data.appliedPromo);
    const totalQuantity = sortedItems.reduce(
      (acc, item) => acc + item.quantity,
      0
    );
    setCartQuantity(totalQuantity);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchCart = async () => {
      try {
        setIsLoadingCart(true);
        const res = await api.get<CartResponse>("/cart");
        if (!isMounted) return;
        refreshCartFromResponse(res);
      } catch (error) {
        console.error("Failed to fetch cart for checkout", error);
        if (isMounted) {
          setCartItems([]);
          setSummary(null);
          setAppliedPromo(undefined);
          setCartQuantity(0);
        }
      } finally {
        if (isMounted) {
          setIsLoadingCart(false);
        }
      }
    };

    fetchCart();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedAddress = useMemo(
    () =>
      selectedAddressId !== null
        ? addresses.find((addr) => addr.addressId === selectedAddressId) ?? null
        : null,
    [addresses, selectedAddressId]
  );
  const selectedPayment = paymentMethods.find(
    (method) => method.id === selectedPaymentId
  );

  const subtotal = summary?.subtotal ?? 0;
  const discount = summary?.promoDiscount ?? 0;
  const shipping = summary?.shipping ?? 0;
  const tax = summary?.tax ?? 0;
  const total = summary?.total ?? 0;

  const handlePlaceOrder = async () => {
    if (isPlacingOrder) return;

    if (!selectedAddressId) {
      setOrderError("Please select a shipping address before payment.");
      return;
    }

    if (!summary || cartItems.length === 0) {
      setOrderError("Your cart is empty. Please add items before placing an order.");
      return;
    }

    const paymentMethod: PaymentMethodCode = selectedPaymentId === "momo" ? "MOMO" : "COD";

    setOrderError(null);
    setIsPlacingOrder(true);

    try {
      const payload = {
        addressId: selectedAddressId,
        paymentMethod,
      };

      const response = await api.post<PlaceOrderResponse>("/order/checkout", payload);
      const data = response.data;

      if (paymentMethod === "MOMO") {
        if (data.paymentError) {
          setOrderError(data.paymentError.message || "Unable to create MoMo payment. Please try again.");
          return;
        }

        const payUrl = data.paymentAttempt?.payUrl || data.paymentAttempt?.gateway?.payUrl;
        if (payUrl) {
          if (data.paymentAttempt?.paymentId) {
            saveLatestMomoAttempt({
              paymentId: data.paymentAttempt.paymentId,
              orderId: data.order?.id,
            });
          }
          window.location.href = payUrl;
          return;
        }

        setOrderError("Did not receive MoMo payment link. Please try again later.");
        return;
      }

      window.location.href = "/cart/checkout/success";
    } catch (error: any) {
      const message = error?.response?.data?.message;
      const code = error?.response?.data?.code;

      switch (code) {
        case "ADDRESS_NOT_FOUND":
          setOrderError("Shipping address not found. Please select a different address.");
          break;
        case "CART_EMPTY":
          setOrderError("Your cart is empty.");
          break;
        case "ITEM_OUT_OF_STOCK":
          setOrderError("Some items are out of stock. Please check your cart.");
          break;
        case "QUANTITY_EXCEEDS_STOCK":
          setOrderError("Item quantity exceeds stock. Please adjust your cart.");
          break;
        default:
          setOrderError(message || "Unable to create order. Please try again later.");
      }
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const openPromoDialog = async () => {
    setShowPromoDialog(true);
    try {
      const res = await api.get<{ coupons: AvailableCoupon[] }>("/cart/promos/available");
      setAvailableCoupons(res.data.coupons);
    } catch (error) {
      console.error("Failed to load available promos", error);
    }
  };

  const handleApplyPromo = async (selectedCode?: string) => {
    const codeToApply = (selectedCode || promoCode || "").trim();
    if (!codeToApply) return;

    setIsPromoLoading(true);
    try {
      const res = await api.post<CartResponse>("/cart/promos/apply", { code: codeToApply });
      refreshCartFromResponse(res);
      setShowPromoDialog(false);
      setPromoCode("");
    } catch (error: any) {
      const code = error?.response?.data?.code;
      const missing = error?.response?.data?.data?.missingAmount;
      switch (code) {
        case "MIN_ORDER_NOT_MET":
          alert(`You need to spend an additional ${formatPrice(Number(missing) || 0)} to apply the code`);
          break;
        case "INVALID_COUPON":
          alert("Promo code is invalid");
          break;
        case "COUPON_INACTIVE":
          alert("Promo code is currently inactive");
          break;
        case "COUPON_NOT_STARTED":
          alert("Promo code has not started yet");
          break;
        case "COUPON_EXPIRED":
          alert("Promo code has expired");
          break;
        case "USAGE_LIMIT_REACHED":
          alert("Promo code has reached its usage limit");
          break;
        case "CART_EMPTY":
          alert("Cart is empty");
          break;
        default:
          alert(error?.response?.data?.message || "Unable to apply code");
      }
    } finally {
      setIsPromoLoading(false);
    }
  };

  const handleRemovePromo = async () => {
    setIsPromoLoading(true);
    try {
      const res = await api.delete<CartResponse>("/cart/promos/apply");
      refreshCartFromResponse(res);
      setPromoCode("");
    } catch (error: any) {
      alert(error?.response?.data?.message || "Unable to remove code");
    } finally {
      setIsPromoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm">
                  1
                </div>
                <span className="text-gray-900 font-medium hidden sm:inline">
                  Cart
                </span>
              </div>
            </div>

            <div className="w-24 sm:w-32 h-0.5 bg-gray-900 mx-2" />

            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-semibold text-sm">
                  2
                </div>
                <span className="text-gray-900 font-medium hidden sm:inline">
                  Checkout
                </span>
              </div>
            </div>

            <div className="w-24 sm:w-32 h-0.5 bg-gray-300 mx-2" />

            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-gray-300 text-gray-400 flex items-center justify-center font-semibold text-sm">
                  3
                </div>
                <span className="text-gray-400 font-medium hidden sm:inline">
                  Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-900" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Shipping address
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-gray-600 hover:text-gray-900"
                  onClick={() => setShowAddressDialog(true)}
                  disabled={isLoadingAddresses}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Change address
                </Button>
              </div>

              {isLoadingAddresses ? (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600">
                  Loading shipping address...
                </div>
              ) : selectedAddress ? (
                <div className="p-4 border-2 border-gray-900 rounded-lg bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      {selectedAddress.recipient}
                    </span>
                    {selectedAddress.isDefault && (
                      <span className="px-2 py-0.5 bg-gray-900 text-white text-xs rounded font-medium">
                        Default
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {getLabelText(selectedAddress.label)}
                    </span>
                  </div>
                  {selectedAddress.phone && (
                    <p className="text-sm text-gray-700 mb-1">
                      {selectedAddress.phone}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {formatAddress(selectedAddress)}
                  </p>
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600">
                  You have not saved any address yet. Please add an address to your profile before placing an order.
                </div>
              )}
            </div>

            {/* Order Items */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-gray-900" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Order Items
                </h2>
              </div>

              <div className="space-y-4">
                {isLoadingCart ? (
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600">
                    Loading items in cart...
                  </div>
                ) : cartItems.length > 0 ? (
                  cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <img
                        src={item.product.imageUrl || "/placeholder.svg"}
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-md bg-gray-200"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.size || "No size"} • {item.color || "No color"}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            Qty: {item.quantity}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatPrice(item.unitPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600">
                    Your cart is empty. Please add products before checkout.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Promotion */}
              <button
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
                onClick={openPromoDialog}
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-amber-600" />
                  <div className="flex flex-col items-start text-sm text-gray-700">
                    <span>Choose promotion</span>
                    {(appliedPromo || (summary?.promoDiscount ?? 0) > 0) && (
                      <Badge className="mt-1 bg-green-100 text-green-800">
                        {appliedPromo
                          ? `${appliedPromo.code} (−${formatPrice(summary?.promoDiscount ?? 0)})`
                          : `Applied (−${formatPrice(summary?.promoDiscount ?? 0)})`}
                      </Badge>
                    )}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              {/* Payment Method */}
              <button
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
                onClick={() => setShowPaymentDialog(true)}
              >
                <div className="flex items-center gap-3">
                  <Wallet className="w-5 h-5 text-gray-900" />
                  <span className="text-sm text-gray-700">
                    {selectedPayment?.name || "Select Payment"}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>

              {/* Order Summary */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Order details
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-gray-900">{formatPrice(discount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping fee</span>
                      <span className={shipping === 0 ? "text-green-600 font-medium" : "text-gray-900"}>
                        {shipping === 0 ? "Free" : formatPrice(shipping)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">{formatPrice(tax)}</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-base font-semibold text-gray-900">
                      Total
                    </span>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {formatPrice(total)}
                      </div>
                      {/* <div className="text-xs text-gray-500">
                        Mua nhiều giảm nhiều
                      </div> */}
                      <div className="text-xs text-gray-500">
                        {appliedPromo?.code ? `Applied code ${appliedPromo.code}` : "Buy more save more"}
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={
                      isPlacingOrder ||
                      !selectedAddressId ||
                      !summary ||
                      cartItems.length === 0
                    }
                    className="w-full bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-70 disabled:cursor-not-allowed py-6 text-base font-medium rounded-lg"
                  >
                    {isPlacingOrder ? "Processing..." : "Pay now"}
                    {!isPlacingOrder && <ChevronRight className="w-5 h-5 ml-2" />}
                  </Button>
                  {orderError && (
                    <p className="mt-3 text-sm text-red-600">{orderError}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Dialogs */}
      <SelectAddressDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        addresses={addresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={setSelectedAddressId}
      />

      <SelectPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        paymentMethods={paymentMethods}
        selectedPaymentId={selectedPaymentId}
        onSelectPayment={(paymentId) =>
          setSelectedPaymentId(paymentId as PaymentOptionId)
        }
      />

      <Dialog open={showPromoDialog} onOpenChange={setShowPromoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Choose promo code
            </DialogTitle>
            <DialogDescription>Choose from the list or enter your code</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Active codes</h4>
              <div className="max-h-[240px] overflow-y-auto space-y-2 pr-2">
                {availableCoupons.map((promo) => {
                  const disabled = !promo.isEligible;
                  return (
                    <div
                      key={promo.code}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        !disabled
                          ? "border-gray-200 hover:border-amber-300 hover:bg-amber-50"
                          : "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
                      }`}
                      onClick={() => !disabled && handleApplyPromo(promo.code)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-amber-600">{promo.code}</span>
                        <span className="text-sm font-medium text-gray-900">
                          {promo.freeShipping
                            ? "Free shipping"
                            : promo.type === "PERCENTAGE"
                            ? `-${promo.value}%`
                            : `-${formatPrice(promo.value)}`}
                        </span>
                      </div>
                      {promo.description && (
                        <p className="text-sm text-gray-600 mb-1">{promo.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Minimum order: {formatPrice(promo.minOrderValue)}</span>
                        {promo.endsAt && (
                          <span>
                            Expires: {new Date(promo.endsAt).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>
                      {disabled && promo.missingAmount > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          Need an additional {formatPrice(promo.missingAmount)} to qualify
                        </p>
                      )}
                    </div>
                  );
                })}
                {availableCoupons.length === 0 && (
                  <p className="text-sm text-gray-500">There are no codes available yet.</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm text-gray-700">Enter code manually</h4>
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

            {(appliedPromo || (summary?.promoDiscount ?? 0) > 0) && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-green-800">
                      {appliedPromo ? appliedPromo.code : "Code applied"}
                    </span>
                    <p className="text-sm text-green-600">
                      {`Discount: -${formatPrice(summary?.promoDiscount ?? 0)}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePromo}
                    className="text-green-600 hover:text-green-800 hover:bg-green-100"
                    disabled={isPromoLoading}
                  >
                    Remove code
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
