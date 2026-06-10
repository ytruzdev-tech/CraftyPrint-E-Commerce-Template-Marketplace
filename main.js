let isAdmin = false;

 
let products=[],cart=[],wishlist=JSON.parse(localStorage.getItem("cp_wish"))||[];
let currentCat="All",currSymbol="₱",currRate=1,currCode="PHP";
let buyNowProduct=null,currentReviewProductId=null,currentReviewStar=0;
let currentLang="en";
 
const translations={
  en:{all_products:"All Products",learning:"Learning Materials",back_school:"Back to School",teachers_day:"Teachers Day",title:"Crafty Print",buy_now:"Buy Now",add_cart:"Add to Cart",search:"🔍 Search products..."},
  tl:{all_products:"Lahat ng Produkto",learning:"Mga Pang-Aral",back_school:"Balik Eskwela",teachers_day:"Araw ng Guro",title:"Crafty Print",buy_now:"Bilhin Ngayon",add_cart:"Idagdag sa Cart",search:"🔍 Maghanap ng produkto..."},
  ceb:{title:"Crafty Print",add_cart:"Idugang sa Cart",search:"🔍 Pangita og produkto..."},
  ilo:{all_products:"Amin nga Produkto",learning:"Panagadal a Material",back_school:"Agsubli Eskwela",teachers_day:"Aldaw ti Mannursuro",title:"Crafty Print",buy_now:"Agdama nga Bakalen",add_cart:"Idulin iti Cart",search:"🔍 Agsapsapul ti produkto..."},
  war:{all_products:"Tanan nga Produkto",learning:"Mga Aradman nga Materyales",back_school:"Balik Eskwela",teachers_day:"Adlaw han Maestro",title:"Crafty Print",buy_now:"Palit Karon",add_cart:"Idugang ha Cart",search:"🔍 Pangita hin produkto..."},
  bik:{all_products:"Gabos na Produkto",learning:"Mga Materyales sa Pag-aral",back_school:"Balik Eskwela",teachers_day:"Araw kan Maestro",title:"Crafty Print",buy_now:"Bakalon Na",add_cart:"Idugang sa Cart",search:"🔍 Maghanap nin produkto..."},
  pam:{all_products:"Ating Produkto",learning:"Materyales para king Adal",back_school:"Balik Eskwela",teachers_day:"Aldo ning Maestro",title:"Crafty Print",buy_now:"Bili Na",add_cart:"Idugang king Cart",search:"🔍 Maghanap king produkto..."},
  ja:{all_products:"すべての商品",learning:"学習教材",back_school:"新学期準備",teachers_day:"先生の日",title:"Crafty Print",buy_now:"今すぐ購入",add_cart:"カートに追加",search:"🔍 商品を検索..."},
  ko:{all_products:"전체 상품",learning:"학습 자료",back_school:"개학 준비",teachers_day:"스승의 날",title:"Crafty Print",buy_now:"지금 구매",add_cart:"장바구니 담기",search:"🔍 상품 검색..."},
  zh:{all_products:"所有产品",learning:"学习资料",back_school:"开学用品",teachers_day:"教师节",title:"Crafty Print",buy_now:"立即购买",add_cart:"加入购物车",search:"🔍 搜索产品..."},
  ar:{all_products:"جميع المنتجات",learning:"مواد تعليمية",back_school:"العودة إلى المدرسة",teachers_day:"يوم المعلم",title:"Crafty Print",buy_now:"اشتري الآن",add_cart:"أضف إلى السلة",search:"🔍 ابحث عن المنتجات..."},
  "en-SG":{all_products:"All Products",learning:"Learning Materials",back_school:"Back to School",teachers_day:"Teachers' Day",title:"Crafty Print",buy_now:"Buy Now",add_cart:"Add to Cart",search:"🔍 Search products..."},
  "en-AU":{all_products:"All Products",learning:"Learning Materials",back_school:"Back to School",teachers_day:"Teacher's Day",title:"Crafty Print",buy_now:"Buy Now",add_cart:"Add to Cart",search:"🔍 Search products..."}
};
 
// ── TOAST ──
function toast(msg){const t=document.getElementById("toast");t.innerText=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2800);}
function showToast(msg){const t=document.createElement("div");t.className="toast";t.innerText=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2000);}
 
// ── MODALS ──
function showModal(id){document.getElementById(id).style.display="block";}
function closeModal(id){document.getElementById(id).style.display="none";}
document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{if(e.target===m)m.style.display="none";}));
 
// ── DARK MODE ──
function toggleMode(){document.body.classList.toggle("dark");document.getElementById("txt-mode").innerText=document.body.classList.contains("dark")?"☀️":"🌙";}
 
// ── LANGUAGE ──
function changeLanguage(lang){
  currentLang=lang;
  document.querySelectorAll("[data-i18n]").forEach(el=>{const key=el.getAttribute("data-i18n");if(translations[lang]?.[key])el.innerText=translations[lang][key];});
  document.getElementById("search-bar").placeholder=translations[lang]?.search||"Search";
  toast("🌐 Language changed!");
}
 
// ── CURRENCY ──
function setCurr(code,sym,rate){
  currCode=code;currSymbol=sym;currRate=rate;
  document.querySelector(".curr-badge").innerText="💱 "+code;
  document.querySelectorAll(".curr-opt").forEach(o=>o.classList.remove("active"));
  event.target.classList.add("active");
  renderProducts();closeModal("currModal");toast("Currency: "+code);
}
function fmtPrice(php){const v=php*currRate;if(currRate>=1)return currSymbol+Math.round(v).toLocaleString();return currSymbol+(v).toFixed(2);}
function toggleQuickMenu(){const menu=document.getElementById("quickMenu");menu.style.display=(menu.style.display==="none"||menu.style.display===""?"flex":"none");}
 
// ════════════════════════════════
// SKELETON LOADING
// ════════════════════════════════
function showSkeleton(){
  const con=document.getElementById("product-list");
  const count=window.innerWidth<=600?4:8;
  con.innerHTML=Array(count).fill(`<div class="skeleton-card"><div class="skeleton-img"></div><div class="skeleton-line short"></div><div class="skeleton-line"></div><div class="skeleton-line price"></div><div class="skeleton-btn"></div></div>`).join("");
}
 
// ════════════════════════════════
// STARS HELPER
// ════════════════════════════════
function renderStars(avg,count){
  const full=Math.floor(avg);
  const half=(avg-full)>=0.5;
  let s="";
  for(let i=1;i<=5;i++){
    if(i<=full)s+=`<span class="star filled">★</span>`;
    else if(i===full+1&&half)s+=`<span class="star half">★</span>`;
    else s+=`<span class="star">★</span>`;
  }
  return `<div class="stars-display">${s}<span class="rating-count">(${count})</span></div>`;
}
 
