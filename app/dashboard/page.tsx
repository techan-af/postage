"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mail, Search, Send, Star, Users, User, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

interface UserType {
  _id: string
  username: string
}

interface Postcard {
  _id: string
  from: string
  message: string
  stamps: string[]
  deliveryDate: string
  opened: boolean
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserType[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [message, setMessage] = useState("")
  const [inbox, setInbox] = useState<Postcard[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.username) {
      fetchInbox()
    }
  }, [session])

  const fetchInbox = async () => {
    try {
      const response = await fetch(`/api/postcards/inbox?user=${session?.user?.username}`)
      const data = await response.json()
      setInbox(data.postcards || [])
    } catch (error) {
      console.error("Error fetching inbox:", error)
    }
  }

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(searchQuery)}&user=${session?.user?.username}`,
      )
      const data = await response.json()
      setSearchResults(data.users || [])
    } catch (error) {
      console.error("Error searching users:", error)
    }
  }

  const sendPostcard = async () => {
    if (!selectedUser || !message.trim()) return

    setLoading(true)
    try {
      const response = await fetch("/api/postcards/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: session?.user?.username,
          to: selectedUser,
          message,
          stamps: [],
        }),
      })

      if (response.ok) {
        setMessage("")
        setSelectedUser("")
        setSearchQuery("")
        setSearchResults([])
        alert("Postcard sent! It will be delivered at 12:00 AM IST.")
      }
    } catch (error) {
      console.error("Error sending postcard:", error)
    }
    setLoading(false)
  }

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
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center">
                <span className="text-white">📮</span>
              </div>
              <div>
                <h1 className="text-xl font-serif text-amber-900">Welcome, {session.user.username}</h1>
                <p className="text-sm text-amber-700">Send vintage postcards worldwide</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => router.push("/shop")}
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <Star className="w-4 h-4 mr-1" />
                Shop
              </Button>
              <Button
                onClick={() => router.push("/contacts")}
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <Users className="w-4 h-4 mr-1" />
                Contacts
              </Button>
              <Button
                onClick={() => router.push("/profile")}
                variant="outline"
                size="sm"
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                <User className="w-4 h-4 mr-1" />
                Profile
              </Button>
              <Button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Send Postcard */}
          <Card className="border border-amber-200 shadow-md bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-amber-900 flex items-center">
                <Send className="w-5 h-5 mr-2" />
                Send a Postcard
              </CardTitle>
              <CardDescription className="text-amber-700 text-sm">
                Search for friends and send them a vintage postcard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-amber-200 focus:border-amber-400 bg-white/80"
                />
                <Button onClick={searchUsers} size="sm" className="bg-amber-600 hover:bg-amber-700">
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-1">
                  {searchResults.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => {
                        setSelectedUser(user.username)
                        setSearchResults([])
                        setSearchQuery("")
                      }}
                      className="p-2 bg-amber-50 rounded border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors text-sm"
                    >
                      @{user.username}
                    </div>
                  ))}
                </div>
              )}

              {selectedUser && (
                <div className="p-3 bg-amber-100 rounded border border-amber-300">
                  <p className="font-medium text-amber-900 text-sm">Sending to: @{selectedUser}</p>
                </div>
              )}

              <Textarea
                placeholder="Write your postcard message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border-amber-200 focus:border-amber-400 bg-white/80 min-h-[100px] resize-none"
              />

              <Button
                onClick={sendPostcard}
                disabled={!selectedUser || !message.trim() || loading}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                {loading ? "Sending..." : "Send Postcard"}
              </Button>
            </CardContent>
          </Card>

          {/* Inbox */}
          <Card className="border border-amber-200 shadow-md bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif text-amber-900 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Your Inbox
              </CardTitle>
              <CardDescription className="text-amber-700 text-sm">
                Postcards delivered daily at 12:00 AM IST
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inbox.length === 0 ? (
                <div className="text-center py-8 text-amber-700">
                  <Mail className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p className="text-sm">No postcards yet. Ask friends to send you some!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {inbox.map((postcard) => (
                    <div
                      key={postcard._id}
                      className="p-3 bg-amber-50 rounded border border-amber-200 hover:bg-amber-100 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-amber-900 text-sm">From: @{postcard.from}</div>
                        <Badge variant={postcard.opened ? "secondary" : "default"} className="text-xs">
                          {postcard.opened ? "Opened" : "New"}
                        </Badge>
                      </div>
                      <p className="text-amber-800 text-sm mb-2 leading-relaxed">{postcard.message}</p>
                      <div className="text-xs text-amber-600">
                        Delivered: {new Date(postcard.deliveryDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
