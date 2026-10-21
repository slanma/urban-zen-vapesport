(function(){
 var H='45990046c17a8253fcc9e4d9bd022e220eb7a41ad1a9da356bd9257661082bda', K='dilna-test-ok';
 function ok(){ var g=document.getElementById('gate'); if(g) g.remove(); }
 try{ if(localStorage.getItem(K)===H){ document.addEventListener('DOMContentLoaded',ok); return; } }catch(e){}
 function sha(t){ return crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)).then(function(b){ return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0')}).join(''); }); }
 document.addEventListener('DOMContentLoaded',function(){
  var f=document.getElementById('gateForm'), i=document.getElementById('gatePw'), m=document.getElementById('gateMsg');
  f.addEventListener('submit',function(e){ e.preventDefault(); sha(i.value.trim().toLowerCase()).then(function(x){ if(x===H){ try{localStorage.setItem(K,H);}catch(e){} ok(); } else { m.textContent='Špatné heslo.'; i.value=''; i.focus(); } }); });
  i.focus();
 });
})();