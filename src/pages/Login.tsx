import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export type UserRole = "superAdmin" | "admin" | "nurse";

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://1q34qmastc.execute-api.us-east-1.amazonaws.com/dev/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();
      console.log(data)
      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const userRole = data.role?.toLowerCase() || "nurse"; // Normalize casing if needed

      localStorage.setItem(
        "user",
        JSON.stringify({
          email: formData.email,
          token: data.token,
          role: "superAdmin",
          isAuthenticated: true,
        })
      );

      toast.success(`Welcome! Logged in as ${userRole}`);
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  //
  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsLoading(true);
  //
  //   // Simulate authentication API call
  //   await new Promise((resolve) => setTimeout(resolve, 1000));
  //
  //   // Simulate backend API response with user role based on email
  //   // In real app, this would come from your authentication API
  //   let userRole: UserRole = "nurse"; // default role
  //
  //   if (
  //     formData.email.includes("superadmin") ||
  //     formData.email.includes("super")
  //   ) {
  //     userRole = "superAdmin";
  //   } else if (formData.email.includes("admin")) {
  //     userRole = "admin";
  //   }
  //
  //   // Store user data in localStorage (in real app, use proper auth)
  //   localStorage.setItem(
  //     "user",
  //     JSON.stringify({
  //       email: formData.email,
  //       role: "superAdmin",
  //       isAuthenticated: true,
  //     }),
  //   );
  //
  //   toast.success(`Welcome! Logged in as ${userRole}`);
  //   navigate("/dashboard");
  //   setIsLoading(false);
  // };

  const handleInputChange = (
    field: keyof LoginFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-semibold text-gray-900">Sign In to</h1>
            <h2 className="text-3xl font-semibold text-gray-900">Workroom</h2>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-600"
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="youremail@gmail.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-600"
              >
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  className="h-12 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-blue-500 pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) =>
                    handleInputChange("rememberMe", !!checked)
                  }
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-gray-600 cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <button
                type="button"
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg flex items-center justify-center gap-2"
            >
              {isLoading ? "Signing in..." : "Sign"}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>

          {/* Footer */}
          <div className="text-center">
            <button
              type="button"
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              Don't have an account?
            </button>
          </div>
        </form>

        {/* Demo Info */}
        <div className="mt-8 text-center text-xs text-gray-400">
          <p>
            Demo: superadmin@company.com, admin@company.com, nurse@company.com
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
