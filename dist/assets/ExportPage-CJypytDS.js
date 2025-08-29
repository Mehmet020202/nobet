import{b as k,j as e}from"./radix-ui-DGgDhZMf.js";import{c as G,C as H,U as q,F as W,B}from"./index-3ZT1LmJ7.js";import{u as J,C as S,a as P,b as F,c as L,d as E}from"./useIndexedDB-CLkKVxWR.js";import{S as O,a as R,b as Y,c as I,d as K}from"./select-CqJO4d4P.js";import{B as N}from"./badge-DB7DNGFt.js";import{u as _,w as Q}from"./excel-3SA47z_C.js";import"./pdf-ckwbz45p.js";import"./utils-B6LxV9S2.js";/**
 * @license lucide-react v0.510.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ee=[["path",{d:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4",key:"ih7n3h"}],["polyline",{points:"7 10 12 15 17 10",key:"2ggqvy"}],["line",{x1:"12",x2:"12",y1:"15",y2:"3",key:"1vk2je"}]],V=G("download",ee);/**
 * @license lucide-react v0.510.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const te=[["path",{d:"M12 3v18",key:"108xh3"}],["rect",{width:"18",height:"18",x:"3",y:"3",rx:"2",key:"afitv7"}],["path",{d:"M3 9h18",key:"1pudct"}],["path",{d:"M3 15h18",key:"5xshup"}]],se=G("table",te),ae=()=>({exportToPDF:async(o,l,i,u)=>{try{if(!o||o.length===0)throw new Error("Nöbet verisi bulunamadı");if(!l||l.length===0)throw new Error("Doktor verisi bulunamadı");console.log("HTML PDF export başlıyor...",{duties:o.length,doctors:l.length});const h=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],j=c=>{const r=l.find(d=>d.id===c);return r?r.name:"Bilinmeyen"},m={};o.forEach(c=>{m[c.date]||(m[c.date]={morning:[],evening:[],night:[]}),m[c.date][c.shift_type].push(c)});let g=`
        <!DOCTYPE html>
        <html lang="tr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Hastane Nöbet Programı</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { font-size: 18px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; font-weight: bold; }
            .morning { background-color: #fff3cd; }
            .evening { background-color: #f8d7da; }
            .night { background-color: #d1ecf1; }
            .stats-table { margin-top: 40px; }
            .page-break { page-break-before: always; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Hastane Nöbet Programı</div>
            <div class="subtitle">${h[u-1]} ${i}</div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Sabah (08:00-16:00)</th>
                <th>Akşam (16:00-24:00)</th>
                <th>Gece (00:00-08:00)</th>
              </tr>
            </thead>
            <tbody>
      `;Object.keys(m).sort().forEach(c=>{const r=m[c],d=new Date(c),x=["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"][d.getDay()],v=`${d.getDate()}/${d.getMonth()+1} ${x}`;g+=`
          <tr>
            <td><strong>${v}</strong></td>
            <td class="morning">${r.morning&&r.morning.length>0?r.morning.map(s=>j(s.doctor_id)).join(", "):"-"}</td>
            <td class="evening">${r.evening&&r.evening.length>0?r.evening.map(s=>j(s.doctor_id)).join(", "):"-"}</td>
            <td class="night">${r.night&&r.night.length>0?r.night.map(s=>j(s.doctor_id)).join(", "):"-"}</td>
          </tr>
        `}),g+=`
            </tbody>
          </table>
          
          <div class="page-break"></div>
          
          <div class="header">
            <div class="title">Doktor İstatistikleri</div>
          </div>
          
          <table class="stats-table">
            <thead>
              <tr>
                <th>Doktor Adı</th>
                <th>Toplam Nöbet</th>
                <th>Sabah</th>
                <th>Akşam</th>
                <th>Gece</th>
                <th>Branş</th>
              </tr>
            </thead>
            <tbody>
      `,l.forEach(c=>{const r=o.filter(x=>x.doctor_id===c.id),d={total:r.length,morning:r.filter(x=>x.shift_type==="morning").length,evening:r.filter(x=>x.shift_type==="evening").length,night:r.filter(x=>x.shift_type==="night").length};g+=`
          <tr>
            <td><strong>${c.name}</strong></td>
            <td>${d.total}</td>
            <td>${d.morning}</td>
            <td>${d.evening}</td>
            <td>${d.night}</td>
            <td>${c.specialty||"-"}</td>
          </tr>
        `}),g+=`
            </tbody>
          </table>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Yazdır / PDF Olarak Kaydet
            </button>
          </div>
          
          <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #666;">
            ALTUĞ KUYUMCULUK 05432405202 KAHTA ADIYAMAN
          </div>
        </body>
        </html>
      `;const b=`nobet-programi-${h[u-1]}-${i}.html`,D=new Blob([g],{type:"text/html"}),p=URL.createObjectURL(D),f=document.createElement("a");f.href=p,f.download=b,document.body.appendChild(f),f.click(),document.body.removeChild(f),URL.revokeObjectURL(p),console.log("HTML PDF export tamamlandı:",b)}catch(h){throw console.error("HTML PDF export hatası:",h),h}},exportToExcel:async(o,l,i,u)=>{var h,j;try{if(!o||o.length===0)throw new Error("Nöbet verisi bulunamadı");if(!l||l.length===0)throw new Error("Doktor verisi bulunamadı");console.log("Excel export başlıyor...",{duties:o.length,doctors:l.length});const m=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],g=s=>{const n=l.find(a=>a.id===s);if(!n)return"XX";const t=n.name.split(" ");return t.length>=2?t[0].charAt(0).toUpperCase()+t[1].charAt(0).toUpperCase():n.name.substring(0,2).toUpperCase()},w=_.book_new(),b={};o.forEach(s=>{b[s.date]||(b[s.date]={morning:[],evening:[],night:[]}),b[s.date][s.shift_type].push(s)});const D=new Date(i,u,0).getDate(),p=[];p.push([`Hastane Nöbet Sistemi ${m[u-1].toUpperCase()} ${i} Doktor Nöbet Listesi`]),p.push([]);const f=["Tarih","","08:00-16:00","","","","","16:00-24:00","","","","","24:00-08:00","","","","Doktor Listesi"];p.push(f);const c=["","","Sabah Vardiyası","","","","","Akşam Vardiyası","","","","","Gece Vardiyası","","","No","Doktor Adı"];p.push(c);for(let s=1;s<=D;s++){const n=`${i}-${String(u).padStart(2,"0")}-${String(s).padStart(2,"0")}`,t=new Date(i,u-1,s),a=["PAZAR","PAZARTESİ","SALI","ÇARŞAMBA","PERŞEMBE","CUMA","CUMARTESİ"][t.getDay()],z=t.getDay()===0||t.getDay()===6,T=b[n]||{morning:[],evening:[],night:[]},X=`${String(s).padStart(2,"0")}.${String(u).padStart(2,"0")}.${String(i).substring(2)}`,$=T.morning.slice(0,4).map(A=>g(A.doctor_id)),M=T.evening.slice(0,4).map(A=>g(A.doctor_id)),C=T.night.slice(0,3).map(A=>g(A.doctor_id));for(;$.length<4;)$.push("");for(;M.length<4;)M.push("");for(;C.length<3;)C.push("");const Z=[X,a,...$,"",...M,"",...C,"",s<=l.length?s:"",s<=l.length&&((h=l[s-1])==null?void 0:h.name)||""];p.push(Z)}for(let s=D+1;s<=l.length;s++){const n=Array(17).fill("");n[15]=s,n[16]=((j=l[s-1])==null?void 0:j.name)||"",p.push(n)}const r=_.aoa_to_sheet(p);r["!cols"]=[{width:10},{width:12},{width:8},{width:8},{width:8},{width:8},{width:3},{width:8},{width:8},{width:8},{width:8},{width:3},{width:8},{width:8},{width:8},{width:3},{width:5},{width:20}],_.book_append_sheet(w,r,"Nöbet Programı");const d=[];d.push(["Doktor İstatistikleri"]),d.push([]),d.push(["Doktor Adı","Toplam Nöbet","Sabah","Akşam","Gece","Branş"]),l.forEach(s=>{const n=o.filter(a=>a.doctor_id===s.id),t={total:n.length,morning:n.filter(a=>a.shift_type==="morning").length,evening:n.filter(a=>a.shift_type==="evening").length,night:n.filter(a=>a.shift_type==="night").length};d.push([s.name,t.total,t.morning,t.evening,t.night,s.specialty])});const x=_.aoa_to_sheet(d);_.book_append_sheet(w,x,"İstatistikler");const v=`nobet-programi-${m[u-1]}-${i}.xlsx`;Q(w,v),console.log("Excel export tamamlandı:",v)}catch(m){throw console.error("Excel export hatası:",m),m}}}),me=()=>{const[y,U]=k.useState(new Date().getMonth()),[o,l]=k.useState(new Date().getFullYear()),[i,u]=k.useState([]),[h,j]=k.useState([]),[m,g]=k.useState(!1),{getDoctors:w,getDuties:b}=J(),{exportToPDF:D,exportToExcel:p}=ae();k.useEffect(()=>{f()},[y,o]);const f=async()=>{try{const[t,a]=await Promise.all([w(),b(o,y+1)]);j(t),u(a)}catch(t){console.error("Error loading data:",t)}},c=async()=>{if(i.length===0){alert("Önce nöbet programı oluşturun!");return}g(!0);try{console.log("PDF export başlıyor...",{duties:i.length,doctors:h.length}),await D(i,h,o,y+1),console.log("PDF export başarılı!")}catch(t){console.error("Error exporting PDF:",t),alert(`PDF dışa aktarılırken hata oluştu: ${t.message}`)}finally{g(!1)}},r=async()=>{if(i.length===0){alert("Önce nöbet programı oluşturun!");return}g(!0);try{console.log("Excel export başlıyor...",{duties:i.length,doctors:h.length}),await p(i,h,o,y+1),console.log("Excel export başarılı!")}catch(t){console.error("Error exporting Excel:",t),alert(`Excel dışa aktarılırken hata oluştu: ${t.message}`)}finally{g(!1)}},d=()=>{const t={totalDuties:i.length,doctorStats:{},shiftStats:{morning:0,evening:0,night:0}};return i.forEach(a=>{t.doctorStats[a.doctor_id]||(t.doctorStats[a.doctor_id]={total:0,morning:0,evening:0,night:0}),t.doctorStats[a.doctor_id].total++,t.doctorStats[a.doctor_id][a.shift_type]++,t.shiftStats[a.shift_type]++}),t},x=t=>{const a=h.find(z=>z.id===t);return a?a.name:"Bilinmeyen"},v=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"],s=Array.from({length:10},(t,a)=>new Date().getFullYear()-2+a),n=d();return e.jsxs("div",{className:"space-y-6",children:[e.jsx("div",{className:"flex items-center justify-between",children:e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-bold",children:"Dışa Aktarma"}),e.jsx("p",{className:"text-muted-foreground",children:"Nöbet programını PDF veya Excel formatında indirin"})]})}),e.jsxs(S,{children:[e.jsxs(P,{children:[e.jsxs(F,{className:"flex items-center",children:[e.jsx(H,{className:"mr-2 h-5 w-5"}),"Dönem Seçimi"]}),e.jsx(L,{children:"Dışa aktarılacak ay ve yılı seçin"})]}),e.jsx(E,{children:e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium",children:"Ay"}),e.jsxs(O,{value:y.toString(),onValueChange:t=>U(parseInt(t)),children:[e.jsx(R,{className:"w-32",children:e.jsx(Y,{})}),e.jsx(I,{children:v.map((t,a)=>e.jsx(K,{value:a.toString(),children:t},a))})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium",children:"Yıl"}),e.jsxs(O,{value:o.toString(),onValueChange:t=>l(parseInt(t)),children:[e.jsx(R,{className:"w-24",children:e.jsx(Y,{})}),e.jsx(I,{children:s.map(t=>e.jsx(K,{value:t.toString(),children:t},t))})]})]})]})})]}),e.jsxs(S,{children:[e.jsxs(P,{children:[e.jsxs(F,{className:"flex items-center",children:[e.jsx(q,{className:"mr-2 h-5 w-5"}),"Dönem İstatistikleri"]}),e.jsxs(L,{children:[v[y]," ",o," dönemi nöbet istatistikleri"]})]}),e.jsxs(E,{children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4 mb-6",children:[e.jsxs("div",{className:"text-center p-4 border rounded-lg",children:[e.jsx("div",{className:"text-2xl font-bold text-primary",children:n.totalDuties}),e.jsx("div",{className:"text-sm text-muted-foreground",children:"Toplam Nöbet"})]}),e.jsxs("div",{className:"text-center p-4 border rounded-lg",children:[e.jsx("div",{className:"text-2xl font-bold text-primary",children:h.length}),e.jsx("div",{className:"text-sm text-muted-foreground",children:"Aktif Doktor"})]}),e.jsxs("div",{className:"text-center p-4 border rounded-lg",children:[e.jsx("div",{className:"text-2xl font-bold text-primary",children:n.totalDuties>0?Math.round(n.totalDuties/h.length):0}),e.jsx("div",{className:"text-sm text-muted-foreground",children:"Ortalama Nöbet/Doktor"})]})]}),e.jsxs("div",{className:"space-y-4",children:[e.jsx("h4",{className:"font-semibold",children:"Vardiya Dağılımı"}),e.jsxs("div",{className:"grid grid-cols-3 gap-4",children:[e.jsxs("div",{className:"flex items-center justify-between p-3 bg-yellow-50 rounded-lg",children:[e.jsx("span",{className:"font-medium",children:"Sabah"}),e.jsx(N,{variant:"secondary",children:n.shiftStats.morning})]}),e.jsxs("div",{className:"flex items-center justify-between p-3 bg-orange-50 rounded-lg",children:[e.jsx("span",{className:"font-medium",children:"Akşam"}),e.jsx(N,{variant:"secondary",children:n.shiftStats.evening})]}),e.jsxs("div",{className:"flex items-center justify-between p-3 bg-blue-50 rounded-lg",children:[e.jsx("span",{className:"font-medium",children:"Gece"}),e.jsx(N,{variant:"secondary",children:n.shiftStats.night})]})]})]}),Object.keys(n.doctorStats).length>0&&e.jsxs("div",{className:"space-y-4 mt-6",children:[e.jsx("h4",{className:"font-semibold",children:"Doktor Bazlı Dağılım"}),e.jsx("div",{className:"space-y-2",children:Object.entries(n.doctorStats).map(([t,a])=>e.jsxs("div",{className:"flex items-center justify-between p-3 border rounded-lg",children:[e.jsx("span",{className:"font-medium",children:x(t)}),e.jsxs("div",{className:"flex space-x-2",children:[e.jsxs(N,{variant:"outline",children:["Toplam: ",a.total]}),e.jsxs(N,{variant:"secondary",children:["S: ",a.morning]}),e.jsxs(N,{variant:"secondary",children:["A: ",a.evening]}),e.jsxs(N,{variant:"secondary",children:["G: ",a.night]})]})]},t))})]})]})]}),e.jsxs(S,{children:[e.jsxs(P,{children:[e.jsx(F,{children:"Dışa Aktarma Seçenekleri"}),e.jsx(L,{children:"Nöbet programını farklı formatlarda indirin"})]}),e.jsx(E,{children:e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsx(S,{children:e.jsxs(E,{className:"p-6",children:[e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsx("div",{className:"p-3 bg-red-100 rounded-lg",children:e.jsx(W,{className:"h-6 w-6 text-red-600"})}),e.jsxs("div",{className:"flex-1",children:[e.jsx("h3",{className:"font-semibold",children:"HTML Formatı"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Yazdırılabilir HTML format, PDF olarak kaydedilebilir"})]})]}),e.jsxs(B,{className:"w-full mt-4",onClick:c,disabled:m||i.length===0,children:[e.jsx(V,{className:"mr-2 h-4 w-4"}),"HTML İndir"]})]})}),e.jsx(S,{children:e.jsxs(E,{className:"p-6",children:[e.jsxs("div",{className:"flex items-center space-x-4",children:[e.jsx("div",{className:"p-3 bg-green-100 rounded-lg",children:e.jsx(se,{className:"h-6 w-6 text-green-600"})}),e.jsxs("div",{className:"flex-1",children:[e.jsx("h3",{className:"font-semibold",children:"Excel Formatı"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"Düzenlenebilir format, analiz ve hesaplamalar için"})]})]}),e.jsxs(B,{className:"w-full mt-4",variant:"outline",onClick:r,disabled:m||i.length===0,children:[e.jsx(V,{className:"mr-2 h-4 w-4"}),"Excel İndir"]})]})})]})})]}),i.length===0&&e.jsx(S,{children:e.jsxs(E,{className:"flex flex-col items-center justify-center py-12",children:[e.jsx(H,{className:"h-12 w-12 text-muted-foreground mb-4"}),e.jsx("h3",{className:"text-lg font-semibold mb-2",children:"Nöbet programı bulunamadı"}),e.jsx("p",{className:"text-muted-foreground text-center mb-4",children:"Seçilen dönem için nöbet programı oluşturulmamış"})]})})]})};export{me as default};
