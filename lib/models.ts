export interface User {
  _id?: string
  username: string
  email: string
  password: string
  createdAt: Date
  ownedStamps: string[]
}

export interface Postcard {
  _id?: string
  from: string
  to: string
  message: string
  stamps: string[]
  createdAt: Date
  deliveryDate: Date
  delivered: boolean
  opened: boolean
}

export interface Stamp {
  _id?: string
  name: string
  description: string
  imageUrl: string
  createdAt: Date
}

export interface StampRequest {
  _id?: string
  prompt: string
  submittedBy: string
  status: "pending" | "approved" | "rejected"
  createdAt: Date
}

export interface Contact {
  _id?: string
  user1: string
  user2: string
  lastPostcard: Date
  postcards: string[]
}
