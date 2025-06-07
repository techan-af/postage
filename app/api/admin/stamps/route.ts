import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const file = formData.get("file") as File

    if (!name || !description || !file) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Convert file to base64 for storage (in production, use proper file storage)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const imageUrl = `data:${file.type};base64,${base64}`

    const client = await clientPromise
    const stamps = client.db().collection("stamps")

    const stamp = {
      name,
      description,
      imageUrl,
      createdAt: new Date(),
    }

    await stamps.insertOne(stamp)

    return NextResponse.json({ message: "Stamp created successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const client = await clientPromise
    const stamps = client.db().collection("stamps")
    const stampRequests = client.db().collection("stampRequests")

    const allStamps = await stamps.find({}).sort({ createdAt: -1 }).toArray()
    const pendingRequests = await stampRequests.find({ status: "pending" }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ stamps: allStamps, requests: pendingRequests })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
