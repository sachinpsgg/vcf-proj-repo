import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Calendar,
  Users,
  Megaphone,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";

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

interface AssignedBrand {
  id: string;
  name: string;
  logo?: string;
  description: string;
  contactEmail: string;
  contactPhone: string;
  assignedDate: Date;
  totalCampaigns: number;
  activeCampaigns: number;
  assignedNurses: number;
}

// Fetch function for brands (same as BrandsSection)
const fetchBrands = async (): Promise<BrandApiData[]> => {
  const storedAuth = localStorage.getItem("user");
  if (!storedAuth) throw new Error("User not authenticated");

  const { token } = JSON.parse(storedAuth);

  const response = await fetch(
    "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/get-all-brands",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch brands");
  }

  const data = await response.json();
  return data.brands || [];
};

const AdminAssignedBrands = () => {
  // Fetch brands data
  const {
    data: brandsData,
    isLoading: brandsLoading,
    error: brandsError,
    refetch: refetchBrands,
  } = useQuery({
    queryKey: ["brands"],
    queryFn: fetchBrands,
    staleTime: 30000,
  });

  // Transform all brands data without filtering
  const assignedBrands: AssignedBrand[] =
    brandsData?.map((b) => ({
      id: String(b.brand_id),
      name: b.brand_name,
      logo: b.logo_url,
      description: b.description,
      contactEmail:
        "contact@" + b.brand_name.toLowerCase().replace(/\s+/g, "") + ".com",
      contactPhone: "+1 (555) 123-4567", // Default phone since not in API
      assignedDate: new Date(b.created_at),
      totalCampaigns: 0, // TODO: Get from campaigns API
      activeCampaigns: 0, // TODO: Get from campaigns API
      assignedNurses: 0, // TODO: Get from nurses API
    })) || [];

  if (brandsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading assigned brands...</span>
      </div>
    );
  }

  if (brandsError) {
    return (
      <div className="flex items-center justify-center py-8 text-red-500">
        <span>Error loading brands: {brandsError.message}</span>
        <Button
          variant="outline"
          size="sm"
          className="ml-2"
          onClick={() => refetchBrands()}
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
            My Assigned Brands
          </h1>
          <p className="text-muted-foreground mt-1">
            Brands you are assigned to manage as an administrator
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Assigned Brands
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assignedBrands.length}</div>
            <p className="text-xs text-muted-foreground">Total brands</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Campaigns
            </CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedBrands.reduce(
                (acc, brand) => acc + brand.totalCampaigns,
                0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">All campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <Megaphone className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedBrands.reduce(
                (acc, brand) => acc + brand.activeCampaigns,
                0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Nurses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedBrands.reduce(
                (acc, brand) => acc + brand.assignedNurses,
                0,
              )}
            </div>
            <p className="text-xs text-muted-foreground">Across all brands</p>
          </CardContent>
        </Card>
      </div>

      {/* Brands List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignedBrands.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                  No Assigned Brands
                </h3>
                <p className="text-sm text-muted-foreground">
                  You haven't been assigned to any brands yet. Contact your
                  super admin for brand assignments.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          assignedBrands.map((brand) => (
            <Card key={brand.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={brand.logo} alt={brand.name} />
                    <AvatarFallback className="text-lg">
                      {brand.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-xl truncate">
                      {brand.name}
                    </CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {brand.description}
                    </CardDescription>
                    <div className="flex items-center space-x-2 mt-3">
                      <Badge variant="outline" className="gap-1">
                        <Calendar className="w-3 h-3" />
                        {brand.assignedDate.toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {brand.totalCampaigns}
                    </div>
                    <div className="text-xs text-blue-600">Total Campaigns</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {brand.activeCampaigns}
                    </div>
                    <div className="text-xs text-green-600">Active</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-muted-foreground">
                        Email
                      </div>
                      <div className="text-sm font-mono truncate">
                        {brand.contactEmail}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-muted-foreground">
                        Phone
                      </div>
                      <div className="text-sm font-mono">
                        {brand.contactPhone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-muted-foreground">
                        Team
                      </div>
                      <div className="text-sm">
                        {brand.assignedNurses} nurses assigned
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Administrator Guidelines</CardTitle>
          <CardDescription>
            Important guidelines for managing your assigned brands
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Campaign Management
                </h4>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>
                    • You can create and manage campaigns for your assigned
                    brands
                  </li>
                  <li>
                    • Production campaigns cannot be edited once published
                  </li>
                  <li>
                    • Ensure all campaign details are accurate before publishing
                  </li>
                </ul>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">
                  Team Management
                </h4>
                <ul className="text-green-800 text-sm space-y-1">
                  <li>• You can create and manage nurses for your brands</li>
                  <li>• Assign nurses to appropriate campaigns</li>
                  <li>• Monitor nurse performance and provide support</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAssignedBrands;
