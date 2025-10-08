import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, ExternalLink, Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import api from "@/utils/axios";
import {
  clearLatestMomoAttempt,
  loadLatestMomoAttempt,
} from "@/utils/paymentStorage";
import { cn } from "@/lib/utils";

type PaymentDetail = {
  id: number;
  orderId: number;
  status: string;
  amount: string;
  resultCode?: number | null;
  resultMessage?: string | null;
  paidAt?: string | null;
};

type SyncState = "idle" | "syncing" | "success" | "error";

const isSucceededStatus = (status?: string) => {
  if (!status) return false;

  const normalizedStatus = status.toUpperCase();

  return ["SUCCEEDED", "SUCCESS", "AUTHORIZED", "PAID"].includes(normalizedStatus);
};

export default function PaymentSuccessPage() {
  const location = useLocation();
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentDetail, setPaymentDetail] = useState<PaymentDetail | null>(null);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (hasSyncedRef.current) return;

    const searchParams = new URLSearchParams(location.search);
    const paymentIdParam = searchParams.get("paymentId");
    const parsedPaymentId = paymentIdParam ? Number(paymentIdParam) : undefined;
    const latestAttempt = loadLatestMomoAttempt();
    const paymentId = Number.isFinite(parsedPaymentId)
      ? Number(parsedPaymentId)
      : latestAttempt?.paymentId;

    if (!paymentId) {
      clearLatestMomoAttempt();
      return;
    }

    hasSyncedRef.current = true;
    setSyncState("syncing");

    let cancelled = false;

    const syncPayment = async () => {
      try {
        await api.post(`/payment/${paymentId}/sync`);
      } catch (error: any) {
        console.error("Unable to sync payment status", error);
        if (!cancelled) {
          setErrorMessage(
            error?.response?.data?.message ||
              "Không thể đồng bộ trạng thái thanh toán. Vui lòng kiểm tra lại sau."
          );
          setSyncState("error");
        }
      }

      try {
        const { data } = await api.get<PaymentDetail>(`/payment/${paymentId}`);
        if (!cancelled) {
          setPaymentDetail(data);
          setSyncState(isSucceededStatus(data?.status) ? "success" : "error");
          setErrorMessage((prev) =>
            isSucceededStatus(data?.status)
              ? null
              : prev ||
                (data?.resultMessage
                  ? `Trạng thái thanh toán: ${data.resultMessage}`
                  : "Thanh toán chưa được xác nhận thành công.")
          );
        }
      } catch (error: any) {
        console.error("Unable to load payment detail", error);
        if (!cancelled) {
          setErrorMessage(
            error?.response?.data?.message ||
              "Không thể tải thông tin thanh toán. Vui lòng thử lại."
          );
          setSyncState((state) => (state === "success" ? state : "error"));
        }
      } finally {
        clearLatestMomoAttempt();
      }
    };

    void syncPayment();

    return () => {
      cancelled = true;
      hasSyncedRef.current = false;
    };
  }, [location.search]);

  const statusBadge = useMemo(() => {
    if (!paymentDetail) return null;

    const statusTextMap: Record<string, string> = {
      PENDING: "Đang xử lý",
      SUCCEEDED: "Thành công",
      SUCCESS: "Thành công",
      PAID: "Đã thanh toán",
      AUTHORIZED: "Đã ủy quyền",
      FAILED: "Thất bại",
      CANCELLED: "Đã hủy",
    };

    const normalizedStatus = paymentDetail.status
      ? paymentDetail.status.toUpperCase()
      : paymentDetail.status;
      
    const statusLabel = statusTextMap[normalizedStatus] || paymentDetail.status;

    const colorClass = isSucceededStatus(paymentDetail.status)
      ? "text-green-600"
      : paymentDetail.status === "FAILED"
      ? "text-red-600"
      : "text-amber-600";

    return (
      <div className={`text-sm font-medium ${colorClass}`}>
        Trạng thái: {statusLabel}
      </div>
    );
  }, [paymentDetail]);

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
                  Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
                </h1>
                <p className="text-gray-600">
                  Chúng tôi đang xác nhận trạng thái giao dịch và sẽ xử lý đơn hàng trong giây lát.
                </p>
              </div>

              {/* Sync status */}
              {(syncState !== "idle" || paymentDetail || errorMessage) && (
                <div className="mb-8 space-y-3">
                  {syncState === "syncing" && (
                    <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-indigo-800">
                      <div className="flex items-center gap-2 font-semibold text-indigo-900">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang xác nhận thanh toán
                      </div>
                      <p className="mt-2 text-sm text-indigo-700">
                        Vui lòng chờ trong giây lát trong khi chúng tôi đồng bộ kết quả từ MoMo.
                      </p>
                    </div>
                  )}

                  {syncState === "success" && paymentDetail && (
                    <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-green-900">
                      <div className="flex items-center gap-2 font-semibold text-green-900">
                        <ShieldCheck className="h-4 w-4" />
                        Thanh toán đã được xác nhận
                      </div>
                      <div className="mt-2 text-sm text-green-800">
                        Đơn hàng #{paymentDetail.orderId} đã được ghi nhận thanh toán.
                        <div className="mt-3 space-y-1">
                          <div>Số tiền: {paymentDetail.amount}</div>
                          {statusBadge}
                          {paymentDetail.paidAt && (
                            <div>
                              Thời gian: {new Date(paymentDetail.paidAt).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {syncState === "error" && errorMessage && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-900">
                      <div className="flex items-center gap-2 font-semibold text-red-900">
                        <TriangleAlert className="h-4 w-4" />
                        Không thể xác nhận thanh toán
                      </div>
                      <div className="mt-2 text-sm text-red-800">
                        {errorMessage}
                        {paymentDetail && (
                          <div className="mt-3 space-y-1 text-sm">
                            <div>Đơn hàng: #{paymentDetail.orderId}</div>
                            {statusBadge}
                            {typeof paymentDetail.resultCode === "number" && (
                              <div>Mã kết quả: {paymentDetail.resultCode}</div>
                            )}
                            {paymentDetail.resultMessage && (
                              <div>Thông báo: {paymentDetail.resultMessage}</div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button className="w-full bg-gray-900 text-white hover:bg-gray-800 py-6 text-base font-medium rounded-lg">
                  View Order Details
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-6 text-base font-medium rounded-lg",
                    "bg-transparent"
                  )}
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