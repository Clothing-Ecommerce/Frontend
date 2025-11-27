import { useState } from "react"
import {
  MoreVertical,
  Plus,
  Search,
  Filter,
  Trash2,
  Lock,
  Unlock,
  Edit,
  User,
  CheckCircle2,
  XCircle
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

// --- Types & Mock Data ---
// (Bạn có thể chuyển phần này sang file types/adminType.ts và data/adminMock.ts)

type UserRole = "Admin" | "Staff" | "Manager" | "Support";
type UserStatus = "active" | "locked";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
  avatar?: string;
}

const initialUsers: User[] = [
  { id: "1", name: "Nguyễn Hoài Phong", email: "phong.nguyen@example.com", role: "Admin", status: "active", lastActive: "Vừa xong" },
  { id: "2", name: "Trần Thị B", email: "staff.b@example.com", role: "Staff", status: "active", lastActive: "5 phút trước" },
  { id: "3", name: "Lê Văn C", email: "support.c@example.com", role: "Support", status: "locked", lastActive: "2 ngày trước" },
  { id: "4", name: "Phạm Minh D", email: "manager.d@example.com", role: "Manager", status: "active", lastActive: "1 giờ trước" },
];

const ROLES: UserRole[] = ["Admin", "Staff", "Manager", "Support"];

// --- Main Component ---

export default function UsersRolesPage() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // State cho các Dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form State (Dùng chung cho Create/Edit)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Staff" as UserRole,
  });

  // --- Logic Xử lý ---

  // Lọc danh sách
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Mở Dialog Thêm mới
  const openCreateDialog = () => {
    setEditingUser(null);
    setFormData({ name: "", email: "", role: "Staff" });
    setIsDialogOpen(true);
  };

  // Mở Dialog Chỉnh sửa
  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setIsDialogOpen(true);
  };

  // Xử lý Lưu (Thêm mới hoặc Cập nhật)
  const handleSave = () => {
    if (editingUser) {
      // Logic cập nhật
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, ...formData } : u
        )
      );
    } else {
      // Logic thêm mới
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        status: "active",
        lastActive: "Chưa đăng nhập",
      };
      setUsers((prev) => [newUser, ...prev]);
    }
    setIsDialogOpen(false);
    // TODO: Gọi API cập nhật backend tại đây
  };

  // Xử lý Khóa/Mở khóa
  const toggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "active" ? "locked" : "active" }
          : user
      )
    );
    // TODO: Gọi API cập nhật status
  };

  // Xử lý Xóa (Mở Alert)
  const confirmDelete = (id: string) => {
    setDeletingId(id);
    setIsAlertOpen(true);
  };

  // Thực hiện Xóa
  const handleDelete = () => {
    if (deletingId) {
      setUsers((prev) => prev.filter((u) => u.id !== deletingId));
      setIsAlertOpen(false);
      setDeletingId(null);
    }
    // TODO: Gọi API xóa user
  };

  // Helper render Badge Role
  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "Admin": return "bg-slate-900 text-white hover:bg-slate-700"; // Đen
      case "Manager": return "bg-purple-100 text-purple-700 hover:bg-purple-200"; // Tím
      case "Staff": return "bg-blue-100 text-blue-700 hover:bg-blue-200"; // Xanh dương
      default: return "bg-slate-100 text-slate-700 hover:bg-slate-200"; // Xám
    }
  };

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
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    Không tìm thấy nhân sự nào.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
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
                      {user.lastActive}
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
                          <DropdownMenuItem onClick={() => toggleStatus(user.id)}>
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
                disabled={!!editingUser} // Thường không cho sửa email
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Vai trò</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val as UserRole })}
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
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave}>{editingUser ? "Lưu thay đổi" : "Tạo tài khoản"}</Button>
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
            >
              Xóa vĩnh viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}