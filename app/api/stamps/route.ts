import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const stamps = client.db().collection("stamps")

    const availableStamps = await stamps.find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json({ stamps: availableStamps })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
