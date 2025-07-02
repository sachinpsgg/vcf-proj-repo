import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Eye,
  ExternalLink,
  Power,
  Megaphone,
  Users,
  Building2,
  Loader2,
  Link,
} from "lucide-react";
import CampaignFormModal from "@/components/forms/CampaignFormModal";
import { toast } from "sonner";

export type CampaignStatus = "Draft" | "UAT" | "Prod" | "Deactivated";

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
  brand_name: string;
  assigned_nurses: Array<{
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
  }>;
}

export interface Campaign {
  id: string;
  name: string;
  logo?: string;
  brandName: string;
  brandId: number;
  status: CampaignStatus;
  phoneNumber: string;
  notes: string;
  assignedNurses: { id: string; name: string; email: string }[];
  createdAt: Date;
}

interface CampaignsSectionProps {
  userRole: "superAdmin" | "admin" | "nurse";
  onNavigateToDetail?: (campaignId: string) => void;
}

// Fetch function for campaigns
const fetchCampaigns = async (): Promise<CampaignApiData[]> => {
  const storedAuth = localStorage.getItem("user");
  if (!storedAuth) throw new Error("User not authenticated");

  const { token } = JSON.parse(storedAuth);

  const response = await fetch(
    "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/get-all-campaigns",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch campaigns");
  }

  const data = await response.json();
  return data.campaigns || [];
};

