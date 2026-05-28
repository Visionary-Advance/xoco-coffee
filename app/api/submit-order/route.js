import { SquareClient, SquareEnvironment } from "square";
import crypto from "crypto";
import { getSquareAuth } from "@/lib/square-auth";

function safeStringify(obj) {
  return JSON.stringify(obj, (_, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
}

function isShopOpenServer() {
  // Online ordering window: 7 AM - 1 PM Pacific, Mon-Sat. Sunday closed.
  // Compute hour/day in Pacific time so Vercel's UTC server doesn't gate
  // orders against the wrong clock.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    weekday: 'short',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());

  const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const currentHour = parseInt(parts.find(p => p.type === 'hour').value, 10);
  const currentDay = weekdayMap[parts.find(p => p.type === 'weekday').value];

  if (currentDay === 0) return false;
  return currentHour >= 7 && currentHour < 13;
}

/**
 * Find an active Square Terminal device at the location
 */
async function findActiveDevice(client, locationId) {
  try {
    const response = await client.devices.list({
      locationId: locationId,
    });

    const devices = response.result?.devices || [];

    // Look for an active terminal device
    const activeDevice = devices.find(d =>
      d.status === 'ACTIVE' &&
      (d.product === 'SQUARE_TERMINAL' || d.product === 'SQUARE_REGISTER')
    );

    return activeDevice;
  } catch (error) {
    console.error('Error finding device:', error.message);
    return null;
  }
}

export async function POST(req) {
  try {
    if (!isShopOpenServer()) {
      return new Response(
        JSON.stringify({
          message: "Sorry, we're currently closed and cannot process orders.",
          type: "BusinessHoursError"
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { customerName, paymentMethod, orderDetails, locationId } = await req.json();

    // Validate required fields
    if (!customerName || !customerName.trim()) {
      throw new Error("Customer name is required");
    }

    if (!locationId) {
      throw new Error("locationId is required");
    }

    if (!orderDetails || !orderDetails.items || orderDetails.items.length === 0) {
      throw new Error("orderDetails.items is required and must not be empty");
    }

    if (paymentMethod !== 'instore') {
      throw new Error("This endpoint is only for in-store payment orders");
    }

    // Get auth from Supabase
    console.log('🔐 Getting Square credentials from Supabase...');
    const auth = await getSquareAuth();

    const client = new SquareClient({
      environment: process.env.SQUARE_ENVIRONMENT === 'production'
        ? SquareEnvironment.Production
        : SquareEnvironment.Sandbox,
      token: auth.accessToken,
    });

    // Use location from database if not provided
    const finalLocationId = locationId || auth.locationId;

    // Build line items
    const lineItems = orderDetails.items.map(item => {
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Item quantity must be greater than 0`);
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        throw new Error(`Item unitPrice must be greater than 0`);
      }

      let itemName = item.name;
      const sizeTemp = [item.size?.name, item.temperature].filter(Boolean).join(' ');
      if (sizeTemp) {
        itemName = `${sizeTemp} ${itemName}`;
      }

      const modifierDescriptions = [];
      if (item.modifiers && Array.isArray(item.modifiers)) {
        item.modifiers.forEach(modifier => {
          if (modifier.name) {
            modifierDescriptions.push(modifier.name);
          }
        });
      }

      const additionalDetails = [];
      if (modifierDescriptions.length > 0) {
        additionalDetails.push(...modifierDescriptions);
      }
      if (item.specialInstructions && item.specialInstructions.trim()) {
        additionalDetails.push(`Note: ${item.specialInstructions.trim()}`);
      }
      if (additionalDetails.length > 0) {
        itemName += ` (${additionalDetails.join(', ')})`;
      }

      const noteDetails = [];
      if (item.size?.name) noteDetails.push(`Size: ${item.size.name}`);
      if (item.temperature) noteDetails.push(`Temp: ${item.temperature}`);
      if (modifierDescriptions.length > 0) {
        noteDetails.push(`Extras: ${modifierDescriptions.join(', ')}`);
      }
      if (item.specialInstructions && item.specialInstructions.trim()) {
        noteDetails.push(`Instructions: ${item.specialInstructions.trim()}`);
      }

      return {
        name: itemName,
        quantity: item.quantity.toString(),
        itemType: "ITEM",
        basePriceMoney: {
          amount: BigInt(Math.round(item.unitPrice * 100)),
          currency: "USD",
        },
        note: noteDetails.length > 0 ? noteDetails.join(' | ') : undefined,
        variationName: sizeTemp || undefined,
      };
    });

    // Calculate total for terminal checkout
    const totalCents = orderDetails.items.reduce((total, item) => {
      return total + (Math.round(item.unitPrice * 100) * item.quantity);
    }, 0);

    // Build item summary for display
    const itemSummary = orderDetails.items.map(item => {
      let name = item.name;
      if (item.size?.name) name = `${item.size.name} ${name}`;
      return `${item.quantity}x ${name}`;
    }).join(', ');

    // STEP 1: Create the order first
    const orderRequest = {
      order: {
        locationId: finalLocationId,
        source: {
          name: "🌐 WEBSITE ORDER - Pay In Store"
        },
        state: "OPEN",
        fulfillments: [
          {
            type: "PICKUP",
            state: "PROPOSED",
            pickupDetails: {
              recipient: {
                displayName: customerName.trim()
              },
              note: `🌐 WEBSITE ORDER - ${customerName.trim()} - PAY IN STORE`,
              scheduleType: "ASAP",
            }
          }
        ],
        lineItems: lineItems,
        metadata: {
          source: "website",
          orderType: "pickup",
          paymentMethod: "instore",
          customerName: customerName.trim(),
        },
        note: `🌐 WEBSITE ORDER - ${customerName.trim()} - PAY IN STORE\n${itemSummary}`,
      },
      idempotencyKey: crypto.randomUUID(),
    };

    const orderResponse = await client.orders.create(orderRequest);

    if (orderResponse.errors && orderResponse.errors.length > 0) {
      console.error("Order creation errors:", safeStringify(orderResponse.errors));
      throw new Error(`Order creation failed: ${orderResponse.errors.map(e => e.detail || e.category).join('; ')}`);
    }

    const order = orderResponse.result?.order || orderResponse.body?.order || orderResponse.order;

    if (!order || !order.id) {
      console.error("Could not find order in response");
      throw new Error("Failed to create order - no order found in response");
    }

    const orderId = order.id;
    const totalAmount = order.totalMoney?.amount || order.total_money?.amount;
    console.log(`✅ Order created: ${orderId}`);

    // STEP 2: Try to create a Terminal Checkout to ring the device
    let terminalCheckoutId = null;
    let deviceNotified = false;

    try {
      // Find an active device
      const device = await findActiveDevice(client, finalLocationId);

      if (device) {
        console.log(`📱 Found active device: ${device.id} (${device.product})`);

        // Create terminal checkout - this will RING the device and show the order
        const checkoutResponse = await client.terminal.checkouts.create({
          idempotencyKey: crypto.randomUUID(),
          checkout: {
            deviceOptions: {
              deviceId: device.id,
              skipReceiptScreen: false,
              collectSignature: false,
              showItemizedCart: true,
            },
            amountMoney: {
              amount: BigInt(totalAmount || totalCents),
              currency: 'USD',
            },
            orderId: orderId,
            note: `🌐 WEBSITE: ${customerName.trim()} - ${itemSummary}`,
            deadlineDuration: 'PT30M', // 30 minute timeout
            paymentType: 'CARD_PRESENT',
          }
        });

        if (checkoutResponse.result?.checkout) {
          terminalCheckoutId = checkoutResponse.result.checkout.id;
          deviceNotified = true;
          console.log(`🔔 Terminal checkout created: ${terminalCheckoutId} - Device should ring!`);
        }
      } else {
        console.log('⚠️ No active Square Terminal found - order created but device not notified');
      }
    } catch (terminalError) {
      // Terminal errors are non-fatal - the order is still created
      console.error('Terminal notification error (non-fatal):', terminalError.message);
    }

    return Response.json({
      orderId: orderId,
      terminalCheckoutId: terminalCheckoutId,
      deviceNotified: deviceNotified,
      customerName: customerName.trim(),
      status: "OPEN",
      totalAmount: totalAmount?.toString(),
      currency: "USD",
      paymentMethod: "instore",
      orderSummary: itemSummary,
      message: deviceNotified
        ? "Order sent to register! Please pay when you pick up your order."
        : "Order received! Please pay when you pick up your order.",
      createdAt: order.created_at || order.createdAt || new Date().toISOString(),
    });

  } catch (error) {
    console.error("Order creation error:", error);
    
    const errorResponse = {
      message: error.message,
      type: error.constructor.name,
      details: error.errors
        ? error.errors.map(e => e.detail || e.category).join("; ")
        : "Unknown error",
    };

    if (error.body) {
      try {
        const errorBody = JSON.parse(error.body);
        errorResponse.squareErrors = errorBody.errors;
      } catch (parseError) {
        errorResponse.rawErrorBody = error.body;
      }
    }

    return new Response(
      JSON.stringify(errorResponse),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}