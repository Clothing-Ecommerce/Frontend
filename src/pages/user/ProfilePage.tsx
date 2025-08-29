import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  MapPin,
  Package,
  Settings,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Eye,
  Download,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  X,
  Camera,
  Upload,
} from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import api from "@/utils/axios";
import type { UserProfile } from "@/types/userType";
import { AddressFormDialog } from "@/components/address/addressFormDialog";
import { DeleteAddressDialog } from "@/components/address/deleteAddressDialog";
import type { Address } from "@/types/addressType";

const emptyUser: UserProfile = {
  userId: 0,
  username: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: null,
  avatar: "/placeholder.svg?height=100&width=100",
  createdAt: "",
};

const orders = [
  {
    id: "ORD-2024-001",
    date: "2024-01-20",
    status: "delivered",
    total: 398,
    items: [
      {
        name: "Classic Navy Blazer",
        price: 299,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        name: "Cotton Dress Shirt",
        price: 79,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    shipping: {
      method: "Standard Shipping",
      cost: 0,
      address: "123 Main Street, Apt 4B, New York, NY 10001",
    },
    tracking: "TRK123456789",
  },
  {
    id: "ORD-2024-002",
    date: "2024-01-15",
    status: "shipped",
    total: 244,
    items: [
      {
        name: "Oxford Leather Shoes",
        price: 159,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
      {
        name: "Silk Tie Collection",
        price: 45,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    shipping: {
      method: "Express Shipping",
      cost: 15,
      address: "456 Business Ave, Suite 200, New York, NY 10002",
    },
    tracking: "TRK987654321",
  },
  {
    id: "ORD-2024-003",
    date: "2024-01-10",
    status: "processing",
    total: 189,
    items: [
      {
        name: "Designer Sunglasses",
        price: 189,
        quantity: 1,
        image: "/placeholder.svg?height=80&width=80",
      },
    ],
    shipping: {
      method: "Standard Shipping",
      cost: 0,
      address: "123 Main Street, Apt 4B, New York, NY 10001",
    },
    tracking: null,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "processing":
      return "bg-yellow-100 text-yellow-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
      return <CheckCircle className="w-4 h-4" />;
    case "shipped":
      return <Truck className="w-4 h-4" />;
    case "processing":
      return <Clock className="w-4 h-4" />;
    case "cancelled":
      return <X className="w-4 h-4" />;
    default:
      return <Package className="w-4 h-4" />;
  }
};

const getLabelText = (label: string) => {
  switch (label) {
    case "HOME":
      return "Nhà"
    case "WORK":
      return "Chỗ Làm"
    case "OTHER":
      return "Khác"
    default:
      return label
  }
}

export default function ProfilePage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  // const [editingAddress, setEditingAddress] = useState<number | null>(null);
  const [formData, setFormData] = useState<UserProfile>(emptyUser); // dữ liệu hiển thị đã “lưu”
  const [draft, setDraft] = useState<UserProfile>(emptyUser); // dữ liệu đang chỉnh sửa
  // const [loading, setLoading] = useState(true);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Address management states
  const [addresses, setAddresses] = useState<Address[]>([])
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [addressDialogMode, setAddressDialogMode] = useState<"add" | "edit">("add")
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null)

  // const handleInputChange = (
  //   e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  // ) => {
  //   const { name, value } = e.target;
  //   setFormData((prev) => ({ ...prev, [name]: value }));
  // };

  // CHỈ update draft khi đang Edit
  const handleDraftInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (!isEditing) return;
    setDraft((prev) => ({ ...prev, [name]: value }));
  };

  // ====== Date helpers ======
  // Chuẩn hoá chuỗi ngày bất kỳ (ISO hoặc 'yyyy-mm-dd') -> 'yyyy-mm-dd' cho <input type="date">
  const toYMD = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "";
    // Nếu đã là 'yyyy-mm-dd' thì trả lại luôn
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  // Hiển thị ra UI: 'dd/mm/yyyy'
  const toDMY = (dateStr: string | null | undefined): string => {
    if (!dateStr) return "";
    const d = new Date(toYMD(dateStr)); // đảm bảo parse đúng
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const y = d.getFullYear();
    return `${day}/${m}/${y}`;
  };

  // Load hồ sơ từ API /user/profile khi mở trang
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get<UserProfile>("/user/profile");
        if (!mounted) return;
        // setFormData({
        //   ...data,
        //   // đảm bảo hợp <input type="date">
        //   // dateOfBirth: data.dateOfBirth ?? "",
        //   dateOfBirth: toYMD(data.dateOfBirth), // giữ 'yyyy-mm-dd' trong state
        //   avatar: data.avatar ?? "/placeholder.svg?height=100&width=100",
        // });

        const loaded = {
          ...data,
          dateOfBirth: toYMD(data.dateOfBirth), // chuẩn hoá cho <input type="date">
          avatar: data.avatar ?? "/placeholder.svg?height=100&width=100",
        };
        setFormData(loaded);
        setDraft(loaded); // đồng bộ draft ban đầu
      } catch (e) {
        console.error("Failed to fetch profile", e);
      } finally {
        // if (mounted) setLoading(false);

        /* loading state removed */
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // So sánh thay đổi để disable Save khi không đổi gì
  const hasChanges = useMemo(() => {
    const pick = (u: UserProfile) => ({
      username: u.username,
      email: u.email,
      phone: u.phone ?? null,
      gender: u.gender ?? null,
      dateOfBirth: toYMD(u.dateOfBirth) || null,
    });
    return JSON.stringify(pick(draft)) !== JSON.stringify(pick(formData));
  }, [draft, formData]);

  const handleSaveProfile = async () => {
    try {
      const payload = {
        username: draft.username,
        email: draft.email,
        // phone: draft.phone ?? null,
        phone: (draft.phone ?? "").trim() || null,
        gender: draft.gender || null,
        dateOfBirth: draft.dateOfBirth || null,
      };
      const { data } = await api.patch<UserProfile>("/user/profile", payload);
      const updated = {
        ...data,
        dateOfBirth: toYMD(data.dateOfBirth) || "",
        avatar: data.avatar ?? "/placeholder.svg?height=100&width=100",
      };
      setFormData(updated); // cập nhật dữ liệu đã “lưu”
      setDraft(updated); // đồng bộ lại draft
      setIsEditing(false);
    } catch (e) {
      console.error("Failed to update profile", e);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAvatar = () => {
    if (avatarFile && avatarPreview) {
      // In a real app, you would upload the file to your server/cloud storage
      setFormData((prev) => ({ ...prev, avatar: avatarPreview }));
      console.log("Saving avatar:", avatarFile);
    }
    setShowAvatarDialog(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleDeleteAvatar = () => {
    setFormData((prev) => ({
      ...prev,
      avatar: "/placeholder.svg?height=100&width=100",
    }));
    setShowAvatarDialog(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    console.log("Avatar deleted");
  };

  const handleCancelAvatarEdit = () => {
    setShowAvatarDialog(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const { logout } = useAuth();
  const { toast } = useToast();
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out", "You have been successfully logged out");
    // setIsDropdownOpen(false);
  };

 // nạp danh sách địa chỉ
 useEffect(() => {
   (async () => {
     try {
       const { data } = await api.get<Address[]>("/user/addresses");
       setAddresses(data);
     } catch (e) {
       console.error(e);
       toast.error("Lỗi", "Không tải được danh sách địa chỉ");
     }
   })();
 }, [toast]);


  // Address management functions
  const handleAddAddress = () => {
    setAddressDialogMode("add")
    setEditingAddress(null)
    setShowAddressDialog(true)
  }

  const handleEditAddress = (address: Address) => {
    setAddressDialogMode("edit")
    setEditingAddress(address)
    setShowAddressDialog(true)
  }

  const handleDeleteAddress = (address: Address) => {
    setDeletingAddress(address)
    setShowDeleteDialog(true)
  }

  const handleSaveAddress = async (addressData: Address) => {
   try {
     if (addressDialogMode === "add") {
      //  const { addressId, isDefault, ...payload } = addressData;
       const { addressId: _addressId, isDefault: _isDefault, ...payload } = addressData;
       void _addressId;
       void _isDefault;

       const { data } = await api.post<Address>("/user/addresses", {
         ...payload,
         setDefault: !!addressData.isDefault
       });
       setAddresses((prev) => {
         const next = data.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev.slice();
         return [...next, data];
       });
       toast.success("Thành công", "Đã thêm địa chỉ");
     } else if (editingAddress?.addressId) {
      //  const { addressId: _ignore, isDefault, ...payload } = addressData;
       const { addressId: _ignore, isDefault: _isDefault, ...payload } = addressData;
       void _ignore;
       void _isDefault;
       
       const { data } = await api.patch<Address>(`/user/addresses/${editingAddress.addressId}`, {
         ...payload,
         setDefault: !!addressData.isDefault
       });
       setAddresses((prev) => {
         const next = data.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev.slice();
         return next.map(a => a.addressId === data.addressId ? data : a);
       });
       toast.success("Thành công", "Đã cập nhật địa chỉ");
     }
   } catch (e) {
     console.error(e);
     toast.error("Lỗi", "Không lưu được địa chỉ");
   }
 }

  const handleConfirmDelete = async () => {
   if (!deletingAddress?.addressId) return;
   try {
     const { data } = await api.delete(`/user/addresses/${deletingAddress.addressId}`);
     setAddresses((prev) => {
       const filtered = prev.filter(a => a.addressId !== deletingAddress.addressId);
       if (data.wasDefault && data.newDefaultAddressId) {
         return filtered.map(a => ({ ...a, isDefault: a.addressId === data.newDefaultAddressId }));
       }
       return filtered;
     });
     toast.success("Thành công", "Đã xoá địa chỉ");
   } catch (e) {
     console.error(e);
     toast.error("Lỗi", "Không xoá được địa chỉ");
   } finally {
     setDeletingAddress(null);
   }
 }

  const handleSetDefault = async (addressId: number) => {
   try {
     await api.post(`/user/addresses/${addressId}/default`);
     setAddresses((prev) => prev.map(a => ({ ...a, isDefault: a.addressId === addressId })));
     toast.success("Thành công", "Đã đặt địa chỉ mặc định");
   } catch {
     toast.error("Lỗi", "Không đặt được địa chỉ mặc định");
   }
 }
 
 const formatAddress = (address: Address) => {
    const parts = []

    if (address.houseNumber) parts.push(address.houseNumber)
    if (address.street) parts.push(address.street)
    if (address.wardName) parts.push(address.wardName)
    if (address.districtName) parts.push(address.districtName)
    if (address.provinceName) parts.push(address.provinceName)

    let formatted = parts.join(", ")

    // Add building details if available
    const buildingDetails = []
    if (address.building) buildingDetails.push(address.building)
    if (address.block) buildingDetails.push(address.block)
    if (address.floor) buildingDetails.push(address.floor)
    if (address.room) buildingDetails.push(address.room)

    if (buildingDetails.length > 0) {
      formatted = `${buildingDetails.join(", ")}, ${formatted}`
    }

    return formatted
  }

  const sidebarItems = [
    { id: "profile", label: "Profile", icon: User },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "orders", label: "Orders", icon: Package },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 px-4 py-3">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900">My Account</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <Card>
              <CardHeader className="text-center pb-4">
                <div className="relative w-20 h-20 mx-auto mb-4 group">
                  <img
                    src={formData.avatar || "/placeholder.svg"}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="w-full h-full object-cover rounded-full border-4 border-white shadow-md"
                  />
                  <Dialog
                    open={showAvatarDialog}
                    onOpenChange={setShowAvatarDialog}
                  >
                    <DialogTrigger asChild>
                      <button className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Camera className="w-6 h-6 text-white" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Profile Picture</DialogTitle>
                        <DialogDescription>
                          Upload a new profile picture or remove your current
                          one.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Current/Preview Avatar */}
                        <div className="flex justify-center">
                          <div className="relative w-32 h-32">
                            <img
                              src={
                                avatarPreview ||
                                formData.avatar ||
                                "/placeholder.svg"
                              }
                              alt="Profile preview"
                              width={128}
                              height={128}
                              className="w-full h-full object-cover rounded-full border-4 border-gray-200"
                            />
                          </div>
                        </div>

                        {/* Upload Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-center w-full">
                            <label
                              htmlFor="avatar-upload"
                              className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                            >
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                <p className="mb-2 text-sm text-gray-500">
                                  <span className="font-semibold">
                                    Click to upload
                                  </span>{" "}
                                  or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">
                                  PNG, JPG or GIF (MAX. 5MB)
                                </p>
                              </div>
                              <input
                                id="avatar-upload"
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                              />
                            </label>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <Button
                              onClick={handleSaveAvatar}
                              disabled={!avatarFile}
                              className="flex-1 bg-black text-white hover:bg-gray-800"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Save Picture
                            </Button>
                            <Button
                              onClick={handleDeleteAvatar}
                              variant="outline"
                              className="flex-1 text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </Button>
                          </div>
                          <Button
                            onClick={handleCancelAvatarEdit}
                            variant="outline"
                            className="w-full bg-transparent"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <CardTitle className="text-lg">{formData.username}</CardTitle>
                <CardDescription>{formData.email}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <nav className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-md transition-colors ${
                          activeSection === item.id
                            ? "bg-amber-100 text-amber-700 font-medium"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </button>
                    );
                  })}
                </nav>
                <div className="mt-6 pt-6 border-t">
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Section */}
            {activeSection === "profile" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Manage your personal information and preferences
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!isEditing) {
                        // Bắt đầu Edit: copy formData -> draft
                        setDraft(formData);
                        setIsEditing(true);
                      } else {
                        // Cancel từ nút trên header: bỏ thay đổi
                        setDraft(formData);
                        setIsEditing(false);
                      }
                    }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        // value={formData.username ?? ""}
                        // onChange={handleInputChange}
                        value={
                          (isEditing ? draft.username : formData.username) ?? ""
                        }
                        onChange={handleDraftInputChange}
                        disabled={!isEditing}
                        placeholder="Enter your username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={(isEditing ? draft.email : formData.email) ?? ""}
                        onChange={handleDraftInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={(isEditing ? draft.phone : formData.phone) ?? ""}
                        onChange={handleDraftInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      {isEditing ? (
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="date"
                          value={toYMD(draft.dateOfBirth)}
                          onChange={handleDraftInputChange}
                          disabled={!isEditing}
                        />
                      ) : (
                        // Khi không edit: hiển thị dd/mm/yyyy
                        <Input
                          id="dateOfBirth"
                          name="dateOfBirth"
                          type="text"
                          value={toDMY(formData.dateOfBirth)}
                          disabled
                          readOnly
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        disabled={!isEditing}
                        // value={formData.gender ?? ""}
                        value={
                          (isEditing ? draft.gender : formData.gender) ?? ""
                        }
                        onValueChange={(v) =>
                          // setFormData((p) => ({
                          //   ...p,
                          //   gender: v as UserProfile["gender"],
                          // }))
                          setDraft((p) =>
                            !isEditing
                              ? p
                              : { ...p, gender: v as UserProfile["gender"] }
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                          <SelectItem value="Prefer-not-to-say">
                            Prefer not to say
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex gap-4 pt-4">
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-black text-white hover:bg-gray-800"
                        disabled={!hasChanges} // không cho save nếu không đổi gì
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        // onClick={() => setIsEditing(false)}
                        onClick={() => {
                          // Cancel dưới form: bỏ thay đổi, khôi phục draft từ formData
                          setDraft(formData);
                          setIsEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {/* Account Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {/* {userData.totalOrders} */}
                        --
                      </div>
                      <div className="text-sm text-gray-600">Total Orders</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {/* ${userData.totalSpent} */}
                        $--
                      </div>
                      <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">
                        {/* {new Date(userData.joinDate).getFullYear()} */}
                        {formData.createdAt
                          ? new Date(formData.createdAt).getFullYear()
                          : "--"}
                      </div>
                      <div className="text-sm text-gray-600">Member Since</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Addresses Section */}
            {activeSection === "addresses" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Địa chỉ giao hàng</CardTitle>
                    <CardDescription>Quản lý địa chỉ giao hàng của bạn</CardDescription>
                  </div>
                  <Button onClick={handleAddAddress} className="bg-black text-white hover:bg-gray-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm địa chỉ
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <div key={address.addressId} className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <h3 className="font-semibold text-gray-900">{getLabelText(address.label)}</h3>
                              {address.isDefault && <Badge className="bg-amber-100 text-amber-800">Mặc định</Badge>}
                            </div>

                            <div className="space-y-2 text-gray-600">
                              <div className="flex items-start gap-2">
                                <span className="font-medium text-gray-900 min-w-[100px]">Người nhận:</span>
                                <span>{address.recipient}</span>
                              </div>

                              {address.phone && (
                                <div className="flex items-start gap-2">
                                  <span className="font-medium text-gray-900 min-w-[100px]">Điện thoại:</span>
                                  <span>{address.phone}</span>
                                </div>
                              )}

                              {address.company && (
                                <div className="flex items-start gap-2">
                                  <span className="font-medium text-gray-900 min-w-[100px]">Công ty:</span>
                                  <span>{address.company}</span>
                                </div>
                              )}

                              <div className="flex items-start gap-2">
                                <span className="font-medium text-gray-900 min-w-[100px]">Địa chỉ:</span>
                                <span>{formatAddress(address)}</span>
                              </div>

                              {address.postalCode && (
                                <div className="flex items-start gap-2">
                                  <span className="font-medium text-gray-900 min-w-[100px]">Mã bưu điện:</span>
                                  <span>{address.postalCode}</span>
                                </div>
                              )}

                              {address.notes && (
                                <div className="flex items-start gap-2">
                                  <span className="font-medium text-gray-900 min-w-[100px]">Ghi chú:</span>
                                  <span className="italic">{address.notes}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditAddress(address)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAddress(address)}
                                className="text-red-600 hover:text-red-700 bg-transparent"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            {!address.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSetDefault(address.addressId!)}
                                className="text-amber-600 hover:text-amber-700 border-amber-200 hover:bg-amber-50 bg-transparent w-full"
                              >
                                Mặc Định
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {addresses.length === 0 && (
                      <div className="text-center py-12">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 text-lg mb-4">Chưa có địa chỉ giao hàng nào</p>
                        <Button onClick={handleAddAddress} className="bg-black text-white hover:bg-gray-800">
                          <Plus className="w-4 h-4 mr-2" />
                          Thêm địa chỉ đầu tiên
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Orders Section */}
            {activeSection === "orders" && (
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>View and track your orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-gray-200 rounded-lg p-6"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <h3 className="font-semibold text-gray-900">
                              Order {order.id}
                            </h3>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">
                                {order.status}
                              </span>
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">
                              {order.date}
                            </p>
                            <p className="font-semibold text-gray-900">
                              ${order.total}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          {order.items.map((item, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-4"
                            >
                              <img
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                width={60}
                                height={60}
                                className="w-15 h-15 object-cover rounded-md"
                              />
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">
                                  {item.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                              <p className="font-semibold text-gray-900">
                                ${item.price}
                              </p>
                            </div>
                          ))}
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <span>Shipping to:</span>
                            <span>{order.shipping.address}</span>
                          </div>
                          {order.tracking && (
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                              <span>Tracking:</span>
                              <span className="font-mono">
                                {order.tracking}
                              </span>
                            </div>
                          )}
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                            {order.status === "delivered" && (
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4 mr-2" />
                                Invoice
                              </Button>
                            )}
                            {order.tracking && (
                              <Button variant="outline" size="sm">
                                <Truck className="w-4 h-4 mr-2" />
                                Track Package
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Settings Section */}
            {activeSection === "settings" && (
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Email Notifications
                          </p>
                          <p className="text-sm text-gray-600">
                            Receive order updates and promotions
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-amber-600"
                          defaultChecked
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            SMS Notifications
                          </p>
                          <p className="text-sm text-gray-600">
                            Receive shipping updates via SMS
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-amber-600"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            Marketing Communications
                          </p>
                          <p className="text-sm text-gray-600">
                            Receive promotional offers and news
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-amber-600"
                          defaultChecked
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Security
                    </h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Change Password
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Two-Factor Authentication
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Data & Privacy
                    </h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download My Data
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-red-600 hover:text-red-700 bg-transparent"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* Address Form Dialog */}
      <AddressFormDialog
        open={showAddressDialog}
        onOpenChange={setShowAddressDialog}
        address={editingAddress}
        onSave={handleSaveAddress}
        mode={addressDialogMode}
      />

      {/* Delete Address Dialog */}
      <DeleteAddressDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        addressLabel={deletingAddress ? getLabelText(deletingAddress.label) : ""}
        onConfirm={handleConfirmDelete}
      />
      
    </div>
  );
}
