"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, Eye, EyeOff, Check, X, Calendar, ClipboardList, BarChart3, MessageSquare } from "lucide-react"
import Link from "next/link"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isAnimated, setIsAnimated] = useState(false)
  const [focusedField, setFocusedField] = useState("")
  const [passwordStrength, setPasswordStrength] = useState(0)
  const { signup, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setIsAnimated(true)
  }, [])

  // Password strength checker
  useEffect(() => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    setPasswordStrength(strength)
  }, [password])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    const success = await signup(name, email, password)
    if (success) {
      router.push("/")
    } else {
      setError("Failed to create account")
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500"
    if (passwordStrength <= 2) return "bg-orange-500"
    if (passwordStrength <= 3) return "bg-yellow-500"
    if (passwordStrength <= 4) return "bg-blue-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak"
    if (passwordStrength <= 2) return "Fair"
    if (passwordStrength <= 3) return "Good" 
    if (passwordStrength <= 4) return "Strong"
    return "Very Strong"
  }

  const features = [
    { icon: Calendar, text: "Smart Appointment Scheduling" },
    { icon: ClipboardList, text: "Digital Prescription Management" },
    { icon: BarChart3, text: "Advanced Analytics Dashboard" },
    { icon: MessageSquare, text: "Secure Patient Communication" }
  ]

  const passwordRequirements = [
    { text: "At least 6 characters", met: password.length >= 6 },
    { text: "Contains uppercase letter", met: /[A-Z]/.test(password) },
    { text: "Contains number", met: /[0-9]/.test(password) },
    { text: "Contains special character", met: /[^A-Za-z0-9]/.test(password) }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex">
      {/* Left Side - Sign Up Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile header for small screens */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Activity className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">HealthCare Pro</h1>
            <p className="text-gray-600 mt-2">Create your account</p>
          </div>

          <Card className={`shadow-2xl border-0 transform transition-all duration-700 ${
            isAnimated ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}>
            <CardHeader className="text-center pb-6">
              <div className="hidden lg:flex justify-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                  <Activity className="h-6 w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Get Started
              </CardTitle>
              <CardDescription className="text-gray-600">
                Create your account to access the healthcare dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-700 font-medium">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Dr. John Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField("")}
                    className={`transition-all duration-300 ${
                      focusedField === "name" 
                        ? "ring-2 ring-purple-500 border-purple-500 shadow-lg scale-[1.02]" 
                        : "hover:border-gray-400"
                    }`}
                    required
                  />
                  <div className={`absolute inset-0 rounded-md pointer-events-none transition-all duration-300 ${
                    focusedField === "name" ? "bg-purple-50/50" : ""
                  }`}></div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="doctor@healthcare.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField("")}
                    className={`transition-all duration-300 ${
                      focusedField === "email" 
                        ? "ring-2 ring-purple-500 border-purple-500 shadow-lg scale-[1.02]" 
                        : "hover:border-gray-400"
                    }`}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField("")}
                      className={`pr-12 transition-all duration-300 ${
                        focusedField === "password" 
                          ? "ring-2 ring-purple-500 border-purple-500 shadow-lg scale-[1.02]" 
                          : "hover:border-gray-400"
                      }`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? 
                        <EyeOff className="h-4 w-4 text-gray-500" /> : 
                        <Eye className="h-4 w-4 text-gray-500" />
                      }
                    </Button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${(passwordStrength / 5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      
                      {/* Password Requirements */}
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {passwordRequirements.map((req, index) => (
                          <div key={index} className={`flex items-center space-x-1 ${req.met ? 'text-green-600' : 'text-gray-400'}`}>
                            {req.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            <span>{req.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onFocus={() => setFocusedField("confirmPassword")}
                      onBlur={() => setFocusedField("")}
                      className={`pr-12 transition-all duration-300 ${
                        focusedField === "confirmPassword" 
                          ? "ring-2 ring-purple-500 border-purple-500 shadow-lg scale-[1.02]" 
                          : "hover:border-gray-400"
                      } ${
                        confirmPassword && password !== confirmPassword ? "border-red-300" : ""
                      }`}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? 
                        <EyeOff className="h-4 w-4 text-gray-500" /> : 
                        <Eye className="h-4 w-4 text-gray-500" />
                      }
                    </Button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 flex items-center space-x-1">
                      <X className="h-3 w-3" />
                      <span>Passwords do not match</span>
                    </p>
                  )}
                  {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
                    <p className="text-xs text-green-600 flex items-center space-x-1">
                      <Check className="h-3 w-3" />
                      <span>Passwords match</span>
                    </p>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive" className="animate-shake border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">{error}</AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl" 
                  disabled={isLoading || password !== confirmPassword}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/signin" className="text-purple-600 hover:text-purple-700 font-medium hover:underline transition-all duration-200">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-700"></div>
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full animate-bounce"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-white/10 rounded-full animate-ping"></div>
        
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className={`transform transition-all duration-1000 ${isAnimated ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <Activity className="h-16 w-16 mb-8 text-purple-200" />
            <h2 className="text-4xl font-bold mb-6">Join HealthCare Pro</h2>
            <p className="text-xl text-purple-100 mb-12">Transform your practice with our comprehensive healthcare management platform</p>
            
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className={`flex items-center space-x-4 transform transition-all duration-700 ${
                    isAnimated ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <feature.icon className="h-6 w-6 text-purple-200" />
                  </div>
                  <p className="text-purple-100">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}