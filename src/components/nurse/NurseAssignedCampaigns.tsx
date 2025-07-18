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
  Loader2,
  User,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { GenerateForm } from "@/components/GenerateForm.tsx";

interface NurseCampaignApiData {
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
const fetchNurseCampaigns = async (): Promise<NurseCampaignApiData[]> => {
  const storedAuth = localStorage.getItem("user");
  if (!storedAuth) throw new Error("User not authenticated");

  const { token } = JSON.parse(storedAuth);

  const response = await fetch(
    "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/nurse/get-nurse-campaigns",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch nurse campaigns");
  }

  const data = await response.json();
  console.log(data);
  return data.campaigns || [];
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

const NurseAssignedCampaigns = () => {
  const navigate = useNavigate();
  const [generatedUrls, setGeneratedUrls] = useState<GeneratedURL[]>([]);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [patientUrl, setPatientUrl] = useState("");
  const [showGenerateForm,setShowGenerateForm] = useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    useState<NurseCampaignApiData | null>(null);
  const [formData, setFormData] = useState<URLFormData>({
    phone_number: "",
    name: "",
    email: "",
  });

  // Fetch nurse campaigns
  const {
    data: campaigns,
    isLoading: campaignsLoading,
    error: campaignsError,
  } = useQuery({
    queryKey: ["nurse-campaigns"],
    queryFn: fetchNurseCampaigns,
    staleTime: 30000,
  });

  // Fetch brand data for the first campaign (assuming all campaigns are for the same brand)
  const { data: brand, isLoading: brandLoading } = useQuery({
    queryKey: ["nurse-brand", campaigns?.[0]?.brand_id],
    queryFn: () => fetchBrandById(campaigns![0].brand_id),
    enabled: !!campaigns?.[0]?.brand_id,
    staleTime: 30000,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, logo: file }));
  };

  const generateVCFContent = (
    data: URLFormData,
    campaign: NurseCampaignApiData,
    brand: BrandApiData,
  ) => {
    return `BEGIN:VCARD
VERSION:3.0
FN:${data.name}
TEL:${data.phone_number}
NOTE:${data.email}
ORG:${brand.brand_name}
TITLE:${campaign.campaign_name}
END:VCARD`;
  };

