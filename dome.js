'use strict';
const DRAFT_KEY='ssi_lg_sawdamman_bw_v2';
const LEGACY_DRAFT_KEY='ssi_lg_sawdamman_bw_v1';
const BACKUP_VERSION=3;
const THEME_KEY='ssi_lg_theme_v1';
const MIN_ROWS=12;
const tbody=document.getElementById('tbody');
const grandTotalEl=document.getElementById('grandTotal');
const qtyTotalEl=document.getElementById('qtyTotal');
const amountWordsEl=document.getElementById('amountWords');
const statusDot=document.getElementById('statusDot');
const statusTxt=document.getElementById('statusTxt');
const printArea=document.getElementById('printArea');

function debounce(fn,ms){
  let t;
  return (...a)=>{
    clearTimeout(t);
    t=setTimeout(()=>fn(...a),ms);
  };
}
function money(v){
  return '₹\u00a0'+(+v||0).toLocaleString('en-IN',{
    minimumFractionDigits:2,
    maximumFractionDigits:2
  });
}
function qtyText(v){
  return (+v||0).toLocaleString('en-IN',{
    maximumFractionDigits:2
  });
}
function esc(v){
  return String(v??'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}
function createRowId(){
  if(window.crypto?.randomUUID){
    return window.crypto.randomUUID();
  }
  return 'row-' +
    Date.now().toString(36) +
    '-' +
    Math.random().toString(36).slice(2,10);
}
function todayStr(){
  const d=new Date();
  return `${String(d.getDate()).padStart(2,'0')}/${
    String(d.getMonth()+1).padStart(2,'0')
  }/${d.getFullYear()}`;
}
function currentDayName(){
  return [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ][new Date().getDay()];
}
function currentMonthName(){
  return [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ][new Date().getMonth()];
}
function daysInMonth(year,monthIndex){
  return new Date(
    year,
    monthIndex+1,
    0
  ).getDate();
}
function monthWeekNumber(d){
  const totalDays=
    daysInMonth(
      d.getFullYear(),
      d.getMonth()
    );

  const week=
    Math.ceil(
      (d.getDate()*4)/totalDays
    );

  return Math.min(
    4,
    Math.max(1,week)
  );
}
function weekStartDay(
  year,
  monthIndex,
  weekNo
){
  const totalDays=
    daysInMonth(
      year,
      monthIndex
    );

  return Math.floor(
    ((weekNo-1)*totalDays)/4
  )+1;
}
function currentWeekLabel(){
  return weekLabelFromDate(
    new Date()
  );
}

function dateToDMY(d){
  return `${String(d.getDate()).padStart(2,'0')}/${
    String(d.getMonth()+1).padStart(2,'0')
  }/${d.getFullYear()}`;
}
function parseDMYDate(s){
  const m=
    /^(\d{2})\/(\d{2})\/(\d{4})$/
      .exec(String(s||'').trim());

  if(!m){
    return new Date();
  }

  const d=
    new Date(
      +m[3],
      +m[2]-1,
      +m[1]
    );

  if(Number.isNaN(d.getTime())){
    return new Date();
  }

  return d;
}

function dayNameFromDate(d){
  return [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ][d.getDay()];
}

function monthNameFromDate(d){
  return [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ][d.getMonth()];
}

function weekLabelFromDate(d){
  return 'Week '+monthWeekNumber(d);
}

/* =========================
   DATE
========================= */

function syncPeriodFromDocDate(
  saveNow=false
){
  const doc=
    document.getElementById(
      'docDate'
    );

  const d=
    parseDMYDate(
      doc?doc.value:''
    );

  const day=
    dayNameFromDate(d);

  const week=
    weekLabelFromDate(d);

  const month=
    monthNameFromDate(d);

  const dayEl=
    document.getElementById(
      'dayField'
    );

  const weekEl=
    document.getElementById(
      'weekField'
    );

  const monthEl=
    document.getElementById(
      'monthField'
    );

  if(dayEl){
    dayEl.value=day;
  }

  if(weekEl){
    weekEl.value=week;
  }

  if(monthEl){
    monthEl.value=month;
  }

  const dt=
    document.getElementById(
      'dayText'
    );

  const wt=
    document.getElementById(
      'weekText'
    );

  const mt=
    document.getElementById(
      'monthText'
    );

  if(dt){
    dt.textContent='Day: '+day;
  }

  if(wt){
    wt.textContent='Week: '+week;
  }

  if(mt){
    mt.textContent='Month: '+month;
  }

  if(saveNow){
    saveDraft();
  }
}

function setDocDateObject(d){
  const doc=
    document.getElementById(
      'docDate'
    );

  if(!doc){
    return;
  }

  doc.value=
    dateToDMY(d);

  syncPeriodFromDocDate(true);
}

function moveReceiptDate(
  days=0,
  months=0
){
  const doc=
    document.getElementById(
      'docDate'
    );

  if(!doc){
    return;
  }

  const d=
    parseDMYDate(
      doc.value||todayStr()
    );

  if(months){
    const keepWeek=
      monthWeekNumber(d);

    d.setMonth(
      d.getMonth()+months,
      1
    );

    d.setDate(
      weekStartDay(
        d.getFullYear(),
        d.getMonth(),
        keepWeek
      )
    );
  }

  if(days){
    d.setDate(
      d.getDate()+days
    );
  }

  setDocDateObject(d);
}

function moveReceiptWeek(step){
  const doc=
    document.getElementById(
      'docDate'
    );

  if(!doc){
    return;
  }

  const d=
    parseDMYDate(
      doc.value||todayStr()
    );

  let week=
    monthWeekNumber(d)+step;

  if(week<1){
    d.setMonth(
      d.getMonth()-1,
      1
    );

    week=4;
  }

  if(week>4){
    d.setMonth(
      d.getMonth()+1,
      1
    );

    week=1;
  }

  d.setDate(
    weekStartDay(
      d.getFullYear(),
      d.getMonth(),
      week
    )
  );

  setDocDateObject(d);
}

function applyDefaultPeriodFields(){
  syncPeriodFromDocDate(false);
}

function formatDateValue(v){
  const digits=
    String(v||'')
      .replace(/\D/g,'')
      .slice(0,8);

  if(digits.length<=2){
    return digits;
  }

  if(digits.length<=4){
    return (
      digits.slice(0,2)+
      '/'+
      digits.slice(2)
    );
  }

  return (
    digits.slice(0,2)+
    '/'+
    digits.slice(2,4)+
    '/'+
    digits.slice(4)
  );
}

function placeDateCaret(
  input,
  digitsBefore
){
  let pos=
    input.value.length;

  let seen=0;

  for(
    let i=0;
    i<input.value.length;
    i++
  ){
    if(/\d/.test(input.value[i])){
      seen++;
    }

    if(seen>=digitsBefore){
      pos=i+1;
      break;
    }
  }

  try{
    input.setSelectionRange(
      pos,
      pos
    );
  }catch(e){}
}

function autoSlashDate(input){
  const before=input.value;

  const start=
    input.selectionStart||
    before.length;

  const digitsBefore=
    before
      .slice(0,start)
      .replace(/\D/g,'')
      .length;

  input.value=
    formatDateValue(before);

  placeDateCaret(
    input,
    digitsBefore
  );
}

function fixDateOnBlur(input){
  const digits=
    String(input.value||'')
      .replace(/\D/g,'');

  if(!digits){
    input.value='';
    return;
  }

  input.value=
    formatDateValue(
      digits
    );
}

/* =========================
   DEVICE
========================= */

const isIOS=()=>
  /iPad|iPhone|iPod/.test(
    navigator.userAgent
  );

const isAndroid=()=>
  /Android/.test(
    navigator.userAgent
  );

const isMobile=()=>
  isIOS()||isAndroid();

/* =========================
   STATUS
========================= */

function setStatus(
  msg,
  cls=''
){
  if(statusTxt){
    statusTxt.textContent=
      msg;
  }

  if(statusDot){
    statusDot.className=
      'status-dot'+
      (cls?' '+cls:'');
  }
}

/* =========================
   TOAST
========================= */

let _tt;

function showToast(
  msg,
  cls=''
){
  const el=
    document.getElementById(
      'toast'
    );

  if(!el){
    return;
  }

  el.textContent=msg;

  el.className=
    'show'+
    (cls?' '+cls:'');

  clearTimeout(_tt);

  _tt=setTimeout(
    ()=>{
      el.className='';
    },
    2800
  );
}

/* =========================
   ROWS
========================= */

function normalizeRow(
  d={}
){
  return {
    id:
      String(d.id||createRowId()),

    date:
      String(d.date??'').slice(
        0,
        10
      ),

    material:
      String(
        d.material??''
      ).slice(
        0,
        120
      ),

    qty:
      String(
        d.qty??''
      ).slice(
        0,
        24
      ),

    price:
      String(
        d.price??''
      ).slice(
        0,
        24
      )
  };
}

function makeRow(d={}){
  const data=
    normalizeRow(d);

  const tr=
    document.createElement('tr');

  tr.dataset.rowId=
    data.id;

  tr.innerHTML=`
    <td class="sn">1</td>

    <td>
      <input
        type="text"
        class="rdate"
        placeholder="DD/MM/YYYY"
        value="${esc(
          formatDateValue(
            data.date
          )
        )}"
        inputmode="numeric"
        maxlength="10"
        autocomplete="off"
        aria-label="Row date"
      >
    </td>

    <td>
      <input
        type="text"
        class="rmat"
        maxlength="120"
        placeholder="Material name"
        value="${esc(
          data.material
        )}"
        autocomplete="off"
        aria-label="Material name"
      >
    </td>

    <td>
      <input
        type="number"
        class="rqty"
        min="0"
        max="1000000000"
        step="0.01"
        placeholder="0"
        value="${esc(
          data.qty
        )}"
        inputmode="decimal"
        aria-label="Quantity"
      >
    </td>

    <td>
      <input
        type="number"
        class="rprice"
        min="0"
        max="1000000000"
        step="0.01"
        placeholder="0.00"
        value="${esc(
          data.price
        )}"
        inputmode="decimal"
        aria-label="Price in rupees"
      >
    </td>

    <td class="rtotal empty">
      —
    </td>

    <td class="rdel">
      <button
        class="dbtn"
        type="button"
        aria-label="Delete row"
        title="Delete row"
      >
        ×
      </button>
    </td>
  `;

  return tr;
}

function addRow(d={}){
  const r=
    makeRow(d);

  tbody.appendChild(r);

  renumber();
  bindRow(r);
}

function renumber(){
  [
    ...tbody.rows
  ].forEach(
    (r,i)=>{
      const sn=
        r.querySelector(
          '.sn'
        );

      if(sn){
        sn.textContent=
          i+1;
      }
    }
  );
}

/* =========================
   TOTALS
========================= */

function updateTotals(){
  let grand=0;
  let qtyGrand=0;

  [
    ...tbody.rows
  ].forEach(row=>{
    const q=
      parseFloat(
        row.querySelector(
          '.rqty'
        )?.value
      )||0;

    const p=
      parseFloat(
        row.querySelector(
          '.rprice'
        )?.value
      )||0;

    qtyGrand+=q;

    const total=
      q*p;

    const cel=
      row.querySelector(
        '.rtotal'
      );

    if(!cel){
      return;
    }

    if(total>0){
      cel.textContent=
        money(total);

      cel.className=
        'rtotal';

      grand+=total;
    }else{
      cel.textContent='—';
      cel.className=
        'rtotal empty';
    }
  });

  if(qtyTotalEl){
    qtyTotalEl.textContent=
      qtyText(qtyGrand);
  }

  if(grandTotalEl){
    grandTotalEl.textContent=
      money(grand);
  }

  if(amountWordsEl){
    amountWordsEl.textContent=
      grand>0
        ? `${toWords(
            Math.floor(grand)
          )} Rupees Only`
        : '';
  }

  updateStats();
}

function updateStats(){
  const rows=
    readRows(false);

  let qty=0;
  let grand=0;

  [
    ...tbody.rows
  ].forEach(r=>{
    const q=
      parseFloat(
        r.querySelector(
          '.rqty'
        )?.value
      )||0;

    const p=
      parseFloat(
        r.querySelector(
          '.rprice'
        )?.value
      )||0;

    qty+=q;
    grand+=q*p;
  });

  const statItems=
    document.getElementById(
      'statItems'
    );

  const statQty=
    document.getElementById(
      'statQty'
    );

  const statTotal=
    document.getElementById(
      'statTotal'
    );

  if(statItems){
    statItems.textContent=
      String(rows.length);
  }

  if(statQty){
    statQty.textContent=
      qtyText(qty);
  }

  if(statTotal){
    statTotal.textContent=
      money(grand);
  }
}

/* =========================
   VALIDATION
========================= */

function validDMY(s){
  const m=
    /^(\d{2})\/(\d{2})\/(\d{4})$/
      .exec(
        String(s||'').trim()
      );

  if(!m){
    return false;
  }

  const day=+m[1];
  const month=+m[2];
  const year=+m[3];

  if(
    year<2000||
    year>2100||
    month<1||
    month>12
  ){
    return false;
  }

  const d=
    new Date(
      year,
      month-1,
      day
    );

  return (
    d.getFullYear()===year&&
    d.getMonth()===
      month-1&&
    d.getDate()===
      day
  );
}

function clearInvalids(){
  document
    .querySelectorAll(
      '.is-invalid'
    )
    .forEach(
      el=>
        el.classList.remove(
          'is-invalid'
        )
    );
}

function validateReceipt(){
  clearInvalids();

  const dateEl=
    document.getElementById(
      'docDate'
    );

  if(!dateEl){
    return 'Receipt date field is missing.';
  }

  if(
    !dateEl.value.trim()||
    !validDMY(dateEl.value)
  ){
    dateEl.classList.add(
      'is-invalid'
    );

    return 'Please enter a valid receipt date (DD/MM/YYYY).';
  }

  const allRows=[
    ...tbody.rows
  ];

  for(
    let i=0;
    i<allRows.length;
    i++
  ){
    const row=
      allRows[i];

    const date=
      row.querySelector(
        '.rdate'
      )?.value.trim()||'';

    const material=
      row.querySelector(
        '.rmat'
      )?.value.trim()||'';

    const qty=
      row.querySelector(
        '.rqty'
      )?.value.trim()||'';

    const price=
      row.querySelector(
        '.rprice'
      )?.value.trim()||'';

    const partial=
      Boolean(
        date||
        material||
        qty||
        price
      );

    if(!partial){
      continue;
    }

    if(
      date&&!validDMY(date)
    ){
      row
        .querySelector(
          '.rdate'
        )
        ?.classList.add(
          'is-invalid'
        );

      return `Row ${i+1}: use a valid date (DD/MM/YYYY).`;
    }

    if(!material){
      row
        .querySelector(
          '.rmat'
        )
        ?.classList.add(
          'is-invalid'
        );

      return `Row ${i+1}: enter a material name.`;
    }

    if(material.length>120){
      row
        .querySelector(
          '.rmat'
        )
        ?.classList.add(
          'is-invalid'
        );

      return `Row ${i+1}: material name is too long.`;
    }

    const q=Number(qty);
    const p=Number(price);

    if(
      !Number.isFinite(q)||
      q<0||
      q>1e9
    ){
      row
        .querySelector(
          '.rqty'
        )
        ?.classList.add(
          'is-invalid'
        );

      return `Row ${i+1}: enter a valid quantity.`;
    }

    if(
      !Number.isFinite(p)||
      p<0||
      p>1e9
    ){
      row
        .querySelector(
          '.rprice'
        )
        ?.classList.add(
          'is-invalid'
        );

      return `Row ${i+1}: enter a valid price.`;
    }
  }

  return '';
}

/* =========================
   ROW EVENTS
========================= */

function bindRow(row){
  row
    .querySelectorAll(
      'input'
    )
    .forEach(inp=>{
      inp.addEventListener(
        'input',
        ()=>{
          if(
            inp.classList.contains(
              'rdate'
            )
          ){
            autoSlashDate(inp);
          }

          debouncedRefresh();
        }
      );

      if(
        inp.classList.contains(
          'rdate'
        )
      ){
        inp.addEventListener(
          'blur',
          ()=>{
            fixDateOnBlur(
              inp
            );

            debouncedSave();
          }
        );
      }

      inp.addEventListener(
        'keydown',
        e=>{
          if(e.key!=='Enter'){
            return;
          }

          e.preventDefault();

          const all=[
            ...document.querySelectorAll(
              '#receiptTable input'
            )
          ];

          const i=
            all.indexOf(inp);

          if(
            i<all.length-1
          ){
            all[i+1].focus();
          }
        }
      );
    });

  row
    .querySelector(
      '.dbtn'
    )
    ?.addEventListener(
      'click',
      ()=>{
        const rowId=
          row.dataset.rowId;

        if(
          !confirm(
            `Delete receipt row ${
              row.querySelector(
                '.sn'
              )?.textContent||''
            }?`
          )
        ){
          return;
        }

        if(
          tbody.rows.length===1
        ){
          row
            .querySelectorAll(
              'input'
            )
            .forEach(i=>{
              i.value='';
            });
        }else{
          row.remove();
        }

        renumber();
        updateTotals();
        debouncedSave();

        showToast(
          `✅ Row ${rowId ? 'updated' : ''}`,
          'ok'
        );
      }
    );
}

const debouncedRefresh=
  debounce(
    ()=>{
      updateTotals();
      debouncedSave();
    },
    180
  );

/* =========================
   DATA
========================= */

function readInfo(){
  syncPeriodFromDocDate(false);

  const o={};

  document
    .querySelectorAll(
      '[data-key]'
    )
    .forEach(el=>{
      o[el.dataset.key]=
        el.value;
    });

  return o;
}

function writeInfo(d={}){
  document
    .querySelectorAll(
      '[data-key]'
    )
    .forEach(el=>{
      if(
        d[
          el.dataset.key
        ]!==undefined
      ){
        el.value=
          el.id==='docDate'
            ? formatDateValue(
                d[
                  el.dataset.key
                ]
              )
            : String(
                d[
                  el.dataset.key
                ]??''
              );
      }
    });
}

function readRows(
  all=true
){
  return [
    ...tbody.rows
  ]
    .map(r=>({
      id:
        r.dataset.rowId||
        createRowId(),

      date:
        r.querySelector(
          '.rdate'
        )?.value.trim()||'',

      material:
        r.querySelector(
          '.rmat'
        )?.value.trim()||'',

      qty:
        r.querySelector(
          '.rqty'
        )?.value.trim()||'',

      price:
        r.querySelector(
          '.rprice'
        )?.value.trim()||''
    }))
    .filter(
      r=>
        all||
        r.date||
        r.material||
        r.qty||
        r.price
    );
}

/* =========================
   STORAGE
========================= */

function saveDraft(){
  try{
    setStatus(
      'Saving…',
      'saving'
    );

    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({
        version:
          BACKUP_VERSION,

        info:
          readInfo(),

        rows:
          readRows(true),

        ts:
          Date.now()
      })
    );

    setStatus(
      'Saved '+
      new Date()
        .toLocaleTimeString(
          [],
          {
            hour:'2-digit',
            minute:'2-digit'
          }
        ),
      'saved'
    );
  }catch(e){
    console.error(e);

    setStatus(
      'Save failed'
    );

    showToast(
      'Could not save the receipt in this browser.',
      'err'
    );
  }
}

const debouncedSave=
  debounce(
    saveDraft,
    450
  );

function parseStoredData(
  raw
){
  if(!raw){
    return null;
  }

  try{
    return JSON.parse(raw);
  }catch{
    return null;
  }
}

function migrateRows(
  rows
){
  if(!Array.isArray(rows)){
    return [];
  }

  return rows.map(
    r=>
      normalizeRow(r)
  );
}

function loadDraft(){
  try{
    let raw=
      localStorage.getItem(
        DRAFT_KEY
      );

    let migrated=false;

    if(!raw){
      raw=
        localStorage.getItem(
          LEGACY_DRAFT_KEY
        );

      migrated=
        Boolean(raw);
    }

    if(!raw){
      return false;
    }

    const d=
      parseStoredData(raw);

    if(
      !d||
      typeof d!=='object'
    ){
      return false;
    }

    if(d.info){
      writeInfo(
        d.info
      );
    }

    tbody.innerHTML='';

    const rows=
      migrateRows(d.rows);

    if(rows.length){
      rows.forEach(
        r=>addRow(r)
      );
    }

    while(
      tbody.rows.length<
      MIN_ROWS
    ){
      addRow();
    }

    updateTotals();

    if(migrated){
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          version:
            BACKUP_VERSION,

          info:
            readInfo(),

          rows:
            readRows(true),

          ts:
            Date.now()
        })
      );
    }

    setStatus(
      migrated
        ? 'Old draft migrated'
        : 'Draft restored',
      'saved'
    );

    return true;
  }catch(e){
    console.error(e);

    return false;
  }
}

