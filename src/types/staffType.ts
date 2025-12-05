import type {
  AdminOrderDetailResponse,
  AdminOrderListResult,
  AdminOrderStatus,
  AdminOrderStatusUpdateResponse,
  AdminOrderSummary,
} from "./adminType"

export type StaffOrderSummary = AdminOrderSummary
export type StaffOrderListResult = AdminOrderListResult
export type StaffOrderDetail = AdminOrderDetailResponse
export type StaffOrderStatus = AdminOrderStatus
export type StaffOrderStatusUpdateResponse = AdminOrderStatusUpdateResponse

export type StaffOrderDisplayStatus = "new" | "processing" | "delivered" | "returned"