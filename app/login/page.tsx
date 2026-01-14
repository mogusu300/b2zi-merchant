import { redirect } from "next/navigation"

export default function LoginPage() {
  // Redirect to customer login page
  redirect("/customers/login")
}
