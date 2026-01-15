"use client"

import { useState } from "react"

export default function LoginTest() {
  const [customerEmail, setCustomerEmail] = useState("test-customer@b2zi.com")
  const [merchantEmail, setMerchantEmail] = useState("test-merchant@b2zi.com")
  const [password, setPassword] = useState("TestPassword123")
  const [customerResult, setCustomerResult] = useState("")
  const [merchantResult, setMerchantResult] = useState("")
  const [sessionResult, setSessionResult] = useState("")

  const testCustomerLogin = async () => {
    try {
      const res = await fetch("/api/customers/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: customerEmail, password }),
      })
      const data = await res.json()
      setCustomerResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setCustomerResult(`Error: ${error}`)
    }
  }

  const testMerchantLogin = async () => {
    try {
      const res = await fetch("/api/merchant/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: merchantEmail, password }),
      })
      const data = await res.json()
      setMerchantResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setMerchantResult(`Error: ${error}`)
    }
  }

  const testSession = async () => {
    try {
      const res = await fetch("/api/auth/session")
      const data = await res.json()
      setSessionResult(JSON.stringify(data, null, 2))
    } catch (error) {
      setSessionResult(`Error: ${error}`)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Login Test Page</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Customer Login Test */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Customer Login Test</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <button
              onClick={testCustomerLogin}
              className="w-full bg-primary text-background py-2 rounded font-semibold hover:bg-primary/80"
            >
              Test Customer Login
            </button>
            {customerResult && (
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
                {customerResult}
              </pre>
            )}
          </div>
        </div>

        {/* Merchant Login Test */}
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Merchant Login Test</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={merchantEmail}
                onChange={(e) => setMerchantEmail(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <button
              onClick={testMerchantLogin}
              className="w-full bg-success text-background py-2 rounded font-semibold hover:bg-success/80"
            >
              Test Merchant Login
            </button>
            {merchantResult && (
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
                {merchantResult}
              </pre>
            )}
          </div>
        </div>
      </div>

      {/* Session Check */}
      <div className="border rounded-lg p-6 mt-8">
        <h2 className="text-xl font-bold mb-4">Session Check</h2>
        <button
          onClick={testSession}
          className="w-full bg-accent text-background py-2 rounded font-semibold hover:bg-accent/80"
        >
          Check Session
        </button>
        {sessionResult && (
          <pre className="bg-secondary p-4 rounded text-xs overflow-auto mt-4 max-h-64">
            {sessionResult}
          </pre>
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-8 border-t pt-8">
        <h3 className="font-bold mb-4">Quick Links</h3>
        <div className="flex gap-4 flex-wrap">
          <a href="/customers/login" className="px-4 py-2 bg-primary/10 text-primary rounded hover:bg-primary/20">
            Customer Login
          </a>
          <a href="/sellers/login" className="px-4 py-2 bg-success/10 text-success rounded hover:bg-success/20">
            Seller Login
          </a>
          <a href="/marketplace" className="px-4 py-2 bg-secondary text-muted-foreground rounded hover:bg-secondary/80">
            Marketplace
          </a>
            <a href="/sellers/dashboard" className="px-4 py-2 bg-accent/10 text-accent rounded hover:bg-accent/20">
            Seller Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
