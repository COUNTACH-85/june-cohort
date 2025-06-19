"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("healthcare_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email, password) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock authentication - in real app, this would be an API call
    if (email === "doctor@healthcare.com" && password === "password") {
      const userData = {
        id: "1",
        name: "Dr. Sarah Johnson",
        email: email,
        role: "doctor",
      }
      setUser(userData)
      localStorage.setItem("healthcare_user", JSON.stringify(userData))
      setIsLoading(false)
      return true
    }
    setIsLoading(false)
    return false
  }

  const signup = async (name, email, password) => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const userData = {
      id: Date.now().toString(),
      name: name,
      email: email,
      role: "doctor",
    }
    setUser(userData)
    localStorage.setItem("healthcare_user", JSON.stringify(userData))
    setIsLoading(false)
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("healthcare_user")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
