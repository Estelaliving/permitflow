window.OW=[['001','Estela Living, LLC'],['002','Estela Specs 1 LLC'],['003','Estela Specs 2 LLC'],['004','Estela Specs 3 LLC'],['005','Estela Specs 4 LLC'],['006','Estela Specs 6 LLC'],['007','Estela Specs 7 LLC'],['008','Estela Specs 8 LLC'],['009','Estela Specs 9 LLC'],['100','Sabana Owner, LLC']];
window.PMS=['Michael Bedaw','Jason Bedaw','Jim Humphreys','Jon Frantz'];
window._sel=[];
function _gp(){try{return JSON.parse(localStorage.getItem('estela_permits_v3')||'[]');}catch(e){return[];}}
function _gs(p){var s=p.permitStatus||p.overallStatus||'';if(s==='co')return'co';if(s==='permitted'||s==='issued')return'permitted';if(s==='review'||s==='resubmit')return'review';if(s==='applied'||s==='submitted')return'applied';return'collecting';}
var SL={collecting:'Collecting Docs',applied:'Applied',review:'Under Review',permitted:'Permitted',co:'CO Received'};
var SM={'Collecting Docs':'collecting','Under Review':'review','Permitted ✓':'permitted','CO ★':'co','Applied':'applied'};

// PM & OWNER DROPDOWNS
window._pf=function(){document.querySelectorAll('.info-field').forEach(function(f){var lbl=f.querySelector('.info-label'),inp=f.querySelector('input.info-input');if(!inp||inp.dataset.pf)return;var label=lbl?lbl.textContent.trim():'';if(label!=='Project Manager'&&label!=='OWNER')return;inp.dataset.pf='1';var onch=inp.getAttribute('onchange')||'',cur=inp.value,sel=document.createElement('select');sel.className='info-input';sel.style.cssText='width:100%;padding:4px 8px;border:1px solid #d1d5db;border-radius:4px;font-size:13px;background:#fff;color:#1e293b';if(label==='Project Manager'){sel.innerHTML='<option value="">Select PM...</option>'+window.PMS.map(function(pm){return'<option value="'+pm+'"'+(pm.toUpperCase()===cur.toUpperCase()?' selected':'')+'>'+pm+'</option>';}).join('');}else{sel.innerHTML='<option value="">Select owner...</option>'+window.OW.map(function(o){return'<option value="'+o[0]+'"'+(o[0]===cur?' selected':'')+'>'+o[0]+' - '+o[1]+'</option>';}).join('');}sel.addEventListener('change',function(){try{eval(onch.replace(/this\.value/g,JSON.stringify(this.value)));}catch(e){}});inp.replaceWith(sel);});};

// MAKE STATUS BUTTONS MULTI-TOGGLE
window._patch=function(){
  var btns=Array.from(document.querySelectorAll('button')).filter(function(b){
    var t=b.textContent.trim();
    return t==='All'||SM[t];
  });
  if(!btns.length||btns[0].dataset.mt)return;
  btns.forEach(function(btn){
    btn.dataset.mt='1';
    var txt=btn.textContent.trim();
    if(txt==='All'){
      btn.addEventListener('click',function(e){
        e.stopPropagation();e.preventDefault();
        window._sel=[];
        btns.forEach(function(b){if(b.textContent.trim()!=='All'){b.style.outline='';b.style.boxShadow='';}});
      },true);
      return;
    }
    var sKey=SM[txt];if(!sKey)return;
    btn.addEventListener('click',function(e){
      e.stopPropagation();e.preventDefault();
      var idx=window._sel.indexOf(sKey);
      if(idx>-1){
        window._sel.splice(idx,1);
        btn.style.outline='';btn.style.boxShadow='';
      }else{
        window._sel.push(sKey);
        btn.style.outline='2px solid #7c3aed';btn.style.boxShadow='0 0 0 3px rgba(124,58,237,.2)';
      }
      // Remove All highlight if something selected
      var allBtn=btns.find(function(b){return b.textContent.trim()==='All';});
      if(allBtn) allBtn.style.outline=window._sel.length?'':'';
    },true);
  });
};

