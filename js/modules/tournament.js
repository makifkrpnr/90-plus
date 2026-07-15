(function(root){
  'use strict';
  const shuffle=items=>{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const groupNames=['A','B','C','D','E','F','G','H'];
  function roundRobin4(teamIds,group){
    const [a,b,c,d]=teamIds;
    const rounds=[[[a,d],[b,c]],[[a,c],[d,b]],[[a,b],[c,d]]];
    return rounds.flatMap((games,roundIndex)=>games.map((pair,index)=>({id:`g-${group}-${roundIndex+1}-${index+1}`,round:`Grup ${group} · ${roundIndex+1}. hafta`,group,home:pair[0],away:pair[1],status:'pending',scores:[],winner:null,legs:1,leg:1})));
  }
  function emptyRow(team){return{team,played:0,w:0,d:0,l:0,gf:0,ga:0,gd:0,pts:0};}
  function createGroupTournament(kind,teams,options={}){
    const world=kind==='worldCup',groupCount=world?4:2,expected=groupCount*4;
    if(!Array.isArray(teams)||teams.length<expected)throw new Error(`${expected} takım gerekli.`);
    const draw=shuffle(teams.map((_,index)=>index)).slice(0,expected);
    const groups=[];const fixtures=[];
    for(let i=0;i<groupCount;i+=1){const ids=draw.slice(i*4,i*4+4),name=groupNames[i];groups.push({name,teams:ids,table:ids.map(emptyRow)});fixtures.push(...roundRobin4(ids,name));}
    return{id:`cup-${Date.now().toString(36)}`,type:kind,label:world?'Dünya Kupası':'Klasik Şampiyonlar Kupası',stage:'groups',teams,groups,fixtures,options:{legs:options.legs===2?2:1,durationMinutes:Number(options.durationMinutes)||3},stats:{goals:{},assists:{},cards:{}},podium:null};
  }
  function applyGroupResult(state,fixture,scores){
    const group=state.groups.find(item=>item.name===fixture.group);if(!group)return;
    const home=group.table.find(row=>row.team===fixture.home),away=group.table.find(row=>row.team===fixture.away);if(!home||!away)return;
    const [hg,ag]=scores.map(Number);home.played+=1;away.played+=1;home.gf+=hg;home.ga+=ag;away.gf+=ag;away.ga+=hg;home.gd=home.gf-home.ga;away.gd=away.gf-away.ga;
    if(hg>ag){home.w+=1;away.l+=1;home.pts+=3;}else if(ag>hg){away.w+=1;home.l+=1;away.pts+=3;}else{home.d+=1;away.d+=1;home.pts+=1;away.pts+=1;}
  }
  function sortedTable(group){return[...group.table].sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf||a.team-b.team);}
  function buildKnockout(state){
    const qualified=state.groups.map(group=>sortedTable(group).slice(0,2).map(row=>row.team));
    const pairs=[];
    if(qualified.length===2){pairs.push([qualified[0][0],qualified[1][1]],[qualified[1][0],qualified[0][1]]);}
    else{pairs.push([qualified[0][0],qualified[1][1]],[qualified[2][0],qualified[3][1]],[qualified[1][0],qualified[0][1]],[qualified[3][0],qualified[2][1]]);}
    const round=pairs.length===4?'Çeyrek final':'Yarı final';
    state.fixtures.push(...pairs.map((pair,index)=>({id:`ko-${round}-${index}-${Date.now().toString(36)}`,round,home:pair[0],away:pair[1],status:'pending',scores:[],winner:null,legs:state.options.legs,leg:1,aggregate:[0,0]})));
    state.stage='knockout';return state;
  }
  function createKnockout4(teams,options={}){
    if(!Array.isArray(teams)||teams.length!==4)throw new Error('Dörtlü turnuva dört takım ister.');
    const draw=shuffle(teams.map((team,index)=>({team,index})));
    return{id:`t-${Date.now().toString(36)}`,type:'knockout4',options:{legs:options.legs===2?2:1,durationMinutes:Number(options.durationMinutes)||3},stage:'semifinals',teams:teams.map((team,index)=>({...team,seed:index})),fixtures:[
      {id:'sf1',round:'Yarı final',home:draw[0].index,away:draw[1].index,status:'pending',scores:[],winner:null,legs:options.legs===2?2:1,leg:1,aggregate:[0,0]},
      {id:'sf2',round:'Yarı final',home:draw[2].index,away:draw[3].index,status:'pending',scores:[],winner:null,legs:options.legs===2?2:1,leg:1,aggregate:[0,0]}
    ],stats:{goals:{},assists:{},cards:{}},podium:null};
  }
  root.TournamentCore=Object.freeze({createKnockout4,createGroupTournament,applyGroupResult,sortedTable,buildKnockout,shuffle});
})(typeof window!=='undefined'?window:globalThis);
