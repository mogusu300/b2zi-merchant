import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Merchant Hunter Portal',
  description: 'Professional merchant onboarding and management portal',
}

export default function MerchantHunterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