// INLINE ADDRESS EXPANSION IN TABLE
function _exp(tr,com,st){
  var n=tr.nextElementSibling;while(n&&n.dataset.er){var t=n.nextElementSibling;n.remove();n=t;}
  var pp=_gp().filter(function(p){return p.community===com&&_gs(p)===st;});
  if(!pp.length)return;
  var cs=tr.querySelectorAll('td').length||8;
  var exp=document.createElement('tr');exp.dataset.er='1';
  var rows=pp.map(function(p,i){return'<tr style="background:'+(i%2===0?'#f8faff':'#eff6ff')+'"><td style="padding:7px 12px 7px 24px;font-size:11px;color:#94a3b8">'+(i+1)+'</td><td style="padding:7px 14px;font-size:13px;font-weight:600">'+(p.address||'—')+'<span style="font-size:11px;color:#94a3b8;margin-left:6px">Lot '+(p.lotNumber||'—')+'</span></td><td style="padding:7px 14px;font-family:monospace;font-size:12px;color:#4f46e5">'+(p.permitNumber||'—')+'</td><td style="padding:7px 14px;font-size:12px">'+(p.model||'—')+'</td><td style="padding:7px 14px;font-size:12px">'+(p.projectManager||'—')+'</td><td style="padding:7px 14px;font-size:11px;font-weight:700;color:#7c3aed">'+(p.owner||'—')+'</td></tr>';}).join('');
  exp.innerHTML='<td colspan="'+cs+'" style="padding:0;border-bottom:3px solid #3b82f6;border-top:1px solid #bfdbfe"><div style="background:#f0f9ff;border-left:4px solid #3b82f6"><div style="padding:10px 16px;display:flex;justify-content:space-between;align-items:center"><span style="font-size:12px;font-weight:700;color:#1e40af;text-transform:uppercase">'+com+' — '+SL[st]+' ('+pp.length+')</span><button onclick="var r=this.closest('[data-er]');var n=r.nextElementSibling;while(n&&n.dataset.er){var t=n.nextElementSibling;n.remove();n=t};" style="background:none;border:1px solid #bfdbfe;border-radius:4px;cursor:pointer;color:#64748b;padding:2px 8px;font-size:12px">✕ Close</button></div><table style="width:100%;border-collapse:collapse"><thead><tr style="background:#dbeafe"><th style="padding:7px 24px;text-align:left;font-size:10px;color:#1e40af">#</th><th style="padding:7px 14px;text-align:left;font-size:10px;color:#1e40af">ADDRESS / LOT</th><th style="padding:7px 14px;text-align:left;font-size:10px;color:#1e40af">PERMIT #</th><th style="padding:7px 14px;text-align:left;font-size:10px;color:#1e40af">MODEL</th><th style="padding:7px 14px;text-align:left;font-size:10px;color:#1e40af">PM</th><th style="padding:7px 14px;text-align:left;font-size:10px;color:#1e40af">OWNER</th></tr></thead><tbody>'+rows+'</tbody></table></div></td>';
  tr.insertAdjacentElement('afterend',exp);
}

// BIND TABLE CELLS — ALL STATUS COLUMNS
window._bt=function(){
  Array.from(document.querySelectorAll('table tbody tr')).forEach(function(tr){
    if(tr.dataset.er||tr.dataset.b2)return;
    var tds=tr.querySelectorAll('td');if(tds.length<4)return;
    var com=tds[0]&&tds[0].textContent.trim();
    if(!com||com==='TOTAL'||/^\d+$/.test(com))return;
    tr.dataset.b2='1';
    [{i:2,s:'collecting'},{i:3,s:'review'},{i:4,s:'permitted'},{i:5,s:'co'}].forEach(function(col){
      var td=tds[col.i];if(!td||td.textContent.trim()==='—')return;
      td.style.cursor='pointer';td.title='Click to see addresses';
      (function(t,c,s){td.addEventListener('click',function(e){e.stopPropagation();_exp(t,c,s);});})(tr,com,col.s);
    });
  });
};

// SORT COLUMNS
window._as=function(){var tbl=document.querySelector('table');if(!tbl||tbl.dataset.s)return;tbl.dataset.s='1';tbl.querySelectorAll('th').forEach(function(th,ci){var t=th.textContent.trim().toUpperCase();if(!['ADDRESS','COMMUNITY','MODEL','PM','PROJECT','LOT','STATUS'].some(function(s){return t.includes(s);}))return;th.style.cursor='pointer';th.title='Sort A→Z / Z→A';if(!th.querySelector('._a')){var a=document.createElement('span');a.className='_a';a.style='margin-left:4px;opacity:0.4;font-size:10px';a.textContent='⇅';th.appendChild(a);}th.addEventListener('click',function(){var tb=tbl.querySelector('tbody');if(!tb)return;var rows=Array.from(tb.querySelectorAll('tr:not([data-er])'));var d=th._d||1;th._d=-d;rows.sort(function(a,b){return((a.querySelectorAll('td')[ci]||{}).textContent||'').localeCompare((b.querySelectorAll('td')[ci]||{}).textContent||'')*d;});tb.querySelectorAll('[data-er]').forEach(function(r){r.remove();});rows.forEach(function(r){tb.appendChild(r);});tbl.querySelectorAll('._a').forEach(function(a){a.textContent='⇅';a.style.opacity='0.4';});var ma=th.querySelector('._a');if(ma){ma.textContent=d===1?'↑':'↓';ma.style.opacity='1';}});});};

setInterval(function(){window._pf();window._patch();window._bt();window._as();},1000);