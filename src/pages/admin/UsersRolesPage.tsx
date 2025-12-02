import { useCallback, useEffect, useMemo, useState } from "react"
import {
  MoreVertical,
  Plus,
  Search,
  Filter,
  Trash2,
  Lock,
  Unlock,
  Edit,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"

// Import các UI components
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import api from "@/utils/axios"
import { useToast } from "@/hooks/useToast"
import type { AdminUser, AdminUserResponse, AdminUserRole, AdminUserStatus } from "@/types/adminType"

const ROLE_TO_PAYLOAD: Record<AdminUserRole, string> = {
  Admin: "admin",
  Staff: "staff",
  Customer: "customer",
}

const PAYLOAD_TO_ROLE: Record<string, AdminUserRole> = {
  admin: "Admin",
  staff: "Staff",
  customer: "Customer",
}

const ROLES: AdminUserRole[] = ["Admin", "Staff", "Customer"]

const mapApiUser = (user: AdminUserResponse): AdminUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: PAYLOAD_TO_ROLE[String(user.role).toLowerCase()] ?? "Staff",
  status: user.status === "active" ? "active" : "suspended",
  lastActive: typeof user.lastActive === "string" ? user.lastActive : null,
})

const formatLastActive = (value: string | null) => {
  if (!value) return "Chưa hoạt động"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const diffMs = Date.now() - date.getTime()
  if (diffMs < 0) return date.toLocaleString("vi-VN")

  const minutes = Math.floor(diffMs / 1000 / 60)
  if (minutes < 1) return "Vừa xong"
  if (minutes < 60) return `${minutes} phút trước`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} giờ trước`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ngày trước`

  return date.toLocaleString("vi-VN")
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "response" in error) {
    const err = error as { response?: { data?: { message?: string } } }
    return err.response?.data?.message ?? fallback
  }
  return fallback
}

// --- Main Component ---

