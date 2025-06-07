"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Star, Mail, Calendar, ArrowLeft, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

export default function Profile() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [ownedStamps, setOwnedStamps] = useState([])
  const [stats, setStats] = useState({
    postcardsSent: 0,
    postcardsReceived: 0,
    stampsOwned: 0,
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

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
        <div className="max-w-4xl mx-auto px-4 py-4">
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
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-amber-900">Your Profile</h1>
              <p className="text-sm text-amber-700">Manage your account and view your collection</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Profile Info */}
          <Card className="border border-amber-200 shadow-md bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-amber-900 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-amber-800 text-sm">Username:</span>
                  <span className="text-amber-900 text-sm">@{session.user.username}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-amber-800 text-sm">Email:</span>
                  <span className="text-amber-900 text-sm">{session.user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-amber-800 text-sm">Member Since:</span>
                  <span className="text-amber-900 text-sm flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="w-full bg-red-600 hover:bg-red-700 text-white mt-4"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="border border-amber-200 shadow-md bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-amber-900 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Your Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-amber-50 rounded border border-amber-200">
                  <div className="text-xl font-bold text-amber-900">{stats.postcardsSent}</div>
                  <div className="text-xs text-amber-700">Postcards Sent</div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded border border-amber-200">
                  <div className="text-xl font-bold text-amber-900">{stats.postcardsReceived}</div>
                  <div className="text-xs text-amber-700">Postcards Received</div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded border border-amber-200 col-span-2">
                  <div className="text-xl font-bold text-amber-900">{stats.stampsOwned}</div>
                  <div className="text-xs text-amber-700">Stamps Owned</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Owned Stamps */}
        <Card className="mt-6 border border-amber-200 shadow-md bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-serif text-amber-900 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Your Stamp Collection
            </CardTitle>
            <CardDescription className="text-amber-700 text-sm">Stamps you've collected from the shop</CardDescription>
          </CardHeader>
          <CardContent>
            {ownedStamps.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-12 h-12 mx-auto mb-3 text-amber-400 opacity-40" />
                <p className="text-amber-700 text-sm mb-4">No stamps in your collection yet</p>
                <Button onClick={() => router.push("/shop")} className="bg-amber-600 hover:bg-amber-700">
                  Visit Stamp Shop
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {/* Stamps will be displayed here when implemented */}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
