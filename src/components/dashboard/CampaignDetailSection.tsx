import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Edit,
  Power,
  PowerOff,
  Users,
  Phone,
  Calendar,
  Building2,
  Loader2,
  Send,
  ArrowLeft,
  MoreHorizontal,
  Globe,
} from "lucide-react";
import CampaignFormModal from "@/components/forms/CampaignFormModal";
import type { CampaignStatus } from "@/components/dashboard/CampaignsSection";
import { toast } from "sonner";

interface CampaignDetailSectionProps {
  campaignId: string;
  userRole: "superAdmin" | "admin" | "nurse";
  onBack?: () => void;
}

interface CampaignApiData {
  campaign_id: number;
  brand_id: number;
  campaign_name: string;
  logo_url: string;
  campaign_url: string | null;
  campaignStatus: string;
  start_date: string;
  end_date: string;
  created_by: number;
  notes: string;
  work_number: string | null;
  created_at: string;
  updated_at: string;
}

interface NurseApiData {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  userStatus: string;
  created_at: string;
}

interface CampaignPayload {
  name: string;
  logo_url: string;
  brand_id: number;
  notes: string;
  nurse_ids: number[];
}

// Fetch functions
const fetchCampaignById = async (
  campaignId: string,
): Promise<CampaignApiData> => {
  const storedAuth = localStorage.getItem("user");
  if (!storedAuth) throw new Error("User not authenticated");

  const { token } = JSON.parse(storedAuth);

  // Extract numeric ID from campaign-{id} format
  const numericId = campaignId.replace("campaign-", "");
  const response = await fetch(
    `https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/campaign/getById?campaign_id=${numericId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch campaign");
  }

  const data = await response.json();
  console.log(data);
  return data.campaign;
};

const fetchCampaignNurses = async (
  campaignId: string,
): Promise<NurseApiData[]> => {
  const storedAuth = localStorage.getItem("user");
  if (!storedAuth) throw new Error("User not authenticated");

  const { token } = JSON.parse(storedAuth);

  // Extract numeric ID from campaign-{id} format
  const numericId = campaignId.replace("campaign-", "");

  const response = await fetch(
    `https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/nurse/get-nurses?campaign_id=${numericId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch campaign nurses");
  }

  const data = await response.json();
  console.log(data);
  return data.nurses || [];
};

const CampaignDetailSection = ({
  campaignId,
  userRole,
  onBack,
}: CampaignDetailSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPublishWarningOpen, setIsPublishWarningOpen] = useState(false);

  // Fetch campaign data
  const {
    data: campaign,
    isLoading: campaignLoading,
    error: campaignError,
    refetch: refetchCampaign,
  } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => fetchCampaignById(campaignId),
    staleTime: 30000,
  });

  // Fetch campaign nurses
  const {
    data: nurses,
    isLoading: nursesLoading,
    error: nursesError,
    refetch: refetchNurses,
  } = useQuery({
    queryKey: ["campaign-nurses", campaignId],
    queryFn: () => fetchCampaignNurses(campaignId),
    staleTime: 30000,
  });

  const handleEditCampaign = async (campaignData: CampaignPayload) => {
    try {
      const storedAuth = localStorage.getItem("user");
      if (!storedAuth) throw new Error("User not authenticated");

      const { token } = JSON.parse(storedAuth);

      // Extract numeric ID from campaign-{id} format
      const numericId = campaignId.replace("campaign-", "");

      const updatePayload = {
        campaign_id: parseInt(numericId, 10),
        name: campaignData.name,
        notes: campaignData.notes,
      };

      const response = await fetch(
        "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/campaign/update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to update campaign");
      }

      toast.success("Campaign updated successfully");
      setIsModalOpen(false);
      refetchCampaign();
      refetchNurses();
    } catch (error: any) {
      console.error("Error updating campaign:", error);
      toast.error(error.message || "Failed to update campaign");
    }
  };

  const handleCreateCampaign = (campaignData: CampaignPayload) => {
    // The actual API call is handled inside CampaignFormModal
    // This callback is triggered after successful creation
    toast.success("Campaign created successfully! Refreshing data...");
    setIsModalOpen(false);
    // Optionally refetch data if needed
    refetchCampaign();
  };

  const handleToggleStatus = () => {
    if (!campaign) return;

    const newStatus =
      campaign.campaignStatus === "active" ? "deactivated" : "active";
    toast.success(
      `Campaign ${newStatus === "deactivated" ? "deactivated" : "reactivated"}`,
    );
  };

  const handlePublishCampaign = async () => {
    try {
      const storedAuth = localStorage.getItem("user");
      if (!storedAuth) throw new Error("User not authenticated");

      const { token } = JSON.parse(storedAuth);

      // Extract numeric ID from campaign-{id} format
      const numericId = campaignId.replace("campaign-", "");

      const response = await fetch(
        "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/campaign/publish",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            campaign_id: parseInt(numericId, 10),
          }),
        },
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to publish campaign");
      }

      toast.success("Campaign published successfully");
      setIsPublishWarningOpen(false);
      refetchCampaign();
    } catch (error: any) {
      console.error("Error publishing campaign:", error);
      toast.error(error.message || "Failed to publish campaign");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "default";
      case "draft":
        return "outline";
      case "uat":
        return "secondary";
      case "deactivated":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatCampaignForEdit = (
    campaign: CampaignApiData,
  ): CampaignPayload => {
    return {
      name: campaign.campaign_name,
      logo_url: campaign.logo_url,
      brand_id: campaign.brand_id,
      notes: campaign.notes,
      nurse_ids: nurses?.map((nurse) => nurse.user_id) || [],
    };
  };

  const openEditModal = () => {
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setIsModalOpen(true);
  };

  if (campaignLoading || nursesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading campaign details...</span>
      </div>
    );
  }

  if (campaignError || !campaign) {
    return (
      <div className="flex items-center justify-center py-8 text-red-500">
        <span>Error loading campaign: {campaignError?.message}</span>
        <Button
          variant="outline"
          size="sm"
          className="ml-2"
          onClick={() => refetchCampaign()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      {onBack && (
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="gap-2 hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      )}

      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <Badge
          variant={getStatusBadgeVariant(campaign.campaignStatus)}
          className="text-sm px-3 py-1 font-medium"
        >
          {campaign.campaignStatus.toUpperCase()}
        </Badge>

        {/* Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <MoreHorizontal className="h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Campaign
            </DropdownMenuItem>

            {(campaign.campaignStatus?.toLowerCase() === "draft" ||
              campaign.campaignStatus?.toLowerCase() === "uat") && (
              <DropdownMenuItem onClick={openEditModal}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Campaign
              </DropdownMenuItem>
            )}

            {campaign.campaignStatus?.toLowerCase() === "uat" && (
              <DropdownMenuItem onClick={() => setIsPublishWarningOpen(true)}>
                <Send className="mr-2 h-4 w-4" />
                Publish to Production
              </DropdownMenuItem>
            )}

            {campaign.campaignStatus?.toLowerCase() === "prod" && (
              <DropdownMenuItem
                onClick={handleToggleStatus}
                className="text-destructive"
              >
                <PowerOff className="mr-2 h-4 w-4" />
                Deactivate Campaign
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Campaign Header */}
      <div className="flex items-start space-x-4">
        <Avatar className="w-20 h-20">
          <AvatarImage src={campaign.logo_url} alt={campaign.campaign_name} />
          <AvatarFallback className="text-xl">
            {campaign.campaign_name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {campaign.campaign_name}
          </h1>
          <div className="flex items-center space-x-4 mt-3">
            <Badge
              variant="secondary"
              className="text-base px-3 py-1 font-semibold"
            >
              <Building2 className="w-4 h-4 mr-2" />
              Brand {campaign.brand_id}
            </Badge>
            {campaign.work_number && (
              <div className="flex items-center text-muted-foreground">
                <Phone className="w-4 h-4 mr-1" />
                {campaign.work_number}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Campaign Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nurses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{nurses?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Assigned team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              URLs Generated
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(nurses?.length || 0) * 3}
            </div>
            <p className="text-xs text-muted-foreground">
              Campaign URLs created
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{campaign.notes}</p>
        </CardContent>
      </Card>

      {/* Assigned Nurses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Team Members</CardTitle>
          <CardDescription>Nurses assigned to this campaign</CardDescription>
        </CardHeader>
        <CardContent>
          {nursesError ? (
            <div className="text-center py-4 text-red-500">
              <span>Error loading nurses: {nursesError.message}</span>
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={() => refetchNurses()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nurse</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nurses && nurses.length > 0 ? (
                  nurses.map((nurse) => (
                    <TableRow key={nurse.user_id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>
                              {nurse.first_name.charAt(0)}
                              {nurse.last_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {nurse.first_name} {nurse.last_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {nurse.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            nurse.userStatus === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {nurse.userStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(nurse.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-4 text-muted-foreground"
                    >
                      No nurses assigned to this campaign
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Campaign Form Modal */}
      <CampaignFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={isEditing ? handleEditCampaign : handleCreateCampaign}
        initialData={
          isEditing && campaign ? formatCampaignForEdit(campaign) : null
        }
        isEditing={isEditing}
      />

      {/* Publish Warning Alert Dialog */}
      <AlertDialog
        open={isPublishWarningOpen}
        onOpenChange={setIsPublishWarningOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish Campaign</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to publish this campaign? After publishing,
              you will not be able to modify the campaign information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublishCampaign}>
              <Send className="w-4 h-4 mr-2" />
              Publish Campaign
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CampaignDetailSection;
