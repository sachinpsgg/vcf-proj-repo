import { useState } from "react";
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Nurse</DialogTitle>
          <DialogDescription>
            Add a new nurse to be assigned to this campaign
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="nurse@company.com"
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

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="status">Status</Label>
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

          <div className="space-y-3">
            <Label className="text-sm font-medium">Assigned Brands</Label>
            <div className="flex gap-2">
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Nurse</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NurseCreateModal;
