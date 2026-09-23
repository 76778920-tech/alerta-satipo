const LoginModule = (() => {
  const B = window.SatipoBackend;
  const demoUsers = {
    'usuario@satipo.pe': {password:'demo123',role:'user',name:'Usuario demo'},
    'admin@satipo.pe': {password:'admin123',role:'admin',name:'Admin demo'}
  };
  const route = role => location.href = role==='admin'?'../web/index.html':'../mobile/index.html';
  const message = text => document.querySelector('#auth-status').textContent=text;
  function demoLogin(email,user) {
    sessionStorage.setItem('userRole',user.role);sessionStorage.setItem('userName',user.name);sessionStorage.setItem('userEmail',email);route(user.role);
  }
  async function submit(event) {
    event.preventDefault();
    const form=event.currentTarget;
    if(!form.reportValidity()) return;
    const button=event.submitter;
    const email=document.querySelector('#email').value.trim().toLowerCase();
    const password=document.querySelector('#password').value;
    button.disabled=true;message('Conectando…');
    try {
      if (!B.cloud) {
        const user=demoUsers[email];
        if(!user||user.password!==password) throw new Error('Credenciales de demostración incorrectas.');
        if(user.role!==document.querySelector('[name=role]:checked').value) throw new Error('Selecciona el perfil correspondiente a esa cuenta.');
        demoLogin(email,user);return;
      }
      if(button.id==='register-btn') {
        if(password.length<8) throw new Error('Para registrarte, utiliza una contraseña de al menos 8 caracteres.');
        const result=B.check(await B.client.auth.signUp({email,password,options:{data:{full_name:document.querySelector('#full-name').value.trim()||'Poblador'},emailRedirectTo:location.origin+location.pathname}}));
        if(!result.session) {message('Si el registro es válido, recibirás un correo para confirmar tu cuenta. Luego inicia sesión.');return;}
      } else B.check(await B.client.auth.signInWithPassword({email,password}));
      const profile=await B.identify();
      if(!profile) throw new Error('No se pudo verificar tu cuenta.');
      route(profile.role);
    } catch(error) {
      message(error.message==='Invalid login credentials'?'Correo o contraseña incorrectos.':error.message||'No se pudo conectar. Intenta otra vez.');
    } finally {button.disabled=false;}
  }
  async function init() {
    await B.ready;
    document.querySelector('#login-form').addEventListener('submit',submit);
    document.querySelector('#auth-mode').textContent=B.cloud?'Acceso seguro con Supabase':'Demostración local · sin datos de producción';
    document.querySelector('.role-selector').hidden=B.cloud;
    document.querySelector('.demo-actions').hidden=B.cloud;
    document.querySelector('.login-footer').hidden=B.cloud;
    document.querySelector('#registration-fields').hidden=!B.cloud;
    document.querySelector('#register-btn').hidden=!B.cloud;
    document.querySelector('#recover-btn').hidden=!B.cloud;
    document.querySelector('#recover-btn').addEventListener('click',async event=>{
      const email=document.querySelector('#email');
      if(!email.reportValidity())return;
      const button=event.currentTarget;button.disabled=true;
      try {B.check(await B.client.auth.resetPasswordForEmail(email.value.trim(),{redirectTo:new URL('account.html',location.href).href}));message('Si la cuenta existe, recibirás un enlace para actualizar tu contraseña.');}
      catch {message('No se pudo solicitar la recuperación. Intenta otra vez.');}
      finally {button.disabled=false;}
    });
    document.querySelectorAll('[data-demo-role]').forEach(button=>button.addEventListener('click',()=>{
      if(B.cloud)return;const email=button.dataset.demoRole==='admin'?'admin@satipo.pe':'usuario@satipo.pe';demoLogin(email,demoUsers[email]);
    }));
  }
  return {init};
})();
LoginModule.init().catch(window.SatipoBackend.fatal);