// ════════════════════════════════
// VIEWS COUNTER — accurate per-user, stored in localStorage
// ════════════════════════════════
function getViewedProducts(){
  try{return JSON.parse(localStorage.getItem("cp_viewed"))||{};}
  catch{return {};}
}
function hasUserViewed(productId){
  return !!getViewedProducts()[productId];
}
function markUserViewed(productId){
  const viewed=getViewedProducts();
  viewed[productId]=Date.now();
  localStorage.setItem("cp_viewed",JSON.stringify(viewed));
}
 
// ── RENDER PRODUCTS ──
function renderProducts(list){
  const con=document.getElementById("product-list");
  let toRender=list||(currentCat==="All"?products:products.filter(p=>p.category===currentCat));
  const sv=document.getElementById("sort-sel").value;
  if(sv==="low")toRender=[...toRender].sort((a,b)=>a.price-b.price);
  else if(sv==="high")toRender=[...toRender].sort((a,b)=>b.price-a.price);
  else if(sv==="pop")toRender=[...toRender].sort((a,b)=>((b.views||0)+(b.sold||0))-((a.views||0)+(a.sold||0)));
  if(!toRender.length){con.innerHTML=`<div class="empty"><div>🛍️</div>No products found.</div>`;return;}
 
  con.innerHTML=toRender.map(p=>{
    const wished=wishlist.includes(p.id);
    const tagBadge=p.tag==="new"?`<div class="badge-new">🆕 New</div>`:p.tag==="sale"?`<div class="badge-sale">🔥 Sale</div>`:"";
 
    const imgs=[p.img,...(p.images||[])].filter(Boolean);
    const galleryImgs=imgs.map((src,i)=>`<img src="${src}" class="${i===0?'active':''}" onerror="this.src='https://placehold.co/210x180?text=No+Image'" loading="lazy">`).join("");
    const dots=imgs.length>1?`<div class="gallery-dots">${imgs.map((_,i)=>`<button class="gallery-dot ${i===0?'active':''}" onclick="event.stopPropagation();switchCardImg(this,${i})"></button>`).join("")}</div>`:"";
   // Check kung ang product ay unang sa listahan
const isFirstProduct = (p.id === products[0]?.id);

// Maglagay lang ng prev/next buttons kung ang product ay ang unang product sa listahan
const navs= (imgs.length>1 && isFirstProduct) ? 
  `<button class="gallery-nav prev" onclick="event.stopPropagation();navCardImg(this,-1)">‹</button>
   <button class="gallery-nav next" onclick="event.stopPropagation();navCardImg(this,1)">›</button>` 
  : "";
 
    const avg=p.ratingAvg||0;const cnt=p.ratingCount||0;
    const starHtml=cnt>0?renderStars(avg,cnt):`<div class="stars-display"><span style="font-size:11px;color:var(--txt2);">No reviews yet</span></div>`;
 
    // Accurate views from Firestore — no random numbers
    const viewCount=p.views||0;
    const soldCount=p.sold||0;
 
    return `
    <div class="pcard" onclick="showDetail('${p.id}')">
      ${tagBadge}
      ${isAdmin?`<button onclick="event.stopPropagation();deleteProduct('${p.id}')" style="position:absolute;top:12px;left:12px;background:#ff4d6d;color:#fff;border:none;padding:6px 10px;border-radius:12px;cursor:pointer;font-size:11px;font-weight:700;z-index:20;">🗑️</button>`:""}
      <button class="wish-btn ${wished?"active":""}" onclick="event.stopPropagation();toggleWish('${p.id}')">❤️</button>
      <div class="views-badge">👁 ${viewCount}</div>
      <div class="img-gallery-wrap">
        ${galleryImgs}
        ${dots}
        ${navs}
      </div>
      <div class="badge-cat">${translateCategory(p.category)}</div>
      <h3>${p.name}</h3>
      ${starHtml}
      <div class="social-proof">
        ${viewCount>0?`<span class="sp-badge sp-views">🔥 ${viewCount} viewed</span>`:''}
        ${soldCount>0?`<span class="sp-badge sp-bought">🛒 ${soldCount} bought</span>`:''}
      </div>
      <div class="price-row"><span class="price">${fmtPrice(p.price)}</span>${currCode!=="PHP"?`<span class="price-usd">₱${p.price}</span>`:""}</div>
      <button class="atc-btn" onclick="event.stopPropagation();addToCart('${p.id}')">🛒 ${translations[currentLang]?.add_cart||"Add to Cart"}</button>
      <button class="buy-now-btn" onclick="event.stopPropagation();openBuyNow('${p.id}')">⚡ ${translations[currentLang]?.buy_now||"Buy Now"}</button>
    </div>`;
  }).join("");
}
 
// ── CARD GALLERY NAVIGATION ──
function switchCardImg(dotEl,idx){
  const wrap=dotEl.closest(".img-gallery-wrap");
  wrap.querySelectorAll("img").forEach((img,i)=>img.classList.toggle("active",i===idx));
  wrap.querySelectorAll(".gallery-dot").forEach((d,i)=>d.classList.toggle("active",i===idx));
}
function navCardImg(btn,dir){
  const wrap=btn.closest(".img-gallery-wrap");
  const imgs=[...wrap.querySelectorAll("img")];
  const dots=[...wrap.querySelectorAll(".gallery-dot")];
  const cur=imgs.findIndex(i=>i.classList.contains("active"));
  const next=(cur+dir+imgs.length)%imgs.length;
  imgs.forEach((img,i)=>img.classList.toggle("active",i===next));
  dots.forEach((d,i)=>d.classList.toggle("active",i===next));
}
 
function translateCategory(cat){
  const t=translations[currentLang];if(!t)return cat;
  if(cat==="Learning Materials")return t.learning||cat;
  if(cat==="Back to School")return t.back_school||cat;
  if(cat==="Teachers Day")return t.teachers_day||cat;
  return cat;
}
 
