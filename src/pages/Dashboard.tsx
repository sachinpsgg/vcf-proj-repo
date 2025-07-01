import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import BrandsSection from "@/components/dashboard/BrandsSection";
import CampaignsSection from "@/components/dashboard/CampaignsSection";
import CampaignDetailSection from "@/components/dashboard/CampaignDetailSection";
import UsersSection from "@/components/dashboard/UsersSection";
import NurseAssignedCampaigns from "@/components/nurse/NurseAssignedCampaigns";
import NurseCampaignDetail from "@/components/nurse/NurseCampaignDetail";
import AdminAssignedBrands from "@/components/admin/AdminAssignedBrands";
import type { UserRole } from "./Login";

interface User {
  email: string;
  role: UserRole;
  isAuthenticated: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState("brands");

  useEffect(() => {
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

    // Set default section based on user role
    if (parsedUser.role === "superAdmin") {
      setActiveSection("brands");
    } else if (parsedUser.role === "admin") {
      setActiveSection("campaigns");
    } else if (parsedUser.role === "nurse") {
      setActiveSection("assigned-campaigns");
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderContent = () => {
    // Handle individual campaign views
    if (activeSection.startsWith("campaign-")) {
      const handleBack = () => {
        if (user.role === "superAdmin") {
          setActiveSection("campaigns");
        } else if (user.role === "admin") {
          setActiveSection("campaigns");
        } else {
          setActiveSection("assigned-campaigns");
        }
      };

      return (
        <CampaignDetailSection
          campaignId={activeSection}
          userRole={user.role}
          onBack={handleBack}
        />
      );
    }

    // Handle nurse campaign detail views
    if (activeSection.startsWith("nurse-campaign-")) {
      const campaignId = parseInt(activeSection.replace("nurse-campaign-", ""));
      return <NurseCampaignDetail campaignId={campaignId} />;
    }

    switch (activeSection) {
      case "brands":
        // Only superAdmin can access brand management, others see campaigns
        if (user.role === "superAdmin") {
          return <BrandsSection />;
        } else if (user.role === "admin") {
          return (
            <CampaignsSection
              userRole={user.role}
              onNavigateToDetail={setActiveSection}
            />
          );
        } else {
          return <NurseAssignedCampaigns />;
        }
      case "campaigns":
        // SuperAdmin and Admin can access campaign management
        if (user.role === "superAdmin" || user.role === "admin") {
          return (
            <CampaignsSection
              userRole={user.role}
              onNavigateToDetail={setActiveSection}
            />
          );
        } else {
          return <NurseAssignedCampaigns />;
        }
      case "users":
        // Only superAdmin can manage all users, admin sees nurses
        if (user.role === "superAdmin") {
          return <UsersSection activeTab="users" userRole={user.role} />;
        } else if (user.role === "admin") {
          return <UsersSection activeTab="nurses" userRole={user.role} />;
        } else {
          return <NurseAssignedCampaigns />;
        }
      case "nurses":
        // Admin can manage nurses, others see their content
        if (user.role === "admin") {
          return <UsersSection activeTab="nurses" userRole={user.role} />;
        } else if (user.role === "superAdmin") {
          return <UsersSection activeTab="users" userRole={user.role} />;
        } else {
          return <NurseAssignedCampaigns />;
        }
      case "assigned-campaigns":
        // Nurse can view assigned campaigns
        return <NurseAssignedCampaigns />;

      case "admin-brands":
        // Admin can view assigned brands
        return <AdminAssignedBrands />;
      default:
        // Default view based on role
        if (user.role === "superAdmin") return <BrandsSection />;
        if (user.role === "admin")
          return (
            <CampaignsSection
              userRole={user.role}
              onNavigateToDetail={setActiveSection}
            />
          );
        if (user.role === "nurse") return <NurseAssignedCampaigns />;
        return <div>Welcome to Dashboard</div>;
    }
  };

  return (
    <DashboardLayout
      userRole={user.role}
      userEmail={user.email}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      hideDetailNavigation={activeSection.startsWith("campaign-")}
    >
      {renderContent()}
    </DashboardLayout>
  );
};

export default Dashboard;
