import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CheckCircle2, TrendingUp, Users, Sparkles, Store, Package, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground animate-fade-in">
        <div className="container mx-auto px-4 py-3">
          <p className="text-center text-sm font-medium flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 animate-spin-slow" />
            Early Registration Open - Secure Your Spot Before Official Launch
            <ArrowRight className="h-4 w-4 animate-bounce-horizontal" />
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 animate-slide-down">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image
                src="/images/whatsapp-20image-202025-11-23-20at-207.jpeg"
                alt="B2Zi Logo"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <div className="flex items-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Register Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background image layer */}
        <div className="absolute inset-0 -z-20">
          <img
            src="/vibrant-african-marketplace-with-colorful-fresh-pr.jpg"
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 via-background/95 to-background -z-10" />

        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
            <Badge
              className="mb-6 bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent/30 transition-all duration-300 animate-bounce-slow"
              variant="outline"
            >
              Pre-Launch Registration • Limited Merchant Spots
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight animate-fade-in-up animation-delay-100">
              Grow Your Business with{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                Zimbabwe's Digital Marketplace
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 text-pretty max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
              Connect your business to thousands of customers across Zimbabwe. Join B2Zi's merchant platform and
              transform how you sell online. Register today for exclusive early access.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up animation-delay-300">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-lg px-8 py-6 h-auto shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  Register Your Business
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 h-auto border-2 bg-transparent transition-all duration-300 hover:scale-105 hover:border-accent"
                >
                  See How It Works
                </Button>
              </Link>
            </div>
            <p className="mt-8 text-sm text-muted-foreground flex items-center justify-center gap-2 animate-fade-in-up animation-delay-400">
              <CheckCircle2 className="h-4 w-4 text-accent animate-pulse" />
              100% Free Registration • No Credit Card Required
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30 animate-fade-in">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "5,000+", label: "Active Buyers Waiting" },
              { value: "24/7", label: "Online Storefront" },
              { value: "0%", label: "Launch Fees" },
              { value: "100%", label: "Made for Zimbabwe" },
            ].map((stat, index) => (
              <div
                key={index}
                className="text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="text-3xl md:text-4xl font-bold mb-2 transition-all duration-300 hover:text-primary hover:scale-110">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section - NEW */}
      <section className="py-20 relative overflow-hidden bg-gradient-to-b from-background to-secondary/10">
        <div className="absolute inset-0 -z-10 opacity-5">
          <img
            src="/geometric-pattern-modern-grid-network-connections-.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Why Zimbabwean Merchants Choose B2Zi</h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Built specifically for local businesses looking to expand their reach and increase revenue through digital
              channels.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center mb-20">
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up">
              <img
                src="/zimbabwe-business-owner-smartphone-digital-commerc.jpg"
                alt="Zimbabwean merchant using digital platform"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="space-y-6 animate-fade-in-up animation-delay-200">
              <h3 className="text-3xl font-bold">Reach Customers Everywhere</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Your products will be visible to buyers across all of Zimbabwe's major cities and towns. Our platform
                connects you with customers actively searching for what you sell.
              </p>
              <div className="space-y-4">
                {[
                  "Instant nationwide visibility for your products",
                  "Mobile-optimized storefront for on-the-go shoppers",
                  "Built-in customer messaging and order tracking",
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Second showcase - reversed */}
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
            <div className="space-y-6 animate-fade-in-up order-2 md:order-1">
              <h3 className="text-3xl font-bold">Manage Everything in One Place</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Professional merchant dashboard designed for simplicity. Add products, track sales, manage inventory,
                and communicate with customers—all from one powerful platform.
              </p>
              <div className="space-y-4">
                {[
                  "Real-time sales analytics and performance insights",
                  "Easy product listing with photos and descriptions",
                  "Secure payment processing and order management",
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up animation-delay-200 order-1 md:order-2">
              <img
                src="/modern-african-storefront-shop-business-owner-zimb.jpg"
                alt="Modern storefront management"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 md:py-32 bg-gradient-to-b from-secondary/10 to-background relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground text-pretty">
              No setup fees. No monthly subscriptions. No listing costs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Commission Model Card */}
            <Card className="p-8 border-2 hover:border-accent hover:shadow-lg transition-all duration-300 animate-fade-in-up">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-4">How We Work</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We operate on a strict commission-only model. We only earn a small percentage when you make a
                  successful sale.
                </p>
              </div>
            </Card>

            {/* Commission Structure Card */}
            <Card className="p-8 border-2 border-accent/30 bg-accent/5 hover:border-accent hover:shadow-lg transition-all duration-300 animate-fade-in-up animation-delay-100">
              <h3 className="text-2xl font-bold mb-6">Commission Structure</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-3xl font-bold text-accent">5-15%</div>
                  <div>
                    <p className="font-semibold">Category-Based Fees</p>
                    <p className="text-sm text-muted-foreground">
                      Depending on your product category
                    </p>
                  </div>
                </div>
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This covers payment processing, marketing your products to thousands of Zimbabweans, and
                    platform maintenance.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Benefits List */}
          <div className="max-w-3xl mx-auto mt-16 space-y-4 animate-fade-in-up animation-delay-200">
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "Grow your customer base nationwide",
                "Only pay when you make sales",
                "Simple, transparent fee structure",
                "Professional merchant tools included",
                "Dedicated onboarding support",
                "Marketing to thousands of buyers",
              ].map((benefit, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Everything You Need to Succeed Online</h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Professional tools built for Zimbabwean merchants. Simple to use, powerful results.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: Store,
                title: "Digital Storefront",
                description:
                  "Get your own branded store page with custom product displays, pricing, and business information.",
              },
              {
                icon: Package,
                title: "Inventory Management",
                description: "Track stock levels, manage product variants, and receive low-stock alerts automatically.",
              },
              {
                icon: TrendingUp,
                title: "Sales Analytics",
                description:
                  "Understand your best-selling products, peak sales times, and customer preferences with detailed reports.",
              },
              {
                icon: Shield,
                title: "Verified Merchant Status",
                description:
                  "Build customer trust with our verification badge and collect reviews to grow your reputation.",
              },
              {
                icon: Users,
                title: "Customer Insights",
                description:
                  "See who's viewing your products, track repeat customers, and build lasting relationships.",
              },
              {
                icon: Sparkles,
                title: "Featured Placement",
                description: "Early merchants get priority positioning in search results and category pages.",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="p-8 hover:shadow-lg transition-all duration-300 border-2 hover:border-accent hover:scale-105 animate-fade-in-up group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6 transition-all duration-300 group-hover:bg-accent/20 group-hover:scale-110">
                  <feature.icon className="h-6 w-6 text-accent transition-transform duration-300 group-hover:rotate-12" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-32 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-10">
          <img
            src="/success-growth-chart-upward-trend-celebration-achi.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Start Selling in 3 Simple Steps</h2>
            <p className="text-xl text-muted-foreground text-pretty">
              Get your business online and start reaching customers in minutes, not days.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {[
              {
                step: "01",
                title: "Register Your Business",
                description:
                  "Quick 2-minute signup with your business details, contact information, and secure password.",
              },
              {
                step: "02",
                title: "Set Up Your Products",
                description: "Upload product photos, write descriptions, set your prices, and organize your inventory.",
              },
              {
                step: "03",
                title: "Go Live & Sell",
                description: "Launch your store when the platform opens and start receiving orders from day one.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center animate-fade-in-up group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="text-6xl font-bold text-accent/20 mb-4 transition-all duration-500 group-hover:text-accent/40 group-hover:scale-110">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-12 md:p-16 text-center bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground border-0 shadow-2xl animate-fade-in-up hover:shadow-3xl transition-shadow duration-500 relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10 -z-10">
                <img
                  src="/vibrant-african-marketplace-with-colorful-fresh-pr.jpg"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance animate-fade-in-up">
                Ready to Expand Your Reach?
              </h2>
              <p className="text-xl mb-10 text-primary-foreground/90 text-pretty max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-100">
                Join B2Zi's merchant community and position your business for digital growth. Early registrants secure
                the best placement and receive dedicated onboarding support.
              </p>
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-10 py-7 h-auto shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 animate-fade-in-up animation-delay-200"
                >
                  Register Your Merchant Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="mt-8 text-sm text-primary-foreground/80 flex items-center justify-center gap-2 animate-fade-in-up animation-delay-300">
                <CheckCircle2 className="h-4 w-4 animate-pulse" />
                Free setup • Priority merchant support • No hidden fees
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/20">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/images/whatsapp-20image-202025-11-23-20at-207.jpeg"
                alt="B2Zi Logo"
                width={100}
                height={33}
                className="h-8 w-auto"
              />
            </div>
            <p className="text-sm text-muted-foreground">© 2025 B2Zi. Empowering Zimbabwean Merchants.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
