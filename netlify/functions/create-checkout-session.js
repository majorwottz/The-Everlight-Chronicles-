exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const variantId = body.variantId;

    if (!variantId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Please select a size." }),
      };
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const printfulToken = process.env.printful_api_token;

    if (!stripeKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Stripe is not configured." }),
      };
    }

    if (!printfulToken) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Printful is not configured." }),
      };
    }

    // Get the selected variant directly from Printful.
    const printfulResponse = await fetch(
      `https://api.printful.com/store/variants/${variantId}`,
      {
        headers: {
          Authorization: `Bearer ${printfulToken}`,
        },
      }
    );

    const printfulData = await printfulResponse.json();

    if (!printfulResponse.ok || !printfulData.result) {
      console.error("Printful variant error:", printfulData);

      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Unable to load the selected product size.",
        }),
      };
    }

    const variant = printfulData.result;

    const name =
      variant.name ||
      variant.product?.name ||
      "Everlight Chronicles Merchandise";

    const price = variant.retail_price;

    if (!price) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Printful did not return a retail price.",
        }),
      };
    }

    const amount = Math.round(Number(price) * 100);

    if (!Number.isInteger(amount) || amount <= 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid product price." }),
      };
    }

    const origin =
      event.headers.origin || "https://www.theeverlightchronicles.com";

    const params = new URLSearchParams();

    params.append("mode", "payment");
    params.append("success_url", `${origin}/?checkout=success`);
    params.append("cancel_url", `${origin}/?checkout=cancelled`);

    params.append(
      "line_items[0][price_data][currency]",
      "usd"
    );

    params.append(
      "line_items[0][price_data][product_data][name]",
      String(name)
    );

    params.append(
      "line_items[0][price_data][unit_amount]",
      String(amount)
    );

    params.append("line_items[0][quantity]", "1");

    const stripeResponse = await fetch(
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

    const session = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error("Stripe error:", session);

      return {
        statusCode: stripeResponse.status,
        body: JSON.stringify({
          error:
            session?.error?.message ||
            "Stripe checkout failed.",
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
        error: "Unable to create checkout session.",
      }),
    };
  }
};
