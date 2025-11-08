import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

/**
 * GET /api/purchase-orders
 * Get all purchase orders (filtered by project if specified)
 */
export async function GET(req) {
  const authResult = await requirePermission(req, 'purchaseOrders', 'read');
  
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const status = searchParams.get('status');
    
    let whereClause = {};
    
    if (projectId && projectId !== 'all') {
      whereClause.projectId = projectId;
    }
    
    if (status && status !== 'all') {
      whereClause.status = status.toUpperCase();
    }
    
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      where: whereClause,
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        linkedSalesOrder: {
          select: {
            id: true,
            number: true,
            total: true,
            status: true,
          },
        },
        lines: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
        _count: {
          select: {
            lines: true,
            vendorBills: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return NextResponse.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase orders' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/purchase-orders
 * Create a new purchase order
 */
export async function POST(req) {
  const authResult = await requirePermission(req, 'purchaseOrders', 'create');
  
  if (authResult.error) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }
  
  const { user } = authResult;
  
  try {
    const body = await req.json();
    const {
      number,
      partnerId,
      projectId,
      date,
      expectedDate,
      status,
      currency,
      note,
      lines,
      subtotal,
      taxTotal,
      total,
    } = body;
    
    // Validate required fields
    if (!number) {
      return NextResponse.json(
        { error: 'Purchase order number is required' },
        { status: 400 }
      );
    }
    
    // For requests (PENDING_APPROVAL), only projectId is required
    if (status !== 'PENDING_APPROVAL' && !partnerId) {
      return NextResponse.json(
        { error: 'Vendor is required for purchase orders' },
        { status: 400 }
      );
    }
    
    // Check if number already exists
    const existing = await prisma.purchaseOrder.findUnique({
      where: { number },
    });
    
    if (existing) {
      return NextResponse.json(
        { error: 'Purchase order number already exists' },
        { status: 400 }
      );
    }
    
    // Build purchase order data
    const purchaseOrderData = {
      number,
      partnerId: partnerId || null,
      projectId: projectId || null,
      date: date ? new Date(date) : new Date(),
      expectedDate: expectedDate ? new Date(expectedDate) : null,
      status: status || 'DRAFT',
      currency: currency || 'INR',
      note: note || null,
      subtotal: parseFloat(subtotal) || 0,
      taxTotal: parseFloat(taxTotal) || 0,
      total: parseFloat(total) || 0,
    };
    
    // If creating a request, add approval workflow fields
    if (status === 'PENDING_APPROVAL') {
      purchaseOrderData.requestedById = user.id;
      purchaseOrderData.requestedAt = new Date();
    }
    
    // Create purchase order with lines and activity log
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        ...purchaseOrderData,
        lines: lines && lines.length > 0 ? {
          create: lines.map(line => ({
            productId: line.productId || null,
            description: line.description,
            quantity: parseFloat(line.quantity) || 1,
            unit: line.unit,
            unitPrice: parseFloat(line.unitPrice),
            taxPercent: line.taxPercent ? parseFloat(line.taxPercent) : null,
            amount: parseFloat(line.amount),
          })),
        } : undefined,
        activities: {
          create: {
            userId: user.id,
            action: 'CREATED',
            comment: `Purchase order ${number} created`,
            metadata: {
              total: parseFloat(total) || 0,
              status: status || 'DRAFT',
            },
          },
        },
      },
      include: {
        partner: true,
        project: true,
        requestedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        lines: {
          include: {
            product: true,
          },
        },
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    });
    
    return NextResponse.json(purchaseOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    return NextResponse.json(
      { error: 'Failed to create purchase order' },
      { status: 500 }
    );
  }
}
