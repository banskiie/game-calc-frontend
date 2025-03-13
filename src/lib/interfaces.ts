interface Timestamp {
    createdAt: string
    updatedAt: string
  }


export type Role = "admin" | "user"
export type Winner = "a" | "b"
export type Status = "pending" | "ongoing" | "completed"

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
  export interface Court {
    _id: string
    name: string
    price: number
    active: boolean
  }
  
  export interface Shuttle {
    _id: string
    name: string
    price: number
    active: boolean
  }

  export interface Session {
    _id: string
    start: Date
    end?: Date
    games: Game[]
    court: Court
    shuttle: Shuttle
  }

  export interface ShuttlesUsed {
    shuttle: Shuttle
    quantity: number
  }

  export interface Game extends Timestamp {
  _id: string
  session: Session
  start: Date
  end: Date
  A1: User
  A2?: User
  B1: User
  B2?: User
  court: Court
  shuttlesUsed: [ShuttlesUsed]
  winner: Winner
  status: Status
  active: boolean
  }