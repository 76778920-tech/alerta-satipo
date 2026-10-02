/* Sustituto exclusivo para pruebas locales. Nunca se publica en Hosting. */
window.createSupabaseClient = () => {
  let onSignOut = () => {};
  const user = () => sessionStorage.getItem('fixture-role') ? {id:'fixture-user',email:'fixture@example.invalid'} : null;
  const role = () => sessionStorage.getItem('fixture-role');
  const profile = () => ({id:'fixture-user',full_name:'Prueba local',notif_push:true,notif_sound:true,share_location:false});
  const settings = {temp_critical:39,smoke_critical:65,humidity_dry:38,wind_risk:18};
  window.fixtureWrites = [];
  return {
    auth: {
      getUser: async () => ({data:{user:user()},error:null}),
      getSession: async () => ({data:{session:user() ? {access_token:'fixture-token'} : null},error:null}),
      signInWithPassword: async ({email}) => {sessionStorage.setItem('fixture-role',email.startsWith('person')?'user':'admin');return {data:{},error:null};},
      signOut: async () => {sessionStorage.removeItem('fixture-role');window.fixtureSignedOut=true;onSignOut();return {error:null};},
      resetPasswordForEmail: async (email,options) => {window.fixtureRecovery={email,...options};return {error:null};},
      updateUser: async input => {window.fixturePassword=input;return {error:null};},
      onAuthStateChange: callback => {onSignOut=()=>callback('SIGNED_OUT');return {data:{subscription:{unsubscribe(){}}}};}
    },
    from(table) {
      const rows = () => table==='reportes' ? JSON.parse(sessionStorage.getItem('fixture-reports') || '[]') : [];
      const query = {
        select() { return this; },eq() { return this; },order() { return this; },
        async limit() {
          return {data:table==='smoke_readings' ? await (await fetch('/data/smoke_detection_300.json')).json() : rows(),error:null};
        },
        async maybeSingle() { return {data:table==='administradores' && role()==='admin' ? {id:'fixture-user',display_name:'Admin local'} : null,error:null}; },
        async single() { return {data:table==='app_settings' ? settings : profile(),error:null}; },
        update(value) { window.fixtureWrites.push({table,value});return this; },
        async insert(value) {
          window.fixtureWrites.push({table,value});
          sessionStorage.setItem('fixture-reports',JSON.stringify([{...value,id:'report-1',created_at:'2026-10-02T05:00:00Z'}]));
          return {data:null,error:null};
        }
      };
      return query;
    },
    async rpc(name,input) {window.fixtureWrites.push({name,input});return {data:'help-1',error:null};}
  };
};
