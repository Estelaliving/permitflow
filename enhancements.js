// Estela Living Permit Tracker - Report Enhancements
// PM/Owner dropdowns + multi-select status filtering + inline drill-down

window.OW = [
  ['001','Estela Living, LLC'],['002','Estela Specs 1 LLC'],['003','Estela Specs 2 LLC'],
  ['004','Estela Specs 3 LLC'],['005','Estela Specs 4 LLC'],['006','Estela Specs 6 LLC'],
  ['007','Estela Specs 7 LLC'],['008','Estela Specs 8 LLC'],['009','Estela Specs 9 LLC'],
  ['100','Sabana Owner, LLC']
];
window.PMS = ['Michael Bedaw','Jason Bedaw','Jim Humphreys','Jon Frantz'];
window._selectedStatuses = [];

function _gp() { try { return JSON.parse(localStorage.getItem('estela_permits_v3')||'[]'); } catch(e) { return []; } }
function _gs(p) {
  var ps = p.permitStatus || p.overallStatus || '';
  if (ps==='co') return 'co';
  if (ps==='permitted'||ps==='issued') return 'permitted';
  if (ps==='review'||ps==='resubmit') return 'review';
  if (ps==='applied'||ps==='submitted') return 'applied';
  return 'collecting';
}
function _filtered() {
  var all = _gp();
  if (!window._selectedStatuses.length) return all;
  return all.filter(function(p) { return window._selectedStatuses.indexOf(_gs(p)) > -1; });
}

// ── PM & OWNER DROPDOWNS in permit detail ──
window._patchFields = function() {
  document.querySelectorAll('.info-field').forEach(function(f) {
    var lbl = f.querySelector('.info-label');
    var inp = f.querySelector('input.info-input');
    if (!inp || inp.dataset.pf) return;
    var label = lbl ? lbl.textContent.trim() : '';
    if (label !== 'Project Manager' && label !== 'OWNER') return;
    inp.dataset.pf = '1';
    var onch = inp.getAttribute('onchange') || '';
    var cur = inp.value;
    var sel = document.createElement('select');
    sel.className = 'info-input';
    sel.style.cssText = 'width:100%;padding:4px 8px;border:1px solid #d1d5db;border-radius:4px;font-size:13px;background:#fff;color:#1e293b';
    if (label === 'Project Manager') {
      sel.innerHTML = '<option value="">Select PM...</option>' +
        window.PMS.map(function(pm) {
          return '<option value="' + pm + '"' + (pm.toUpperCase()===cur.toUpperCase()?' selected':'') + '>' + pm + '</option>';
        }).join('');
    } else {
      sel.innerHTML = '<option value="">Select owner...</option>' +
        window.OW.map(function(o) {
          return '<option value="' + o[0] + '"' + (o[0]===cur?' selected':'') + '>' + o[0] + ' - ' + o[1] + '</option>';
        }).join('');
    }
    sel.addEventListener('change', function() {
      var newOnch = onch.replace(/this\.value/g, JSON.stringify(this.value));
      try { eval(newOnch); } catch(e) {}
    });
    inp.replaceWith(sel);
  });
};

