import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getAllRoles, createRole, hasPermission, assignPermissionsToRole } from "@/lib/db/index"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const canRead = await hasPermission(userId, "roles.view")

    if (!canRead) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const roles = await getAllRoles()
    return NextResponse.json(roles)
  } catch (error) {
    console.error("Error fetching roles:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = Number.parseInt(session.user.id)
    const canWrite = await hasPermission(userId, "roles.write")

    if (!canWrite) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { name, description, permissionIds } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 })
    }

    // Create role
    const newRole = await createRole(name, description)

    // Assign permissions if provided
    if (permissionIds && permissionIds.length > 0) {
      await assignPermissionsToRole(newRole.id, permissionIds)
    }

    return NextResponse.json(newRole, { status: 201 })
  } catch (error) {
    console.error("Error creating role:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
