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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Edit,
  Power,
  PowerOff,
  Users,
  Phone,
  Calendar,
  Building2,
} from "lucide-react";
import CampaignFormModal from "@/components/forms/CampaignFormModal";
import type {
  Campaign,
  CampaignStatus,
} from "@/components/dashboard/CampaignsSection";
import { toast } from "sonner";

interface CampaignDetailSectionProps {
  campaignId: string;
  userRole: "superAdmin" | "admin" | "nurse";
}

const CampaignDetailSection = ({
  campaignId,
  userRole,
}: CampaignDetailSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Mock campaign data - in real app this would be fetched by ID
  const campaign: Campaign = {
    id: campaignId,
    name:
      campaignId === "campaign-1"
        ? "Diabetes Awareness Campaign"
        : campaignId === "campaign-2"
          ? "Heart Health Initiative"
          : "Mental Wellness Week",
    logo: "/api/placeholder/60/60",
    brandName: "HealthTech Solutions",
    status:
      campaignId === "campaign-1"
        ? "Prod"
        : campaignId === "campaign-2"
          ? "UAT"
          : "Draft",
    phoneNumber: "+1 (555) 123-4567",
    notes:
      "Annual health awareness and prevention campaign targeting community outreach",
    assignedNurses: [
      { id: "1", name: "Sarah Wilson", email: "sarah@healthtech.com" },
      { id: "2", name: "Mike Johnson", email: "mike@healthtech.com" },
    ],
    createdAt: new Date("2024-01-15"),
  };

  const handleEditCampaign = (
    campaignData: Omit<Campaign, "id" | "createdAt">,
  ) => {
    // In real app, this would update the campaign via API
    toast.success("Campaign updated successfully");
    setIsModalOpen(false);
  };

  const handleCreateCampaign = (
    campaignData: Omit<Campaign, "id" | "createdAt">,
  ) => {
    // In real app, this would create a new campaign via API
    toast.success("New campaign created successfully");
    setIsModalOpen(false);
  };

  const handleToggleStatus = () => {
    const newStatus =
      campaign.status === "Deactivated" ? "Draft" : "Deactivated";
    toast.success(
      `Campaign ${newStatus === "Deactivated" ? "deactivated" : "reactivated"}`,
    );
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

  const openEditModal = () => {
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Campaign Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={campaign.logo} alt={campaign.name} />
            <AvatarFallback className="text-lg">
              {campaign.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {campaign.name}
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant={getStatusBadgeVariant(campaign.status)}>
                {campaign.status}
              </Badge>
              <div className="flex items-center text-muted-foreground">
                <Building2 className="w-4 h-4 mr-1" />
                {campaign.brandName}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Phone className="w-4 h-4 mr-1" />
                {campaign.phoneNumber}
              </div>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={openCreateModal} variant="outline" className="gap-2">
            <Plus className="w-4 h-4" />
            Create New Campaign
          </Button>
          <Button
            onClick={openEditModal}
            variant="outline"
            className="gap-2"
            disabled={campaign.status === "Prod"}
          >
            <Edit className="w-4 h-4" />
            {campaign.status === "Prod" ? "Edit (Production)" : "Edit Campaign"}
          </Button>
          <Button
            onClick={handleToggleStatus}
            variant={
              campaign.status === "Deactivated" ? "default" : "destructive"
            }
            className="gap-2"
          >
            {campaign.status === "Deactivated" ? (
              <>
                <Power className="w-4 h-4" />
                Reactivate
              </>
            ) : (
              <>
                <PowerOff className="w-4 h-4" />
                Deactivate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Campaign Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Campaign Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.status}</div>
            <p className="text-xs text-muted-foreground">
              Current stage of campaign
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
            <div className="text-2xl font-bold">
              {campaign.assignedNurses.length}
            </div>
            <p className="text-xs text-muted-foreground">Active team members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created Date</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {campaign.createdAt.toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground">Campaign launch</p>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nurse</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaign.assignedNurses.map((nurse) => (
                <TableRow key={nurse.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>
                          {nurse.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{nurse.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {nurse.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-muted-foreground">
                      Campaign Nurse
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Campaign Form Modal */}
    {/*  <CampaignFormModal*/}
    {/*    isOpen={isModalOpen}*/}
    {/*    onClose={() => setIsModalOpen(false)}*/}
    {/*    onSubmit={isEditing ? handleEditCampaign : handleCreateCampaign}*/}
    {/*    initialData={isEditing ? campaign : null}*/}
    {/*    isEditing={isEditing}*/}
    {/*  />*/}
    </div>
  );
};

export default CampaignDetailSection;