/* =========================
   ADD ROW
========================= */

document
  .getElementById(
    'addRowBtn'
  )
  ?.addEventListener(
    'click',
    ()=>{
      addRow();

      saveDraft();

      showToast(
        '✅ New row added',
        'ok'
      );

      if(isMobile()){
        setTimeout(()=>{
          tbody
            .lastElementChild
            ?.scrollIntoView({
              behavior:'smooth',
              block:'center'
            });
        },80);
      }
    }
  );

/* =========================
   CLEAR
========================= */

document
  .getElementById(
    'clearBtn'
  )
  ?.addEventListener(
    'click',
    ()=>{
      if(
        !confirm(
          'Clear all receipt data? This action cannot be undone.'
        )
      ){
        return;
      }

      localStorage.removeItem(
        DRAFT_KEY
      );

      writeInfo({
        from:'',
        to:'',
        docDate:todayStr(),

        day:
          currentDayName(),

        week:
          currentWeekLabel(),

        month:
          currentMonthName(),

        place1:
          'Kendaigoundanur',

        place2:
          'Sullerumbu',

        place3:
          'Dindigul, Tamilnadu 624710',

        cell1:
          '7904689983',

        cell2:
          '6369477188',

        voucherNo:'',
        vehicleNo:'',
        driverName:''
      });

      tbody.innerHTML='';

      for(
        let i=0;
        i<MIN_ROWS;
        i++
      ){
        addRow();
      }

      updateTotals();
      saveDraft();

      showToast(
        '✅ Receipt cleared',
        'ok'
      );
    }
  );

