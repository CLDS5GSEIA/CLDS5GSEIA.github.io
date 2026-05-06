
const firebaseConfig = {
  apiKey: "AIzaSyA2Yp4hogk5Z7ga6JLfe6s7sUTPi3i5C84",
  authDomain: "ofertas-clds-seia.firebaseapp.com",
  projectId: "ofertas-clds-seia",
  storageBucket: "ofertas-clds-seia.firebasestorage.app",
  messagingSenderId: "237778187538",
  appId: "1:237778187538:web:314bfffb41fd2616b4afcb"
};

let fbApp = null;
let fbAuth = null;
let fbDb = null;
let currentUser = null;
let firebaseOnline = false;
let suppressRemoteSync = false;

function tecnicoAtual(){
  return currentUser?.email || "Técnico não identificado";
}

function serverTimestampSafe(){
  try{
    return firebase.firestore.FieldValue.serverTimestamp();
  }catch{
    return new Date().toISOString();
  }
}

async function syncOffersToFirestore(){
  if(!firebaseOnline || !currentUser || !fbDb || suppressRemoteSync) return;
  const existingSnap = await fbDb.collection("ofertas").get();
  const currentIds = new Set(offers.map(o=>o.id));
  const batch = fbDb.batch();

  existingSnap.forEach(doc=>{
    if(!currentIds.has(doc.id)){
      batch.delete(doc.ref);
    }
  });

  offers.forEach(o=>{
    const ref = fbDb.collection("ofertas").doc(o.id);
    batch.set(ref, {
      ...o,
      updatedAt: serverTimestampSafe(),
      updatedBy: tecnicoAtual()
    }, {merge:true});
  });

  await batch.commit();
}

async function loadOffersFromFirestore(){
  if(!firebaseOnline || !currentUser || !fbDb) return;
  suppressRemoteSync = true;
  try{
    const snap = await fbDb.collection("ofertas").get();
    offers = snap.docs.map(doc=>({id:doc.id, ...doc.data()}));
    offers.sort((a,b)=>String(b.dataConsulta||"").localeCompare(String(a.dataConsulta||"")));
    currentId = offers[0]?.id || null;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
    refreshAll();
  }catch(err){
    console.error(err);
    alert("Não foi possível carregar ofertas da base de dados. Verifique a ligação e as regras do Firebase.");
  }finally{
    suppressRemoteSync = false;
  }
}

async function registerTechnicianLogin(user){
  if(!fbDb || !user) return;
  await fbDb.collection("tecnicos").doc(user.uid).set({
    uid:user.uid,
    email:user.email || "",
    lastLoginAt: serverTimestampSafe(),
    updatedAt: serverTimestampSafe()
  }, {merge:true});
}

function showLoggedIn(user){
  document.body.classList.remove("auth-locked");
  document.body.classList.add("app-unlocked");
  const u = $("userEmailDisplay");
  if(u) u.textContent = user?.email || "Sessão iniciada";
  const err = $("loginError");
  if(err) err.textContent = "";
}

function showLoggedOut(){
  document.body.classList.add("auth-locked");
  document.body.classList.remove("app-unlocked");
  const u = $("userEmailDisplay");
  if(u) u.textContent = "Sessão";
  const err = $("loginError");
  if(err) err.textContent = "";
}

function firebaseErrorMessage(err){
  const code = err?.code || "";
  if(code.includes("wrong-password") || code.includes("invalid-credential")) return "E-mail ou palavra-passe inválidos.";
  if(code.includes("user-not-found")) return "Utilizador não encontrado.";
  if(code.includes("too-many-requests")) return "Demasiadas tentativas. Aguarde um pouco e tente novamente.";
  return err?.message || "Não foi possível iniciar sessão.";
}

let firebaseInitStarted=false;
function initFirebaseApp(){
  if(firebaseInitStarted) return;
  firebaseInitStarted=true;
  if(!window.firebase){
    console.error("Firebase SDK não carregou.");
    return;
  }
  fbApp = firebase.initializeApp(firebaseConfig);
  fbAuth = firebase.auth();
  fbDb = firebase.firestore();
  firebaseOnline = true;

  const loginForm = $("loginForm");
  if(loginForm){
    loginForm.addEventListener("submit", async ev=>{
      ev.preventDefault();
      const email = $("loginEmail").value.trim();
      const pass = $("loginPassword").value;
      const err = $("loginError");
      if(err) err.textContent = "A entrar...";
      try{
        await fbAuth.setPersistence(firebase.auth.Auth.Persistence.NONE);
        await fbAuth.signInWithEmailAndPassword(email, pass);
        if(err) err.textContent = "";
      }catch(e){
        if(err) err.textContent = firebaseErrorMessage(e);
      }
    });
  }

  const logout = $("btnLogout");
  if(logout){
    logout.addEventListener("click", async ()=>{
      await fbAuth.signOut();
    });
  }

  fbAuth.onAuthStateChanged(async user=>{
    currentUser = user;
    if(user){
      showLoggedIn(user);
      await registerTechnicianLogin(user);
      await loadOffersFromFirestore();
    }else{
      offers = [];
      currentId = null;
      showLoggedOut();
      refreshAll();
    }
  });
}



function capFirst(s=""){
  s = String(s || "").trim();
  if(!s) return "";
  return s.charAt(0).toLocaleUpperCase("pt-PT") + s.slice(1);
}
function capSentenceList(items){
  return items.map(capFirst);
}
function limitForPdf(items, max=7){
  return items.slice(0, max);
}