// ════════════════════════════════
// SHOW DETAIL — accurate view counting (1 per user per product)
// ════════════════════════════════
async function showDetail(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  currentReviewProductId=id;
 
  // Only increment view if this user hasn't viewed this product before
  if(!hasUserViewed(id)){
    db.collection("products").doc(id).update({views:firebase.firestore.FieldValue.increment(1)}).then(()=>{
      // Update local product data
      const idx=products.findIndex(pp=>pp.id===id);
      if(idx>-1)products[idx].views=(products[idx].views||0)+1;
    }).catch(()=>{});
    markUserViewed(id);
  }
 
  const imgs=[p.img,...(p.images||[])].filter(Boolean);
  document.getElementById("det-img").src=imgs[0]||"https://placehold.co/400x280?text=No+Image";
 
  const thumbsEl=document.getElementById("det-thumbs");
  if(imgs.length>1){
    thumbsEl.innerHTML=imgs.map((src,i)=>`<img src="${src}" class="det-thumb ${i===0?"active":""}" onclick="switchDetImg(this,'${src}')" onerror="this.src='https://placehold.co/60x60?text=x'">`).join("");
  } else { thumbsEl.innerHTML=""; }
 
  document.getElementById("det-cat").innerText=p.category||"General";
  document.getElementById("det-name").innerText=p.name;
  document.getElementById("det-price").innerText=fmtPrice(p.price);
  document.getElementById("det-desc").innerText=p.description||"No description available.";
  document.getElementById("det-atc").innerText=translations[currentLang]?.add_cart||"Add to Cart";
  document.getElementById("det-buy").innerText=translations[currentLang]?.buy_now||"Buy Now";
  document.getElementById("det-atc").onclick=()=>{addToCart(id);closeModal("detailModal");};
  document.getElementById("det-buy").onclick=()=>{closeModal("detailModal");openBuyNow(id);};
 
  const recs=products.filter(x=>x.id!==id&&x.category===p.category).slice(0,4);
  const recEl=document.getElementById("det-recs");
  if(recs.length){recEl.innerHTML=`<div style="font-weight:700;font-size:13px;margin-bottom:8px;color:var(--pk);">👥 You may also like:</div><div class="rec-row">${recs.map(r=>`<div class="rec-card" onclick="closeModal('detailModal');showDetail('${r.id}')"><img src="${r.img}" onerror="this.src='https://placehold.co/130x90?text=No+Image'"><p>${r.name}</p><span class="rec-price">${fmtPrice(r.price)}</span></div>`).join("")}</div>`;}
  else recEl.innerHTML="";
 
  const avg=p.ratingAvg||0;const cnt=p.ratingCount||0;
  document.getElementById("det-rating-row").innerHTML=cnt>0?renderStars(avg,cnt):`<span style="font-size:12px;color:var(--txt2);">No reviews yet — be the first!</span>`;
 
  showModal("detailModal");
  loadReviews(id);
}
 
function switchDetImg(thumb,src){
  document.getElementById("det-img").src=src;
  document.querySelectorAll(".det-thumb").forEach(t=>t.classList.remove("active"));
  thumb.classList.add("active");
}
 
// ════════════════════════════════
// REVIEWS → Discord Webhook only
// ════════════════════════════════
async function loadReviews(productId){
  const listEl=document.getElementById("reviews-list");
  const summaryEl=document.getElementById("review-summary");
  listEl.innerHTML=`<div class="loading" style="padding:20px;"><div class="spinner"></div></div>`;
 
  try{
    const snap=await db.collection("reviews").where("productId","==",productId).orderBy("createdAt","desc").get();
    if(snap.empty){
      summaryEl.innerHTML="";
      listEl.innerHTML=`<p style="text-align:center;color:var(--txt2);font-size:13px;padding:16px 0;">No reviews yet. Be the first to review!</p>`;
      return;
    }
 
    let total=0,counts={1:0,2:0,3:0,4:0,5:0};
    const reviews=[];
    snap.forEach(doc=>{
      const r={id:doc.id,...doc.data()};
      reviews.push(r);total+=r.rating;counts[r.rating]=(counts[r.rating]||0)+1;
    });
    const avg=(total/reviews.length).toFixed(1);
    const maxBar=Math.max(...Object.values(counts));
 
    summaryEl.innerHTML=`
    <div class="review-summary">
      <div class="review-avg">
        <div class="review-avg-num">${avg}</div>
        <div class="review-avg-stars">${[1,2,3,4,5].map(i=>`<span style="font-size:14px;color:${i<=Math.round(avg)?'var(--star)':'#ddd'}">★</span>`).join("")}</div>
        <div class="review-avg-count">${reviews.length} review${reviews.length!==1?"s":""}</div>
      </div>
      <div class="review-bars">
        ${[5,4,3,2,1].map(s=>`
        <div class="rbar-row">
          <span class="rbar-label">${s}</span>
          <div class="rbar-bg"><div class="rbar-fill" style="width:${maxBar>0?Math.round((counts[s]||0)/maxBar*100):0}%"></div></div>
          <span style="font-size:10px;color:var(--txt2);width:20px;">${counts[s]||0}</span>
        </div>`).join("")}
      </div>
    </div>`;
 
    listEl.innerHTML=reviews.map(r=>{
      const d=r.createdAt?.toDate?r.createdAt.toDate():new Date();
      const dateStr=d.toLocaleDateString("en-PH",{month:"short",day:"numeric",year:"numeric"});
      return `
      <div class="review-item">
        <div class="review-top">
          <div class="reviewer-name">${r.name}</div>
          <div class="review-date">${dateStr}</div>
        </div>
        <div class="review-stars">${[1,2,3,4,5].map(i=>`<span style="font-size:14px;color:${i<=r.rating?'var(--star)':'#ddd'}">★</span>`).join("")}</div>
        <div class="review-text">${r.text}</div>
        ${r.verified?`<div class="review-verified">✅ Verified Buyer</div>`:""}
      </div>`;
    }).join("");
  }catch(e){
    console.error(e);
    listEl.innerHTML=`<p style="color:red;font-size:13px;">Could not load reviews.</p>`;
  }
}
 
function openWriteReview(){
  if(!currentReviewProductId){toast("⚠️ Select a product first!");return;}
  currentReviewStar=0;
  document.getElementById("rv-name").value="";
  document.getElementById("rv-text").value="";
  document.querySelectorAll(".star-pick").forEach(s=>s.classList.remove("selected"));
  showModal("writeReviewModal");
}
 
function setReviewStar(val){
  currentReviewStar=val;
  document.querySelectorAll(".star-pick").forEach(s=>{
    s.classList.toggle("selected",parseInt(s.dataset.v)<=val);
  });
}
 