// ── INLINE ADDRESS LIST (expand inside table) ──
function _showInline(tr, community, status) {
  // Remove existing expansion if clicking same
  var existing = tr.nextElementSibling;
  if (existing && existing.dataset.inlineRow === community + status) {
    existing.remove();
    return;
  }
  if (existing && existing.dataset.inlineRow) existing.remove();

  var permits = _gp().filter(function(p) {
    return p.community === community && _gs(p) === status;
  });
  if (!permits.length) return;

  var statusLabels = {collecting:'Collecting Docs',applied:'Applied',review:'Under Review',permitted:'Permitted ✓',co:'CO Received ★'};
  var statusColors = {collecting:['#fef9c3','#854d0e'],applied:['#dbeafe','#1e40af'],review:['#fee2e2','#991b1b'],permitted:['#dcfce7','#14532d'],co:['#cffafe','#0e7490']};
  var c = statusColors[status] || ['#f1f5f9','#374151'];

  var rows = permits.map(function(p, i) {
    return '<tr style="background:' + (i%2===0?'#f0f9ff':'#e0f2fe') + '">' +
      '<td style="padding:6px 16px 6px 32px;font-size:12px;color:#475569">' + (i+1) + '</td>' +
      '<td style="padding:6px 12px;font-size:12px;font-weight:600">' + (p.address||'—') + ' <span style="color:#94a3b8;font-weight:400">Lot ' + (p.lotNumber||'—') + '</span></td>' +
      '<td style="padding:6px 12px;font-size:12px;font-family:monospace;color:#4f46e5">' + (p.permitNumber||'—') + '</td>' +
      '<td style="padding:6px 12px;font-size:12px">' + (p.model||'—') + '</td>' +
      '<td style="padding:6px 12px;font-size:12px">' + (p.projectManager||'—') + '</td>' +
      '<td style="padding:6px 12px;font-size:11px;font-weight:700;color:#7c3aed">' + (p.owner||'—') + '</td>' +
      '<td style="padding:6px 12px"><span style="padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;background:' + c[0] + ';color:' + c[1] + '">' + statusLabels[status] + '</span></td>' +
    '</tr>';
  }).join('');

  var colSpan = tr.querySelectorAll('td').length || 8;
  var expandRow = document.createElement('tr');
  expandRow.dataset.inlineRow = community + status;
  expandRow.innerHTML = '<td colspan="' + colSpan + '" style="padding:0;border-bottom:2px solid #3b82f6">' +
    '<div style="background:#f0f9ff;border-left:4px solid #3b82f6">' +
    '<div style="padding:8px 16px;font-size:11px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:1px;display:flex;justify-content:space-between;align-items:center">' +
      '<span>' + community + ' — ' + statusLabels[status] + ' (' + permits.length + ' permits)</span>' +
      '<button onclick="this.closest(\'tr\').remove()" style="background:none;border:none;cursor:pointer;color:#94a3b8;font-size:16px;padding:0">✕</button>' +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse">' +
      '<thead><tr style="background:#dbeafe">' +
        '<th style="padding:6px 32px;text-align:left;font-size:10px;font-weight:700;color:#1e40af">#</th>' +
        '<th style="padding:6px 12px;text-align:left;font-size:10px;font-weight:700;color:#1e40af">ADDRESS / LOT</th>' +
        '<th style="padding:6px 12px;text-align:left;font-size:10px;font-weight:700;color:#1e40af">PERMIT #</th>' +
        '<th style="padding:6px 12px;text-align:left;font-size:10px;font-weight:700;color:#1e40af">MODEL</th>' +
        '<th style="padding:6px 12px;text-align:left;font-size:10px;font-weight:700;color:#1e40af">PM</th>' +
        '<th style="padding:6px 12px;text-align:left;font-size:10px;font-weight:700;color:#1e40af">OWNER</th>' +
        '<th style="padding:6px 12px;text-align:left;font-size:10px;font-weight:700;color:#1e40af">STATUS</th>' +
      '</tr></thead>' +
      '<tbody>' + rows + '</tbody>' +
    '</table></div></td>';

  tr.insertAdjacentElement('afterend', expandRow);
}

