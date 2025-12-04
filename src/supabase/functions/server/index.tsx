// MiniStock - No backend needed, uses localStorage only
Deno.serve(() => new Response('{"status":"ok","message":"MiniStock uses localStorage only"}', {
  headers: { 'Content-Type': 'application/json' }
}));
