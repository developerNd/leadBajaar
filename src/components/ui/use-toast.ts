import * as React from "react"
import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type State = {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

export function useToast() {
  const [state, setState] = React.useState<State>({ toasts: [] })

  return {
    ...state,
    toast: (props: Omit<ToasterToast, "id">) => {
      const id = genId()
      setState((state) => ({
        ...state,
        toasts: [{ ...props, id }, ...state.toasts].slice(0, TOAST_LIMIT),
      }))
      return {
        id,
        dismiss: () => setState((state) => ({
          ...state,
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
      }
    },
    dismiss: (toastId?: string) => {
      setState((state) => ({
        ...state,
        toasts: state.toasts.filter((t) => t.id !== toastId),
      }))
    },
  }
} 