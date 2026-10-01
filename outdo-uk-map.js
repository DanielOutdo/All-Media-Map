(function(){
if(window.__onmUkLoaded) return;
window.__onmUkLoaded = true;
var CFG = window.ONM_UK_CONFIG || {};
var DATA_URL = CFG.dataUrl || 'uk-map-data.json';
var FORM_NAME = CFG.formName || 'All Media Map Enquiry', FORM_NAME_CSS = FORM_NAME.replace(/["\\]/g,'');
// Outdo brand tokens from the site's Base collection, with fallbacks for pages that lack them
var ORANGE='var(--base-color-brand--outdo-orange,#ffb300)', NAVY='var(--base-color-brand--outdo-navy,#1a1b1e)', GREY='var(--base-color-brand--outdo-grey,#3a383d)';
// CMS values arrive as text; an empty field or an unbound "{{Field}}" placeholder counts as unset
function cms(v){ v=String(v||'').trim(); return v.indexOf('{{')===-1 ? v : ''; }
// CMS values can also come from a separate element bound in the Designer, for when the embed sits
// inside a component (where embeds cannot bind CMS fields): <div data-onmuk-cms data-name data-lat data-lng data-type>
function cmsAttr(sec,k){ var v=sec ? cms(sec.getAttribute('data-'+k)) : ''; if(v) return v;
  var el=document.querySelector('[data-onmuk-cms]'); return el ? cms(el.getAttribute('data-'+k)) : ''; }
function locName(){ return cmsAttr(document.querySelector('.onmuk'),'name'); }

var FORMATS = [
  {k:'roundabout', label:'Roundabouts & roadside', one:'Roundabout & roadside'},
  {k:'lamppost',   label:'Lamppost banners', one:'Lamppost banner'},
  {k:'bus',        label:'Bus networks', one:'Bus network'},
  {k:'ferry',      label:'CalMac ferries', one:'Ferry route'},
  {k:'airport',    label:'Airports', one:'Airport'},
  {k:'sixsheet',   label:'Illuminated 6-sheets', one:'Illuminated 6-sheet'},
  {k:'tfl',        label:'TfL poster sites', one:'TfL poster site'},
  {k:'digital',    label:'Digital screens', one:'Digital screen'}
];
var DRAW_ORDER=['bus','ferry','lamppost','roundabout','tfl','sixsheet','digital','airport'];
var PT_FORMATS={sixsheet:'s',tfl:'t',digital:'d'};
var BADGE={
  dark:{bg:'<circle cx="14" cy="14" r="12.5" fill="#3A383D" stroke="#fff" stroke-width="2"/>',ink:'#FFB300'},
  light:{bg:'<circle cx="14" cy="14" r="12" fill="#fff" stroke="#3A383D" stroke-width="3"/>',ink:'#3A383D'},
  square:{bg:'<rect x="1.5" y="1.5" width="25" height="25" rx="6" fill="#FFB300" stroke="#fff" stroke-width="2"/>',ink:'#3A383D'}
};
var BADGE_OF={digital:'square',tfl:'light'};
function badge(k,size){ var b=BADGE[BADGE_OF[k]||'dark']; return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 28 28">'+b.bg+'<g transform="translate(4 4) scale(.833)" fill="none" stroke="'+b.ink+'" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'+GLYPH[k].replace(/#FFB300/g,b.ink)+'</g></svg>'; }
var GLYPH={
  sixsheet:'<rect x="6" y="2.5" width="12" height="13.5" rx="1.5" fill="#FFB300"/><path d="M12 16v5.5"/>',
  tfl:'<rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="M7 10h10M7 14h6"/>',
  digital:'<rect x="2.5" y="3.5" width="19" height="13" rx="2" fill="#FFB300"/><path d="M8.5 21h7M12 16.5V21"/><path d="M9.5 7.5l5 2.5-5 2.5z" fill="#FFFFFF" stroke="#FFFFFF" stroke-width="1"/>',
  dogbag:'<g fill="#FFB300" stroke="none"><ellipse cx="12" cy="16" rx="4.6" ry="3.9"/><circle cx="5.6" cy="10.6" r="2.1"/><circle cx="9.4" cy="6.4" r="2.1"/><circle cx="14.6" cy="6.4" r="2.1"/><circle cx="18.4" cy="10.6" r="2.1"/></g>'
};
var SW = {
  roundabout:'<svg width="16" height="16"><circle cx="8" cy="8" r="6.5" fill="#FFB300" stroke="#fff" stroke-width="1.5"/><circle cx="8" cy="8" r="2.6" fill="#fff"/></svg>',
  lamppost:'<svg width="16" height="16" viewBox="0 0 16 16"><path d="M4 15V1.5M4 2h9l-2.2 3L13 8H4" fill="#3A383D" stroke="#fff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M4 15V1.5" stroke="#3A383D" stroke-width="1.8" stroke-linecap="round"/><path d="M4 2h9l-2.2 3L13 8H4z" fill="#3A383D"/></svg>',
  ferry:'<svg width="20" height="14" viewBox="0 0 20 14"><path d="M1 7h18" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M1.5 7h17" stroke="#3A383D" stroke-width="2.5" stroke-dasharray="4 3"/></svg>',
  bus:'<svg width="18" height="14"><rect x="1" y="1.5" width="16" height="11" rx="3" fill="rgba(255,179,0,.3)" stroke="#E69F00" stroke-width="1.5"/></svg>',
  airport:'<svg width="18" height="18" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12.5" fill="#3A383D" stroke="#fff" stroke-width="2"/><g transform="translate(6.5 6.5) scale(.625)"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" fill="#FFB300" stroke="#FFB300" stroke-width="1.5" stroke-linejoin="round"/></g></svg>'
};

Object.keys(GLYPH).forEach(function(k){ SW[k]=badge(k,18); });
var CSS = ""
+ ".onmuk{font-family:'Inter',sans-serif;width:100%;box-sizing:border-box}"
+ ".onmuk *,.onmuk *:before,.onmuk *:after{box-sizing:border-box}"
+ ".onmuk-controls{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:0 0 16px}"
+ ".onmuk-select{flex:0 1 300px;min-width:220px;display:block;margin:0;font:500 15px 'Inter',sans-serif;color:#3A383D;background:#fff;padding:12px 44px 12px 16px;border:1.5px solid #D6D5D8;border-radius:12px;outline:none;cursor:pointer;appearance:none;background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%233A383D' stroke-width='2' stroke-linecap='round'><path d='M6 9l6 6 6-6'/></svg>\");background-repeat:no-repeat;background-position:right 16px center}"
+ ".onmuk-select:focus{border-color:#FFB300}"
+ ".onmuk-chips{display:flex;flex-wrap:wrap;gap:8px}"
+ ".onmuk .onmuk-chip,button.onmuk-chip{display:inline-flex!important;align-items:center;gap:8px;font:500 14px 'Inter',sans-serif!important;color:#3A383D!important;background:#fff!important;border:1.5px solid #fff!important;border-radius:9999px!important;padding:9px 14px 9px 12px!important;margin:0!important;cursor:pointer;line-height:1.2!important;text-transform:none!important;letter-spacing:normal!important;box-shadow:none!important;transition:background 200ms cubic-bezier(.2,.8,.2,1),opacity 200ms;white-space:nowrap}"
+ ".onmuk .onmuk-chip b{font-weight:700;color:#3A383D}"
+ ".onmuk .onmuk-chip[aria-pressed=false]{background:transparent!important;border-color:rgba(255,255,255,.35)!important;color:#fff!important}"
+ ".onmuk .onmuk-chip[aria-pressed=false] b{color:#fff}"
+ ".onmuk .onmuk-chip[aria-pressed=false] svg{opacity:.45}"
+ ".onmuk .onmuk-chip:active{transform:scale(.96)}"
+ ".onmuk-ms{position:relative;flex:0 1 320px;min-width:220px}"
+ ".onmuk .onmuk-ms-btn,button.onmuk-ms-btn{display:block!important;width:100%;text-align:left;margin:0!important;font:500 15px 'Inter',sans-serif!important;color:#3A383D!important;background:#fff url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%233A383D' stroke-width='2' stroke-linecap='round'><path d='M6 9l6 6 6-6'/></svg>\") no-repeat right 16px center!important;padding:12px 44px 12px 16px!important;border:1.5px solid #D6D5D8!important;border-radius:12px!important;cursor:pointer;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.3!important;text-transform:none!important;letter-spacing:normal!important;box-shadow:none!important}"
+ ".onmuk-ms.open .onmuk-ms-btn,.onmuk-ms-btn:focus{border-color:#FFB300!important;outline:none}"
+ ".onmuk-ms-panel{display:none;position:absolute;top:calc(100% + 6px);left:0;z-index:1001;min-width:100%;width:max-content;max-width:min(360px,90vw);max-height:380px;overflow:auto;background:#fff;border-radius:16px;box-shadow:0 8px 24px rgba(58,56,61,.22);padding:6px}"
+ ".onmuk-ms.open .onmuk-ms-panel{display:block}"
+ ".onmuk-ms-opt{display:flex!important;align-items:center;gap:10px;padding:10px 12px;margin:0!important;border-radius:10px;cursor:pointer;font:500 14px/1.3 'Inter',sans-serif!important;color:#3A383D!important}"
+ ".onmuk-ms-opt:hover{background:#F6F5F7}"
+ ".onmuk-ms-opt.all{border-bottom:1px solid #EDECEF;border-radius:10px 10px 0 0;margin-bottom:4px!important}"
+ ".onmuk-ms-opt input{appearance:none;-webkit-appearance:none;width:18px;height:18px;flex:none;margin:0!important;border:1.5px solid #D6D5D8;border-radius:5px;background:#fff center/12px no-repeat;cursor:pointer}"
+ ".onmuk-ms-opt input:checked{background-color:#FFB300;border-color:#FFB300;background-image:url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%233A383D' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'><path d='M5 12l5 5L20 7'/></svg>\")}"
+ ".onmuk-ms-opt .c{margin-left:auto;padding-left:16px;color:#6B6970;font-weight:400}"
+ ".onmuk-key{background:#fff;border-radius:16px;box-shadow:0 4px 16px rgba(58,56,61,.18);padding:12px 14px 8px;min-width:250px;font-family:'Inter',sans-serif;color:#3A383D;margin:0 0 16px 16px!important}"
+ ".onmuk-key{max-height:min(440px,60vh);overflow:auto}"
+ ".onmuk-key h4{margin:0 0 4px;font:700 11px 'Inter',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:#6B6970}"
+ ".onmuk .onmuk-key-row,button.onmuk-key-row{display:flex!important;align-items:center;gap:10px;width:100%;margin:0!important;padding:8px 0!important;background:none!important;border:0!important;border-top:1px solid #EDECEF!important;cursor:pointer;font:500 14px/1.3 'Inter',sans-serif!important;color:#3A383D!important;text-align:left;text-transform:none!important;letter-spacing:normal!important;box-shadow:none!important}"
+ ".onmuk-key-row:first-of-type{border-top:0!important}"
+ ".onmuk-key-row .ic{width:20px;display:flex;justify-content:center;flex:none}"
+ ".onmuk-key-row .n{margin-left:auto;font-weight:700}"
+ ".onmuk-key-row .sw{position:relative;width:32px;height:18px;flex:none;border-radius:9999px;background:#D6D5D8;transition:background 200ms cubic-bezier(.2,.8,.2,1)}"
+ ".onmuk-key-row .sw:after{content:'';position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(58,56,61,.25);transition:transform 200ms cubic-bezier(.2,.8,.2,1)}"
+ ".onmuk-key-row[aria-pressed=true] .sw{background:#FFB300}"
+ ".onmuk-key-row[aria-pressed=true] .sw:after{transform:translateX(14px)}"
+ ".onmuk-key-row[aria-pressed=false] .ic,.onmuk-key-row[aria-pressed=false] .l,.onmuk-key-row[aria-pressed=false] .n{opacity:.45}"
+ "@media(max-width:640px){.onmuk-key{min-width:0;padding:8px 10px 4px;margin:0 0 10px 10px!important}.onmuk .onmuk-key-row{font-size:13px!important;padding:6px 0!important;gap:8px}}"
+ ".onmuk-help{list-style:none;margin:0!important;padding:0!important;flex:1 1 0;min-width:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));align-items:center;gap:0 20px;font:400 14px/1.3 'Inter',sans-serif;color:inherit}"
+ ".onmuk-help li{display:flex;align-items:center;gap:8px;margin:0!important;padding:0!important;min-width:0;text-wrap:balance}"
+ "@media(max-width:640px){.onmuk-help{flex-basis:100%;gap:0 10px;font-size:12px}.onmuk-help li{gap:6px}.onmuk-help li:before{width:20px;height:20px;line-height:20px;font-size:11px}}"
+ ".onmuk-help li:before{content:counter(onmuk-step);counter-increment:onmuk-step;flex:none;width:24px;height:24px;border-radius:9999px;background:#FFB300;color:#3A383D;font:700 12px/24px 'Inter',sans-serif;text-align:center}"
+ ".onmuk-help{counter-reset:onmuk-step}"
+ ".onmuk-reset{font:500 14px 'Inter',sans-serif;color:#fff;background:none;border:none;cursor:pointer;text-decoration:underline;padding:8px 4px}"
+ ".onmuk-reset:hover{color:#FFB300}"
+ ".onmuk-map{width:100%;height:680px;border-radius:20px;overflow:hidden;border:1px solid #D6D5D8;background:#F6F5F7}"
+ "@media(max-width:640px){.onmuk-map{height:480px}}"
+ ".onmuk-map .leaflet-container{font-family:'Inter',sans-serif}"
+ ".onmuk-map .onmuk-labels{filter:contrast(1.8) brightness(.55)}"
+ ".onmuk-map .leaflet-control-attribution{background:rgba(255,255,255,.55)!important;font:400 9px 'Inter',sans-serif!important;color:#8E8C92!important;padding:1px 5px!important;border-radius:6px 0 0 0!important;box-shadow:none!important}"
+ ".onmuk-map .leaflet-control-attribution a{color:#8E8C92!important;text-decoration:none!important}"
+ ".onmuk-map .leaflet-attribution-flag{display:none!important}"
+ ".onmuk-map .leaflet-pane img,.onmuk-map .leaflet-tile{max-width:none!important;max-height:none!important;padding:0!important;border:0!important;margin:0!important}"
+ ".onmuk-map .leaflet-bar{border:none!important;box-shadow:0 2px 8px rgba(58,56,61,.18)!important;border-radius:12px!important;overflow:hidden}"
+ ".onmuk-map .leaflet-bar a{color:#3A383D!important;width:36px!important;height:36px!important;line-height:36px!important}"
+ ".onmuk-map .leaflet-tooltip{background:#fff;color:#3A383D;border:1px solid #D6D5D8;border-radius:12px;padding:8px 12px;font:500 14px/1.35 'Inter',sans-serif;box-shadow:0 4px 14px rgba(58,56,61,.18)}"
+ ".onmuk-map .leaflet-popup-content-wrapper{border-radius:16px;box-shadow:0 6px 20px rgba(58,56,61,.2)}"
+ ".onmuk-map .leaflet-popup-content{margin:14px 18px;font:400 14px/1.45 'Inter',sans-serif;color:#3A383D}"
// Another map plugin on the site makes every Leaflet popup and tooltip transparent with !important
// (.leaflet-popup-content-wrapper, .leaflet-tooltip, .leaflet-popup-tip-container). These scoped
// !important rules win it back for this map only, and reset the site's p size and Leaflet's p margins.
+ ".onmuk-map .leaflet-popup{margin:0 0 20px!important;background:none!important;box-shadow:none!important}"
+ ".onmuk-map .leaflet-popup-content-wrapper{background:#fff!important;padding:1px!important;border:0!important;border-radius:16px!important;box-shadow:0 6px 20px rgba(26,27,30,.22)!important;text-align:left}"
+ ".onmuk-map .leaflet-popup-content{margin:14px 18px!important;padding:0!important;background:none!important;width:auto!important;min-width:230px;max-width:290px;font:400 14px/1.45 'Inter',sans-serif!important;color:#3A383D!important}"
+ ".onmuk-map .leaflet-popup-content p{margin:0!important;font-size:14px!important;line-height:1.45!important}"
+ ".onmuk-map .leaflet-popup-content p.onmuk-pop-n{font-size:17px!important;line-height:1.25!important;margin:0 0 4px!important}"
+ ".onmuk-map .leaflet-popup-content .onmuk-pop-row p.onmuk-pop-n{font-size:15px!important}"
+ ".onmuk-map .leaflet-popup-tip-container{display:block!important}"
+ ".onmuk-map .leaflet-popup-tip{background:#fff!important;box-shadow:0 3px 10px rgba(26,27,30,.18)!important}"
+ ".onmuk-map .leaflet-popup-close-button{color:#6B6970!important;font:400 20px/24px 'Inter',sans-serif!important;width:28px!important;height:28px!important;top:6px!important;right:6px!important;text-decoration:none!important}"
+ ".onmuk-map .leaflet-tooltip{background:#fff!important;color:#3A383D!important;border:1px solid #D6D5D8!important;border-radius:12px!important;padding:8px 12px!important;font:500 14px/1.35 'Inter',sans-serif!important;box-shadow:0 4px 14px rgba(58,56,61,.18)!important;white-space:nowrap}"
+ ".onmuk-map .leaflet-tooltip-top{margin-top:-8px!important}.onmuk-map .leaflet-tooltip-bottom{margin-top:8px!important}.onmuk-map .leaflet-tooltip-left{margin-left:-8px!important}.onmuk-map .leaflet-tooltip-right{margin-left:8px!important}"
+ ".onmuk-title{margin:0 0 24px}"
+ ".onmuk-pop-f{display:inline-flex;align-items:center;gap:6px;font:600 12px 'Inter',sans-serif;color:"+NAVY+";background:"+ORANGE+";border-radius:9999px;padding:4px 10px;margin-bottom:8px}"
+ ".onmuk-pop-n{font:700 17px/1.25 'Bricolage Grotesque','Inter',sans-serif;letter-spacing:-.01em;margin:0 0 4px;color:"+NAVY+"}"
+ ".onmuk-pop-d{color:#6B6970;margin:0}"
+ ".onmuk-pop-a{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 4px}"
+ ".onmuk-pop-row{padding:10px 0;border-top:1px solid #EDECEF}.onmuk-pop-row:first-of-type{border-top:0;padding-top:4px}"
+ ".onmuk-pop-row .onmuk-pop-a{margin:8px 0 0}"
// Buttons follow the site's button colours: orange with grey text at rest, grey with white text on hover
+ ".onmuk-btn{display:inline-flex!important;align-items:center;justify-content:center;gap:6px;font:600 13px/1.2 'Inter',sans-serif!important;border-radius:9999px!important;padding:10px 18px!important;margin:0!important;cursor:pointer;border:2px solid transparent!important;text-transform:none!important;letter-spacing:normal!important;box-shadow:none!important;transition:background 200ms cubic-bezier(.2,.8,.2,1),color 200ms,border-color 200ms}"
+ ".onmuk-btn:active{transform:scale(.96)}"
+ ".onmuk-btn-p{background:"+ORANGE+"!important;color:"+GREY+"!important}.onmuk-btn-p:hover{background:"+GREY+"!important;color:#fff!important}"
+ ".onmuk-btn-s{background:transparent!important;color:"+GREY+"!important;border-color:"+GREY+"!important}.onmuk-btn-s:hover{background:"+GREY+"!important;color:#fff!important}"
+ ".onmuk-btn-s[aria-pressed=true]{background:"+GREY+"!important;color:#fff!important}"
+ ".onmuk-tray{position:fixed;right:24px;bottom:24px;z-index:9998;display:none;align-items:center;gap:10px;font:600 15px 'Inter',sans-serif;color:"+GREY+";background:"+ORANGE+";border:0;border-radius:9999px;padding:14px 16px 14px 24px;cursor:pointer;box-shadow:0 8px 24px rgba(26,27,30,.35);transition:background 200ms,color 200ms;white-space:nowrap}"
+ ".onmuk-tray:hover{background:"+GREY+";color:#fff}.onmuk-tray b{display:inline-flex;align-items:center;justify-content:center;min-width:28px;height:28px;padding:0 8px;border-radius:9999px;background:"+NAVY+";color:#fff;font:700 13px 'Inter',sans-serif}"
+ ".onmuk-tray.on{display:inline-flex}"
+ "@media(max-width:479px){.onmuk-tray{right:16px;bottom:16px;left:16px;justify-content:center}}"
// Drawer: Outdo navy panel, matching the site's dark contact forms
+ ".onmuk-dw{position:fixed;inset:0;z-index:9999;visibility:hidden;font-family:'Inter',sans-serif;color:#fff}"
+ ".onmuk-dw *,.onmuk-dw *:before,.onmuk-dw *:after{box-sizing:border-box}"
+ ".onmuk-dw.open{visibility:visible}"
+ ".onmuk-dw-bg{position:absolute;inset:0;background:rgba(26,27,30,.6);opacity:0;transition:opacity 320ms cubic-bezier(.2,.8,.2,1)}"
+ ".onmuk-dw.open .onmuk-dw-bg{opacity:1}"
+ ".onmuk-dw-p{position:absolute;top:0;right:0;bottom:0;width:min(460px,100vw);background:"+NAVY+";display:flex;flex-direction:column;transform:translateX(100%);transition:transform 320ms cubic-bezier(.2,.8,.2,1);box-shadow:-12px 0 40px rgba(0,0,0,.35)}"
+ ".onmuk-dw.open .onmuk-dw-p{transform:none}"
+ ".onmuk-dw-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:28px 28px 20px;border-bottom:1px solid rgba(255,255,255,.12)}"
+ ".onmuk-dw-h h3{margin:0;display:flex;align-items:center;gap:12px;font:700 28px/1.2 'Bricolage Grotesque','Inter',sans-serif;letter-spacing:-.02em;color:#fff}"
+ ".onmuk-dw-h h3 span{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:34px;padding:0 10px;border-radius:9999px;background:"+ORANGE+";color:"+NAVY+";font:700 16px 'Inter',sans-serif;letter-spacing:0}"
+ ".onmuk-dw-x{width:40px;height:40px;border-radius:9999px;border:0;background:rgba(255,255,255,.1);color:#fff;font:400 24px/1 'Inter',sans-serif;cursor:pointer;flex:none;transition:background 200ms,color 200ms}.onmuk-dw-x:hover{background:"+ORANGE+";color:"+NAVY+"}"
+ ".onmuk-dw-b{flex:1;overflow:auto;padding:8px 28px 40px}"
+ ".onmuk-dw-list{list-style:none;margin:0;padding:0}"
+ ".onmuk-dw-li{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.1)}"
+ ".onmuk-dw-li .i{flex:none;width:36px;height:36px;border-radius:9999px;background:#fff;display:inline-flex;align-items:center;justify-content:center}"
+ ".onmuk-dw-li div{flex:1;min-width:0}"
+ ".onmuk-dw-li .n{display:block;font:600 15px/1.35 'Inter',sans-serif;color:#fff;overflow-wrap:anywhere}"
+ ".onmuk-dw-li .r{display:block;font:400 13px/1.4 'Inter',sans-serif;color:rgba(255,255,255,.6)}"
+ ".onmuk-dw-rm{flex:none;width:30px;height:30px;border-radius:9999px;border:0;background:rgba(255,255,255,.08);color:#fff;font:400 18px/1 'Inter',sans-serif;cursor:pointer;transition:background 200ms,color 200ms}.onmuk-dw-rm:hover{background:"+ORANGE+";color:"+NAVY+"}"
+ ".onmuk-dw-empty{font:400 15px/1.5 'Inter',sans-serif;color:rgba(255,255,255,.7);margin:20px 0}"
+ ".onmuk-dw-clear{margin:14px 0 0;font:500 13px 'Inter',sans-serif;color:rgba(255,255,255,.6);background:none;border:0;text-decoration:underline;cursor:pointer;padding:0}.onmuk-dw-clear:hover{color:"+ORANGE+"}"
+ ".onmuk-dw-form{margin-top:32px;padding-top:28px;border-top:1px solid rgba(255,255,255,.12)}"
+ ".onmuk-dw-form h4{margin:0 0 16px;font:700 22px/1.2 'Bricolage Grotesque','Inter',sans-serif;letter-spacing:-.01em;color:#fff}"
+ ".onmuk-form-msg{margin:0;font:500 13px 'Inter',sans-serif;color:"+ORANGE+"}.onmuk-form-msg:empty{display:none}.onmuk-form-msg:not(:empty){margin:0 0 14px}"
+ ".onmuk-dw .onmuk-wf{margin:0;color:#fff}"
+ ".onmuk-dw .onmuk-wf textarea{border-radius:20px!important;min-height:110px;padding-top:14px;resize:vertical}"
+ ".onmuk-dw .onmuk-wf .w-form-done,.onmuk-dw .onmuk-wf .w-form-fail{border-radius:20px;padding:24px;margin-top:0;text-align:left}"
+ ".onmuk-dw .onmuk-wf .w-form-done{background:rgba(255,179,0,.12);color:#fff}"
+ ".onmuk-dw .onmuk-new{margin-top:16px!important;color:#fff!important;border-color:#fff!important}.onmuk-dw .onmuk-new:hover{background:"+ORANGE+"!important;border-color:"+ORANGE+"!important;color:"+NAVY+"!important}"
// The Webflow form stays out of sight in its original spot; it only appears inside the drawer
+ ".w-form:has(form[data-name=\""+FORM_NAME_CSS+"\"]):not(.onmuk-wf),.w-form:has(#wf-form-All-Media-Map-Enquiry):not(.onmuk-wf),.w-form:has([name=\"Selected-Sites\"]):not(.onmuk-wf){display:none!important}";
var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

function withLeaflet(cb){
  if(window.L && window.L.map) return cb();
  if(!document.querySelector('script[data-onm-leaflet]')){
    // Subresource Integrity: the browser refuses Leaflet if unpkg ever serves a changed file
    var s = document.createElement('script'); s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.setAttribute('data-onm-leaflet','1');
    s.integrity='sha384-cxOPjt7s7Iz04uaHJceBmS+qpjv2JkIHNVcuOrM+YHwZOmJGBXI00mdUXEq65HTH'; s.crossOrigin='anonymous'; document.head.appendChild(s);
    if(!document.querySelector('link[href*="leaflet.css"]')){ var lk=document.createElement('link'); lk.rel='stylesheet'; lk.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      lk.integrity='sha384-sHL9NAb7lN7rfvG5lfHpm643Xkcjzp4jFvuavGOndn6pjVqS6ny56CAt3nsEVT4H'; lk.crossOrigin='anonymous'; document.head.appendChild(lk); }
  }
  var tries=0;(function wait(){ if(window.L&&window.L.map) return cb(); if(++tries>100) return console.error('Outdo map: Leaflet failed to load'); setTimeout(wait,100); })();
}
var dataP=null;
// CFG.dataIntegrity (an sha384 hash) makes the browser reject a data file that has been altered
function getData(){ if(!dataP) dataP=fetch(DATA_URL, CFG.dataIntegrity ? {integrity:CFG.dataIntegrity} : {}).then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); }); return dataP; }
function start(sec){
  if(sec.__onmuk) return; sec.__onmuk=true;
  getData().then(function(d){ withLeaflet(function(){ init(d,sec); }); })
    .catch(function(e){ console.error('Outdo map: could not load data', e); });
}
function arm(n){
  var secs=document.querySelectorAll('.onmuk');
  if(!secs.length){ if(n>0) setTimeout(function(){arm(n-1)},200); return; }
  Array.prototype.forEach.call(secs,function(sec){
    if('IntersectionObserver' in window){ var io=new IntersectionObserver(function(en){ if(en[0].isIntersecting){ io.disconnect(); start(sec); } },{rootMargin:'400px'}); io.observe(sec); }
    else start(sec);
  });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){arm(25)}); else arm(25);

var SITES={}, SEL=[], DW=null, TRAY=null;
try{ SEL=JSON.parse(localStorage.getItem('onmuk-sel')||'[]'); }catch(e){ SEL=[]; }
SEL=(Array.isArray(SEL)?SEL:[]).filter(function(x){
  return x && typeof x.id==='string' && typeof x.f==='string' && typeof x.n==='string' && Array.isArray(x.ll)
    && typeof x.ll[0]==='number' && typeof x.ll[1]==='number' && isFinite(x.ll[0]) && isFinite(x.ll[1]);
}).slice(0,200).map(function(x){ return {id:x.id.slice(0,40),f:x.f.slice(0,60),n:x.n.slice(0,200),d:'',r:String(x.r||'').slice(0,60),ll:[x.ll[0],x.ll[1]]}; });
function selHas(id){ for(var i=0;i<SEL.length;i++) if(SEL[i].id===id) return true; return false; }
function selToggle(id){
  if(selHas(id)) SEL=SEL.filter(function(x){return x.id!==id});
  else if(SITES[id]) SEL.push(SITES[id]);
  selSave();
}
function selText(){ return SEL.map(function(x){ return x.f+' – '+x.n+(x.r?' ('+x.r+')':'')+' ['+x.ll[0].toFixed(5)+', '+x.ll[1].toFixed(5)+']'; }).join('; '); }
function selSave(){
  try{ localStorage.setItem('onmuk-sel',JSON.stringify(SEL)); }catch(e){}
  renderDrawer();
  document.querySelectorAll('[name="Selected-Sites"]').forEach(function(el){ el.value=selText(); el.dispatchEvent(new Event('input',{bubbles:true})); });
}
// The enquiry form is a Webflow form (the "All Media Map Enquiry Form" component) placed on the page.
// It is moved into the drawer so Webflow handles submission, spam protection, notifications and its
// own success / error messages. Its hidden fields are filled from the selection just before it submits.
var WF=null; // {wrap, form, done, fail}
function findWebflowForm(){
  var form=document.querySelector('form[data-name="'+FORM_NAME+'"]') || document.getElementById('wf-form-All-Media-Map-Enquiry')
    || document.querySelector('[data-onmuk-form] form');
  if(!form){ var f=document.querySelector('.w-form form [name="Selected-Sites"]'); if(f) form=f.form; }
  if(!form) return null;
  var wrap=form.closest('.w-form') || form.parentNode;
  return {wrap:wrap, form:form, done:wrap.querySelector('.w-form-done'), fail:wrap.querySelector('.w-form-fail')};
}
function setField(name,val){
  if(!WF) return;
  WF.form.querySelectorAll('[name="'+name+'"],[data-name="'+name+'"]').forEach(function(el){ el.value=val; el.dispatchEvent(new Event('input',{bubbles:true})); });
}
function fillHidden(){
  setField('Selected-Sites',selText()); setField('Selected-Count',String(SEL.length));
  setField('Location',locName()); setField('URL',location.href); setField('Form Name',FORM_NAME);
  // Older names the form's hidden fields carried before they were renamed; a stale publish can bring them back
  setField('Selected-Route',selText()); setField('Route-Area',String(SEL.length));
}
function ensureDrawer(){
  if(DW) return;
  TRAY=document.createElement('button'); TRAY.type='button'; TRAY.className='onmuk-tray';
  TRAY.innerHTML='Your selection <b>0</b>'; TRAY.addEventListener('click',function(){ openDrawer(false); });
  DW=document.createElement('div'); DW.className='onmuk-dw'; DW.setAttribute('aria-hidden','true');
  DW.innerHTML='<div class="onmuk-dw-bg"></div><aside class="onmuk-dw-p" role="dialog" aria-label="Your selection">'
   +'<div class="onmuk-dw-h"><h3>Your selection <span class="onmuk-dw-c">0</span></h3><button type="button" class="onmuk-dw-x" aria-label="Close">&times;</button></div>'
   +'<div class="onmuk-dw-b"><ul class="onmuk-dw-list"></ul>'
   +'<p class="onmuk-dw-empty">Nothing selected yet. Click a site on the map and choose Add to selection.</p>'
   +'<button type="button" class="onmuk-dw-clear">Clear selection</button>'
   +'<div class="onmuk-dw-form"><h4>Enquire about these sites</h4><p class="onmuk-form-msg" role="status"></p></div>'
   +'<button type="button" class="onmuk-btn onmuk-btn-s onmuk-new" hidden>Start a new selection</button>'
   +'</div></aside>';
  document.body.appendChild(TRAY); document.body.appendChild(DW);
  DW.querySelector('.onmuk-dw-bg').addEventListener('click',closeDrawer);
  DW.querySelector('.onmuk-dw-x').addEventListener('click',closeDrawer);
  document.addEventListener('keydown',function(e){ if(e.key==='Escape') closeDrawer(); });
  DW.querySelector('.onmuk-dw-clear').addEventListener('click',function(){ SEL=[]; selSave(); });
  DW.querySelector('.onmuk-dw-list').addEventListener('click',function(e){ var b=e.target.closest('[data-rm]'); if(b) selToggle(b.getAttribute('data-rm')); });
  var slot=DW.querySelector('.onmuk-dw-form'), msg=slot.querySelector('.onmuk-form-msg'), again=DW.querySelector('.onmuk-new');
  WF=findWebflowForm();
  if(!WF){
    console.warn('Outdo map: no Webflow form named "'+FORM_NAME+'" on this page, so enquiries are switched off. Add the All Media Map Enquiry Form component.');
    slot.hidden=true;
  } else {
    slot.appendChild(WF.wrap); WF.wrap.classList.add('onmuk-wf');
    // Capture phase on document runs before Webflow's own submit handler, so an empty selection never sends
    document.addEventListener('submit',function(e){
      if(e.target!==WF.form) return;
      msg.textContent='';
      if(!SEL.length){ e.preventDefault(); e.stopImmediatePropagation(); msg.textContent='Add at least one site to your selection first.'; return; }
      fillHidden();
    },true);
    // Webflow shows .w-form-done on success; offer a fresh start, keeping the list until then
    if(WF.done && 'MutationObserver' in window) new MutationObserver(function(){
      again.hidden = getComputedStyle(WF.done).display==='none';
    }).observe(WF.done,{attributes:true,attributeFilter:['style']});
    again.addEventListener('click',function(){
      SEL=[]; selSave(); WF.form.reset(); WF.form.style.display=''; if(WF.done) WF.done.style.display='none'; if(WF.fail) WF.fail.style.display='none';
      again.hidden=true; closeDrawer();
    });
  }
  renderDrawer();
}
function renderDrawer(){
  if(!DW) return;
  var n=SEL.length;
  DW.querySelector('.onmuk-dw-c').textContent=n;
  TRAY.querySelector('b').textContent=n; TRAY.classList.toggle('on',n>0 && !DW.classList.contains('open'));
  DW.querySelector('.onmuk-dw-empty').hidden=n>0; DW.querySelector('.onmuk-dw-clear').hidden=n===0;
  DW.querySelector('.onmuk-dw-list').innerHTML=SEL.map(function(x){
    return '<li class="onmuk-dw-li"><span class="i">'+(SW[FKEY[x.f]]||'')+'</span><div><span class="n">'+esc(x.n)+'</span><span class="r">'+esc(x.f)+(x.r?' · '+esc(x.r):'')+'</span></div><button type="button" class="onmuk-dw-rm" data-rm="'+esc(x.id)+'" aria-label="Remove '+esc(x.n)+'">&times;</button></li>';
  }).join('');
  if(WF) fillHidden();
}
var FKEY={}; FORMATS.forEach(function(f){ FKEY[f.one]=f.k; });
function openDrawer(toForm){
  ensureDrawer(); DW.classList.add('open'); DW.setAttribute('aria-hidden','false'); TRAY.classList.remove('on');
  if(toForm && WF && WF.form.style.display!=='none') setTimeout(function(){ var b=DW.querySelector('.onmuk-dw-b'), s=DW.querySelector('.onmuk-dw-form'); b.scrollTop=s.offsetTop-24; var i=WF.form.querySelector('input:not([type=hidden]):not(.hide)'); if(i) i.focus({preventScroll:true}); },340);
}
function closeDrawer(){ if(!DW||!DW.classList.contains('open')) return; DW.classList.remove('open'); DW.setAttribute('aria-hidden','true'); renderDrawer(); }

function drawRoundabout(ctx,p){
  ctx.beginPath(); ctx.arc(p.x,p.y,6,0,Math.PI*2); ctx.fillStyle='#FFB300'; ctx.fill(); ctx.lineWidth=1.5; ctx.strokeStyle='#fff'; ctx.stroke();
  ctx.beginPath(); ctx.arc(p.x,p.y,2.4,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill();
}
function drawFlag(ctx,p){
  var x=p.x-3, y=p.y+6;
  function shape(){ ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y-12.5); ctx.moveTo(x,y-12); ctx.lineTo(x+9,y-12); ctx.lineTo(x+6.8,y-9); ctx.lineTo(x+9,y-6); ctx.lineTo(x,y-6); ctx.closePath(); }
  ctx.lineJoin='round'; ctx.lineCap='round';
  shape(); ctx.lineWidth=3.2; ctx.strokeStyle='#fff'; ctx.stroke();
  shape(); ctx.fillStyle='#3A383D'; ctx.fill(); ctx.lineWidth=1.8; ctx.strokeStyle='#3A383D'; ctx.stroke();
}
function shapeMarker(draw){ return L.CircleMarker.extend({ _updatePath:function(){ var r=this._renderer; if(!r._drawing||this._empty()) return; draw(r._ctx,this._point); } }); }
var RoundMarker=null, FlagMarker=null;

function esc(s){ return String(s||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]}); }
// Title text: escaped first, then [words] become the site's orange highlight span
function titleHtml(t){ return esc(t).replace(/\[([^\[\]]{1,80})\]/g,'<span class="text-color-secondary">$1</span>'); }

