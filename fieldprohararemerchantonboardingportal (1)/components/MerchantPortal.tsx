"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { LogOut, User, FileText, Activity, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

interface MerchantPortalProps {
  merchantToken: string
  merchantData: any
  onLogout: () => void
}

interface MerchantProfile {
  id: string
  name: string
  email: string
  phone: string
  ownerName: string
  location: string
  status: "PENDING" | "ONBOARDED" | "REJECTED" | "SUSPENDED"
  category: { name: string }
  createdAt: string
  updatedAt: string
}

interface Document {
  id: string
  documentType: string
  fileName: string
  isVerified: boolean
  uploadedAt: string
}

interface ActivityLog {
  id: string
  action: string
  description: string
  createdAt: string
}

export const MerchantPortal: React.FC<MerchantPortalProps> = ({ merchantToken, merchantData, onLogout }) => {
  const [profile, setProfile] = useState<MerchantProfile | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000"

  useEffect(() => {
    fetchMerchantData()
  }, [merchantToken])

  const fetchMerchantData = async () => {
    try {
      setIsLoading(true)
      setError("")

      // Fetch merchant profile
      const profileRes = await fetch(`${apiUrl}/api/v1/merchants/me`, {
        headers: { Authorization: `Bearer ${merchantToken}` },
      })

      if (!profileRes.ok) {
        throw new Error("Failed to fetch profile")
      }

      const profileData = await profileRes.json()
      setProfile(profileData.data)

      // Fetch documents
      const docsRes = await fetch(`${apiUrl}/api/v1/merchants/${merchantData.id}/documents`, {
        headers: { Authorization: `Bearer ${merchantToken}` },
      })

      if (docsRes.ok) {
        const docsData = await docsRes.json()
        setDocuments(docsData.data)
      }

      // Fetch activity logs
      const logsRes = await fetch(`${apiUrl}/api/v1/merchants/${merchantData.id}/activity-log`, {
        headers: { Authorization: `Bearer ${merchantToken}` },
      })

      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setActivityLogs(logsData.data)
      }
    } catch (err: any) {
      setError(err.message || "Failed to load merchant data")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ONBOARDED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-4 text-custom-olive" size={32} />
          <p className="text-gray-600">Loading your portal...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={32} />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Portal</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={onLogout} className="w-full bg-custom-olive">
            Return to Login
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
            <div>
              <h1 className="text-3xl font-bold text-custom-olive">{profile.name}</h1>
              <p className="text-gray-600 text-sm mt-1">{profile.email}</p>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-custom-olive text-custom-olive hover:bg-custom-olive/5"
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Status Card */}
        <Card className="mb-8 p-6 border-2 border-custom-olive/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Business Information</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Owner Name</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.ownerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Location</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.location}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Category</p>
                  <p className="text-lg font-semibold text-gray-900">{profile.category.name}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Onboarding Status</h2>
              <div className="flex items-center gap-4">
                <div className={`px-6 py-3 rounded-lg font-semibold ${getStatusColor(profile.status)}`}>
                  {profile.status}
                </div>
                <div>
                  {profile.status === "PENDING" && (
                    <p className="text-sm text-gray-600">Your application is under review. This typically takes 2-3 business days.</p>
                  )}
                  {profile.status === "ONBOARDED" && (
                    <p className="text-sm text-green-600 font-semibold">Your merchant account is active!</p>
                  )}
                  {profile.status === "REJECTED" && (
                    <p className="text-sm text-red-600">Your application was not approved. Contact support for details.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="documents" className="bg-white rounded-lg border border-gray-200">
          <TabsList className="border-b border-gray-200 rounded-none bg-gray-50 p-0">
            <TabsTrigger
              value="documents"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-custom-olive data-[state=active]:bg-white"
            >
              <FileText size={18} className="mr-2" />
              Documents ({documents.length})
            </TabsTrigger>
            <TabsTrigger
              value="activity"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-custom-olive data-[state=active]:bg-white"
            >
              <Activity size={18} className="mr-2" />
              Activity Log ({activityLogs.length})
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-custom-olive data-[state=active]:bg-white"
            >
              <User size={18} className="mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="p-6">
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-custom-olive/50">
                    <div className="flex items-center gap-4">
                      <FileText className="text-custom-olive" size={24} />
                      <div>
                        <p className="font-semibold text-gray-900">{doc.fileName}</p>
                        <p className="text-sm text-gray-500">{doc.documentType.replace(/_/g, " ")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {doc.isVerified ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          ✓ Verified
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          Pending Review
                        </span>
                      )}
                      <p className="text-xs text-gray-500 mt-2">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="p-6">
            {activityLogs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="mx-auto mb-4 text-gray-400" size={48} />
                <p className="text-gray-600">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-2 h-2 bg-custom-olive rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{log.action.replace(/_/g, " ")}</p>
                      <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                      <p className="text-xs text-gray-500 mt-2">{new Date(log.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="p-6">
            <div className="space-y-6 max-w-2xl">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Email Address</p>
                <p className="text-lg text-gray-900">{profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Phone Number</p>
                <p className="text-lg text-gray-900">{merchantData.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Joined</p>
                <p className="text-lg text-gray-900">{new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
              <hr />
              <Button variant="outline" className="w-full border-red-300 text-red-600 hover:bg-red-50">
                Change Password
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
