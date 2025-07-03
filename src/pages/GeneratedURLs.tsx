import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Link,
  Copy,
  Download,
  ExternalLink,
  Search,
  Filter,
  Calendar,
  Globe,
  User,
  FileText,
  Edit,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "./Login";

interface User {
  email: string;
  role: UserRole;
  isAuthenticated: boolean;
}

interface GeneratedURL {
  id: string;
  campaignId: string;
  campaignName: string;
  doctorPhone: string;
  doctorName: string;
  description: string;
  logo: string;
  patientUrl: string;
  vcfUrl: string;
  generatedAt: Date;
  isActive: boolean;
  generatedBy: string;
  brand: string;
}

// Mock data for demonstration
const mockGeneratedUrls: GeneratedURL[] = [
  {
    id: "1",
    campaignId: "1",
    campaignName: "Heart Health Campaign",
    doctorPhone: "+1 (555) 123-4567",
    doctorName: "Dr. Sarah Johnson",
    description: "Cardiology specialist at City Medical Center",
    logo: "",
    patientUrl: "https://medflow.app/patient/abc123",
    vcfUrl: "https://medflow.app/vcf/abc123",
    generatedAt: new Date("2024-01-15"),
    isActive: true,
    generatedBy: "Admin User",
    brand: "HealthTech Solutions",
  },
  {
    id: "2",
    campaignId: "2",
    campaignName: "Diabetes Care Initiative",
    doctorPhone: "+1 (555) 234-5678",
    doctorName: "Dr. Michael Chen",
    description: "Endocrinologist specializing in diabetes management",
    logo: "",
    patientUrl: "https://medflow.app/patient/def456",
    vcfUrl: "https://medflow.app/vcf/def456",
    generatedAt: new Date("2024-01-14"),
    isActive: true,
    generatedBy: "Nurse Manager",
    brand: "MedCare Plus",
  },
  {
    id: "3",
    campaignId: "1",
    campaignName: "Heart Health Campaign",
    doctorPhone: "+1 (555) 345-6789",
    doctorName: "Dr. Emily Rodriguez",
    description: "Cardiac surgeon with 15+ years experience",
    logo: "",
    patientUrl: "https://medflow.app/patient/ghi789",
    vcfUrl: "https://medflow.app/vcf/ghi789",
    generatedAt: new Date("2024-01-13"),
    isActive: false,
    generatedBy: "Nurse Sarah",
    brand: "HealthTech Solutions",
  },
];

