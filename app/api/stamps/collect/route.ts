import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { stampId, username } = await request.json()
    if (!stampId || !username) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 })
    }

    const client = await clientPromise
    const userStamps = client.db().collection("userStamps")

    // Prevent duplicate collection
    const exists = await userStamps.findOne({ username, stampId })
    if (exists) {
      return NextResponse.json({ error: "Already collected" }, { status: 409 })
    }

    await userStamps.insertOne({
      username,
      stampId,
      collectedAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in collect route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Optional: Get all collected stamps for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const username = session.user?.username
    if (!username) {
      return NextResponse.json({ error: "Missing username" }, { status: 400 })
    }

    const client = await clientPromise
    const userStamps = client.db().collection("userStamps")

    const collected = await userStamps.find({ username }).toArray()

    return NextResponse.json({ collected })
  } catch (error) {
    console.error("Error fetching collected stamps:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}