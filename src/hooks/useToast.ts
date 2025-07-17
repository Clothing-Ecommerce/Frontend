import { useState, useCallback } from "react"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  type?: "success" | "error" | "warning" | "info"
  duration?: number
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const addToast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const toast = {
    success: (title: string, description?: string) => addToast({ title, description, type: "success" }),
    error: (title: string, description?: string) => addToast({ title, description, type: "error" }),
    warning: (title: string, description?: string) => addToast({ title, description, type: "warning" }),
    info: (title: string, description?: string) => addToast({ title, description, type: "info" }),
  }

  return { toasts, toast, removeToast }
}
