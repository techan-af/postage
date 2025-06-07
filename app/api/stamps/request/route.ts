import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { prompt, submittedBy } = await request.json()

    if (!prompt || !submittedBy) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const stampRequests = client.db().collection("stampRequests")

    const request_doc = {
      prompt,
      submittedBy,
      status: "pending",
      createdAt: new Date(),
    }

    await stampRequests.insertOne(request_doc)

    return NextResponse.json({ message: "Stamp request submitted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
