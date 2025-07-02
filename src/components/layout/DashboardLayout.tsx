import {
  ReactNode,
  useState,
  createContext,
  useContext,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Users,
  Megaphone,
  LogOut,
  Menu,
  X,
  Shield,
  UserPlus,
  Settings,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  Home,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/pages/Login";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: UserRole;
  userEmail: string;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  hideDetailNavigation?: boolean;
}

interface SidebarItem {
  icon: any;
  label: string;
  id: string;
  subItems?: { label: string; id: string }[];
}

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

// Fetch functions for nurse data
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
  return data.brand;
};

const DashboardLayout = ({
  children,
  userRole,
  userEmail,
  activeSection = "brands",
  onSectionChange,
  hideDetailNavigation = false,
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState(activeSection);
  const [expandedItems, setExpandedItems] = useState<string[]>(["campaigns"]);
  const [campaigns, setCampaigns] = useState<{ label: string; id: string }[]>(
    [],
  );
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // Fetch nurse campaigns if user is a nurse
  const {
    data: nurseCampaigns,
    isLoading: nurseCampaignsLoading,
    error: nurseCampaignsError,
  } = useQuery({
    queryKey: ["nurse-campaigns"],
    queryFn: fetchNurseCampaigns,
    enabled: userRole === "nurse",
    staleTime: 30000,
  });

  // Fetch brand data for nurse campaigns
  const { data: nurseBrand, isLoading: nurseBrandLoading } = useQuery({
    queryKey: ["nurse-brand", nurseCampaigns?.[0]?.brand_id],
    queryFn: () => fetchBrandById(nurseCampaigns![0].brand_id),
    enabled: userRole === "nurse" && !!nurseCampaigns?.[0]?.brand_id,
    staleTime: 30000,
  });

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const storedAuth = localStorage.getItem("user");
        if (!storedAuth) return;

        const { token, role } = JSON.parse(storedAuth);
        if (role !== "superAdmin" && role !== "admin") return;

        const res = await fetch(
          "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/get-all-campaigns",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();
        console.log(data);
        const mappedCampaigns = data.campaigns.map((c: any) => ({
          label: c.campaign_name,
          id: `campaign-${c.campaign_id}`,
        }));

        setCampaigns(mappedCampaigns);
      } catch (err) {
        console.error("Error fetching campaigns:", err);
      } finally {
        setLoadingCampaigns(false);
      }
    };

    if (userRole !== "nurse") {
      fetchCampaigns();
    } else {
      setLoadingCampaigns(false);
    }
  }, [userRole]);

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    onSectionChange?.(itemId);
  };

  const handleBackToMain = () => {
    if (userRole === "superAdmin") {
      handleItemClick("brands");
    } else if (userRole === "admin") {
      handleItemClick("campaigns");
    } else if (userRole === "nurse") {
      handleItemClick("assigned-campaigns");
    }
  };

  const isOnDetailPage = activeItem.startsWith("campaign-");
  const shouldShowBackButton = isOnDetailPage;

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const getSidebarItems = (): SidebarItem[] => {
    if (userRole === "superAdmin") {
      return [
        { icon: Building2, label: "Brands", id: "brands" },
        {
          icon: Megaphone,
          label: "Campaigns",
          id: "campaigns",
          subItems: hideDetailNavigation
            ? undefined
            : loadingCampaigns
              ? [{ label: "Loading...", id: "loading" }]
              : campaigns,
        },
        { icon: Users, label: "Users", id: "users" },
      ];
    } else if (userRole === "admin") {
      const assignedBrandsCount = 2;
      return [
        {
          icon: Building2,
          label: `My Brands`,
          id: "admin-brands",
        },
        {
          icon: Megaphone,
          label: "Campaigns",
          id: "campaigns",
          subItems: hideDetailNavigation
            ? undefined
            : loadingCampaigns
              ? [{ label: "Loading...", id: "loading" }]
              : campaigns,
        },
        { icon: Users, label: "Nurses", id: "nurses" },
      ];
    } else if (userRole === "nurse") {
      // For nurse, hide campaign subitems when viewing details
      if (hideDetailNavigation) {
        return [
          {
            icon: Building2,
            label: nurseBrand?.brand_name || "My Brand",
            id: "nurse-brand",
          },
        ];
      }

      // Normal nurse sidebar with brand and campaigns
      const nurseCampaignItems =
        nurseCampaigns?.map((campaign) => ({
          label: campaign.campaign_name,
          id: `nurse-campaign-${campaign.campaign_id}`,
        })) || [];

      return [
        {
          icon: Building2,
          label: nurseBrand?.brand_name || "My Brand",
          id: "nurse-brand",
          subItems: nurseCampaignsLoading
            ? [{ label: "Loading campaigns...", id: "loading" }]
            : nurseCampaignItems.length > 0
              ? nurseCampaignItems
              : [{ label: "No campaigns assigned", id: "no-campaigns" }],
        },
      ];
    }
    return [];
  };

  const sidebarItems = getSidebarItems();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar transform transition-transform duration-300 ease-in-out",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-sidebar-foreground">
                  MedFlow
                </h1>
                <p className="text-xs text-sidebar-foreground/60 capitalize">
                  {userRole} Panel
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {/* Back Button */}
            {shouldShowBackButton && (
              <button
                onClick={handleBackToMain}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground mb-4 border border-sidebar-border"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back to Dashboard</span>
              </button>
            )}

            {/* Show loading for nurse while data is being fetched */}
            {userRole === "nurse" &&
              (nurseCampaignsLoading || nurseBrandLoading) && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2 text-sm text-sidebar-foreground">
                    Loading...
                  </span>
                </div>
              )}

            {/* Show error state for nurse */}
            {userRole === "nurse" && nurseCampaignsError && (
              <div className="px-4 py-3 text-sm text-red-500">
                Error loading campaigns
              </div>
            )}

            {sidebarItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.subItems) {
                      toggleExpanded(item.id);
                    } else {
                      handleItemClick(item.id);
                    }
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors",
                    activeItem === item.id && !item.subItems
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.subItems &&
                    (expandedItems.includes(item.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    ))}
                </button>

                {item.subItems && expandedItems.includes(item.id) && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.id}
                        onClick={() =>
                          subItem.id !== "loading" &&
                          subItem.id !== "no-campaigns" &&
                          handleItemClick(subItem.id)
                        }
                        disabled={
                          subItem.id === "loading" ||
                          subItem.id === "no-campaigns"
                        }
                        className={cn(
                          "w-full flex items-center space-x-3 px-4 py-2 rounded-md text-left transition-colors text-sm",
                          subItem.id === "loading" ||
                            subItem.id === "no-campaigns"
                            ? "opacity-50 cursor-not-allowed"
                            : activeItem === subItem.id
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <Megaphone
                          className={cn(
                            "w-4 h-4",
                            subItem.id === "loading" && "animate-spin",
                          )}
                        />
                        <span>{subItem.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 h-auto text-sidebar-foreground hover:bg-sidebar-accent"
                >
                  <Avatar className="w-8 h-8 mr-3">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {userEmail.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium truncate">{userEmail}</p>
                    <p className="text-xs text-sidebar-foreground/60 capitalize">
                      {userRole}
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-72" : "ml-0",
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>

            <div className="hidden lg:block">
              <h2 className="text-2xl font-semibold text-foreground capitalize">
                {activeItem === "brands" && "Brand Management"}
                {activeItem === "campaigns" && "Campaign Management"}
                {activeItem.startsWith("campaign-") && "Campaign Details"}
                {activeItem.startsWith("nurse-campaign-") && "Campaign Details"}
                {activeItem === "users" && "User Management"}
                {activeItem === "nurses" && "Nurse Management"}
                {activeItem === "assigned-campaigns" && "My Campaigns"}
                {activeItem === "admin-brands" && "My Assigned Brands"}
                {activeItem === "nurse-brand" &&
                  (nurseBrand?.brand_name || "My Brand")}
              </h2>
            </div>

            <div className="flex items-center space-x-4">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {userEmail.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
