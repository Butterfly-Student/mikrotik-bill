// app/api/mikrotik/radius/hotspot/batches/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db/index'
import { voucher_batches, vouchers, session_profiles } from '@/database/schema/mikrotik'
import { eq, desc } from 'drizzle-orm'

// Helper function to generate random string
function generateRandomString(length: number, characters: string, prefix?: string): string {
  let result = prefix || ''
  const charactersLength = characters.length
  
/*************  ✨ Windsurf Command ⭐  *************/
/**
 * @description Get a batch detail
 * @param {string} id - ID of the batch to get
 * @returns {NextResponse} - A JSON response with the batch detail
 */

/*******  078f769f-2b70-443f-972d-8552153775ff  *******/  for (let i = 0; i < length - (prefix?.length || 0); i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  
  return result
}

// Helper function to generate voucher credentials
function generateVoucherCredentials(
  count: number, 
  config: {
    length: number
    prefix?: string
    characters: string
    passwordMode: string
  }
): Array<{ username: string; password: string }> {
  const credentials: Array<{ username: string; password: string }> = []
  const usedUsernames = new Set<string>()
  
  for (let i = 0; i < count; i++) {
    let username: string
    
    // Generate unique username
    do {
      username = generateRandomString(config.length, config.characters, config.prefix)
    } while (usedUsernames.has(username))
    
    usedUsernames.add(username)
    
    // Generate password based on mode
    const password = config.passwordMode === 'same_as_username' 
      ? username 
      : generateRandomString(config.length, config.characters)
    
    credentials.push({ username, password })
  }
  
  return credentials
}

export async function GET(request: NextRequest) {
  try {
    // Get all batches with relations
    const batches = await db
      .select({
        id: voucher_batches.id,
        router_id: voucher_batches.router_id,
        profile_id: voucher_batches.profile_id,
        batch_name: voucher_batches.batch_name,
        generation_config: voucher_batches.generation_config,
        total_generated: voucher_batches.total_generated,
        comment: voucher_batches.comment,
        status: voucher_batches.status,
        is_active: voucher_batches.is_active,
        created_at: voucher_batches.created_at,
        created_by: voucher_batches.created_by,
        // Profile relation
        profile_name: session_profiles.name,
      })
      .from(voucher_batches)
      .leftJoin(session_profiles, eq(voucher_batches.profile_id, session_profiles.id))
      .orderBy(desc(voucher_batches.created_at))

    return NextResponse.json({
      success: true,
      data: batches.map(batch => ({
        ...batch,
        // Parse generation config for easier frontend usage
        profile: batch.profile_name ? { profile_name: batch.profile_name } : null
      }))
    })
  } catch (error) {
    console.error('Error fetching batches:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      router_id,
      profile_id,
      batch_name,
      total_generated,
      length = 6,
      prefix,
      characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789',
      password_mode = 'same_as_username',
      comment,
      created_by
    } = body

    // Validation
    if (!router_id || !batch_name || !total_generated) {
      return NextResponse.json({
        success: false,
        message: 'router_id, batch_name, dan total_generated harus diisi'
      }, { status: 400 })
    }

    if (total_generated > 10000) {
      return NextResponse.json({
        success: false,
        message: 'Maximum 10,000 vouchers per batch'
      }, { status: 400 })
    }

    // Create generation config
    const generationConfig = {
      length: parseInt(length),
      prefix,
      characters,
      password_mode
    }

    // Create batch record
    const [newBatch] = await db
      .insert(voucher_batches)
      .values({
        router_id: parseInt(router_id),
        profile_id: profile_id ? parseInt(profile_id) : null,
        batch_name,
        generation_config: generationConfig,
        total_generated: parseInt(total_generated),
        comment,
        created_by: created_by ? parseInt(created_by) : null,
        status: 'active',
        is_active: true
      })
      .returning()

    // Generate voucher credentials
    const credentials = generateVoucherCredentials(
      parseInt(total_generated),
      {
        length: parseInt(length),
        prefix,
        characters,
        passwordMode: password_mode
      }
    )

    // Get profile info for limits
    let profileLimits = {}
    if (profile_id) {
      const profile = await db
        .select()
        .from(session_profiles)
        .where(eq(session_profiles.id, parseInt(profile_id)))
        .limit(1)

      if (profile[0]) {
        profileLimits = profile[0].limits || {}
      }
    }

    // Insert vouchers
    const voucherInserts = credentials.map(({ username, password }) => ({
      router_id: parseInt(router_id),
      batch_id: newBatch.id,
      session_profiles_id: profile_id ? parseInt(profile_id) : null,
      general: { name: username, password },
      limits: profileLimits,
      statistics: {
        used_count: 0,
        used_bytes_in: 0,
        used_bytes_out: 0,
        last_used: null
      },
      status: 'unused' as const,
      comment,
      created_by: created_by ? parseInt(created_by) : null,
      synced_to_mikrotik: false
    }))

    // Insert vouchers in batches of 100 to avoid memory issues
    const batchSize = 100
    const insertedVouchers = []

    for (let i = 0; i < voucherInserts.length; i += batchSize) {
      const batch = voucherInserts.slice(i, i + batchSize)
      const result = await db.insert(vouchers).values(batch).returning()
      insertedVouchers.push(...result)
    }

    // Format vouchers for response
    const formattedVouchers = insertedVouchers.map(voucher => ({
      id: voucher.id,
      username: (voucher.general as any)?.name || '',
      password: (voucher.general as any)?.password || '',
      profile: newBatch.profile_id ? 'Profile' : 'No Profile',
      validity: 'Unlimited', // You might want to calculate this based on profile limits
      used: voucher.status === 'used'
    }))

    return NextResponse.json({
      success: true,
      message: `Batch berhasil dibuat dengan ${insertedVouchers.length} voucher`,
      data: {
        batch: newBatch,
        vouchers: formattedVouchers
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error in voucher batch API:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}