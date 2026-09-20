exports.handler = async function (event) {
  const token = process.env.printful_api_token;
  if (!token) return {statusCode:500,headers:{"content-type":"application/json"},body:JSON.stringify({error:"Printful API token is not configured."})};
  try {
    const productId=event.queryStringParameters&&event.queryStringParameters.id;
    const url=productId?`https://api.printful.com/store/products/${encodeURIComponent(productId)}`:"https://api.printful.com/store/products";
    const response=await fetch(url,{headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"}}); const data=await response.json();
    if(!response.ok)return{statusCode:response.status,headers:{"content-type":"application/json"},body:JSON.stringify({error:"Printful request failed.",details:data})};
    return{statusCode:200,headers:{"content-type":"application/json","cache-control":"public, max-age=60"},body:JSON.stringify(productId?{product:data.result}:{products:data.result||[]})};
  } catch(error){console.error("Printful products error:",error);return{statusCode:500,headers:{"content-type":"application/json"},body:JSON.stringify({error:"Unable to reach Printful."})};}
};
