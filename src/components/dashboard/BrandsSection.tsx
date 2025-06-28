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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  UserPlus,
  Building2,
  Loader2,
} from "lucide-react";
import BrandFormModal from "@/components/forms/BrandFormModal";
import AdminAssignmentModal from "@/components/forms/AdminAssignmentModal";
import { toast } from "sonner";

interface BrandApiData {
  brand_id: number;
  brand_name: string;
  logo_url: string;
  description: string;
  brandStatus: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  assigned_admins: Array<{
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
  }>;
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

interface Brand {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  createdAt: Date;
  assignedAdmins: Array<{
    user_id: number;
    email: string;
    first_name: string;
    last_name: string;
  }>;
}

// Fetch functions
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

const BrandsSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedBrandForAdmin, setSelectedBrandForAdmin] =
    useState<Brand | null>(null);

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

  // Fetch nurses data for counting
  const { data: nursesData, isLoading: nursesLoading } = useQuery({
    queryKey: ["nurses"],
    queryFn: fetchNurses,
    staleTime: 30000,
  });

  // Transform API data to component format
  const brands: Brand[] =
    brandsData?.map((b) => ({
      id: String(b.brand_id),
      name: b.brand_name,
      logo: b.logo_url,
      description: b.description,
      createdAt: new Date(b.created_at),
      assignedAdmins: b.assigned_admins,
    })) || [];

  // Calculate totals
  const totalAdmins = brands.reduce(
    (acc, brand) => acc + brand.assignedAdmins.length,
    0,
  );
  const totalNurses = nursesData?.length || 0;

  const handleCreateBrand = (brandData: Omit<Brand, "id" | "createdAt">) => {
    toast.success("Brand created successfully");
    refetchBrands();
  };

  const handleEditBrand = (
    id: string,
    brandData: Omit<Brand, "id" | "createdAt">,
  ) => {
    toast.success("Brand updated successfully");
    refetchBrands();
  };

  const handleDeleteBrand = (id: string) => {
    // TODO: Implement actual delete API call
    toast.success("Brand deleted successfully");
    refetchBrands();
  };

  const openEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
  };

  const openAdminModal = (brand: Brand) => {
    setSelectedBrandForAdmin(brand);
    setIsAdminModalOpen(true);
  };

  const closeAdminModal = () => {
    setIsAdminModalOpen(false);
    setSelectedBrandForAdmin(null);
  };

  const handleAdminAssignmentSuccess = () => {
    refetchBrands();
  };

  if (brandsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading brands...</span>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Brand Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage brands, assign administrators and nurses
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Brand
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Brands</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brands.length}</div>
            <p className="text-xs text-muted-foreground">
              Active brand accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {brandsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                totalAdmins
              )}
            </div>
            <p className="text-xs text-muted-foreground">Across all brands</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Nurses</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nursesLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                totalNurses
              )}
            </div>
            <p className="text-xs text-muted-foreground">Across all brands</p>
          </CardContent>
        </Card>
      </div>

      {/* Brands Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Brands</CardTitle>
          <CardDescription>
            View and manage all brand accounts and their assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Assigned Admins</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No brands found
                  </TableCell>
                </TableRow>
              ) : (
                brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={brand.logo} alt={brand.name} />
                          <AvatarFallback>
                            {brand.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{brand.name}</div>
                          {brand.description && (
                            <div className="text-sm text-muted-foreground">
                              {brand.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {brand.assignedAdmins.length > 0 ? (
                          brand.assignedAdmins.map((admin) => (
                            <Badge
                              key={admin.user_id}
                              variant="secondary"
                              className="text-xs"
                            >
                              {admin.first_name} {admin.last_name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No admins assigned
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {brand.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => openEditModal(brand)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openAdminModal(brand)}
                          >
                            <Users className="mr-2 h-4 w-4" />
                            Assign Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteBrand(brand.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Brand Form Modal */}
      <BrandFormModal
        key={editingBrand?.id || "new"}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={
          editingBrand
            ? (data) => handleEditBrand(editingBrand.id, data)
            : handleCreateBrand
        }
        initialData={editingBrand}
        isEditing={!!editingBrand}
      />

      {/* Admin Assignment Modal */}
      {selectedBrandForAdmin && (
        <AdminAssignmentModal
          isOpen={isAdminModalOpen}
          onClose={closeAdminModal}
          onSuccess={handleAdminAssignmentSuccess}
          brandId={Number(selectedBrandForAdmin.id)}
          brandName={selectedBrandForAdmin.name}
          currentAdmins={selectedBrandForAdmin.assignedAdmins}
        />
      )}
    </div>
  );
};

export default BrandsSection;
