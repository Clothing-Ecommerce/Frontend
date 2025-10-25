import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { systemUsers } from "@/data/adminMock"

const availableRoles = ["Admin", "Support", "Warehouse", "Finance", "Marketing", "Staff"]

export default function UsersRolesPage() {
  const [users, setUsers] = useState(systemUsers)
  const [search, setSearch] = useState("")
  const [temporaryLock, setTemporaryLock] = useState(false)

  const filteredUsers = users.filter(
    (user) =>
      search.trim().length === 0 ||
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()),
  )

  const addUser = () => {
    const newUser = {
      id: `user-${Math.floor(Math.random() * 1000)}`,
      name: "Nhân sự mới",
      email: "new.staff@example.com",
      role: "Staff",
      status: "active",
      lastActive: "Chưa đăng nhập",
    }
    setUsers((prev) => [newUser, ...prev])
  }

  const updateRole = (id: string, role: string) => {
    setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, role } : user)))
  }

  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "active" ? "locked" : "active" }
          : user,
      ),
    )
  }

  const applyTemporaryLock = () => {
    if (!temporaryLock) return
    setUsers((prev) => prev.map((user) => ({ ...user, status: "locked" })))
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Người dùng & vai trò</CardTitle>
          <CardDescription>
            Tạo/sửa tài khoản, gán quyền chi tiết (RBAC) và khoá/mở quyền tạm thời
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input
              placeholder="Tìm tên hoặc email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button onClick={addUser}>Tạo tài khoản</Button>
            {/* <label className="flex items-center gap-2 text-xs text-slate-500">
              <Checkbox checked={temporaryLock} onCheckedChange={(value) => setTemporaryLock(Boolean(value))} />
              Khoá tạm thời toàn bộ quyền
            </label>
            <Button size="sm" variant="outline" onClick={applyTemporaryLock}>
              Áp dụng
            </Button> */}
          </div>
          <div className="overflow-hidden rounded-xl border">
            <table className="min-w-full divide-y">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Nhân sự</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Vai trò</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Hoạt động gần nhất</th>
                  <th className="px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y bg-white text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{user.name}</td>
                    <td className="px-4 py-3 text-slate-600">{user.email}</td>
                    <td className="px-4 py-3">
                      <Select value={user.role} onValueChange={(value) => updateRole(user.id, value)}>
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={user.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>
                        {user.status === "active" ? "Đang hoạt động" : "Đã khoá"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{user.lastActive}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline">
                          Phân quyền chi tiết
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleStatus(user.id)}>
                          {user.status === "active" ? "Khoá" : "Mở"}
                        </Button>
                        <Button size="sm" variant="outline">
                          Xem audit log
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Chính sách bảo mật</CardTitle>
          <CardDescription>
            2FA, chính sách mật khẩu, IP allowlist và phân quyền theo nhóm
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 text-sm">
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="font-semibold text-slate-800">Hai lớp xác thực</p>
            <p className="text-xs text-slate-500">Yêu cầu 2FA với admin và kho, cấp OTP qua ứng dụng Authenticator.</p>
            <Button size="sm" className="mt-3" variant="outline">
              Bật bắt buộc 2FA
            </Button>
          </div>
          <div className="rounded-xl border bg-slate-50 p-4">
            <p className="font-semibold text-slate-800">Chính sách mật khẩu</p>
            <p className="text-xs text-slate-500">Độ dài tối thiểu 12 ký tự, đổi mật khẩu 90 ngày/lần.</p>
            <Button size="sm" className="mt-3" variant="outline">
              Cập nhật chính sách
            </Button>
          </div>
        </CardContent>
      </Card> */}
    </div>
  )
}