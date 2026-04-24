"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const carouselImages = [
  {
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    caption: "Elegant Aluminium Windows",
  },
  {
    url: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80",
    caption: "Modern Architectural Design",
  },
  {
    url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
    caption: "Premium Interior Solutions",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselImages.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerMessage("");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter a valid email";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Minimum 6 characters";
    return newErrors;
  };

  // ✅ FIXED: Correct API URL + data.success check
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setServerMessage("");

    try {
      // ✅ FIX 1: /api/auth/login → /api/login (Backend route match)
      // ✅ FIX 2: Full backend URL use karo (Next.js != Express)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      // ✅ FIX 3: res.ok ni jagye data.success check karo
      // Backend always HTTP 200 return kare — success/fail data.success ma hoy chhe
      if (data.success) {
        setServerMessage("Login successful! Redirecting...");
        localStorage.setItem("token", data.token);

        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      } else {
        setServerMessage(data.message || "Invalid email or password.");
        setLoading(false);
      }
    } catch (err) {
      setServerMessage("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-green-100 p-5 font-sans">
      <div className="flex w-full max-w-3xl min-h-[520px] rounded-2xl overflow-hidden shadow-2xl bg-white">
        {/* LEFT: Carousel */}
        <div className="relative w-[45%] min-h-[520px] overflow-hidden flex-shrink-0">
          {carouselImages.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === current ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={img.url}
                alt={img.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          ))}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {carouselImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2.5 rounded-full border-none cursor-pointer transition-all duration-300 ${
                  i === current ? "w-7 bg-white" : "w-2.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="flex-1 flex flex-col items-center justify-center px-10 py-12 bg-white">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <img
              src="/FINAL_MICARA_LOGO_OPEN black.png"
              alt="Micara Laminate"
              className="w-36 object-contain mb-2"
            />
          </div>

          <h2 className="text-3xl font-extrabold text-[#1a2340] mb-1 text-center">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-400 mb-7 text-center">
            Please login to your account
          </p>

          <div className="w-full max-w-xs">
            {/* Email */}
            <div className="mb-3">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl text-sm text-gray-700 bg-gray-50 outline-none border transition-all duration-200 focus:border-orange-500 focus:bg-white ${
                  errors.email ? "border-red-400" : "border-gray-200"
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 ml-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="mb-3 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-11 rounded-xl text-sm text-gray-700 bg-gray-50 outline-none border transition-all duration-200 focus:border-orange-500 focus:bg-white ${
                  errors.password ? "border-red-400" : "border-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer p-1"
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="text-right mb-5">
              <span className="text-sm text-gray-400 cursor-pointer hover:text-orange-500 transition-colors">
                Forgot Password
              </span>
            </div>

            {/* Server Message */}
            {serverMessage && (
              <div
                className={`mb-4 text-sm px-4 py-2.5 rounded-lg border ${
                  serverMessage.includes("successful")
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-600 border-red-200"
                }`}
              >
                {serverMessage}
              </div>
            )}

            {/* Sign In Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed text-white text-base font-bold rounded-xl transition-all duration-200 shadow-lg shadow-orange-200 tracking-wide"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
