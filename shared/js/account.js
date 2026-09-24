(async()=>{
  const B=window.SatipoBackend;
  await B.ready;
  const status=document.querySelector('#account-status');
  const form=document.querySelector('#password-form');
  const profile = B.cloud ? await B.identify() : null;
  if(!profile || profile.role !== 'admin') {form.hidden=true;status.textContent='Esta página requiere una cuenta administrativa autorizada.';return;}
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const password=document.querySelector('#new-password').value;
    if(password!==document.querySelector('#confirm-password').value){status.textContent='Las contraseñas no coinciden.';return;}
    const button=form.querySelector('button');button.disabled=true;
    try {B.check(await B.client.auth.updateUser({password}));form.reset();status.textContent='Contraseña actualizada. Vuelve al acceso para continuar.';}
    catch(error){status.textContent=error.message||'No se pudo actualizar la contraseña.';}
    finally{button.disabled=false;}
  });
})().catch(window.SatipoBackend.fatal);
