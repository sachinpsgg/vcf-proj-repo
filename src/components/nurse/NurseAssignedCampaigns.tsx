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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Megaphone,
  Calendar,
  Building2,
  Link,
  Phone,
  ExternalLink,
  Copy,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

interface AssignedCampaign {
  id: string;
  name: string;
  logo?: string;
  brandName: string;
  status: "Prod" | "UAT";
  phoneNumber: string;
  notes: string;
  assignedDate: Date;
}

interface GeneratedURL {
  id: string;
  campaignId: string;
  campaignName: string;
  doctorPhone: string;
  patientUrl: string;
  generatedAt: Date;
  isActive: boolean;
}

const NurseAssignedCampaigns = () => {
  const [assignedCampaigns] = useState<AssignedCampaign[]>([
    {
      id: "1",
      name: "Diabetes Awareness Campaign",
      logo: "/api/placeholder/40/40",
      brandName: "HealthTech Solutions",
      status: "Prod",
      phoneNumber: "+1 (555) 123-4567",
      notes: "Annual diabetes awareness and prevention campaign",
      assignedDate: new Date("2024-01-15"),
    },
    {
      id: "2",
      name: "Heart Health Initiative",
      brandName: "MedCare Plus",
      status: "UAT",
      phoneNumber: "+1 (555) 987-6543",
      notes: "Cardiovascular health education and screening program",
      assignedDate: new Date("2024-02-20"),
    },
  ]);

  const [generatedUrls, setGeneratedUrls] = useState<GeneratedURL[]>([
    {
      id: "1",
      campaignId: "1",
      campaignName: "Diabetes Awareness Campaign",
      doctorPhone: "+1 (555) 123-9999",
      patientUrl: "https://medflow.app/patient/abc123xyz",
      generatedAt: new Date("2024-03-01"),
      isActive: true,
    },
    {
      id: "2",
      campaignId: "1",
      campaignName: "Diabetes Awareness Campaign",
      doctorPhone: "+1 (555) 456-7890",
      patientUrl: "https://medflow.app/patient/def456uvw",
      generatedAt: new Date("2024-03-05"),
      isActive: true,
    },
  ]);

  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    useState<AssignedCampaign | null>(null);
  const [doctorPhone, setDoctorPhone] = useState("");

  const handleGenerateUrl = () => {
    if (!selectedCampaign || !doctorPhone) return;

    const newUrl: GeneratedURL = {
      id: Date.now().toString(),
      campaignId: selectedCampaign.id,
      campaignName: selectedCampaign.name,
      doctorPhone,
      patientUrl: `https://medflow.app/patient/${Math.random().toString(36).substring(7)}`,
      generatedAt: new Date(),
      isActive: true,
    };

    setGeneratedUrls([newUrl, ...generatedUrls]);
    setDoctorPhone("");
    setIsUrlModalOpen(false);
    setSelectedCampaign(null);
    toast.success("Patient URL generated successfully!");
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  const openUrlModal = (campaign: AssignedCampaign) => {
    setSelectedCampaign(campaign);
    setIsUrlModalOpen(true);
  };

  const getStatusBadgeVariant = (status: "Prod" | "UAT") => {
    return status === "Prod" ? "default" : "secondary";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            View your assigned campaigns and generate patient URLs
          </p>
        </div>
      </div>

      {/* Brand Information Card */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage
                src="/api/placeholder/64/64"
                alt="HealthTech Solutions"
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                HT
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-xl">HealthTech Solutions</CardTitle>
              <CardDescription className="text-base">
                Leading healthcare technology company focused on innovative
                medical solutions
              </CardDescription>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="default" className="gap-1">
                  <Building2 className="w-3 h-3" />
                  My Assigned Brand
                </Badge>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-1" />
                  +1 (555) 123-4567
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 mr-1" />
                  contact@healthtech.com
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Campaigns
            </CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedCampaigns.length}</div>
            <p className="text-xs text-muted-foreground">Active campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Generated URLs
            </CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generatedUrls.length}</div>
            <p className="text-xs text-muted-foreground">
              Patient URLs created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active URLs</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {generatedUrls.filter((url) => url.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Brand</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">HealthTech</div>
            <p className="text-xs text-muted-foreground">Assigned brand</p>
          </CardContent>
        </Card>
      </div>

      {/* Assigned Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Campaigns</CardTitle>
          <CardDescription>
            Campaigns assigned to you by administrators
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
                <TableHead>Assigned Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignedCampaigns.map((campaign) => (
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
                    {campaign.assignedDate.toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => openUrlModal(campaign)}
                      size="sm"
                      className="gap-2"
                      disabled={campaign.status !== "Prod"}
                    >
                      <Link className="w-4 h-4" />
                      Generate URL
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Generated URLs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Patient URLs</CardTitle>
          <CardDescription>
            Track and manage URLs you've generated for patients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Doctor Phone</TableHead>
                <TableHead>Patient URL</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {generatedUrls.map((urlData) => (
                <TableRow key={urlData.id}>
                  <TableCell className="font-medium">
                    {urlData.campaignName}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {urlData.doctorPhone}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                        {urlData.patientUrl}
                      </code>
                      <Button
                        onClick={() => handleCopyUrl(urlData.patientUrl)}
                        size="sm"
                        variant="ghost"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {urlData.generatedAt.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant={urlData.isActive ? "default" : "secondary"}>
                      {urlData.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      onClick={() => window.open(urlData.patientUrl, "_blank")}
                      size="sm"
                      variant="outline"
                      className="gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Generate URL Modal */}
      <Dialog open={isUrlModalOpen} onOpenChange={setIsUrlModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Patient URL</DialogTitle>
            <DialogDescription>
              Create a unique URL for a patient for the selected campaign
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Selected Campaign</Label>
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">{selectedCampaign?.name}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedCampaign?.brandName}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doctorPhone">Doctor's Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="doctorPhone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={doctorPhone}
                  onChange={(e) => setDoctorPhone(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUrlModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleGenerateUrl}
              disabled={!doctorPhone}
              className="gap-2"
            >
              <Link className="w-4 h-4" />
              Generate URL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NurseAssignedCampaigns;