// Submit review → sends to Discord webhook, saves to Firestore, updates product rating
async function submitReview(){
  const name=document.getElementById("rv-name").value.trim();
  const text=document.getElementById("rv-text").value.trim();
  if(!currentReviewStar){toast("⚠️ Please select a star rating!");return;}
  if(!name){toast("⚠️ Enter your name!");return;}
  if(!text){toast("⚠️ Write your review!");return;}
  if(!currentReviewProductId){return;}
 
  const product=products.find(p=>p.id===currentReviewProductId);
  const productName=product?product.name:"Unknown Product";
 
  // Star string for Discord
  const stars="★".repeat(currentReviewStar)+"☆".repeat(5-currentReviewStar);
 
  // Send to Discord webhook
  const discordPayload={
    embeds:[{
      title:"⭐ New Review — Crafty Print",
      color:0xFFB300,
      fields:[
        {name:"📦 Product",value:productName},
        {name:"👤 Reviewer",value:name},
        {name:"⭐ Rating",value:`${stars} (${currentReviewStar}/5)`},
        {name:"💬 Review",value:text}
      ],
      timestamp:new Date().toISOString()
    }]
  };
 
  try{
    // Send to Discord
    await fetch(REVIEW_WH,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(discordPayload)
    });
 
    // Save to Firestore
    await db.collection("reviews").add({
      productId:currentReviewProductId,
      name,text,
      rating:currentReviewStar,
      verified:false,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
 
    // Update product rating average in Firestore
    const allReviews=await db.collection("reviews").where("productId","==",currentReviewProductId).get();
    let tot=0,cnt=0;
    allReviews.forEach(d=>{tot+=d.data().rating;cnt++;});
    await db.collection("products").doc(currentReviewProductId).update({
      ratingAvg:parseFloat((tot/cnt).toFixed(2)),
      ratingCount:cnt
    });
 
    // Update local products array
    const idx=products.findIndex(p=>p.id===currentReviewProductId);
    if(idx>-1){
      products[idx].ratingAvg=parseFloat((tot/cnt).toFixed(2));
      products[idx].ratingCount=cnt;
    }
 
    toast("⭐ Review submitted! Thank you!");
    closeModal("writeReviewModal");
    loadReviews(currentReviewProductId);
  }catch(e){
    console.error(e);
    toast("❌ Failed to submit review. Try again.");
  }
}
 
// ════════════════════════════════
// SMART AI SEARCH using Claude API
// ════════════════════════════════
let aiSearchTimeout=null;
let lastAIQuery="";
 
function handleSearch(val){
  // Basic filter as you type
  const f=products.filter(p=>p.name.toLowerCase().includes(val.toLowerCase())||p.category?.toLowerCase().includes(val.toLowerCase()));
  renderProducts(f);
 
  // Debounce AI search — trigger after 700ms pause
  clearTimeout(aiSearchTimeout);
  if(val.trim().length<3){
    hideAIBox();
    return;
  }
  aiSearchTimeout=setTimeout(()=>triggerAISearch(val),700);
}
 
function hideAIBox(){
  document.getElementById("ai-search-box").style.display="none";
}
 
async function triggerAISearch(query){
  if(!query||query.trim().length<3){hideAIBox();return;}
  if(query.trim()===lastAIQuery)return;
  lastAIQuery=query.trim();
 
  const box=document.getElementById("ai-search-box");
  const thinking=document.getElementById("ai-thinking");
  const resultText=document.getElementById("ai-result-text");
  const suggestions=document.getElementById("ai-suggestions");
 
  box.style.display="block";
  thinking.style.display="flex";
  resultText.innerHTML="";
  suggestions.innerHTML="";
 
  // Build product list summary for AI context
  const productList=products.map(p=>`- "${p.name}" (${p.category}, ₱${p.price})`).join("\n");
 
  try{
    const resp=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        model:"claude-sonnet-4-20250514",
        max_tokens:1000,
        system:`You are a smart search assistant for "Crafty Print", a Filipino digital shop selling educational/learning materials. 
Respond ONLY in JSON format — no preamble, no markdown, no backticks.
JSON format:
{
  "summary": "short 1-2 sentence helpful response in Filipino or English based on query",
  "matched_products": ["exact product name 1", "exact product name 2"],
  "suggested_categories": ["category name"],
  "search_chips": ["chip label 1","chip label 2","chip label 3"]
}
"search_chips" are 3-4 short alternative search suggestions the user might try.
Only include products from the list provided. If no exact match, suggest closest ones.`,
        messages:[{
          role:"user",
          content:`Available products:\n${productList}\n\nUser searched for: "${query}"\n\nReturn JSON only.`
        }]
      })
    });
 
    const data=await resp.json();
    thinking.style.display="none";
 
    const rawText=data.content?.find(c=>c.type==="text")?.text||"";
    let parsed;
    try{
      const clean=rawText.replace(/```json|```/g,"").trim();
      parsed=JSON.parse(clean);
    }catch{
      resultText.innerHTML=`<span style="font-size:12px;color:var(--txt2);">Try searching for: learning materials, flash cards, worksheets...</span>`;
      return;
    }
 
    // Show AI summary
    resultText.innerHTML=`<div style="margin-bottom:8px;font-size:12.5px;color:var(--txt);">${parsed.summary||""}</div>`;
 
    // Highlight matched products in the grid
    if(parsed.matched_products?.length){
      const matched=products.filter(p=>parsed.matched_products.some(name=>p.name.toLowerCase().includes(name.toLowerCase())||name.toLowerCase().includes(p.name.toLowerCase())));
      if(matched.length){
        renderProducts(matched);
        resultText.innerHTML+=`<div style="font-size:11px;color:var(--pk2);font-weight:700;margin-bottom:4px;">✨ ${matched.length} best match${matched.length!==1?"es":""} found</div>`;
      }
    }
 
    // Show search chips
    if(parsed.search_chips?.length){
      suggestions.innerHTML=parsed.search_chips.map(chip=>`<button class="ai-chip" onclick="applyChip('${chip}')">${chip}</button>`).join("");
    }
 
    // Show category chips if any
    if(parsed.suggested_categories?.length){
      parsed.suggested_categories.forEach(cat=>{
        const btn=document.createElement("button");
        btn.className="ai-chip";
        btn.style.background="#E8F5E9";
        btn.style.color="#2E7D32";
        btn.style.borderColor="#A5D6A7";
        btn.innerText="📂 "+cat;
        btn.onclick=()=>{
          filterCat(cat,null);
          document.querySelectorAll(".cat-btn").forEach(b=>{
            b.classList.toggle("active",b.innerText.includes(cat));
          });
          hideAIBox();
        };
        suggestions.appendChild(btn);
      });
    }
 
  }catch(e){
    console.error("AI Search error:",e);
    thinking.style.display="none";
    resultText.innerHTML=`<span style="font-size:12px;color:var(--txt2);">Search suggestion unavailable. Showing filtered results.</span>`;
  }
}
 
function applyChip(label){
  document.getElementById("search-bar").value=label;
  handleSearch(label);
}
 
