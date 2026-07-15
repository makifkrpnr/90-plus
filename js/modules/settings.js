(function(root){
  'use strict';
  const KEY='90-plus-global-settings-v6';
  const defaults=Object.freeze({menuMusic:true,stadiumAmbience:true,eventSounds:true,vibration:true,eventDuration:'long',reducedMotion:false});
  let value={...defaults};
  function load(){try{value={...defaults,...JSON.parse(localStorage.getItem(KEY)||'{}')};}catch(_){value={...defaults};}return {...value};}
  function get(){return {...value};}
  function set(patch={}){value={...value,...patch};try{localStorage.setItem(KEY,JSON.stringify(value));}catch(_){}root.dispatchEvent?.(new CustomEvent('90plus:settings',{detail:get()}));return get();}
  function reset(){value={...defaults};return set(value);}
  load();
  root.AppSettings=Object.freeze({defaults,load,get,set,reset});
})(typeof window!=='undefined'?window:globalThis);
