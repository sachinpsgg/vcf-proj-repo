import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  User,
  Phone,
  Mail,
  ArrowLeft,
  Link2,
  Stethoscope,
  Building2, EllipsisIcon,
} from "lucide-react";
import { toast } from "sonner";
import { convertToBase64, uploadBrandLogo, urlGenerator } from "@/api/general.ts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface GenerateFormProps {
  setShowForm: (val: boolean) => void;
  campaign?: { campaign_name: string };
}

export const GenerateForm: React.FC<GenerateFormProps> = ({
                                                            setShowForm,
                                                            campaign,
  userRole
                                                          }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    email: "",
  });
  console.log(campaign)
  const [fieldVisibility, setFieldVisibility] = useState({
    name: true,
    phone_number: true,
    email: true,
    campaign: true,
    logo: true,
  });

  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const handleGenerateUrl = async () => {
    const response =  await urlGenerator(formData, logoImage, campaign);
    if (response?.file_url) {
      setGeneratedUrl(response.file_url);
      console.log(response.file_url);
    }

  };
  const handleCopyUrl = () => {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      navigator.clipboard.writeText(generatedUrl)
        .then(() => {
          toast.success("URL copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          toast.error("Failed to copy URL.");
        });
    } else {
      console.error("Clipboard API not supported.");
      toast.error("Clipboard not supported in this browser.");
    }
  };

  const toggleFieldVisibility = (field: keyof typeof fieldVisibility) => {
    setFieldVisibility((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleImageUpload =async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return toast.error("Select a valid image");
    try {
      setLogoImage(file);
      setImagePreview(URL.createObjectURL(file));
      setIsUploadingImage(true);

      const base64 = await convertToBase64(file)
      const logoUrl = await uploadBrandLogo(base64, campaign.brand_id);
      console.log(logoUrl)
      setLogoImage(logoUrl);
      toast.success("Logo uploaded");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-medical-50 via-white to-medical-50">

        <div className="bg-white border-b border-medical-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                  className="flex items-center space-x-2 text-medical-600 hover:text-medical-700 hover:bg-medical-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Go Back</span>
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-medical-500" />
                  <span className="text-lg font-semibold text-medical-900">
                  {campaign?.campaign_name ?? "Campaign Name"}
                </span>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-medical-100 text-medical-800 border-medical-200"
              >
                Card Builder
              </Badge>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div
            className={`grid gap-8 ${
              userRole === "admin" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
            }`}
          >
            <Card className="">
              <CardHeader className="bg-gradient-to-r from-medical-600 to-medical-700">
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="h-6 w-6" />
                  <span>Card Information</span>
                </CardTitle>
              </CardHeader>
              {generatedUrl && (
                <div className="mb-6 bg-green-50 border border-green-200 p-4 rounded-lg flex items-center justify-between">
                  <div className="text-green-800 font-medium">
                    Generated Patient URL:
                    <a
                      href={generatedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 underline text-green-700 hover:text-green-900"
                    >
                      {generatedUrl}
                    </a>
                  </div>
                  <Button
                    size="sm"
                    className="ml-4 bg-green-600 text-white hover:bg-green-700"
                    onClick={handleCopyUrl}
                  >
                    Copy
                  </Button>
                </div>
              )}

              <CardContent className="p-6 space-y-6">
                {/* Logo Upload */}
                {userRole==='admin' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="logo"
                        className="text-medical-700 font-medium"
                      >
                        Logo Image
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="show-logo"
                          checked={fieldVisibility.logo}
                          onCheckedChange={() => toggleFieldVisibility("logo")}
                        />
                        <Label
                          htmlFor="show-logo"
                          className="text-sm text-medical-600"
                        >
                          Show on card
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="border-medical-200 focus:border-medical-500 focus:ring-medical-500"
                      />
                      {logoImage && (
                        <div className="flex items-center space-x-3 p-3 bg-medical-50 rounded-lg border border-medical-200">
                          <img
                            src={logoImage}
                            alt="Logo preview"
                            className="w-12 h-12 rounded-lg object-cover border border-medical-300"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-medical-700">
                              Logo uploaded
                            </p>
                            <p className="text-xs text-medical-500">
                              This will appear on your card
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLogoImage(null)}
                            className="text-medical-500 hover:text-medical-700"
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="name"
                      className="text-medical-700 font-medium"
                    >
                      Card Name
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-name"
                        checked={fieldVisibility.name}
                        onCheckedChange={() => toggleFieldVisibility("name")}
                      />
                      <Label
                        htmlFor="show-name"
                        className="text-sm text-medical-600"
                      >
                        Show on card
                      </Label>
                    </div>
                  </div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medical-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter card name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="pl-10 border-medical-200 focus:border-medical-500 focus:ring-medical-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="phone"
                      className="text-medical-700 font-medium"
                    >
                      Phone Number
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-phone"
                        checked={fieldVisibility.phone_number}
                        onCheckedChange={() =>
                          toggleFieldVisibility("phone_number")
                        }
                      />
                      <Label
                        htmlFor="show-phone"
                        className="text-sm text-medical-600"
                      >
                        Show on card
                      </Label>
                    </div>
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medical-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9813545226"
                      value={formData.phone_number}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          phone_number: e.target.value,
                        }))
                      }
                      className="pl-10 border-medical-200 focus:border-medical-500 focus:ring-medical-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="email"
                      className="text-medical-700 font-medium"
                    >
                      Email Address
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-email"
                        checked={fieldVisibility.email}
                        onCheckedChange={() => toggleFieldVisibility("email")}
                      />
                      <Label
                        htmlFor="show-email"
                        className="text-sm text-medical-600"
                      >
                        Show on card
                      </Label>
                    </div>
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-medical-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="doctor@clinic.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="pl-10 border-medical-200 focus:border-medical-500 focus:ring-medical-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-medical-700 font-medium">
                      Campaign Badge
                    </Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-campaign"
                        checked={fieldVisibility.campaign}
                        onCheckedChange={() => toggleFieldVisibility("campaign")}
                      />
                      <Label
                        htmlFor="show-campaign"
                        className="text-sm text-medical-600"
                      >
                        Show on card
                      </Label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleGenerateUrl}
                  className="w-full bg-gradient-to-r from-medical-600 to-medical-700 hover:from-medical-700 hover:to-medical-800 text-white font-medium py-3 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Link2 className="h-5 w-5 mr-2" />
                  Generate URL
                </Button>
              </CardContent>
            </Card>

            {/* Live Preview */}
            {
              userRole==='admin' && (
                <Card className="border-medical-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-medical-50 to-medical-100 border-b border-medical-200">
                    <CardTitle className="text-medical-800 flex items-center space-x-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span>Live Preview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Tabs defaultValue="android" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-2 text-sm sm:text-base">
                        <TabsTrigger value="android">Android</TabsTrigger>
                        <TabsTrigger value="ios">iOS</TabsTrigger>
                      </TabsList>

                      <TabsContent value="android" className="mt-6">

                        <div
                          className="relative bg-white rounded-md overflow-hidden shadow-2xl mx-auto border border-gray-300"
                          style={{
                            width: "100%",
                            maxWidth: "320px",
                            height: "100%",
                            maxHeight: "640px",
                          }}
                        >
                          <div className="bg-purple-600 text-white px-4 py-1 text-xs flex items-center justify-between">
                            <span className="font-medium">5:32</span>
                            <div className="flex items-center space-x-1">
                              <div className="flex space-x-1">
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                <div className="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
                              </div>
                              <span className="text-xs ml-2">📶 📶 📶 🔋 59%</span>
                            </div>
                          </div>

                          {/* Navigation Header */}
                          <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                            <ArrowLeft />
                            <EllipsisIcon/>
                          </div>


                          <div
                            className="relative bg-gray-200 px-6 py-12 text-center overflow-hidden"
                            style={{
                              background:
                                "linear-gradient(135deg, #e5e7eb 0%, #f3f4f6 100%)",
                            }}
                          >

                            {fieldVisibility.logo && (
                              <div className="relative z-10 mx-auto mb-6">
                                <div className="w-24 h-24 rounded-full overflow-hidden bg-teal-400 mx-auto shadow-xl border-2 border-white">
                                  {logoImage ? (
                                    <img
                                      src={logoImage}
                                      alt="Contact photo"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center">
                                      <div className="text-white text-lg font-bold">
                                        {formData.name
                                          ? formData.name.charAt(0).toUpperCase()
                                          : "D"}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {fieldVisibility.name && (
                              <h2 className="relative z-10 text-2xl font-medium text-gray-900 tracking-wide">
                                {formData.name || "Dr. ******"}
                              </h2>
                            )}
                          </div>

                          {/* Contact Details List */}
                          <div className="bg-white flex-1 overflow-auto">
                            {/* Phone Number 1 */}
                            {fieldVisibility.phone_number && (
                              <div className="px-4 py-4 flex items-center justify-between border-b border-gray-100">
                                <div className="flex items-center space-x-4">
                                  <Phone className="h-5 w-5 text-gray-600" />
                                  <div>
                                    <div className="font-medium text-gray-900 text-base">
                                      {formData.phone_number || "**********"}
                                    </div>
                                    <div className="text-sm text-gray-500 uppercase tracking-wide">
                                      DOCTOR
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <button className="p-2">
                                    <Phone className="h-4 w-4 text-gray-600" />
                                  </button>
                                  <button className="p-2">
                                    <svg
                                      className="h-4 w-4 text-gray-600"
                                      fill="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Email */}
                            {fieldVisibility.email && (
                              <div className="px-4 py-4 flex items-center border-b border-gray-100">
                                <Mail className="h-5 w-5 text-gray-600 mr-4" />
                                <div className="font-medium text-gray-900">
                                  {formData.email || "*********"}
                                </div>
                              </div>
                            )}

                            {/* Website */}
                            {fieldVisibility.campaign && campaign?.campaign_name && (
                              <div className="px-4 py-4 flex items-center border-b border-gray-100">
                                <div className="h-5 w-5 text-gray-600 mr-4 flex items-center justify-center">
                                  <svg
                                    className="h-5 w-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                  </svg>
                                </div>
                                <div className="font-medium text-gray-900">
                                  {campaign?.campaign_name}
                                </div>
                              </div>
                            )}

                            {/* Notes */}
                            <div className="px-4 py-4 flex items-center">
                              <div className="h-5 w-5 text-gray-600 mr-4 flex items-center justify-center">
                                <svg
                                  className="h-5 w-5"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                </svg>
                              </div>
                              <div className="text-gray-500">notes</div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="ios" className="mt-6">

                        <div className="relative bg-white rounded-sm overflow-hidden shadow-2xl w-[320px] h-[640px] mx-auto border border-gray-300">

                          <div className="bg-white text-black px-6 py-3 text-sm flex items-center justify-between border-b border-gray-100">
                            <span className="font-semibold">9:41</span>
                            <div className="flex items-center space-x-1">
                              <div className="flex space-x-1">
                                <div className="w-1 h-3 bg-black rounded-full"></div>
                                <div className="w-1 h-3 bg-black rounded-full"></div>
                                <div className="w-1 h-3 bg-black rounded-full"></div>
                                <div className="w-1 h-3 bg-black rounded-full"></div>
                              </div>
                              <svg
                                className="w-4 h-4"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9z" />
                              </svg>
                              <div className="w-6 h-3 bg-green-500 rounded-sm"></div>
                            </div>
                          </div>


                          <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-100">
                            <div className="flex items-center space-x-2">
                              <svg
                                className="w-5 h-5 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 19l-7-7 7-7"
                                />
                              </svg>
                              <span className="text-blue-500 font-medium">
                          iCloud
                        </span>
                            </div>
                            <button className="text-blue-500 font-medium">
                              Edit
                            </button>
                          </div>

                          {/* Profile Section */}
                          <div className="bg-white px-6 py-6 text-center">
                            {fieldVisibility.logo && (
                              <div className="mx-auto mb-4">
                                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto shadow-lg">
                                  {logoImage ? (
                                    <img
                                      src={logoImage}
                                      alt="Contact photo"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <img
                                      src="https://cdn.builder.io/api/v1/image/assets%2F6c87cc316a854523bf75284678abeb3c%2Ffde6a02578a34555a5b81435487bf35f?format=webp&width=800"
                                      alt="Contact photo"
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              </div>
                            )}

                            {fieldVisibility.name && (
                              <h2 className="text-2xl font-medium text-gray-900 mb-2">
                                {formData.name || ""}
                              </h2>
                            )}

                            {fieldVisibility.campaign && campaign?.campaign_name && (
                              <div className="text-gray-500 text-sm mb-6">
                                <span>{campaign.campaign_name}</span>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="grid grid-cols-4 gap-4 mb-8">
                              <button className="flex flex-col items-center space-y-2">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-6 h-6 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                                  </svg>
                                </div>
                                <span className="text-xs text-gray-600">message</span>
                              </button>
                              <button className="flex flex-col items-center space-y-2">
                                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-6 h-6 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                                  </svg>
                                </div>
                                <span className="text-xs text-gray-600">call</span>
                              </button>
                              <button className="flex flex-col items-center space-y-2">
                                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-6 h-6 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                                  </svg>
                                </div>
                                <span className="text-xs text-gray-600">video</span>
                              </button>
                              <button className="flex flex-col items-center space-y-2">
                                <div className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-6 h-6 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                  </svg>
                                </div>
                                <span className="text-xs text-gray-600">mail</span>
                              </button>

                            </div>
                          </div>

                          <div className="bg-gray-50 flex-1">
                            {fieldVisibility.phone_number && (
                              <div className="bg-white rounded-lg p-4 border border-gray-100">
                                <div className="text-gray-600 text-sm mb-1">
                                  Mobile
                                </div>
                                <div className="text-blue-500 text-lg font-medium">
                                  {formData.phone_number || "**********"}
                                </div>
                              </div>
                            )}

                            {fieldVisibility.email && (
                              <div className="bg-white rounded-lg p-4 border border-gray-100">
                                <div className="text-gray-600 text-sm mb-1">Email</div>
                                <div className="text-blue-500 text-lg font-medium">
                                  {formData.email || "***********"}
                                </div>
                              </div>
                            )}

                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
                            <div className="grid grid-cols-5 gap-4">
                              <button className="flex flex-col items-center py-1">
                                <svg
                                  className="w-6 h-6 text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                                <span className="text-xs text-gray-600">
                            Favorites
                          </span>
                              </button>
                              <button className="flex flex-col items-center py-1">
                                <svg
                                  className="w-6 h-6 text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                                <span className="text-xs text-gray-600">Recents</span>
                              </button>
                              <button className="flex flex-col items-center py-1">
                                <svg
                                  className="w-6 h-6 text-blue-500"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63c-.34-1.02-1.24-1.68-2.27-1.68-.99 0-1.93.64-2.27 1.68L12.5 16H15v6h5z" />
                                </svg>
                                <span className="text-xs text-blue-500 font-medium">
                            Contacts
                          </span>
                              </button>
                              <button className="flex flex-col items-center py-1">
                                <svg
                                  className="w-6 h-6 text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 19c0 .55-.45 1-1 1s-1-.45-1-1 .45-1 1-1 1 .45 1 1zm-1-2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm0-4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
                                </svg>
                                <span className="text-xs text-gray-600">Keypad</span>
                              </button>
                              <button className="flex flex-col items-center py-1">
                                <svg
                                  className="w-6 h-6 text-gray-400"
                                  fill="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                                </svg>
                                <span className="text-xs text-gray-600">
                            Voicemail
                          </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )
            }
          </div>
        </div>
      </div>
    </>
  );
};
