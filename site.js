async function startCheckout(variantId) {
  try {
    if (!variantId) {
      throw new Error("Please select a size.");
    }

    const response = await fetch(
      "/.netlify/functions/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ variantId })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Unable to start checkout");
    }

    if (!data.url) {
      throw new Error("Checkout URL was not returned");
    }

    window.location.href = data.url;
  } catch (error) {
    console.error("Checkout error:", error);
    alert(error.message || "Checkout could not be started. Please try again.");
  }
}

async function getProductDetails(productId) {
  const response = await fetch(
    `/api/printful/products?id=${encodeURIComponent(productId)}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Unable to load product sizes");
  }

  return data.product;
}

async function loadProducts() {
  const root = document.getElementById("products");
  if (!root) return;

  try {
    const res = await fetch("/api/printful/products");
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Unable to load products");
    }

    const products = data.products || [];

    if (!products.length) {
      root.innerHTML =
        '<div class="loading">The Everlight Chronicles website store is connected. Add products in Printful and they will appear here.</div>';
      return;
    }

    root.innerHTML = products.map((p, index) => {
      const img = p.thumbnail_url || p.thumbnail || "";
      const name = p.name || "Everlight Merchandise";

      return `
        <article class="product" data-product-index="${index}">
          ${img ? `<img src="${img}" alt="${name.replace(/"/g, "&quot;")}">` : ""}
          <h3>${name}</h3>
          <p>Official Everlight Chronicles merchandise.</p>
          <div class="product-options">
            <label for="size-${index}">Size</label>
            <select
              id="size-${index}"
              class="size-select"
              data-size-index="${index}"
              disabled
            >
              <option value="">Loading sizes...</option>
            </select>
          </div>
          <button
            type="button"
            class="buy-button"
            data-buy-index="${index}"
            disabled
          >
            BUY NOW
          </button>
        </article>
      `;
    }).join("");

    await Promise.all(
      products.map(async (product, index) => {
        const select = root.querySelector(`[data-size-index="${index}"]`);
        const button = root.querySelector(`[data-buy-index="${index}"]`);

        try {
          const details = await getProductDetails(product.id);
          const variants = details.sync_variants || [];
          const activeVariants = variants.filter(
            variant => variant.availability_status !== "inactive"
          );

          if (!activeVariants.length) {
            select.innerHTML = '<option value="">Unavailable</option>';
            return;
          }

          select.innerHTML =
            '<option value="">Choose size</option>' +
            activeVariants.map((variant, variantIndex) => {
              const size =
                variant.size ||
                variant.name ||
                `Option ${variantIndex + 1}`;

              return `<option value="${variant.id}">${size}</option>`;
            }).join("");

          select.disabled = false;

          select.addEventListener("change", () => {
            button.disabled = !select.value;
          });

          button.addEventListener("click", () => {
            const variantId = select.value;

            if (!variantId) {
              alert("Please choose a size first.");
              return;
            }

            startCheckout(variantId);
          });
        } catch (error) {
          console.error("Unable to load variants:", error);
          select.innerHTML = '<option value="">Sizes unavailable</option>';
          button.disabled = true;
        }
      })
    );
  } catch (error) {
    console.error(error);
    root.innerHTML =
      '<div class="loading">Shop could not be loaded. Please try again.</div>';
  }
}

loadProducts();
