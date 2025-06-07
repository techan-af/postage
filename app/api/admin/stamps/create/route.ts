import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, imageUrl, requestId } = await request.json()

    if (!name || !description || !imageUrl || !requestId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const stamps = client.db().collection("stamps")
    const stampRequests = client.db().collection("stampRequests")

    // Get the original request
    const request_doc = await stampRequests.findOne({ _id: new ObjectId(requestId) })
    if (!request_doc) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    // Create the stamp
    const stamp = {
      name,
      description,
      imageUrl,
      prompt: request_doc.prompt,
      submittedBy: request_doc.submittedBy,
      approved: true,
      createdAt: new Date(),
    }

    const result = await stamps.insertOne(stamp)

    // Update the request status
    await stampRequests.updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status: "approved",
          stampId: result.insertedId.toString(),
        },
      },
    )

    return NextResponse.json({ message: "Stamp created successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