/* =========================
   OCR
========================= */

let pendingOcrRows=[];

function loadScriptOnce(
  src,
  key,
  globalName
){
  return new Promise(
    (resolve,reject)=>{
      if(
        globalName&&
        window[globalName]
      ){
        resolve();
        return;
      }

      const existing=
        document.querySelector(
          `script[data-lib="${key}"]`
        );

      if(existing){
        existing.addEventListener(
          'load',
          resolve,
          {once:true}
        );

        existing.addEventListener(
          'error',
          reject,
          {once:true}
        );

        return;
      }

      const s=
        document.createElement(
          'script'
        );

      s.src=src;
      s.async=true;
      s.defer=true;
      s.dataset.lib=key;

      s.onload=resolve;

      s.onerror=()=>{
        reject(
          new Error(
            key+
            ' library load failed'
          )
        );
      };

      document.head.appendChild(
        s
      );
    }
  );
}

function loadExternalScript(src){
  return loadScriptOnce(
    src,
    'tesseract',
    'Tesseract'
  );
}

function normalDateFromAny(s){
  s=
    String(s||'')
      .trim();

  let m=
    s.match(
      /(\d{4})[\/\-. ]+(\d{1,2})[\/\-. ]+(\d{1,2})/
    );

  if(m){
    return `${String(
      m[3]
    ).padStart(2,'0')}/${String(
      m[2]
    ).padStart(2,'0')}/${m[1]}`;
  }

  m=
    s.match(
      /(\d{1,2})[\/\-. ]+(\d{1,2})[\/\-. ]+(\d{2,4})/
    );

  if(m){
    const y=
      m[3].length===2
        ? '20'+m[3]
        : m[3];

    return `${String(
      m[1]
    ).padStart(2,'0')}/${String(
      m[2]
    ).padStart(2,'0')}/${y}`;
  }

  m=
    s.match(
      /\b(\d{2})(\d{2})(\d{4})\b/
    );

  if(m){
    return `${m[1]}/${m[2]}/${m[3]}`;
  }

  return '';
}

