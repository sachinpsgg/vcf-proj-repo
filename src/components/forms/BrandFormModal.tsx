import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload } from "lucide-react";
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
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        name: initialData.name,
        logo_url: initialData.logo_url || "",
        description: initialData.description || "",
      });
    } else if (isOpen) {
      setFormData({
        name: "",
        logo_url: "",
        description: "",
      });
    }
  }, [initialData, isOpen]);

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

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]); // Remove data:image/...;base64, prefix
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadLogo = async (brandId: string): Promise<string> => {
    if (!selectedImage) throw new Error("No image selected");

    setIsUploadingLogo(true);
    try {
      const storedAuth = localStorage.getItem("user");
      if (!storedAuth) throw new Error("User not authenticated");

      const { token } = JSON.parse(storedAuth);
      const base64Image = await convertToBase64(selectedImage);

      const response = await fetch(
        "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/brands/uploadBrandLogo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            brand_id: brandId,
            base64Image: base64Image,
          }),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to upload logo");
      }

      const result = await response.json();
      return result.logo_url;
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);
        setFormData((prev) => ({ ...prev, logo_url: file.name }));
      } else {
        toast.error("Please select an image file");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const storedAuth = localStorage.getItem("user");
      if (!storedAuth) throw new Error("User not authenticated");

      const { token } = JSON.parse(storedAuth);

      if (isEditing && initialData) {
        // Edit Brand
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
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to update brand");
          return;
        }

        toast.success("Brand updated successfully");
      } else {
        // Create Brand
        const createResponse = await fetch(
          "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/create-brand",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              name: formData.name,
              description: formData.description,
              logo_url: "", // Will be updated after logo upload
            }),
          },
        );

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          toast.error(errorData.message || "Failed to create brand");
          return;
        }

        const createResult = await createResponse.json();
        const brandId = createResult.brand_id || createResult.id;

        // Upload logo if selected
        let finalLogoUrl = formData.logo_url;
        if (selectedImage && brandId) {
          try {
            finalLogoUrl = await uploadLogo(brandId.toString());

            // Update brand with logo URL
            const updateResponse = await fetch(
              "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/brands/updateBrand",
              {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  brand_id: brandId,
                  brand_name: formData.name,
                  description: formData.description,
                  logo_url: finalLogoUrl,
                }),
              },
            );

            if (!updateResponse.ok) {
              console.warn("Failed to update brand with logo URL");
            }
          } catch (logoError) {
            console.error("Logo upload failed:", logoError);
            toast.error("Brand created but logo upload failed");
          }
        }

        toast.success("Brand created successfully");
      }

      onClose();
      onSubmit(formData);
    } catch (error: any) {
      console.error("Error submitting brand:", error);
      toast.error("An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

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
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold">
              {isEditing ? "Edit Brand" : "Create New Brand"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing
                ? "Update brand information and assignments"
                : "Create a new brand and assign administrators and nurses"}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">Brand Logo URL</Label>
              <div className="flex gap-2">
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      logo_url: e.target.value,
                    }))
                  }
                  placeholder="https://example.com/logo.png"
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isSubmitting}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter brand description"
                disabled={isSubmitting}
                rows={3}
              />
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
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Update Brand"
                  : "Create Brand"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BrandFormModal;
