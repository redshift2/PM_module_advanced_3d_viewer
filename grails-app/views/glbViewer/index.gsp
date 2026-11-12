<div class="pm-shell" data-pm-theme="dark">
<g:render template="/shared/pmShellStyles"/>
<g:render template="/shared/pmShellSidebar"/>
<div class="pm-main">
<g:render template="/shared/pmShellHeader" model="[moduleTitle:'Advanced 3D Viewer']"/>
<main class="pm-content">
<link rel="stylesheet" href="${assetPath(src: 'glb-viewer.css')}"/>
<div class="gv" id="gv-root" data-base="${g.createLink(controller:'glbViewer', action:'index')}">
 <div class="gv-toolbar gv-primary" role="toolbar" aria-label="Viewer tools">
  <label class="gv-compact">Source <select id="gv-source"><option value="plm">PLM parts</option><option value="uploaded">Uploaded GLB</option></select></label>
  <select id="gv-catalog" aria-label="Available models"></select>
  <label class="gv-compact" title="Units encoded in the GLB coordinate values">GLB units <select id="gv-glb-units"><option value="m">m</option><option value="mm">mm</option><option value="in">in</option><option value="cm">cm</option><option value="ft">ft</option></select></label>
  <button id="gv-add" type="button" title="Add selected GLB part"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M6 3h18l6 6v24H6z" fill="#c7e3ff" stroke="#1c579b" stroke-width="2"/><path d="M24 3v7h6" fill="none" stroke="#1c579b" stroke-width="2"/><path d="M26 19v14M19 26h14" stroke="#24a93d" stroke-width="5"/></svg></span><small>Add Part</small></button>
  <label class="gv-upload-button" title="Upload GLB"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M2 10h13l4 5h15l-5 17H3z" fill="#f3c33d" stroke="#b17c00" stroke-width="2"/><path d="M3 10V5h14l4 5" fill="none" stroke="#b17c00" stroke-width="2"/></svg></span><small>Upload GLB</small><input id="gv-upload" type="file" accept=".glb,model/gltf-binary" hidden></label>
  <button id="gv-import" type="button" title="Import linked JSON assembly"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M4 11h9V5h10v6h9v8H19v-8M18 19v7M9 26h18" stroke="#154e96" stroke-width="2" fill="none"/><rect x="3" y="23" width="11" height="10" rx="1" fill="#eec83d" stroke="#725900"/><rect x="22" y="23" width="11" height="10" rx="1" fill="#eec83d" stroke="#725900"/><rect x="14" y="3" width="9" height="9" fill="#5bd6e8" stroke="#154e96"/></svg></span><small>Import Assembly</small></button>
  <input id="gv-import-file" type="file" accept=".json,application/json" hidden>
  <button id="gv-refresh-links" type="button" title="Refresh all linked assemblies"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M28 11A13 13 0 0 0 7 9L4 13M8 25a13 13 0 0 0 21-1l3-3" fill="none" stroke="#1e66bb" stroke-width="4" stroke-linecap="round"/><path d="M4 5v9h9M32 30v-9h-9" fill="none" stroke="#1e66bb" stroke-width="2.5"/></svg></span><small>Refresh Links</small></button>
  <button id="gv-update" type="button" title="Check PLM part versions"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M18 3 32 18H24v14H12V18H4z" fill="#4ce044" stroke="#126f18" stroke-width="2"/></svg></span><small>Update Parts</small></button>
  <span class="gv-separator"></span>
  <button id="gv-select" class="active" type="button" title="Select part (click in 3D view to highlight in model tree)"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M7 3 8 29 15 22 21 34 27 31 21 19 31 18z" fill="#c6e4ff" stroke="#1a539a" stroke-width="2.5"/></svg></span><small>Select</small></button>
  <button id="gv-move" type="button" title="Move selected"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M18 18V3m0 15L5 30m13-12 13 12" stroke-width="4" stroke-linecap="round" fill="none" stroke="#236bd6"/><path d="m18 2-5 9h10z" fill="#236bd6"/><path d="m4 31 11-2-7-8z" fill="#e32d36"/><path d="m32 31-11-2 7-8z" fill="#2aba43"/></svg></span><small>Move</small></button>
  <button id="gv-rotate" type="button" title="Rotate selected"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M6 21A13 13 0 0 1 26 7M30 15A13 13 0 0 1 10 29" fill="none" stroke="#196fc2" stroke-width="3.7" stroke-linecap="round"/><path d="m26 3 2 11-10-3" fill="#28bc43"/><path d="m10 33-2-11 10 3" fill="#e93634"/></svg></span><small>Rotate</small></button>
  <button id="gv-scale" type="button" title="Scale selected"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M6 30V13h17v17z" fill="#9fcaff" stroke="#1952a3" stroke-width="2"/><path d="M18 18 32 4m-10 0h10v10" stroke="#164f9e" stroke-width="3.5" fill="none"/></svg></span><small>Scale</small></button>
  <button id="gv-delete" type="button" title="Remove selected part or assembly (Delete)" aria-label="Delete selected part or assembly" disabled><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M7 10h22M13 10V6h10v4M10 12l2 19h12l2-19" fill="#f5b6b6" stroke="#9d2531" stroke-width="2.5" stroke-linejoin="round"/><path d="M16 16v11M21 16v11" stroke="#9d2531" stroke-width="2"/></svg></span><small>Delete</small></button>
  <button id="gv-undo-delete" type="button" title="Undo last deletion (Ctrl+Z)" aria-label="Undo deletion" disabled><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true"><path d="M11 10H4l7-7M4 10h18c13 0 13 21 0 21h-9" fill="none" stroke="#2868ba" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></span><small>Undo</small></button>
  <button id="gv-measure" type="button" title="Measure between two points"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="m8 28 17-18" stroke="#b6bcc7" stroke-width="8" stroke-linecap="round"/><path d="m8 28 17-18" stroke="#3e4554" stroke-width="2"/><path d="m5 24 7 7m9-25 9 9" stroke="#244b83" stroke-width="3"/><path d="M3 33h30" stroke="#e7ae31" stroke-width="3"/></svg></span><small>Measure</small></button>

  <button id="gv-section" type="button" title="Section view"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="m5 11 13-7 13 7v15l-13 7-13-7z" fill="#b8d9ff" stroke="#1955a0" stroke-width="2"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#1955a0" stroke-width="2"/><path d="M23 3 11 33" stroke="#f03937" stroke-width="3"/></svg></span><small>Section</small></button>
  <button id="gv-fit" type="button" title="Fit all"><span class="gv-icon"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M3 13V4h10M23 4h10v9M33 23v9H23M13 32H3v-9" stroke="#1c529e" stroke-width="3" fill="none"/></svg><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#9dc7f9" stroke="#164d99" stroke-width="1.8"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.7"/><path d="m18 4 13 7-13 7-13-7z" fill="#d5e8ff"/></svg></span><small>Fit All</small></button>
 </div>
 <div class="gv-camera-toolbar" role="toolbar" aria-label="Camera and navigation">
  <div class="gv-view-presets" role="group" aria-label="Standard views">
   <button type="button" id="gv-home" title="Fit all models" aria-label="Home / Fit all"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M3 18 18 5l15 13M8 16v17h20V16M14 33V22h8v11" fill="#c9e5ff" stroke="#17539a" stroke-width="2"/></svg><span>Home</span></button>
   <button type="button" id="gv-front" title="Front view"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#9dc7f9" stroke="#164d99" stroke-width="1.8"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.7"/><path d="m18 4 13 7-13 7-13-7z" fill="#d5e8ff"/></svg><span>Front</span></button>
   <button type="button" id="gv-back" title="Back view"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#9dc7f9" stroke="#164d99" stroke-width="1.8"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.7"/><path d="m18 4 13 7-13 7-13-7z" fill="#d5e8ff"/></svg><span>Back</span></button>
   <button type="button" id="gv-left" title="Left view"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#9dc7f9" stroke="#164d99" stroke-width="1.8"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.7"/><path d="m18 4 13 7-13 7-13-7z" fill="#d5e8ff"/></svg><span>Left</span></button>
   <button type="button" id="gv-right" title="Right view"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#9dc7f9" stroke="#164d99" stroke-width="1.8"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.7"/><path d="m18 4 13 7-13 7-13-7z" fill="#d5e8ff"/></svg><span>Right</span></button>
   <button type="button" id="gv-top" title="Top view"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#9dc7f9" stroke="#164d99" stroke-width="1.8"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.7"/><path d="m18 4 13 7-13 7-13-7z" fill="#d5e8ff"/></svg><span>Top</span></button>
   <button type="button" id="gv-bottom" title="Bottom view"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#9dc7f9" stroke="#164d99" stroke-width="1.8"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.7"/><path d="m18 4 13 7-13 7-13-7z" fill="#d5e8ff"/></svg><span>Bottom</span></button>
   <button type="button" id="gv-iso" title="Isometric view"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M18 4 31 11v15L18 33 5 26V11z" fill="#9dc7f9" stroke="#164d99" stroke-width="1.8"/><path d="m5 11 13 7 13-7M18 18v15" fill="none" stroke="#164d99" stroke-width="1.7"/><path d="m18 4 13 7-13 7-13-7z" fill="#d5e8ff"/></svg><span>Iso</span></button>
  </div>
  <div class="gv-spin-buttons" role="group" aria-label="Spin center">
   <button type="button" id="gv-spin-model" class="active" aria-pressed="true" title="Spin around visible model center" aria-label="Model center"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="m18 3 12 7v15l-12 8-12-8V10z" fill="#b8d9ff" stroke="#1855a5" stroke-width="2"/><circle cx="18" cy="18" r="6" fill="none" stroke="#1151a7" stroke-width="2.5"/><path d="M18 7v7m0 8v7M7 18h7m8 0h7" stroke="#1151a7" stroke-width="2"/></svg></button>
   <button type="button" id="gv-spin-view" aria-pressed="false" title="Spin around view center" aria-label="View center"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="6" width="30" height="22" fill="#d9eaff" stroke="#164e9a" stroke-width="2"/><path d="M12 32h12M18 28v4" stroke="#164e9a" stroke-width="2"/><circle cx="18" cy="17" r="6" fill="none" stroke="#164e9a" stroke-width="2"/><path d="M18 7v20M8 17h20" stroke="#164e9a" stroke-width="1.7"/></svg></button>
   <button type="button" id="gv-spin-selected" aria-pressed="false" title="Spin around selected part" aria-label="Selected part center"><svg class="gv-cad-svg" viewBox="0 0 36 36" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"><path d="M3 13V4h10M23 4h10v9M33 23v9H23M13 32H3v-9" fill="none" stroke="#164e9a" stroke-width="2.7"/><path d="m18 9 9 5v9l-9 5-9-5v-9z" fill="#b5d9ff" stroke="#164e9a" stroke-width="1.8"/><path d="m9 14 9 5 9-5M18 19v9" fill="none" stroke="#164e9a"/></svg></button>
  </div>
  <button type="button" id="gv-perspective" aria-pressed="false" title="Switch to perspective projection" aria-label="Perspective projection">◉ Perspective</button>
  <span class="gv-toolbar-divider" aria-hidden="true"></span>
 <div class="gv-row gv-scene-bar" role="group" aria-label="Scene controls">
  <strong>Scene</strong><label>Units <select id="gv-units"><option value="mm">mm</option><option value="cm">cm</option><option value="m">m</option><option value="in">in</option><option value="ft">ft</option></select></label><input id="gv-scene-name" type="text" maxlength="160" placeholder="Assembly review" aria-label="Scene name" style="min-width:160px;flex:1"/>
  <label><input id="gv-shared" type="checkbox"/> Share</label>
  <button id="gv-save" type="button">💾 Save</button><button id="gv-save-new" type="button">Save as new</button>
  <button id="gv-export" type="button">Export JSON</button><select id="gv-scenes" aria-label="Saved scenes" style="min-width:160px;flex:1"></select><button id="gv-load" type="button">Load</button><button id="gv-refresh" type="button">Refresh</button>
 </div>
 </div>
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