export default function UsersRolesPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Staff" as AdminUserRole,
  })

  const formattedUsers = useMemo(() => users, [users])

  const loadUsers = useCallback(
    async (signal?: AbortSignal) => {
      setIsLoading(true)
      try {
        const response = await api.get<AdminUserResponse[]>("/admin/users", {
          params: {
            search: searchQuery.trim() || undefined,
            role: roleFilter !== "all" ? ROLE_TO_PAYLOAD[roleFilter as AdminUserRole] : undefined,
          },
          signal,
        })

        setUsers(response.data.map(mapApiUser))
      } catch (error: unknown) {
        if (signal?.aborted) return
        console.error(error)
        toast.error(getErrorMessage(error, "Không thể tải danh sách nhân sự"))
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false)
        }
      }
    },
    [roleFilter, searchQuery, toast],
  )

  useEffect(() => {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      loadUsers(controller.signal)
    }, 350)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [loadUsers])

  // Mở Dialog Thêm mới
  const openCreateDialog = () => {
    setEditingUser(null)
    setFormData({ name: "", email: "", role: "Staff" })
    setIsDialogOpen(true)
  }

  // Mở Dialog Chỉnh sửa
  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user)
    setFormData({ name: user.name, email: user.email, role: user.role })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    const name = formData.name.trim()
    const email = formData.email.trim()
    if (!name || !email) {
      toast.error("Thiếu thông tin bắt buộc")
      return
    }

    setIsSaving(true)
    const payload = {
      name,
      email,
      role: ROLE_TO_PAYLOAD[formData.role],
    }

    try {
      if (editingUser) {
        await api.patch(`/admin/users/${editingUser.id}`, payload)
        toast.success("Cập nhật nhân sự thành công")
      } else {
        await api.post("/admin/users", payload)
        toast.success("Tạo nhân sự thành công")
      }
      setIsDialogOpen(false)
      setEditingUser(null)
      await loadUsers()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Không thể lưu thông tin nhân sự"))
    } finally {
      setIsSaving(false)
    }
  }

  const toggleStatus = async (id: number, currentStatus: AdminUserStatus) => {
    const nextStatus: AdminUserStatus = currentStatus === "active" ? "suspended" : "active"
    setStatusUpdatingId(id)
    try {
      await api.patch(`/admin/users/${id}/status`, { status: nextStatus })
      toast.success("Cập nhật trạng thái thành công")
      await loadUsers()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Không thể cập nhật trạng thái"))
    } finally {
      setStatusUpdatingId(null)
    }
  }

  // Xử lý Xóa (Mở Alert)
  const confirmDelete = (id: number) => {
    setDeletingId(id)
    setIsAlertOpen(true)
  }

  // Thực hiện Xóa
  const handleDelete = async () => {
    if (!deletingId) return
    setIsSaving(true)
    try {
      await api.delete(`/admin/users/${deletingId}`)
      toast.success("Đã xoá tài khoản")
      setIsAlertOpen(false)
      setDeletingId(null)
      await loadUsers()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Không thể xoá tài khoản"))
    } finally {
      setIsSaving(false)
    }
  }

  // Helper render Badge Role
  const getRoleBadgeColor = (role: AdminUserRole) => {
    switch (role) {
      case "Admin": return "bg-slate-900 text-white hover:bg-slate-700" // Đen
      case "Staff": return "bg-blue-100 text-blue-700 hover:bg-blue-200" // Xanh dương
      default: return "bg-slate-100 text-slate-700 hover:bg-slate-200" // Xám
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats Overview (Optional) */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Người dùng & Phân quyền</h2>
          <p className="text-sm text-muted-foreground">
            Quản lý tài khoản nhân viên, phân quyền truy cập và trạng thái hoạt động.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Thêm nhân sự
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {/* Toolbar: Search & Filter */}
          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center bg-slate-50/50 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
                className="pl-9 bg-white max-w-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Lọc theo vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data Table */}
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-[350px] pl-6">Nhân sự</TableHead>
                <TableHead>Vai trò</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="hidden md:table-cell">Hoạt động cuối</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Đang tải dữ liệu
                    </div>
                  </TableCell>
                </TableRow>
              ) : formattedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    Không tìm thấy nhân sự nào.
                  </TableCell>
                </TableRow>
              ) : (
                formattedUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell className="pl-6 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border">
                          <AvatarImage src={`https://ui-avatars.com/api/?name=${user.name}&background=random`} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-slate-900 leading-tight">
                            {user.name}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getRoleBadgeColor(user.role)} font-normal`}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        user.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}>
                        {user.status === "active" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {user.status === "active" ? "Hoạt động" : "Đã khoá"}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-slate-500">
                      {formatLastActive(user.lastActive)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={statusUpdatingId === user.id}
                            onClick={() => toggleStatus(user.id, user.status)}
                          >
                            {user.status === "active" ? (
                              <>
                                <Lock className="mr-2 h-4 w-4" /> Khóa tài khoản
                              </>
                            ) : (
                              <>
                                <Unlock className="mr-2 h-4 w-4" /> Mở khóa
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                            onClick={() => confirmDelete(user.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Xóa tài khoản
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* --- Dialog: Create / Edit User --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Chỉnh sửa thông tin" : "Thêm nhân sự mới"}</DialogTitle>
            <DialogDescription>
              {editingUser 
                ? "Cập nhật thông tin và vai trò của nhân sự." 
                : "Tạo tài khoản mới cho nhân viên vào hệ thống."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Họ và tên</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ví dụ: Nguyễn Văn A"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email đăng nhập</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val as AdminUserRole })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu
                </>
              ) : editingUser ? (
                "Lưu thay đổi"
              ) : (
                "Tạo tài khoản"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Alert Dialog: Confirm Delete --- */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Tài khoản này sẽ bị xóa vĩnh viễn khỏi hệ thống 
              và mất toàn bộ quyền truy cập.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700 focus:ring-rose-600"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang xoá
                </>
              ) : (
                "Xóa vĩnh viễn"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}