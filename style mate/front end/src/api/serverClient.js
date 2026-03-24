
// Simple client to call your own server API at /api/*
// Replaces base44 usage for local server development.
// Uses fetch and returns simple JSON results.
// Note: adapt auth handling (tokens/cookies) as needed.

async function handleResponse(res){
  const ct = res.headers.get('content-type') || '';
  if (!res.ok) {
    let body = ct.includes('application/json') ? await res.json().catch(()=>null) : await res.text().catch(()=>null);
    const err = new Error(body && body.message ? body.message : res.statusText || 'API error');
    err.status = res.status;
    err.body = body;
    throw err;
  }
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

export const serverClient = {
  auth: {
    async me(){ return handleResponse(await fetch('/api/auth/me')); },
    async login(data){ return handleResponse(await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})); },
    async signup(data){ return handleResponse(await fetch('/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})); },
    async logout(){ return handleResponse(await fetch('/api/auth/logout',{method:'POST'})); },
    async updateMe(data){ return handleResponse(await fetch('/api/auth/me',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})); }
  },
  entities: {
    WardrobeItem: {
      async list(order){ return handleResponse(await fetch('/api/wardrobe')); },
      async create(data){ return handleResponse(await fetch('/api/wardrobe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})); },
      async delete(id){ return handleResponse(await fetch(`/api/wardrobe/${id}`,{method:'DELETE'})); }
    },
    OutfitCombination: {
      async list(){ return handleResponse(await fetch('/api/outfits')); },
      async create(data){ return handleResponse(await fetch('/api/outfits',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})); },
      async update(id,data){ return handleResponse(await fetch(`/api/outfits/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})); }
    },
    OutfitPlan: {
      async list(){ return handleResponse(await fetch('/api/plans')); },
      async create(data){ return handleResponse(await fetch('/api/plans',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})); }
    }
  },
  integrations: {
    Core: {
      async UploadFile({file}){
        // file can be a File object from browser; here we expect frontend to call /api/upload via FormData
        throw new Error("Use /api/upload endpoint directly from frontend (form submit). This helper is placeholder.");
      },
      async InvokeLLM(opts){
        // call server LLM endpoints
        return handleResponse(await fetch('/api/llm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(opts)
        }));
      }
    }
  }
};

export default serverClient;
