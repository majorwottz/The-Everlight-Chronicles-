// Server-side Printful product proxy for The Everlight Chronicles.
// The private Printful token is stored in Netlify as `printful_api_token`.

exports.handler = async function () {
  const token = process.env.printful_api_token;

  if (!token) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Printful API token is not configured." }),
    };
  }

  try {
    const response = await fetch("https://api.printful.com/store/products", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          error: "Printful request failed.",
          details: data,
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
        "cache-control": "public, max-age=60",
      },
      body: JSON.stringify({ products: data.result || [] }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Unable to reach Printful." }),
    };
  }
};
