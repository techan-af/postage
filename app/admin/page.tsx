"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Star, Plus, ArrowLeft, Upload, ImageIcon } from "lucide-react"
import { Image } from "lucide-react" // Add this import for the Image icon

interface StampRequest {
  _id: string
  prompt: string
  submittedBy: string
  status: string
  createdAt: string
}

interface Stamp {
  _id: string
  name: string
  description: string
  imageUrl: string
  createdAt: string
}

export default function AdminPanel() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<StampRequest[]>([])
  const [stamps, setStamps] = useState<Stamp[]>([])
  const [stampName, setStampName] = useState("")
  const [stampDescription, setStampDescription] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (status === "authenticated" && session?.user?.username !== "admin") {
      router.push("/dashboard")
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.username === "admin") {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/admin/stamps")
      const data = await response.json()
      setRequests(data.requests || [])
      setStamps(data.stamps || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const createStamp = async () => {
    if (!stampName || !stampDescription || !selectedFile) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", stampName)
      formData.append("description", stampDescription)
      formData.append("file", selectedFile)

      const response = await fetch("/api/admin/stamps", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        alert("Stamp created successfully!")
        setStampName("")
        setStampDescription("")
        setSelectedFile(null)
        fetchData()
      }
    } catch (error) {
      console.error("Error creating stamp:", error)
    }
    setLoading(false)
  }

  // Approve a stamp request
  const approveRequest = async (request: StampRequest) => {
    setStampName(request.prompt)
    setStampDescription(`Requested by @${request.submittedBy}`)
    try {
      // Updated endpoint and method for approval
      const response = await fetch(`/api/admin/stamp-requests?id=${request._id}`, {
        method: "PATCH",
      })
      if (response.ok) {
        fetchData()
      } else {
        alert("Failed to approve request.")
      }
    } catch (error) {
      console.error("Error approving request:", error)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-xl font-serif text-amber-900">Loading...</div>
      </div>
    )
  }

  if (session?.user?.username !== "admin") return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100">
      {/* Header */}
      <div className="border-b border-amber-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-700 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">🛡️</span>
            </div>
            <div>
              <h1 className="text-xl font-serif text-amber-900">Admin Panel</h1>
              <p className="text-sm text-amber-700">Manage stamps and user requests</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Create Stamp Form */}
          <Card className="border border-amber-200 shadow-md bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-amber-900 flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Create New Stamp
              </CardTitle>
              <CardDescription className="text-amber-700 text-sm">
                Upload a PNG image and create a new stamp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Stamp name"
                value={stampName}
                onChange={(e) => setStampName(e.target.value)}
                className="border-amber-200 focus:border-amber-400 bg-white/80"
              />

              <Textarea
                placeholder="Stamp description"
                value={stampDescription}
                onChange={(e) => setStampDescription(e.target.value)}
                className="border-amber-200 focus:border-amber-400 bg-white/80 min-h-[80px] resize-none"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-amber-800">Upload PNG Image</label>
                <div className="flex items-center space-x-2">
                  <Input
                    type="file"
                    accept=".png"
                    onChange={handleFileChange}
                    className="border-amber-200 focus:border-amber-400 bg-white/80"
                  />
                  <Upload className="w-5 h-5 text-amber-600" />
                </div>
                {selectedFile && <p className="text-sm text-amber-700">Selected: {selectedFile.name}</p>}
              </div>

              <Button
                onClick={createStamp}
                disabled={!stampName || !stampDescription || !selectedFile || loading}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                {loading ? "Creating..." : "Create Stamp"}
              </Button>
            </CardContent>
          </Card>

          {/* Stamp Requests */}
          <Card className="border border-amber-200 shadow-md bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-amber-900 flex items-center">
                <Star className="w-5 h-5 mr-2" />
                Pending Requests
              </CardTitle>
              <CardDescription className="text-amber-700 text-sm">User stamp requests for inspiration</CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-8 text-amber-700">
                  <Star className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {requests.map((request) => (
                    <div key={request._id} className="p-3 bg-amber-50 rounded border border-amber-200">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-amber-900 text-sm">@{request.submittedBy}</div>
                        <Badge variant="secondary" className="text-xs">
                          {new Date(request.createdAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      <p className="text-amber-800 text-sm leading-relaxed">{request.prompt}</p>
                      <div className="flex justify-end mt-2">
                        <Button
                          size="sm"
                          className="bg-amber-600 hover:bg-amber-700 text-white"
                          onClick={() => approveRequest(request)}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Existing Stamps */}
        <Card className="mt-6 border border-amber-200 shadow-md bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-serif text-amber-900 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" />
              Existing Stamps
            </CardTitle>
            <CardDescription className="text-amber-700 text-sm">
              All stamps currently available in the shop
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stamps.length === 0 ? (
              <div className="text-center py-8 text-amber-700">
                <Image className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="text-sm">No stamps created yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {stamps.map((stamp) => (
                  <div key={stamp._id} className="p-3 bg-amber-50 rounded border border-amber-200">
                    <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 rounded border border-amber-200 flex items-center justify-center mb-2">
                      <img
                        src={stamp.imageUrl || "/placeholder.svg?height=80&width=80"}
                        alt={stamp.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <h4 className="font-medium text-amber-900 text-sm text-center mb-1">{stamp.name}</h4>
                    <p className="text-xs text-amber-700 text-center leading-relaxed">{stamp.description}</p>
                    <div className="text-xs text-amber-600 text-center mt-2">
                      Created: {new Date(stamp.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
