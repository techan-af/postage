"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Plus, ArrowLeft } from "lucide-react"


interface Stamp {
  _id: string
  name: string
  description: string
  imageUrl: string
}

interface CollectedStamp {
  _id: string
  stampId: string
  collectedAt: string
}

export default function Shop() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stamps, setStamps] = useState<Stamp[]>([])
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [collectedStamps, setCollectedStamps] = useState<CollectedStamp[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetchStamps()
      fetchCollectedStamps()
    }
  }, [session])

  const fetchStamps = async () => {
    try {
      const response = await fetch("/api/stamps")
      const data = await response.json()
      setStamps(data.stamps || [])
    } catch (error) {
      console.error("Error fetching stamps:", error)
    }
  }

  // Fetch collected stamps for the current user
  const fetchCollectedStamps = async () => {
    try {
      const response = await fetch("/api/stamps/collect", { method: "GET" })
      if (response.ok) {
        const data = await response.json()
        setCollectedStamps(data.collected || [])
      }
    } catch (error) {
      console.error("Error fetching collected stamps:", error)
    }
  }

  const submitStampRequest = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/stamps/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          submittedBy: session?.user?.username,
        }),
      })

      if (response.ok) {
        setPrompt("")
        setShowRequestForm(false)
        alert("Stamp request submitted! Admin will review it soon.")
      }
    } catch (error) {
      console.error("Error submitting request:", error)
    }
    setLoading(false)
  }

  // Add this function to handle collecting a stamp
  const collectStamp = async (stampId: string) => {
    if (!session?.user?.username) {
      alert("You must be signed in to collect stamps.")
      return
    }
    setLoading(true)
    try {
      const response = await fetch("/api/stamps/collect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stampId,
          username: session.user.username,
        }),
      })
      if (response.ok) {
        alert("Stamp collected!")
        fetchCollectedStamps()
      } else if (response.status === 409) {
        alert("You have already collected this stamp.")
      } else {
        alert("Failed to collect stamp.")
      }
    } catch (error) {
      console.error("Error collecting stamp:", error)
      alert("Error collecting stamp.")
    }
    setLoading(false)
  }

  // Helper to check if a stamp is collected
  const isCollected = (stampId: string) =>
    collectedStamps.some((col) => col.stampId === stampId)

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-100 flex items-center justify-center">
        <div className="text-xl font-serif text-amber-900">Loading...</div>
      </div>
    )
  }

  if (!session) return null

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
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-amber-900">Stamp Shop</h1>
              <p className="text-sm text-amber-700">Collect unique stamps for your postcards</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        {/* Request Form Toggle */}
        <div className="my-6 text-center">
          <Button onClick={() => setShowRequestForm(!showRequestForm)} className="bg-amber-600 hover:bg-amber-700">
            <Plus className="w-4 h-4 mr-2" />
            Request New Stamp
          </Button>
        </div>

        {/* Request Form */}
        {showRequestForm && (
          <Card className="mb-6 border border-amber-200 shadow-md bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-amber-900">Request a New Stamp</CardTitle>
              <CardDescription className="text-amber-700 text-sm">
                Describe your stamp idea and the admin will create it for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe your stamp idea (e.g., 'A vintage airplane flying over mountains with sunset colors')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="border-amber-200 focus:border-amber-400 bg-white/80 min-h-[100px] resize-none"
              />
              <div className="flex gap-2">
                <Button
                  onClick={submitStampRequest}
                  disabled={!prompt.trim() || loading}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </Button>
                <Button
                  onClick={() => setShowRequestForm(false)}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Collected Stamps Section */}
        {collectedStamps.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-serif text-amber-900 mb-2">Your Collected Stamps</h2>
            <div className="flex flex-wrap gap-4">
              {collectedStamps.map((col) => {
                const stamp = stamps.find((s) => s._id === col.stampId)
                if (!stamp) return null
                return (
                  <Card key={col._id} className="w-40 border border-amber-200 bg-white/90">
                    <CardHeader className="pb-2">
                      <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 rounded border border-amber-200 flex items-center justify-center mb-2">
                        <img
                          src={stamp.imageUrl || "/placeholder.svg?height=80&width=80"}
                          alt={stamp.name}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <CardTitle className="text-sm font-serif text-amber-900 text-center">{stamp.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-amber-700 text-center">{stamp.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Stamps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {stamps.map((stamp) => (
            <Card
              key={stamp._id}
              className="border border-amber-200 shadow-md bg-white/90 backdrop-blur-sm hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-200 rounded border border-amber-200 flex items-center justify-center mb-2">
                  <img
                    src={stamp.imageUrl || "/placeholder.svg?height=120&width=120"}
                    alt={stamp.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
                <CardTitle className="text-base font-serif text-amber-900 text-center">{stamp.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-amber-700 mb-3 text-center leading-relaxed">{stamp.description}</p>
                <Button
                  size="sm"
                  className={`w-full ${isCollected(stamp._id) ? "bg-amber-300 text-white cursor-not-allowed" : "bg-amber-600 hover:bg-amber-700 text-white"}`}
                  onClick={() => collectStamp(stamp._id)}
                  disabled={loading || isCollected(stamp._id)}
                >
                  <Star className="w-3 h-3 mr-1" />
                  {isCollected(stamp._id) ? "Collected" : "Collect"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {stamps.length === 0 && (
          <div className="text-center py-16">
            <Star className="w-16 h-16 mx-auto mb-4 text-amber-400 opacity-40" />
            <h3 className="text-xl font-serif text-amber-900 mb-2">No stamps available yet</h3>
            <p className="text-amber-700">Be the first to request a stamp!</p>
          </div>
        )}
      </div>
    </div>
  )
}