function findDateInLine(line){
  const patterns=[
    /(\d{4}[\/\-. ]+\d{1,2}[\/\-. ]+\d{1,2})/,
    /(\d{1,2}[\/\-. ]+\d{1,2}[\/\-. ]+\d{2,4})/,
    /\b(\d{2}\d{2}\d{4})\b/
  ];

  for(
    const re of patterns
  ){
    const m=
      line.match(re);

    if(m){
      return {
        raw:m[1],
        date:
          normalDateFromAny(
            m[1]
          ),
        index:m.index,
        length:m[1].length
      };
    }
  }

  return null;
}

function hasTamilOrEnglish(s){
  return /[A-Za-z\u0B80-\u0BFF]/
    .test(
      String(s||'')
    );
}

function cleanOcrLine(line){
  return String(line||'')
    .replace(/[|]/g,' ')
    .replace(/[₹,]/g,' ')
    .replace(/[–—]/g,'-')
    .replace(/[“”]/g,'"')
    .replace(/[‘’]/g,"'")
    .replace(/\bRs\.?\b/gi,' ')
    .replace(/\s+/g,' ')
    .trim();
}

function cleanMaterialName(s){
  return String(s||'')
    .replace(
      /\b(no|date|material|qty|price|total|rs|grand)\b/gi,
      ' '
    )
    .replace(
      /^[\s:;\-]+|[\s:;\-]+$/g,
      ''
    )
    .replace(
      /\s{2,}/g,
      ' '
    )
    .trim();
}

function cleanNumber(s){
  s=
    String(s||'')
      .replace(
        /[^0-9.]/g,
        ''
      );

  const first=
    s.indexOf('.');

  if(first>=0){
    s=
      s.slice(
        0,
        first+1
      )+
      s
        .slice(
          first+1
        )
        .replace(
          /\./g,
          ''
        );
  }

  return s;
}

function parseOneOcrLine(
  line,
  defaultDate=''
){
  line=
    cleanOcrLine(line);

  if(!line){
    return null;
  }

  const low=
    line.toLowerCase();

  if(
    /grand\s*total|amount\s*in\s*words|prepared\s*by|authorised|authorized|thank|business|sawdamman|sawdaman|sawdammal/
      .test(low)
  ){
    return null;
  }

  if(
    /^(no\s+)?date\s+material|material\s+qty|qty\s+price|cell\s*no|from\s*:|to\s*:|place\s*:|voucher|vehicle|driver|receipt$/
      .test(low)
  ){
    return null;
  }

  const dm=
    findDateInLine(
      line
    );

  const date=
    dm
      ? dm.date
      : defaultDate;

  let tail=
    dm
      ? line
        .slice(
          dm.index+
          dm.length
        )
        .trim()
      : line;

  tail=
    tail.replace(
      /^\s*\d{1,3}\s+/,
      ''
    );

  tail=
    tail.replace(
      /\b(total|price|qty|date|material|no|amount|rs)\b/gi,
      ' '
    );

  tail=
    tail
      .replace(
        /\s+/g,
        ' '
      )
      .trim();

  const nums=[
    ...tail.matchAll(
      /\b\d+(?:\.\d+)?\b/g
    )
  ]
    .map(
      m=>({
        raw:m[0],
        index:m.index,
        value:
          cleanNumber(
            m[0]
          )
      })
    )
    .filter(
      n=>n.value
    );

  if(nums.length<2){
    return null;
  }

  let qtyM;
  let priceM;
  let totalM=null;

  if(nums.length>=3){
    qtyM=
      nums[
        nums.length-3
      ];

    priceM=
      nums[
        nums.length-2
      ];

    totalM=
      nums[
        nums.length-1
      ];
  }else{
    qtyM=
      nums[
        nums.length-2
      ];

    priceM=
      nums[
        nums.length-1
      ];
  }

  let material=
    cleanMaterialName(
      tail.slice(
        0,
        qtyM.index
      )
    );

  material=
    material
      .replace(
        /^\d{1,3}\s+/,
        ''
      )
      .trim();

  if(
    !material||
    !hasTamilOrEnglish(
      material
    )
  ){
    return null;
  }

  return {
    id:createRowId(),
    date,
    material,
    qty:qtyM.value,
    price:priceM.value,
    total:
      totalM
        ? totalM.value
        : ''
  };
}

function linesFromTesseractResult(
  result
){
  const out=[];

  const data=
    result&&result.data
      ? result.data
      : {};

  if(
    Array.isArray(
      data.lines
    )&&
    data.lines.length
  ){
    data.lines.forEach(
      l=>{
        if(l&&l.text){
          out.push(
            cleanOcrLine(
              l.text
            )
          );
        }
      }
    );
  }

  if(
    !out.length&&
    data.text
  ){
    data.text
      .split(/\n+/)
      .map(
        cleanOcrLine
      )
      .filter(Boolean)
      .forEach(
        l=>out.push(l)
      );
  }

  return out;
}

function median(nums){
  nums=
    nums
      .filter(
        Number.isFinite
      )
      .sort(
        (a,b)=>a-b
      );

  if(!nums.length){
    return 16;
  }

  const m=
    Math.floor(
      nums.length/2
    );

  return nums.length%2
    ? nums[m]
    : (
        nums[m-1]+
        nums[m]
      )/2;
}

function normalizedWords(result){
  return (
    result?.data?.words||
    []
  )
    .filter(
      w=>
        w&&
        w.text&&
        cleanOcrLine(w.text)
    )
    .map(
      w=>({
        text:
          cleanOcrLine(
            w.text
          ),

        x0:
          w.bbox?.x0??0,

        x1:
          w.bbox?.x1??0,

        y0:
          w.bbox?.y0??0,

        y1:
          w.bbox?.y1??0
      })
    )
    .filter(
      w=>
        w.text&&
        w.y1>=w.y0&&
        w.x1>=w.x0
    );
}

function rowsFromWords(
  result,
  defaultDate=''
){
  const words=
    normalizedWords(
      result
    );

  if(!words.length){
    return [];
  }

  const h=
    median(
      words.map(
        w=>
          w.y1-w.y0
      )
    );

  const threshold=
    Math.max(
      16,
      h*1.15
    );

  words.sort(
    (a,b)=>
      (
        (a.y0+a.y1)/2
      )-
      (
        (b.y0+b.y1)/2
      )
  );

  const groups=[];

  for(
    const w of words
  ){
    const cy=
      (w.y0+w.y1)/2;

    let g=
      groups.find(
        g=>
          Math.abs(
            g.cy-cy
          )<=threshold
      );

    if(!g){
      g={
        cy,
        words:[]
      };

      groups.push(g);
    }

    g.words.push(w);

    g.cy=
      (
        g.cy*
        (
          g.words.length-1
        )+
        cy
      )/
      g.words.length;
  }

  const parsed=[];

  for(
    const g of groups
  ){
    g.words.sort(
      (a,b)=>
        a.x0-b.x0
    );

    const line=
      g.words
        .map(
          w=>w.text
        )
        .join(' ');

    const row=
      parseOneOcrLine(
        line,
        defaultDate
      );

    if(row){
      parsed.push(row);
    }
  }

  return parsed;
}

