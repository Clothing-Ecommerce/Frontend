import { useEffect, useMemo, useState } from "react"
import { useOutletContext } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import type { StaffOutletContext } from "./StaffLayout"
// import { ticketPriorityBadge, ticketStatusLabel } from "./StaffLayout"

export default function StaffSupportPage() {
  const { tickets, setTickets, reviews, setReviews, formatDateTime, showToast } =
    useOutletContext<StaffOutletContext>()

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id ?? null)
  const [ticketResponse, setTicketResponse] = useState("")

  useEffect(() => {
    if (!selectedTicketId && tickets[0]) {
      setSelectedTicketId(tickets[0].id)
    }
  }, [tickets, selectedTicketId])

  const selectedTicket = useMemo(
    () => (selectedTicketId ? tickets.find((ticket) => ticket.id === selectedTicketId) ?? null : null),
    [tickets, selectedTicketId],
  )

  const updateTicketStatus = (ticketId: string, status: (typeof tickets)[number]["status"]) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status,
            }
          : ticket,
      ),
    )
    showToast({
      title: "Cập nhật vé hỗ trợ",
      description: `Vé ${ticketId} đã chuyển sang "${ticketStatusLabel[status]}".`,
      type: "success",
    })
  }

  const appendTicketResponse = () => {
    if (!selectedTicket || !ticketResponse.trim()) return
    showToast({
      title: "Đã gửi phản hồi",
      description: `Nội dung đã gửi tới khách ${selectedTicket.customerName}.`,
      type: "success",
    })
    setTicketResponse("")
  }

  const moderateReview = (reviewId: string, action: "approve" | "hide") => {
    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              status: action === "approve" ? "visible" : "hidden",
            }
          : review,
      ),
    )
    showToast({
      title: action === "approve" ? "Đã duyệt đánh giá" : "Đã ẩn đánh giá",
      description: "Cập nhật thành công.",
      type: "info",
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Hàng đợi vé hỗ trợ</CardTitle>
            <CardDescription>Lọc theo mức ưu tiên để phản hồi nhanh.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {tickets.map((ticket) => (
              <button
                key={ticket.id}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                  selectedTicketId === ticket.id
                    ? "border-blue-200 bg-blue-50"
                    : "border-transparent hover:bg-slate-50",
                )}
                onClick={() => setSelectedTicketId(ticket.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">{ticket.subject}</span>
                  <Badge className={cn("border", ticketPriorityBadge[ticket.priority])}>{ticket.priority}</Badge>
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  {ticket.customerName} • {ticketStatusLabel[ticket.status]}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đánh giá sản phẩm</CardTitle>
            <CardDescription>Duyệt hoặc ẩn phản hồi không phù hợp.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border bg-slate-50 p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium text-slate-900">{review.productName}</div>
                    <div className="text-xs text-slate-500">
                      {review.rating}⭐ • {review.customerName}
                    </div>
                  </div>
                  <Badge variant={review.status === "pending" ? "secondary" : "outline"}>{review.status}</Badge>
                </div>
                <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => moderateReview(review.id, "approve")}>
                    Duyệt
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => moderateReview(review.id, "hide")}>
                    Ẩn phản hồi
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {selectedTicket ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedTicket.subject}</CardTitle>
            <CardDescription>
              Khách hàng {selectedTicket.customerName}
              {selectedTicket.orderId ? ` • Đơn ${selectedTicket.orderId}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-600">
              {selectedTicket.previewResponse}
            </div>
            <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
              <div>Mức ưu tiên: {selectedTicket.priority}</div>
              <div>Cập nhật: {formatDateTime(selectedTicket.lastUpdated)}</div>
              <div>Phụ trách: {selectedTicket.assignedTo}</div>
              <div>Trạng thái: {ticketStatusLabel[selectedTicket.status]}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedTicket.tags.map((tagItem) => (
                <Badge key={tagItem} variant="outline">
                  #{tagItem}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => updateTicketStatus(selectedTicket.id, "in_progress")}>
                Đang xử lý
              </Button>
              <Button size="sm" variant="outline" onClick={() => updateTicketStatus(selectedTicket.id, "resolved")}>
                Đã giải quyết
              </Button>
            </div>
            <div className="space-y-2">
              <Textarea
                value={ticketResponse}
                onChange={(event) => setTicketResponse(event.target.value)}
                placeholder="Soạn phản hồi tới khách hàng..."
              />
              <Button className="self-end" onClick={appendTicketResponse}>
                Gửi phản hồi
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border bg-white p-8 text-center text-sm text-slate-500">
          Chọn một vé hỗ trợ để bắt đầu.
        </div>
      )}
    </div>
  )
}