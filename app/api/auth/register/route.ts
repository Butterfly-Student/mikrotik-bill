import { NextResponse } from "next/server"
import { createUser, getUserByEmail, getUserByUsername } from "@/lib/db/index"

export async function POST(request: Request) {
  try {
    const { name, email, username, password } = await request.json()

    // Validate required fields
    if (!name || !email || !username || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    // Check if user already exists
    const existingUserByEmail = await getUserByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    const existingUserByUsername = await getUserByUsername(username)
    if (existingUserByUsername) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 })
    }

    // Create new user
    const newUser = await createUser(email, username, password, name)

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          name: newUser.name,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
