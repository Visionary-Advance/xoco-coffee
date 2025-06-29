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
    1: { open: 7, close: 20 },  // Monday
    2: { open: 7, close: 20 },  // Tuesday
    3: { open: 7, close: 20 },  // Wednesday
    4: { open: 7, close: 20 },  // Thursday
    5: { open: 7, close: 20 },  // Friday
    6: { open: 8, close: 21 },  // Saturday
    0: { open: 8, close: 18 }   // Sunday
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
    
    // EXTRACT THE AMOUNT FROM THE REQUEST (includes tip)
    const { sourceId, customerName, paymentMethod, orderDetails, locationId, amount } = await req.json();

  

    // Validate required fields
    if (!customerName || !customerName.trim()) {
      throw new Error("Customer name is required");
    }

    if (!locationId) {
      throw new Error("locationId is required");
    }

    // Validate order details
    if (!orderDetails || !orderDetails.items || orderDetails.items.length === 0) {
      throw new Error("orderDetails.items is required and must not be empty");
    }

    // Validate amount (should include tip)
    if (!amount || amount <= 0) {
      throw new Error("Amount is required and must be greater than 0");
    }

    const client = new SquareClient({
      environment: SquareEnvironment.Sandbox,
      token: process.env.SQUARE_ACCESS_TOKEN,
    });

    // Calculate order total (items only) for comparison
    const calculatedOrderTotal = orderDetails.items.reduce((total, item) => {
      return total + (Math.round(item.unitPrice * 100) * item.quantity);
    }, 0);


    // STEP 1: CREATE ORDER IN SQUARE WITH TIP AS A LINE ITEM
   
    
    // Build line items array starting with the regular items
    const lineItems = orderDetails.items.map(item => {
     
      
      // Validate item
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Item quantity must be greater than 0`);
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        throw new Error(`Item unitPrice must be greater than 0`);
      }

      // Build descriptive name with size, temperature, modifiers, and special instructions
      let itemName = item.name;
      
      // Add size and temperature to the name
      const sizeTemp = [item.size?.name, item.temperature].filter(Boolean).join(' ');
      if (sizeTemp) {
        itemName = `${sizeTemp} ${itemName}`;
      }

      // Collect modifiers
      const modifierDescriptions = [];
      if (item.modifiers && Array.isArray(item.modifiers)) {
        item.modifiers.forEach(modifier => {
          if (modifier.name) {
            modifierDescriptions.push(modifier.name);
          }
        });
      }

      // Build final item name with modifiers and special instructions
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

      // Build comprehensive note for kitchen/staff
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

    // ADD TIP AS A LINE ITEM if there's a tip
    const tipAmount = amount - calculatedOrderTotal;
    if (tipAmount > 0) {
     
      lineItems.push({
        name: "Tip",
        quantity: "1",
        itemType: "ITEM",
        basePriceMoney: {
          amount: BigInt(tipAmount),
          currency: "USD",
        },
        note: "Customer tip"
      });
    }

    const orderRequest = {
      order: {
        locationId,
        source: {
          name: paymentMethod === 'online' ? "Website - Online Payment" : "Website"
        },
        fulfillments: [
          {
            type: "PICKUP",
            state: "PROPOSED", 
            pickupDetails: {
              recipient: {
                displayName: customerName.trim()
              },
              note: `Customer: ${customerName.trim()}`,
              scheduleType: "ASAP",
            }
          }
        ],
        lineItems: lineItems, // This now includes tip as a line item
        metadata: {
          source: "website",
          orderType: "pickup",
          paymentMethod: paymentMethod || "online",
          customerName: customerName.trim(),
          tipAmount: tipAmount.toString(),
        },
        orderNote: `Customer: ${customerName.trim()}${tipAmount > 0 ? ` (includes $${(tipAmount / 100).toFixed(2)} tip)` : ''}`,
      },
      idempotencyKey: crypto.randomUUID(),
    };

  

    const orderResponse = await client.orders.create(orderRequest);
    
    

    // Check for order creation errors
    if (orderResponse.errors && orderResponse.errors.length > 0) {
      console.error("Order creation errors:", safeStringify(orderResponse.errors));
      throw new Error(`Order creation failed: ${orderResponse.errors.map(e => e.detail || e.category).join('; ')}`);
    }

    // Extract order data
    const order = orderResponse.result?.order || orderResponse.body?.order || orderResponse.order;
    
    if (!order || !order.id) {
      console.error("Could not find order in response");
      throw new Error("Failed to create order - no order found in response");
    }

    const orderId = order.id;
    const orderTotalAmount = order.totalMoney?.amount || order.total_money?.amount;

   

    const orderReference = crypto.randomUUID();

    // Build item summary for payment note (excluding tip line item for readability)
    const itemSummary = orderDetails.items.map(item => {
      let name = item.name;
      if (item.size?.name) name = `${item.size.name} ${name}`;
      return `${item.quantity}x ${name}`;
    }).join(', ');

    const tipNote = tipAmount > 0 ? ` + $${(tipAmount / 100).toFixed(2)} tip` : '';

    // Use the order total amount (which now includes tip) for the payment
    const paymentAmount = orderTotalAmount || amount;

    const paymentResponse = await client.payments.create({
      idempotencyKey: crypto.randomUUID(),
      sourceId,
      locationId,
      orderId, // Links the payment to the order
      referenceId: orderReference,
      amountMoney: {
        amount: BigInt(paymentAmount), // Use order total (which includes tip)
        currency: "USD",
      },
      note: `Online Order - ${customerName.trim()}: ${itemSummary}${tipNote}`,
    });

    

    if (paymentResponse.errors && paymentResponse.errors.length > 0) {
      console.error("Payment creation errors:", safeStringify(paymentResponse.errors));
      throw new Error(`Payment failed: ${paymentResponse.errors.map(e => e.detail || e.category).join('; ')}`);
    }

    // Extract payment data
    const payment = paymentResponse.result?.payment || paymentResponse.body?.payment || paymentResponse.payment;

    if (!payment) {
      console.error("Could not find payment in response");
      throw new Error("Payment failed - no payment found in response");
    }

    const finalPaymentAmount = payment.amount_money?.amount || payment.amountMoney?.amount;

   

    return Response.json({
      id: payment.id,
      status: payment.status,
      amount: finalPaymentAmount?.toString(),
      currency: payment.amount_money?.currency || payment.amountMoney?.currency || "USD",
      cardDetails: payment.card_details || payment.cardDetails ? {
        card: {
          cardBrand: (payment.card_details?.card || payment.cardDetails?.card)?.card_brand,
          last4: (payment.card_details?.card || payment.cardDetails?.card)?.last_4 || (payment.card_details?.card || payment.cardDetails?.card)?.last4,
        }
      } : null,
      receiptUrl: payment.receipt_url || payment.receiptUrl,
      createdAt: payment.created_at || payment.createdAt,
      orderReference,
      orderId,
      orderSummary: itemSummary,
      customerName: customerName.trim(),
      paymentMethod: paymentMethod || "online",
      orderTotal: (calculatedOrderTotal / 100).toFixed(2), // Items only (for display)
      tipAmount: (tipAmount / 100).toFixed(2), // Tip amount in dollars (for display)
      totalCharged: (Number(finalPaymentAmount) / 100).toFixed(2), // Total charged (for display)
    });

  } catch (error) {
    console.error("Payment error:", error);
    
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