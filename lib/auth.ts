"use client"

import type { User } from "./data-store"

const AUTH_KEY = "windowcad-auth"

export function setAuthUser(user: User): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  }
}

export function getAuthUser(): User | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(AUTH_KEY)
    return stored ? JSON.parse(stored) : null
  }
  return null
}

export function clearAuthUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY)
  }
}

export function requireAuth(): User {
  const user = getAuthUser()
  if (!user) {
    throw new Error("Authentication required")
  }
  return user
}

export function requireRole(role: "ADMIN" | "ASSOCIATE" | "DEALER"): User {
  const user = requireAuth()
  if (user.role !== role) {
    throw new Error(`${role} role required`)
  }
  return user
}
