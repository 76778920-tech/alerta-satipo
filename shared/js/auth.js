const LoginModule = (() => {
  const B = window.SatipoBackend;
  const $ = selector => document.querySelector(selector);
  let mode = 'login', busy = false;
  const demoUsers = {
    'usuario@satipo.pe': {password:'demo123',role:'user',name:'Usuario demo'},
    'admin@satipo.pe': {password:'admin123',role:'admin',name:'Admin demo'}
  };
  const route = role => { location.href = role === 'admin' ? '../web/index.html' : '../mobile/index.html'; };
  function message(text, error = false) {
    const output = $('#auth-status');
    output.textContent = text; output.hidden = !text; output.classList.toggle('error',error);
  }
  function setMode(next) {
    if (busy) return;
    mode = next; message('');
    const signup = mode === 'signup', recovery = mode === 'recovery';
    $('#registration-fields').hidden = !signup;
    $('#full-name').required = signup;
    $('#password-field').hidden = recovery;
    $('#password').required = !recovery;
    $('#password').disabled = recovery;
    $('#password').minLength = signup ? 8 : 1;
    $('#password').autocomplete = signup ? 'new-password' : 'current-password';
    $('#password-hint').hidden = !signup;
    $('#password').type = 'password';
    $('#toggle-password').textContent = 'Mostrar';
    $('#toggle-password').setAttribute('aria-pressed','false');
    $('#toggle-password').setAttribute('aria-label','Mostrar contraseña');
    $('#access-tabs').hidden = !B.cloud || recovery;
    $('#recover-btn').hidden = !B.cloud || signup || recovery;
    $('#back-login').hidden = !recovery;
    $('#login-tab').classList.toggle('selected',!signup);
    $('#signup-tab').classList.toggle('selected',signup);
    $('#login-tab').setAttribute('aria-pressed',String(!signup));
    $('#signup-tab').setAttribute('aria-pressed',String(signup));
    $('#form-title').textContent = recovery ? 'Recupera tu acceso.' : signup ? 'Sé parte de tu comunidad.' : 'Tu comunidad, más cerca.';
    $('#form-description').textContent = recovery ? 'Te enviaremos un enlace para crear una nueva contraseña.' : signup ? 'Crea tu cuenta de poblador y empieza a participar.' : 'Ingresa a tu cuenta para continuar.';
    $('#submit-label').textContent = recovery ? 'Enviar enlace de recuperación' : signup ? 'Crear mi cuenta' : 'Iniciar sesión';
    $('#account-note').textContent = signup ? 'El registro crea una cuenta de poblador. Los permisos de administración se asignan por separado.' : recovery ? 'Revisa también tu carpeta de correo no deseado.' : 'Pobladores y administradores ingresan con su propia cuenta. Te dirigiremos al espacio que te corresponde.';
    document.title = `${recovery ? 'Recuperar acceso' : signup ? 'Crear cuenta' : 'Iniciar sesión'} · Alerta Satipo`;
  }
  function demoLogin(email,user) {
    sessionStorage.setItem('userRole',user.role);sessionStorage.setItem('userName',user.name);sessionStorage.setItem('userEmail',email);route(user.role);
  }
  async function submit(event) {
    event.preventDefault();
    if (busy || !event.currentTarget.reportValidity()) return;
    const email = $('#email').value.trim().toLowerCase(), password = $('#password').value;
    if(mode === 'signup' && !$('#full-name').value.trim()) {message('Indica tu nombre completo.',true);$('#full-name').focus();return;}
    busy = true; $('#submit-btn').disabled = true; $('#login-form').setAttribute('aria-busy','true');
    const label = $('#submit-label').textContent;
    $('#submit-label').textContent = 'Un momento…'; message('');
    try {
      if (!B.cloud) {
        const user = demoUsers[email];
        if(!user || user.password !== password) throw new Error('Credenciales de demostración incorrectas.');
        if(user.role !== $('[name=role]:checked').value) throw new Error('Selecciona el perfil correspondiente a esa cuenta.');
        demoLogin(email,user);return;
      }
      if(mode === 'recovery') {
        B.check(await B.client.auth.resetPasswordForEmail(email,{redirectTo:new URL('account.html',location.href).href}));
        message('Si la cuenta existe, recibirás un enlace para actualizar tu contraseña.');return;
      }
      if(mode === 'signup') {
        const result = B.check(await B.client.auth.signUp({email,password,options:{data:{full_name:$('#full-name').value.trim()},emailRedirectTo:location.origin+location.pathname}}));
        if(!result.session) {message('Revisa tu correo para confirmar el registro. Si ya tienes una cuenta, puedes iniciar sesión o recuperar tu contraseña.');return;}
      } else B.check(await B.client.auth.signInWithPassword({email,password}));
      const profile = await B.identify();
      if(!profile) throw new Error('No se pudo verificar tu cuenta.');
      route(profile.role);
    } catch(error) {
      const translations = {invalid_credentials:'Correo o contraseña incorrectos.',email_not_confirmed:'Confirma tu correo antes de ingresar.',over_email_send_rate_limit:'Espera unos minutos antes de solicitar otro correo.',over_request_rate_limit:'Demasiados intentos. Espera unos minutos e inténtalo de nuevo.'};
      message(translations[error.code] || (error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : error.message) || 'No se pudo conectar. Intenta otra vez.',true);
    } finally {
      busy = false; $('#submit-btn').disabled = false; $('#submit-label').textContent = label; $('#login-form').removeAttribute('aria-busy');
    }
  }
  async function init() {
    await B.ready;
    $('#login-form').addEventListener('submit',submit);
    $('#auth-mode').textContent = B.cloud ? 'Acceso seguro' : 'Demostración local';
    $('.role-selector').hidden = B.cloud;
    $('.demo-actions').hidden = B.cloud;
    $('.login-footer').hidden = B.cloud;
    $('#login-tab').onclick = () => setMode('login');
    $('#signup-tab').onclick = () => setMode('signup');
    $('#recover-btn').onclick = () => {setMode('recovery');$('#email').focus();};
    $('#back-login').onclick = () => setMode('login');
    $('#toggle-password').onclick = () => {
      const visible = $('#password').type === 'password';
      $('#password').type = visible ? 'text' : 'password';
      $('#toggle-password').textContent = visible ? 'Ocultar' : 'Mostrar';
      $('#toggle-password').setAttribute('aria-pressed',String(visible));
      $('#toggle-password').setAttribute('aria-label',visible ? 'Ocultar contraseña' : 'Mostrar contraseña');
    };
    document.querySelectorAll('[data-demo-role]').forEach(button => button.addEventListener('click',() => {
      if(B.cloud || busy)return;
      const email = button.dataset.demoRole === 'admin' ? 'admin@satipo.pe' : 'usuario@satipo.pe';demoLogin(email,demoUsers[email]);
    }));
    setMode('login');$('#submit-btn').disabled = false;
  }
  return {init};
})();
LoginModule.init().catch(window.SatipoBackend.fatal);
