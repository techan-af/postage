import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const username = searchParams.get("user")
  if (!username) {
    return NextResponse.json({ error: "Missing user" }, { status: 400 })
  }

  const client = await clientPromise
  const contacts = client.db().collection("contacts")
  const userContacts = await contacts.find({ user: username }).toArray()

  return NextResponse.json({ contacts: userContacts })
}