function renderOcrPreview(){
  const body=
    document.getElementById(
      'ocrPreviewBody'
    );

  const info=
    document.getElementById(
      'ocrPreviewInfo'
    );

  const box=
    document.getElementById(
      'ocrPreviewBox'
    );

  if(
    !body||
    !info||
    !box
  ){
    return;
  }

  body.innerHTML='';

  pendingOcrRows.forEach(
    (r,i)=>{
      const tr=
        document.createElement(
          'tr'
        );

      const total=
        (
          parseFloat(r.qty)||
          0
        )*
        (
          parseFloat(r.price)||
          0
        );

      tr.innerHTML=`
        <td>${i+1}</td>

        <td>
          <input
            type="text"
            class="ocr-date"
            value="${esc(
              r.date||''
            )}"
            maxlength="10"
            aria-label="OCR date"
          >
        </td>

        <td>
          <input
            type="text"
            class="ocr-material"
            value="${esc(
              r.material||''
            )}"
            maxlength="120"
            aria-label="OCR material"
          >
        </td>

        <td>
          <input
            type="number"
            class="ocr-qty"
            value="${esc(
              r.qty||''
            )}"
            min="0"
            step="0.01"
            aria-label="OCR quantity"
          >
        </td>

        <td>
          <input
            type="number"
            class="ocr-price"
            value="${esc(
              r.price||''
            )}"
            min="0"
            step="0.01"
            aria-label="OCR price"
          >
        </td>

        <td class="ocr-total-cell">
          ${money(total)}
        </td>
      `;

      body.appendChild(tr);
    }
  );

  info.textContent=
    pendingOcrRows.length
      ? `${pendingOcrRows.length} row(s) detected. Review before adding.`
      : 'No rows scanned';

  box.classList.toggle(
    'show',
    pendingOcrRows.length>0
  );
}

function readOcrPreviewRows(){
  const body=
    document.getElementById(
      'ocrPreviewBody'
    );

  if(!body){
    return [];
  }

  return [
    ...body.rows
  ].map(
    row=>({
      id:createRowId(),

      date:
        row
          .querySelector(
            '.ocr-date'
          )
          ?.value.trim()||'',

      material:
        row
          .querySelector(
            '.ocr-material'
          )
          ?.value.trim()||'',

      qty:
        row
          .querySelector(
            '.ocr-qty'
          )
          ?.value.trim()||'',

      price:
        row
          .querySelector(
            '.ocr-price'
          )
          ?.value.trim()||''
    })
  );
}

function clearOcrPreview(){
  pendingOcrRows=[];

  const box=
    document.getElementById(
      'ocrPreviewBox'
    );

  const body=
    document.getElementById(
      'ocrPreviewBody'
    );

  const info=
    document.getElementById(
      'ocrPreviewInfo'
    );

  if(body){
    body.innerHTML='';
  }

  if(info){
    info.textContent=
      'No rows scanned';
  }

  box?.classList.remove(
    'show'
  );
}

async function runOCR(file){
  if(!file){
    return;
  }

  const langSelect=
    document.getElementById(
      'ocrLangSelect'
    );

  const language=
    langSelect?.value||
    'eng';

  try{
    showToast(
      '📷 Loading image scanner…'
    );

    await loadExternalScript(
      'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js'
    );

    if(
      !window.Tesseract
    ){
      throw new Error(
        'OCR library is unavailable.'
      );
    }

    setStatus(
      'Scanning image…',
      'saving'
    );

    const result=
      await Tesseract.recognize(
        file,
        language,
        {
          logger:message=>{
            if(
              message&&
              typeof message.progress===
                'number'
            ){
              const percent=
                Math.round(
                  message.progress*
                  100
                );

              setStatus(
                `Scanning ${percent}%…`,
                'saving'
              );
            }
          }
        }
      );

    const doc=
      document.getElementById(
        'docDate'
      );

    const defaultDate=
      doc?.value&&
      validDMY(
        doc.value
      )
        ? doc.value
        : '';

    let rows=
      rowsFromWords(
        result,
        defaultDate
      );

    if(!rows.length){
      rows=
        linesFromTesseractResult(
          result
        )
          .map(
            line=>
              parseOneOcrLine(
                line,
                defaultDate
              )
          )
          .filter(Boolean);
    }

    pendingOcrRows=
      rows;

    renderOcrPreview();

    setStatus(
      pendingOcrRows.length
        ? `${pendingOcrRows.length} OCR row(s) found`
        : 'OCR complete',
      pendingOcrRows.length
        ? 'saved'
        : ''
    );

    if(
      pendingOcrRows.length
    ){
      showToast(
        `✅ Found ${pendingOcrRows.length} row(s). Review them below.`,
        'ok'
      );
    }else{
      showToast(
        'No readable material rows were found.',
        'err'
      );
    }
  }catch(err){
    console.error(err);

    setStatus(
      'OCR failed'
    );

    showToast(
      'Could not scan this image. Try a clearer image.',
      'err'
    );
  }
}

document
  .getElementById(
    'imageBtn'
  )
  ?.addEventListener(
    'click',
    ()=>{
      document
        .getElementById(
          'imageInput'
        )
        ?.click();
    }
  );

document
  .getElementById(
    'imageInput'
  )
  ?.addEventListener(
    'change',
    e=>{
      const file=
        e.target.files?.[0];

      if(!file){
        return;
      }

      if(
        !file.type.startsWith(
          'image/'
        )
      ){
        showToast(
          'Please select an image file.',
          'err'
        );

        e.target.value='';

        return;
      }

      if(
        file.size>
        12*1024*1024
      ){
        showToast(
          'Image is too large. Please use an image below 12 MB.',
          'err'
        );

        e.target.value='';

        return;
      }

      runOCR(file);

      e.target.value='';
    }
  );

document
  .getElementById(
    'ocrApplyBtn'
  )
  ?.addEventListener(
    'click',
    ()=>{
      const rows=
        readOcrPreviewRows();

      if(!rows.length){
        showToast(
          'There are no OCR rows to add.',
          'err'
        );

        return;
      }

      let added=0;

      rows.forEach(
        row=>{
          const hasAny=
            row.date||
            row.material||
            row.qty||
            row.price;

          if(!hasAny){
            return;
          }

          if(!row.material){
            return;
          }

          addRow(row);
          added++;
        }
      );

      if(!added){
        showToast(
          'No valid OCR rows were available.',
          'err'
        );

        return;
      }

      updateTotals();
      saveDraft();
      clearOcrPreview();

      showToast(
        `✅ Added ${added} OCR row(s)`,
        'ok'
      );
    }
  );

document
  .getElementById(
    'ocrClearBtn'
  )
  ?.addEventListener(
    'click',
    clearOcrPreview
  );

/* =========================
   DATE BUTTONS
========================= */

document
  .getElementById(
    'prevDayBtn'
  )
  ?.addEventListener(
    'click',
    ()=>
      moveReceiptDate(
        -1,
        0
      )
  );

document
  .getElementById(
    'nextDayBtn'
  )
  ?.addEventListener(
    'click',
    ()=>
      moveReceiptDate(
        1,
        0
      )
  );

document
  .getElementById(
    'todayDateBtn'
  )
  ?.addEventListener(
    'click',
    ()=>
      setDocDateObject(
        new Date()
      )
  );

document
  .getElementById(
    'prevWeekBtn'
  )
  ?.addEventListener(
    'click',
    ()=>
      moveReceiptWeek(
        -1
      )
  );

document
  .getElementById(
    'nextWeekBtn'
  )
  ?.addEventListener(
    'click',
    ()=>
      moveReceiptWeek(
        1
      )
  );

document
  .getElementById(
    'prevMonthBtn'
  )
  ?.addEventListener(
    'click',
    ()=>
      moveReceiptDate(
        0,
        -1
      )
  );

document
  .getElementById(
    'nextMonthBtn'
  )
  ?.addEventListener(
    'click',
    ()=>
      moveReceiptDate(
        0,
        1
      )
  );

document
  .getElementById(
    'docDate'
  )
  ?.addEventListener(
    'input',
    e=>{
      autoSlashDate(
        e.target
      );

      syncPeriodFromDocDate(
        false
      );

      debouncedSave();
    }
  );

document
  .getElementById(
    'docDate'
  )
  ?.addEventListener(
    'blur',
    e=>{
      fixDateOnBlur(
        e.target
      );

      syncPeriodFromDocDate(
        true
      );
    }
  );

