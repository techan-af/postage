import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const currentUser = searchParams.get("user")

    if (!query) {
      return NextResponse.json({ users: [] })
    }

    const client = await clientPromise
    const users = client.db().collection("users")

    const searchResults = await users
      .find(
        {
          username: { $regex: query, $options: "i", $ne: currentUser },
        },
        { projection: { username: 1, _id: 1 } },
      )
      .limit(10)
      .toArray()

    return NextResponse.json({ users: searchResults })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
