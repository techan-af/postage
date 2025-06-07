import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import clientPromise from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const client = await clientPromise
    const stampRequests = client.db().collection("stampRequests")

    const requests = await stampRequests.find({ status: "pending" }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ requests })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH /api/admin/stamp-requests?id=<requestId>
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Missing request id" }, { status: 400 })
    }

    const client = await clientPromise
    const stampRequests = client.db().collection("stampRequests")

    const result = await stampRequests.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "approved" } }
    )

    if (result.modifiedCount === 1) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Request not found or already approved" }, { status: 404 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
