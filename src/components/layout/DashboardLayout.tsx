import { ReactNode, useState, createContext, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/pages/Login";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: UserRole;
  userEmail: string;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

interface SidebarItem {
  icon: any;
  label: string;
  id: string;
  subItems?: { label: string; id: string }[];
}

const DashboardLayout = ({
  children,
  userRole,
  userEmail,
  activeSection = "brands",
  onSectionChange,
}: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState(activeSection);
  const [expandedItems, setExpandedItems] = useState<string[]>(["campaigns"]);
  const [campaigns, setCampaigns] = useState<{ label: string; id: string }[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);


  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const storedAuth = localStorage.getItem("user");
        if (!storedAuth) return;

        const { token, role } = JSON.parse(storedAuth);
        if (role !== "superAdmin" && role !== "admin") return;

        const res = await fetch("https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/get-all-campaigns", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
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

    fetchCampaigns();
  }, []);

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

  // const getSidebarItems = (): SidebarItem[] => {
  //   // Mock campaigns data - in real app this would come from API
  //   const campaigns = [
  //     { label: "Diabetes Awareness Campaign", id: "campaign-1" },
  //     { label: "Heart Health Initiative", id: "campaign-2" },
  //     { label: "Mental Wellness Week", id: "campaign-3" },
  //   ];
  //
  //   if (userRole === "superAdmin") {
  //     return [
  //       { icon: Building2, label: "Brands", id: "brands" },
  //       {
  //         icon: Megaphone,
  //         label: "Campaigns",
  //         id: "campaigns",
  //         subItems: campaigns,
  //       },
  //       { icon: Users, label: "Users", id: "users" },
  //     ];
  //   } else if (userRole === "admin") {
  //     // Mock assigned brands count - in real app this would come from API
  //     const assignedBrandsCount = 2; // This admin is assigned to 2 brands
  //
  //     return [
  //       {
  //         icon: Megaphone,
  //         label: "Campaigns",
  //         id: "campaigns",
  //         subItems: campaigns,
  //       },
  //       { icon: Users, label: "Nurses", id: "nurses" },
  //       {
  //         icon: Building2,
  //         label: `My Brands (${assignedBrandsCount})`,
  //         id: "admin-brands",
  //       },
  //     ];
  //   } else if (userRole === "nurse") {
  //     return [
  //       { icon: Megaphone, label: "My Campaigns", id: "assigned-campaigns" },
  //     ];
  //   }
  //   return [];
  // };
  const getSidebarItems = (): SidebarItem[] => {
    if (userRole === "superAdmin") {
      return [
        { icon: Building2, label: "Brands", id: "brands" },
        {
          icon: Megaphone,
          label: "Campaigns",
          id: "campaigns",
          subItems: loadingCampaigns
            ? [{ label: "Loading...", id: "loading" }]
            : campaigns,
        },
        { icon: Users, label: "Users", id: "users" },
      ];
    } else if (userRole === "admin") {
      const assignedBrandsCount = 2;
      return [
        {
          icon: Megaphone,
          label: "Campaigns",
          id: "campaigns",
          subItems: loadingCampaigns
            ? [{ label: "Loading...", id: "loading" }]
            : campaigns,
        },
        { icon: Users, label: "Nurses", id: "nurses" },
        {
          icon: Building2,
          label: `My Brands (${assignedBrandsCount})`,
          id: "admin-brands",
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
                        onClick={() => subItem.id !== "loading" && handleItemClick(subItem.id)}
                        disabled={subItem.id === "loading"}
                        className={cn(
                          "w-full flex items-center space-x-3 px-4 py-2 rounded-md text-left transition-colors text-sm",
                          subItem.id === "loading"
                            ? "opacity-50 cursor-not-allowed"
                            : activeItem === subItem.id
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                        )}
                      >
                        <Megaphone className="w-4 h-4 animate-spin" />
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
                {activeItem === "users" && "User Management"}
                {activeItem === "nurses" && "Nurse Management"}
                {activeItem === "assigned-campaigns" && "My Campaigns"}
                {activeItem === "admin-brands" && "My Assigned Brands"}
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
