import type React from "react"
export const LandingFooter: React.FC = () => {
  return (
    <footer className="bg-b2zi-dark text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-3xl font-black mb-4">
            B2Zi<span className="text-b2zi-light">.</span>
          </h3>
          <p className="text-b2zi-light opacity-80">Business to Zimbabwe.</p>
          <p className="text-gray-300 text-sm mt-2">
            Empowering young entrepreneurs to reach every corner of the nation.
          </p>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-b2zi-light">Contact</h4>
          <p className="text-gray-300">Harare, Zimbabwe</p>
          <p className="text-gray-300">business2zimbabwe@gmail.com</p>
        </div>
        <div>
          <h4 className="font-bold mb-4 text-b2zi-light">Legal</h4>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>Terms of Service</li>
            <li>Merchant Agreement</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-white/10 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} B2Zi Platform. All rights reserved.
      </div>
    </footer>
  )
}
