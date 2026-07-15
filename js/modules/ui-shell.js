(function(root){
  'use strict';
  function setViewportVars(){
    const vv=window.visualViewport;
    const height=vv?.height||window.innerHeight;
    document.documentElement.style.setProperty('--app-height',`${Math.round(height)}px`);
  }
  function activateScreen(name){
    document.body.dataset.screen=name;
    document.body.classList.toggle('match-active',name==='match');
    document.body.classList.toggle('has-mobile-dock',name!=='match');
    requestAnimationFrame(()=>document.querySelector(`#screen-${name} .screen-scroll`)?.scrollTo?.(0,0));
  }
  function install(){setViewportVars();window.addEventListener('resize',setViewportVars,{passive:true});window.visualViewport?.addEventListener('resize',setViewportVars,{passive:true});}
  root.UIShell=Object.freeze({install,activateScreen,setViewportVars});
})(typeof window!=='undefined'?window:globalThis);
