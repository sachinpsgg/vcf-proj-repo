import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { X, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Admin {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  userStatus: string;
  brand_name: string;
  brand_id: number;
  logo_url: string;
  created_at: string;
  updated_at: string;
}

interface AdminAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  brandId: number;
  brandName: string;
  currentAdmins: Array<{
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
  }>;
}

const fetchAdmins = async (): Promise<Admin[]> => {
  const storedAuth = localStorage.getItem("user");
  if (!storedAuth) throw new Error("User not authenticated");

  const { token } = JSON.parse(storedAuth);

  const response = await fetch(
    "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/get-all-admins",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch admins");
  }

  const data = await response.json();
  return data.admins || [];
};

const assignAdminsToBrand = async (brandId: number, adminIds: number[]) => {
  const storedAuth = localStorage.getItem("user");
  if (!storedAuth) throw new Error("User not authenticated");

  const { token } = JSON.parse(storedAuth);

  const response = await fetch(
    `https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/brands/assign-multiple-admins?brand_id=${brandId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        admin_ids: adminIds,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to assign admins");
  }

  return response.json();
};

const AdminAssignmentModal = ({
  isOpen,
  onClose,
  onSuccess,
  brandId,
  brandName,
  currentAdmins,
}: AdminAssignmentModalProps) => {
  const [selectedAdminIds, setSelectedAdminIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all admins
  const {
    data: adminsData,
    isLoading: adminsLoading,
    error: adminsError,
  } = useQuery({
    queryKey: ["admins"],
    queryFn: fetchAdmins,
    enabled: isOpen,
  });

  // Initialize selected admins with currently assigned admins
  useEffect(() => {
    if (isOpen && currentAdmins) {
      setSelectedAdminIds(currentAdmins.map((admin) => admin.user_id));
    }
  }, [isOpen, currentAdmins]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedAdminIds([]);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleAdminToggle = (adminId: number) => {
    setSelectedAdminIds((prev) => {
      if (prev.includes(adminId)) {
        return prev.filter((id) => id !== adminId);
      } else {
        return [...prev, adminId];
      }
    });
  };

  const handleRemoveAdmin = (adminId: number) => {
    setSelectedAdminIds((prev) => prev.filter((id) => id !== adminId));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await assignAdminsToBrand(brandId, selectedAdminIds);
      toast.success("Admins assigned successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error assigning admins:", error);
      toast.error(error.message || "Failed to assign admins");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAdmins =
    adminsData?.filter((admin) => selectedAdminIds.includes(admin.user_id)) ||
    [];

  const availableAdmins =
    adminsData?.filter((admin) => !selectedAdminIds.includes(admin.user_id)) ||
    [];

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Assign Admins to {brandName}
          </DialogTitle>
          <DialogDescription>
            Select administrators to assign to this brand. You can add or remove
            admins from the current assignment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Currently Selected Admins */}
          {selectedAdmins.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Selected Admins ({selectedAdmins.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {selectedAdmins.map((admin) => (
                  <Badge
                    key={admin.user_id}
                    variant="default"
                    className="flex items-center gap-1 pl-2 pr-1"
                  >
                    <span>
                      {admin.first_name} {admin.last_name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-primary-foreground/20"
                      onClick={() => handleRemoveAdmin(admin.user_id)}
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add Admin Dropdown */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Add Admin</Label>
            {adminsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm">Loading admins...</span>
              </div>
            ) : adminsError ? (
              <div className="text-sm text-destructive">
                Error loading admins: {adminsError.message}
              </div>
            ) : (
              <Select
                onValueChange={(value) => handleAdminToggle(Number(value))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an admin to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableAdmins.length === 0 ? (
                    <SelectItem value="no-admins" disabled>
                      No available admins
                    </SelectItem>
                  ) : (
                    availableAdmins.map((admin) => (
                      <SelectItem
                        key={admin.user_id}
                        value={admin.user_id.toString()}
                      >
                        <div className="flex flex-col">
                          <span>
                            {admin.first_name} {admin.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {admin.email}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Summary */}
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="text-sm">
              <div className="font-medium mb-1">Assignment Summary:</div>
              <div>Total admins selected: {selectedAdmins.length}</div>
              <div className="text-muted-foreground">
                {selectedAdmins.length === 0
                  ? "No admins will be assigned to this brand"
                  : `${selectedAdmins.length} admin${selectedAdmins.length === 1 ? "" : "s"} will be assigned to this brand`}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || adminsLoading}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAssignmentModal;
