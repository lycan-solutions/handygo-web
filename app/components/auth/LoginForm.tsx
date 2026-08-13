"use client";

import { useState } from "react";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from 'next/navigation'
const LoginForm = () => {

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("");
    const trimmedPhone = phone.trim();
    if (trimmedPhone === "") {
      setError("Phone number is required")
      return
    } else if (password.trim() === "") {
      setError("Password is required");
      return
    }
    setLoading(true)
    try {
      const response = await fetch('https://handygo-production-jqi9i.ondigitalocean.app/api/v1/auth/admin/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: trimmedPhone,
          password: password.trim()
        })
      })
      const data = await response.json()
      if (!response.ok) {
        
        setError(data.message || "invalid credentials.")

      } else {
        const accesstoken = (data.data.accessToken)
        const refreshtoken = (data.data.refreshToken)
        const role = (data.data.user.role)
        const user = JSON.stringify(data.data.user)
        const currentDate = String(Date.now())

        localStorage.setItem("handygo_access_token", accesstoken)
        localStorage.setItem("handygo_refresh_token", refreshtoken)
        localStorage.setItem("handygo_role", role)
        localStorage.setItem("handygo_user", user)
        localStorage.setItem("handygo_last_active", currentDate)

        if (role === "ADMIN"){
          router.push('/admin/dashboard/')
        }else if (role === "CLIENT"){
          router.push('/client/dashboard')
        }else if (role === "WORKER"){
          setError("Worker web panel is not available yet.")
        }else{
          router.push('/pageNotFound/')
        }

      }
    } catch (e) {
      setError("Server error. Please try again.")
      console.log("error from login handlesubmit" + e)
    } finally {
      setLoading(false)
    }

  }

  const handleopacity = loading ? 'opacity-50 cursor-not-allowed' : '';
  return (
    <div className="w-[100%] p-3 md:p-8 flex md:my-10 justify-center">
      <form onSubmit={handleSubmit} className="w-[100%] h-[auto] bg-white rounded-lg shadow-md p-2 md:p-6 text-[1.2rem] flex flex-col gap-4 md:w-[400px]">
        <div className="flex flex-row items-center gap-0 justify-center">
          <img src="/images/logo-green.png" alt="Logo" className="w-10 h-10 mr-2 " />
          <p className="text-2xl font-bold text-[var(--brand)]">Handygo</p>
        </div>
        <p className="text-4xl font-bold">Welcome back!</p>
        <p className="text-gray-600 mb-3">Sign in to continue to your account.</p>

        <p className="text-red-500">{error ? error : null}</p>

        <div className="relative w-full ">
          <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--brand)]" />
          <input type="tel" placeholder="03XXXXXXXXX" value={phone} name="tel" id="tel" onChange={(e) => setPhone(e.target.value)}
            className=" w-full text-[1.2rem] border border-md  border-2 px-10 py-1 rounded-md border-gray-300 focus:border-[var(--brand)] focus:outline focus:outline-[var(--brand)] focus:border-white" />
        </div>



        <div className="relative w-full ">
          <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--brand)]" />
          <input type={showPassword ? "text" : "password"}
            placeholder="Enter your Password" value={password} name="password" id="password" onChange={(e) => setPassword(e.target.value)}
            className="w-full text-[1.2rem] border border-md border-2 px-10 py-1 rounded-md border-gray-300 focus:border-[var(--brand)] focus:outline focus:outline-[var(--brand)] focus:border-white" />

          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--brand)]">
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) :
              (
                <Eye className="h-5 w-5" />
              )

            }
          </button>

        </div>

        <input type="submit" id="login" value={loading ? "Signing in......" : "Sign In"} disabled={loading} className={`text-[1.2rem] bg-[var(--brand)] 
         text-white py-2 px-8 mt-12 rounded-md hover:bg-[var(--brand-dark)]  font-bold ${handleopacity}`} />

        <p className="text-gray-600 mt-8 text-center">
          Don&apos;t have an account? <a href="/auth/register" className="text-[var(--brand)] hover:underline">Register</a>
        </p>
      </form>
    </div>
  )
}

export default LoginForm