/* =========================
   INFO AUTO SAVE
========================= */

document
  .querySelectorAll(
    '[data-key]'
  )
  .forEach(el=>{
    el.addEventListener(
      'input',
      ()=>{
        debouncedSave();
      }
    );
  });

/* =========================
   PRINT / PDF
========================= */

const PRINT_CSS=`
@page{
  size:A4 portrait;
  margin:12mm;
}

*{
  box-sizing:border-box;
}

body{
  margin:0;
  padding:0;
  font-family:
    Arial,
    Helvetica,
    sans-serif;
  color:#111;
  background:#fff;
}

.print-sheet{
  width:100%;
  min-height:267mm;
}

.print-title{
  text-align:center;
  font-size:31px;
  font-weight:900;
  margin-bottom:3px;
}

.print-subtitle{
  text-align:center;
  font-size:14px;
  font-weight:700;
  letter-spacing:2px;
  margin-bottom:15px;
}

.print-meta{
  display:grid;
  grid-template-columns:1fr 1fr;
  border:1px solid #222;
  margin-bottom:12px;
}

.print-meta-block{
  padding:8px;
}

.print-meta-block+
.print-meta-block{
  border-left:1px solid #222;
}

.print-label{
  font-weight:800;
  display:inline-block;
  min-width:80px;
}

.print-grid{
  display:grid;
  grid-template-columns:
    repeat(3,1fr);
  border:1px solid #222;
  margin-bottom:12px;
}

.print-grid div{
  padding:8px;
}

.print-grid div+
.print-grid div{
  border-left:1px solid #222;
}

.print-table{
  width:100%;
  border-collapse:collapse;
  table-layout:fixed;
}

.print-table th,
.print-table td{
  border:1px solid #222;
  padding:6px;
  font-size:11px;
  vertical-align:middle;
}

.print-table th{
  background:#efefef;
  font-weight:900;
  text-align:center;
}

.print-table td:nth-child(1),
.print-table td:nth-child(2),
.print-table td:nth-child(4),
.print-table td:nth-child(5),
.print-table td:nth-child(6){
  text-align:center;
}

.print-table td:nth-child(3){
  text-align:left;
}

.print-total-row td{
  font-weight:900;
}

.print-signatures{
  display:grid;
  grid-template-columns:
    repeat(3,1fr);
  gap:18px;
  margin-top:55px;
}

.print-signature{
  text-align:center;
  padding-top:22px;
  border-top:1px solid #222;
  font-weight:700;
  font-size:11px;
}

.print-footer{
  margin-top:18px;
  text-align:center;
  font-size:9px;
  color:#555;
}
`;

function buildPrintBody(){
  updateTotals();

  const info=
    readInfo();

  const rows=
    readRows(false);

  let grand=0;
  let qtyGrand=0;

  const tableRows=
    rows
      .map(
        (r,i)=>{
          const q=
            parseFloat(
              r.qty
            )||0;

          const p=
            parseFloat(
              r.price
            )||0;

          const total=q*p;

          qtyGrand+=q;
          grand+=total;

          return `
          <tr>
            <td>${i+1}</td>
            <td>${esc(
              r.date||'—'
            )}</td>
            <td>${esc(
              r.material||'—'
            )}</td>
            <td>${qtyText(q)}</td>
            <td>${money(p)}</td>
            <td>${money(total)}</td>
          </tr>
          `;
        }
      )
      .join('');

  return `
    <div class="print-sheet">

      <div class="print-title">
        Sri Sawdamman Infra
      </div>

      <div class="print-subtitle">
        MATERIAL INPUT RECEIPT
      </div>

      <div class="print-meta">

        <div class="print-meta-block">
          <div>
            <span class="print-label">
              From:
            </span>
            ${esc(
              info.from||'—'
            )}
          </div>

          <div>
            <span class="print-label">
              To:
            </span>
            ${esc(
              info.to||'—'
            )}
          </div>

          <div>
            <span class="print-label">
              Date:
            </span>
            ${esc(
              info.docDate||'—'
            )}
          </div>
        </div>

        <div class="print-meta-block">

          <div>
            <span class="print-label">
              Place:
            </span>
            ${esc(
              [
                info.place1,
                info.place2,
                info.place3
              ]
                .filter(Boolean)
                .join(', ')||
              '—'
            )}
          </div>

          <div>
            <span class="print-label">
              Cell:
            </span>
            ${esc(
              [
                info.cell1,
                info.cell2
              ]
                .filter(Boolean)
                .join(' / ')||
              '—'
            )}
          </div>

        </div>

      </div>

      <div class="print-grid">

        <div>
          <strong>
            Voucher:
          </strong>
          ${esc(
            info.voucherNo||
            '—'
          )}
        </div>

        <div>
          <strong>
            Vehicle:
          </strong>
          ${esc(
            info.vehicleNo||
            '—'
          )}
        </div>

        <div>
          <strong>
            Driver:
          </strong>
          ${esc(
            info.driverName||
            '—'
          )}
        </div>

      </div>

      <table class="print-table">

        <thead>
          <tr>
            <th style="width:7%">
              NO
            </th>

            <th style="width:16%">
              DATE
            </th>

            <th style="width:34%">
              MATERIAL
            </th>

            <th style="width:12%">
              QTY
            </th>

            <th style="width:15%">
              PRICE
            </th>

            <th style="width:16%">
              TOTAL
            </th>
          </tr>
        </thead>

        <tbody>
          ${
            tableRows||
            `
            <tr>
              <td
                colspan="6"
                style="text-align:center;"
              >
                No material entries
              </td>
            </tr>
            `
          }
        </tbody>

        <tfoot>

          <tr class="print-total-row">

            <td
              colspan="3"
              style="text-align:right;"
            >
              Quantity Total
            </td>

            <td>
              ${qtyText(qtyGrand)}
            </td>

            <td
              style="text-align:right;"
            >
              Grand Total
            </td>

            <td>
              ${money(grand)}
            </td>

          </tr>

          ${
            grand>0
              ? `
              <tr>
                <td colspan="6">
                  <strong>
                    Amount in Words:
                  </strong>
                  ${esc(
                    toWords(
                      Math.floor(
                        grand
                      )
                    )+
                    ' Rupees Only'
                  )}
                </td>
              </tr>
              `
              :''
          }

        </tfoot>

      </table>

      <div class="print-signatures">

        <div class="print-signature">
          Prepared By
        </div>

        <div class="print-signature">
          Checked By
        </div>

        <div class="print-signature">
          Authorised Signatory
        </div>

      </div>

      <div class="print-footer">
        Sri Sawdamman Infra —
        Material Input Receipt
      </div>

    </div>
  `;
}

function receiptFileName(
  ext='pdf'
){
  const voucher=
    document
      .getElementById(
        'voucherNo'
      )
      ?.value.trim()||'';

  const date=
    document
      .getElementById(
        'docDate'
      )
      ?.value
      .replace(
        /\//g,
        '-'
      )||'';

  const safeVoucher=
    voucher
      .replace(
        /[^\w-]+/g,
        '_'
      )
      .replace(
        /^_+|_+$/g,
        ''
      );

  return (
    'Sri_Sawdamman_Infra_Receipt'+
    (
      date
        ? '_'+date
        : ''
    )+
    (
      safeVoucher
        ? '_'+
          safeVoucher
        : ''
    )+
    '.'+
    ext
  );
}

function openA4Receipt(){
  const validationError=
    validateReceipt();

  if(validationError){
    showToast(
      validationError,
      'err'
    );

    return;
  }

  const html=`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta
  name="viewport"
  content="width=device-width,initial-scale=1.0"
>
<title>
  Sri Sawdamman Infra Receipt
</title>

<style>
${PRINT_CSS}
</style>
</head>

<body>
${buildPrintBody()}

<script>
window.onload=function(){
  setTimeout(function(){
    window.print();

    setTimeout(function(){
      window.close();
    },500);
  },250);
};
<\/script>

</body>
</html>
`;

  const blob=
    new Blob(
      [html],
      {
        type:
          'text/html;charset=utf-8'
      }
    );

  const url=
    URL.createObjectURL(
      blob
    );

  const win=
    window.open(
      url,
      '_blank',
      'noopener,noreferrer'
    );

  if(!win){
    URL.revokeObjectURL(url);

    showToast(
      'Popup blocked. Please allow popups for this website.',
      'err'
    );

    return;
  }

  setTimeout(
    ()=>{
      URL.revokeObjectURL(
        url
      );
    },
    10000
  );

  showToast(
    '🖨️ Print window opened',
    'ok'
  );
}

