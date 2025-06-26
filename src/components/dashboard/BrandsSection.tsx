import { useEffect, useState } from "react";
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
} from "lucide-react";
import BrandFormModal from "@/components/forms/BrandFormModal";
import { toast } from "sonner";

interface Brand {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  createdAt: Date;
}


const BrandsSection = () => {
  const [brands, setBrands] = useState<Brand[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const handleCreateBrand = (brandData: Omit<Brand, "id" | "createdAt">) => {
    const newBrand: Brand = {
      ...brandData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setBrands([...brands, newBrand]);
    toast.success("Brand created successfully");
  };

  const handleEditBrand = (
    id: string,
    brandData: Omit<Brand, "id" | "createdAt">,
  ) => {
    console.log(id,brandData)
    setBrands(
      brands.map((brand) =>
        brand.id === id ? { ...brand, ...brandData } : brand,
      ),
    );
    toast.success("Brand updated successfully");
  };
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const storedAuth = localStorage.getItem("user");
        if (!storedAuth) throw new Error("User not authenticated");

        const { token } = JSON.parse(storedAuth);

        const res = await fetch("https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/get-all-brands", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch brands");

        // Transform API shape to match your UI
        const transformed = data.brands.map((b: any) => ({
          id: String(b.brand_id),
          name: b.brand_name,
          logo: b.logo_url,
          description: b.description,
          createdAt: new Date(b.created_at),
        }));

        setBrands(transformed);
      } catch (error: any) {
        console.error("Error fetching brands:", error);
        toast.error(error.message || "Could not load brands");
      }
    };

    fetchBrands();
  }, []);
  const handleDeleteBrand = (id: string) => {
    setBrands(brands.filter((brand) => brand.id !== id));
    toast.success("Brand deleted successfully");
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
            <CardTitle className="text-sm font-medium">
              Total Admins
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          {/*<CardContent>*/}
          {/*  <div className="text-2xl font-bold">*/}
          {/*    {brands.reduce(*/}
          {/*      (acc, brand) => acc + brand.assignedAdmins.length,*/}
          {/*      0,*/}
          {/*    )}*/}
          {/*  </div>*/}
          {/*  <p className="text-xs text-muted-foreground">Across all brands</p>*/}
          {/*</CardContent>*/}
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Nurses
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          {/*<CardContent>*/}
          {/*  <div className="text-2xl font-bold">*/}
          {/*    {brands.reduce(*/}
          {/*      (acc, brand) => acc + brand.assignedNurses.length,*/}
          {/*      0,*/}
          {/*    )}*/}
          {/*  </div>*/}
          {/*  <p className="text-xs text-muted-foreground">Across all brands</p>*/}
          {/*</CardContent>*/}
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
                {/*<TableHead>Assigned Nurses</TableHead>*/}
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={brand.logo} alt={brand.name} />
                        <AvatarFallback>
                          {brand.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{brand.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  {/*<TableCell>*/}
                  {/*  <div className="flex flex-wrap gap-1">*/}
                  {/*    {brand.assignedAdmins.length > 0 ? (*/}
                  {/*      brand.assignedAdmins.map((admin) => (*/}
                  {/*        <Badge key={admin.id} variant="secondary">*/}
                  {/*          {admin.name}*/}
                  {/*        </Badge>*/}
                  {/*      ))*/}
                  {/*    ) : (*/}
                  {/*      <span className="text-muted-foreground text-sm">*/}
                  {/*        No admins assigned*/}
                  {/*      </span>*/}
                  {/*    )}*/}
                  {/*  </div>*/}
                  {/*</TableCell>*/}
                  {/*<TableCell>*/}
                  {/*  <div className="flex flex-wrap gap-1">*/}
                  {/*    {brand.assignedNurses.length > 0 ? (*/}
                  {/*      brand.assignedNurses.map((nurse) => (*/}
                  {/*        <Badge key={nurse.id} variant="outline">*/}
                  {/*          {nurse.name}*/}
                  {/*        </Badge>*/}
                  {/*      ))*/}
                  {/*    ) : (*/}
                  {/*      <span className="text-muted-foreground text-sm">*/}
                  {/*        No nurses assigned*/}
                  {/*      </span>*/}
                  {/*    )}*/}
                  {/*  </div>*/}
                  {/*</TableCell>*/}
                  <TableCell>{brand.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditModal(brand)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem >
                          <Edit className="mr-2 h-4 w-4" />
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
              ))}
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
    </div>
  );
};

export default BrandsSection;
