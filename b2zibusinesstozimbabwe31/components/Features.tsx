import type React from "react"
import { Package, Truck, ShieldCheck, Heart, MapPin, Smartphone, Clock, Rocket, Calendar } from "lucide-react"

export const Features: React.FC = () => {
  return (
    <section id="how-it-works" className="py-24 bg-b2zi-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HOW IT WORKS SECTION */}
        <div className="mb-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base text-b2zi-dark font-bold tracking-wide uppercase">Simple Shopping</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-b2zi-black sm:text-4xl">
              How B2Zi Works
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              From browsing to delivery, we've made shopping local products effortless.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-b2zi-light opacity-50 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-b2zi-light/20 text-center">
                <div className="w-24 h-24 bg-b2zi-dark text-b2zi-light rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg text-2xl font-bold">
                  1
                </div>
                <h3 className="text-lg font-bold text-b2zi-dark mb-2">Browse Products</h3>
                <p className="text-gray-600 text-sm">
                  Discover unique items from local entrepreneurs. Filter by category, price, or location.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-b2zi-light/20 text-center">
                <div className="w-24 h-24 bg-b2zi-dark text-b2zi-light rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg text-2xl font-bold">
                  2
                </div>
                <h3 className="text-lg font-bold text-b2zi-dark mb-2">Place Your Order</h3>
                <p className="text-gray-600 text-sm">
                  Add to cart and checkout securely. Pay with mobile money, card, or cash on delivery.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-b2zi-light/20 text-center">
                <div className="w-24 h-24 bg-b2zi-dark text-b2zi-light rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg text-2xl font-bold">
                  3
                </div>
                <h3 className="text-lg font-bold text-b2zi-dark mb-2">Track Delivery</h3>
                <p className="text-gray-600 text-sm">
                  Watch your order in real-time as our riders bring it right to your door.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-b2zi-light/20 text-center">
                <div className="w-24 h-24 bg-b2zi-dark text-b2zi-light rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg text-2xl font-bold">
                  4
                </div>
                <h3 className="text-lg font-bold text-b2zi-dark mb-2">Enjoy Your Purchase</h3>
                <p className="text-gray-600 text-sm">
                  Love it? Leave a review and support local businesses while shopping again.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* --- LAUNCH CALENDAR SECTION --- */}
        <div id="launch-calendar" className="max-w-4xl mx-auto mb-24 scroll-mt-32">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border-2 border-b2zi-dark/10">
            <div className="bg-b2zi-dark px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Calendar className="text-b2zi-light w-8 h-8" />
                  Launch Timeline
                </h3>
                <p className="text-b2zi-light opacity-90 mt-1 text-sm">Get ready to shop local</p>
              </div>
              <div className="hidden sm:block text-right">
                <span className="inline-block px-3 py-1 bg-b2zi-light text-b2zi-dark font-bold rounded-full text-xs">
                  COMING SOON
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {/* Event 1: In Progress */}
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 hover:bg-gray-50 transition-colors">
                <div className="sm:w-32 flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" /> In Progress
                  </span>
                  <span className="text-lg font-bold text-b2zi-black">Now</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-b2zi-dark mb-1">Building Our Marketplace</h4>
                  <p className="text-gray-600">
                    Local merchants are listing their products and preparing inventory. Join the waitlist to be notified
                    when we launch!
                  </p>
                </div>
              </div>

              {/* Event 2: Dec 30 */}
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 hover:bg-gray-50 transition-colors">
                <div className="sm:w-32 flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-b2zi-light/30 text-b2zi-dark border border-b2zi-light">
                    <Clock className="w-3 h-3 mr-1" /> Coming Up
                  </span>
                  <span className="text-lg font-bold text-b2zi-black">30 Dec</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-b2zi-dark mb-1">Product Catalog Goes Live</h4>
                  <p className="text-gray-600">
                    Merchants finish uploading products. Sneak peek previews for waitlist members via email.
                  </p>
                </div>
              </div>

              {/* Event 3: Jan 12 */}
              <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 hover:bg-gray-50 transition-colors bg-b2zi-light/5">
                <div className="sm:w-32 flex-shrink-0 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-b2zi-dark text-white">
                    <Rocket className="w-3 h-3 mr-1" /> Launch Day
                  </span>
                  <span className="text-lg font-bold text-b2zi-black">12 Jan</span>
                </div>
                <div>
                  <h4 className="text-lg font-bold text-b2zi-dark mb-1">Start Shopping!</h4>
                  <p className="text-gray-600">
                    B2Zi app launches on Google Play & App Store. Start browsing, ordering, and supporting local
                    businesses!
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Join our waitlist to get early access and exclusive launch discounts!
              </p>
            </div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="border-t border-gray-200 pt-24" id="why-b2zi">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base text-b2zi-dark font-bold tracking-wide uppercase">Why Shop B2Zi?</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-b2zi-black sm:text-4xl">
              More than just shopping.
              <br />
              Support local, shop smart.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-b2zi-light hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-b2zi-dark/10 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-6 h-6 text-b2zi-dark" />
              </div>
              <h3 className="text-xl font-bold text-b2zi-black mb-3">Support Local Entrepreneurs</h3>
              <p className="text-gray-600">
                Every purchase directly supports young Zimbabwean business owners and helps them grow.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-b2zi-dark hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-b2zi-light/20 rounded-xl flex items-center justify-center mb-6">
                <Truck className="w-6 h-6 text-b2zi-dark" />
              </div>
              <h3 className="text-xl font-bold text-b2zi-black mb-3">Fast & Reliable Delivery</h3>
              <p className="text-gray-600">
                Track your order in real-time and get it delivered to your doorstep across Zimbabwe.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-b2zi-light hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-b2zi-dark/10 rounded-xl flex items-center justify-center mb-6">
                <Package className="w-6 h-6 text-b2zi-dark" />
              </div>
              <h3 className="text-xl font-bold text-b2zi-black mb-3">Unique Products</h3>
              <p className="text-gray-600">
                Discover handmade, locally-sourced, and unique items you won't find anywhere else.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-b2zi-dark hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-b2zi-light/20 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-b2zi-dark" />
              </div>
              <h3 className="text-xl font-bold text-b2zi-black mb-3">Secure Payments</h3>
              <p className="text-gray-600">
                Multiple payment options including mobile money, cards, and cash on delivery. Your choice!
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-b2zi-light hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-b2zi-dark/10 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-b2zi-dark" />
              </div>
              <h3 className="text-xl font-bold text-b2zi-black mb-3">Nationwide Coverage</h3>
              <p className="text-gray-600">
                From Harare to Bulawayo and everywhere in between. We deliver across Zimbabwe.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border-l-4 border-b2zi-dark hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-b2zi-light/20 rounded-xl flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6 text-b2zi-dark" />
              </div>
              <h3 className="text-xl font-bold text-b2zi-black mb-3">Easy Mobile Shopping</h3>
              <p className="text-gray-600">
                Shop on the go with our user-friendly mobile app. Browse, order, and track from your phone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