function init(D,sec){
  function pick(cls){ return sec.querySelector('.'+cls) || sec.querySelector('#'+cls); }
  var mapEl=pick('onmuk-map'), regionEl=pick('onmuk-region'), chipsEl=pick('onmuk-chips'), resetEl=pick('onmuk-reset'),
      totalEl=pick('onmuk-total') || (document.querySelectorAll('.onmuk').length===1 ? document.getElementById('onmuk-total') : null);
  if(!mapEl || mapEl._leaflet_id) return;
  var regions=D.regions, rsel=[], on={}; FORMATS.forEach(function(f){ on[f.k]=true; });
  // Per-map options (data attributes on the .onmuk section)
  var ds=sec.dataset, nums=function(v){ return String(v||'').split(',').map(parseFloat).filter(function(n){return !isNaN(n)}); };
  var optCenter=nums(cms(ds.center)), optZoom=parseFloat(ds.zoom), optBounds=nums(ds.bounds);
  if(optCenter.length!==2) optCenter=nums(cmsAttr(null,'lat')+','+cmsAttr(null,'lng'));
  if(optCenter.length===2 && (Math.abs(optCenter[0])>90 || Math.abs(optCenter[1])>180)) optCenter=[];
  var lock=ds.lockRegion!==undefined && ds.lockRegion!=='false';
  var urlSync=ds.urlSync ? ds.urlSync!=='false' : document.querySelectorAll('.onmuk').length===1;
  if(ds.region){ ds.region.split(',').forEach(function(n){ n=n.trim(); var ri=regions.indexOf(n); if(ri>=0) rsel.push(ri); else if(n) console.warn('Outdo map: unknown region "'+n+'"'); }); }
  var homeRegion=rsel.slice();
  function sameHome(){ return rsel.slice().sort().join()===homeRegion.slice().sort().join(); }
  // data-type: a format name filters the map; a place type sets the zoom
  var ty=cmsAttr(sec,'type').toLowerCase();
  if(ty){
    var fmap={'roundabouts & roadside':'roundabout',roadside:'roundabout',ferry:'ferry',ferries:'ferry',calmac:'ferry','calmac ferries':'ferry','6-sheet':'sixsheet','6-sheets':'sixsheet','illuminated 6-sheets':'sixsheet',tfl:'tfl','tfl poster sites':'tfl',poster:'tfl',digital:'digital','digital screen':'digital','digital screens':'digital','dog bag':'dogbag','dog bag stations':'dogbag',roundabout:'roundabout',roundabouts:'roundabout',lamppost:'lamppost',lampposts:'lamppost','lamppost banner':'lamppost','lamppost banners':'lamppost',bus:'bus','bus network':'bus','bus networks':'bus','bus & tram':'bus',airport:'airport',airports:'airport'};
    var zmap={city:11,town:12.5,village:13.5,county:9,region:8,country:6};
    if(fmap[ty] && !ds.formats){ Object.keys(on).forEach(function(k){ on[k]=k===fmap[ty]; }); }
    if(zmap[ty]!==undefined && isNaN(optZoom)) optZoom=zmap[ty];
  }
  if(ds.formats){ var fl0=ds.formats.split(',').map(function(x){return x.trim()}); Object.keys(on).forEach(function(k){ on[k]=fl0.indexOf(k)!==-1; }); }
  var homeOn=JSON.parse(JSON.stringify(on));
  if(regionEl) regionEl.style.display='none';
  if(chipsEl) chipsEl.style.display='none';
  var ms=null;
  if(!lock){
    ms=document.createElement('div'); ms.className='onmuk-ms';
    ms.innerHTML='<button type="button" class="onmuk-ms-btn" aria-haspopup="listbox" aria-expanded="false">All regions</button><div class="onmuk-ms-panel" role="listbox" aria-multiselectable="true"></div>';
    var ctl=pick('onmuk-controls');
    if(regionEl && regionEl.parentNode) regionEl.parentNode.insertBefore(ms,regionEl); else if(ctl) ctl.insertBefore(ms,ctl.firstChild); else sec.insertBefore(ms,mapEl);
    var msBtn=ms.querySelector('.onmuk-ms-btn');
    msBtn.addEventListener('click',function(){ var o=!ms.classList.contains('open'); ms.classList.toggle('open',o); msBtn.setAttribute('aria-expanded',o); });
    document.addEventListener('click',function(e){ if(!ms.contains(e.target)){ ms.classList.remove('open'); msBtn.setAttribute('aria-expanded','false'); } });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape'){ ms.classList.remove('open'); msBtn.setAttribute('aria-expanded','false'); } });
    ms.querySelector('.onmuk-ms-panel').addEventListener('change',function(e){
      var v=e.target.value; if(v==='all') rsel=[];
      else { v=+v; var i=rsel.indexOf(v); if(e.target.checked){ if(i<0) rsel.push(v); } else if(i>=0) rsel.splice(i,1); }
      sync(true);
    });
  }
  if(ds.title!=='false' && !sec.querySelector('.onmuk-title')){
    var tt=document.createElement('h2'); tt.className='onmuk-title heading-style-h2';
    tt.innerHTML=titleHtml(cms(ds.title) || 'Find [Outdoor Advertising] near you');
    sec.insertBefore(tt, sec.firstChild);
  }
  if(ds.intro!=='false' && !sec.querySelector('.onmuk-help')){
    var steps=(ds.intro && ds.intro!=='true') ? ds.intro.split('|') : [
      lock ? 'Zoom and drag to explore the map' : 'Choose one or more regions from the dropdown',
      'Use the key to show or hide ad formats',
      'Click any site to enquire or add it to your selection'];
    var help=document.createElement('ol'); help.className='onmuk-help';
    help.innerHTML=steps.map(function(t){ return '<li>'+esc(t.trim())+'</li>'; }).join('');
    var ctlH=pick('onmuk-controls');
    if(ctlH){ var rs=ctlH.querySelector('.onmuk-reset'); if(ms && ms.parentNode===ctlH) ctlH.insertBefore(help,ms.nextSibling); else ctlH.insertBefore(help,rs||null); }
    else sec.insertBefore(help,mapEl);
  }

  if(urlSync) try{ var q=new URLSearchParams(location.search);
    var qr=q.get('region'); if(qr){ var qs=[]; qr.split('|').forEach(function(n){ var ix=regions.indexOf(n); if(ix>=0) qs.push(ix); }); if(qs.length) rsel=qs; }
    var qf=q.get('formats'); if(qf){ Object.keys(on).forEach(function(k){ on[k]=qf.split(',').indexOf(k)!==-1; }); }
  }catch(e){}

  var map=L.map(mapEl,{attributionControl:false,preferCanvas:true,zoomSnap:0.25,minZoom:5});
  L.control.attribution({prefix:false,position:'bottomright'}).addTo(map);
  var tiles=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',{maxZoom:16,attribution:'Tiles &copy; Esri'}).addTo(map);
  var errs=0,swapped=false;
  tiles.on('tileerror',function(){ if(swapped||++errs<6) return; swapped=true; map.removeLayer(tiles);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map); });
  var renderer=L.canvas({padding:0.5,tolerance:4});
  // Place-name labels on their own pane above the markers so towns stay readable
  map.createPane('onmukLabels'); var lp=map.getPane('onmukLabels'); lp.style.zIndex=450; lp.style.pointerEvents='none';
  var labels=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',{maxZoom:16,pane:'onmukLabels',className:'onmuk-labels'}).addTo(map);
  tiles.on('tileerror',function(){ if(swapped && map.hasLayer(labels)) map.removeLayer(labels); });

  ensureDrawer();
  if(!RoundMarker){ RoundMarker=shapeMarker(drawRoundabout); FlagMarker=shapeMarker(drawFlag); }
  function reg(id,fmt,name,desc,r,ll){ SITES[id]={id:id,f:fmt,n:name||fmt,d:desc||'',r:regions[r]||'',ll:ll}; return id; }
  function acts(id){ return '<div class="onmuk-pop-a"><button type="button" class="onmuk-btn onmuk-btn-p" data-enq="'+id+'">Enquire</button><button type="button" class="onmuk-btn onmuk-btn-s" data-add="'+id+'" aria-pressed="false">Add to selection</button></div>'; }
  function pop(fmt,name,desc,r,id){
    return '<span class="onmuk-pop-f">'+esc(fmt)+'</span><p class="onmuk-pop-n">'+esc(name||fmt)+'</p>'
      +(desc?'<p class="onmuk-pop-d">'+esc(desc)+'</p>':'')+'<p class="onmuk-pop-d">'+esc(regions[r]||'')+'</p>'+acts(id);
  }
  function paint(el){ el.querySelectorAll('[data-add]').forEach(function(b){ var on=selHas(b.getAttribute('data-add')); b.setAttribute('aria-pressed',on); b.textContent=on?'Remove from selection':'Add to selection'; }); }
  var items={}, groups={}; FORMATS.forEach(function(f){ items[f.k]=[]; });
  FORMATS.forEach(function(f){ groups[f.k]=L.layerGroup(); });

  function ringArea(r){ var a=0; for(var i=0,j=r.length-1;i<r.length;j=i++) a+=(r[j][1]+r[i][1])*(r[j][0]-r[i][0]); return Math.abs(a/2); }
  function inRing(lat,lng,r){ var c=false; for(var i=0,j=r.length-1;i<r.length;j=i++){ var yi=r[i][0],xi=r[i][1],yj=r[j][0],xj=r[j][1]; if(((yi>lat)!=(yj>lat))&&(lng<(xj-xi)*(lat-yi)/(yj-yi)+xi)) c=!c; } return c; }
  // largest areas drawn first so smaller overlapping areas stay on top and clickable
  D.formats.bus.forEach(function(b,i){ b._id=reg('b'+i,'Bus network',b.n,b.d,b.r,[b.poly[0][0],b.poly[0][1]]); });
  D.formats.bus.slice().sort(function(a,b){ return ringArea(b.poly)-ringArea(a.poly); }).forEach(function(b){
    var lyr=L.polygon(b.poly,{color:'#E69F00',weight:2,fillColor:'#FFB300',fillOpacity:.22,renderer:renderer});
    lyr.bindTooltip(esc(b.n),{sticky:true});
    lyr.on('click',function(e){
      var hits=items.bus.filter(function(it){ return map.hasLayer(it.l) && inRing(e.latlng.lat,e.latlng.lng,it.ll); });
      var html=hits.length>1
        ? '<span class="onmuk-pop-f">'+hits.length+' bus networks</span>'+hits.map(function(h){ return '<div class="onmuk-pop-row"><p class="onmuk-pop-n">'+esc(h.b.n)+'</p>'+(h.b.d?'<p class="onmuk-pop-d">'+esc(h.b.d)+'</p>':'')+acts(h.b._id)+'</div>'; }).join('')+'<p class="onmuk-pop-d">'+esc(regions[b.r]||'')+'</p>'
        : pop('Bus network',b.n,b.d,b.r,b._id);
      L.popup().setLatLng(e.latlng).setContent(html).openOn(map);
    });
    items.bus.push({l:lyr,r:b.r,ll:b.poly,b:b});
  });
  D.formats.lamppost.forEach(function(p,i){ var id=reg('l'+i,'Lamppost banner',p[2],p[3],p[4],[p[0],p[1]]);
    var lyr=new FlagMarker([p[0],p[1]],{radius:7,renderer:renderer});
    lyr.bindPopup(pop('Lamppost banner',p[2],p[3],p[4],id)); items.lamppost.push({l:lyr,r:p[4],ll:[[p[0],p[1]]]});
  });
  D.formats.roundabout.forEach(function(p,i){ var id=reg('r'+i,'Roundabout & roadside',p[2],p[3],p[4],[p[0],p[1]]);
    var lyr=new RoundMarker([p[0],p[1]],{radius:7,renderer:renderer});
    lyr.bindPopup(pop('Roundabout & roadside',p[2],p[3],p[4],id)); items.roundabout.push({l:lyr,r:p[4],ll:[[p[0],p[1]]]});
  });
  var airIcon=L.divIcon({className:'',html:SW.airport.replace('width="18" height="18"','width="30" height="30"'),iconSize:[30,30],iconAnchor:[15,15]});
  D.formats.airport.forEach(function(p,i){ var id=reg('a'+i,'Airport',p[2],p[3],p[4],[p[0],p[1]]);
    var lyr=L.marker([p[0],p[1]],{icon:airIcon});
    lyr.bindTooltip(esc(p[2])); lyr.bindPopup(pop('Airport',p[2],p[3],p[4],id)); items.airport.push({l:lyr,r:p[4],ll:[[p[0],p[1]]]});
  });
  (D.formats.ferry||[]).forEach(function(f,i){ var id=reg('f'+i,'Ferry route',f.n,f.d,f.r,f.line[0]);
    var lyr=L.polyline(f.line,{color:'#3A383D',weight:3,dashArray:'7 6',renderer:renderer});
    lyr.bindTooltip(esc(f.n),{sticky:true}); lyr.bindPopup(pop('Ferry route',f.n,f.d,f.r,id));
    items.ferry.push({l:lyr,r:f.r,ll:f.line});
  });
  var ports=(D.formats.ferryPorts||[]).map(function(p){ var m=L.circleMarker([p[0],p[1]],{radius:4,color:'#3A383D',weight:2,fillColor:'#fff',fillOpacity:1,renderer:renderer}); m.bindTooltip(esc(p[2])); return {l:m,r:p[3]}; });
  Object.keys(PT_FORMATS).forEach(function(k){
    var f=FORMATS.filter(function(x){return x.k===k})[0], icon=L.divIcon({className:'',html:badge(k,24),iconSize:[24,24],iconAnchor:[12,12]});
    (D.formats[k]||[]).forEach(function(p,i){ var id=reg(PT_FORMATS[k]+i,f.one,p[2],p[3],p[4],[p[0],p[1]]);
      var lyr=L.marker([p[0],p[1]],{icon:icon}); lyr.bindTooltip(esc(p[2])); lyr.bindPopup(pop(f.one,p[2],p[3],p[4],id));
      items[k].push({l:lyr,r:p[4],ll:[[p[0],p[1]]]});
    });
  });
  DRAW_ORDER.forEach(function(k){ groups[k].addTo(map); });
  map.on('popupopen',function(e){ var el=e.popup.getElement(); if(!el) return; paint(el);
    el.onclick=function(ev){
      var a=ev.target.closest('[data-add]'), q=ev.target.closest('[data-enq]');
      if(a){ selToggle(a.getAttribute('data-add')); paint(el); }
      if(q){ var id=q.getAttribute('data-enq'); if(!selHas(id)) selToggle(id); map.closePopup(); openDrawer(true); }
    };
  });

  var UK=L.latLngBounds([[49.9,-8.2],[60.9,1.8]]);
  var custom = optBounds.length===4 || optCenter.length===2;
  function goHome(){
    if(optBounds.length===4) map.fitBounds(L.latLngBounds([[optBounds[0],optBounds[1]],[optBounds[2],optBounds[3]]]),{padding:[20,20]});
    else if(optCenter.length===2) map.setView([optCenter[0],optCenter[1]], isNaN(optZoom)?11:optZoom);
    else return false;
    return true;
  }

  function inRegion(it){ return !rsel.length||rsel.indexOf(it.r)!==-1; }
  var firstFit=true;
  function count(k){ var n=0; items[k].forEach(function(it){ if(inRegion(it)) n++; }); return n; }

  var regionOpts=regions.map(function(n,i){ var c=0; FORMATS.forEach(function(f){ items[f.k].forEach(function(it){ if(it.r===i) c++; }); }); return {n:n,i:i,c:c}; })
    .filter(function(o){return o.c}).sort(function(a,b){return a.n.localeCompare(b.n)});
  function renderRegion(){
    if(!ms) return;
    var h='<label class="onmuk-ms-opt all"><input type="checkbox" value="all"'+(rsel.length?'':' checked')+'>All regions</label>';
    regionOpts.forEach(function(o){ h+='<label class="onmuk-ms-opt"><input type="checkbox" value="'+o.i+'"'+(rsel.indexOf(o.i)!==-1?' checked':'')+'>'+esc(o.n)+'<span class="c">'+o.c.toLocaleString('en-GB')+'</span></label>'; });
    ms.querySelector('.onmuk-ms-panel').innerHTML=h;
    ms.querySelector('.onmuk-ms-btn').textContent=!rsel.length?'All regions':rsel.length===1?regions[rsel[0]]:rsel.length+' regions selected';
  }
  var KeyCtl=L.Control.extend({options:{position:'bottomleft'},onAdd:function(){
    var d=L.DomUtil.create('div','onmuk-key'); L.DomEvent.disableClickPropagation(d); L.DomEvent.disableScrollPropagation(d);
    d.addEventListener('click',function(e){ var b=e.target.closest('button[data-k]'); if(!b) return; var k=b.getAttribute('data-k'); on[k]=!on[k]; sync(false); });
    return d; }});
  var keyEl=new KeyCtl().addTo(map).getContainer();
  function renderChips(){
    keyEl.innerHTML='<h4>Key</h4>'+FORMATS.map(function(f){
      return '<button type="button" class="onmuk-key-row" data-k="'+f.k+'" aria-pressed="'+on[f.k]+'" aria-label="'+(on[f.k]?'Hide ':'Show ')+esc(f.label)+'"><span class="ic">'+SW[f.k]+'</span><span class="l">'+esc(f.label)+'</span><span class="n">'+count(f.k).toLocaleString('en-GB')+'</span><span class="sw" aria-hidden="true"></span></button>';
    }).join('');
  }
  if(resetEl) resetEl.addEventListener('click',function(){ rsel=homeRegion.slice(); on=JSON.parse(JSON.stringify(homeOn)); firstFit=true; sync(true); });

  function sync(refit){
    var pts=[], total=0;
    // bus areas drawn first so point markers sit on top and stay clickable
    DRAW_ORDER.forEach(function(k){ groups[k].clearLayers(); });
    DRAW_ORDER.forEach(function(k){
      if(!on[k]) return; var g=groups[k];
      items[k].forEach(function(it){ if(inRegion(it)){ g.addLayer(it.l); total++; if(rsel.length) pts=pts.concat(it.ll); } });
    });
    if(on.ferry) ports.forEach(function(p){ if(inRegion(p)) groups.ferry.addLayer(p.l); });
    if(refit){
      map.closePopup();
      var usedHome = (firstFit || sameHome()) && custom && goHome();
      firstFit=false;
      if(!usedHome){
        if(rsel.length && pts.length) map.fitBounds(L.latLngBounds(pts),{padding:[40,40],maxZoom:13});
        else map.fitBounds(UK,{padding:[10,10]});
      }
    }
    if(totalEl) totalEl.textContent=total.toLocaleString('en-GB');
    if(resetEl) resetEl.style.display=(!sameHome()||FORMATS.some(function(f){return on[f.k]!==homeOn[f.k]}))?'':'none';
    renderChips(); renderRegion();
    if(urlSync) try{ var u=new URL(location.href);
      if(rsel.length) u.searchParams.set('region',rsel.map(function(i){return regions[i]}).join('|')); else u.searchParams.delete('region');
      var fl=FORMATS.filter(function(f){return on[f.k]}).map(function(f){return f.k});
      if(fl.length<FORMATS.length) u.searchParams.set('formats',fl.join(',')); else u.searchParams.delete('formats');
      history.replaceState(null,'',u);
    }catch(e){}
    var vals={'Selected-Region':rsel.length?rsel.map(function(i){return regions[i]}).join(', '):'All regions',
      'Selected-Formats':FORMATS.filter(function(f){return on[f.k]}).map(function(f){return f.label}).join(', ')||'None'};
    Object.keys(vals).forEach(function(k){ document.querySelectorAll('[name="'+k+'"]').forEach(function(el){ el.value=vals[k]; el.dispatchEvent(new Event('input',{bubbles:true})); }); });
  }

  sync(true);
  function refitSize(){ map.invalidateSize(); }
  setTimeout(refitSize,200); window.addEventListener('resize',refitSize);
  if('ResizeObserver' in window) new ResizeObserver(refitSize).observe(mapEl);
}
// Set up the drawer (and move the Webflow form into it) straight away, so the form never shows on the page
function early(){ if(document.querySelector('.onmuk')) try{ ensureDrawer(); }catch(e){ console.error('Outdo map: drawer setup failed', e); } }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',early); else early();
})();
