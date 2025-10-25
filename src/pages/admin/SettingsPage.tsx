import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function SettingsPage() {
  const [paymentMethods, setPaymentMethods] = useState({
    cod: true,
    momo: true,
    vnpay: false,
  })
  const [taxPercent, setTaxPercent] = useState(8)
  const [currency, setCurrency] = useState("VND")
  const [emailTemplate, setEmailTemplate] = useState("Xin chào {{name}}, đơn hàng {{order_id}} của bạn đang được xử lý.")
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [ipAllowlist, setIpAllowlist] = useState("192.168.1.0/24\n203.205.33.10")

  const togglePayment = (method: keyof typeof paymentMethods) => {
    setPaymentMethods((prev) => ({ ...prev, [method]: !prev[method] }))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình hệ thống</CardTitle>
          <CardDescription>
            Quản lý thanh toán, vận chuyển, thuế, tiền tệ, email template và tích hợp hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="space-y-3 rounded-xl border bg-white p-4">
            <p className="text-xs uppercase tracking-widest text-slate-500">Thanh toán</p>
            {Object.entries(paymentMethods).map(([method, value]) => (
              <label key={method} className="flex items-center gap-2 text-xs text-slate-500">
                <Checkbox checked={value} onCheckedChange={() => togglePayment(method as keyof typeof paymentMethods)} />
                Bật {method.toUpperCase()}
              </label>
            ))}
            <Button size="sm" variant="outline">
              Cấu hình nhà cung cấp
            </Button>
          </div>
          <div className="space-y-3 rounded-xl border bg-white p-4">
            <p className="text-xs uppercase tracking-widest text-slate-500">Thuế & tiền tệ</p>
            <label className="text-xs text-slate-500">
              Thuế VAT (%)
              <Input
                type="number"
                value={taxPercent}
                onChange={(event) => setTaxPercent(Number(event.target.value))}
                className="mt-1"
              />
            </label>
            <label className="text-xs text-slate-500">
              Tiền tệ
              <Input value={currency} onChange={(event) => setCurrency(event.target.value)} className="mt-1" />
            </label>
            <Button size="sm" variant="outline">
              Cập nhật cấu hình thuế
            </Button>
          </div>
          <div className="space-y-3 rounded-xl border bg-white p-4 md:col-span-2">
            <p className="text-xs uppercase tracking-widest text-slate-500">Email templates</p>
            <Textarea
              className="h-32"
              value={emailTemplate}
              onChange={(event) => setEmailTemplate(event.target.value)}
            />
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" variant="outline">
                Xem preview đơn mới
              </Button>
              <Button size="sm" variant="outline">
                Tải template "Đã giao"
              </Button>
              <Button size="sm">
                Lưu template
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Tích hợp & bảo mật</CardTitle>
          <CardDescription>
            SEO, domain, CDN, chatbot, sao lưu và chính sách bảo mật nâng cao
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="space-y-3 rounded-xl border bg-white p-4">
            <p className="text-xs uppercase tracking-widest text-slate-500">Bảo mật</p>
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <Checkbox
                checked={twoFactorEnabled}
                onCheckedChange={(value) => setTwoFactorEnabled(Boolean(value))}
              />
              Bật bắt buộc 2FA
            </label>
            <label className="text-xs text-slate-500">
              IP allowlist
              <Textarea
                className="mt-1 h-24"
                value={ipAllowlist}
                onChange={(event) => setIpAllowlist(event.target.value)}
              />
            </label>
            <Button size="sm" variant="outline">
              Lưu chính sách bảo mật
            </Button>
          </div>
          <div className="space-y-3 rounded-xl border bg-white p-4">
            <p className="text-xs uppercase tracking-widest text-slate-500">Sao lưu & khôi phục</p>
            <Button size="sm" variant="outline">
              Tạo bản sao lưu ngay
            </Button>
            <Button size="sm" variant="outline">
              Khôi phục bản gần nhất
            </Button>
            <Button size="sm" variant="outline">
              Lịch sao lưu tự động
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}