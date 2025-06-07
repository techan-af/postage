import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: NextRequest) {
  try {
    const { from, to, message, stamps } = await request.json()

    if (!from || !to || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const postcards = client.db().collection("postcards")
    const contacts = client.db().collection("contacts")

    // Calculate next 12:00 AM IST
    const now = new Date()
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)
    let nextDelivery = new Date(now)
    nextDelivery.setUTCHours(19, 0, 0, 0) // 12:00 AM IST is 18:30 UTC

    if (now >= nextDelivery) {
      nextDelivery.setUTCDate(nextDelivery.getUTCDate() + 1)
    }

    const postcard = {
      from,
      to,
      message,
      stamps: stamps || [],
      createdAt: now,
      deliveryDate: nextDelivery,
      delivered: false,
      deliveredAt: null,
      opened: false,
    }

    const result = await postcards.insertOne(postcard)

    // Update or create contact
    // Save contact for sender (from)
    await contacts.updateOne(
      { user: from, contact: to },
      {
        $set: { lastPostcard: now },
        $addToSet: { postcards: result.insertedId },
        $setOnInsert: { user: from, contact: to, postcards: [result.insertedId] },
      },
      { upsert: true }
    )

    // Save contact for recipient (to)
    await contacts.updateOne(
      { user: to, contact: from },
      {
        $set: { lastPostcard: now },
        $addToSet: { postcards: result.insertedId },
        $setOnInsert: { user: to, contact: from, postcards: [result.insertedId] },
      },
      { upsert: true }
    )

    return NextResponse.json({ message: "Postcard sent successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
