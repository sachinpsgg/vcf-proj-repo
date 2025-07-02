import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Users,
  UserCheck,
  MoreHorizontal,
  Edit,
  Trash2,
  UserX,
  UserPlus as UserPlusIcon,
  Loader2,
} from "lucide-react";
import UserFormModal, {
  type User,
  type UserStatus,
} from "@/components/forms/UserFormModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UsersSectionProps {
  activeTab: string;
  userRole: "superAdmin" | "admin" | "nurse";
}

interface NurseApiData {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  userStatus: "active" | "inactive";
  created_by: number;
  created_at: string;
  updated_at: string;
  assigned_campaigns: Array<{
    campaign_id: number;
    campaign_name: string;
  }>;
  assigned_admins: Array<{
    user_id: number;
    first_name: string;
    last_name: string;
    email: string;
  }>;
}

interface AdminApiData {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  userStatus: "active" | "inactive";
  brand_name: string;
  brand_id: number;
  logo_url: string;
  created_at: string;
  updated_at: string;
}

// Fetch functions
const fetchNurses = async (): Promise<NurseApiData[]> => {
  const storedAuth = localStorage.getItem("user");
  if (!storedAuth) throw new Error("User not authenticated");

  const { token } = JSON.parse(storedAuth);

  const response = await fetch(
    "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/nurse/getAll",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch nurses");
  }

  const data = await response.json();
  return data.nurses || [];
};

const fetchAdmins = async (): Promise<AdminApiData[]> => {
  const storedAuth = localStorage.getItem("user");
  if (!storedAuth) throw new Error("User not authenticated");

  const { token } = JSON.parse(storedAuth);

  const response = await fetch(
    "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/get-all-admins",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch admins");
  }

  const data = await response.json();
  return data.admins || [];
};

// Transform API data to component format
const transformNurseData = (nurse: NurseApiData): User => ({
  id: nurse.user_id.toString(),
  firstName: nurse.first_name,
  lastName: nurse.last_name,
  email: nurse.email,
  password: "", // Not provided by API
  role: "nurse",
  status: nurse.userStatus === "active" ? "Active" : "Inactive",
  assignedBrands: [], // Using campaigns as proxy for brands
  createdAt: new Date(nurse.created_at),
});

const transformAdminData = (admin: AdminApiData): User => ({
  id: admin.user_id.toString(),
  firstName: admin.first_name,
  lastName: admin.last_name,
  email: admin.email,
  password: "", // Not provided by API
  role: "admin",
  status: admin.userStatus === "active" ? "Active" : "Inactive",
  assignedBrands: [{ id: admin.brand_id.toString(), name: admin.brand_name }],
  createdAt: new Date(admin.created_at),
});