const GeneratedURLs = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const campaignName = searchParams.get("campaignName");
  console.log(campaignId,campaignName)
  const [user, setUser] = useState<User | null>(null);
  const [generatedUrls, setGeneratedUrls] =
    useState<GeneratedURL[]>(mockGeneratedUrls);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>(
    campaignId || "all",
  );

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (!parsedUser.isAuthenticated) {
      navigate("/");
      return;
    }

    setUser(parsedUser);

    // Set campaign filter if coming from specific campaign
    if (campaignId) {
      setCampaignFilter(campaignId);
    }
  }, [campaignId, navigate]);

  // Filter URLs based on search term and filters
  const filteredUrls = generatedUrls.filter((url) => {
    const matchesSearch =
      url.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.campaignName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      url.doctorPhone.includes(searchTerm) ||
      url.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && url.isActive) ||
      (statusFilter === "inactive" && !url.isActive);

    // If accessed from specific campaign, only show URLs for that campaign
    const matchesCampaign = campaignId
      ? url.campaignId === campaignId
      : campaignFilter === "all" || url.campaignId === campaignFilter;

    return matchesSearch && matchesStatus && matchesCampaign;
  });

  // Get unique campaigns for filter dropdown (only needed when not viewing specific campaign)
  const uniqueCampaigns = campaignId
    ? []
    : Array.from(new Set(generatedUrls.map((url) => url.campaignName))).map(
        (name) => ({
          id:
            generatedUrls.find((url) => url.campaignName === name)
              ?.campaignId || "",
          name,
        }),
      );

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  const handleDownloadVCF = (url: GeneratedURL) => {
    // In a real app, this would download the actual VCF file
    toast.success("VCF card download started!");
  };

  const handleToggleStatus = (urlId: string) => {
    setGeneratedUrls((urls) =>
      urls.map((url) =>
        url.id === urlId ? { ...url, isActive: !url.isActive } : url,
      ),
    );
    toast.success("URL status updated!");
  };

  const getStatusStats = () => {
    // Use filtered URLs if viewing specific campaign, otherwise all URLs
    const urlsToCount = campaignId
      ? generatedUrls.filter((url) => url.campaignId === campaignId)
      : generatedUrls;

    const total = urlsToCount.length;
    const active = urlsToCount.filter((url) => url.isActive).length;
    const inactive = total - active;
    return { total, active, inactive };
  };

  const stats = getStatusStats();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderContent = () => (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="gap-2 hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {campaignName ? `Generated URLs - ${campaignName}` : "Generated URLs"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {campaignName
            ? `View and manage patient URLs for ${campaignName}`
            : "View and manage all generated contact cards across campaigns"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total URLs</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All generated URLs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active URLs</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive URLs</CardTitle>
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.inactive}
            </div>
            <p className="text-xs text-muted-foreground">Deactivated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VCF Cards</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Contact cards created
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`grid grid-cols-1 gap-4 ${campaignId ? "md:grid-cols-3" : "md:grid-cols-4"}`}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search doctors, campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!campaignId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Campaign</label>
                <Select
                  value={campaignFilter}
                  onValueChange={setCampaignFilter}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Campaigns</SelectItem>
                    {uniqueCampaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  if (!campaignId) {
                    setCampaignFilter("all");
                  }
                }}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* URLs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Generated URLs ({filteredUrls.length})</CardTitle>
          <CardDescription>
            Manage and track all patient URLs generated across campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor Info</TableHead>
                {!campaignId && <TableHead>Campaign</TableHead>}
                <TableHead>Patient URL</TableHead>
                <TableHead>Generated</TableHead>
                <TableHead>Generated By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUrls.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={campaignId ? 6 : 7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {searchTerm ||
                    statusFilter !== "all" ||
                    (campaignFilter !== "all" && !campaignId)
                      ? "No URLs match your filters"
                      : campaignId
                        ? `No URLs generated for ${campaignName || "this campaign"} yet`
                        : "No URLs generated yet"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredUrls.map((urlData) => (
                  <TableRow key={urlData.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {urlData.logo && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={urlData.logo}
                              alt={urlData.doctorName}
                            />
                            <AvatarFallback>
                              {urlData.doctorName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <div className="font-medium">
                            {urlData.doctorName}
                          </div>
                          <div className="text-sm text-muted-foreground font-mono">
                            {urlData.doctorPhone}
                          </div>
                          {urlData.description && (
                            <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                              {urlData.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    {!campaignId && (
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {urlData.campaignName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {urlData.brand}
                          </div>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]">
                          {urlData.patientUrl}
                        </code>
                        <Button
                          onClick={() => handleCopyUrl(urlData.patientUrl)}
                          size="sm"
                          variant="ghost"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-muted-foreground" />
                        {urlData.generatedAt.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1 text-muted-foreground" />
                        {urlData.generatedBy}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={urlData.isActive ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => handleToggleStatus(urlData.id)}
                        title="Click to toggle status"
                      >
                        {urlData.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          onClick={() => handleDownloadVCF(urlData)}
                          size="sm"
                          variant="outline"
                          title="Download VCF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() =>
                            window.open(urlData.patientUrl, "_blank")
                          }
                          size="sm"
                          variant="outline"
                          title="Open URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <DashboardLayout
      userRole={user.role}
      userEmail={user.email}
      activeSection="generated-urls"
      onSectionChange={() => {}}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default GeneratedURLs;
