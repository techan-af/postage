"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, ArrowLeft } from "lucide-react"

export default function Contacts() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [contacts, setContacts] = useState([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    // Fetch contacts for the logged-in user
    const fetchContacts = async () => {
      if (!session?.user?.username) return
      try {
        const res = await fetch(`/api/contacts?user=${session.user.username}`)
        if (res.ok) {
          const data = await res.json()
          setContacts(data.contacts || [])
        }
      } catch (error) {
        // Optionally handle error
      }
    }
    if (session?.user?.username) {
      fetchContacts()
    }
  }, [session])

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
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-amber-900">Your Contacts</h1>
              <p className="text-sm text-amber-700">People you've exchanged postcards with</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Contacts List */}
        {contacts.length === 0 ? (
          <Card className="mt-6 border border-amber-200 shadow-md bg-white/90 backdrop-blur-sm">
            <CardContent className="text-center py-16">
              <Users className="w-16 h-16 mx-auto mb-4 text-amber-400 opacity-40" />
              <h3 className="text-xl font-serif text-amber-900 mb-2">No contacts yet</h3>
              <p className="text-amber-700 mb-4">Send your first postcard to start building your contact list!</p>
              <Button onClick={() => router.push("/dashboard")} className="bg-amber-600 hover:bg-amber-700">
                Send a Postcard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 mt-6">
            {contacts.map((contact: any) => (
              <Card key={contact.contact} className="border border-amber-200 bg-white/90">
                <CardContent className="flex items-center justify-between py-4 px-6">
                  <div>
                    <div className="font-serif text-amber-900 text-lg">@{contact.contact}</div>
                    {contact.lastPostcard && (
                      <div className="text-xs text-amber-700">
                        Last postcard: {new Date(contact.lastPostcard).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={() => router.push(`/postcards/send?to=${contact.contact}`)}
                  >
                    Send Postcard
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
