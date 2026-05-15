// Reports Enhancement: Multi-select status, clickable numbers, development + permit number
(function() {
  let _selectedStatuses = [];
  const STATUS_MAP = {
    'collecting': 'Collecting Docs',
    'applied': 'Applied',
    'review': 'Under Review / Plan Review',
    'permitted': 'Permitted',
    'co': 'CO Received'
  };

  function getPermits() {
    try { return JSON.parse(localStorage.getItem('estela_permits_v3') || '[]'); } catch(e) { return []; }
  }

  function getStatus(p) {
    const ps = p.permitStatus || p.overallStatus || '';
    if (ps === 'co') return 'co';
    if (ps === 'permitted' || ps === 'issued') return 'permitted';
    if (ps === 'review' || ps === 'resubmit') return 'review';
    if (ps === 'applied' || ps === 'submitted') return 'applied';
    return 'collecting';
  }

  function showDrillDown(title, permits) {
    let existing = document.getElementById('_drilldown_modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = '_drilldown_modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px';
    modal.innerHTML = `<div style="background:#fff;border-radius:12px;width:100%;max-width:800px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 8px 40px rgba(0,0,0,.3)">
      <div style="padding:16px 20px;border-bottom:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;background:#f8fafc">
        <div><strong style="font-size:16px">${title}</strong> <span style="color:#6b7280;font-size:13px">(${permits.length} permits)</span></div>
        <div style="display:flex;gap:8px">
          <button onclick="window.print()" style="padding:6px 14px;background:#7c3aed;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600">🖨 Print</button>
          <button onclick="document.getElementById('_drilldown_modal').remove()" style="padding:6px 14px;background:#6b7280;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px">✕ Close</button>
        </div>
      </div>
      <div style="overflow-y:auto;flex:1">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead style="position:sticky;top:0;background:#f1f5f9">
            <tr>
              <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e2e8f0;font-weight:700;color:#374151">Address / Lot</th>
              <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e2e8f0;font-weight:700;color:#374151">Development</th>
              <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e2e8f0;font-weight:700;color:#374151">Permit #</th>
              <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e2e8f0;font-weight:700;color:#374151">Model</th>
              <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e2e8f0;font-weight:700;color:#374151">PM</th>
              <th style="padding:10px 12px;text-align:left;border-bottom:2px solid #e2e8f0;font-weight:700;color:#374151">Status</th>
            </tr>
          </thead>
          <tbody>
            ${permits.map((p,i) => `<tr style="background:${i%2===0?'#fff':'#f8fafc'};border-bottom:1px solid #f0f0f0">
              <td style="padding:9px 12px"><div style="font-weight:600">${p.address||'—'}</div><div style="font-size:11px;color:#9ca3af">Lot ${p.lotNumber||'—'}</div></td>
              <td style="padding:9px 12px">${p.community||'—'}</td>
              <td style="padding:9px 12px;font-family:monospace;font-size:12px;color:#4f46e5">${p.permitNumber||'—'}</td>
              <td style="padding:9px 12px">${p.model||'—'}</td>
              <td style="padding:9px 12px">${p.projectManager||'—'}</td>
              <td style="padding:9px 12px"><span style="padding:2px 8px;border-radius:12px;font-size:11px;font-weight:700;background:${getStatus(p)==='collecting'?'#fef3c7':getStatus(p)==='applied'?'#dbeafe':getStatus(p)==='review'?'#fee2e2':getStatus(p)==='permitted'?'#dcfce7':'#f3e8ff'};color:${getStatus(p)==='collecting'?'#92400e':getStatus(p)==='applied'?'#1e40af':getStatus(p)==='review'?'#991b1b':getStatus(p)==='permitted'?'#14532d':'#6b21a8'}">${STATUS_MAP[getStatus(p)]||'—'}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
    modal.onclick = (e) => { if(e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
  }

  function enhanceReports() {
    const permits = getPermits();
    const statusCounts = {};
    permits.forEach(p => { const s = getStatus(p); statusCounts[s] = (statusCounts[s]||0)+1; });

    // Find KPI cards and make them clickable
    const cards = document.querySelectorAll('.kpi-card, [class*="kpi"], .stat-card, .report-stat');
    cards.forEach(card => {
      const numEl = card.querySelector('.kpi-value, .stat-num, [class*="value"], h2, h3');
      if (!numEl || card.dataset.enhanced) return;
      card.dataset.enhanced = '1';
      card.style.cursor = 'pointer';
      card.title = 'Click to see addresses';
      card.addEventListener('click', function() {
        const text = card.textContent.toLowerCase();
        let filtered = permits;
        let title = 'All Permits';
        if (text.includes('collect')) { filtered = permits.filter(p=>getStatus(p)==='collecting'); title='Collecting Docs'; }
        else if (text.includes('review') || text.includes('city')) { filtered = permits.filter(p=>getStatus(p)==='review'); title='Under Review'; }
        else if (text.includes('permit') && !text.includes('total')) { filtered = permits.filter(p=>getStatus(p)==='permitted'); title='Permitted'; }
        else if (text.includes('co') || text.includes('certif')) { filtered = permits.filter(p=>getStatus(p)==='co'); title='CO Received'; }
        else if (text.includes('applied')) { filtered = permits.filter(p=>getStatus(p)==='applied'); title='Applied'; }
        showDrillDown(title, filtered);
      });
    });

    // Add multi-select status section if not already there
    if (document.getElementById('_multiselect_status')) return;
    const filterArea = document.querySelector('.report-filters, [class*="filter"], .reports-controls');
    if (!filterArea) return;

    const multiDiv = document.createElement('div');
    multiDiv.id = '_multiselect_status';
    multiDiv.style.cssText = 'margin-top:12px;padding:12px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0';
    multiDiv.innerHTML = `<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:8px">📋 MULTI-SELECT STATUS</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px">
        ${Object.entries(STATUS_MAP).map(([k,v]) => `<label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:5px 10px;background:#fff;border:2px solid #e2e8f0;border-radius:20px;font-size:12px;font-weight:600;transition:all .15s" id="_lbl_${k}">
          <input type="checkbox" value="${k}" onchange="_updateMultiStatus()" style="cursor:pointer"> ${v}
        </label>`).join('')}
      </div>
      <button onclick="_showMultiReport()" style="padding:7px 16px;background:#7c3aed;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;margin-right:8px">📊 View Selected</button>
      <button onclick="_printMultiReport()" style="padding:7px 16px;background:#2da44e;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer">🖨 Print Selected</button>`;
    filterArea.appendChild(multiDiv);
  }

  window._updateMultiStatus = function() {
    _selectedStatuses = Array.from(document.querySelectorAll('#_multiselect_status input:checked')).map(i=>i.value);
    Object.keys(STATUS_MAP).forEach(k => {
      const lbl = document.getElementById('_lbl_'+k);
      if(lbl) lbl.style.background = _selectedStatuses.includes(k) ? '#ede9fe' : '#fff';
      if(lbl) lbl.style.borderColor = _selectedStatuses.includes(k) ? '#7c3aed' : '#e2e8f0';
    });
  };

  window._showMultiReport = function() {
    const permits = getPermits();
    const sel = _selectedStatuses.length ? _selectedStatuses : Object.keys(STATUS_MAP);
    const filtered = permits.filter(p => sel.includes(getStatus(p)));
    const title = _selectedStatuses.length ? _selectedStatuses.map(s=>STATUS_MAP[s]).join(' + ') : 'All Permits';
    showDrillDown(title, filtered);
  };

  window._printMultiReport = function() {
    window._showMultiReport();
    setTimeout(() => window.print(), 500);
  };

  // Run enhancement when Reports tab is active
  const observer = new MutationObserver(() => enhanceReports());
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(enhanceReports, 500);
  setInterval(enhanceReports, 2000);
})();