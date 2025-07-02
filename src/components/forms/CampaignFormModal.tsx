import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, UserPlus, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import NurseCreateModal from "@/components/forms/NurseCreateModal";
import type { UserStatus } from "@/components/forms/UserFormModal";

interface Brand {
  brand_id: number;
  brand_name: string;
  logo_url: string;
  description: string;
  brandStatus: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface Nurse {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  userStatus: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  assigned_campaigns?: Array<{
    campaign_id: number;
    campaign_name: string;
  }>;
  assigned_admins?: Array<{
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
  }>;
}

interface CampaignPayload {
  name: string;
  logo_url: string;
  brand_id: number;
  campaign_url: string;
  notes: string;
  nurse_ids: number[];
  work_number: string;
  campaign_id?: number; // For updates
}

const CampaignFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CampaignPayload) => void;
  initialData?: CampaignPayload | null;
  isEditing: boolean;
}) => {
  const [form, setForm] = useState<CampaignPayload>({
    name: "",
    logo_url: "",
    brand_id: 0,
    campaign_url: "",
    notes: "",
    nurse_ids: [],
    work_number: "",
  });

  const [selectedNurse, setSelectedNurse] = useState<string>("");
  const [isNurseModalOpen, setIsNurseModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // API data states
  const [brands, setBrands] = useState<Brand[]>([]);
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(false);
  const [isLoadingNurses, setIsLoadingNurses] = useState(false);

  // API Functions
  const getAuthToken = () => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      throw new Error("No authentication token found");
    }
    const user = JSON.parse(userString);
    return user.token;
  };

  const fetchBrands = async () => {
    try {
      setIsLoadingBrands(true);
      const token = getAuthToken();

      const response = await fetch(
        "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/get-all-brands",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }

      const data = await response.json();
      setBrands(data.brands || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch brands");
      setBrands([]);
    } finally {
      setIsLoadingBrands(false);
    }
  };

  const fetchNurses = async () => {
    try {
      setIsLoadingNurses(true);
      const token = getAuthToken();

      const response = await fetch(
        "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/nurse/getAll",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch nurses");
      }

      const data = await response.json();
      setNurses(data.nurses || []);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch nurses");
      setNurses([]);
    } finally {
      setIsLoadingNurses(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Fetch data when modal opens
      fetchBrands();
      fetchNurses();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setForm({
        campaign_id: initialData.campaign_id || undefined,
        name: initialData.name || "",
        logo_url: initialData.logo_url || "",
        brand_id: initialData.brand_id || 0,
        campaign_url: initialData.campaign_url || "",
        notes: initialData.notes || "",
        nurse_ids: initialData.nurse_ids || [],
        work_number: initialData.work_number || "",
      });
      // Set image preview if there's an existing logo URL
      if (initialData.logo_url) {
        setImagePreview(initialData.logo_url);
      } else {
        setImagePreview("");
      }
    } else {
      setForm({
        name: "",
        logo_url: "",
        brand_id: 0,
        campaign_url: "",
        notes: "",
        nurse_ids: [],
        work_number: "",
      });
      setSelectedImage(null);
      setImagePreview("");
    }
    setSelectedNurse("");
    setIsNurseModalOpen(false);
    setIsUploadingImage(false);
  }, [initialData, isOpen]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data:image/...;base64, prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadBrandLogo = async (
    base64Image: string,
    brandId: number,
  ): Promise<string> => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      throw new Error("No authentication token found");
    }

    const user = JSON.parse(userString);
    const token = user.token;

    const response = await fetch(
      "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/brands/uploadBrandLogo",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          brand_id: brandId.toString(),
          base64Image: base64Image,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Upload failed" }));
      throw new Error(errorData.message || "Failed to upload logo");
    }

    const data = await response.json();
    return data.logo_url;
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        setSelectedImage(file);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setImagePreview(previewUrl);
      } else {
        toast.error("Please select an image file");
      }
    }
  };

  const handleAddNurse = () => {
    if (selectedNurse) {
      const nurseId = parseInt(selectedNurse, 10);
      if (nurseId && !form.nurse_ids.includes(nurseId)) {
        setForm((prev) => ({
          ...prev,
          nurse_ids: [...prev.nurse_ids, nurseId],
        }));
        setSelectedNurse("");
      }
    }
  };

  const handleCreateNurse = (nurseData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    status: UserStatus;
    assignedBrands: { id: string; name: string }[];
  }) => {
    const newNurseId = Math.max(...nurses.map((n) => n.user_id), 0) + 1;
    const newNurse: Nurse = {
      user_id: newNurseId,
      first_name: nurseData.firstName,
      last_name: nurseData.lastName,
      email: nurseData.email,
      userStatus: "active",
      created_by: 1, // placeholder
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setNurses((prev) => [...prev, newNurse]);
    setForm((prev) => ({
      ...prev,
      nurse_ids: [...prev.nurse_ids, newNurseId],
    }));
    setIsNurseModalOpen(false);
  };

  const handleRemoveNurse = (nurseId: number) => {
    setForm((prev) => ({
      ...prev,
      nurse_ids: prev.nurse_ids.filter((id) => id !== nurseId),
    }));
  };

  const getAvailableNurses = () =>
    nurses.filter(
      (nurse) =>
        !form.nurse_ids.includes(nurse.user_id) &&
        nurse.userStatus === "active",
    );

  const getAssignedNurses = () =>
    nurses.filter((nurse) => form.nurse_ids.includes(nurse.user_id));

  const createCampaign = async (campaignData: CampaignPayload) => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      throw new Error("No authentication token found");
    }

    const user = JSON.parse(userString);
    const token = user.token;

    const response = await fetch(
      "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/create-campaign",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: campaignData.name,
          logo_url: campaignData.logo_url,
          brand_id: campaignData.brand_id,
          campaign_url: campaignData.campaign_url,
          notes: campaignData.notes,
          nurse_ids: campaignData.nurse_ids,
          work_number: campaignData.work_number,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Create failed" }));
      throw new Error(errorData.message || "Failed to create campaign");
    }

    return await response.json();
  };

  const updateCampaign = async (campaignData: CampaignPayload) => {
    const userString = localStorage.getItem("user");
    if (!userString) {
      throw new Error("No authentication token found");
    }

    const user = JSON.parse(userString);
    const token = user.token;

    const response = await fetch(
      "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/campaign/update",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          campaign_id: campaignData.campaign_id,
          name: campaignData.name,
          logo_url: campaignData.logo_url,
          brand_id: campaignData.brand_id,
          campaign_url: campaignData.campaign_url,
          notes: campaignData.notes,
          nurse_ids: campaignData.nurse_ids,
          work_number: campaignData.work_number,
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Update failed" }));
      throw new Error(errorData.message || "Failed to update campaign");
    }

    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.brand_id === 0) {
      toast.error("Please select a brand");
      return;
    }

    let finalLogoUrl = form.logo_url;

    try {
      // If there's a new image selected, upload it first
      if (selectedImage) {
        setIsUploadingImage(true);
        const base64Image = await convertToBase64(selectedImage);
        finalLogoUrl = await uploadBrandLogo(base64Image, form.brand_id);
        toast.success("Logo uploaded successfully!");
      }

      const campaignData = {
        ...form,
        logo_url: finalLogoUrl,
      };

      if (isEditing) {
        await updateCampaign(campaignData);
        toast.success("Campaign updated successfully!");
      } else {
        await createCampaign(campaignData);
        toast.success("Campaign created successfully!");
      }

      onSubmit(campaignData);
      onClose();
    } catch (error: any) {
      toast.error(
        error.message ||
          `Failed to ${isEditing ? "update" : "create"} campaign`,
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Campaign" : "Create Campaign"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update campaign info and nurse assignments"
              : "Create a new campaign and assign nurses"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name and Brand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Campaign Name</Label>
              <Input
                required
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter campaign name"
              />
            </div>
            <div>
              <Label>Brand</Label>
              <Select
                value={String(form.brand_id || 0)}
                onValueChange={(v) =>
                  setForm({ ...form, brand_id: parseInt(v, 10) || 0 })
                }
                disabled={isLoadingBrands}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingBrands ? "Loading brands..." : "Select Brand"
                    }
                  />
                  {isLoadingBrands && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {brands
                    .filter((b) => b.brandStatus === "active")
                    .map((b) => (
                      <SelectItem key={b.brand_id} value={String(b.brand_id)}>
                        {b.brand_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Campaign URL and Work Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Campaign URL</Label>
              <Input
                value={form.campaign_url || ""}
                onChange={(e) =>
                  setForm({ ...form, campaign_url: e.target.value })
                }
                placeholder="https://example.com/campaign"
              />
            </div>
            <div>
              <Label>Work Phone Number</Label>
              <Input
                type="tel"
                value={form.work_number || ""}
                onChange={(e) =>
                  setForm({ ...form, work_number: e.target.value })
                }
                placeholder="1234567890"
              />
            </div>
          </div>

          <div>
            <Label>Campaign Logo</Label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="flex-1"
                  disabled={isUploadingImage}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    document.querySelector('input[type="file"]')?.click()
                  }
                  disabled={isUploadingImage}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>

              {selectedImage && (
                <p className="text-sm text-muted-foreground">
                  Selected: {selectedImage.name}
                </p>
              )}

              {isUploadingImage && (
                <p className="text-sm text-blue-600">Uploading logo...</p>
              )}

              {imagePreview && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                  <img
                    src={imagePreview}
                    alt="Logo preview"
                    className="w-32 h-32 object-contain border border-gray-200 rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              rows={3}
              value={form.notes || ""}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Campaign description and notes..."
            />
          </div>

          {/* Nurse Assignment Section */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Assigned Nurses</Label>
              <div className="mt-2 space-y-3">
                <div className="flex gap-2">
                  <Select
                    value={selectedNurse}
                    onValueChange={setSelectedNurse}
                    disabled={isLoadingNurses}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue
                        placeholder={
                          isLoadingNurses
                            ? "Loading nurses..."
                            : "Select a nurse"
                        }
                      />
                      {isLoadingNurses && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableNurses().map((nurse) => (
                        <SelectItem
                          key={nurse.user_id}
                          value={nurse.user_id.toString()}
                        >
                          {nurse.first_name} {nurse.last_name} ({nurse.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    onClick={handleAddNurse}
                    disabled={!selectedNurse || isLoadingNurses}
                    size="icon"
                    variant="outline"
                    title="Assign existing nurse"
                  >
                    <UserPlus className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsNurseModalOpen(true)}
                    size="icon"
                    variant="outline"
                    title="Create new nurse"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {getAssignedNurses().map((nurse) => (
                    <Badge
                      key={nurse.user_id}
                      variant="outline"
                      className="gap-1"
                    >
                      {nurse.first_name} {nurse.last_name}
                      <button
                        type="button"
                        onClick={() => handleRemoveNurse(nurse.user_id)}
                        className="hover:bg-destructive/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {form.nurse_ids.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No nurses assigned
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUploadingImage}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploadingImage}>
              {isUploadingImage
                ? "Uploading..."
                : isEditing
                  ? "Update Campaign"
                  : "Create Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Nurse Creation Sub-Modal */}
      <NurseCreateModal
        isOpen={isNurseModalOpen}
        onClose={() => setIsNurseModalOpen(false)}
        onSubmit={handleCreateNurse}
      />
    </Dialog>
  );
};

export default CampaignFormModal;
