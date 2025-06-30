import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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

interface Nurse {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  userStatus: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  assigned_campaigns: Array<{
    campaign_id: number;
    campaign_name: string;
  }>;
  assigned_admins: Array<{
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
  }>;
}

interface NurseAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  campaignId: number;
  campaignName: string;
  brandId: number;
  currentNurses: Array<{
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
  }>;
}

const fetchNurses = async (): Promise<Nurse[]> => {
  const storedAuth = localStorage.getItem("user");
  if (!storedAuth) throw new Error("User not authenticated");

  const { token } = JSON.parse(storedAuth);

  const response = await fetch(
    "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/nurse/getAll",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch nurses");
  }

  const data = await response.json();
  return data.nurses || [];
};

const assignNursesToCampaign = async (
  campaignId: number,
  brandId: number,
  nurseIds: number[],
) => {
  const storedAuth = localStorage.getItem("user");
  if (!storedAuth) throw new Error("User not authenticated");

  const { token } = JSON.parse(storedAuth);

  const response = await fetch(
    `https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/campaign/assign-multiple-nurses?campaign_id=${campaignId}&brand_id=${brandId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        nurse_ids: nurseIds,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to assign nurses");
  }

  return response.json();
};

const NurseAssignmentModal = ({
  isOpen,
  onClose,
  onSuccess,
  campaignId,
  campaignName,
  brandId,
  currentNurses,
}: NurseAssignmentModalProps) => {
  const [selectedNurseIds, setSelectedNurseIds] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all nurses
  const {
    data: nursesData,
    isLoading: nursesLoading,
    error: nursesError,
  } = useQuery({
    queryKey: ["nurses"],
    queryFn: fetchNurses,
    enabled: isOpen,
  });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen && currentNurses) {
      setSelectedNurseIds(currentNurses.map((nurse) => nurse.user_id));
    } else if (!isOpen) {
      setSelectedNurseIds([]);
      setIsSubmitting(false);
    }
  }, [isOpen, currentNurses]);

  // Close modal on Escape key
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

  const handleNurseToggle = (nurseId: number) => {
    setSelectedNurseIds((prev) => {
      if (prev.includes(nurseId)) {
        return prev.filter((id) => id !== nurseId);
      } else {
        return [...prev, nurseId];
      }
    });
  };

  const handleRemoveNurse = (nurseId: number) => {
    setSelectedNurseIds((prev) => prev.filter((id) => id !== nurseId));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await assignNursesToCampaign(campaignId, brandId, selectedNurseIds);
      toast.success("Nurses assigned successfully");
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error assigning nurses:", error);
      toast.error(error.message || "Failed to assign nurses");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const selectedNurses =
    nursesData?.filter((nurse) => selectedNurseIds.includes(nurse.user_id)) ||
    [];

  const availableNurses =
    nursesData?.filter((nurse) => !selectedNurseIds.includes(nurse.user_id)) ||
    [];

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
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5" />
              Assign Nurses to {campaignName}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select nurses to assign to this campaign. You can add or remove
              nurses from the current assignment.
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
        <div className="p-6 space-y-6">
          {/* Currently Selected Nurses */}
          {selectedNurses.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Selected Nurses ({selectedNurses.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {selectedNurses.map((nurse) => (
                  <Badge
                    key={nurse.user_id}
                    variant="default"
                    className="flex items-center gap-1 pl-2 pr-1"
                  >
                    <span>
                      {nurse.first_name} {nurse.last_name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-primary-foreground/20"
                      onClick={() => handleRemoveNurse(nurse.user_id)}
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Add Nurse Dropdown */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Add Nurse</Label>
            {nursesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm">Loading nurses...</span>
              </div>
            ) : nursesError ? (
              <div className="text-sm text-destructive">
                Error loading nurses: {nursesError.message}
              </div>
            ) : (
              <Select
                onValueChange={(value) => handleNurseToggle(Number(value))}
                disabled={isSubmitting}
                key={selectedNurseIds.length} // Force re-render to clear selection
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a nurse to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableNurses.length === 0 ? (
                    <SelectItem value="no-nurses" disabled>
                      No available nurses
                    </SelectItem>
                  ) : (
                    availableNurses
                      .filter((nurse) => nurse.userStatus === "active")
                      .map((nurse) => (
                        <SelectItem
                          key={nurse.user_id}
                          value={nurse.user_id.toString()}
                        >
                          <div className="flex flex-col">
                            <span>
                              {nurse.first_name} {nurse.last_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {nurse.email}
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
              <div>Total nurses selected: {selectedNurses.length}</div>
              <div className="text-muted-foreground">
                {selectedNurses.length === 0
                  ? "No nurses will be assigned to this campaign"
                  : `${selectedNurses.length} nurse${selectedNurses.length === 1 ? "" : "s"} will be assigned to this campaign`}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t">
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
            disabled={isSubmitting || nursesLoading}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Update Assignment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NurseAssignmentModal;
