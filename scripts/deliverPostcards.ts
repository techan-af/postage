import clientPromise from "@/lib/mongodb"

async function deliverScheduledPostcards() {
  const client = await clientPromise
  const postcards = client.db().collection("postcards")

  const now = new Date()

  // Find all postcards scheduled for delivery that haven't been delivered yet
  const undelivered = await postcards.find({
    delivered: false,
    deliveryDate: { $lte: now },
  }).toArray()

  if (undelivered.length === 0) {
    console.log("No postcards to deliver at this time.")
    return
  }

  // Mark them as delivered
  const ids = undelivered.map(card => card._id)
  await postcards.updateMany(
    { _id: { $in: ids } },
    { $set: { delivered: true, deliveredAt: now } }
  )

  console.log(`Delivered ${undelivered.length} postcards.`)
}

deliverScheduledPostcards()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Error delivering postcards:", err)
    process.exit(1)
  })