import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { X, Upload, Users, UserPlus } from "lucide-react";
import { toast } from "sonner";
interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  description?: string;
  createdAt: Date;
}

interface BrandFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Brand, "id" | "createdAt">) => void;
  initialData?: Brand | null;
  isEditing: boolean;
}

const BrandFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
}: BrandFormModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    logo_url: "",
    description:"",
  });

  const [selectedAdmin, setSelectedAdmin] = useState<string>("");
  const [selectedNurse, setSelectedNurse] = useState<string>("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        logo_url: initialData.logo_url || "",
        description: initialData.description || "",
      });
    } else {
      setFormData({
        name: "",
        logo_url: "",
        description: "",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const storedAuth = localStorage.getItem("user");
      if (!storedAuth) throw new Error("User not authenticated");

      const { token } = JSON.parse(storedAuth);

      if (isEditing && initialData) {
        // 🛠 EDIT BRAND
        const response = await fetch(
          "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/brands/updateBrand",
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              brand_id: Number(initialData.id),
              brand_name: formData.name,
              description: formData.description,
              logo_url: formData.logo_url,
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to update brand");
          return;
        }

        toast.success("Brand updated successfully");
      } else {
        // 🆕 CREATE BRAND
        const response = await fetch(
          "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/create-brand",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to create brand");
          return;
        }
        toast.success("Brand created successfully");
      }

      onClose();
    } catch (error: any) {
      console.error("Error submitting brand:", error);
      toast.error("An error occurred");
    }
    onSubmit(formData);
  };
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Brand" : "Create New Brand"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update brand information and assignments"
              : "Create a new brand and assign administrators and nurses"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter brand name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">Brand logo_url URL</Label>
              <div className="flex gap-2">
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, logo_url: e.target.value }))
                  }
                  placeholder="https://example.com/logo_url.png"
                />
                <Button type="button" variant="outline" size="icon">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <div className="flex gap-2">
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
                <Button type="button" variant="outline" size="icon">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? "Update Brand" : "Create Brand"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BrandFormModal;