// ── LOAD PRODUCTS ──
function loadProducts(){
  showSkeleton();
  db.collection("products").orderBy("createdAt","desc").onSnapshot(snap=>{
    products=snap.docs.map(d=>({id:d.id,...d.data()}));
    renderProducts();
    document.getElementById("announce-bar").style.display="block";
  },err=>{document.getElementById("product-list").innerHTML=`<div class="empty"><div>⚠️</div>Could not load. Check Firebase.</div>`;});
}
 
// ── CART ──
function addToCart(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  flyToCart();
  const ex=cart.find(i=>i.id===id);
  if(ex)ex.qty+=1;else cart.push({...p,qty:1,cartId:Date.now()+Math.random()});
  updateCartCount();toast("✅ Added to cart!");startAbandonTimer();
  localStorage.setItem('userCart', JSON.stringify(cart));
}
function updateCartCount(){document.getElementById("cart-count").innerText=cart.reduce((s,i)=>s+i.qty,0);}
function removeFromCart(cid){cart=cart.filter(i=>i.cartId!==cid);updateCartCount();showCartModal();localStorage.setItem('userCart', JSON.stringify(cart));}
function changeQty(id,d){const i=cart.find(x=>x.id===id);if(!i)return;i.qty+=d;if(i.qty<=0)cart=cart.filter(x=>x.id!==id);updateCartCount();showCartModal(); localStorage.setItem('userCart', JSON.stringify(cart));}
 
function showCartModal(){
  const list=document.getElementById("cart-items-list");let total=0;
  if(!cart.length){list.innerHTML=`<p style="text-align:center;color:var(--txt2);padding:20px;">Your cart is empty.</p>`;}
  else{list.innerHTML=cart.map(i=>{total+=(i.price||0)*i.qty;return`<div class="ci-row">
    <img src="${i.img}" onerror="this.src='https://placehold.co/55x55?text=img'" style="width:52px;height:52px;object-fit:cover;border-radius:10px;">
    <div style="flex:1;padding:0 8px;"><div style="font-weight:700;font-size:13px;">${i.name}</div><div style="font-size:11px;color:var(--txt2);">Qty: ${i.qty}</div></div>
    <span style="color:var(--pk2);font-weight:800;font-size:13px;font-family:'Nunito',sans-serif;">${fmtPrice(i.price*i.qty)}</span>
    <div style="display:flex;gap:4px;">
      <button class="fbtn" style="padding:5px 8px;font-size:12px;" onclick="changeQty('${i.id}',-1)">➖</button>
      <button class="fbtn" style="padding:5px 8px;font-size:12px;" onclick="changeQty('${i.id}',1)">➕</button>
      <button class="fbtn" style="padding:5px 8px;font-size:12px;background:#ff4d6d;" onclick="removeFromCart(${i.cartId})">🗑️</button>
    </div>
  </div>`;}).join("");}
  document.getElementById("total-price-display").innerText=fmtPrice(total);
  showModal("cartModal");
}
 
// ── CHECKOUT ──
async function deleteProduct(id){
  if(!confirm("Delete this product?"))return;
  try{await db.collection("products").doc(id).delete();toast("🗑 Product deleted!");}
  catch(err){console.error(err);toast("❌ Failed to delete.");}
}
 
