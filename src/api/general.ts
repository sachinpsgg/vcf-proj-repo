import { toast } from "sonner";
import { apiClient } from "./apiClient";


export const uploadBrandLogo = async (
  base64Image: string,
  brandId: number
): Promise<string> => {
  try {
    const client = apiClient();

    const response = await client.post("/brands/uploadBrandLogo", {
      brand_id: brandId.toString(),
      base64Image,
      fileExtension: "png",
    });

    return response.data.logo_url;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Failed to upload logo";
    toast.error(message);
    throw new Error(message);
  }
};


export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

// Generate VCF and return response data
export const urlGenerator = async (
  formData: {
    name: string;
    phone_number: string;
    email?: string;
  },
  logo_url: string,
  campaign: {
    campaign_id: number;
    campaign_name: string;
  }
): Promise<any | undefined> => {
  if (!formData.phone_number || !formData.name || !campaign) return;

  try {
    const client = apiClient();
    const response = await client.post(
      `/vcf/generate?campaign_id=${campaign.campaign_id}`,
      {
        name: formData.name,
        phone_number: formData.phone_number,
        email: formData.email,
        logo_url,
      }
    );

    toast.success("Patient URL generated successfully!");
    return response.data;
  } catch (error: any) {
    console.error("Error generating VCF:", error);
    toast.error(
      error?.response?.data?.message ||
      "An error occurred while generating the VCF file"
    );
  }
};
