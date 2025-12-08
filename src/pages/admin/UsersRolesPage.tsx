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

// Import UI components
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
  if (!value) return "Not active yet"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const diffMs = Date.now() - date.getTime()
  if (diffMs < 0) return date.toLocaleString("vi-VN")

  const minutes = Math.floor(diffMs / 1000 / 60)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} minutes ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hours ago`

  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} days ago`

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
        toast.error(getErrorMessage(error, "Unable to load staff list"))
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

  // Open Create Dialog
  const openCreateDialog = () => {
    setEditingUser(null)
    setFormData({ name: "", email: "", role: "Staff" })
    setIsDialogOpen(true)
  }

  // Open Edit Dialog
  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user)
    setFormData({ name: user.name, email: user.email, role: user.role })
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    const name = formData.name.trim()
    const email = formData.email.trim()
    if (!name || !email) {
      toast.error("Missing required information")
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
        toast.success("Staff updated successfully")
      } else {
        await api.post("/admin/users", payload)
        toast.success("Staff created successfully")
      }
      setIsDialogOpen(false)
      setEditingUser(null)
      await loadUsers()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to save staff information"))
    } finally {
      setIsSaving(false)
    }
  }

  const toggleStatus = async (id: number, currentStatus: AdminUserStatus) => {
    const nextStatus: AdminUserStatus = currentStatus === "active" ? "suspended" : "active"
    setStatusUpdatingId(id)
    try {
      await api.patch(`/admin/users/${id}/status`, { status: nextStatus })
      toast.success("Status updated successfully")
      await loadUsers()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to update status"))
    } finally {
      setStatusUpdatingId(null)
    }
  }

  // Handle Delete (Open Alert)
  const confirmDelete = (id: number) => {
    setDeletingId(id)
    setIsAlertOpen(true)
  }

  // Perform Delete
  const handleDelete = async () => {
    if (!deletingId) return
    setIsSaving(true)
    try {
      await api.delete(`/admin/users/${deletingId}`)
      toast.success("Account deleted")
      setIsAlertOpen(false)
      setDeletingId(null)
      await loadUsers()
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Unable to delete account"))
    } finally {
      setIsSaving(false)
    }
  }

  // Helper render Role Badge
  const getRoleBadgeColor = (role: AdminUserRole) => {
    switch (role) {
      case "Admin": return "bg-slate-900 text-white hover:bg-slate-700" // Black
      case "Staff": return "bg-blue-100 text-blue-700 hover:bg-blue-200" // Blue
      default: return "bg-slate-100 text-slate-700 hover:bg-slate-200" // Gray
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Stats Overview (Optional) */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Users & Permissions</h2>
          <p className="text-sm text-muted-foreground">
            Manage staff accounts, access permissions, and activity status.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="shadow-sm">
          <Plus className="mr-2 h-4 w-4" /> Add staff
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          {/* Toolbar: Search & Filter */}
          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center bg-slate-50/50 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9 bg-white max-w-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
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
                <TableHead className="w-[350px] pl-6">Staff</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Last active</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading data
                    </div>
                  </TableCell>
                </TableRow>
              ) : formattedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    No staff found.
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
                        {user.status === "active" ? "Active" : "Locked"}
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
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={statusUpdatingId === user.id}
                            onClick={() => toggleStatus(user.id, user.status)}
                          >
                            {user.status === "active" ? (
                              <>
                                <Lock className="mr-2 h-4 w-4" /> Lock account
                              </>
                            ) : (
                              <>
                                <Unlock className="mr-2 h-4 w-4" /> Unlock
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                            onClick={() => confirmDelete(user.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete account
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
            <DialogTitle>{editingUser ? "Edit information" : "Add new staff"}</DialogTitle>
            <DialogDescription>
              {editingUser 
                ? "Update staff information and role." 
                : "Create a new account for staff in the system."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Example: Nguyen Van A"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Login email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@example.com"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(val) => setFormData({ ...formData, role: val as AdminUserRole })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
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
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                </>
              ) : editingUser ? (
                "Save changes"
              ) : (
                "Create account"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Alert Dialog: Confirm Delete --- */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This account will be permanently deleted from the system 
              and lose all access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700 focus:ring-rose-600"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting
                </>
              ) : (
                "Delete permanently"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}