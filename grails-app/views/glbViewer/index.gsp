<div class="pm-shell" data-pm-theme="dark">
<g:render template="/shared/pmShellStyles"/>
<g:render template="/shared/pmShellSidebar"/>
<div class="pm-main">
<g:render template="/shared/pmShellHeader" model="[moduleTitle:'Advanced 3D Viewer']"/>
<main class="pm-content">
<link rel="stylesheet" href="${assetPath(src: 'glb-viewer.css')}"/>
<div class="gv" id="gv-root" data-base="${g.createLink(controller:'glbViewer', action:'index')}" data-viewer-user="${viewerUsername?.encodeAsHTML()}">
 <div class="gv-toolbar gv-primary" role="toolbar" aria-label="Viewer tools">
  <button id="gv-add" type="button" title="Add selected GLB part"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M6 3h18l6 6v24H6z" fill="#c7e3ff" stroke="#1c579b" stroke-width="2"/><path d="M24 3v7h6" fill="none" stroke="#1c579b" stroke-width="2"/><path d="M26 19v14M19 26h14" stroke="#24a93d" stroke-width="5"/></svg></span><small>Add Part</small></button>
  <label class="gv-upload-button" title="Import GLB or ASMJ model"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M3 11V7h12l4 4h14v20H3z" fill="#f4c44e" stroke="#966c10" stroke-width="2"/><path d="M3 15h30l-4 16H3z" fill="#ffd568" stroke="#966c10" stroke-width="2"/></svg></span><small>Import Model</small><input id="gv-upload" type="file" accept=".glb,.asmj,model/gltf-binary,application/json" hidden></label>
  <div class="gv-save-menu" style="position:relative;display:inline-block">
   <button id="gv-save-menu" type="button" aria-haspopup="true" aria-expanded="false"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M5 4h23l4 4v24H5z" fill="#acd4ff" stroke="#20549a" stroke-width="2"/><path d="M11 4h16v12H11z" fill="#e9f4ff" stroke="#20549a" stroke-width="2"/><path d="M10 22h17v10H10z" fill="#fff" stroke="#20549a" stroke-width="2"/></svg></span><small>Save ▾</small></button>
   <div id="gv-save-options" hidden style="position:absolute;right:0;top:100%;z-index:30;min-width:165px;padding:5px;background:#252e39;border:1px solid #617087;border-radius:5px;box-shadow:0 5px 15px #0008">
    <button id="gv-save" type="button" style="display:block;width:100%;text-align:left">Save</button>
    <button id="gv-save-new" type="button" style="display:block;width:100%;text-align:left">Save as New</button>
    <button id="gv-export" type="button" style="display:block;width:100%;text-align:left">Export ASMJ</button>
   </div>
  </div>
  <button id="gv-scene-open" type="button" title="Browse saved scenes" aria-haspopup="dialog"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M4 9h11l4 4h13v18H4z" fill="#e6bb55" stroke="#8b641e" stroke-width="2"/><path d="M4 15h28l-4 16H4z" fill="#ffd97b" stroke="#8b641e" stroke-width="2"/><path d="M13 4h16v8H13z" fill="#bcd9ff" stroke="#2564ac" stroke-width="2"/></svg></span><small>Scenes</small></button>
  <button id="gv-refresh-links" type="button" title="Refresh all linked assemblies"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M28 11A13 13 0 0 0 7 9L4 13M8 25a13 13 0 0 0 21-1l3-3" fill="none" stroke="#1e66bb" stroke-width="4" stroke-linecap="round"/><path d="M4 5v9h9M32 30v-9h-9" fill="none" stroke="#1e66bb" stroke-width="2.5"/></svg></span><small>Refresh Links</small></button>
  <button id="gv-update" type="button" title="Check PLM part versions"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M18 3 32 18H24v14H12V18H4z" fill="#4ce044" stroke="#126f18" stroke-width="2"/></svg></span><small>Update Parts</small></button>
  <button type="button" id="gv-perspective" class="gv-top-icon" aria-pressed="false" title="Toggle perspective / orthographic projection" aria-label="Perspective projection"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M6 8 28 4v28L6 27z" fill="#b9d8ff" stroke="#1b5aa5" stroke-width="2"/><path d="m6 8 11 8 11-12M17 16v14" fill="none" stroke="#1b5aa5" stroke-width="2"/></svg></span><small>Perspective</small></button>
  <label class="gv-top-units" title="Scene display units"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M4 11h28v15H4z" fill="#f5d788" stroke="#9c721a" stroke-width="2"/><path d="M10 11v8m6-8v5m6-5v8m6-8v5" stroke="#9c721a" stroke-width="2"/></svg></span><small>Units ▾</small><select id="gv-units" aria-label="Scene units"><option value="mm">mm</option><option value="cm">cm</option><option value="m">m</option><option value="in">in</option><option value="ft">ft</option></select></label>
  <span class="gv-separator"></span>
  <button id="gv-select" class="active" type="button" title="Select part (click in 3D view to highlight in model tree)"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M7 3 8 29 15 22 21 34 27 31 21 19 31 18z" fill="#c6e4ff" stroke="#1a539a" stroke-width="2.5"/></svg></span><small>Select</small></button>
  <button id="gv-move" type="button" title="Move selected"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M18 18V3m0 15L5 30m13-12 13 12" stroke-width="4" stroke-linecap="round" fill="none" stroke="#236bd6"/><path d="m18 2-5 9h10z" fill="#236bd6"/><path d="m4 31 11-2-7-8z" fill="#e32d36"/><path d="m32 31-11-2 7-8z" fill="#2aba43"/></svg></span><small>Move</small></button>
  <button id="gv-rotate" type="button" title="Rotate selected"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M6 21A13 13 0 0 1 26 7M30 15A13 13 0 0 1 10 29" fill="none" stroke="#196fc2" stroke-width="3.7" stroke-linecap="round"/><path d="m26 3 2 11-10-3" fill="#28bc43"/><path d="m10 33-2-11 10 3" fill="#e93634"/></svg></span><small>Rotate</small></button>
  <button id="gv-scale" type="button" title="Scale selected"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M6 30V13h17v17z" fill="#9fcaff" stroke="#1952a3" stroke-width="2"/><path d="M18 18 32 4m-10 0h10v10" stroke="#164f9e" stroke-width="3.5" fill="none"/></svg></span><small>Scale</small></button>
  <button id="gv-restore-locations" type="button" title="Restore all parts to their original imported positions"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M8 12A13 13 0 1 1 6 23" stroke="#2476c9" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M3 4v12h12" stroke="#2476c9" stroke-width="3" fill="none"/><path d="M18 11v9l7 5" stroke="#77baff" stroke-width="3" fill="none"/></svg></span><small>Restore Locations</small></button>
  <button id="gv-color-open" type="button" title="Change selected part color"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M18 3a15 15 0 1 0 0 30h4a4 4 0 0 0 2-7c-2-2 0-5 3-5h4c3-9-3-18-13-18z" fill="#d9e9fa" stroke="#245b9d" stroke-width="2"/><circle cx="11" cy="12" r="3" fill="#f44336"/><circle cx="20" cy="9" r="3" fill="#ffd54f"/><circle cx="27" cy="16" r="3" fill="#4caf50"/><circle cx="13" cy="23" r="3" fill="#2196f3"/></svg></span><small>Color</small></button>
  <button id="gv-info-open" type="button" title="Scene information"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15" fill="#c6e1ff" stroke="#235d9d" stroke-width="2"/><path d="M18 15v12" stroke="#235d9d" stroke-width="3"/><circle cx="18" cy="9" r="2" fill="#235d9d"/></svg></span><small>Info</small></button>
  <button id="gv-notes-open" type="button" title="Add a text note to the selected model"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M5 3h26v30H5z" fill="#fff0ba" stroke="#9c7824" stroke-width="2"/><path d="M10 11h16M10 17h16M10 23h10" stroke="#9c7824" stroke-width="2"/></svg></span><small>Notes</small></button>
  <button id="gv-delete" type="button" title="Remove selected part or assembly (Delete)" aria-label="Delete selected part or assembly" disabled><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M7 10h22M13 10V6h10v4M10 12l2 19h12l2-19" fill="#f5b6b6" stroke="#9d2531" stroke-width="2.5" stroke-linejoin="round"/><path d="M16 16v11M21 16v11" stroke="#9d2531" stroke-width="2"/></svg></span><small>Delete</small></button>
  <button id="gv-undo-delete" type="button" title="Undo last deletion (Ctrl+Z)" aria-label="Undo deletion" disabled><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M11 10H4l7-7M4 10h18c13 0 13 21 0 21h-9" fill="none" stroke="#2868ba" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span><small>Undo</small></button>
  <button id="gv-measure" type="button" title="Measure between two points"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="m8 28 17-18" stroke="#b6bcc7" stroke-width="8" stroke-linecap="round"/><path d="m8 28 17-18" stroke="#3e4554" stroke-width="2"/><path d="m5 24 7 7m9-25 9 9" stroke="#244b83" stroke-width="3"/><path d="M3 33h30" stroke="#e7ae31" stroke-width="3"/></svg></span><small>Measure</small></button>

  <button id="gv-section" type="button" title="Section view"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="m5 11 13-7 13 7v15l-13 7-13-7z" fill="#b8d9ff" stroke="#1955a0" stroke-width="2"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#1955a0" stroke-width="2"/><path d="M23 3 11 33" stroke="#f03937" stroke-width="3"/></svg></span><small>Section</small></button>
 </div>
 <div class="gv-camera-toolbar" role="toolbar" aria-label="Camera and navigation">
  <div class="gv-view-presets" role="group" aria-label="Standard views">
   <button type="button" id="gv-front" title="Front view"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#a7cbf4" stroke="#164d99" stroke-width="1.8"/><path d="M5 11 18 18v15L5 26z" fill="#ef5656"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.8"/></svg><span>Front</span></button>
   <button type="button" id="gv-back" title="Back view"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#a7cbf4" stroke="#164d99" stroke-width="1.8"/><path d="M18 18 31 11v15L18 33z" fill="#ef5656"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.8"/></svg><span>Back</span></button>
   <button type="button" id="gv-left" title="Left view"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#a7cbf4" stroke="#164d99" stroke-width="1.8"/><path d="M5 11 18 18v15L5 26z" fill="#ef5656"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.8"/></svg><span>Left</span></button>
   <button type="button" id="gv-right" title="Right view"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#a7cbf4" stroke="#164d99" stroke-width="1.8"/><path d="M18 18 31 11v15L18 33z" fill="#ef5656"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.8"/></svg><span>Right</span></button>
   <button type="button" id="gv-top" title="Top view"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#a7cbf4" stroke="#164d99" stroke-width="1.8"/><path d="m18 4 13 7-13 7-13-7z" fill="#ef5656"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.8"/></svg><span>Top</span></button>
   <button type="button" id="gv-bottom" title="Bottom view"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#a7cbf4" stroke="#164d99" stroke-width="1.8"/><path d="m5 26 13 7 13-7-13-7z" fill="#ef5656"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.8"/></svg><span>Bottom</span></button>
   <button type="button" id="gv-iso" title="Isometric view"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#a7cbf4" stroke="#164d99" stroke-width="1.8"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.8"/></svg><span>Iso</span></button>
  <button id="gv-fit" type="button" title="Fit all"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M3 13V4h10M23 4h10v9M33 23v9H23M13 32H3v-9" stroke="#1c529e" stroke-width="3" fill="none"/><path d="m18 8 10 6v11l-10 6-10-6V14z" fill="#9dc7f9" stroke="#164d99" stroke-width="1.8"/><path d="m8 14 10 6 10-6M18 20v11" fill="none" stroke="#164d99" stroke-width="1.7"/></svg></span><small>Fit All</small></button>
  </div>
  <div class="gv-spin-buttons" role="group" aria-label="Spin center">
   <button type="button" id="gv-spin-model" class="active" aria-pressed="true" title="Spin around visible model center" aria-label="Model center"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="m18 3 12 7v15l-12 8-12-8V10z" fill="#b8d9ff" stroke="#1855a5" stroke-width="2"/><circle cx="18" cy="18" r="6" fill="none" stroke="#1151a7" stroke-width="2.5"/><path d="M18 7v7m0 8v7M7 18h7m8 0h7" stroke="#1151a7" stroke-width="2"/></svg></button>
   <button type="button" id="gv-spin-view" aria-pressed="false" title="Spin around view center" aria-label="View center"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="30" height="22" fill="#d9eaff" stroke="#164e9a" stroke-width="2"/><path d="M12 32h12M18 28v4" stroke="#164e9a" stroke-width="2"/><circle cx="18" cy="17" r="6" fill="none" stroke="#164e9a" stroke-width="2"/><path d="M18 7v20M8 17h20" stroke="#164e9a" stroke-width="1.7"/></svg></button>
   <button type="button" id="gv-spin-selected" aria-pressed="false" title="Spin around selected part" aria-label="Selected part center"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M3 13V4h10M23 4h10v9M33 23v9H23M13 32H3v-9" fill="none" stroke="#164e9a" stroke-width="2.7"/><path d="m18 9 9 5v9l-9 5-9-5v-9z" fill="#b5d9ff" stroke="#164e9a" stroke-width="1.8"/><path d="m9 14 9 5 9-5M18 19v9" fill="none" stroke="#164e9a"/></svg></button>
  </div>
  <span class="gv-toolbar-divider" aria-hidden="true"></span>
 <div class="gv-scene-state" hidden aria-hidden="true">
  <input id="gv-scene-name" type="hidden" value=""/>
  <input id="gv-shared" type="checkbox" hidden/>
  <select id="gv-scenes" hidden aria-label="Saved scenes"></select>
  <button id="gv-load" type="button" hidden>Load</button>
  <button id="gv-refresh" type="button" hidden>Refresh</button>
 </div>
 </div>
 <dialog id="gv-info-dialog" class="gv-scenes-dialog gv-utility-dialog" aria-labelledby="gv-info-title">
  <div class="gv-scenes-head"><strong id="gv-info-title">Scene Information</strong><button id="gv-info-close" type="button" aria-label="Close">✕</button></div>
  <dl class="gv-utility-details"><dt>Scene name</dt><dd id="gv-info-name">—</dd><dt>Creator</dt><dd id="gv-info-creator">—</dd><dt>Models</dt><dd id="gv-info-count">0</dd><dt>Estimated model memory</dt><dd id="gv-info-memory">0 MB</dd></dl>
  <div class="gv-scenes-footer"><button id="gv-info-done" type="button">Close</button></div>
 </dialog>
 <dialog id="gv-notes-dialog" class="gv-scenes-dialog gv-utility-dialog" aria-labelledby="gv-notes-title">
  <div class="gv-scenes-head"><strong id="gv-notes-title">Model Notes</strong><button id="gv-notes-close" type="button" aria-label="Close">✕</button></div>
  <form id="gv-notes-form" class="gv-utility-body"><p id="gv-notes-target">Select a model in the tree or viewport to attach a note.</p><label for="gv-notes-name">Note name / text</label><input id="gv-notes-name" maxlength="200" required placeholder="Enter a note" autocomplete="off"/><p id="gv-notes-error" role="alert" hidden></p><div class="gv-utility-note-list" id="gv-notes-list"></div>
   <div class="gv-scenes-footer"><button id="gv-notes-add" type="submit">Add Note</button><button id="gv-notes-clear" type="button">Clear All Notes</button><button id="gv-notes-cancel" type="button">Cancel</button></div>
  </form>
 </dialog>
 <style>
 .gv .gv-utility-dialog{width:min(560px,94vw)}
 .gv .gv-utility-details{display:grid;grid-template-columns:160px 1fr;gap:12px;padding:22px;margin:0}
 .gv .gv-utility-details dt{font-weight:600}.gv .gv-utility-details dd{margin:0;overflow-wrap:anywhere}
 .gv .gv-utility-body{padding:18px}.gv .gv-utility-body label{display:block;margin:12px 0 6px;font-weight:600}
 .gv .gv-utility-body input{width:100%;padding:10px;border:1px solid #8094a7;border-radius:5px;background:var(--pm-surface,#263441);color:var(--pm-text,#f3f7fb)}
 .gv .gv-utility-note-list{max-height:180px;overflow:auto;margin-top:14px}.gv .gv-utility-note-list p{margin:5px 0}
 .gv .gv-utility-body .gv-scenes-footer{margin:18px -18px -18px;padding:12px;flex-wrap:wrap}
 .pm-shell[data-pm-theme="light"] .gv .gv-utility-body input{background:white;color:#18283b}
 </style>
 <dialog id="gv-save-dialog" class="gv-scenes-dialog gv-save-dialog" aria-labelledby="gv-save-dialog-title">
  <form id="gv-save-form" method="dialog" novalidate>
   <div class="gv-scenes-head"><strong id="gv-save-dialog-title">Save Scene</strong><button type="button" id="gv-save-close" aria-label="Close save dialog">✕</button></div>
   <div class="gv-save-body">
    <label for="gv-save-name">Scene name</label>
    <input id="gv-save-name" name="sceneName" type="text" maxlength="160" required autocomplete="off" placeholder="Enter a scene name"/>
    <label class="gv-save-share"><input id="gv-save-share" type="checkbox"/> Share this scene with other users</label>
    <p id="gv-save-error" role="alert" aria-live="polite" hidden></p>
   </div>
   <div class="gv-scenes-footer"><button id="gv-save-confirm" type="submit">Save</button><button id="gv-save-cancel" type="button">Cancel</button></div>
  </form>
 </dialog>
 <dialog id="gv-scenes-dialog" class="gv-scenes-dialog" aria-labelledby="gv-scenes-dialog-title">
  <div class="gv-scenes-head"><strong id="gv-scenes-dialog-title">Saved Scenes</strong><button type="button" id="gv-scenes-close" aria-label="Close scenes">✕</button></div>
  <div class="gv-scenes-content">
   <table class="gv-scenes-table"><thead><tr><th>Scene</th><th>Owner</th><th>Shared</th><th>Last Updated</th></tr></thead><tbody id="gv-scenes-results"></tbody></table>
   <div id="gv-scenes-empty" class="gv-scenes-empty" hidden>No saved scenes available.</div>
  </div>
  <div class="gv-scenes-footer"><span id="gv-scenes-status" role="status" aria-live="polite"></span><button type="button" id="gv-scenes-load" disabled>Load</button><button type="button" id="gv-scenes-share" disabled>Share</button><button type="button" id="gv-scenes-delete" disabled>Delete</button><button type="button" id="gv-scenes-cancel">Cancel</button></div>
 </dialog>
 <dialog id="gv-part-dialog" class="gv-plm-dialog" aria-labelledby="gv-part-dialog-title">
  <div class="gv-plm-head"><strong id="gv-part-dialog-title">Add Part from PLM</strong><button type="button" id="gv-part-close" aria-label="Close">✕</button></div>
  <div class="gv-plm-body">
   <form id="gv-part-search-form" class="gv-plm-search"><label for="gv-part-query">Search</label><input id="gv-part-query" type="search" placeholder="Part ID, filename or label" autocomplete="off"><button type="submit">⌕ Search</button></form>
   <div class="gv-plm-columns"><div class="gv-plm-table-wrap"><table class="gv-plm-table"><thead><tr><th>Part ID</th><th>Name</th><th>CAD Version</th><th>Lifecycle State</th></tr></thead><tbody id="gv-part-results"></tbody></table><div id="gv-part-empty" class="gv-plm-empty">Search the PLM database to find a part.</div></div>
   <aside class="gv-plm-preview"><strong>Preview</strong><div class="gv-plm-image"><img id="gv-part-thumbnail" alt="Selected part thumbnail" hidden><span id="gv-part-no-thumbnail">Select a part to view its thumbnail</span></div><div id="gv-part-details"></div></aside></div>
  </div><div class="gv-plm-footer"><span id="gv-part-count" aria-live="polite"></span><button type="button" id="gv-part-confirm" disabled>Add</button><button type="button" id="gv-part-cancel">Cancel</button></div>
 </dialog>
 <style>
 .gv-plm-dialog{width:min(1040px,95vw);max-height:88vh;padding:0;background:#202a35;color:#eaf3ff;border:1px solid #7890aa;border-radius:10px;box-shadow:0 16px 55px #000a}
 .gv-plm-dialog::backdrop{background:#080e18b9}.gv-plm-head{display:flex;align-items:center;justify-content:space-between;padding:16px 22px;background:#1764ac;font-size:20px}.gv-plm-head button{background:transparent;color:white;border:0;font-size:20px;cursor:pointer}.gv-plm-body{padding:18px}.gv-plm-search{display:flex;align-items:center;gap:12px;margin-bottom:16px}.gv-plm-search input{flex:1;min-width:0;padding:10px;background:#17212d;color:white;border:1px solid #62768c;border-radius:5px}.gv-plm-search button,.gv-plm-footer button{padding:10px 19px;background:#1768b7;color:white;border:1px solid #75a5d4;border-radius:5px;cursor:pointer}.gv-plm-footer button:disabled{opacity:.45;cursor:default}.gv-plm-columns{display:grid;grid-template-columns:minmax(0,2.1fr) minmax(220px,1fr);gap:14px}.gv-plm-table-wrap{min-height:270px;max-height:390px;overflow:auto;border:1px solid #506477;border-radius:6px}.gv-plm-table{width:100%;border-collapse:collapse;font-size:13px}.gv-plm-table th{position:sticky;top:0;background:#304255;text-align:left;padding:11px 8px}.gv-plm-table td{padding:9px 8px;border-top:1px solid #3b4b5a}.gv-plm-table tbody tr{cursor:pointer}.gv-plm-table tbody tr:hover{background:#30485e}.gv-plm-table tbody tr[aria-selected="true"]{background:#1768b7}.gv-plm-empty{padding:20px;color:#a9bacb}.gv-plm-preview{border:1px solid #506477;border-radius:6px;padding:12px}.gv-plm-image{display:flex;align-items:center;justify-content:center;min-height:185px;background:#303e4c;margin:10px 0;border-radius:6px;text-align:center;color:#aebed0}.gv-plm-image img{width:100%;max-height:220px;object-fit:contain}.gv-plm-image img[hidden]{display:none}.gv-plm-footer{display:flex;justify-content:flex-end;align-items:center;gap:12px;padding:13px 18px;border-top:1px solid #506477}.gv-plm-footer span{margin-right:auto;color:#b5c9db}
 @media(max-width:650px){.gv-plm-columns{grid-template-columns:1fr}.gv-plm-table-wrap{min-height:150px;max-height:240px}.gv-plm-search{flex-wrap:wrap}.gv-plm-preview{min-height:100px}}
 
.gv .gv-scenes-dialog{width:min(960px,95vw);max-height:85vh;padding:0;background:var(--pm-surface,#202a35);color:var(--pm-text,#eaf3ff);border:1px solid var(--pm-border,#7890aa);border-radius:10px;box-shadow:0 16px 55px #0008}
.gv .gv-scenes-dialog::backdrop{background:#080e18b9}
.gv .gv-scenes-head{display:flex;justify-content:space-between;align-items:center;background:#1764ac;color:#fff;padding:14px 20px;font-size:19px}
.gv .gv-scenes-head button{border:0;background:transparent;color:inherit;font-size:20px;cursor:pointer}
.gv .gv-scenes-content{padding:16px;overflow:auto;max-height:55vh;min-height:180px}
.gv .gv-scenes-table{width:100%;border-collapse:collapse;text-align:left;font-size:14px}
.gv .gv-scenes-table th{position:sticky;top:0;background:var(--pm-surface-alt,#304255);color:var(--pm-text,#eaf3ff);padding:10px;border-bottom:1px solid var(--pm-border,#65758b)}
.gv .gv-scenes-table td{padding:10px;border-bottom:1px solid var(--pm-border,#526273);color:var(--pm-text,#eaf3ff)}
.gv .gv-scenes-table tbody tr{cursor:pointer}
.gv .gv-scenes-table tbody tr:hover{background:rgba(50,135,215,.16)}
.gv .gv-scenes-table tbody tr[aria-selected="true"]{background:#1768b7;color:white}
.gv .gv-scenes-table tbody tr[aria-selected="true"] td{color:white}
.gv .gv-scenes-empty{padding:25px;text-align:center;color:var(--pm-muted,#aebed0)}
.gv .gv-scenes-footer{display:flex;align-items:center;justify-content:flex-end;gap:10px;flex-wrap:wrap;padding:14px 18px;border-top:1px solid var(--pm-border,#65758b)}
.gv .gv-scenes-footer #gv-scenes-status{margin-right:auto;font-size:13px;color:var(--pm-text,#eaf3ff)}
.gv .gv-scenes-footer button{background:#1768b7;color:#fff;border:1px solid #75a5d4;border-radius:5px;padding:9px 17px;cursor:pointer}
.gv .gv-scenes-footer button:disabled{opacity:.4;cursor:default}
.gv .gv-scenes-footer #gv-scenes-delete:not(:disabled){background:#9d2935;border-color:#e16e78}
.pm-shell[data-pm-theme="light"] .gv .gv-scenes-dialog{background:#fff;color:#18283b}
.pm-shell[data-pm-theme="light"] .gv .gv-scenes-table th{background:#e4edf6;color:#18283b}
.pm-shell[data-pm-theme="light"] .gv .gv-scenes-table td{color:#18283b}
</style>
 <style>
/* Viewer toolbar consistency and PLM search theme */
.gv .gv-primary .gv-save-menu > button, .gv .gv-primary .gv-top-units {display:inline-flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-width:70px;min-height:72px;vertical-align:top}
.gv .gv-primary .gv-save-menu .gv-icon, .gv .gv-primary .gv-top-units .gv-icon {display:flex;align-items:center;justify-content:center;height:36px;width:36px}
.gv .gv-primary .gv-save-menu .gv-icon svg, .gv .gv-primary .gv-top-units .gv-icon svg {width:34px;height:34px}
.gv .gv-primary .gv-save-menu small, .gv .gv-primary .gv-top-units small {font-size:11px;white-space:nowrap}
.gv .gv-primary .gv-top-units {position:relative;cursor:pointer}
.gv .gv-primary .gv-top-units select {position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
.gv .gv-primary .gv-top-units:focus-within {outline:2px solid #2683e4;outline-offset:2px}
.gv .gv-primary #gv-restore-locations .gv-icon svg,.gv .gv-primary .gv-upload-button .gv-icon svg {width:36px;height:36px}
.gv .gv-primary #gv-fit .gv-icon svg {width:36px;height:36px;flex:none}
.gv .gv-primary #gv-fit .gv-icon {display:flex;align-items:center;justify-content:center}
.gv .gv-primary #gv-perspective[aria-pressed="true"] {background:#2066a7;color:white}
.pm-shell[data-pm-theme="light"] .gv-plm-dialog {background:#fff;color:#18283b;border-color:#a6b6c7}
.pm-shell[data-pm-theme="light"] .gv-plm-body,.pm-shell[data-pm-theme="light"] .gv-plm-footer {background:#fff;color:#18283b}
.pm-shell[data-pm-theme="light"] .gv-plm-search input {background:#fff;color:#18283b;border-color:#899db1}
.pm-shell[data-pm-theme="light"] .gv-plm-table-wrap,.pm-shell[data-pm-theme="light"] .gv-plm-preview {border-color:#b5c4d2}
.pm-shell[data-pm-theme="light"] .gv-plm-table th {background:#e5eef7;color:#172b42}
.pm-shell[data-pm-theme="light"] .gv-plm-table td {color:#18283b;border-color:#d4e0ec}
.pm-shell[data-pm-theme="light"] .gv-plm-table tbody tr:hover {background:#e4f0ff}
.pm-shell[data-pm-theme="light"] .gv-plm-table tbody tr[aria-selected="true"] {background:#1768b7}
.pm-shell[data-pm-theme="light"] .gv-plm-table tbody tr[aria-selected="true"] td {color:#fff}
.pm-shell[data-pm-theme="light"] .gv-plm-image {background:#eef3f9;color:#40556b}
.pm-shell[data-pm-theme="light"] .gv-plm-empty,.pm-shell[data-pm-theme="light"] .gv-plm-footer span {color:#45596e}
.pm-shell[data-pm-theme="dark"] .gv-plm-table th {color:#f4f8ff}
.pm-shell[data-pm-theme="dark"] .gv-plm-table td {color:#edf4ff}
.pm-shell[data-pm-theme="dark"] .gv-plm-table tbody tr[aria-selected="true"] td {color:#fff}
.pm-shell[data-pm-theme="dark"] .gv-plm-search label,.pm-shell[data-pm-theme="dark"] .gv-plm-preview {color:#edf4ff}
</style>
 <dialog id="gv-units-dialog" style="background:#252e39;color:#f4f7fc;border:1px solid #8091aa;border-radius:8px;padding:20px;min-width:min(360px,90vw)">
  <form method="dialog" id="gv-units-form"><h3 style="margin:0 0 12px">Model units unknown</h3><p>Select the units used by the imported model.</p>
  <label>Model units <select id="gv-import-units" style="margin:8px"><option value="mm">Millimeters (mm)</option><option value="cm">Centimeters (cm)</option><option value="m">Meters (m)</option><option value="in">Inches (in)</option><option value="ft">Feet (ft)</option></select></label>
  <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:18px"><button value="cancel">Cancel</button><button value="ok">Continue</button></div></form>
 </dialog>
 <div class="gv-layout">
  <div class="gv-view" id="gv-view"><button type="button" id="gv-fullscreen" class="gv-fullscreen" title="Toggle full-screen 3D view" aria-label="Toggle full-screen 3D view" aria-pressed="false">⛶</button><canvas id="gv-orientation" class="gv-orientation" width="140" height="140" aria-label="XYZ orientation axes" role="img"></canvas><div id="gv-canvas" class="gv-canvas"></div><div id="gv-load-overlay" class="gv-load-overlay" role="status" aria-live="polite" hidden><div id="gv-load-title" class="gv-load-title">Loading model…</div><div class="gv-load-track" role="progressbar" aria-label="Model download progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" id="gv-load-track"><div id="gv-load-fill" class="gv-load-fill"></div></div><div id="gv-load-caption" class="gv-load-caption">Connecting…</div></div>
   <div id="gv-measure-dialog" class="gv-floating gv-measure-dialog" role="dialog" aria-label="Measurement options" hidden>
    <div class="gv-floating-title"><span>📐 Measurement</span><button id="gv-measure-close" type="button" aria-label="Close measurement options">×</button></div>
    <div class="gv-dialog-body">
     <div class="gv-section-label">Dimension type</div>
     <div class="gv-measure-modes" role="group" aria-label="Measurement dimension projection">
      <button type="button" data-measure="distance" class="active" aria-pressed="true" title="Actual 3D distance">3D</button>
      <button type="button" data-measure="x" aria-pressed="false" title="X-axis projection">X</button>
      <button type="button" data-measure="y" aria-pressed="false" title="Y-axis projection">Y</button>
      <button type="button" data-measure="z" aria-pressed="false" title="Z-axis projection">Z</button>
      <button type="button" data-measure="xyz" aria-pressed="false" title="3D distance and all X/Y/Z projections">XYZ</button>
     </div>
     <div class="gv-note">Select two points on model surfaces. Each measurement is displayed on its line and saved with the scene.</div>
     <div class="gv-dialog-actions"><button id="gv-measure-clear" type="button">Clear All</button><button id="gv-measure-done" type="button">Done</button></div>
    </div>
   </div>
   <div id="gv-section-panel" class="gv-floating" hidden>
    <div class="gv-floating-title"><span><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="m5 11 13-7 13 7v15l-13 7-13-7z" fill="#b8d9ff" stroke="#1955a0" stroke-width="2"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#1955a0" stroke-width="2"/><path d="M23 3 11 33" stroke="#f03937" stroke-width="3"/></svg> Section View</span><button id="gv-section-close" type="button" title="Close section controls" aria-label="Close section controls">×</button></div>
    <div class="gv-section-body">
     <label class="gv-section-check"><input type="checkbox" id="gv-section-enabled"> Enable Section</label>
     <label class="gv-section-field"><span>Scope</span><select id="gv-section-scope"><option value="scene">Entire Scene</option><option value="selected">Selected Part / Assembly</option></select></label>
     <div class="gv-section-label">Section Type</div>
     <div class="gv-section-axis" role="group" aria-label="Section plane axis">
      <button type="button" data-axis="x" title="X section plane"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#9dc7f9" stroke="#164d99" stroke-width="1.8"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.7"/><path d="m18 4 13 7-13 7-13-7z" fill="#d5e8ff"/></svg><span>X</span></button>
      <button type="button" data-axis="y" title="Y section plane"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#9dc7f9" stroke="#164d99" stroke-width="1.8"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.7"/><path d="m18 4 13 7-13 7-13-7z" fill="#d5e8ff"/></svg><span>Y</span></button>
      <button type="button" data-axis="z" class="active" title="Z section plane"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#9dc7f9" stroke="#164d99" stroke-width="1.8"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.7"/><path d="m18 4 13 7-13 7-13-7z" fill="#d5e8ff"/></svg><span>Z</span></button>
     </div>
     <select id="gv-section-axis" aria-label="Section axis" hidden><option value="x">X</option><option value="y">Y</option><option value="z" selected>Z</option></select>
     <label class="gv-section-field"><span>Position</span><input id="gv-section-position" type="number" step="any" value="0" aria-label="Section position in millimeters"><span>mm</span></label>
     <input id="gv-section-slider" type="range" min="-1000" max="1000" step="1" value="0" aria-label="Section plane offset">
     <label class="gv-section-field"><span>Rotate plane</span><output id="gv-section-rotation-label" for="gv-section-rotation">0°</output></label>
     <input id="gv-section-rotation" type="range" min="-180" max="180" step="1" value="0" aria-label="Rotate section plane in degrees">
     <div class="gv-section-label">Direction</div><label class="gv-section-check"><input id="gv-section-reverse" type="checkbox"> Reversed</label>
     <label class="gv-section-check"><input id="gv-section-show-plane" type="checkbox" checked> Show Cutting Plane</label>
     <label class="gv-section-cap-row"><input id="gv-section-cap" type="checkbox" checked><span>Cap Cut Surfaces</span><input id="gv-section-cap-color" class="gv-section-cap-color" type="color" value="#d94a40" title="Capping surface color" aria-label="Capping surface color"></label>
     <div class="gv-section-actions"><button id="gv-section-reset" type="button">↻ Reset</button><button id="gv-section-disable" type="button">✕ Disable Section</button></div>
    </div>
   </div>
   <div id="gv-measure-panel" class="gv-measure-panel" aria-live="polite"></div>
   <aside class="gv-tree" id="gv-tree-overlay"><h3 id="gv-tree-handle">▾ Model tree</h3><div id="gv-tree" role="tree" aria-label="Scene model tree"></div></aside></div>
  <aside class="gv-side" hidden style="display:none">
   <h3>Selected object</h3><div id="gv-objects" class="gv-list" style="display:none"></div>
   <div class="gv-row"><button id="gv-remove" type="button">Remove selected</button><button id="gv-reset" type="button">Reset transform</button></div>
   <h3>Selected model</h3><div id="gv-selected" class="gv-note">None selected</div>
   <label>Position (X, Y, Z) <div id="gv-pos" class="gv-row"><input type="number" step="any"/><input type="number" step="any"/><input type="number" step="any"/></div></label>
   <label>Rotation (degrees X, Y, Z) <div id="gv-rot" class="gv-row"><input type="number" step="any"/><input type="number" step="any"/><input type="number" step="any"/></div></label>
   <label>Scale (X, Y, Z) <div id="gv-scale-values" class="gv-row"><input type="number" step="any"/><input type="number" step="any"/><input type="number" step="any"/></div></label>
   <h3>Measurements</h3><div class="gv-note">Select Measure, then click two points on model surfaces. Measurements use scene units and are saved with the scene.</div><div id="gv-measures" class="gv-list"></div>
  </aside>
 </div>
 <div id="gv-status" class="gv-status" role="status" aria-live="polite">Loading viewer…</div>
</div>
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.165.0/examples/jsm/"
  }
}
</script>
<script>
window.addEventListener('error', function (event) {
  const status = document.getElementById('gv-status');
  if (status && status.textContent.includes('Loading viewer')) {
    status.textContent = 'Viewer failed to initialize: ' + (event.message || 'JavaScript error') + '. Check browser console and CDN access.';
  }
});
window.addEventListener('unhandledrejection', function (event) {
  const status = document.getElementById('gv-status');
  if (status) status.textContent = 'Viewer failed: ' + (event.reason?.message || String(event.reason));
});
</script>
<script type="module" src="${assetPath(src: 'glb-viewer.js')}"></script>
</main></div></div>
