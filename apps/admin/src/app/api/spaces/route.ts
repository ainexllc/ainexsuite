import { NextRequest, NextResponse } from 'next/server';
import { db as adminDb } from '@ainexsuite/firebase/admin';
import type { Space, SpaceType } from '@ainexsuite/types';

/**
 * List all spaces with pagination, search, and filter support.
 * GET /api/spaces
 *
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - search: string (searches name)
 * - type: SpaceType (filter by type)
 * - sortBy: 'name' | 'createdAt' | 'updatedAt' | 'type' (default: 'createdAt')
 * - sortOrder: 'asc' | 'desc' (default: 'desc')
 * - adminUid: string (required for auth)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Auth check
    const adminUid = searchParams.get('adminUid');
    if (!adminUid) {
      return NextResponse.json(
        { error: 'Admin UID is required' },
        { status: 401 }
      );
    }

    // Verify the requester is an admin
    const adminDoc = await adminDb.collection('users').doc(adminUid).get();
    if (!adminDoc.exists || adminDoc.data()?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Parse query params
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const search = searchParams.get('search')?.toLowerCase() || '';
    const typeFilter = searchParams.get('type') as SpaceType | null;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build query
    let query = adminDb.collection('spaces') as FirebaseFirestore.Query;

    // Apply type filter if provided
    if (typeFilter) {
      query = query.where('type', '==', typeFilter);
    }

    // Apply sorting
    const validSortFields = ['name', 'createdAt', 'updatedAt', 'type'];
    const actualSortBy = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    query = query.orderBy(actualSortBy, sortOrder);

    // Get all matching documents for counting and search filtering
    const snapshot = await query.get();

    // Filter by search term (client-side since Firestore doesn't support LIKE)
    let filteredDocs = snapshot.docs;
    if (search) {
      filteredDocs = snapshot.docs.filter((doc) => {
        const data = doc.data();
        const name = (data.name || '').toLowerCase();
        const description = (data.description || '').toLowerCase();
        const ownerEmail = (data.ownerEmail || '').toLowerCase();
        return name.includes(search) || description.includes(search) || ownerEmail.includes(search);
      });
    }

    const total = filteredDocs.length;

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedDocs = filteredDocs.slice(startIndex, startIndex + limit);

    // Map to Space objects
    const spaces: Space[] = paginatedDocs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Space[];

    return NextResponse.json({
      spaces,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('List spaces error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list spaces' },
      { status: 500 }
    );
  }
}
