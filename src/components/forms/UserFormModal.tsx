import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Loader2, X } from "lucide-react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Close modal on Escape key and manage body overflow
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isSubmitting, onClose]);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        password: initialData.password,
        role: initialData.role,
        brandId: initialData.assignedBrands[0]?.id || "",
      });
    } else if (isOpen) {
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
    setIsSubmitting(true);

    try {
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
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const roleOptions: UserRole[] = ["admin", "nurse"];

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Modal Content */}
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">
              {isEditing
                ? `Edit ${formData.role === "admin" ? "Administrator" : "Nurse"}`
                : `Add New ${defaultRole === "admin" ? "Administrator" : "Nurse"}`}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing
                ? "Update user information and brand assignment"
                : `Create a new ${defaultRole === "admin" ? "administrator" : "nurse"} account`}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: UserRole) =>
                setFormData((prev) => ({ ...prev, role: value }))
              }
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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

          {/* Footer */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={brandsLoading || isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? `Update ${formData.role === "admin" ? "Administrator" : "Nurse"}`
                  : `Create ${defaultRole === "admin" ? "Administrator" : "Nurse"}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