const STORAGE_KEY="radar_emprego_clds5g_ofertas_v1";const demoOffers=[{id:crypto.randomUUID(),titulo:"Analista de Laboratório (m/f/x)",entidade:"Randstad Portugal",localidade:"Seia",concelho:"Seia",fonte:"Randstad",referencia:"OTS-2026-175314",link:"https://www.randstad.pt/empregos/analista-de-laboratorio-mfx_seia_OTS-2026-175314/",dataOferta:"",dataConsulta:"2026-04-30",dataLimite:"2026-05-21",contrato:"Temporário",horario:"08h00–17h00",remuneracao:"Vencimento base + subsídio de alimentação",estado:"pendente",dataInativacao:"",motivoInativacao:"",dataValidacao:"",dataExportPdf:"",dataExportFacebook:"",importadaPor:tecnicoAtual(),validadaPor:"",exportPdfPor:"",exportFacebookPor:"",inativadaPor:"",contacto:"Candidatura através da página da oferta em randstad.pt",origemContacto:"Candidatura apenas pela plataforma",resumoFacebook:"Oferta na área da indústria, em Seia. Perfil com responsabilidade, rigor, conhecimentos de inglês e disponibilidade para horário 08h00–17h00. Apoio do CLDS disponível para candidatura.",funcoes:"Realização de análises laboratoriais; operações de suporte em produtos, matérias-primas e processos; registo e interpretação de dados; comunicação de resultados à produção; apoio na manutenção, limpeza e calibração de equipamentos laboratoriais; higienização de instrumentos, equipamentos e instalações.",requisitos:"Residência na zona de Seia; espírito de equipa, planeamento e organização; responsabilidade e rigor; conhecimentos de inglês; formação em Química, Biotecnologia, Bioquímica, Alimentar ou similar, preferencial; experiência em funções similares, preferencial.",condicoes:"Tipo de contrato: temporário; horário: 08h00–17h00; benefícios: vencimento base + subsídio de alimentação; data limite de candidatura: 21-05-2026.",observacoes:"Dados de teste do protótipo. Antes de publicar, confirmar novamente se a oferta continua ativa."}];let offers=[];let currentId=null;function loadOffers(){const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return [];try{return JSON.parse(raw)}catch{return []}}function saveOffers(){
  localStorage.setItem(STORAGE_KEY,JSON.stringify(offers));
  if(firebaseOnline && currentUser){
    syncOffersToFirestore().catch(err=>console.error("Erro ao sincronizar Firestore:", err));
  }
  refreshAll();
}function $(id){return document.getElementById(id)}function esc(s=""){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}function bullets(text=""){return String(text).split(/;|\n/).map(x=>x.trim()).filter(Boolean)}function todayPT(){return new Date().toISOString().slice(0,10)}function formatDate(d){if(!d)return"Não indicado";const[y,m,day]=d.split("-");return`${day}-${m}-${y}`}document.querySelectorAll(".tab").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.view)));document.querySelectorAll("[data-go]").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.go)));function showView(id){document.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active",t.dataset.view===id));document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));if(id==="ofertas")renderTable();if(id==="facebook")renderSelects();if(id==="pdf")renderSelects();if(id==="editor")loadForm(currentId)}$("btnNovaOferta").addEventListener("click",()=>createBlankOffer());$("btnAddManual").addEventListener("click",()=>createBlankOffer());function createBlankOffer(){const o={id:crypto.randomUUID(),titulo:"",entidade:"",localidade:"",concelho:"Seia",fonte:"",referencia:"",link:"",dataOferta:"",dataConsulta:todayPT(),dataLimite:"",contrato:"",horario:"",remuneracao:"",estado:"pendente",dataInativacao:"",motivoInativacao:"",dataValidacao:"",dataExportPdf:"",dataExportFacebook:"",importadaPor:tecnicoAtual(),validadaPor:"",exportPdfPor:"",exportFacebookPor:"",inativadaPor:"",contacto:"",origemContacto:"",resumoFacebook:"",funcoes:"",requisitos:"",condicoes:"",observacoes:""};offers.unshift(o);currentId=o.id;saveOffers();showView("editor")}function refreshAll(){renderStats();renderTable();renderSelects();loadForm(currentId)}function renderStats(){$("statTotal").textContent=offers.length;$("statAtivas").textContent=offers.filter(o=>o.estado==="ativa").length;$("statPendentes").textContent=offers.filter(o=>o.estado==="pendente").length;$("statExcluidas").textContent=offers.filter(o=>o.estado==="inativa").length}function mesAnoFromISO(date){
  if(!date) return "";
  const [y,m] = String(date).split("-");
  const meses = ["","janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"];
  return `${meses[Number(m)] || m}/${y}`;
}
function mesAnoInativacao(o){
  if(o.estado!=="inativa" || !o.dataInativacao) return "";
  return `Inativa desde ${mesAnoFromISO(o.dataInativacao)}`;
}
function monthValue(date){
  if(!date || String(date).length < 7) return "";
  return String(date).slice(0,7);
}
function offerSearchHaystack(o){
  return [
    o.titulo,o.entidade,o.localidade,o.concelho,o.fonte,o.referencia,o.contacto,
    o.link,o.area,o.observacoes,o.requisitos,o.condicoes,o.funcoes
  ].filter(Boolean).join(" ").toLowerCase();
}
function exportSummary(o){
  const parts = [];
  if(o.dataExportPdf) parts.push(`PDF: ${formatDate(o.dataExportPdf)}`);
  else parts.push("PDF: —");
  if(o.dataExportFacebook) parts.push(`Facebook: ${formatDate(o.dataExportFacebook)}`);
  else parts.push("Facebook: —");
  return parts.join("<br>");
}
function dateSummary(o){
  const lines = [];
  if(o.dataOferta) lines.push(`Oferta: ${formatDate(o.dataOferta)}`);
  if(o.dataConsulta) lines.push(`Consulta: ${formatDate(o.dataConsulta)}`);
  if(o.dataValidacao) lines.push(`Validação: ${formatDate(o.dataValidacao)}`);
  if(o.dataInativacao) lines.push(`Inativação: ${formatDate(o.dataInativacao)}`);
  return lines.join("<br>") || "—";
}
function normalizeSearchText(v){
  return String(v || "")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .toLowerCase()
    .trim();
}
function filteredOffers(){
  const q = normalizeSearchText($("histSearch")?.value || "");
  const estado = normalizeSearchText($("histEstado")?.value || "");
  const fonte = normalizeSearchText($("histFonte")?.value || "");
  const local = normalizeSearchText($("histLocal")?.value || "");
  const consultaMes = $("histConsultaMes")?.value || "";
  const inativaMes = $("histInativaMes")?.value || "";
  const exp = $("histExport")?.value || "";

  return offers.filter(o=>{
    const haystack = normalizeSearchText(offerSearchHaystack(o));
    const offerEstado = normalizeSearchText(o.estado || "");
    const offerFonte = normalizeSearchText(o.fonte || "");
    const offerLocal = normalizeSearchText([o.localidade,o.concelho].filter(Boolean).join(" "));

    if(q && !haystack.includes(q)) return false;
    if(estado && offerEstado !== estado) return false;
    if(fonte && !offerFonte.includes(fonte)) return false;
    if(local && !offerLocal.includes(local)) return false;
    if(consultaMes && monthValue(o.dataConsulta) !== consultaMes) return false;
    if(inativaMes && monthValue(o.dataInativacao) !== inativaMes) return false;
    if(exp==="pdf" && !o.dataExportPdf) return false;
    if(exp==="sem_pdf" && o.dataExportPdf) return false;
    if(exp==="facebook" && !o.dataExportFacebook) return false;
    if(exp==="sem_facebook" && o.dataExportFacebook) return false;
    return true;
  });
}
function renderTable(){
  const tbody=$("offersTable");
  if(!tbody) return;
  const list = filteredOffers();
  tbody.innerHTML=list.map(o=>`<tr>
    <td><span class="badge ${esc(o.estado)}">${estadoLabel(o.estado)}</span>${o.estado==="inativa"?`<br><small>${esc(mesAnoInativacao(o))}</small>`:""}${o.motivoInativacao?`<br><small>${esc(o.motivoInativacao)}</small>`:""}</td>
    <td>${esc(o.titulo||"Sem título")}</td>
    <td>${esc(o.entidade||"—")}</td>
    <td>${esc(o.localidade||"—")}</td>
    <td>${esc(o.fonte||"—")}${o.referencia?`<br><small>Ref./ID: ${esc(o.referencia)}</small>`:""}</td>
    <td><small>${dateSummary(o)}</small></td>
    <td><small>${exportSummary(o)}</small></td>
    <td>${validationSummary(o).short}</td>
    <td class="table-actions">
      <button class="ghost" onclick="editOffer('${o.id}')">Editar</button>
      <button class="ghost" onclick="goFb('${o.id}')">Facebook</button>
      <button class="ghost" onclick="goPdf('${o.id}')">PDF</button>
      <button class="ghost" onclick="markActive('${o.id}')">Ativar</button>
      <button class="ghost" onclick="quickInactivate('${o.id}')">Inativar</button>
    </td>
  </tr>`).join("");
  if(!list.length){
    tbody.innerHTML = `<tr><td colspan="9">Sem ofertas para os filtros selecionados.</td></tr>`;
  }
}
function estadoLabel(e){return e==="ativa"?"Ativa":e==="inativa"?"Inativa":e==="excluida"?"Excluída/erro":"Pendente"}
function editOffer(id){currentId=id;showView("editor")}function goFb(id){currentId=id;showView("facebook");$("selectFacebook").value=id;renderFacebook()}function goPdf(id){currentId=id;showView("pdf");$("selectPdf").value=id;renderPdf()}function getFormData(){const existing=offers.find(x=>x.id===$("offerId").value)||{};return{id:$("offerId").value||crypto.randomUUID(),area:existing.area||"",vagas:existing.vagas||"",titulo:$("titulo").value.trim(),entidade:$("entidade").value.trim(),localidade:$("localidade").value.trim(),concelho:$("concelho").value.trim(),fonte:$("fonte").value.trim(),referencia:$("referencia").value.trim(),link:$("link").value.trim(),dataOferta:$("dataOferta").value,dataConsulta:$("dataConsulta").value,dataLimite:$("dataLimite").value,contrato:$("contrato").value.trim(),horario:$("horario").value.trim(),remuneracao:$("remuneracao").value.trim(),estado:$("estado").value,dataInativacao:existing.dataInativacao||"",motivoInativacao:existing.motivoInativacao||"",dataValidacao:existing.dataValidacao||"",dataExportPdf:existing.dataExportPdf||"",dataExportFacebook:existing.dataExportFacebook||"",importadaPor:existing.importadaPor||tecnicoAtual(),validadaPor:existing.validadaPor||"",exportPdfPor:existing.exportPdfPor||"",exportFacebookPor:existing.exportFacebookPor||"",inativadaPor:existing.inativadaPor||"",contacto:$("contacto").value.trim(),origemContacto:$("origemContacto").value,resumoFacebook:$("resumoFacebook").value.trim(),funcoes:$("funcoes").value.trim(),requisitos:$("requisitos").value.trim(),condicoes:$("condicoes").value.trim(),observacoes:$("observacoes").value.trim()}}function loadForm(id){const o=offers.find(x=>x.id===id)||offers[0];if(!o)return;currentId=o.id;for(const[k,v]of Object.entries(o)){const el=$(k);if(el)el.value=v||""}$("offerId").value=o.id;renderValidation(o)}$("offerForm").addEventListener("submit",ev=>{ev.preventDefault();const o=getFormData();const idx=offers.findIndex(x=>x.id===o.id);if(idx>=0)offers[idx]=o;else offers.unshift(o);currentId=o.id;saveOffers();alert("Oferta guardada.")});["titulo","localidade","concelho","fonte","link","dataConsulta","estado","contacto","origemContacto"].forEach(id=>{$(id).addEventListener("input",()=>renderValidation(getFormData()))});$("btnValidarAtiva").addEventListener("click",()=>{
  const o=getFormData();
  const v=validationSummary(o);
  if(!v.ok){alert("A oferta ainda não cumpre os critérios para ser validada:\n\n"+v.issues.join("\n"));return}
  $("estado").value="ativa";
  const idx=offers.findIndex(x=>x.id===o.id);
  o.estado="ativa";
  o.dataValidacao=todayPT();
  o.validadaPor=tecnicoAtual();
  if(idx>=0){offers[idx]=o;currentId=o.id;saveOffers();loadForm(o.id);alert("Oferta validada como ativa.");}
  else $("offerForm").requestSubmit();
});$("btnInativar").addEventListener("click",()=>{
  const id=$("offerId").value;
  const idx=offers.findIndex(x=>x.id===id);
  if(idx<0){alert("Não há oferta selecionada.");return;}
  if(confirm("Marcar esta oferta como inativa? A oferta fica guardada no histórico, mas deixa de estar pronta para publicação.")){
    const motivo = prompt("Motivo da inativação:", "Oferta expirada / já não disponível") || "Marcada manualmente como inativa";
    const o=getFormData();
    o.estado="inativa";
    o.dataInativacao=todayPT();
    o.motivoInativacao=motivo;
    o.inativadaPor=tecnicoAtual();
    offers[idx]=o;
    currentId=o.id;
    saveOffers();
    loadForm(o.id);
    alert("Oferta marcada como inativa.");
  }
});
$("btnEliminarDefinitivo").addEventListener("click",()=>{
  const id=$("offerId").value;
  const o=offers.find(x=>x.id===id);
  if(!o){alert("Não há oferta selecionada.");return;}
  if(confirm("Eliminar definitivamente esta oferta? Esta ação remove a oferta da app e não deve ser usada para ofertas apenas expiradas/inativas.")){
    offers=offers.filter(x=>x.id!==id);
    currentId=offers[0]?.id||null;
    saveOffers();
    showView("ofertas");
  }
});function validationSummary(o){const issues=[];if(!o.titulo)issues.push("Falta função/título.");if(!o.localidade)issues.push("Falta localidade.");if(!o.concelho)issues.push("Falta concelho.");if(!o.fonte)issues.push("Falta fonte.");if(!o.link||!/^https?:\/\//i.test(o.link))issues.push("Falta link válido da oferta.");if(!o.dataConsulta)issues.push("Falta data de consulta.");if(!o.contacto&&!o.origemContacto)issues.push("Falta forma/contacto de candidatura.");if(o.estado==="inativa")issues.push("Oferta marcada como inativa.");if(o.estado==="excluida")issues.push("Oferta marcada como excluída/erro.");return{ok:issues.length===0,issues,short:issues.length===0?"<span class='pass'>Pronta</span>":`<span class='fail'>${issues.length} pendência(s)</span>`}}function renderValidation(o){const v=validationSummary(o);$("validationPanel").innerHTML=`<h4>Validação automática</h4>${v.ok?"<p class='pass'>✓ A oferta tem os campos mínimos para validação humana final.</p>":`<p class='fail'>Atenção: ${v.issues.length} pendência(s).</p><ul>${v.issues.map(i=>`<li>${esc(i)}</li>`).join("")}</ul>`}<p><strong>Regra:</strong> só ofertas ativas e verificáveis podem ser exportadas para publicação final.</p>`}function renderSelects(){const opts=offers.map(o=>`<option value="${o.id}">${esc(o.titulo||"Sem título")} — ${esc(o.localidade||"")}</option>`).join("");$("selectFacebook").innerHTML=opts;$("selectPdf").innerHTML=opts;if(currentId){$("selectFacebook").value=currentId;$("selectPdf").value=currentId}}$("selectFacebook").addEventListener("change",e=>{currentId=e.target.value;renderFacebook()});$("selectPdf").addEventListener("change",e=>{currentId=e.target.value;renderPdf()});$("btnRenderFacebook").addEventListener("click",renderFacebook);$("btnRenderPdf").addEventListener("click",renderPdf);$("btnPrintFacebook").addEventListener("click",exportFacebookPng);$("btnPrintPdf").addEventListener("click",()=>{const selectedId=$("selectPdf")?$("selectPdf").value:"";const o=offers.find(x=>x.id===selectedId)||offers[0];if(o)registerExport(o.id,"pdf");printView("pdf")});
function markActive(id){
  const idx=offers.findIndex(x=>x.id===id);
  if(idx<0) return;
  offers[idx].estado="ativa";
  offers[idx].dataValidacao=todayPT();
  offers[idx].validadaPor=tecnicoAtual();
  currentId=id;
  saveOffers();
  renderTable();
}
function quickInactivate(id){
  const idx=offers.findIndex(x=>x.id===id);
  if(idx<0) return;
  const motivo = prompt("Motivo da inativação:", "Oferta expirada / já não disponível") || "Marcada manualmente como inativa";
  offers[idx].estado="inativa";
  offers[idx].dataInativacao=todayPT();
  offers[idx].motivoInativacao=motivo;
  offers[idx].inativadaPor=tecnicoAtual();
  currentId=id;
  saveOffers();
  renderTable();
}
function registerExport(id, type){
  const idx=offers.findIndex(x=>x.id===id);
  if(idx<0) return;
  if(type==="pdf"){
    offers[idx].dataExportPdf=todayPT();
    offers[idx].exportPdfPor=tecnicoAtual();
  }
  if(type==="facebook"){
    offers[idx].dataExportFacebook=todayPT();
    offers[idx].exportFacebookPor=tecnicoAtual();
  }
  saveOffers();
}
function ensureExportAllowed(o){const v=validationSummary(o);if(o.estado!=="ativa")return`Esta oferta ainda não está validada como ativa. Estado atual: ${estadoLabel(o.estado)}.`;if(!v.ok)return`Esta oferta tem pendências: ${v.issues.join(" ")}`;return""}
function applyEmbeddedAssetsToPreview(root){
  if(!root || !window.CLDS_ASSETS_EMBEDDED) return;
  root.querySelectorAll('img').forEach(img=>{
    const src = img.getAttribute('src') || "";
    if(src.includes('logo_clds.png')) img.src = window.CLDS_ASSETS_EMBEDDED.logo;
    if(src.includes('eixo1_mao_icon.png') || src.includes('eixo1.png')) img.src = window.CLDS_ASSETS_EMBEDDED.eixo;
    if(src.includes('barra_cofinanciamento.png')) img.src = window.CLDS_ASSETS_EMBEDDED.cofin;
  });
}

function resumoParaFacebook(o){
  const isIEFP = String(o.fonte || "").toLowerCase().includes("iefp") || String(o.origemContacto || "").toLowerCase().includes("iefp");
  const req = bullets(o.requisitos).slice(0, 2).map(capFirst);
  const cond = bullets(o.condicoes).slice(0, 2).map(capFirst);
  const items = [
    `Função: ${o.titulo || "Oferta de emprego"}`,
    `Local: ${o.localidade || "Não indicado"}`,
    o.entidade ? `Entidade/Fonte: ${o.entidade}` : (o.fonte ? `Fonte: ${o.fonte}` : ""),
    o.area ? `Área: ${o.area}` : "",
    req.length ? `Perfil: ${req.join("; ")}` : "",
    cond.length ? `Condições: ${cond.join("; ")}` : "",
    isIEFP ? "Oferta disponível no IEFP Online." : "",
    "Mais informações e apoio à candidatura no CLDS 5G [Des]Envolver Seia."
  ].filter(Boolean);
  return items.slice(0, 7);
}

function renderFacebook(){
  const selectedId = $("selectFacebook") ? $("selectFacebook").value : "";
  const o = offers.find(x=>x.id===selectedId) || offers[0];
  if(!o){ $("facebookPreview").innerHTML = "<div style='padding:24px;background:#fff;border-radius:18px;'>Sem ofertas registadas para pré-visualização.</div>"; return; }
  const template = $("fbTemplate");
  if(!template){ $("facebookPreview").innerHTML = "<div style='padding:24px;background:#fff;border-radius:18px;'>Erro: template Facebook não encontrado.</div>"; return; }
  const node = template.content.cloneNode(true);
  const titleEl = node.querySelector("h3");
  if(titleEl) titleEl.textContent = `${o.titulo || "Oferta de emprego"} | ${o.localidade || "Local não indicado"}`;
  const ul = node.querySelector("ul");
  if(ul) ul.innerHTML = resumoParaFacebook(o).map(i=>`<li>${esc(i)}</li>`).join("");
  const block = ensureExportAllowed(o);
  const meta = node.querySelector(".fb-meta");
  if(meta) meta.innerHTML = `${block ? "⚠ " + esc(block) + "<br>" : ""}Informação consultada em ${formatDate(o.dataConsulta)}. Divulgação no âmbito do Eixo 1.`;
  $("facebookPreview").innerHTML = "";
  $("facebookPreview").appendChild(node);
  applyEmbeddedAssetsToPreview($("facebookPreview"));
}


const FB_ASSETS = {
  logo: (window.CLDS_ASSETS_EMBEDDED && window.CLDS_ASSETS_EMBEDDED.logo) || "assets/logo_clds.png",
  eixo: (window.CLDS_ASSETS_EMBEDDED && window.CLDS_ASSETS_EMBEDDED.eixo) || "assets/eixo1_mao_icon.png",
  cofin: (window.CLDS_ASSETS_EMBEDDED && window.CLDS_ASSETS_EMBEDDED.cofin) || "assets/barra_cofinanciamento.png"
};

function loadCanvasImage(src){
  return new Promise((resolve, reject)=>{
    const img = new Image();
    img.onload = ()=>resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function canvasWrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines){
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for(const word of words){
    const test = line ? line + " " + word : word;
    if(ctx.measureText(test).width <= maxWidth){
      line = test;
    } else {
      if(line) lines.push(line);
      line = word;
    }
  }
  if(line) lines.push(line);
  const finalLines = maxLines ? lines.slice(0, maxLines) : lines;
  if(maxLines && lines.length > maxLines && finalLines.length){
    let last = finalLines[finalLines.length - 1];
    while(ctx.measureText(last + "…").width > maxWidth && last.length > 0){
      last = last.slice(0, -1);
    }
    finalLines[finalLines.length - 1] = last + "…";
  }
  for(const l of finalLines){
    ctx.fillText(l, x, y);
    y += lineHeight;
  }
  return y;
}

function roundRectCanvas(ctx, x, y, w, h, r, fill, stroke){
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
  if(fill) ctx.fill();
  if(stroke) ctx.stroke();
}

function drawCanvasBullet(ctx, text, x, y, maxWidth, lineHeight, maxLines){
  ctx.fillStyle = "#2b238a";
  ctx.beginPath();
  ctx.arc(x, y - 8, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1f1f1f";
  return canvasWrapText(ctx, text, x + 24, y, maxWidth - 24, lineHeight, maxLines);
}

async function renderFacebookCanvas(o){
  const scale = 2;
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W * scale;
  canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);

  const purple = "#2b238a";
  const purple2 = "#4d459b";
  const gold = "#eca100";
  const blue = "#0d6fc7";
  const lightPurple = "#fbf9ff";
  const lightBlue = "#f8fbff";

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0,0,W,H);

  ctx.strokeStyle = "#ded9f0";
  ctx.lineWidth = 2;
  roundRectCanvas(ctx, 18, 18, W-36, H-36, 26, false, true);

  const logo = await loadCanvasImage(FB_ASSETS.logo);
  const eixo = await loadCanvasImage(FB_ASSETS.eixo);
  const cofin = await loadCanvasImage(FB_ASSETS.cofin);

  ctx.drawImage(logo, 58, 58, 170, 170);

  ctx.fillStyle = purple;
  ctx.font = "900 62px Segoe UI, Arial";
  ctx.fillText("OFERTA DE EMPREGO", 270, 95);

  ctx.fillStyle = purple2;
  ctx.font = "900 30px Segoe UI, Arial";
  const title = `${o.titulo || "Oferta de emprego"} | ${o.localidade || "Local não indicado"}`;
  canvasWrapText(ctx, title, 270, 135, 740, 36, 2);

  ctx.strokeStyle = gold;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(270, 210);
  ctx.lineTo(1015, 210);
  ctx.stroke();

  ctx.drawImage(eixo, 270, 235, 78, 78);
  ctx.fillStyle = gold;
  ctx.font = "900 31px Segoe UI, Arial";
  ctx.fillText("EIXO 1 —", 370, 258);
  ctx.fillStyle = purple;
  ctx.font = "900 23px Segoe UI, Arial";
  ctx.fillText("EMPREGO, FORMAÇÃO", 370, 288);
  ctx.fillText("E QUALIFICAÇÃO", 370, 316);

  ctx.fillStyle = lightPurple;
  ctx.strokeStyle = "#ddd8f0";
  ctx.lineWidth = 2;
  roundRectCanvas(ctx, 58, 365, 964, 535, 30, true, true);

  ctx.fillStyle = purple;
  ctx.font = "900 38px Segoe UI, Arial";
  ctx.fillText("OFERTA EM DESTAQUE", 100, 425);

  ctx.font = "400 25px Segoe UI, Arial";
  ctx.fillStyle = "#1f1f1f";
  const items = resumoParaFacebook(o).slice(0, 7);
  let y = 480;
  for(const item of items){
    y = drawCanvasBullet(ctx, item, 105, y, 850, 32, 2);
    y += 12;
    if(y > 860) break;
  }

  ctx.fillStyle = lightBlue;
  ctx.strokeStyle = "#c9e2fb";
  ctx.lineWidth = 2;
  roundRectCanvas(ctx, 58, 930, 964, 115, 26, true, true);
  ctx.fillStyle = blue;
  ctx.font = "900 32px Segoe UI, Arial";
  ctx.fillText("Precisa de apoio à candidatura?", 100, 975);
  ctx.font = "400 25px Segoe UI, Arial";
  ctx.fillText("Contacte o CLDS 5G [Des]Envolver Seia.", 100, 1010);

  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "#d5d0ec";
  ctx.lineWidth = 2;
  roundRectCanvas(ctx, 58, 1070, 964, 102, 24, true, true);
  ctx.fillStyle = purple;
  ctx.font = "900 22px Segoe UI, Arial";
  ctx.fillText("CLDS 5G [Des]Envolver Seia", 90, 1102);
  ctx.font = "400 17px Segoe UI, Arial";
  ctx.fillText("Edifício Elo Comum · Avenida 1º de Maio, nº 75, 6270-479 Seia", 90, 1130);
  ctx.fillText("Tlf: +351 238 310 230 · E-mail: clds5g@cm-seia.pt", 90, 1156);

  const block = ensureExportAllowed(o);
  ctx.fillStyle = purple;
  ctx.font = "800 13px Segoe UI, Arial";
  const meta = `${block ? "⚠ " + block + " · " : ""}Informação consultada em ${formatDate(o.dataConsulta)}. Divulgação no âmbito do Eixo 1.`;
  canvasWrapText(ctx, meta, 58, 1198, 964, 17, 2);

  const cofinW = 900;
  const cofinH = Math.min(78, cofin.height * (cofinW / cofin.width));
  ctx.drawImage(cofin, (W - cofinW) / 2, 1245, cofinW, cofinH);

  return canvas;
}


function safeOfferFilename(){
  const selectedId = $("selectFacebook") ? $("selectFacebook").value : "";
  const o = offers.find(x=>x.id===selectedId) || offers[0] || {};
  return (o.titulo || "oferta_emprego")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"_")
    .replace(/^_+|_+$/g,"")
    .slice(0,60) || "oferta_emprego";
}

async function exportFacebookPng(){
  const selectedId = $("selectFacebook") ? $("selectFacebook").value : "";
  const o = offers.find(x=>x.id===selectedId) || offers[0];
  if(!o){
    alert("Não há oferta selecionada para exportar.");
    return;
  }
  try{
    const canvas = await renderFacebookCanvas(o);
    const a = document.createElement("a");
    a.download = `${safeOfferFilename()}_facebook.png`;
    a.href = canvas.toDataURL("image/png");
    document.body.appendChild(a);
    a.click();
    a.remove();
    registerExport(o.id,"facebook");
  }catch(err){
    console.error(err);
    alert("Não foi possível exportar PNG: " + (err && err.message ? err.message : err) + "\n\nExperimente abrir a app fora do WinRAR, depois de extrair a pasta.");
  }
}

function renderPdf(){
  const selectedId = $("selectPdf") ? $("selectPdf").value : "";
  const o = offers.find(x=>x.id===selectedId) || offers[0];

  if(!o){
    $("pdfPreview").innerHTML = "<div style='padding:24px;background:#fff;border-radius:18px;'>Sem ofertas registadas para pré-visualização.</div>";
    return;
  }

  const template = $("pdfTemplate");
  if(!template){
    $("pdfPreview").innerHTML = "<div style='padding:24px;background:#fff;border-radius:18px;'>Erro: template PDF não encontrado.</div>";
    return;
  }

  const uniq = arr => {
    const seen = new Set();
    return arr.filter(x => {
      const key = String(x || "").trim().toLowerCase();
      if(!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const trimForPdf = (arr, max=6, maxChars=120) => uniq(arr)
    .map(x => String(x || '').trim())
    .filter(Boolean)
    .map(x => x.length > maxChars ? x.slice(0, maxChars - 1).trim() + '…' : x)
    .slice(0, max);

  const node = template.content.cloneNode(true);

  const isIEFP = String(o.fonte || "").toLowerCase().includes("iefp") || String(o.origemContacto || "").toLowerCase().includes("iefp");
  const titleEl = node.querySelector(".pdf-title");
  if(titleEl) titleEl.textContent = `${o.titulo || "Oferta de emprego"} | ${o.localidade || "Local não indicado"}`;

  const info = [
    ["Função", o.titulo || "Não indicado"],
    ["Entidade", o.entidade || "Não indicada"],
    ["Local", o.localidade || "Não indicado"],
    ["Área", o.area || "Não indicada"],
    ...(o.vagas ? [["N.º de vagas", o.vagas]] : []),
    ["Concelho / Distrito", [o.concelho || "", o.concelho && o.concelho.toLowerCase() !== "guarda" ? "Guarda" : ""].filter(Boolean).join(", ") || "Não indicado"],
    ["Fonte", o.fonte || "Não indicada"],
    [isIEFP ? "ID" : "Referência", o.referencia || "Não indicada"],
    ["Data da oferta", formatDate(o.dataOferta)],
    ["Data de consulta", formatDate(o.dataConsulta)]
  ];

  const infoDl = node.querySelector(".info-dl");
  if(infoDl) infoDl.innerHTML = info.map(([a,b])=>`<dt>${esc(a)}:</dt><dd>${esc(b)}</dd>`).join("");

  const reqItems = trimForPdf(capSentenceList(bullets(o.requisitos)), 7, 125);
  const funcItems = trimForPdf(capSentenceList(bullets(o.funcoes)), 5, 118);
  const condSource = uniq([
    ...bullets(o.condicoes),
    o.contrato ? `Contrato: ${o.contrato}` : "",
    o.horario ? `Horário: ${o.horario}` : "",
    o.remuneracao ? `Remuneração/benefícios: ${o.remuneracao}` : ""
  ].filter(Boolean));
  const condItems = trimForPdf(condSource.map(capFirst), 6, 120);

  const reqList = node.querySelector(".req-list");
  if(reqList) reqList.innerHTML = reqItems.length ? reqItems.map(i=>`<li>${esc(i)}</li>`).join("") : "<li>Não indicado na oferta consultada.</li>";

  const funcList = node.querySelector(".func-list");
  if(funcList) funcList.innerHTML = funcItems.length ? funcItems.map(i=>`<li>${esc(i)}</li>`).join("") : "";

  const funcSection = node.querySelector(".pdf-card-func");
  if(funcSection && !funcItems.length) funcSection.remove();

  const condList = node.querySelector(".cond-list");
  if(condList) condList.innerHTML = condItems.length ? condItems.map(i=>`<li>${esc(i)}</li>`).join("") : "<li>Não indicado na oferta consultada.</li>";

  const linkHtml = o.link ? `<a href="${esc(o.link)}">${esc(o.link)}</a>` : "";
  const candidatura = [
    ["Contacto / forma de candidatura", o.contacto || (isIEFP ? "Consultar/candidatar através do IEFP Online." : "Não indicado")],
    o.origemContacto ? ["Origem do contacto", o.origemContacto] : null,
    linkHtml ? ["Link da oferta", linkHtml] : null
  ].filter(Boolean);

  const applyDl = node.querySelector(".apply-dl");
  if(applyDl) applyDl.innerHTML = candidatura.map(([a,b])=>`<dt>${esc(a)}:</dt><dd>${b}</dd>`).join("");

  const consultaEl = node.querySelector(".pdf-consulta");
  if(consultaEl) consultaEl.textContent = `Informação consultada em ${formatDate(o.dataConsulta)}. Divulgação no âmbito do Eixo 1.`;

  const iefpNote = node.querySelector(".pdf-iefp-note");
  if(iefpNote){
    iefpNote.textContent = isIEFP ? "Oferta disponível no IEFP Online. Para apoio à candidatura, recomenda-se contacto com o IEFP da sua área de residência." : "";
    if(!isIEFP) iefpNote.style.display = "none";
  }

  const block = ensureExportAllowed(o);
  if(block){
    const note = node.querySelector(".pdf-direct-note");
    if(note) note.textContent = `Atenção: ${block}`;
  }

  $("pdfPreview").innerHTML = "";
  $("pdfPreview").appendChild(node);
  applyEmbeddedAssetsToPreview($("pdfPreview"));
}

function printView(id){document.querySelectorAll(".view").forEach(v=>v.classList.remove("printing"));$(id).classList.add("printing");window.print();setTimeout(()=>$(id).classList.remove("printing"),500)}
function buildSearchUrl(fonte, keyword, localidade, dataMin){
  const qParts = [];
  if(keyword) qParts.push(keyword);
  if(localidade) qParts.push(localidade);
  const q = qParts.join(" ").trim();

  const enc = encodeURIComponent;
  const fonteNorm = normalizeSearchText(fonte);

  if(fonteNorm.includes("iefp")){
    // Link público de pesquisa do IEFP. A pesquisa pode exigir ajuste manual dentro da plataforma.
    return `https://iefponline.iefp.pt/IEFP/pesquisas/search.do?cat=ofertaEmprego`;
  }

  if(fonteNorm.includes("net-empregos") || fonteNorm.includes("net empregos")){
    return `https://www.net-empregos.com/pesquisa-empregos.asp?chaves=${enc(q)}&cidade=Guarda`;
  }

  if(fonteNorm.includes("randstad")){
    return `https://www.randstad.pt/empregos/q-${enc(keyword || "emprego")}/${localidade ? `?localidade=${enc(localidade)}` : ""}`;
  }

  if(fonteNorm.includes("manpower")){
    return `https://www.manpowergroup.pt/empregos/?search=${enc(q)}`;
  }

  if(fonteNorm.includes("bep") || fonteNorm.includes("emprego publico") || fonteNorm.includes("emprego público")){
    // BEP — Bolsa de Emprego Público. A pesquisa/filtragem pode exigir ajuste manual no portal.
    return `https://www.bep.gov.pt/`;
  }

  if(fonteNorm.includes("sapo")){
    return `https://emprego.sapo.pt/pesquisa?keyword=${enc(q)}`;
  }

  if(fonteNorm.includes("indeed")){
    return `https://pt.indeed.com/jobs?q=${enc(keyword || "")}&l=${enc(localidade || "Seia")}`;
  }

  if(fonteNorm.includes("expresso")){
    return `https://expressoemprego.pt/pesquisa?q=${enc(q)}`;
  }

  return `https://www.google.com/search?q=${enc(q + " emprego")}`;
}

function fonteSearchHelp(fonte){
  const f = normalizeSearchText(fonte);
  if(f.includes("iefp")){
    return "No IEFP Online, confirme a localidade/concelho e copie o detalhe completo da oferta. Algumas pesquisas exigem ajuste manual dentro da plataforma.";
  }
  if(f.includes("net")){
    return "No Net-Empregos, abra a oferta pretendida, confirme que está ativa e copie o texto completo da página.";
  }
  if(f.includes("bep") || f.includes("emprego publico") || f.includes("emprego público")){
    return "No BEP / Emprego Público, confirme o procedimento, entidade, carreira/categoria, local de trabalho, prazo e forma de candidatura antes de importar.";
  }
  if(f.includes("randstad") || f.includes("manpower") || f.includes("indeed") || f.includes("sapo")){
    return "Abra a oferta, confirme a validade e copie a informação relevante para a área de importação.";
  }
  return "Confirme sempre a fonte, o link, a validade e os contactos antes de criar a ficha.";
}

function renderPesquisaAssistida(){
  const fonte = $("fFonte").value || "IEFP Online";
  const localidade = $("fLocalidade").value || "Seia";
  const keyword = $("fKeyword").value || "";
  const dataMin = $("fData").value || "";
  const url = buildSearchUrl(fonte, keyword, localidade, dataMin);

  $("resultadosPesquisa").innerHTML = `
    <h3>Pesquisa assistida</h3>
    <div class="found assisted-search-result">
      <div>
        <h4>${esc(fonte)}</h4>
        <p><strong>Localidade/concelho:</strong> ${esc(localidade || "Não indicado")}</p>
        <p><strong>Palavra-chave:</strong> ${esc(keyword || "Sem palavra-chave")}</p>
        ${dataMin ? `<p><strong>Publicadas a partir de:</strong> ${formatDate(dataMin)}</p>` : ""}
        <p class="muted">${esc(fonteSearchHelp(fonte))}</p>
      </div>
      <div class="assist-actions">
        <a class="primary link-button" href="${esc(url)}" target="_blank" rel="noopener noreferrer">Abrir pesquisa na fonte</a>
        <button type="button" class="ghost" id="btnPrepararImportacao">Preparar importação</button>
      </div>
    </div>
    <div class="notice small">
      <strong>Como usar:</strong> abra a pesquisa, escolha uma oferta ativa, copie o texto completo, cole em “Copiar/colar texto de uma oferta” e carregue em “Organizar texto no nosso layout”.
    </div>
  `;

  const prep = $("btnPrepararImportacao");
  if(prep){
    prep.addEventListener("click", ()=>{
      $("pasteFonte").value = fonte;
      $("rawOfferText").focus();
      document.querySelector(".paste-import-box")?.scrollIntoView({behavior:"smooth", block:"start"});
    });
  }
}

$("btnSimularPesquisa").addEventListener("click", renderPesquisaAssistida);
refreshAll();renderFacebook();renderPdf();




// --- Copiar/colar oferta: organização automática ---
function normalizeWhitespace(s){
  return String(s||"").replace(/\r/g,"\n").replace(/[ \t]+/g," ").replace(/\n{3,}/g,"\n\n").trim();
}
function findEmail(text){
  const m = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return m ? m[0] : "";
}
function findPhone(text){
  const m = text.match(/(?:\+351\s*)?(?:9\d{2}|2\d{2})[\s.-]?\d{3}[\s.-]?\d{3}/);
  return m ? m[0] : "";
}
function findRef(text){
  const patterns = [
    /Ref(?:er[êe]ncia)?\.?\s*[:#]?\s*([A-Z0-9._/-]{4,})/i,
    /ID da Oferta\s*[:#]?\s*([A-Z0-9._/-]{4,})/i,
    /refer[êe]ncia\s*[:#]?\s*([A-Z0-9._/-]{4,})/i
  ];
  for(const p of patterns){
    const m = text.match(p);
    if(m) return m[1].trim();
  }
  return "";
}

function inferAreaAndEntityFromRef(lines){
  const cleanLine = s => String(s || "")
    .replace(/[\u2022\u25cf\u25aa\uf0b7]/g, "")   // bullets: • ● ▪ 
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const isNoise = s => {
    const x = cleanLine(s);
    return !x ||
      /^(detalhe da oferta|oferta de emprego|proposta\s*\d*|guarda|portugal)$/i.test(x) ||
      /^[-–—]+$/.test(x);
  };

  const refIndex = lines.findIndex(l => {
    const x = cleanLine(l);
    return /^Ref\s*:/i.test(x) || /^Refer[êe]ncia\s*:/i.test(x);
  });

  if(refIndex < 0) return {area:"", entidade:""};

  const after = lines
    .slice(refIndex + 1)
    .map(cleanLine)
    .filter(x => !isNoise(x));

  // Net-Empregos: Ref -> Área/Categoria -> Entidade
  return {
    area: after[0] || "",
    entidade: after[1] || ""
  };
}

function inferEntityExplicit(text){
  const cleaned = String(text || "")
    .replace(/[\u2022\u25cf\u25aa\uf0b7]/g, "")
    .replace(/\u00a0/g, " ");

  const patterns = [
    /(?:Entidade|Empresa|Empregador)\s*[:\-]\s*([^\n]+)/i,
    /(?:^|\n)\s*([^\n]{3,90}\b(?:LDA|Lda|Unipessoal|UNIPESSOAL|SA|S\.A\.|LDA\.|Limitada|LIMITADA|Associação|ASSOCIAÇÃO|Município|MUNICÍPIO|Museu|MUSEU|Portugal|PORTUGAL)\b[^\n]*)/m
  ];

  for(const p of patterns){
    const m = cleaned.match(p);
    if(m) return String(m[1]).replace(/\s+/g," ").trim();
  }
  return "";
}

function findDatePT(text){
  const m = text.match(/\b(\d{1,2})[-/](\d{1,2})[-/](20\d{2})\b/);
  if(!m) return "";
  return `${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`;
}
function inferLocal(text){
  const locais = ["Seia","Gouveia","Guarda","Nelas","Oliveira do Hospital","Mangualde","Manteigas","Celorico da Beira","Fornos de Algodres","Loriga","Sabugueiro","São Romão","Pinhanços","Sazes da Beira","Vide","Cabeça","Carragozela","Várzea de Meruge","Vila Chã","São Martinho","Valezim","Travancinha","Sandomil","São Martinho","Sameice"];
  const lower = text.toLowerCase();
  return locais.find(l => lower.includes(l.toLowerCase())) || "";
}
function inferContrato(text){
  const t = text.toLowerCase();
  if(t.includes("sem termo")) return "Sem termo";
  if(t.includes("termo certo")) return "Termo certo";
  if(t.includes("termo incerto")) return "Termo incerto";
  if(t.includes("temporário") || t.includes("temporario")) return "Temporário";
  if(t.includes("part-time") || t.includes("part time")) return "Part-time";
  if(t.includes("full-time") || t.includes("full time") || t.includes("tempo completo")) return "Tempo completo";
  return "";
}
function inferHorario(text){
  const h = text.match(/\b([01]?\d|2[0-3])[:hH][0-5]?\d?\s*(?:-|–|às|a)\s*([01]?\d|2[0-3])[:hH][0-5]?\d?\b/);
  if(h) return h[0].replace(/\s+/g," ");
  const m = text.match(/Hor[áa]rio\s*[:\-]?\s*([^\n]+)/i);
  return m ? m[1].trim() : "";
}
function inferRemuneracao(text){
  const m = text.match(/(?:Remunera[çc][ãa]o(?: base)?(?: il[ií]quida)?|Vencimento(?: base)?)\s*[:\-]?\s*([^\n;]+)/i);
  if(m) return m[0].replace(/\s+/g," ").trim();
  const euro = text.match(/\b\d{3,4}\s*(?:€|EUR)(?:\/m[eê]s)?/i);
  return euro ? euro[0].trim() : "";
}
function sectionBetween(text, startWords, stopWords){
  const lower = text.toLowerCase();
  let start = -1;
  for(const w of startWords){
    const idx = lower.indexOf(w.toLowerCase());
    if(idx >= 0 && (start < 0 || idx < start)) start = idx;
  }
  if(start < 0) return "";
  let end = text.length;
  for(const w of stopWords){
    const idx = lower.indexOf(w.toLowerCase(), start + 5);
    if(idx >= 0 && idx < end) end = idx;
  }
  return text.slice(start, end).trim();
}
function cleanBullets(s){
  if(!s) return "";
  return normalizeWhitespace(s)
    .replace(/[🔧📍📩]/g,"")
    .split(/\n|•|;|- /)
    .map(x => x.replace(/^(Perfil|Requisitos|Funções|Função|Responsabilidades|Condições|Oferta|Oferecemos|Benefícios|Detalhe da Oferta|Descrição da Função|Principais Benefícios)\s*:?\s*/i,"").trim())
    .filter(x => x.length > 3)
    .slice(0, 12)
    .join("; ");
}

function getNextValue(lines, label){
  const clean = s => String(s || "")
    .replace(/[\u2022\u25cf\u25aa\uf0b7]/g,"")
    .replace(/\u00a0/g," ")
    .replace(/\s+/g," ")
    .trim();

  const norm = s => clean(s).toLowerCase().replace(/:$/,"").trim();
  const lab = norm(label).replace(/:$/,"");

  for(let i=0;i<lines.length;i++){
    const raw = clean(lines[i]);
    const rawNorm = norm(raw);

    // Caso "Habilitações Mínimas:4.º ano" ou "Tipo de contrato:Termo certo"
    const sameLine = raw.match(/^([^:]+):\s*(.+)$/);
    if(sameLine && norm(sameLine[1]) === lab){
      return clean(sameLine[2]);
    }

    // Caso label numa linha e valor na linha seguinte
    if(rawNorm === lab){
      for(let j=i+1;j<lines.length;j++){
        const val = clean(lines[j]);
        if(val) return val;
      }
    }
  }
  return "";
}

function isIEFPText(text){
  return /ID da Oferta/i.test(text) && /Condições Requeridas/i.test(text);
}

function parseIEFPText(raw, fonte, link){
  const text = normalizeWhitespace(raw);
  const lines = text.split("\n").map(x=>x.replace(/[•●▪]/g,"").trim()).filter(Boolean);
  const propIndex = lines.findIndex(l => /^Proposta\s*\d+/i.test(l));
  let titulo = "";
  for(let i = propIndex >= 0 ? propIndex + 1 : 0; i < lines.length; i++){
    if(!/^(ID da Oferta|Condições Requeridas|Habilitações|Contrato de Trabalho|Horário Trabalho)$/i.test(lines[i])){
      titulo = lines[i].replace(/\s*\(M\/F\)\s*$/i, " (M/F)").trim();
      break;
    }
  }

  let local = "";
  const titleIndex = lines.findIndex(l => l === titulo);
  if(titleIndex >= 0 && lines[titleIndex + 1]){
    local = lines[titleIndex + 1].replace(/[;:]/g,"").replace(/^U\.F\.\s*/i,"U.F. ").trim();
  }
  if(!local) local = inferLocal(text) || "Seia";

  const ref = getNextValue(lines, "ID da Oferta") || findRef(text);
  const vagas = getNextValue(lines, "N.º de Vagas");
  const hMin = getNextValue(lines, "Habilitações Mínimas:");
  const hMax = getNextValue(lines, "Habilitações Máximas:");
  const formacao = getNextValue(lines, "Formação Profissional Exigida:");
  const cert = getNextValue(lines, "Certificação Profissional:");
  const experiencia = getNextValue(lines, "Experiência anterior:");
  const tempoExp = getNextValue(lines, "Tempo mínimo de experiência:");
  const carta = getNextValue(lines, "Tipo(s) de carta condução:");
  const transporte = getNextValue(lines, "Transporte Próprio:");
  const higiene = getNextValue(lines, "Normas específicas de higiene e segurança no trabalho:");
  const perfil = getNextValue(lines, "Descrição do Perfil");
  const contrato = getNextValue(lines, "Tipo de contrato:");
  const duracao = getNextValue(lines, "Duração:");
  const regime = getNextValue(lines, "Regime de trabalho:");
  const regHorario = getNextValue(lines, "Regime Horário:");
  const horas = getNextValue(lines, "Nº de Horas:");
  const horario = getNextValue(lines, "Horário:");
  const descanso = getNextValue(lines, "Descanso Semanal:");
  const prestacao = getNextValue(lines, "Formas de Prestação de Trabalho:");
  const remun = getNextValue(lines, "Remuneração base ilíquida:");
  let subsidio = getNextValue(lines, "Subsídio de refeição:");
  const subIdx = lines.findIndex(l => String(l || "").toLowerCase().includes("subsídio de refeição"));
  if(subIdx >= 0 && lines[subIdx + 1] && /eur|€|dia/i.test(lines[subIdx + 1]) && !/eur|€|dia/i.test(subsidio)){
    subsidio = `${subsidio} ${String(lines[subIdx + 1]).trim()}`.trim();
  }
  const regalias = getNextValue(lines, "Outras Regalias:");

  const reqs = [
    perfil ? `Descrição do perfil: ${perfil}` : "",
    hMin ? `Habilitações mínimas: ${hMin}` : "",
    hMax ? `Habilitações máximas: ${hMax}` : "",
    formacao ? `Formação profissional exigida: ${formacao}` : "",
    cert ? `Certificação profissional: ${cert}` : "",
    experiencia ? `Experiência anterior: ${experiencia}${tempoExp ? " (" + tempoExp + ")" : ""}` : "",
    carta ? `Carta de condução: ${carta}` : "",
    transporte ? `Transporte próprio: ${transporte}` : "",
    higiene ? `Normas de higiene e segurança: ${higiene}` : ""
  ].filter(Boolean).join("; ");

  const conds = [
    contrato ? `Tipo de contrato: ${contrato}` : "",
    duracao ? `Duração: ${duracao}` : "",
    regime ? `Regime de trabalho: ${regime}` : "",
    regHorario ? `Regime horário: ${regHorario}` : "",
    horas ? `N.º de horas: ${horas}` : "",
    horario ? `Horário: ${horario}` : "",
    descanso ? `Descanso semanal: ${descanso}` : "",
    prestacao ? `Forma de prestação: ${prestacao}` : "",
    remun ? `Remuneração base ilíquida: ${remun}` : "",
    subsidio ? `Subsídio de refeição: ${subsidio}` : "",
    regalias ? `Outras regalias: ${regalias}` : ""
  ].filter(Boolean).join("; ");

  return {
    id: crypto.randomUUID(),
    titulo: titulo || "Oferta IEFP importada por texto",
    entidade: "IEFP Online",
    area: "IEFP / Oferta pública de emprego",
    vagas: vagas || "",
    localidade: local,
    concelho: "Seia",
    fonte: "IEFP",
    referencia: ref,
    link: link || "",
    dataOferta: "",
    dataConsulta: todayPT(),
    dataLimite: "",
    contrato,
    horario: horario || regHorario,
    remuneracao: remun,
    estado: "pendente",
    contacto: ref ? `Consultar/candidatar através do IEFP Online, pesquisando pelo ID da oferta: ${ref}` : "Consultar/candidatar através do IEFP Online.",
    origemContacto: "IEFP Online",
    tecnicoResponsavel: "",
    resumoFacebook: `Oferta IEFP em ${local}. ${vagas ? vagas + " vaga(s)." : ""}`.trim(),
    funcoes: "",
    requisitos: reqs,
    condicoes: conds,
    observacoes: "Oferta IEFP organizada automaticamente a partir de texto copiado/colado. Validar manualmente no IEFP Online antes de divulgar."
  };
}



function normalizeHeadingLine(line){
  return String(line || "")
    .replace(/[\u2022\u25cf\u25aa\uf0b7]/g,"")
    .replace(/[🔧📍📩]/g,"")
    .replace(/\u00a0/g," ")
    .replace(/\s+/g," ")
    .trim();
}

function isHeadingLine(line, names){
  const x = normalizeHeadingLine(line).toLowerCase().replace(/[:：]+$/,"").trim();
  return names.some(n => x === n.toLowerCase());
}

function extractSectionByHeadings(text, startNames, stopNames){
  const lines = normalizeWhitespace(text).split("\n");
  let start = -1;
  for(let i=0;i<lines.length;i++){
    if(isHeadingLine(lines[i], startNames)){
      start = i + 1;
      break;
    }
  }
  if(start < 0) return "";

  let end = lines.length;
  for(let i=start;i<lines.length;i++){
    if(isHeadingLine(lines[i], stopNames)){
      end = i;
      break;
    }
  }

  return lines.slice(start, end)
    .map(normalizeHeadingLine)
    .filter(Boolean)
    .join("\n");
}



function isBEPText(text){
  return /(BEP|Bolsa de Emprego P[úu]blico|Caracteriza[çc][ãa]o do Posto de Trabalho|Rela[çc][ãa]o Jur[íi]dica|Procedimento Concursal|Oferta de Emprego P[úu]blico)/i.test(text);
}

function getFieldAfterLabel(lines, labels){
  const labs = labels.map(x => normalizeSearchText(x));
  const isLabel = s => labs.includes(normalizeSearchText(String(s||"").replace(/:$/,"")));
  for(let i=0;i<lines.length;i++){
    const line = String(lines[i]||"").trim();
    const same = line.match(/^([^:]{2,80}):\s*(.+)$/);
    if(same && labs.includes(normalizeSearchText(same[1]))){
      return same[2].trim();
    }
    if(isLabel(line)){
      for(let j=i+1;j<Math.min(lines.length, i+5);j++){
        const v = String(lines[j]||"").trim();
        if(v && !/^[A-ZÁÉÍÓÚÂÊÔÃÕÇ\s\/-]{3,}:?$/.test(v)) return v;
        if(v && j === i+1) return v;
      }
    }
  }
  return "";
}

function sectionAfterAnyLabel(lines, labels, stopLabels){
  const labs = labels.map(x => normalizeSearchText(x));
  const stops = stopLabels.map(x => normalizeSearchText(x));
  const normLine = s => normalizeSearchText(String(s||"").replace(/:$/,""));
  let start = -1;
  for(let i=0;i<lines.length;i++){
    const n = normLine(lines[i]);
    if(labs.includes(n) || labs.some(l => n.startsWith(l))){
      start = i + 1;
      break;
    }
  }
  if(start < 0) return "";
  let end = lines.length;
  for(let i=start;i<lines.length;i++){
    const n = normLine(lines[i]);
    if(stops.includes(n) || stops.some(s => n.startsWith(s))){
      end = i;
      break;
    }
  }
  return lines.slice(start,end).join("\n").trim();
}

function parseBEPText(raw, fonte, link){
  const text = normalizeWhitespace(raw);
  const strip = s => String(s || "")
    .replace(/[\u2022\u25cf\u25aa\uf0b7]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const lines = text.split("\n").map(strip).filter(Boolean);

  const ref = getFieldAfterLabel(lines, ["Código da Oferta", "Código BEP", "Referência", "Ref."]) || findRef(text);
  const entidade = getFieldAfterLabel(lines, ["Entidade", "Organismo", "Serviço", "Entidade Empregadora", "Órgão/Serviço"]) || inferEntityExplicit(text);
  const carreira = getFieldAfterLabel(lines, ["Carreira", "Carreira/Categoria", "Categoria", "Cargo"]);
  const local = getFieldAfterLabel(lines, ["Local Trabalho", "Local de Trabalho", "Localidade", "Distrito", "Concelho"]) || inferLocal(text);
  const vagas = getFieldAfterLabel(lines, ["Número de Postos de Trabalho", "N.º de Postos", "N.º de Vagas", "Número de vagas"]);
  const prazo = getFieldAfterLabel(lines, ["Prazo de candidatura", "Data limite", "Prazo"]);
  const contrato = getFieldAfterLabel(lines, ["Tipo de vínculo", "Relação Jurídica", "Relação Jurídica de Emprego Público", "Vínculo"]);
  const habil = getFieldAfterLabel(lines, ["Habilitação Literária", "Habilitações", "Nível Habilitacional"]);
  const candidatura = getFieldAfterLabel(lines, ["Forma de candidatura", "Formalização das candidaturas", "Candidatura"]);
  const dataOferta = findDatePT(text);

  const tituloCandidates = [
    getFieldAfterLabel(lines, ["Posto de Trabalho", "Caracterização do Posto de Trabalho", "Oferta", "Título"]),
    carreira,
    lines.find(l => /procedimento concursal|técnico|assistente|carreira|categoria/i.test(l) && l.length < 120)
  ].filter(Boolean);
  let titulo = tituloCandidates[0] || "Oferta de emprego público";
  if(carreira && !titulo.toLowerCase().includes(carreira.toLowerCase())) titulo = `${carreira} — ${titulo}`;

  const stop = ["Requisitos", "Habilitação", "Habilitações", "Perfil", "Métodos de Seleção", "Forma de candidatura", "Prazo", "Local de Trabalho", "Remuneração", "Observações"];
  const funcoesRaw = sectionAfterAnyLabel(lines, ["Caracterização do Posto de Trabalho", "Descrição do posto de trabalho", "Atividades", "Funções"], stop);
  const requisitosRaw = [
    habil ? `Habilitações: ${habil}` : "",
    sectionAfterAnyLabel(lines, ["Requisitos", "Requisitos de Admissão", "Perfil"], ["Métodos de Seleção", "Forma de candidatura", "Prazo", "Caracterização", "Local de Trabalho", "Remuneração"])
  ].filter(Boolean).join("\n");
  const condicoesRaw = [
    contrato ? `Vínculo: ${contrato}` : "",
    vagas ? `N.º de postos/vagas: ${vagas}` : "",
    prazo ? `Prazo de candidatura: ${prazo}` : "",
    getFieldAfterLabel(lines, ["Remuneração", "Posição Remuneratória", "Remuneração Base"]) ? `Remuneração: ${getFieldAfterLabel(lines, ["Remuneração", "Posição Remuneratória", "Remuneração Base"])}` : ""
  ].filter(Boolean).join("\n");

  const candidaturaSection = extractByHeading(
    ["Candidatura", "Candidaturas", "Candidate-se", "Envio de CV", "Enviar CV", "Forma de candidatura", "Formalização das candidaturas"],
    ["Funções", "Função", "Responsabilidades", "Principais responsabilidades", "Perfil", "Perfil pretendido", "Requisitos", "Condições", "Oferta", "Oferecemos", "Benefícios", "Local"]
  );

  let contacto = "";
  let origemContacto = "";
  const email = findEmail(text);
  if(email){
    contacto = email;
    origemContacto = "Visível publicamente na oferta";
  } else if(candidatura){
    contacto = candidatura;
    origemContacto = "Visível publicamente na oferta";
  } else if(link){
    contacto = "Candidatura através da plataforma BEP / Emprego Público";
    origemContacto = "Candidatura apenas pela plataforma";
  }

  return {
    id: crypto.randomUUID(),
    titulo: titulo || "Oferta BEP / Emprego Público",
    entidade,
    area: carreira || "Emprego Público",
    vagas: vagas || "",
    localidade: local,
    concelho: local || "Seia",
    fonte: fonte || "BEP / Emprego Público",
    referencia: ref,
    link: link || "",
    dataOferta,
    dataConsulta: todayPT(),
    dataLimite: "",
    contrato,
    horario: "",
    remuneracao: "",
    estado: "pendente",
    dataInativacao:"",
    motivoInativacao:"",
    dataValidacao:"",
    dataExportPdf:"",
    dataExportFacebook:"",
    importadaPor:tecnicoAtual(),
    validadaPor:"",
    exportPdfPor:"",
    exportFacebookPor:"",
    inativadaPor:"",
    contacto,
    origemContacto,
    tecnicoResponsavel: "",
    resumoFacebook: [
      entidade ? `Entidade: ${entidade}.` : "",
      local ? `Local: ${local}.` : "",
      carreira ? `Carreira/categoria: ${carreira}.` : "",
      prazo ? `Prazo de candidatura: ${prazo}.` : ""
    ].filter(Boolean).join(" "),
    funcoes: cleanBullets(funcoesRaw),
    requisitos: cleanBullets(requisitosRaw),
    condicoes: cleanBullets(condicoesRaw),
    observacoes: "Oferta BEP / Emprego Público organizada automaticamente a partir de texto copiado/colado. Validar manualmente no portal oficial antes de publicar."
  };
}


function parseRawOffer(raw, fonte, link){
  const text = normalizeWhitespace(raw);

  if(isBEPText(text) || normalizeSearchText(fonte || "").includes("bep") || normalizeSearchText(fonte || "").includes("emprego publico")){
    return parseBEPText(raw, fonte, link);
  }

  if(isIEFPText(text) || String(fonte || "").toLowerCase().includes("iefp")){
    return parseIEFPText(raw, fonte, link);
  }

  const strip = s => String(s || "")
    .replace(/[\u2022\u25cf\u25aa\uf0b7]/g, "")   // • ● ▪ 
    .replace(/[🔧📍📩📢🍽️🔹✅➡️]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const lines = text.split("\n").map(strip).filter(Boolean);

  // Título: primeira linha útil
  let titulo = "";
  for(const line of lines){
    if(/^(proposta\s*\d*|detalhe da oferta|oferta de emprego|oferta de emprego público|bep|guarda|portugal)$/i.test(line)) continue;
    if(/^Ref\s*:/i.test(line)) continue;
    if(/^\d{1,2}[-/]\d{1,2}[-/]20\d{2}/.test(line)) continue;
    titulo = line;
    break;
  }

  // Referência, data e cabeçalho Net-Empregos.
  let ref = findRef(text);
  let dataOferta = findDatePT(text);
  let area = "";
  let entidade = "";

  const refLineIndex = lines.findIndex(l => /^Ref\s*:/i.test(l) || /Guarda\s*Ref\s*:/i.test(l));
  if(refLineIndex >= 0){
    const m = lines[refLineIndex].match(/Ref\s*:\s*([A-Z0-9._/-]+)/i);
    if(m) ref = m[1].trim();

    // Quando a linha vem "5-5-2026 GuardaRef: 15373534", extrair data.
    const dm = lines[refLineIndex].match(/(\d{1,2})[-/](\d{1,2})[-/](20\d{2})/);
    if(dm) dataOferta = `${dm[3]}-${dm[2].padStart(2,"0")}-${dm[1].padStart(2,"0")}`;

    area = lines[refLineIndex + 1] || "";
    entidade = lines[refLineIndex + 2] || "";
  } else {
    const inferredRefData = inferAreaAndEntityFromRef(lines);
    area = inferredRefData.area || "";
    entidade = inferredRefData.entidade || "";
  }

  // Evitar duplicação quando a entidade aparece repetida antes do detalhe.
  if(!entidade) entidade = inferEntityExplicit(text) || "";
  if(entidade && /^detalhe da oferta/i.test(entidade)) entidade = "";

  const email = findEmail(text);
  const phone = findPhone(text);
  const local = inferLocal(text);
  const contrato = inferContrato(text);
  const horario = inferHorario(text);
  const remuneracao = inferRemuneracao(text);

  function extractByHeading(startNames, stopNames){
    const normName = s => strip(s).replace(/[:：]+$/,"").trim().toLowerCase();
    let startIdx = -1;
    for(let i=0;i<lines.length;i++){
      const n = normName(lines[i]);
      if(startNames.map(x=>x.toLowerCase()).includes(n)){
        startIdx = i + 1;
        break;
      }
    }
    if(startIdx < 0) return "";

    let endIdx = lines.length;
    for(let i=startIdx;i<lines.length;i++){
      const n = normName(lines[i]);
      if(stopNames.map(x=>x.toLowerCase()).includes(n)){
        endIdx = i;
        break;
      }
    }
    return lines.slice(startIdx, endIdx).filter(Boolean).join("\n");
  }

  let funcoesRaw = extractByHeading(
    ["Funções", "Função", "Responsabilidades", "Principais responsabilidades", "Descrição da Função", "Caracterização do Posto de Trabalho", "Descrição do posto de trabalho"],
    ["Perfil", "Perfil pretendido", "Requisitos", "Condições", "Oferta", "Oferecemos", "Benefícios", "Candidatura", "Candidaturas", "Candidate-se", "Envie", "Enviar CV", "Local"]
  );

  let requisitosRaw = extractByHeading(
    ["Perfil", "Perfil pretendido", "Requisitos", "Requisitos de Admissão", "Competências", "Habilitações", "Habilitação Literária", "O que procuramos em ti"],
    ["Funções", "Função", "Responsabilidades", "Principais responsabilidades", "Condições", "Oferta", "Oferecemos", "Benefícios", "Candidatura", "Candidaturas", "Candidate-se", "Envie", "Enviar CV", "Local"]
  );

  let condicoesRaw = extractByHeading(
    ["Condições", "Oferta", "Oferecemos", "Benefícios", "Condições oferecidas", "Principais Benefícios", "Relação Jurídica", "Tipo de vínculo"],
    ["Funções", "Função", "Responsabilidades", "Principais responsabilidades", "Perfil", "Perfil pretendido", "Requisitos", "Candidatura", "Candidaturas", "Candidate-se", "Envie", "Enviar CV", "Local"]
  );

  // Fallback por regex para casos com emojis colados ao título da secção.
  if(!requisitosRaw){
    const m = text.match(/(?:Perfil pretendido|Perfil|Requisitos)\s*:?\s*([\s\S]*?)(?:Oferecemos|Condições|Candidaturas?|Envio de CV|📍|Local:)/i);
    if(m) requisitosRaw = m[1];
  }
  if(!funcoesRaw){
    const m = text.match(/(?:Principais responsabilidades|Funções|Responsabilidades)\s*:?\s*([\s\S]*?)(?:Perfil pretendido|Perfil|Requisitos|Oferecemos|Condições|Candidaturas?)/i);
    if(m) funcoesRaw = m[1];
  }
  if(!condicoesRaw){
    const m = text.match(/(?:Oferecemos|Condições|Benefícios)\s*:?\s*([\s\S]*?)(?:Candidaturas?|Envio de CV|📍|Local:)/i);
    if(m) condicoesRaw = m[1];
  }

  let contacto = "";
  let origemContacto = "";
  if(email){
    contacto = email;
    origemContacto = "Visível publicamente na oferta";
  } else if(phone){
    contacto = phone;
    origemContacto = "Visível publicamente na oferta";
  } else if(candidaturaSection){
    contacto = cleanBullets(candidaturaSection);
    origemContacto = "Visível publicamente na oferta";
  } else if(link){
    contacto = "Candidatura através da plataforma/origem da oferta";
    origemContacto = "Candidatura apenas pela plataforma";
  }

  const resumo = [
    local ? `Oferta localizada em ${local}.` : "",
    fonte ? `Fonte: ${fonte}.` : "",
    contrato ? `Regime/contrato indicado: ${contrato}.` : "",
    horario ? `Horário indicado: ${horario}.` : ""
  ].filter(Boolean).join(" ");

  return {
    id: crypto.randomUUID(),
    titulo: titulo || "Oferta importada por texto",
    entidade,
    area,
    vagas: "",
    localidade: local,
    concelho: local || "Seia",
    fonte: fonte || "",
    referencia: ref,
    link: link || "",
    dataOferta,
    dataConsulta: todayPT(),
    dataLimite: "",
    contrato,
    horario,
    remuneracao,
    estado: "pendente",
    contacto,
    origemContacto,
    tecnicoResponsavel: "",
    resumoFacebook: resumo,
    funcoes: cleanBullets(funcoesRaw),
    requisitos: cleanBullets(requisitosRaw),
    condicoes: cleanBullets(condicoesRaw),
    dataInativacao:"",
    motivoInativacao:"",
    dataValidacao:"",
    dataExportPdf:"",
    dataExportFacebook:"",
    importadaPor:tecnicoAtual(),
    validadaPor:"",
    exportPdfPor:"",
    exportFacebookPor:"",
    inativadaPor:"",
    observacoes: "Oferta organizada automaticamente a partir de texto copiado/colado. Validar manualmente todos os campos antes de publicar."
  };
}

function organizarTextoOferta(){
  try{
    const rawEl = $("rawOfferText");
    if(!rawEl){
      alert("Não encontrei a caixa de texto da oferta. Atualize a página e tente novamente.");
      return;
    }
    const raw = rawEl.value.trim();
    if(!raw){
      alert("Cole primeiro o texto da oferta.");
      return;
    }
    const fonte = $("pasteFonte") ? $("pasteFonte").value : "";
    const link = $("pasteLink") ? $("pasteLink").value.trim() : "";
    const offer = parseRawOffer(raw, fonte, link);

    if(!offer || !offer.id){
      alert("Não foi possível organizar a oferta. Verifique o texto copiado e tente novamente.");
      return;
    }

    offers.unshift(offer);
    currentId = offer.id;
    saveOffers();
    rawEl.value = "";
    if($("pasteLink")) $("pasteLink").value = "";
    showView("editor");
    alert("Texto organizado numa ficha de oferta. Agora valide e complete os campos antes de publicar.");
  }catch(err){
    console.error("Erro ao organizar texto da oferta:", err);
    alert("Ocorreu um erro ao organizar o texto: " + (err && err.message ? err.message : err));
  }
}
function setupPasteImport(){
  const btn = $("btnOrganizarTextoOferta");
  if(btn && !btn.dataset.bound){
    btn.dataset.bound = "1";
    btn.addEventListener("click", organizarTextoOferta);
  }
  const clearBtn = $("btnLimparTextoOferta");
  if(clearBtn && !clearBtn.dataset.bound){
    clearBtn.dataset.bound = "1";
    clearBtn.addEventListener("click", ()=>{
      if($("rawOfferText")) $("rawOfferText").value = "";
      if($("pasteLink")) $("pasteLink").value = "";
    });
  }
}
document.addEventListener("DOMContentLoaded", setupPasteImport);
setupPasteImport();




// v43 — ligação robusta do botão de organização de texto
document.addEventListener("click", ev=>{
  if(ev.target && ev.target.id === "btnOrganizarTextoOferta"){
    ev.preventDefault();
    organizarTextoOferta();
  }
  if(ev.target && ev.target.id === "btnLimparTextoOferta"){
    ev.preventDefault();
    if($("rawOfferText")) $("rawOfferText").value = "";
    if($("pasteLink")) $("pasteLink").value = "";
  }
});

// v7: Limpar ofertas - ligação robusta
function clearAllOffersV7(){
  if(confirm("Tem a certeza que quer limpar todas as ofertas registadas? Esta ação limpa apenas os dados locais deste protótipo.")){
    offers = [];
    currentId = null;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers));
    
function initHistoricoFiltros(){
  const aplicar=$("btnAplicarFiltrosHistorico");
  if(aplicar) aplicar.onclick = aplicarFiltrosHistorico;

  const limpar=$("btnLimparFiltrosHistorico");
  if(limpar) limpar.onclick = limparFiltrosHistorico;

  const search=$("histSearch");
  if(search){
    search.onkeydown = ev=>{
      if(ev.key==="Enter"){
        ev.preventDefault();
        aplicarFiltrosHistorico();
      }
    };
  }
}

initHistoricoFiltros();
refreshAll();
    const fb = $("facebookPreview"); if(fb) fb.innerHTML = "<div style='padding:24px;background:#fff;border-radius:18px;'>Sem ofertas registadas.</div>";
    const pdf = $("pdfPreview"); if(pdf) pdf.innerHTML = "<div style='padding:24px;background:#fff;border-radius:18px;'>Sem ofertas registadas.</div>";
    const res = $("resultadosPesquisa"); if(res) res.innerHTML = "";
    alert("Ofertas limpas.");
  }
}
function setupClearButtonsV7(){
  ["btnLimparOfertas","btnLimparOfertasTabela"].forEach(id=>{
    const b = $(id);
    if(b && !b.dataset.clearBound){
      b.dataset.clearBound = "1";
      b.addEventListener("click", clearAllOffersV7);
    }
  });
}
document.addEventListener("DOMContentLoaded", setupClearButtonsV7);
setupClearButtonsV7();



// v8: ligação final do botão limpar ofertas
function clearAllOffersV8(){
  if(confirm("Tem a certeza que quer limpar todas as ofertas registadas?")){
    offers = [];
    currentId = null;
    saveOffers();
    renderStats();
    renderTable();
    renderSelects();
    const fb = $("facebookPreview"); if(fb) fb.innerHTML = "<div style='padding:24px;background:#fff;border-radius:18px;'>Sem ofertas registadas.</div>";
    const pdf = $("pdfPreview"); if(pdf) pdf.innerHTML = "<div style='padding:24px;background:#fff;border-radius:18px;'>Sem ofertas registadas.</div>";
    const res = $("resultadosPesquisa"); if(res) res.innerHTML = "";
    loadForm(null);
    alert("Ofertas limpas.");
  }
}
function setupClearButtonsV8(){
  ["btnLimparOfertas","btnLimparOfertasTabela"].forEach(id=>{
    const el = $(id);
    if(el && !el.dataset.boundV8){
      el.dataset.boundV8 = "1";
      el.addEventListener("click", clearAllOffersV8);
    }
  });
}
document.addEventListener("DOMContentLoaded", setupClearButtonsV8);
setupClearButtonsV8();


function aplicarFiltrosHistorico(){
  renderTable();
}

function limparFiltrosHistorico(){
  ["histSearch","histEstado","histFonte","histLocal","histConsultaMes","histInativaMes","histExport"].forEach(id=>{
    const el=$(id);
    if(el) el.value="";
  });
  renderTable();
}

document.addEventListener("click", ev=>{
  if(ev.target && ev.target.id==="btnAplicarFiltrosHistorico"){
    ev.preventDefault();
    aplicarFiltrosHistorico();
  }
  if(ev.target && ev.target.id==="btnLimparFiltrosHistorico"){
    ev.preventDefault();
    limparFiltrosHistorico();
  }
});

document.addEventListener("keydown", ev=>{
  if(ev.target && ev.target.id==="histSearch" && ev.key==="Enter"){
    ev.preventDefault();
    aplicarFiltrosHistorico();
  }
});



document.addEventListener('DOMContentLoaded', initFirebaseApp);
if(document.readyState !== 'loading') initFirebaseApp();
