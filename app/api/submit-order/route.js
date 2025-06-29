import { SquareClient, SquareEnvironment } from "square";
import crypto from "crypto";

function safeStringify(obj) {
  return JSON.stringify(obj, (_, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
}

function isShopOpenServer() {
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();
  
  const businessHours = {
    1: { open: 7, close: 20 },
    2: { open: 7, close: 20 },
    3: { open: 7, close: 20 },
    4: { open: 7, close: 20 },
    5: { open: 7, close: 20 },
    6: { open: 8, close: 21 },
    0: { open: 8, close: 18 }
  };
  
  const todayHours = businessHours[currentDay];
  return currentHour >= todayHours.open && currentHour < todayHours.close;
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

    const client = new SquareClient({
      environment: SquareEnvironment.Sandbox,
      token: process.env.SQUARE_ACCESS_TOKEN,
    });

   

    
    const orderRequest = {
      order: {
        locationId,
        source: {
          name: "**Pay In Store - Website"
        },
        state: "OPEN", // Explicitly set order state
        fulfillments: [
          {
            type: "PICKUP",
            state: "PROPOSED",
            pickupDetails: {
              recipient: {
                displayName: customerName.trim()
              },
              note: `Customer: ${customerName.trim()} - Pay in store on pickup`,
              scheduleType: "ASAP",
            }
          }
        ],
        lineItems: orderDetails.items.map(item => {
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
        }),
        metadata: {
          source: "website",
          orderType: "pickup", 
          paymentMethod: "instore",
          customerName: customerName.trim(),
          paymentStatus:'UNPAID'
        },
        // Add visible order note (correct field name)
        note: `PAY IN STORE - Customer: ${customerName.trim()}`,
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

   

    // STEP 2: Try creating a pending cash payment to make it visible in POS
    try {
     

      
      const pendingPaymentResponse = await client.payments.create({
        idempotencyKey: crypto.randomUUID(),
        sourceId: "EXTERNAL", // Use EXTERNAL for manual/cash payments
        locationId,
        orderId,
        amountMoney: {
          amount: BigInt(totalAmount || 0),
          currency: "USD",
        },
        note: `IN-STORE PAYMENT PENDING - Customer: ${customerName.trim()}`,
        // Use valid external type
        externalDetails: {
          type: "OTHER", // Use OTHER instead of CASH
          source: "In-store cash payment",
          sourceId: `instore-${orderId}`,
        },
        delayCapture: false, // Don't delay capture
      });

      if (pendingPaymentResponse.result?.payment) {
       
        
        // This should make the order visible in POS with payment status
        return Response.json({
          orderId: orderId,
          paymentId: pendingPaymentResponse.result.payment.id,
          customerName: customerName.trim(),
          status: "AWAITING_PAYMENT",
          totalAmount: totalAmount?.toString(),
          currency: "USD",
          paymentMethod: "instore",
          orderSummary: itemSummary,
          message: "Order received! Please pay when you pick up your order.",
          createdAt: order.created_at || order.createdAt || new Date().toISOString(),
        });
      }
    } catch (paymentError) {
      console.log("Pending payment creation failed:", paymentError.message);
      console.log("Payment error details:", safeStringify(paymentError));
      // Continue with regular order response if payment creation fails
    }

    const itemSummary = orderDetails.items.map(item => {
      let name = item.name;
      if (item.size?.name) name = `${item.size.name} ${name}`;
      return `${item.quantity}x ${name}`;
    }).join(', ');

    return Response.json({
      orderId: orderId,
      customerName: customerName.trim(),
      status: "OPEN",
      totalAmount: totalAmount?.toString(),
      currency: "USD",
      paymentMethod: "instore",
      orderSummary: itemSummary,
      message: "Order received! Please pay when you pick up your order.",
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