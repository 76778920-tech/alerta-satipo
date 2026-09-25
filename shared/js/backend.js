/* Supabase se activa solo con configuracion explicita; un fallo nunca activa la demo. */
window.SatipoBackend = (() => {
  let client = null, config = null, profile = null;
  const base = new URL('../../', document.currentScript.src);
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const ready = (async () => {
    const response = await fetch(new URL('config/public.json', base), { cache: 'no-store' });
    if (!response.ok) throw new Error('Falta configurar el aplicativo. Ejecuta npm run configure.');
    config = await response.json();
    if (!['demo','supabase'].includes(config.mode)) throw new Error('Modo de datos no válido.');
    if (config.mode === 'supabase') {
      if (!config.supabaseUrl || !config.supabasePublishableKey) throw new Error('Configuración de Supabase incompleta.');
      client = window.createSupabaseClient(config.supabaseUrl, config.supabasePublishableKey);
      client.auth.onAuthStateChange(event => {
        if (event === 'SIGNED_OUT') {
          profile = null;
          sessionStorage.clear();
          if (!location.pathname.endsWith('/login.html')) location.replace(new URL('shared/login.html', base));
        }
      });
    }
  })();
  // El consumidor recibe el error al esperar ready; evita rejection sin observador inicial.
  ready.catch(() => {});
  const check = result => { if (result.error) throw result.error; return result.data; };
  async function identify() {
    await ready;
    if (!client) return null;
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return null;
    const admin = check(await client.from('administradores').select('id,display_name').eq('id', data.user.id).maybeSingle());
    const person = check(await client.from('clientes').select('*').eq('id', data.user.id).single());
    profile = { ...person, email: data.user.email, role: admin ? 'admin' : 'user', name: admin?.display_name || person.full_name };
    sessionStorage.setItem('userRole', profile.role);
    sessionStorage.setItem('userEmail', profile.email);
    sessionStorage.setItem('userName', profile.name);
    return profile;
  }
  async function guard(role) {
    await ready;
    if (client) {
      const user = await identify();
      if (!user) { location.replace(new URL('shared/login.html', base)); return false; }
      if (role === 'admin' && user.role !== 'admin') {
        await client.auth.signOut({scope:'local'});
        sessionStorage.clear();
        location.replace(new URL('shared/login.html?access=denied', base));
        return false;
      }
    } else if (!sessionStorage.getItem('userRole') || (role === 'admin' && sessionStorage.getItem('userRole') !== 'admin')) {
      location.replace(new URL('shared/login.html', base)); return false;
    }
    return true;
  }
  async function logout() {
    if (client) check(await client.auth.signOut());
    sessionStorage.clear();
    location.href = new URL('shared/login.html', base);
  }
  async function api(path, options = {}) {
    await ready;
    if(!client || !config.apiUrl) throw new Error('API administrativa no configurada.');
    const session=check(await client.auth.getSession()).session;
    if(!session) throw new Error('Inicia sesión nuevamente.');
    const response=await fetch(config.apiUrl.replace(/\/$/,'')+path,{
      method:options.method || 'GET',
      headers:{'Authorization':`Bearer ${session.access_token}`,'apikey':config.supabasePublishableKey,'Content-Type':'application/json'},
      ...(options.body ? {body:JSON.stringify(options.body)} : {})
    });
    let payload;try{payload=await response.json();}catch{throw new Error('Respuesta inválida de la API.');}
    if(!response.ok)throw new Error(payload.error || 'No se pudo consultar la API administrativa.');
    return payload;
  }
  function fatal(error) {
    console.error('No se pudo iniciar el aplicativo:', error?.message);
    const box = document.createElement('main');
    box.style.cssText = 'padding:40px;max-width:650px;margin:auto;font-family:Arial';
    const title = document.createElement('h1');title.textContent = 'No se pudo conectar';
    const message = document.createElement('p');message.textContent = 'Revisa la conexión y la configuración de Supabase. No se han sustituido los datos por una simulación.';
    const retry = document.createElement('button');retry.textContent = 'Reintentar';retry.onclick = () => location.reload();
    const login = document.createElement('a');login.href = new URL('shared/login.html',base);login.textContent = ' Volver al acceso';
    box.append(title,message,retry,login);document.body.replaceChildren(box);
  }
  return { ready, check, api, identify, guard, logout, fatal, escapeHTML, get client(){return client;}, get cloud(){return config?.mode==='supabase';}, get profile(){return profile;} };
})();