// ── UPDATE COMMUNITY TABLE with filtered data ──
window._updateTable = function() {
  var permits = _filtered();
  var statFilter = window._selectedStatuses;

  // Find community table rows
  var allRows = Array.from(document.querySelectorAll('table tr')).filter(function(tr) {
    var tds = tr.querySelectorAll('td');
    return tds.length > 3 && tds[0].textContent.trim().length > 3 && !/^\d+$/.test(tds[0].textContent.trim());
  });

  allRows.forEach(function(tr) {
    var community = tr.querySelector('td')?.textContent.trim();
    if (!community || community === 'TOTAL') return;

    var commPermits = permits.filter(function(p) { return p.community === community; });

    // Find colored badge cells (2nd, 3rd, 4th, 5th cols)
    var tds = tr.querySelectorAll('td');
    var statusCols = [
      {col: 2, status: 'collecting'},
      {col: 3, status: 'review'},
      {col: 4, status: 'permitted'},
      {col: 5, status: 'co'}
    ];

    statusCols.forEach(function(sc) {
      var td = tds[sc.col];
      if (!td) return;
      var badge = td.querySelector('span[style], span');
      if (!badge) return;

      var count = commPermits.filter(function(p) { return _gs(p) === sc.status; }).length;
      var orig = badge.dataset.orig || badge.textContent.trim();
      badge.dataset.orig = orig;

      if (badge.dataset.bound) return;
      badge.dataset.bound = '1';
      badge.style.cursor = 'pointer';
      badge.title = 'Click to expand addresses';
      badge.addEventListener('click', function(e) {
        e.stopPropagation();
        _showInline(tr, community, sc.status);
      });
    });

    // Update TOTAL count in first numeric column
    if (tds[1]) {
      tds[1].style.fontWeight = '700';
      if (statFilter.length) {
        tds[1].dataset.orig = tds[1].dataset.orig || tds[1].textContent.trim();
        tds[1].textContent = commPermits.length;
      } else if (tds[1].dataset.orig) {
        tds[1].textContent = tds[1].dataset.orig;
      }
    }
  });
};

// ── MULTI-SELECT PANEL ──
window._msChange = function() {
  var sel = Array.from(document.querySelectorAll('#_ms_boxes input:checked')).map(function(i) { return i.value; });
  window._selectedStatuses = sel;
  ['collecting','applied','review','permitted','co'].forEach(function(k) {
    var el = document.getElementById('_lbl_' + k);
    if (el) {
      el.style.borderColor = sel.indexOf(k) > -1 ? '#7c3aed' : '#e2e8f0';
      el.style.background = sel.indexOf(k) > -1 ? '#ede9fe' : '#fff';
    }
  });
  var ct = document.getElementById('_ms_count');
  if (ct) {
    var count = _filtered().length;
    ct.textContent = sel.length ? count + ' permits match — table and cards updated' : '';
  }
  window._updateTable();
};

window._addMS = function() {
  if (document.getElementById('_ms_status')) return;
  var content = document.getElementById('content');
  if (!content) return;
  var filterDiv = Array.from(content.children).find(function(el) {
    return el.textContent.indexOf('Community') > -1;
  });
  if (!filterDiv) return;

  var ms = document.createElement('div');
  ms.id = '_ms_status';
  ms.style.cssText = 'padding:12px 16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;margin:8px 0';

  var statusList = [
    ['collecting','Collecting Docs'],['applied','Applied'],['review','Under Review'],
    ['permitted','Permitted'],['co','CO Received']
  ];
  var boxesHtml = statusList.map(function(s) {
    return '<label id="_lbl_' + s[0] + '" style="display:flex;align-items:center;gap:5px;padding:5px 12px;border:2px solid #e2e8f0;border-radius:20px;cursor:pointer;font-size:12px;font-weight:600;background:#fff">' +
      '<input type="checkbox" value="' + s[0] + '" onchange="window._msChange()"> ' + s[1] + '</label>';
  }).join('');

  ms.innerHTML = '<div style="font-size:11px;font-weight:700;color:#6b7280;margin-bottom:8px;text-transform:uppercase;letter-spacing:1px">' +
    '📋 Filter by multiple statuses — updates table below</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px" id="_ms_boxes">' + boxesHtml + '</div>' +
    '<div style="display:flex;gap:8px;align-items:center">' +
    '<button onclick="window._msChange()" style="padding:7px 16px;background:#7c3aed;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer">Apply Filter</button>' +
    '<button onclick="document.querySelectorAll(\'#_ms_boxes input\').forEach(function(i){i.checked=false});window._selectedStatuses=[];window._msChange();" style="padding:7px 16px;background:#6b7280;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer">Clear</button>' +
    '<span id="_ms_count" style="font-size:12px;color:#6b7280;margin-left:8px"></span></div>';

  filterDiv.after(ms);
};

// Run every second
setInterval(function() {
  window._patchFields();
  window._addMS();
  window._updateTable();
}, 1000);
