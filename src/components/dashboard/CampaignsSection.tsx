import { useState } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Power,
  PowerOff,
  Megaphone,
  Users,
  Building2,
} from "lucide-react";
import CampaignFormModal from "@/components/forms/CampaignFormModal";
import { toast } from "sonner";

export type CampaignStatus = "Draft" | "UAT" | "Prod" | "Deactivated";

export interface Campaign {
  id: string;
  name: string;
  logo?: string;
  brandName: string;
  status: CampaignStatus;
  phoneNumber: string;
  notes: string;
  assignedNurses: { id: string; name: string; email: string }[];
  createdAt: Date;
}

interface CampaignsSectionProps {
  userRole: "superAdmin" | "admin" | "nurse";
}

const CampaignsSection = ({ userRole }: CampaignsSectionProps) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "Diabetes Awareness Campaign",
      logo: "/api/placeholder/40/40",
      brandName: "HealthTech Solutions",
      status: "Prod",
      phoneNumber: "+1 (555) 123-4567",
      notes: "Annual diabetes awareness and prevention campaign",
      assignedNurses: [
        { id: "1", name: "Sarah Wilson", email: "sarah@healthtech.com" },
        { id: "2", name: "Mike Johnson", email: "mike@healthtech.com" },
      ],
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Heart Health Initiative",
      brandName: "MedCare Plus",
      status: "UAT",
      phoneNumber: "+1 (555) 987-6543",
      notes: "Cardiovascular health education and screening program",
      assignedNurses: [
        { id: "3", name: "Emma Davis", email: "emma@medcareplus.com" },
      ],
      createdAt: new Date("2024-02-20"),
    },
    {
      id: "3",
      name: "Mental Wellness Week",
      brandName: "HealthTech Solutions",
      status: "Draft",
      phoneNumber: "+1 (555) 456-7890",
      notes: "Mental health awareness and support campaign",
      assignedNurses: [],
      createdAt: new Date("2024-03-01"),
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  const handleCreateCampaign = (
    campaignData: Omit<Campaign, "id" | "createdAt">,
  ) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setCampaigns([...campaigns, newCampaign]);
    toast.success("Campaign created successfully");
  };

  const handleEditCampaign = (
    id: string,
    campaignData: Omit<Campaign, "id" | "createdAt">,
  ) => {
    setCampaigns(
      campaigns.map((campaign) =>
        campaign.id === id ? { ...campaign, ...campaignData } : campaign,
      ),
    );
    toast.success("Campaign updated successfully");
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter((campaign) => campaign.id !== id));
    toast.success("Campaign deleted successfully");
  };

  const handleDeactivateCampaign = (id: string) => {
    setCampaigns(
      campaigns.map((campaign) =>
        campaign.id === id
          ? { ...campaign, status: "Deactivated" as CampaignStatus }
          : campaign,
      ),
    );
    toast.success("Campaign deactivated");
  };

  const handleActivateCampaign = (id: string) => {
    setCampaigns(
      campaigns.map((campaign) =>
        campaign.id === id
          ? { ...campaign, status: "Draft" as CampaignStatus }
          : campaign,
      ),
    );
    toast.success("Campaign reactivated");
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
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Campaign
        </Button>
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
              Production Ready
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prodCount}</div>
            <p className="text-xs text-muted-foreground">Live campaigns</p>
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
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>
            View and manage all campaigns, their status, and nurse assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Assigned Nurses</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={campaign.logo} alt={campaign.name} />
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
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {campaign.phoneNumber}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {campaign.assignedNurses.length > 0 ? (
                        campaign.assignedNurses.map((nurse) => (
                          <Badge key={nurse.id} variant="outline">
                            {nurse.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          No nurses assigned
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {campaign.createdAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => openEditModal(campaign)}
                          disabled={campaign.status === "Prod"}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          {campaign.status === "Prod"
                            ? "Edit (Disabled - Production)"
                            : "Edit"}
                        </DropdownMenuItem>
                        {campaign.status === "Deactivated" ? (
                          <DropdownMenuItem
                            onClick={() => handleActivateCampaign(campaign.id)}
                          >
                            <Power className="mr-2 h-4 w-4" />
                            Reactivate
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() =>
                              handleDeactivateCampaign(campaign.id)
                            }
                          >
                            <PowerOff className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
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
        initialData={editingCampaign}
        isEditing={!!editingCampaign}
      />
    </div>
  );
};

export default CampaignsSection;
