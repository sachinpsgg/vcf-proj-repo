import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { X, UserPlus } from "lucide-react";
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
  onSubmit: (data: Omit<User, "id" | "createdAt">) => void;
  initialData?: User | null;
  isEditing: boolean;
  defaultRole?: UserRole;
}

// Mock available brands
const availableBrands: Brand[] = [
  { id: "1", name: "HealthTech Solutions" },
  { id: "2", name: "MedCare Plus" },
  { id: "3", name: "Wellness Group" },
  { id: "4", name: "LifeCare Medical" },
];

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
    status: "Active" as UserStatus,
    assignedBrands: [] as Brand[],
  });

  const [selectedBrand, setSelectedBrand] = useState<string>("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        email: initialData.email,
        password: initialData.password,
        role: initialData.role,
        status: initialData.status,
        assignedBrands: initialData.assignedBrands,
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        role: defaultRole,
        status: "Active",
        assignedBrands: [],
      });
    }
  }, [initialData, isOpen, defaultRole]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleAddBrand = () => {
    if (selectedBrand) {
      const brand = availableBrands.find((b) => b.id === selectedBrand);
      if (brand && !formData.assignedBrands.find((b) => b.id === brand.id)) {
        setFormData((prev) => ({
          ...prev,
          assignedBrands: [...prev.assignedBrands, brand],
        }));
        setSelectedBrand("");
      }
    }
  };

  const handleRemoveBrand = (brandId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedBrands: prev.assignedBrands.filter((b) => b.id !== brandId),
    }));
  };

  const getAvailableBrands = () =>
    availableBrands.filter(
      (brand) => !formData.assignedBrands.find((b) => b.id === brand.id),
    );

  const roleOptions: UserRole[] = ["admin", "nurse"];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? `Edit ${formData.role === "admin" ? "Administrator" : "Nurse"}`
              : `Add New ${defaultRole === "admin" ? "Administrator" : "Nurse"}`}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update user information and brand assignments"
              : `Create a new ${defaultRole === "admin" ? "administrator" : "nurse"} account with brand access`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Label htmlFor="status">User Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: UserStatus) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Assigned Brands</Label>
              <div className="mt-2 space-y-3">
                <div className="flex gap-2">
                  <Select
                    value={selectedBrand}
                    onValueChange={setSelectedBrand}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select a brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableBrands().map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={handleAddBrand}
                    disabled={!selectedBrand}
                    size="icon"
                    variant="outline"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {formData.assignedBrands.map((brand) => (
                    <Badge key={brand.id} variant="secondary" className="gap-1">
                      {brand.name}
                      <button
                        type="button"
                        onClick={() => handleRemoveBrand(brand.id)}
                        className="hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {formData.assignedBrands.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No brands assigned
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
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
