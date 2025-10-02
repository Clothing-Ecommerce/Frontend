import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, Edit, Package, ChevronRight, Tag, Wallet } from "lucide-react";
import { SelectAddressDialog } from "@/components/checkout/selectAddressDialog";
import { SelectPaymentDialog } from "@/components/checkout/selectPaymentDialog";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Mock data
const addresses = [
  {
    id: 1,
    name: "Nguyen Hoai Phong",
    phone: "0123456789",
    address: "123 Nguyen Hue Street, District 1, Ho Chi Minh City",
    isDefault: true,
    type: "Home" as const,
  },
  {
    id: 2,
    name: "Nguyen Hoai Phong",
    phone: "0123456789",
    address: "456 Le Loi Street, District 3, Ho Chi Minh City",
    isDefault: false,
    type: "Work" as const,
  },
  {
    id: 3,
    name: "Nguyen Hoai Phong",
    phone: "0987654321",
    address: "789 Tran Hung Dao Street, District 5, Ho Chi Minh City",
    isDefault: false,
    type: "Home" as const,
  },
];

const paymentMethods = [
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

const checkoutData = {
  cartItems: [
    {
      id: 1,
      name: "Essential Cotton Tee",
      price: 299000,
      quantity: 2,
      size: "M",
      color: "White",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 2,
      name: "Minimalist Denim Jacket",
      price: 899000,
      quantity: 1,
      size: "L",
      color: "Indigo",
      image: "/placeholder.svg?height=100&width=100",
    },
  ],
  subtotal: 1497000,
  discount: 0,
  shipping: 0,
};

export default function CheckoutPage() {
  const [selectedAddressId, setSelectedAddressId] = useState(1);
  const [selectedPaymentId, setSelectedPaymentId] = useState("cod");
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const selectedAddress = addresses.find(
    (addr) => addr.id === selectedAddressId
  );
  const selectedPayment = paymentMethods.find(
    (method) => method.id === selectedPaymentId
  );

  const total =
    checkoutData.subtotal - checkoutData.discount + checkoutData.shipping;

  const handlePlaceOrder = () => {
    window.location.href = "/cart/checkout/success";
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
                  Shipping Address
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-gray-600 hover:text-gray-900"
                  onClick={() => setShowAddressDialog(true)}
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>

              {selectedAddress && (
                <div className="p-4 border-2 border-gray-900 rounded-lg bg-white">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-gray-900">
                      {selectedAddress.name}
                    </span>
                    {selectedAddress.isDefault && (
                      <span className="px-2 py-0.5 bg-gray-900 text-white text-xs rounded font-medium">
                        Default
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {selectedAddress.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-1">
                    {selectedAddress.phone}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedAddress.address}
                  </p>
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
                {checkoutData.cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-md bg-gray-200"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {item.size} • {item.color}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {item.price.toLocaleString("vi-VN")} ₫
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* Promotion */}
              <button
                className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors bg-white"
                onClick={() => {}}
              >
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-gray-700">Chọn khuyến mãi</span>
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
                    Chi tiết đơn hàng
                  </h3>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tổng tiền</span>
                      <span className="text-gray-900">
                        {checkoutData.subtotal.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Giảm giá</span>
                      <span className="text-gray-900">
                        {checkoutData.discount.toLocaleString("vi-VN")} ₫
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Phí vận chuyển</span>
                      <span className="text-green-600 font-medium">
                        miễn phí
                      </span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between items-center mb-6">
                    <span className="text-base font-semibold text-gray-900">
                      Thành tiền
                    </span>
                    <div className="text-right">
                      <div className="text-xl font-bold text-gray-900">
                        {total.toLocaleString("vi-VN")} ₫
                      </div>
                      <div className="text-xs text-gray-500">
                        Mua nhiều giảm nhiều
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    className="w-full bg-gray-900 text-white hover:bg-gray-800 py-6 text-base font-medium rounded-lg"
                  >
                    Thanh Toán
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
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
        onSelectPayment={setSelectedPaymentId}
      />
    </div>
  );
}
