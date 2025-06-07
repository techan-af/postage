import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("user")

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    const client = await clientPromise
    const postcards = client.db().collection("postcards")

    const inbox = await postcards
      .find({
        to: username,
        delivered: true,
      })
      .sort({ deliveryDate: -1 })
      .toArray()

    return NextResponse.json({ postcards: inbox })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
