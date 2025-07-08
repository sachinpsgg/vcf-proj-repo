import { useEffect, useState } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Megaphone,
  Calendar,
  Building2,
  Link,
  Phone,
  ExternalLink,
  Copy,
  Mail,
  Upload,
  Download,
  Edit,
  Loader2,
  FileText,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { GenerateForm } from "@/components/GenerateForm.tsx";

interface NurseCampaignDetailProps {
  campaignId: number;
}

interface CampaignApiData {
  campaign_id: number;
  brand_id: number;
  campaign_name: string;
  logo_url: string;
  campaignStatus: string;
  start_date: string;
  end_date: string;
  created_by: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

interface BrandApiData {
  brand_id: number;
  brand_name: string;
  logo_url: string;
  description: string;
  brandStatus: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

interface GeneratedURL {
  id: string;
  campaignId: string;
  campaignName: string;
  phone_number: string;
  name: string;
  email: string;
  patientUrl: string;
  vcfUrl: string;
  generatedAt: Date;
  isActive: boolean;
}

interface URLFormData {
  phone_number: string;
  name: string;
  email: string;
}

// Fetch functions
const fetchCampaignById = async (
  campaignId: number,
): Promise<CampaignApiData> => {
  const storedAuth = localStorage.getItem("user");
  if (!storedAuth) throw new Error("User not authenticated");

  const { token } = JSON.parse(storedAuth);

  const response = await fetch(
    `https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/campaign/getById?campaign_id=${campaignId}`,
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

const fetchBrandById = async (brandId: number): Promise<BrandApiData> => {
  const storedAuth = localStorage.getItem("user");
  if (!storedAuth) throw new Error("User not authenticated");

  const { token } = JSON.parse(storedAuth);

  const response = await fetch(
    `https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/brands/${brandId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch brand");
  }

  const data = await response.json();
  console.log(data);
  return data.brand;
};

const NurseCampaignDetail = ({ campaignId }: NurseCampaignDetailProps) => {
  const navigate = useNavigate();
  const [generatedUrls, setGeneratedUrls] = useState<GeneratedURL[]>([]);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [editingUrl, setEditingUrl] = useState<GeneratedURL | null>(null);
  const [patientUrl, setPatientUrl] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<URLFormData>({
    phone_number: "",
    name: "",
    email: "",
  });

  // Fetch campaign data
  const {
    data: campaign,
    isLoading: campaignLoading,
    error: campaignError,
  } = useQuery({
    queryKey: ["campaign", campaignId],
    queryFn: () => fetchCampaignById(campaignId),
    staleTime: 30000,
  });

  // Fetch brand data
  const { data: brand, isLoading: brandLoading } = useQuery({
    queryKey: ["brand", campaign?.brand_id],
    queryFn: () => fetchBrandById(campaign!.brand_id),
    enabled: !!campaign?.brand_id,
    staleTime: 30000,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, logo: file }));
  };

  useEffect(() => {
    const fetchGeneratedURLs = async () => {

      const storedAuth = localStorage.getItem("user");
      if (!storedAuth) throw new Error("User not authenticated");

      const { token } = JSON.parse(storedAuth);
      try {
        const response = await fetch(
          `https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/vcf?campaign_id=${campaignId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch generated URLs");
        const data = await response.json();

        const formattedData: GeneratedURL[] = data.data.map((item: any) => ({
          id: item.vcf_id.toString(),
          campaignId: item.campaign_id.toString(),
          campaignName: item.campaign_name,
          doctorPhone: item.doctor_phone_number,
          doctorName: `${item.creator_first_name} ${item.creator_last_name || ""}`.trim(),
          patientUrl: item.file_url,
          vcfUrl: item.file_url,
          generatedAt: new Date(item.generated_at),
          isActive: true,
          generatedBy: item.created_by,
        }));
        console.log(data)
        setGeneratedUrls(formattedData);
      } catch (error) {
        console.error(error);
        toast.error("Unable to load generated URLs");
      }
    };

    fetchGeneratedURLs();
  }, [campaignId]);
  const handleGenerateUrl = async () => {
    if (!formData.phone_number || !formData.name || !campaign) return;

    const storedAuth = localStorage.getItem("user");
    if (!storedAuth) throw new Error("User not authenticated");

    const { token } = JSON.parse(storedAuth);

    try {
      const response = await fetch(
        `https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/vcf/generate?campaign_id=${campaign.campaign_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: formData.name,
            phone_number: formData.phone_number,
            email: formData.email,
          }),
        }
      );

      if (!response.ok) {
        toast.error("Failed to generate VCF file");
        return;
      }

      const data = await response.json();
      setPatientUrl(data.file_url);
      console.log(data)
      const newUrl: GeneratedURL = {
        id: Date.now().toString(),
        campaignId: campaign.campaign_id.toString(),
        campaignName: campaign.campaign_name,
        phone_number: formData.phone_number,
        name: formData.name,
        email: formData.email,
        patientUrl: `https://medflow.app/patient/${Math.random().toString(36).substring(7)}`,
        vcfUrl: data.file_url,
        generatedAt: new Date(),
        isActive: true,
      };

      setGeneratedUrls([newUrl, ...generatedUrls]);
      toast.success("Patient URL generated successfully!");

    } catch (error) {
      console.error("Error generating VCF:", error);
      toast.error("An error occurred while generating the VCF file");
    }
  };
  const resetForm = () => {
    setFormData({
      phone_number: "",
      name: "",
      email: "",
    });
    setIsUrlModalOpen(false);
    setEditingUrl(null);
  };

  if (campaignLoading || brandLoading) {
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
        <span>Error loading campaign details</span>
      </div>
    );
  }

