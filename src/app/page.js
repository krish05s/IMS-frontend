"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

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
  const [showTruckToast, setShowTruckToast] = useState(false);
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

    if (!formData.password)
      newErrors.password = "Password is required";

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
        setShowTruckToast(true);
        setServerMessage("");
        localStorage.setItem("token", data.token);

        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-pink-100 via-white to-green-100 p-3 sm:p-5 font-sans">
      <div className="flex w-full max-w-3xl min-h-[520px] rounded-2xl overflow-hidden shadow-2xl bg-white">

        {/* LEFT: Carousel - Hidden on Mobile */}
        <div className="relative hidden md:block w-[45%] min-h-[520px] overflow-hidden flex-shrink-0">
          {carouselImages.map((img, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"
                }`}
            >
              <img
                src={img.url}
                alt={img.caption}
                className="w-full h-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
              <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          ))}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {carouselImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2.5 rounded-full border-none cursor-pointer transition-all duration-300 ${i === current ? "w-7 bg-white" : "w-2.5 bg-white/50"
                  }`}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: Form */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-10 sm:py-12 bg-white">
          <div className="flex flex-col items-center mb-6">
            <img
              src="/FINAL_MICARA_LOGO_OPEN black.png"
              alt="Micara Laminate"
              className="w-28 sm:w-36 object-contain mb-2"
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1a2340] mb-1 text-center">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-400 mb-7 text-center">
            Please login to your account
          </p>

          <div className="w-full max-w-xs sm:max-w-sm">
            {/* Email */}
            <div className="mb-3">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl text-sm text-gray-700 bg-gray-50 outline-none border transition-all duration-200 focus:border-orange-500 focus:bg-white ${errors.email ? "border-red-400" : "border-gray-200"
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit(e);
                }}
                className={`w-full px-4 py-3 pr-11 rounded-xl text-sm text-gray-700 bg-gray-50 outline-none border transition-all duration-200 focus:border-orange-500 focus:bg-white ${errors.password ? "border-red-400" : "border-gray-200"
                  }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none cursor-pointer p-1"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible />
                ) : (
                  <AiOutlineEye />
                )}
              </button>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 ml-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div className="text-right mb-5">
              <span className="text-sm text-gray-400 cursor-pointer hover:text-orange-500 transition-colors">
                Forgot Password
              </span>
            </div>

            {serverMessage && (
              <div
                className={`mb-4 text-sm px-4 py-2.5 rounded-lg border ${serverMessage.includes("successful")
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-600 border-red-200"
                  }`}
              >
                {serverMessage}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full py-3.5 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 disabled:bg-orange-300 disabled:cursor-not-allowed text-white text-base font-bold rounded-xl transition-all duration-200 shadow-lg shadow-orange-200 tracking-wide"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div
        className={`fixed top-5 right-5 bg-white px-6 py-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-100 z-50 flex items-center gap-5 overflow-hidden min-w-[280px] transition-all duration-500 ease-out ${showTruckToast
          ? "translate-x-0 opacity-100"
          : "translate-x-[120%] opacity-0"
          }`}
      >
        <div className="relative w-16 h-10 overflow-hidden bg-slate-50 rounded-lg">
          <div className="absolute bottom-1 left-0 w-full h-1 bg-slate-200 rounded-full z-0"></div>
          <div
            className="absolute left-0 flex items-center h-full z-10"
            style={{ animation: "drive 2s linear infinite" }}
          >
            <span
              className="text-3xl inline-block"
              style={{ transform: "scaleX(-1)" }}
            >
              🚚
            </span>
          </div>
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">
            Login Successful!
          </h3>
          <p className="text-xs text-slate-500"></p>
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes drive {
          0% { transform: translateX(-35px); }
          100% { transform: translateX(65px); }
        }
      `,
        }}
      />
    </div>
  );
}