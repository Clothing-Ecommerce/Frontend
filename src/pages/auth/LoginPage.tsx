import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ToastContainer } from "@/components/ui/toast";
import { useToast } from "@/hooks/useToast";
import api from "@/utils/axios";
import axios from "axios";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = "Please enter your email";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Please enter your password";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful!", "Welcome back to FashionStore");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          toast.error("Login failed", error.response.data.message);
          setErrors({ email: error.response.data.message });
        } else {
          toast.error(
            "Login failed",
            "Please check your credentials and try again"
          );
          setErrors({ email: "Login failed. Please try again." });
        }
      } else {
        console.error("Unexpected error:", error);
        toast.error("Error", "An unexpected error occurred");
        setErrors({ email: "An unexpected error occurred." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 transition-opacity duration-1000 ${
        isPageLoaded ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* <ToastContainer toasts={toasts} onClose={removeToast} /> */}
      <ToastContainer
        toasts={toasts.map((toastObj) => ({
          ...toastObj,
          onClose: removeToast,
        }))}
        onClose={removeToast}
      />

      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block animate-in slide-in-from-left duration-1000">
          <div className="text-center space-y-6">
            <Link
              to="/"
              className="inline-flex items-center space-x-2 mb-8 group"
            >
              <ArrowLeft className="w-5 h-5 text-blue-600 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
                Back to homepage
              </span>
            </Link>

            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-2 group">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white font-bold text-2xl">F</span>
                </div>
                <span className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                  FashionStore
                </span>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 animate-in slide-in-from-bottom duration-1000 delay-200">
                Welcome back!
              </h1>
              <p className="text-xl text-gray-600 max-w-md mx-auto animate-in slide-in-from-bottom duration-1000 delay-300">
                Sign in to continue shopping and managing your account
              </p>
            </div>

            <div className="relative animate-in slide-in-from-bottom duration-1000 delay-500">
              <img
                src="/placeholder.svg?height=400&width=400"
                alt="Fashion Shopping"
                width={400}
                height={400}
                className="mx-auto rounded-lg shadow-lg hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute -bottom-4 -right-4 bg-yellow-400 text-black p-3 rounded-lg shadow-lg animate-bounce">
                <div className="text-lg font-bold">Special</div>
                <div className="text-sm">Offer</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto animate-in slide-in-from-right duration-1000 delay-300">
          <Card className="shadow-2xl border-0 hover:shadow-3xl transition-shadow duration-500">
            <CardHeader className="text-center space-y-2">
              <div className="lg:hidden flex items-center justify-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">F</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  FashionStore
                </span>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Login
              </CardTitle>
              <CardDescription className="text-gray-600">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`pl-10 transition-all duration-300 focus:scale-105 ${
                        errors.email ? "border-red-500 animate-shake" : ""
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 animate-in slide-in-from-left duration-300">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`pl-10 pr-10 transition-all duration-300 focus:scale-105 ${
                        errors.password ? "border-red-500 animate-shake" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500 animate-in slide-in-from-left duration-300">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="rememberMe"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          rememberMe: checked as boolean,
                        }))
                      }
                    />
                    <Label
                      htmlFor="rememberMe"
                      className="text-sm text-gray-600"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link
                    to="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-300 relative"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <LoadingSpinner size="sm" />
                      <span>Logging in...</span>
                    </div>
                  ) : (
                    "Login"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    type="button"
                    className="bg-transparent hover:scale-105 transition-transform duration-200"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    className="bg-transparent hover:scale-105 transition-transform duration-200"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </Button>
                </div>

                <div className="text-center">
                  <span className="text-gray-600">Don't have an account? </span>
                  <Link
                    to="/auth/register"
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Register now
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