const UsersSection = ({ activeTab, userRole }: UsersSectionProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalRole, setModalRole] = useState<"admin" | "nurse">("admin");

  // Fetch nurses data
  const {
    data: nursesData,
    isLoading: nursesLoading,
    error: nursesError,
    refetch: refetchNurses,
  } = useQuery({
    queryKey: ["nurses"],
    queryFn: fetchNurses,
    staleTime: 30000, // 30 seconds
  });

  // Fetch admins data
  const {
    data: adminsData,
    isLoading: adminsLoading,
    error: adminsError,
    refetch: refetchAdmins,
  } = useQuery({
    queryKey: ["admins"],
    queryFn: fetchAdmins,
    staleTime: 30000, // 30 seconds
    enabled: userRole === "superAdmin", // Only fetch if user can see admins
  });

  // Transform data
  const nurses = nursesData?.map(transformNurseData) || [];
  const admins = adminsData?.map(transformAdminData) || [];

  const handleCreateUser = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: "admin" | "nurse";
    brandId: number;
  }) => {
    try {
      const storedAuth = localStorage.getItem("user");
      if (!storedAuth) throw new Error("User not authenticated");

      const { token } = JSON.parse(storedAuth);

      const endpoint =
        userData.role === "admin"
          ? "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/create-admin"
          : "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/create-nurse";

      const requestBody = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        password: userData.password,
        brand_id: userData.brandId,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to create ${userData.role}`,
        );
      }

      toast.success(
        `${userData.role === "admin" ? "Administrator" : "Nurse"} created successfully`,
      );

      // Refetch data after creation
      if (userData.role === "admin") {
        refetchAdmins();
      } else {
        refetchNurses();
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : `Failed to create ${userData.role}`,
      );
    }
  };

  const handleEditUser = (
    id: string,
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: "admin" | "nurse";
      brandId: number;
    },
  ) => {
    // TODO: Implement API call to update user
    toast.success(
      `${userData.role === "admin" ? "Administrator" : "Nurse"} update requested. Please refresh to see changes.`,
    );

    // Refetch data after update
    if (userData.role === "admin") {
      refetchAdmins();
    } else {
      refetchNurses();
    }
  };

  const handleDeleteUser = (id: string, role: "admin" | "nurse") => {
    // TODO: Implement API call to delete user
    toast.success(
      `${role === "admin" ? "Administrator" : "Nurse"} deletion requested. Please refresh to see changes.`,
    );

    // Refetch data after deletion
    if (role === "admin") {
      refetchAdmins();
    } else {
      refetchNurses();
    }
  };

  const handleToggleStatus = (id: string, role: "admin" | "nurse") => {
    // TODO: Implement API call to toggle user status
    toast.success(
      "User status update requested. Please refresh to see changes.",
    );

    // Refetch data after status change
    if (role === "admin") {
      refetchAdmins();
    } else {
      refetchNurses();
    }
  };

  const openCreateModal = (role: "admin" | "nurse") => {
    setEditingUser(null);
    setModalRole(role);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setModalRole(user.role as "admin" | "nurse");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const activeAdmins = admins.filter(
    (admin) => admin.status === "Active",
  ).length;
  const activeNurses = nurses.filter(
    (nurse) => nurse.status === "Active",
  ).length;

  const renderUserTable = (users: User[], userType: "admin" | "nurse") => {
    const isLoading = userType === "admin" ? adminsLoading : nursesLoading;
    const error = userType === "admin" ? adminsError : nursesError;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading {userType}s...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center py-8 text-red-500">
          <span>
            Error loading {userType}s: {error.message}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="ml-2"
            onClick={() =>
              userType === "admin" ? refetchAdmins() : refetchNurses()
            }
          >
            Retry
          </Button>
        </div>
      );
    }

    if (users.length === 0) {
      return (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <span>No {userType}s found</span>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {/* Table Header */}
        <div className="flex items-center justify-between px-4 py-2 text-sm font-medium text-muted-foreground border-b">
          <div className="flex items-center space-x-4 min-w-0 flex-1">
            <div className="min-w-0 flex-1">User Name</div>
          </div>
          <div className="hidden sm:block text-center min-w-[80px]">Brands</div>
          <div className="hidden md:block text-center min-w-[80px]">
            Active Since
          </div>
          <div className="flex items-center justify-center min-w-[60px]">
            Role
          </div>
          <div className="flex items-center justify-center min-w-[80px]">
            Priority
          </div>
          <div className="min-w-[100px] flex justify-center">Status</div>
          <div className="flex items-center justify-center min-w-[40px] ml-2">
            Actions
          </div>
        </div>

        {/* User Rows */}
        {users.map((user, index) => (
          <div
            key={user.id}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors",
              index % 2 === 0 ? "bg-muted/20" : "bg-background",
            )}
          >
            {/* User Info */}
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <Avatar className="w-10 h-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground truncate">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Experience/Workload */}
            <div className="hidden sm:block text-center min-w-[80px]">
              <div className="text-sm font-medium text-foreground">
                {user.assignedBrands.length}
              </div>
              <div className="text-xs text-muted-foreground">Brands</div>
            </div>

            {/* Active Since */}
            <div className="hidden md:block text-center min-w-[80px]">
              <div className="text-sm font-medium text-foreground">
                {Math.floor(
                  (new Date().getTime() - user.createdAt.getTime()) /
                    (1000 * 60 * 60 * 24),
                )}
                d
              </div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>

            {/* Assignee (Profile) */}
            <div className="flex items-center justify-center min-w-[60px]">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-muted text-xs">
                  {userType === "admin" ? "AD" : "RN"}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Priority */}
            <div className="flex items-center justify-center min-w-[80px]">
              <div className="flex items-center space-x-1">
                <div
                  className={cn(
                    "w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent",
                    user.status === "Active"
                      ? "border-b-green-500"
                      : "border-b-yellow-500",
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    user.status === "Active"
                      ? "text-green-600"
                      : "text-yellow-600",
                  )}
                >
                  {user.status === "Active" ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Status */}
            <div className="min-w-[100px] flex justify-center">
              <Badge
                variant={user.status === "Active" ? "default" : "secondary"}
                className="text-xs px-3 py-1"
              >
                {user.status === "Active" ? "Active" : "Inactive"}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center min-w-[40px] ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEditModal(user)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleDeleteUser(user.id, userType)}
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Revoke Access
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage administrators and nurses across all brands
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Administrators
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {adminsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                activeAdmins
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Active admin accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nurses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nursesLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                activeNurses
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Active nurse accounts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Management Tabs */}
      <Tabs defaultValue={activeTab === "users" ? "admins" : activeTab}>
        <TabsList>
          {userRole === "superAdmin" && (
            <TabsTrigger value="admins">Administrators</TabsTrigger>
          )}
          <TabsTrigger value="nurses">Nurses</TabsTrigger>
        </TabsList>

        {userRole === "superAdmin" && (
          <TabsContent value="admins" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Administrators</CardTitle>
                    <CardDescription>
                      Manage administrator accounts and their brand assignments
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => openCreateModal("admin")}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Administrator
                  </Button>
                </div>
              </CardHeader>
              <CardContent>{renderUserTable(admins, "admin")}</CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="nurses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Nurses</CardTitle>
                  <CardDescription>
                    Manage nurse accounts and their campaign assignments
                  </CardDescription>
                </div>
                <Button
                  onClick={() => openCreateModal("nurse")}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Nurse
                </Button>
              </div>
            </CardHeader>
            <CardContent>{renderUserTable(nurses, "nurse")}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={
          editingUser
            ? (data) => handleEditUser(editingUser.id, data)
            : handleCreateUser
        }
        initialData={editingUser}
        isEditing={!!editingUser}
        defaultRole={modalRole}
      />
    </div>
  );
};

export default UsersSection;