  return (
    <>
      {showForm?<>
        <GenerateForm setShowForm={setShowForm} campaign={campaign} userRole="Nurse"/>
        </>
        :
        <>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  {campaign.campaign_name}
                </h1>
                <p className="text-muted-foreground mt-1">
                  Campaign details and URL management
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate(
                      `/generated-urls?campaignId=${campaign.campaign_id}&campaignName=${encodeURIComponent(campaign.campaign_name)}`,
                    )
                  }
                  className="gap-2"
                >
                  <Link className="w-4 h-4" />
                  View Campaign URLs
                </Button>
                {campaign?.campaignStatus?.toLowerCase() !== "draft" &&
                  campaign?.campaignStatus?.toLowerCase() !== "uat" && (
                    <Button onClick={() => setShowForm(true)} className="gap-2">
                      Generate URL
                    </Button>
                    // <Button onClick={() => setIsUrlModalOpen(true)} className="gap-2">
                    //   <Link className="w-4 h-4" />
                    //   Generate URL
                    // </Button>
                  )}
              </div>
            </div>

            {/* Campaign Info Card */}
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage
                      src={campaign.logo_url}
                      alt={campaign.campaign_name}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {campaign.campaign_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <CardTitle className="text-xl">
                      {campaign.campaign_name}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {brand?.brand_name} • {campaign.notes}
                    </CardDescription>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge
                        variant={
                          campaign.campaignStatus === "active"
                            ? "default"
                            : "secondary"
                        }
                        className="gap-1"
                      >
                        <Building2 className="w-3 h-3" />
                        {campaign.campaignStatus}
                      </Badge>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(campaign.start_date).toLocaleDateString()} -{" "}
                        {new Date(campaign.end_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Generated URLs
                  </CardTitle>
                  <Link className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{generatedUrls.length}</div>
                  <p className="text-xs text-muted-foreground">Total generated</p>
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
                  <CardTitle className="text-sm font-medium">VCF Cards</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{generatedUrls.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Contact cards created
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Generated URLs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Contact cards</CardTitle>
                <CardDescription>
                  Track and manage URLs you've generated for this campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Doctor Info</TableHead>
                      <TableHead>Patient URL</TableHead>
                      <TableHead>Generated</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {generatedUrls.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No URLs generated yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      generatedUrls.map((urlData) => (
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
                              </div>
                            </div>
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
                            <Badge
                              variant={urlData.isActive ? "default" : "secondary"}
                            >
                              {urlData.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                onClick={() => handleEditUrl(urlData)}
                                size="sm"
                                variant="outline"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleDownloadVCF(urlData)}
                                size="sm"
                                variant="outline"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() =>
                                  window.open(urlData.patientUrl, "_blank")
                                }
                                size="sm"
                                variant="outline"
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

            {/* Generate URL Modal */}
            <Dialog open={isUrlModalOpen} onOpenChange={setIsUrlModalOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Generate Patient URL</DialogTitle>
                  <DialogDescription>
                    Create a unique URL and VCF card for a patient
                  </DialogDescription>
                  {patientUrl && (
                    <div className="mt-2 p-2 bg-green-100 text-green-800 rounded text-sm break-all">
                      URL: <a href={patientUrl} target="_blank" rel="noopener noreferrer" className="underline">{patientUrl}</a>
                    </div>
                  )}
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Campaign</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="font-medium">{campaign.campaign_name}</div>
                      {/*<div className="text-sm text-muted-foreground">*/}
                      {/*  Brand {campaign.campaign_id}*/}
                      {/*</div>*/}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Doctor's Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="name"
                        placeholder="Dr. John Smith"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorPhone">Doctor's Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        id="phone_number"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone_number}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            phone_number: e.target.value,
                          }))
                        }
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="Additional information about the doctor or clinic"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGenerateUrl}
                    disabled={!formData.phone_number || !formData.name}
                    className="gap-2"
                  >
                    <Link className="w-4 h-4" />
                    Generate URL
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
      </>
      }
    </>
  );
};

export default NurseCampaignDetail;