document
  .getElementById(
    'printBtn'
  )
  ?.addEventListener(
    'click',
    openA4Receipt
  );

/* =========================
   PDF
========================= */

async function ensurePdfLibraries(){

  if(
    !window.html2canvas
  ){
    await loadScriptOnce(
      'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
      'html2canvas',
      'html2canvas'
    );
  }

  if(
    !window.jspdf?.jsPDF
  ){
    await loadScriptOnce(
      'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js',
      'jspdf',
      'jspdf'
    );
  }
}

async function createPDFBlob(){

  await ensurePdfLibraries();

  if(
    !window.html2canvas||
    !window.jspdf?.jsPDF
  ){
    throw new Error(
      'PDF libraries could not be loaded.'
    );
  }

  const wrapper=
    document.createElement(
      'div'
    );

  wrapper.style.position=
    'fixed';

  wrapper.style.left=
    '-100000px';

  wrapper.style.top='0';

  wrapper.style.width=
    '794px';

  wrapper.style.background=
    '#fff';

  wrapper.style.padding=
    '36px';

  wrapper.style.zIndex='-1';

  wrapper.innerHTML=
    `
    <style>
      ${PRINT_CSS}
    </style>

    ${buildPrintBody()}
    `;

  document.body.appendChild(
    wrapper
  );

  try{

    const canvas=
      await html2canvas(
        wrapper,
        {
          scale:2,
          useCORS:true,
          backgroundColor:
            '#ffffff',
          logging:false
        }
      );

    const imgData=
      canvas.toDataURL(
        'image/png'
      );

    const {
      jsPDF
    }=window.jspdf;

    const pdf=
      new jsPDF({
        orientation:
          'portrait',
        unit:'mm',
        format:'a4'
      });

    const pageWidth=
      pdf.internal.pageSize
        .getWidth();

    const pageHeight=
      pdf.internal.pageSize
        .getHeight();

    const margin=8;

    const usableWidth=
      pageWidth-
      margin*2;

    const imageHeight=
      canvas.height*
      usableWidth/
      canvas.width;

    let heightLeft=
      imageHeight;

    let position=margin;

    pdf.addImage(
      imgData,
      'PNG',
      margin,
      position,
      usableWidth,
      imageHeight
    );

    heightLeft-=
      pageHeight-
      margin*2;

    while(
      heightLeft>0
    ){

      position=
        heightLeft-
        imageHeight+
        margin;

      pdf.addPage();

      pdf.addImage(
        imgData,
        'PNG',
        margin,
        position,
        usableWidth,
        imageHeight
      );

      heightLeft-=
        pageHeight-
        margin*2;
    }

    return pdf.output(
      'blob'
    );

  }finally{
    wrapper.remove();
  }
}

function dlAnchorBlob(
  blob,
  fname
){
  const url=
    URL.createObjectURL(
      blob
    );

  const a=
    document.createElement(
      'a'
    );

  a.href=url;
  a.download=fname;
  a.rel='noopener';
  a.style.display='none';

  document.body.appendChild(a);

  a.click();

  document.body.removeChild(a);

  setTimeout(
    ()=>{
      URL.revokeObjectURL(
        url
      );
    },
    45000
  );
}

async function downloadPDFDirect(){

  const validationError=
    validateReceipt();

  if(validationError){
    showToast(
      validationError,
      'err'
    );

    return;
  }

  const fname=
    receiptFileName(
      'pdf'
    );

  try{

    setStatus(
      'PDF loading…',
      'saving'
    );

    showToast(
      '📄 Creating PDF file…'
    );

    const blob=
      await createPDFBlob();

    dlAnchorBlob(
      blob,
      fname
    );

    setStatus(
      'PDF downloaded',
      'saved'
    );

    showToast(
      '✅ PDF downloaded',
      'ok'
    );

  }catch(err){

    console.error(err);

    setStatus(
      'PDF fallback'
    );

    showToast(
      'Direct PDF failed. Opening print screen.',
      'err'
    );

    setTimeout(
      openA4Receipt,
      500
    );
  }
}

document
  .getElementById(
    'saveBtn'
  )
  ?.addEventListener(
    'click',
    downloadPDFDirect
  );

/* =========================
   SHARE
========================= */

function buildShareText(){

  updateTotals();

  const info=
    readInfo();

  const rows=
    readRows(false);

  const lines=[
    'Sri Sawdamman Infra',
    'Material Input Receipt',
    '━━━━━━━━━━━━━━━━━━━━',

    `From: ${
      info.from||'—'
    }`,

    `To: ${
      info.to||'—'
    }`,

    `Date: ${
      info.docDate||'—'
    }`,

    `Place: ${
      [
        info.place1,
        info.place2,
        info.place3
      ]
      .filter(Boolean)
      .join(', ')||
      '—'
    }`,

    `Cell: ${
      [
        info.cell1,
        info.cell2
      ]
      .filter(Boolean)
      .join(' / ')||
      '—'
    }`,

    '━━━━━━━━━━━━━━━━━━━━'
  ];

  rows.forEach(
    (r,i)=>{
      const total=
        (
          parseFloat(
            r.qty
          )||0
        )*
        (
          parseFloat(
            r.price
          )||0
        );

      lines.push(
        `${i+1}. ${
          r.date||'-'
        } | ${
          r.material||'-'
        } | Qty:${
          r.qty||0
        } | Price:${
          r.price||0
        } | Total:${
          total>0
            ? money(total)
            : '-'
        }`
      );
    }
  );

  lines.push(
    '━━━━━━━━━━━━━━━━━━━━',
    `Qty Total: ${
      qtyTotalEl
        ?.textContent||
      '0'
    }`,
    `Grand Total: ${
      grandTotalEl
        ?.textContent||
      '₹ 0.00'
    }`
  );

  return lines.join(
    '\n'
  );
}

document
  .getElementById(
    'shareBtn'
  )
  ?.addEventListener(
    'click',
    async ()=>{
      const validationError=
        validateReceipt();

      if(validationError){
        showToast(
          validationError,
          'err'
        );

        return;
      }

      const text=
        buildShareText();

      try{

        if(
          navigator.share
        ){
          await navigator.share({
            title:
              'Sri Sawdamman Infra Receipt',
            text
          });

          showToast(
            '✅ Shared successfully',
            'ok'
          );

          return;
        }

        if(
          navigator.clipboard
        ){
          await navigator.clipboard.writeText(
            text
          );

          showToast(
            '✅ Receipt copied to clipboard',
            'ok'
          );

          return;
        }

        alert(text);

      }catch(e){

        if(
          e.name===
          'AbortError'
        ){
          return;
        }

        try{

          await navigator.clipboard.writeText(
            text
          );

          showToast(
            '✅ Receipt copied to clipboard',
            'ok'
          );

        }catch{
          alert(text);
        }
      }
    }
  );

/* =========================
   THEME
========================= */

function setupTheme(){

  const btn=
    document.getElementById(
      'themeBtn'
    );

  let saved=
    localStorage.getItem(
      THEME_KEY
    );

  if(
    saved!=='light'&&
    saved!=='dark'
  ){
    saved=
      window
        .matchMedia?.(
          '(prefers-color-scheme: light)'
        )
        .matches
        ? 'light'
        : 'dark';
  }

  const light=
    saved==='light';

  document.body.classList.toggle(
    'light-mode',
    light
  );

  if(btn){
    btn.textContent=
      light
        ? '🌙'
        : '☀️';

    btn.setAttribute(
      'aria-pressed',
      String(light)
    );

    btn.title=
      light
        ? 'Switch to dark mode'
        : 'Switch to light mode';
  }
}

