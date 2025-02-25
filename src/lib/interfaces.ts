interface Timestamp {
    createdAt: string
    updatedAt: string
  }


export type Role = "admin" | "user"

export interface User extends Timestamp {
    _id: string
    firstName: string
    lastName: string
    username: string
    role: Role
    email?: string
    status: boolean
    contact: string
    password?: string
  }
