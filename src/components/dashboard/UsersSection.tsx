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

const UsersSection = ({ activeTab, userRole }: UsersSectionProps) => {
  const [admins, setAdmins] = useState<User[]>([
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@healthtech.com",
      password: "password123",
      role: "admin",
      status: "Active",
      assignedBrands: [{ id: "1", name: "HealthTech Solutions" }],
      createdAt: new Date("2024-01-15"),
    },
    {
      id: "2",
      firstName: "Jane",
      lastName: "Smith",
      email: "jane@medcare.com",
      password: "password123",
      role: "admin",
      status: "Active",
      assignedBrands: [{ id: "2", name: "MedCare Plus" }],
      createdAt: new Date("2024-02-20"),
    },
  ]);

  const [nurses, setNurses] = useState<User[]>([
    {
      id: "1",
      firstName: "Sarah",
      lastName: "Wilson",
      email: "sarah@healthtech.com",
      password: "password123",
      role: "nurse",
      status: "Active",
      assignedBrands: [{ id: "1", name: "HealthTech Solutions" }],
      createdAt: new Date("2024-01-20"),
    },
    {
      id: "2",
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike@healthtech.com",
      password: "password123",
      role: "nurse",
      status: "Active",
      assignedBrands: [{ id: "1", name: "HealthTech Solutions" }],
      createdAt: new Date("2024-02-15"),
    },
    {
      id: "3",
      firstName: "Emma",
      lastName: "Davis",
      email: "emma@medcareplus.com",
      password: "password123",
      role: "nurse",
      status: "Inactive",
      assignedBrands: [{ id: "2", name: "MedCare Plus" }],
      createdAt: new Date("2024-03-01"),
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalRole, setModalRole] = useState<"admin" | "nurse">("admin");

  const handleCreateUser = (userData: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    if (userData.role === "admin") {
      setAdmins([...admins, newUser]);
    } else {
      setNurses([...nurses, newUser]);
    }

    toast.success(
      `${userData.role === "admin" ? "Administrator" : "Nurse"} created successfully`,
    );
  };

  const handleEditUser = (
    id: string,
    userData: Omit<User, "id" | "createdAt">,
  ) => {
    if (userData.role === "admin") {
      setAdmins(
        admins.map((user) =>
          user.id === id ? { ...user, ...userData } : user,
        ),
      );
    } else {
      setNurses(
        nurses.map((user) =>
          user.id === id ? { ...user, ...userData } : user,
        ),
      );
    }

    toast.success(
      `${userData.role === "admin" ? "Administrator" : "Nurse"} updated successfully`,
    );
  };

  const handleDeleteUser = (id: string, role: "admin" | "nurse") => {
    if (role === "admin") {
      setAdmins(admins.filter((user) => user.id !== id));
    } else {
      setNurses(nurses.filter((user) => user.id !== id));
    }

    toast.success(
      `${role === "admin" ? "Administrator" : "Nurse"} deleted successfully`,
    );
  };

  const handleToggleStatus = (id: string, role: "admin" | "nurse") => {
    const updateStatus = (user: User) => {
      if (user.id === id) {
        return {
          ...user,
          status: (user.status === "Active"
            ? "Inactive"
            : "Active") as UserStatus,
        };
      }
      return user;
    };

    if (role === "admin") {
      setAdmins(admins.map(updateStatus));
    } else {
      setNurses(nurses.map(updateStatus));
    }

    toast.success("User status updated successfully");
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

  const getStatusBadgeVariant = (status: UserStatus) => {
    return status === "Active" ? "default" : "secondary";
  };

  const activeAdmins = admins.filter(
    (admin) => admin.status === "Active",
  ).length;
  const activeNurses = nurses.filter(
    (nurse) => nurse.status === "Active",
  ).length;

  const renderUserTable = (users: User[], userType: "admin" | "nurse") => (
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
                  onClick={() => handleToggleStatus(user.id, userType)}
                >
                  {user.status === "Active" ? (
                    <>
                      <UserX className="mr-2 h-4 w-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserPlusIcon className="mr-2 h-4 w-4" />
                      Activate
                    </>
                  )}
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
            <div className="text-2xl font-bold">{activeAdmins}</div>
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
            <div className="text-2xl font-bold">{activeNurses}</div>
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
