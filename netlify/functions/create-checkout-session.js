exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const { name, price, quantity = 1 } = JSON.parse(event.body || "{}");

    if (!name || !price) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing product information" }),
      };
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Stripe is not configured" }),
      };
    }

    const amount = Math.round(Number(price) * 100);

    if (!Number.isInteger(amount) || amount <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid price" }),
      };
    }

    const origin =
      event.headers.origin || "https://www.theeverlightchronicles.com";

    const params = new URLSearchParams();

    params.append("mode", "payment");
    params.append("success_url", `${origin}/?checkout=success`);
    params.append("cancel_url", `${origin}/?checkout=cancelled`);

    params.append("line_items[0][price_data][currency]", "usd");
    params.append(
      "line_items[0][price_data][product_data][name]",
      String(name)
    );
    params.append(
      "line_items[0][price_data][unit_amount]",
      String(amount)
    );
    params.append(
      "line_items[0][quantity]",
      String(Math.max(1, Number(quantity) || 1))
    );

    const response = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    );

    const session = await response.json();

    if (!response.ok) {
      console.error("Stripe error:", session);
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: session?.error?.message || "Stripe checkout failed",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: session.url,
      }),
    };
  } catch (error) {
    console.error("Checkout error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Unable to create checkout session",
      }),
    };
  }
};
