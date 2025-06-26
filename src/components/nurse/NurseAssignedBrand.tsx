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
} from "lucide-react";

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

const NurseAssignedBrand = () => {
  // Mock assigned brand data - in real app this would come from API
  const assignedBrand: AssignedBrand = {
    id: "1",
    name: "HealthTech Solutions",
    logo: "/api/placeholder/80/80",
    description:
      "Leading healthcare technology company focused on innovative medical solutions and patient care improvement.",
    contactEmail: "contact@healthtech.com",
    contactPhone: "+1 (555) 123-4567",
    assignedDate: new Date("2024-01-15"),
    totalCampaigns: 8,
    activeCampaigns: 3,
    assignedNurses: 12,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            My Assigned Brand
          </h1>
          <p className="text-muted-foreground mt-1">
            Information about your assigned brand and organization
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="default" className="gap-1">
              Single Brand Assignment
            </Badge>
          </div>
        </div>
      </div>

      {/* Brand Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={assignedBrand.logo} alt={assignedBrand.name} />
              <AvatarFallback className="text-2xl">
                {assignedBrand.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl">{assignedBrand.name}</CardTitle>
              <CardDescription className="text-base mt-2">
                {assignedBrand.description}
              </CardDescription>
              <div className="flex items-center space-x-4 mt-4">
                <Badge variant="outline" className="gap-1">
                  <Calendar className="w-3 h-3" />
                  Assigned {assignedBrand.assignedDate.toLocaleDateString()}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Brand Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Campaigns
            </CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedBrand.totalCampaigns}
            </div>
            <p className="text-xs text-muted-foreground">All campaigns</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignedBrand.activeCampaigns}
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
              {assignedBrand.assignedNurses}
            </div>
            <p className="text-xs text-muted-foreground">Total nurses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Status</CardTitle>
            <Badge className="h-4 w-4 rounded-full bg-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground">Currently assigned</p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Contact Information</CardTitle>
          <CardDescription>
            Contact details for your assigned brand organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Email Address
                  </div>
                  <div className="font-mono text-sm">
                    {assignedBrand.contactEmail}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Phone Number
                  </div>
                  <div className="font-mono text-sm">
                    {assignedBrand.contactPhone}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Organization Type
                  </div>
                  <div className="text-sm">Healthcare Technology</div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Assignment Date
                  </div>
                  <div className="text-sm">
                    {assignedBrand.assignedDate.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brand Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Guidelines & Resources</CardTitle>
          <CardDescription>
            Important information and resources for working with this brand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">
                Mission Statement
              </h4>
              <p className="text-blue-800 text-sm">
                To revolutionize healthcare through innovative technology
                solutions that improve patient outcomes and enhance the quality
                of care.
              </p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">
                Communication Guidelines
              </h4>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Always maintain patient confidentiality</li>
                <li>• Use professional and empathetic communication</li>
                <li>• Follow HIPAA compliance protocols</li>
                <li>• Report any issues to your supervisor immediately</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">
                Available Resources
              </h4>
              <ul className="text-purple-800 text-sm space-y-1">
                <li>• 24/7 Technical Support Hotline</li>
                <li>• Online Training Portal</li>
                <li>• Brand Assets and Templates</li>
                <li>• Emergency Contact Directory</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NurseAssignedBrand;
