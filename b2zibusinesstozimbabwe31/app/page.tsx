import { Hero } from "@/components/Hero"
import { Features } from "@/components/Features"
import { LandingNav } from "@/components/LandingNav"
import { LandingFooter } from "@/components/LandingFooter"

export default function LandingPage() {
  return (
    <>
      <LandingNav />
      <Hero />
      <Features />
      <LandingFooter />
    </>
  )
}