  const handleGenerateUrl = async () => {
    if (!formData.phone_number || !formData.name || !campaigns) return;
    console.log(selectedCampaign)
    const storedAuth = localStorage.getItem("user");
    if (!storedAuth) throw new Error("User not authenticated");

    const { token } = JSON.parse(storedAuth);

    try {
      const response = await fetch(
        `https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/vcf/generate?campaign_id=${selectedCampaign.campaign_id}`,
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
      const newUrl: GeneratedURL = {
        id: Date.now().toString(),
        campaignId: selectedCampaign.campaign_id,
        campaignName: selectedCampaign.campaign_name,
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
  useEffect(() => {
    const fetchGeneratedURLs = async () => {

      const storedAuth = localStorage.getItem("user");
      if (!storedAuth) throw new Error("User not authenticated");

      const { token } = JSON.parse(storedAuth);
      try {
        const response = await fetch(
          `https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/vcf`,
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
        console.log(formattedData)
      } catch (error) {
        console.error(error);
        toast.error("Unable to load generated URLs");
      }
    };

    fetchGeneratedURLs();
  }, []);
  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  const handleDownloadVCF = (url: GeneratedURL) => {
    const link = document.createElement("a");
    link.href = url.vcfUrl;
    link.download = `${url.name.replace(/\s+/g, "_")}_contact.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("VCF card downloaded!");
  };

  const openUrlModal = (campaign: NurseCampaignApiData) => {
    setSelectedCampaign(campaign);
    setShowGenerateForm(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === "active" ? "default" : "secondary";
  };

  if (campaignsLoading || brandLoading) {
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
      </div>
    );
  }

  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <span>No campaigns assigned</span>
      </div>
    );
  }

  return (
    <>
      {showGenerateForm ?
        <>
          <GenerateForm setShowForm={setShowGenerateForm} campaign={selectedCampaign} userRole="nurse"/>
        </> :
        <>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Campaigns</h1>
                <p className="text-muted-foreground mt-1">
                  View your assigned campaigns and generate patient URLs
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/generated-urls")}
                className="gap-2"
              >
                <Link className="w-4 h-4" />
                View Generated URLs
              </Button>
            </div>

            {/* Brand Information Card */}
            {brand && (
              <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={brand.logo_url} alt={brand.brand_name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {brand.brand_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-xl">{brand.brand_name}</CardTitle>
                      <CardDescription className="text-base">
                        {brand.description}
                      </CardDescription>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="default" className="gap-1">
                          <Building2 className="w-3 h-3" />
                          My Assigned Brand
                        </Badge>
                        <Badge
                          variant={
                            brand.brandStatus === "active" ? "default" : "secondary"
                          }
                        >
                          {brand.brandStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )}

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
                  <div className="text-2xl font-bold">{campaigns.length}</div>
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
                  <div className="text-lg font-bold">
                    {brand?.brand_name.slice(0, 10) || "Loading..."}
                  </div>
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
                      <TableHead className="hidden md:table-cell">Brand</TableHead>
                      <TableHead className="hidden md:table-cell">Status</TableHead>
                      <TableHead className="hidden md:table-cell">Duration</TableHead>
                      <TableHead className="hidden md:table-cell">Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.campaign_id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarImage
                                src={campaign.logo_url}
                                alt={campaign.campaign_name}
                              />
                              <AvatarFallback>
                                {campaign.campaign_name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{campaign.campaign_name}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {campaign.notes}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium hidden md:table-cell">
                          {brand?.brand_name}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={getStatusBadgeVariant(campaign.campaignStatus)}>
                            {campaign.campaignStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm">
                            {new Date(campaign.start_date).toLocaleDateString()} -{" "}
                            {new Date(campaign.end_date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.campaignStatus?.toLowerCase() !== "draft" &&
                            campaign.campaignStatus?.toLowerCase() !== "uat" && (
                              <Button
                                onClick={() => openUrlModal(campaign)}
                                size="sm"
                                className="gap-2"
                              >
                                Generate URL
                              </Button>
                            )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

              </CardContent>
            </Card>

            {/* Generated URLs Table */}
            {generatedUrls.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Generated Contact cards</CardTitle>
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
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {urlData.logo && (
                                <Avatar className="w-6 h-6">
                                  <AvatarImage
                                    src={urlData.logo}
                                    alt={urlData.name}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {urlData.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div>
                                <div className="font-medium text-sm">
                                  {urlData.name}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono">
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
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Generate URL Modal */}
            {/*<Dialog open={isUrlModalOpen} onOpenChange={setIsUrlModalOpen}>*/}
            {/*  <DialogContent className="max-w-md">*/}
            {/*    <DialogHeader>*/}
            {/*      <DialogTitle>Generate Patient URL</DialogTitle>*/}
            {/*      <DialogDescription>*/}
            {/*        Create a unique URL and VCF card for a patient*/}
            {/*      </DialogDescription>*/}
            {/*      {patientUrl && (*/}
            {/*        <div className="mt-2 p-2 bg-green-100 text-green-800 rounded text-sm break-all">*/}
            {/*          URL: <a href={patientUrl} target="_blank" rel="noopener noreferrer" className="underline">{patientUrl}</a>*/}
            {/*        </div>*/}
            {/*      )}*/}
            {/*    </DialogHeader>*/}
            {/*    <div className="space-y-4">*/}
            {/*      <div className="space-y-2">*/}
            {/*        <Label>Selected Campaign</Label>*/}
            {/*        <div className="p-3 bg-muted rounded-lg">*/}
            {/*          <div className="font-medium">*/}
            {/*            {selectedCampaign?.campaign_name}*/}
            {/*          </div>*/}
            {/*          <div className="text-sm text-muted-foreground">*/}
            {/*            {brand?.brand_name}*/}
            {/*          </div>*/}
            {/*        </div>*/}
            {/*      </div>*/}
            {/*      <div className="space-y-2">*/}
            {/*        <Label htmlFor="name">Doctor's Name</Label>*/}
            {/*        <div className="relative">*/}
            {/*          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />*/}
            {/*          <Input*/}
            {/*            id="name"*/}
            {/*            placeholder="Dr. John Smith"*/}
            {/*            value={formData.name}*/}
            {/*            onChange={(e) =>*/}
            {/*              setFormData((prev) => ({*/}
            {/*                ...prev,*/}
            {/*                name: e.target.value,*/}
            {/*              }))*/}
            {/*            }*/}
            {/*            className="pl-10"*/}
            {/*          />*/}
            {/*        </div>*/}
            {/*      </div>*/}
            {/*      <div className="space-y-2">*/}
            {/*        <Label htmlFor="phone_number">Doctor's Phone Number</Label>*/}
            {/*        <div className="relative">*/}
            {/*          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />*/}
            {/*          <Input*/}
            {/*            id="phone_number"*/}
            {/*            type="tel"*/}
            {/*            placeholder="+1 (555) 123-4567"*/}
            {/*            value={formData.phone_number}*/}
            {/*            onChange={(e) =>*/}
            {/*              setFormData((prev) => ({*/}
            {/*                ...prev,*/}
            {/*                phone_number: e.target.value,*/}
            {/*              }))*/}
            {/*            }*/}
            {/*            className="pl-10"*/}
            {/*          />*/}
            {/*        </div>*/}
            {/*      </div>*/}
            {/*      <div className="space-y-2">*/}
            {/*        <Label htmlFor="email">Email</Label>*/}
            {/*        <Input*/}
            {/*          id="email"*/}
            {/*          placeholder="Additional information about the doctor or clinic"*/}
            {/*          value={formData.email}*/}
            {/*          onChange={(e) =>*/}
            {/*            setFormData((prev) => ({*/}
            {/*              ...prev,*/}
            {/*              email: e.target.value,*/}
            {/*            }))*/}
            {/*          }*/}
            {/*        />*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*    <DialogFooter>*/}
            {/*      <Button*/}
            {/*        variant="outline"*/}
            {/*        onClick={() => {*/}
            {/*          setIsUrlModalOpen(false);*/}
            {/*          setSelectedCampaign(null);*/}
            {/*          setFormData({*/}
            {/*            phone_number: "",*/}
            {/*            name: "",*/}
            {/*            email: "",*/}
            {/*          });*/}
            {/*        }}*/}
            {/*      >*/}
            {/*        Cancel*/}
            {/*      </Button>*/}
            {/*      <Button*/}
            {/*        onClick={handleGenerateUrl}*/}
            {/*        disabled={!formData.phone_number || !formData.name}*/}
            {/*        className="gap-2"*/}
            {/*      >*/}
            {/*        <Link className="w-4 h-4" />*/}
            {/*        Generate URL*/}
            {/*      </Button>*/}
            {/*    </DialogFooter>*/}
            {/*  </DialogContent>*/}
            {/*</Dialog>*/}
          </div>
        </>
      }
    </>
  );
};

export default NurseAssignedCampaigns;
