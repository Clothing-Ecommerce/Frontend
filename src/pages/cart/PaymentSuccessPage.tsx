import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, ExternalLink } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Success Content */}
      <div className="bg-gray-50 min-h-[calc(100vh-200px)] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full">
          <Card className="shadow-lg border-0">
            <CardContent className="p-8 sm:p-12">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              </div>

              {/* Success Message */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  Payment Successful!
                </h1>
                <p className="text-gray-600">
                  Your order has been confirmed and will be processed soon.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 py-6 text-base font-medium rounded-lg">
                  View Order Details
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-6 text-base font-medium rounded-lg bg-transparent"
                  asChild
                >
                  <Link to="/products">
                    Continue Shopping
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Confirmation Notice */}
          <p className="text-center text-sm text-gray-600 mt-6 px-4">
            You will receive an email confirmation shortly at your registered
            email address.
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
