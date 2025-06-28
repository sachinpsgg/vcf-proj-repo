import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@/pages/Login";

export type UserStatus = "Active" | "Inactive";

interface Brand {
  id: string;
  name: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  assignedBrands: Brand[];
  createdAt: Date;
}

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
    brandId: number;
  }) => void;
  initialData?: User | null;
  isEditing: boolean;
  defaultRole?: UserRole;
}

interface BrandApiData {
  brand_id: number;
  brand_name: string;
  logo_url: string;
  admin_id: number;
  created_at: string;
  updated_at: string;
}

// Fetch brands function
const fetchBrands = async (): Promise<BrandApiData[]> => {
  const storedAuth = localStorage.getItem("user");
  if (!storedAuth) throw new Error("User not authenticated");

  const { token } = JSON.parse(storedAuth);

  const response = await fetch(
    "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/get-all-brands",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch brands");
  }

  const data = await response.json();
  return data.brands || [];
};

const UserFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
  defaultRole = "admin",
}: UserFormModalProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: defaultRole,
    brandId: "",
  });

  // Fetch brands data
  const {
    data: brandsData,
    isLoading: brandsLoading,
    error: brandsError,
  } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
    staleTime: 30000,
    enabled: isOpen, // Only fetch when modal is open
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        password: initialData.password,
        role: initialData.role,
        brandId: initialData.assignedBrands[0]?.id || "",
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: defaultRole,
        brandId: "",
      });
    }
  }, [initialData, isOpen, defaultRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.brandId) {
      alert("Please select a brand");
      return;
    }

    onSubmit({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      brandId: parseInt(formData.brandId),
    });
    onClose();
  };

  const roleOptions: UserRole[] = ["admin", "nurse"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? `Edit ${formData.role === "admin" ? "Administrator" : "Nurse"}`
              : `Add New ${defaultRole === "admin" ? "Administrator" : "Nurse"}`}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update user information and brand assignment"
              : `Create a new ${defaultRole === "admin" ? "administrator" : "nurse"} account`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    firstName: e.target.value,
                  }))
                }
                placeholder="Enter first name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    lastName: e.target.value,
                  }))
                }
                placeholder="Enter last name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="user@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              placeholder="Enter password"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: UserRole) =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role === "admin" ? "Administrator" : "Nurse"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Select
              value={formData.brandId}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, brandId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    brandsLoading
                      ? "Loading brands..."
                      : brandsError
                        ? "Error loading brands"
                        : "Select a brand"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {brandsLoading ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : brandsError ? (
                  <div className="p-2 text-sm text-red-500">
                    Error loading brands
                  </div>
                ) : (
                  brandsData?.map((brand) => (
                    <SelectItem
                      key={brand.brand_id}
                      value={brand.brand_id.toString()}
                    >
                      {brand.brand_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={brandsLoading}>
              {isEditing
                ? `Update ${formData.role === "admin" ? "Administrator" : "Nurse"}`
                : `Create ${defaultRole === "admin" ? "Administrator" : "Nurse"}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormModal;
