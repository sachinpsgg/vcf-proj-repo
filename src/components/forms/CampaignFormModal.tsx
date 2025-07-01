// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Badge } from "@/components/ui/badge";
// import { X, Upload, UserPlus, Plus } from "lucide-react";
// import NurseCreateModal from "@/components/forms/NurseCreateModal";
// import type { CampaignStatus } from "@/components/dashboard/CampaignsSection";
// import type { UserStatus } from "@/components/forms/UserFormModal";
//
// interface Nurse {
//   id: string;
//   name: string;
//   email: string;
// }
//
// interface Campaign {
//   id: string;
//   name: string;
//   logo?: string;
//   brandName: string;
//   status: CampaignStatus;
//   phoneNumber: string;
//   notes: string;
//   assignedNurses: Nurse[];
//   createdAt: Date;
// }
//
// interface CampaignFormModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (data: Omit<Campaign, "id" | "createdAt">) => void;
//   initialData?: Campaign | null;
//   isEditing: boolean;
// }
//
// // Mock data for available brands and nurses
// const availableBrands = [
//   "HealthTech Solutions",
//   "MedCare Plus",
//   "Wellness Group",
//   "LifeCare Medical",
// ];
//
// const availableNurses: Nurse[] = [
//   { id: "1", name: "Sarah Wilson", email: "sarah@healthtech.com" },
//   { id: "2", name: "Mike Johnson", email: "mike@healthtech.com" },
//   { id: "3", name: "Emma Davis", email: "emma@medcareplus.com" },
//   { id: "4", name: "Lisa Brown", email: "lisa@wellness.com" },
//   { id: "5", name: "David Miller", email: "david@lifecare.com" },
// ];
//
// const statusOptions: CampaignStatus[] = ["Draft", "UAT", "Prod", "Deactivated"];
//
// const CampaignFormModal = ({
//   isOpen,
//   onClose,
//   onSubmit,
//   initialData,
//   isEditing,
// }: CampaignFormModalProps) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     logo: "",
//     brandName: "",
//     status: "Draft" as CampaignStatus,
//     phoneNumber: "",
//     notes: "",
//     assignedNurses: [] as Nurse[],
//   });
//
//   const [selectedNurse, setSelectedNurse] = useState<string>("");
//   const [isNurseModalOpen, setIsNurseModalOpen] = useState(false);
//
//   useEffect(() => {
//     if (initialData) {
//       setFormData({
//         name: initialData.name,
//         logo: initialData.logo || "",
//         brandName: initialData.brandName,
//         status: initialData.status,
//         phoneNumber: initialData.phoneNumber,
//         notes: initialData.notes,
//         assignedNurses: initialData.assignedNurses,
//       });
//     } else {
//       setFormData({
//         name: "",
//         logo: "",
//         brandName: "",
//         status: "Draft",
//         phoneNumber: "",
//         notes: "",
//         assignedNurses: [],
//       });
//     }
//     setIsNurseModalOpen(false);
//   }, [initialData, isOpen]);
//
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSubmit(formData);
//     onClose();
//   };
//
//   const handleAddNurse = () => {
//     if (selectedNurse) {
//       const nurse = availableNurses.find((n) => n.id === selectedNurse);
//       if (nurse && !formData.assignedNurses.find((n) => n.id === nurse.id)) {
//         setFormData((prev) => ({
//           ...prev,
//           assignedNurses: [...prev.assignedNurses, nurse],
//         }));
//         setSelectedNurse("");
//       }
//     }
//   };
//
//   const handleCreateNurse = (nurseData: {
//     firstName: string;
//     lastName: string;
//     email: string;
//     password: string;
//     status: UserStatus;
//     assignedBrands: { id: string; name: string }[];
//   }) => {
//     const nurse: Nurse = {
//       id: Date.now().toString(),
//       name: `${nurseData.firstName} ${nurseData.lastName}`,
//       email: nurseData.email,
//     };
//     setFormData((prev) => ({
//       ...prev,
//       assignedNurses: [...prev.assignedNurses, nurse],
//     }));
//     setIsNurseModalOpen(false);
//   };
//
//   const handleRemoveNurse = (nurseId: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       assignedNurses: prev.assignedNurses.filter((n) => n.id !== nurseId),
//     }));
//   };
//
//   const getAvailableNurses = () =>
//     availableNurses.filter(
//       (nurse) => !formData.assignedNurses.find((n) => n.id === nurse.id),
//     );
//
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle>
//             {isEditing ? "Edit Campaign" : "Create New Campaign"}
//           </DialogTitle>
//           <DialogDescription>
//             {isEditing
//               ? "Update campaign information and assignments"
//               : "Create a new marketing campaign with nurse assignments"}
//           </DialogDescription>
//         </DialogHeader>
//
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="name">Campaign Name</Label>
//               <Input
//                 id="name"
//                 value={formData.name}
//                 onChange={(e) =>
//                   setFormData((prev) => ({ ...prev, name: e.target.value }))
//                 }
//                 placeholder="Enter campaign name"
//                 required
//               />
//             </div>
//
//             <div className="space-y-2">
//               <Label htmlFor="brandName">Brand Name</Label>
//               <Select
//                 value={formData.brandName}
//                 onValueChange={(value) =>
//                   setFormData((prev) => ({ ...prev, brandName: value }))
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select a brand" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {availableBrands.map((brand) => (
//                     <SelectItem key={brand} value={brand}>
//                       {brand}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//
//             <div className="space-y-2">
//               <Label htmlFor="status">Status</Label>
//               <Select
//                 value={formData.status}
//                 onValueChange={(value: CampaignStatus) =>
//                   setFormData((prev) => ({ ...prev, status: value }))
//                 }
//               >
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select status" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {statusOptions.map((status) => (
//                     <SelectItem key={status} value={status}>
//                       {status}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//
//             <div className="space-y-2">
//               <Label htmlFor="phoneNumber">Phone Number</Label>
//               <Input
//                 id="phoneNumber"
//                 value={formData.phoneNumber}
//                 onChange={(e) =>
//                   setFormData((prev) => ({
//                     ...prev,
//                     phoneNumber: e.target.value,
//                   }))
//                 }
//                 placeholder="+1 (555) 123-4567"
//                 required
//               />
//             </div>
//           </div>
//
//           <div className="space-y-2">
//             <Label htmlFor="logo">Campaign Logo URL</Label>
//             <div className="flex gap-2">
//               <Input
//                 id="logo"
//                 value={formData.logo}
//                 onChange={(e) =>
//                   setFormData((prev) => ({ ...prev, logo: e.target.value }))
//                 }
//                 placeholder="https://example.com/logo.png"
//               />
//               <Button type="button" variant="outline" size="icon">
//                 <Upload className="w-4 h-4" />
//               </Button>
//             </div>
//           </div>
//
//           <div className="space-y-2">
//             <Label htmlFor="notes">Notes</Label>
//             <Textarea
//               id="notes"
//               value={formData.notes}
//               onChange={(e) =>
//                 setFormData((prev) => ({ ...prev, notes: e.target.value }))
//               }
//               placeholder="Campaign description and notes..."
//               rows={3}
//             />
//           </div>
//
//           <div className="space-y-4">
//             <div>
//               <Label className="text-base font-medium">Assigned Nurses</Label>
//               <div className="mt-2 space-y-3">
//                 <div className="flex gap-2">
//                   <Select
//                     value={selectedNurse}
//                     onValueChange={setSelectedNurse}
//                   >
//                     <SelectTrigger className="flex-1">
//                       <SelectValue placeholder="Select a nurse" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {getAvailableNurses().map((nurse) => (
//                         <SelectItem key={nurse.id} value={nurse.id}>
//                           {nurse.name} ({nurse.email})
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <Button
//                     type="button"
//                     onClick={handleAddNurse}
//                     disabled={!selectedNurse}
//                     size="icon"
//                     variant="outline"
//                     title="Assign existing nurse"
//                   >
//                     <UserPlus className="w-4 h-4" />
//                   </Button>
//                   <Button
//                     type="button"
//                     onClick={() => setIsNurseModalOpen(true)}
//                     size="icon"
//                     variant="outline"
//                     title="Create new nurse"
//                   >
//                     <Plus className="w-4 h-4" />
//                   </Button>
//                 </div>
//
//                 <div className="flex flex-wrap gap-2">
//                   {formData.assignedNurses.map((nurse) => (
//                     <Badge key={nurse.id} variant="outline" className="gap-1">
//                       {nurse.name}
//                       <button
//                         type="button"
//                         onClick={() => handleRemoveNurse(nurse.id)}
//                         className="hover:bg-destructive/20 rounded-full p-0.5"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </Badge>
//                   ))}
//                   {formData.assignedNurses.length === 0 && (
//                     <p className="text-sm text-muted-foreground">
//                       No nurses assigned
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//
//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={onClose}>
//               Cancel
//             </Button>
//             <Button type="submit">
//               {isEditing ? "Update Campaign" : "Create Campaign"}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//
//       {/* Nurse Creation Sub-Modal */}
//       <NurseCreateModal
//         isOpen={isNurseModalOpen}
//         onClose={() => setIsNurseModalOpen(false)}
//         onSubmit={handleCreateNurse}
//       />
//     </Dialog>
//   );
// };
//
// export default CampaignFormModal;

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
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface Brand {
  id: number;
  name: string;
}
interface CampaignPayload {
  name: string;
  logo_url: string;
  brand_id: number;
  start_date: string;
  end_date: string;
  notes: string;
  nurse_ids: number[];
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
    start_date: "",
    end_date: "",
    notes: "",
    nurse_ids: [],
  });

  const [brands, setBrands] = useState<Brand[]>([]);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Fetch brands + nurses on mount or open
  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("user") || "{}").token;
    if (!token) return;

    fetch(
      "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/get-all-brands",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then((res) => res.json())
      .then((data) => setBrands(data.brands || []));
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        nurse_ids: initialData.nurse_ids || [],
      });
    } else {
      setForm({
        name: "",
        logo_url: "",
        brand_id: 0,
        start_date: "",
        end_date: "",
        notes: "",
        nurse_ids: [],
      });
      setSelectedImage(null);
    }
  }, [initialData, isOpen]);

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

  const uploadLogo = async (brandId: number): Promise<string> => {
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
            brand_id: brandId.toString(),
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
        setForm((prev) => ({ ...prev, logo_url: file.name }));
      } else {
        toast.error("Please select an image file");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      // For editing, handle logo upload if new image selected
      let finalLogoUrl = form.logo_url;
      if (selectedImage && form.brand_id) {
        try {
          finalLogoUrl = await uploadLogo(form.brand_id);
        } catch (logoError) {
          console.error("Logo upload failed:", logoError);
          toast.error("Failed to upload campaign logo");
          return;
        }
      }

      // Call the onSubmit callback with updated logo URL (parent handles the API call)
      onSubmit({
        ...form,
        logo_url: finalLogoUrl,
      });
      return;
    }

    // For creating new campaigns, make the actual API call
    try {
      const storedAuth = localStorage.getItem("user");
      if (!storedAuth) throw new Error("User not authenticated");

      const { token } = JSON.parse(storedAuth);

      // Upload logo if selected
      let finalLogoUrl = form.logo_url;
      if (selectedImage && form.brand_id) {
        try {
          finalLogoUrl = await uploadLogo(form.brand_id);
        } catch (logoError) {
          console.error("Logo upload failed:", logoError);
          toast.error("Failed to upload campaign logo");
          return;
        }
      }

      const campaignPayload = {
        ...form,
        logo_url: finalLogoUrl,
      };

      const response = await fetch(
        "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/create-campaign",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(campaignPayload),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to create campaign");
      }

      const result = await response.json();
      toast.success("Campaign created successfully!");
      onSubmit(campaignPayload); // callback to parent
      onClose();
    } catch (error: any) {
      console.error("Create campaign error:", error);
      toast.error(error.message || "Something went wrong");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Campaign" : "Create Campaign"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Update campaign info" : "Create a new campaign"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name, Logo URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Brand</Label>
              <Select
                value={String(form.brand_id)}
                onValueChange={(v) =>
                  setForm({ ...form, brand_id: parseInt(v, 10) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Brand" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.brand_id} value={String(b.brand_id)}>
                      {b.brand_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Campaign Logo</Label>
            <div className="flex gap-2">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploadingLogo}
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={isUploadingLogo}
                onClick={() =>
                  document.querySelector('input[type="file"]')?.click()
                }
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
            {selectedImage && (
              <p className="text-sm text-muted-foreground mt-1">
                Selected: {selectedImage.name}
              </p>
            )}
            {form.logo_url && !selectedImage && (
              <p className="text-sm text-muted-foreground mt-1">
                Current: {form.logo_url}
              </p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                required
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
              />
            </div>
            <div>
              <Label>End Date</Label>
              <Input
                type="date"
                required
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isUploadingLogo}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isUploadingLogo}>
              {isUploadingLogo
                ? "Uploading..."
                : isEditing
                  ? "Update Campaign"
                  : "Create Campaign"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignFormModal;
