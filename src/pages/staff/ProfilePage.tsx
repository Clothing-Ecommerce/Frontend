import { useOutletContext } from "react-router-dom"
import { Bell, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

import type { StaffOutletContext } from "./StaffLayout"

export default function StaffProfilePage() {
  const {
    profile,
    setProfile,
    notificationSettings,
    setNotificationSettings,
    profileContact,
    setProfileContact,
    passwordForm,
    setPasswordForm,
    showToast,
  } = useOutletContext<StaffOutletContext>()

  const submitNotificationSettings = () => {
    setProfile((prev) => ({
      ...prev,
      notifications: notificationSettings,
    }))
    showToast({
      title: "Lưu thông báo",
      description: "Tùy chọn thông báo đã được cập nhật.",
      type: "success",
    })
  }

  const submitContactUpdate = () => {
    setProfile((prev) => ({
      ...prev,
      email: profileContact.email,
      phone: profileContact.phone,
    }))
    showToast({
      title: "Cập nhật thông tin",
      description: "Thông tin liên hệ đã được lưu.",
      type: "success",
    })
  }

  const submitPasswordChange = () => {
    if (!passwordForm.next || passwordForm.next !== passwordForm.confirm) {
      showToast({
        title: "Không thể đổi mật khẩu",
        description: "Mật khẩu mới không khớp.",
        type: "error",
      })
      return
    }
    setPasswordForm({ current: "", next: "", confirm: "" })
    showToast({
      title: "Đổi mật khẩu",
      description: "Mật khẩu đã được cập nhật.",
      type: "success",
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
          <CardDescription>Quản lý dữ liệu hồ sơ và quyền hạn.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-semibold text-blue-600">
              {profile.name.slice(0, 1)}
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-900">{profile.name}</div>
              <div className="text-sm text-slate-500">{profile.role}</div>
              <div className="text-xs text-slate-400">{profile.id}</div>
            </div>
          </div>
          <div className="grid gap-3 text-sm text-slate-600">
            <div>Email: {profile.email}</div>
            <div>Số điện thoại: {profile.phone}</div>
            <div>Ca làm: {profile.preferredShift === "morning" ? "Sáng" : "Chiều"}</div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Quyền được gán</h4>
            <ul className="mt-2 space-y-1 text-sm text-slate-600">
              {profile.permissions.map((permission) => (
                <li key={permission} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {permission}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cập nhật liên hệ</CardTitle>
            <CardDescription>Thông tin dùng để điều phối công việc.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="text-sm font-medium text-slate-700" htmlFor="profile-email">
              Email
            </label>
            <Input
              id="profile-email"
              value={profileContact.email}
              onChange={(event) => setProfileContact((prev) => ({ ...prev, email: event.target.value }))}
            />
            <label className="text-sm font-medium text-slate-700" htmlFor="profile-phone">
              Số điện thoại
            </label>
            <Input
              id="profile-phone"
              value={profileContact.phone}
              onChange={(event) => setProfileContact((prev) => ({ ...prev, phone: event.target.value }))}
            />
            <Button onClick={submitContactUpdate}>Lưu thay đổi</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tùy chọn thông báo</CardTitle>
            <CardDescription>Chọn kênh nhận thông báo nghiệp vụ.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <Checkbox
                checked={notificationSettings.email}
                onCheckedChange={(checked) =>
                  setNotificationSettings((prev) => ({
                    ...prev,
                    email: Boolean(checked),
                  }))
                }
              />
              Email công việc
            </label>
            <label className="flex items-center gap-3 text-sm text-slate-700">
              <Checkbox
                checked={notificationSettings.app}
                onCheckedChange={(checked) =>
                  setNotificationSettings((prev) => ({
                    ...prev,
                    app: Boolean(checked),
                  }))
                }
              />
              Thông báo trong ứng dụng
            </label>
            <Button variant="outline" className="gap-2" onClick={submitNotificationSettings}>
              <Bell className="h-4 w-4" /> Lưu tùy chọn
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đổi mật khẩu</CardTitle>
            <CardDescription>Bảo vệ tài khoản và phân quyền truy cập.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="password"
              placeholder="Mật khẩu hiện tại"
              value={passwordForm.current}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, current: event.target.value }))}
            />
            <Input
              type="password"
              placeholder="Mật khẩu mới"
              value={passwordForm.next}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, next: event.target.value }))}
            />
            <Input
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={passwordForm.confirm}
              onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirm: event.target.value }))}
            />
            <Button onClick={submitPasswordChange}>Xác nhận</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}