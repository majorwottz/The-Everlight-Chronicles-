async function startCheckout(variantId, quantity) {
  try {
    if (!variantId) throw new Error("Please select a size.");
    const safeQuantity = Math.max(1, Math.min(10, Number(quantity) || 1));
    const response = await fetch("/.netlify/functions/create-checkout-session", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({variantId,quantity:safeQuantity})});
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to start checkout");
    if (!data.url) throw new Error("Checkout URL was not returned");
    window.location.href = data.url;
  } catch (error) { console.error("Checkout error:", error); alert(error.message || "Checkout could not be started. Please try again."); }
}

// Shared responsive navigation for pages that do not load the homepage script.
const sharedNav = document.querySelector('.nav');
const sharedMenu = document.querySelector('.menu');
if (sharedNav && sharedMenu && typeof sharedMenu.onclick !== 'function') {
  const setSharedMenu = (open) => {
    sharedNav.classList.toggle('open', open);
    sharedMenu.setAttribute('aria-expanded', open ? 'true' : 'false');
    sharedMenu.textContent = open ? '×' : '☰';
    sharedMenu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  sharedMenu.onclick = () => setSharedMenu(!sharedNav.classList.contains('open'));
  sharedNav.querySelectorAll('nav a').forEach(link => link.addEventListener('click', () => setSharedMenu(false)));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') setSharedMenu(false); });
  document.addEventListener('click', event => {
    if (sharedNav.classList.contains('open') && !sharedNav.contains(event.target)) setSharedMenu(false);
  });
}
async function getProductDetails(productId){const response=await fetch(`/api/printful/products?id=${encodeURIComponent(productId)}`);const data=await response.json();if(!response.ok)throw new Error(data.error||"Unable to load product sizes");return data.product;}
async function loadProducts(){const root=document.getElementById("products");if(!root)return;try{const res=await fetch("/api/printful/products");const data=await res.json();if(!res.ok)throw new Error(data.error||"Unable to load products");const products=data.products||[];if(!products.length){root.innerHTML='<div class="loading">The Everlight Chronicles website store is connected. Add products in Printful and they will appear here.</div>';return;}root.innerHTML=products.map((p,index)=>{const img=p.thumbnail_url||p.thumbnail||"";const name=p.name||"Everlight Merchandise";return `<article class="product" data-product-index="${index}">${img?`<img src="${img}" alt="${name.replace(/"/g,"&quot;")}">`:""}<h3>${name}</h3><p>Official Everlight Chronicles merchandise.</p><div class="product-options"><label for="size-${index}">Size</label><label for="quantity-${index}">Quantity</label><select id="size-${index}" class="size-select" data-size-index="${index}" disabled><option value="">Loading sizes...</option></select><select id="quantity-${index}" class="quantity-select" data-quantity-index="${index}"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div><button type="button" class="buy-button" data-buy-index="${index}" disabled>BUY NOW</button></article>`;}).join("");await Promise.all(products.map(async(product,index)=>{const select=root.querySelector(`[data-size-index="${index}"]`);const quantitySelect=root.querySelector(`[data-quantity-index="${index}"]`);const button=root.querySelector(`[data-buy-index="${index}"]`);try{const details=await getProductDetails(product.id);const variants=details.sync_variants||[];const activeVariants=variants.filter(v=>v.availability_status!=="inactive");if(!activeVariants.length){select.innerHTML='<option value="">Unavailable</option>';return;}select.innerHTML='<option value="">Choose size</option>'+activeVariants.map((variant,i)=>`<option value="${variant.id}">${variant.size||variant.name||`Option ${i+1}`}</option>`).join("");select.disabled=false;select.addEventListener("change",()=>{button.disabled=!select.value;});button.addEventListener("click",()=>{const variantId=select.value;const quantity=Number(quantitySelect.value)||1;if(!variantId){alert("Please choose a size first.");return;}startCheckout(variantId,quantity);});}catch(error){console.error("Unable to load variants:",error);select.innerHTML='<option value="">Sizes unavailable</option>';button.disabled=true;}}));}catch(error){console.error(error);root.innerHTML='<div class="loading">Shop could not be loaded. Please try again.</div>';}}
loadProducts();