function toggleTheme(){

  const light=
    !document.body.classList.contains(
      'light-mode'
    );

  document.body.classList.toggle(
    'light-mode',
    light
  );

  localStorage.setItem(
    THEME_KEY,
    light
      ? 'light'
      : 'dark'
  );

  const btn=
    document.getElementById(
      'themeBtn'
    );

  if(btn){
    btn.textContent=
      light
        ? '🌙'
        : '☀️';

    btn.setAttribute(
      'aria-pressed',
      String(light)
    );

    btn.title=
      light
        ? 'Switch to dark mode'
        : 'Switch to light mode';
  }

  showToast(
    `${light?'Light':'Dark'} mode enabled`,
    'ok'
  );
}

/* =========================
   BACKUP
========================= */

function exportBackup(){

  try{

    const payload={
      version:
        BACKUP_VERSION,

      app:
        'Sri Sawdamman Infra',

      exportedAt:
        new Date().toISOString(),

      theme:
        document.body.classList.contains(
          'light-mode'
        )
          ? 'light'
          : 'dark',

      info:
        readInfo(),

      rows:
        readRows(false)
    };

    const blob=
      new Blob(
        [
          JSON.stringify(
            payload,
            null,
            2
          )
        ],
        {
          type:
            'application/json'
        }
      );

    dlAnchorBlob(
      blob,
      `Sri_Sawdamman_Infra_Backup_${new Date()
        .toISOString()
        .slice(0,10)}.json`
    );

    showToast(
      '✅ Backup exported',
      'ok'
    );

  }catch(err){

    console.error(err);

    showToast(
      'Backup export failed',
      'err'
    );
  }
}

function importBackupText(text){

  let d;

  try{
    d=
      JSON.parse(text);
  }catch{
    return 'The selected backup is not valid JSON.';
  }

  if(
    !d||
    typeof d!=='object'||
    !Array.isArray(d.rows)||
    !d.info||
    typeof d.info!=='object'
  ){
    return 'This backup is not a valid Sri Sawdamman Infra file.';
  }

  if(
    d.rows.length>1000
  ){
    return 'Backup contains too many rows.';
  }

  const cleanRows=
    d.rows
      .filter(
        r=>
          r&&
          typeof r==='object'
      )
      .map(
        r=>
          normalizeRow(r)
      );

  writeInfo(
    d.info
  );

  tbody.innerHTML='';

  cleanRows.forEach(
    r=>addRow(r)
  );

  while(
    tbody.rows.length<
    MIN_ROWS
  ){
    addRow();
  }

  if(
    d.theme==='light'||
    d.theme==='dark'
  ){
    localStorage.setItem(
      THEME_KEY,
      d.theme
    );

    setupTheme();
  }

  updateTotals();
  saveDraft();

  return '';
}

/* =========================
   APP TOOLS
========================= */

function bindAppTools(){

  document
    .getElementById(
      'themeBtn'
    )
    ?.addEventListener(
      'click',
      toggleTheme
    );

  document
    .getElementById(
      'exportBtn'
    )
    ?.addEventListener(
      'click',
      exportBackup
    );

  document
    .getElementById(
      'importBtn'
    )
    ?.addEventListener(
      'click',
      ()=>{
        document
          .getElementById(
            'importInput'
          )
          ?.click();
      }
    );

  document
    .getElementById(
      'importInput'
    )
    ?.addEventListener(
      'change',
      async e=>{

        const file=
          e.target.files?.[0];

        if(!file){
          return;
        }

        if(
          file.size>
          2*1024*1024
        ){
          showToast(
            'Backup file is too large.',
            'err'
          );

          e.target.value='';

          return;
        }

        try{

          const text=
            await file.text();

          if(
            !window.confirm(
              'Restore this backup? Current receipt data will be replaced.'
            )
          ){
            return;
          }

          const err=
            importBackupText(
              text
            );

          if(err){
            showToast(
              err,
              'err'
            );
          }else{
            showToast(
              '✅ Backup restored',
              'ok'
            );
          }

        }catch(err){

          console.error(err);

          showToast(
            'Could not read the backup file.',
            'err'
          );

        }finally{
          e.target.value='';
        }
      }
    );

  document
    .getElementById(
      'saveDraftBtn'
    )
    ?.addEventListener(
      'click',
      ()=>{
        saveDraft();

        showToast(
          '✅ Draft saved',
          'ok'
        );
      }
    );
}

/* =========================
   KEYBOARD SHORTCUTS
========================= */

document.addEventListener(
  'keydown',
  e=>{

    if(
      (
        e.ctrlKey||
        e.metaKey
      )&&
      e.key.toLowerCase()==='s'
    ){
      e.preventDefault();

      saveDraft();

      showToast(
        '✅ Draft saved',
        'ok'
      );
    }

    if(
      (
        e.ctrlKey||
        e.metaKey
      )&&
      e.key.toLowerCase()==='p'
    ){
      e.preventDefault();

      document
        .getElementById(
          'printBtn'
        )
        ?.click();
    }

    if(
      (
        e.ctrlKey||
        e.metaKey
      )&&
      e.key==='Enter'
    ){
      e.preventDefault();

      document
        .getElementById(
          'addRowBtn'
        )
        ?.click();
    }

    if(
      e.key==='Escape'
    ){
      document
        .querySelectorAll(
          '.modal-overlay.show'
        )
        .forEach(
          modal=>{
            modal.classList.remove(
              'show'
            );
          }
        );
    }
  }
);

/* =========================
   AMOUNT IN WORDS
========================= */

function toWords(n){

  if(!n){
    return 'Zero';
  }

  const ones=[
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen'
  ];

  const tens=[
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety'
  ];

  function two(n){
    return n<20
      ? ones[n]
      : tens[
          ~~(n/10)
        ]+
        (
          n%10
            ? ' '+
              ones[
                n%10
              ]
            : ''
        );
  }

  function three(n){

    let w='';

    if(n>=100){
      w+=
        ones[
          ~~(n/100)
        ]+
        ' Hundred';

      n%=100;

      if(n){
        w+=' and ';
      }
    }

    if(n){
      w+=two(n);
    }

    return w;
  }

  let w='';

  let cr=
    ~~(n/1e7);

  n%=1e7;

  let la=
    ~~(n/1e5);

  n%=1e5;

  let th=
    ~~(n/1e3);

  n%=1e3;

  if(cr){
    w+=
      three(cr)+
      ' Crore ';
  }

  if(la){
    w+=
      three(la)+
      ' Lakh ';
  }

  if(th){
    w+=
      three(th)+
      ' Thousand ';
  }

  if(n){
    w+=three(n);
  }

  return w.trim();
}

/* =========================
   AUTO SAVE
========================= */

setInterval(
  saveDraft,
  30000
);

window.addEventListener(
  'beforeunload',
  saveDraft
);

document.addEventListener(
  'visibilitychange',
  ()=>{
    if(document.hidden){
      saveDraft();
    }
  }
);

/* =========================
   INIT
========================= */

(function init(){

  setupTheme();

  const docDate=
    document.getElementById(
      'docDate'
    );

  if(docDate){
    docDate.value=
      todayStr();
  }

  const loaded=
    loadDraft();

  if(!loaded){

    tbody.innerHTML='';

    for(
      let i=0;
      i<MIN_ROWS;
      i++
    ){
      addRow();
    }
  }

  applyDefaultPeriodFields();

  syncPeriodFromDocDate(
    false
  );

  updateTotals();

  bindAppTools();

  setupPrimaryFieldLimits();

  saveDraft();

})();

/* =========================
   INPUT LIMITS
========================= */

function setupPrimaryFieldLimits(){

  const limits={
    fromInput:120,
    toInput:120,
    voucherNo:50,
    vehicleNo:30,
    driverName:80
  };

  Object.entries(
    limits
  ).forEach(
    ([id,max])=>{
      const el=
        document.getElementById(
          id
        );

      if(el){
        el.maxLength=max;
      }
    }
  );
}
