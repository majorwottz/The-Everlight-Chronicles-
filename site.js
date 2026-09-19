async function startCheckout(product) {
  try {
    const response = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
  name: product.name,
  price: product.retail_price || product.price,
  quantity: 1
})
    })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Unable to start checkout');
    }

    if (data.url) {
      window.location.href = data.url;
      return;
    }

    throw new Error('Checkout URL was not returned');
  } catch (error) {
    console.error('Checkout error:', error);
    alert('Checkout could not be started. Please try again.');
  }
}

async function loadProducts() {
  const root = document.getElementById('products');

  if (!root) return;

  try {
    const res = await fetch('/api/printful/products');
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Unable to load products');
    }

    const products = data.products || [];

    if (!products.length) {
      root.innerHTML =
        '<div class="loading">The Everlight Chronicles website store is connected. Add products in Printful and they will appear here.</div>';
      return;
    }

    root.innerHTML = products.map((p, index) => {
      const img = p.thumbnail_url || p.thumbnail || '';
      const name = p.name || 'Everlight Merchandise';

      return `
        <article class="product" data-product-index="${index}">
          ${img ? `<img src="${img}" alt="${name.replace(/"/g, '&quot;')}">` : ''}
          <h3>${name}</h3>
          <p>Official Everlight Chronicles merchandise.</p>
          <button
            type="button"
            class="buy-button"
            data-buy-index="${index}">
            BUY NOW
          </button>
        </article>
      `;
    }).join('');

    root.querySelectorAll('[data-buy-index]').forEach(button => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.buyIndex);
        startCheckout(products[index]);
      });
    });

  } catch (e) {
    console.error(e);

    root.innerHTML =
      '<div class="loading">Shop preview is ready. Printful connection will be verified on the Netlify preview deployment.</div>';
  }
}

loadProducts();
