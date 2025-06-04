import { SquareClient, SquareEnvironment } from "square";
import crypto from "crypto";

function safeStringify(obj) {
  return JSON.stringify(obj, (_, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
}

export async function POST(req) {
  try {
    const { sourceId, orderDetails, locationId } = await req.json();

    console.log("Request data:", { sourceId, orderDetails, locationId });

    if (!locationId) {
      throw new Error("locationId is required");
    }

    // Validate order details
    if (!orderDetails || !orderDetails.items || orderDetails.items.length === 0) {
      throw new Error("orderDetails.items is required and must not be empty");
    }

    // Enhanced item processing to include modifiers and better naming
    const itemsWithDetails = orderDetails.items.map((item, index) => {
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Item ${index}: quantity must be greater than 0`);
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        throw new Error(`Item ${index}: unitPrice must be greater than 0`);
      }

      // Build a descriptive name that includes size, temperature, and modifiers
      let itemName = item.name;
      
      // Add size and temperature to the name
      const sizeTemp = [item.size, item.temperature].filter(Boolean).join(' ');
      if (sizeTemp) {
        itemName = `${sizeTemp} ${itemName}`;
      }

      // Calculate modifier total and build modifier descriptions
      let modifierTotal = 0;
      const modifierDescriptions = [];
      
      if (item.modifiers && Array.isArray(item.modifiers)) {
        item.modifiers.forEach(modifier => {
          if (modifier.price) {
            modifierTotal += parseFloat(modifier.price) || 0;
          }
          if (modifier.name) {
            modifierDescriptions.push(modifier.name);
          }
        });
      }

      // Add modifier descriptions to item name if any exist
      if (modifierDescriptions.length > 0) {
        itemName += ` (${modifierDescriptions.join(', ')})`;
      }

      // Calculate total price including modifiers
      const basePrice = parseFloat(item.unitPrice);
      const totalPricePerUnit = basePrice + modifierTotal;

      return {
        ...item,
        name: itemName,
        quantity: parseInt(item.quantity),
        unitPrice: totalPricePerUnit, // Include modifier costs
        basePrice: basePrice,
        modifierTotal: modifierTotal,
        modifierDescriptions: modifierDescriptions
      };
    });

    console.log("Items with details:", itemsWithDetails);

    const client = new SquareClient({
      environment: SquareEnvironment.Sandbox,
      token: process.env.SQUARE_ACCESS_TOKEN,
    });

    console.log("Using locationId:", locationId);

    // Create order with enhanced line items
    const orderRequest = {
      order: {
        locationId,
        lineItems: itemsWithDetails.map(item => {
          const lineItem = {
            name: item.name,
            quantity: item.quantity.toString(),
            basePriceMoney: {
              amount: BigInt(Math.round(item.unitPrice * 100)),
              currency: "USD",
            },
          };

          // Add note with additional details if there are modifiers
          if (item.modifierDescriptions.length > 0) {
            lineItem.note = `Size: ${item.size || 'N/A'}, Temp: ${item.temperature || 'N/A'}, Extras: ${item.modifierDescriptions.join(', ')}`;
          } else if (item.size || item.temperature) {
            lineItem.note = `Size: ${item.size || 'N/A'}, Temperature: ${item.temperature || 'N/A'}`;
          }

          // Add variation name if we have size/temperature info
          if (item.size || item.temperature) {
            lineItem.variationName = [item.size, item.temperature].filter(Boolean).join(' ');
          }

          return lineItem;
        }),
       
      },
      idempotencyKey: crypto.randomUUID(),
    };

    console.log("Order request:", safeStringify(orderRequest));

    console.log("Making order creation request...");
    const orderResponse = await client.orders.create(orderRequest);
    
    console.log("Order response status:", orderResponse.statusCode);
    console.log("Full order response:", safeStringify(orderResponse));

    // Check for errors in the response
    if (orderResponse.errors && orderResponse.errors.length > 0) {
      console.error("Order creation errors:", safeStringify(orderResponse.errors));
      throw new Error(`Order creation failed: ${orderResponse.errors.map(e => e.detail || e.category).join('; ')}`);
    }

    // Try multiple ways to access the order data
    let order = null;
    let orderId = null;
    let totalAmount = null;

    if (orderResponse.result?.order) {
      order = orderResponse.result.order;
      console.log("Found order in result.order");
    } else if (orderResponse.body?.order) {
      order = orderResponse.body.order;
      console.log("Found order in body.order");
    } else if (orderResponse.order) {
      order = orderResponse.order;
      console.log("Found order directly in response");
    }

    if (order) {
      orderId = order.id;
      totalAmount = order.totalMoney?.amount || order.total_money?.amount;
      console.log("Extracted order data:", { orderId, totalAmount });
    }

    if (!order || !orderId) {
      console.error("Could not find order in response structure");
      console.error("Available response keys:", Object.keys(orderResponse));
      if (orderResponse.result) {
        console.error("Available result keys:", Object.keys(orderResponse.result));
      }
      throw new Error("Failed to create order - no order found in response");
    }

    const amount = BigInt(totalAmount || 0);

    console.log("Order created successfully:", { orderId, amount: amount.toString() });

    if (!amount || amount <= 0n) {
      throw new Error(`Invalid or missing total amount in order response: ${amount}`);
    }

    const orderReference = crypto.randomUUID();

    // Create payment
    console.log("Creating payment with data:", {
      sourceId,
      locationId,
      orderId,
      amount: amount.toString()
    });

    // Build a descriptive note for the payment
    const itemSummary = itemsWithDetails.map(item => 
      `${item.quantity}x ${item.name}`
    ).join(', ');

    const paymentResponse = await client.payments.create({
      idempotencyKey: crypto.randomUUID(),
      sourceId,
      locationId,
      orderId,
      referenceId: orderReference,
      amountMoney: {
        amount,
        currency: "USD",
      },
      note: `Order: ${itemSummary}`,
    });

    console.log("Payment response status:", paymentResponse.statusCode);
    console.log("Full payment response:", safeStringify(paymentResponse));

    if (paymentResponse.errors && paymentResponse.errors.length > 0) {
      console.error("Payment creation errors:", safeStringify(paymentResponse.errors));
      throw new Error(`Payment failed: ${paymentResponse.errors.map(e => e.detail || e.category).join('; ')}`);
    }

    // Try multiple ways to access the payment data
    let payment = null;

    if (paymentResponse.result?.payment) {
      payment = paymentResponse.result.payment;
      console.log("Found payment in result.payment");
    } else if (paymentResponse.body?.payment) {
      payment = paymentResponse.body.payment;
      console.log("Found payment in body.payment");
    } else if (paymentResponse.payment) {
      payment = paymentResponse.payment;
      console.log("Found payment directly in response");
    }

    if (!payment) {
      console.error("Could not find payment in response structure");
      console.error("Available response keys:", Object.keys(paymentResponse));
      if (paymentResponse.result) {
        console.error("Available result keys:", Object.keys(paymentResponse.result));
      }
      throw new Error("Payment failed - no payment found in response");
    }

    console.log("Payment successful:", {
      id: payment.id,
      status: payment.status,
      amount: payment.amount_money?.amount || payment.amountMoney?.amount
    });

    return Response.json({
      id: payment.id,
      status: payment.status,
      amount: (payment.amount_money?.amount || payment.amountMoney?.amount)?.toString(),
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
      orderSummary: itemSummary, // Include order summary in response
    });

  } catch (error) {
    console.error("Payment error:", error);
    
    // Enhanced error response
    const errorResponse = {
      message: error.message,
      type: error.constructor.name,
      details: error.errors
        ? error.errors.map(e => e.detail || e.category).join("; ")
        : "Unknown error",
    };

    // Include Square API errors if available
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