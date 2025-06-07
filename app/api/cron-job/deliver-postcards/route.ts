import { NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: NextRequest) {
  const client = await clientPromise
  const postcards = client.db().collection("postcards")
  const now = new Date()

  const undelivered = await postcards.find({
    delivered: false,
    deliveryDate: { $lte: now },
  }).toArray()

  if (undelivered.length === 0) {
    return NextResponse.json({ delivered: 0 })
  }

  const ids = undelivered.map(card => card._id)
  await postcards.updateMany(
    { _id: { $in: ids } },
    { $set: { delivered: true, deliveredAt: now } }
  )

  return NextResponse.json({ delivered: undelivered.length })
}