const CampaignsSection = ({
  userRole,
  onNavigateToDetail,
}: CampaignsSectionProps) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch campaigns data
  const {
    data: campaignsData,
    isLoading: campaignsLoading,
    error: campaignsError,
    refetch: refetchCampaigns,
  } = useQuery({
    queryKey: ["campaigns"],
    queryFn: fetchCampaigns,
    staleTime: 30000,
  });

  // Transform API data to component format
  const allCampaigns: Campaign[] =
    campaignsData?.map((c) => ({
      id: String(c.campaign_id),
      name: c.campaign_name,
      logo: c.logo_url,
      brandName: c.brand_name || `Brand ${c.brand_id}`,
      brandId: c.brand_id,
      status: (c.campaignStatus.charAt(0).toUpperCase() +
        c.campaignStatus.slice(1)) as CampaignStatus,
      phoneNumber: c.work_number || "N/A",
      notes: c.notes,
      assignedNurses:
        c.assigned_nurses?.map((n) => ({
          id: String(n.user_id),
          name: `${n.first_name} ${n.last_name}`,
          email: n.email,
        })) || [],
      createdAt: new Date(c.created_at),
    })) || [];

  // Get unique brands for filter dropdown
  const uniqueBrands = [
    ...new Set(allCampaigns.map((c) => c.brandName)),
  ].sort();

  // Filter campaigns based on selected filters
  const campaigns = allCampaigns.filter((campaign) => {
    const brandMatch =
      brandFilter === "all" || campaign.brandName === brandFilter;
    const statusMatch =
      statusFilter === "all" ||
      campaign.status.toLowerCase() === statusFilter.toLowerCase();
    return brandMatch && statusMatch;
  });

  const handleCreateCampaign = (campaignData: any) => {
    // The API call is now handled inside the modal
    console.log(campaignData);
    refetchCampaigns();
  };

  const handleEditCampaign = async (id: string, campaignData: any) => {
    // The API call is now handled inside the modal
    refetchCampaigns();
  };

  const handleDeleteCampaign = (id: string) => {
    // TODO: Implement actual delete API call
    toast.success("Campaign deleted successfully");
    refetchCampaigns();
  };

  const handleDeactivateCampaign = (id: string) => {
    // TODO: Implement actual deactivate API call
    toast.success("Campaign deactivated");
    refetchCampaigns();
  };

  const handleActivateCampaign = (id: string) => {
    // TODO: Implement actual activate API call
    toast.success("Campaign reactivated");
    refetchCampaigns();
  };

  const openEditModal = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingCampaign(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
  };

  const getStatusBadgeVariant = (status: CampaignStatus) => {
    switch (status) {
      case "Prod":
        return "default";
      case "UAT":
        return "secondary";
      case "Draft":
        return "outline";
      case "Deactivated":
        return "destructive";
      default:
        return "outline";
    }
  };

  const activeCount = campaigns.filter(
    (c) => c.status !== "Deactivated",
  ).length;
  const prodCount = campaigns.filter((c) => c.status === "Prod").length;
  const totalNurses = campaigns.reduce(
    (acc, campaign) => acc + campaign.assignedNurses.length,
    0,
  );

  if (campaignsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading campaigns...</span>
      </div>
    );
  }

  if (campaignsError) {
    return (
      <div className="flex items-center justify-center py-8 text-red-500">
        <span>Error loading campaigns: {campaignsError.message}</span>
        <Button
          variant="outline"
          size="sm"
          className="ml-2"
          onClick={() => refetchCampaigns()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Campaign Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage marketing campaigns with nurse assignments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/generated-urls")}
            className="gap-2"
          >
            <Link className="w-4 h-4" />
            View Generated URLs
          </Button>
          <Button onClick={openCreateModal} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Campaign
          </Button>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Campaigns
            </CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">All campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <Power className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Patient URL Generated
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prodCount}</div>
            <p className="text-xs text-muted-foreground">
              Total URL Generated so far
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Nurses
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNurses}</div>
            <p className="text-xs text-muted-foreground">
              Across all campaigns
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="">
            <CardTitle>
              {brandFilter === "all" && statusFilter === "all"
                ? "All Campaigns"
                : "Filtered Campaigns"}
            </CardTitle>
            <CardDescription>
              {brandFilter === "all" && statusFilter === "all"
                ? "View and manage all campaigns, their status, and nurse assignments"
                : `Showing ${campaigns.length} campaign${campaigns.length === 1 ? "" : "s"}
                 ${brandFilter !== "all" ? `for ${brandFilter}` : ""}
                 ${statusFilter !== "all" ? `with status: ${statusFilter.toUpperCase()}` : ""}`}
            </CardDescription>
          </div>
          <div className="flex items-center justify-end gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Filter by Brand:
              </label>
              <Select value={brandFilter} onValueChange={setBrandFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {uniqueBrands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">
                Filter by Status:
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="uat">UAT</SelectItem>
                  <SelectItem value="prod">Prod</SelectItem>
                  <SelectItem value="deactivated">Deactivated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(brandFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setBrandFilter("all");
                  setStatusFilter("all");
                }}
                className="gap-2"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Total vcf</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total Nurses</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-center">Edit</TableHead>
                <TableHead className="text-center">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No campaigns found
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={campaign.logo}
                            alt={campaign.name}
                          />
                          <AvatarFallback>
                            {campaign.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{campaign.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {campaign.notes}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {campaign.brandName}
                    </TableCell>
                    <TableCell className="font-medium justify-center text-center">
                      232
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(campaign.status)}>
                        {campaign.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {campaign.phoneNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 text-center">
                        {campaign.assignedNurses.length}
                      </div>
                    </TableCell>
                    <TableCell>
                      {campaign.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(campaign)}
                        disabled={campaign.status === "Prod"}
                        className="h-8 w-8 p-0"
                        title={
                          campaign.status === "Prod"
                            ? "Cannot edit production campaigns"
                            : "Edit campaign"
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          onNavigateToDetail?.(`campaign-${campaign.id}`)
                        }
                        className="h-8 w-8 p-0"
                        title="View campaign details"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Campaign Form Modal */}
      <CampaignFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={
          editingCampaign
            ? (data) => handleEditCampaign(editingCampaign.id, data)
            : handleCreateCampaign
        }
        initialData={
          editingCampaign
            ? {
                name: editingCampaign.name,
                logo_url: editingCampaign.logo || "",
                brand_id: editingCampaign.brandId,
                notes: editingCampaign.notes,
                nurse_ids: editingCampaign.assignedNurses.map((n) =>
                  parseInt(n.id, 10),
                ),
              }
            : null
        }
        isEditing={!!editingCampaign}
      />
    </div>
  );
};

export default CampaignsSection;