async function checkout(){
  const fb=document.getElementById("buyer-fb").value.trim();
  const email=document.getElementById("buyer-email").value.trim();
  const ref=document.getElementById("ref-number").value.trim();
  if(!cart.length){toast("⚠️ Cart is empty!");return;}
  if(!fb){toast("⚠️ Enter your FB Name!");return;}
  if(!ref){toast("⚠️ Enter GCash Ref No.!");return;}
  if(!confirm("Submit this order?"))return;
  const dupSnap=await db.collection("orders").where("refNumber","==",ref).get();
  if(!dupSnap.empty){toast("⚠️ GCash reference already used!");return;}
  const total=cart.reduce((s,i)=>s+(i.price*i.qty),0);
  const itemsText=cart.map(i=>`• ${i.name} x${i.qty} — ₱${i.price*i.qty}`).join("\n");
  const payload={embeds:[{title:"🛒 New Order — Crafty Print",color:0xD62976,fields:[{name:"👤 Buyer",value:fb},{name:"📧 Email",value:email||"(none)"},{name:"🧾 Items",value:itemsText},{name:"💰 Total",value:`₱${total}`},{name:"📱 GCash Ref",value:ref}],timestamp:new Date().toISOString()}]};
  try{
    const photo=document.getElementById("payment-photo").files[0];
    const formData=new FormData();
    formData.append("payload_json",JSON.stringify(payload));
    if(photo)formData.append("file",photo);
    await fetch(ORDER_WH,{method:"POST",body:formData});
    await db.collection("orders").add({
      buyer:fb,email:email||"",total,refNumber:ref,
      items:cart.map(i=>({id:i.id,name:i.name,qty:i.qty,price:i.price,downloadLink:i.downloadLink||""})),
      status:"Pending",createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    toast("🎉 Order submitted! You'll receive a download link after confirmation.");
    cart=[];updateCartCount();
    ["buyer-fb","buyer-email","ref-number"].forEach(id=>document.getElementById(id).value="");
    closeModal("cartModal");checkAchievements(fb);
  }catch(e){toast("❌ Error. Try again.");}
}
 
// ── BUY NOW ──
function openBuyNow(id){
  const p=products.find(x=>x.id===id);if(!p)return;
  buyNowProduct=p;
  document.getElementById("bn-product-info").innerHTML=`<b style="color:var(--pk);font-family:'Nunito',sans-serif;font-size:15px;">${p.name}</b><br><span style="font-size:22px;font-weight:800;color:var(--pk2);font-family:'Nunito',sans-serif;">${fmtPrice(p.price)}</span>`;
  showModal("buyNowModal");
}
 
async function submitBuyNow(){
  const fb=document.getElementById("bn-fb").value.trim();
  const email=document.getElementById("bn-email").value.trim();
  const ref=document.getElementById("bn-ref").value.trim();
  if(!buyNowProduct||!fb||!ref){toast("⚠️ Fill all fields!");return;}
  if(!confirm("Confirm this purchase?"))return;
  const dupSnap=await db.collection("orders").where("refNumber","==",ref).get();
  if(!dupSnap.empty){toast("⚠️ GCash reference already used!");return;}
  const payload={embeds:[{title:"⚡ Instant Order — Crafty Print",color:0x28a745,fields:[{name:"👤 Buyer",value:fb},{name:"📧 Email",value:email||"(none)"},{name:"📦 Product",value:buyNowProduct.name},{name:"💰 Total",value:`₱${buyNowProduct.price}`},{name:"📱 GCash Ref",value:ref}],timestamp:new Date().toISOString()}]};
  try{
    await fetch(ORDER_WH,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    await db.collection("orders").add({
      buyer:fb,email:email||"",total:buyNowProduct.price,refNumber:ref,
      items:[{id:buyNowProduct.id,name:buyNowProduct.name,qty:1,price:buyNowProduct.price,downloadLink:buyNowProduct.downloadLink||""}],
      status:"Pending",createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    toast("🎉 Order placed! Download link after confirmation.");
    ["bn-fb","bn-email","bn-ref"].forEach(id=>document.getElementById(id).value="");
    buyNowProduct=null;closeModal("buyNowModal");
  }catch(e){toast("❌ Error. Try again.");}
}
 
// ── TRACK ──
async function trackOrders(){
  const name=document.getElementById("track-name").value.trim();
  if(!name){toast("⚠️ Enter name/email!");return;}
  const res=document.getElementById("track-result");
  res.innerHTML=`<div class="loading"><div class="spinner"></div></div>`;
  try{
    const buyerSnap=await db.collection("orders").where("buyer","==",name).get();
    const emailSnap=await db.collection("orders").where("email","==",name).get();
    let docs=[];
    buyerSnap.forEach(doc=>docs.push(doc));
    emailSnap.forEach(doc=>{if(!docs.find(d=>d.id===doc.id))docs.push(doc);});
    if(!docs.length){res.innerHTML=`<p style="text-align:center;color:var(--txt2);">No orders found.</p>`;return;}
    let html="";
    docs.forEach(doc=>{
      const o=doc.data();
      const cls=o.status==="Completed"?"st-completed":o.status==="Processing"?"st-processing":"st-pending";
      const items=o.items?.map(i=>`• ${i.name} x${i.qty}`).join("<br>")||"";
      html+=`<div style="background:var(--spk);padding:14px;border-radius:14px;margin-bottom:10px;">
        <div style="font-weight:800;color:var(--pk2);font-family:'Nunito',sans-serif;">₱${o.total}</div>
        <div style="font-size:12px;margin-top:4px;">${items}</div>
        <div class="status-badge ${cls}">${o.status}</div>
        ${o.status==="Completed"&&o.downloadLink?`<br><a href="${o.downloadLink}" target="_blank" class="dl-btn">⬇️ Download File</a>`:""}
      </div>`;
    });
    res.innerHTML=html;
  }catch(e){console.error(e);res.innerHTML=`<p style="color:red;">Error loading orders.</p>`;}
}
 
// ── MY PURCHASES ──
async function loadPurchases(){
  const name=document.getElementById("ph-name").value.trim();
  if(!name){toast("⚠️ Enter name/email!");return;}
  const res=document.getElementById("ph-result");
  res.innerHTML=`<div class="loading"><div class="spinner"></div></div>`;
  try{
    const snap=await db.collection("orders").where("buyer","==",name).where("status","==","Completed").get();
    if(snap.empty){res.innerHTML=`<p style="text-align:center;color:var(--txt2);">No completed purchases found.</p>`;return;}
    let html="";
    snap.forEach(doc=>{
      const o=doc.data();
      o.items?.forEach(item=>{
        html+=`<div class="ph-item">
          <div style="font-weight:700;font-size:14px;">${item.name}</div>
          <div style="font-size:12px;color:var(--txt2);margin:4px 0;">₱${item.price} × ${item.qty}</div>
          ${item.downloadLink?`<a href="${item.downloadLink}" target="_blank" class="dl-btn">⬇️ Re-download</a>`:`<div style="font-size:12px;color:var(--txt2);margin-top:8px;">Download link pending admin confirmation.</div>`}
        </div>`;
      });
    });
    res.innerHTML=html;
    showAchievements(name,snap.size);
  }catch(e){res.innerHTML=`<p style="color:red;">Error.</p>`;}
}
 
// ── ACHIEVEMENTS ──
const ACHIEVEMENTS=[
  {id:"first",icon:"⭐",name:"First Purchase",desc:"Bought first item",req:1},
  {id:"loyal",icon:"🛍️",name:"Loyal Buyer",desc:"3+ orders",req:3},
  {id:"top",icon:"🔥",name:"Top Supporter",desc:"5+ orders",req:5},
  {id:"mega",icon:"💎",name:"VIP Shopper",desc:"10+ orders",req:10},
  {id:"wishlist",icon:"❤️",name:"Wishlist Lover",desc:"10+ wishlist items",req:0},
  {id:"explorer",icon:"🗺️",name:"Explorer",desc:"Viewed 5+ categories",req:0},
];
function checkAchievements(buyer){db.collection("orders").where("buyer","==",buyer).get().then(s=>showAchievements(buyer,s.size));}
function showAchievements(buyer,orderCount){
  document.getElementById("ach-buyer-name").innerText="Buyer: "+buyer+" | Orders: "+orderCount;
  const grid=document.getElementById("ach-grid");
  grid.innerHTML=ACHIEVEMENTS.map(a=>{
    const unlocked=(a.req>0&&orderCount>=a.req)||(a.id==="wishlist"&&wishlist.length>=3);
    return`<div class="ach-card ${unlocked?"":"locked"}"><span class="ach-icon">${a.icon}</span><div class="ach-name">${a.name}</div><div style="font-size:10px;color:var(--txt2);">${unlocked?"✅ Unlocked":"🔒 "+a.desc}</div></div>`;
  }).join("");
  showModal("achModal");
}
 
// ── ADMIN ──
document.getElementById("logo-trigger").ondblclick=()=>{
  if(prompt("Admin Password:")==="CraftyPrintX1@"){
    isAdmin=true;document.getElementById("admin-panel").style.display="block";
    loadAdminData();renderProducts();
  }
};
function exitAdmin(){isAdmin=false;document.getElementById("admin-panel").style.display="none";renderProducts();}
function showAdminTab(tab){switchAdminTab(tab,null);showModal("adminDashModal");loadAdminData();}
function switchAdminTab(tab,el){
  document.getElementById("admin-orders-tab").style.display=tab==="orders"?"block":"none";
  document.getElementById("admin-analytics-tab").style.display=tab==="analytics"?"block":"none";
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  if(el)el.classList.add("active");
  else document.querySelectorAll(".tab")[tab==="orders"?0:1].classList.add("active");
}
 
async function loadAdminData(){
  const snap=await db.collection("orders").orderBy("createdAt","desc").get();
  let html="",total=0,pending=0,completed=0,prodCount={};
  snap.forEach(doc=>{
    const o=doc.data();const id=doc.id;
    total+=o.total||0;
    if(o.status==="Pending")pending++;
    if(o.status==="Completed")completed++;
    o.items?.forEach(i=>{prodCount[i.name]=(prodCount[i.name]||0)+i.qty;});
    const cls=o.status==="Completed"?"st-completed":o.status==="Processing"?"st-processing":"st-pending";
    html+=`<div class="admin-confirm-row">
      <div>
        <b>${o.buyer}</b><br>
        <span style="font-size:11px;color:var(--txt2);">${o.refNumber||""} | ₱${o.total}</span><br>
        <span class="status-badge ${cls}">${o.status}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;">
        ${o.status!=="Completed"?`<button class="fbtn green" onclick="confirmOrder('${id}', '${o.buyer}', '${o.email||""}', ${o.total})">✅ Confirm</button>`:""}
        <button class="fbtn" style="padding:6px 12px;font-size:12px;background:#ff4d6d;" onclick="deleteOrder('${id}')">🗑 Delete</button>
      </div>
    </div>`;
  });
  document.getElementById("admin-orders-list").innerHTML=html||`<p style="text-align:center;color:var(--txt2);">No orders yet.</p>`;
  document.getElementById("stat-orders").innerText=snap.size;
  document.getElementById("stat-rev").innerText="₱"+total.toLocaleString();
  document.getElementById("stat-pending").innerText=pending;
  document.getElementById("stat-done").innerText=completed;
  const top=Object.entries(prodCount).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maxV=top[0]?top[0][1]:1;
  document.getElementById("top-products").innerHTML=top.map(([name,qty])=>`<div class="bar-item"><div class="bar-label"><span>${name}</span><span>${qty} sold</span></div><div class="bar-bg"><div class="bar-fill" style="width:${Math.round(qty/maxV*100)}%"></div></div></div>`).join("")||"<p style='color:var(--txt2);font-size:13px;'>No data yet.</p>";
}
 
async function deleteOrder(id){
  if(!confirm("Delete this order?"))return;
  try{await db.collection("orders").doc(id).delete();toast("🗑 Order deleted!");loadAdminData();}
  catch(err){console.error(err);toast("❌ Failed to delete order.");}
}
 
async function confirmOrder(orderId,buyer,email,total){
  const dlLink=prompt("Enter download link for this order:");
  if(!dlLink){toast("⚠️ Download link required!");return;}
  try{
    const orderRef=db.collection("orders").doc(orderId);
    const snap=await orderRef.get();
    if(!snap.exists){toast("❌ Order not found!");return;}
    const o=snap.data();
    const updatedItems=(o.items||[]).map(i=>({...i,downloadLink:dlLink}));
    await orderRef.update({status:"Completed",downloadLink:dlLink,items:updatedItems});
    if(email&&email.includes("@")){
      try{
        await emailjs.send("service_v29shpn","template_4qqkzzh",{buyer_name:buyer,buyer_email:email,download_link:dlLink});
        toast("📧 Email sent!");
      }catch(emailErr){console.error("EMAIL ERROR:",emailErr);}
    }
    toast("✅ Order confirmed!");loadAdminData();
  }catch(err){console.error("CONFIRM ORDER ERROR:",err);toast("❌ Error updating order.");}
}
 
async function updateStatus(id,status){
  await db.collection("orders").doc(id).update({status});toast("Updated to "+status);loadAdminData();
}
 
// ── ADD PRODUCT ──
async function submitAddProduct(){
  const name=document.getElementById("ap-name").value.trim();
  const price=parseInt(document.getElementById("ap-price").value);
  const img=document.getElementById("ap-img").value.trim();
  const imgsRaw=document.getElementById("ap-imgs").value.trim();
  const dl=document.getElementById("ap-dl").value.trim();
  const cat=document.getElementById("ap-cat").value;
  const desc=document.getElementById("ap-desc").value.trim();
  const tag=document.getElementById("ap-tag").value;
  if(!name||!price||!img||!cat){toast("⚠️ Fill required fields!");return;}
  const extraImgs=imgsRaw?imgsRaw.split(",").map(s=>s.trim()).filter(Boolean):[];
  try{
    await db.collection("products").add({
      name,price,img,images:extraImgs,category:cat,description:desc||"",
      downloadLink:dl||"",tag:tag||"",views:0,sold:0,ratingAvg:0,ratingCount:0,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    toast("✅ Product added!");closeModal("addProductModal");
    ["ap-name","ap-price","ap-img","ap-imgs","ap-dl","ap-desc"].forEach(id=>document.getElementById(id).value="");
    document.getElementById("ap-cat").value="";document.getElementById("ap-tag").value="";
  }catch(e){toast("❌ Failed: "+e.message);}
}
 
// ── SUPPORT ──
async function submitCS(){
  const name=document.getElementById("cs-name").value.trim();
  const msg=document.getElementById("cs-msg").value.trim();
  if(!name||!msg){toast("⚠️ Fill all fields!");return;}
  const payload={embeds:[{title:"💬 Support — Crafty Print",color:0xF9C0DB,fields:[{name:"👤 Name",value:name},{name:"💬 Message",value:msg}],timestamp:new Date().toISOString()}]};
  try{
    await fetch(CS_WH,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    toast("📨 Message sent!");document.getElementById("cs-name").value="";document.getElementById("cs-msg").value="";closeModal("csModal");
  }catch(e){toast("❌ Failed to send.");}
}
 
// ── FILTER + SEARCH + SORT ──
function filterCat(cat,el){
  currentCat=cat;document.querySelectorAll(".cat-btn").forEach(b=>b.classList.remove("active"));
  if(el)el.classList.add("active");
  hideAIBox();
  document.getElementById("search-bar").value="";
  renderProducts();
}
function sortProducts(){renderProducts();}
 
function flyToCart(){
  const c=document.querySelector(".cart-wrap");if(!c)return;
  c.style.transform="scale(1.3)";setTimeout(()=>{c.style.transform="scale(1)";},200);
}
 
// ── WISHLIST ──
function toggleWish(id){
  const i=wishlist.indexOf(id);
  if(i>-1){wishlist.splice(i,1);toast("Removed from wishlist");}
  else{wishlist.push(id);toast("❤️ Added to wishlist!");}
  localStorage.setItem("cp_wish",JSON.stringify(wishlist));renderProducts();
}
function showModal_wish(){
  const items=products.filter(p=>wishlist.includes(p.id));
  const con=document.getElementById("wishlist-items");
  if(!items.length){con.innerHTML=`<div class="empty"><div>💔</div>No wishlist items yet.</div>`;showModal("wishlistModal");return;}
  con.innerHTML=items.map(p=>`<div class="pcard" onclick="showDetail('${p.id}')">
    <img src="${p.img}" onerror="this.src='https://placehold.co/210x180?text=No+Image'" style="width:100%;height:180px;object-fit:cover;border-radius:16px;margin-bottom:10px;">
    <h3>${p.name}</h3>
    <div class="price">${fmtPrice(p.price)}</div>
    <button class="atc-btn" onclick="event.stopPropagation();addToCart('${p.id}')">🛒 ${translations[currentLang]?.add_cart||"Add to Cart"}</button>
    <button onclick="event.stopPropagation();toggleWish('${p.id}')" style="background:#ff4d6d;color:#fff;border:none;margin-top:6px;padding:8px;border-radius:10px;cursor:pointer;font-family:'Poppins',sans-serif;font-size:12px;font-weight:600;">❌ Remove</button>
  </div>`).join("");
  showModal("wishlistModal");
}
document.querySelector("button[onclick=\"showModal_wish()\"]").onclick=function(){showModal_wish();};
 
// ── ABANDONED CART TIMER ──
let abandonTimer=null;
function startAbandonTimer(){
  clearTimeout(abandonTimer);
  abandonTimer=setTimeout(()=>{if(cart.length>0)document.getElementById("abandon-popup").style.display="block";},30000);
}
function closeAbandon(){document.getElementById("abandon-popup").style.display="none";}
 
// ════════════════════════════════
// MUSIC PLAYER
// ════════════════════════════════
const MUSIC_TRACKS=[
  {id:"lofi",name:"Lo-Fi Chill",vibe:"Study & Focus 📚",icon:"🎧",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"},
  {id:"happy",name:"Happy Vibes",vibe:"Upbeat & Fun 🌸",icon:"🌟",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"},
  {id:"calm",name:"Calm Piano",vibe:"Relaxing & Soft 🎹",icon:"🎹",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"},
  {id:"jazz",name:"Soft Jazz",vibe:"Cozy & Warm ☕",icon:"🎷",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"},
  {id:"nature",name:"Nature Sounds",vibe:"Focus & Zen 🌿",icon:"🌿",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"},
   {id:"lofi",name:"Lo-Fi Chill",vibe:"Study & Focus 📚",icon:"🎧",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"},
  // Bruno Mars songs:
  {id:"justtheway",name:"Just the Way You Are",vibe:"Romantic ❤️",icon:"🎤",url:"https://videotourl.com/audio/1778405463678-b7e80c51-b4b4-423b-b394-2ef29866b352.mp3"},
  {id:"uptown",name:"Uptown Funk",vibe:"Funky Party 🎉",icon:"🎺",url:"https://videotourl.com/audio/1778405569892-37dc1efe-cda4-457f-8206-047d54c0342b.mp3"},
  {id:"grenade",name:"Grenade",vibe:"Emotional 🎶",icon:"🎸",url:"https://videotourl.com/audio/1778405641291-f52a6482-8001-486f-8356-690f6355b310.mp3"},
  {id:"24k",name:"24K Magic",vibe:"Party Time ✨",icon:"✨",url:"https://videotourl.com/audio/1778405722691-3fecaf4e-3223-4970-9dda-a1be4651cc54.mp3"},
{id:"sadsong",name:"Multo",vibe:"Sad Song 😢",icon:"😢",url:"https://videotourl.com/audio/1778407153543-f7e85c0f-d76b-4351-9700-fbf3bb1136e0.mp3"},
{id:"chill",name:"500Miles",vibe:"Chill 🌿",icon:"🌿",url:"https://www.image2url.com/r2/default/audio/1779788317965-658dd5f9-073d-4159-a7c6-ccd0a1b9bdc6.mp3"},
]
let currentTrackId=null;
let musicPlaying=false;
const audioEl=document.getElementById("bg-music");
 
audioEl.volume=0.6;
 
function buildTrackList(){
  const list=document.getElementById("mp-track-list");
  list.innerHTML=MUSIC_TRACKS.map(t=>`
    <div class="mp-track ${currentTrackId===t.id?"active":""}" id="mpt-${t.id}" onclick="playTrack('${t.id}')">
      <span class="track-icon">${t.icon}</span>
      <div class="track-info">
        <div class="track-name">${t.name}</div>
        <div class="track-vibe">${t.vibe}</div>
      </div>
      <span class="play-ind">${currentTrackId===t.id&&musicPlaying?"⏸":"▶"}</span>
    </div>`).join("");
}
 
function playTrack(id){
  const track=MUSIC_TRACKS.find(t=>t.id===id);
  if(!track)return;
 
  if(currentTrackId===id&&musicPlaying){
    // Pause
    audioEl.pause();
    musicPlaying=false;
    currentTrackId=null;
    updateMusicUI();
    return;
  }
 
  // Play new track
  audioEl.src=track.url;
  audioEl.play().catch(e=>console.warn("Audio play blocked:",e));
  currentTrackId=id;
  musicPlaying=true;
  updateMusicUI();
  toast("🎵 Now playing: "+track.name);
}
 
function updateMusicUI(){
  const fab=document.getElementById("music-fab-btn");
  const note=document.getElementById("music-note");
  const label=document.getElementById("music-fab-label");
  const nowEl=document.getElementById("mp-now-playing");
  const nowName=document.getElementById("mp-now-name");
 
  if(musicPlaying&&currentTrackId){
    const t=MUSIC_TRACKS.find(x=>x.id===currentTrackId);
    fab.classList.add("playing");
    note.style.animation="noteSpin 0.6s linear infinite";
    label.innerText=t?t.name:"Playing";
    nowEl.classList.add("show");
    nowName.innerText=t?t.name:"—";
  } else {
    fab.classList.remove("playing");
    note.style.animation="none";
    label.innerText="Music";
    nowEl.classList.remove("show");
  }
  buildTrackList();
}
 
function setMusicVolume(val){
  audioEl.volume=val/100;
}
 
let musicPanelOpen=false;
function toggleMusicPanel(){
  musicPanelOpen=!musicPanelOpen;
  const panel=document.getElementById("music-panel");
  panel.style.display=musicPanelOpen?"block":"none";
  if(musicPanelOpen)buildTrackList();
}
 
// Close music panel if clicking outside
document.addEventListener("click",e=>{
  const btn=document.getElementById("music-btn");
  if(musicPanelOpen&&!btn.contains(e.target)){
    musicPanelOpen=false;
    document.getElementById("music-panel").style.display="none";
  }
});
function loadCartFromStorage() {
  const storedCart = localStorage.getItem('userCart');
  if(storedCart) {
    try {
      cart = JSON.parse(storedCart);
      updateCartCount(); // i-update ang cart count sa icon
    } catch(e) {
      cart = [];
    }
  }
}
 
// ── INIT ──
window.onload=()=>{
  loadProducts();
  loadCartFromStorage(); 
  buildTrackList();
};