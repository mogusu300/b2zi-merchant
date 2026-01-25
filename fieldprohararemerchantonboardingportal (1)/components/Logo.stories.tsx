// Logo usage examples
import { Logo } from "./Logo"

export function LogoExamples() {
  return (
    <div className="p-8 space-y-8">
      {/* Small Icon */}
      <div>
        <p className="text-xs font-bold mb-4">Small Icon</p>
        <Logo size="sm" variant="icon" />
      </div>

      {/* Small Full */}
      <div>
        <p className="text-xs font-bold mb-4">Small Full</p>
        <Logo size="sm" variant="full" />
      </div>

      {/* Medium Full */}
      <div>
        <p className="text-xs font-bold mb-4">Medium Full (Header)</p>
        <Logo size="md" variant="full" />
      </div>

      {/* Large Full */}
      <div>
        <p className="text-xs font-bold mb-4">Large Full (Sidebar)</p>
        <Logo size="lg" variant="full" />
      </div>

      {/* Dark Background */}
      <div className="bg-primary p-8 rounded-2xl">
        <p className="text-xs font-bold mb-4 text-white">On Dark Background</p>
        <Logo size="md" variant="full" className="text-white" />
      </div>
    </div>
  )
}
