import { useState, useEffect } from "react";
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
import { X, UserPlus } from "lucide-react";
import type { UserStatus } from "@/components/forms/UserFormModal";

interface Brand {
  id: string;
  name: string;
}

interface NurseData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  status: UserStatus;
  assignedBrands: Brand[];
}

interface NurseCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NurseData) => void;
}

// Mock available brands
const availableBrands: Brand[] = [
  { id: "1", name: "HealthTech Solutions" },
  { id: "2", name: "MedCare Plus" },
  { id: "3", name: "Wellness Group" },
  { id: "4", name: "LifeCare Medical" },
];

const NurseCreateModal = ({
  isOpen,
  onClose,
  onSubmit,
}: NurseCreateModalProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    status: "Active" as UserStatus,
    assignedBrands: [] as Brand[],
  });
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      onSubmit(formData);
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        status: "Active",
        assignedBrands: [],
      });
      setSelectedBrand("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
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

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const getAvailableBrands = () =>
    availableBrands.filter(
      (brand) => !formData.assignedBrands.find((b) => b.id === brand.id),
    );

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" />

      {/* Modal Content */}
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">Create New Nurse</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Add a new nurse to be assigned to this campaign
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

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                placeholder="nurse@company.com"
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: UserStatus) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
                disabled={isSubmitting}
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

          <div className="space-y-3">
            <Label className="text-sm font-medium">Assigned Brands</Label>
            <div className="flex gap-2">
              <Select
                value={selectedBrand}
                onValueChange={setSelectedBrand}
                disabled={isSubmitting}
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
                disabled={!selectedBrand || isSubmitting}
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
                    disabled={isSubmitting}
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Nurse"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NurseCreateModal;
