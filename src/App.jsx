import React, { useEffect, useMemo, useState } from 'react';

const KEY = 'acl-marketplace-v3';
const categories = ['all', 'textbooks', 'electronics', 'furniture', 'clothing', 'other'];
const conditions = ['new', 'like-new', 'used', 'worn'];
const currentUser = {name: 'You', email: 'you@example.com'}; // Demo account; no login backend
const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`;
const seed = [
  {id:'m1', title:'Calculus II textbook', category:'textbooks', condition:'used', price:320, description:'Second-year calculus textbook, complete with all chapters. A few highlighted sections and notes in pencil, but no missing or torn pages. Useful for the midterm and final revision sessions. You can inspect it before deciding.', status:'active', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'GUC student area, near the main cafeteria', photos:[photo('photo-1544947950-fa07a98d237f'),photo('photo-1494438639946-1ebd1d20bf85')], emoji:'📚'},
  {id:'m2', title:'Student desk lamp', category:'furniture', condition:'like-new', price:240, description:'Compact study lamp with warm light, adjustable position and a USB power cable. Used for one semester only. The cable and light both work. Great for a dorm desk or a small workspace.', status:'active', owner:'other', seller:'Mariam', sellerEmail:'mariam.seller@example.com', pickup:'GUC library entrance, weekdays after 1 PM', photos:[photo('photo-1555475384-a0aefc775412')], emoji:'💡'},
  {id:'m3', title:'Bluetooth headphones', category:'electronics', condition:'used', price:650, description:'Wireless over-ear headphones in good working condition. They connect with Bluetooth and include the original carrying pouch and charging cable. The battery lasts about six hours based on my usage. There are a few cosmetic scratches near one hinge; see the photos. Happy to let you test sound and pairing before buying.', status:'active', owner:'other', seller:'Omar', sellerEmail:'omar.seller@example.com', pickup:'Arrange a meetup at GUC Gate 3', photos:[photo('photo-1599955051125-571f47e04316'),photo('photo-1505740420928-5e560c06d30e'),photo('photo-1546435770-a3e426bf472b')], emoji:'🎧'},
  {id:'m4', title:'Engineering lab coat', category:'clothing', condition:'new', price:200, description:'White engineering lab coat, medium size, bought for a lab but never worn. Still clean and folded. Suitable for laboratory practical sessions. Please check your required size before arranging pickup.', status:'active', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'Meet at GUC main entrance, mornings', photos:[photo('photo-1542058186993-286fdce0b580')], emoji:'🥼'},
  {id:'m5', title:'Drawing tablet', category:'electronics', condition:'like-new', price:1450, description:'Small USB drawing tablet with pressure-sensitive pen and protective sleeve. Used for a few class illustrations; fully functional. Works with common creative software after installing the manufacturer driver. You are welcome to try the pen and pressure sensitivity on my laptop before buying.', status:'active', owner:'other', seller:'Nour', sellerEmail:'nour.seller@example.com', pickup:'GUC design building reception', photos:[photo('photo-1671087709820-274fdd9ac67a')], emoji:'✏️'},
  {id:'m6', title:'Used storage shelf', category:'furniture', condition:'worn', price:390, description:'Light wooden storage shelf. Stable and usable, though there are visible scratches from moving rooms. The shelves are best for books, stationery and small storage boxes, not very heavy appliances. Buyer should arrange a way to transport it from near campus.', status:'active', owner:'other', seller:'Youssef', sellerEmail:'youssef.seller@example.com', pickup:'Collect from a public pickup point near GUC, by arrangement', photos:[photo('photo-1692195321701-1a454c79ab02'),photo('photo-1758279746549-d24f3784879d')], emoji:'🗄️'},
  {id:'m7', title:'MATH 201 workbook', category:'textbooks', condition:'used', price:140, description:'Workbook with practice problems, solutions and lecture notes. All pages present and in readable condition. Some exercises have answers written in pencil. Already sold to another student.', status:'sold', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'GUC campus (previous listing)', photos:[photo('photo-1544947950-fa07a98d237f')], emoji:'📖'},
  {id:'m8', title:'Sketching kit', category:'other', condition:'like-new', price:180, description:'Charcoal pencils, graphite pencils, blending tools and an A5 sketch pad. Some pencils have been lightly used, but the set still has plenty of material for design practice and drawing assignments.', status:'active', owner:'other', seller:'Salma', sellerEmail:'salma.seller@example.com', pickup:'Meet outside the GUC architecture studios', photos:[photo('photo-1758521232691-613561977b6a'),photo('photo-1771366629879-8b3128ee62ca')], emoji:'🎨'},
];
const emptyForm = {title:'', price:'', category:'', condition:'', description:'', pickup:'', status:'active'};
function saved(){try {const value=JSON.parse(localStorage.getItem(KEY));return Array.isArray(value)?value:seed;}catch{return seed;}}
const cap = s => s==='like-new'?'Like new':(s||'').replace(/\b\w/g,m=>m.toUpperCase());
function findError(form){
 if(!form.title.trim())return 'Please complete the item title.';
 if(form.price.trim()==='' || !Number.isFinite(Number(form.price)) || Number(form.price)<0)return 'Enter a price of zero or more.';
 if(!categories.slice(1).includes(form.category))return 'Choose a category.';
 if(!conditions.includes(form.condition))return 'Choose an item condition.';
 if(!['active','sold'].includes(form.status))return 'Choose a valid status.';
 return '';
}
function ListingImage({src, alt, emoji, className=''}) {
 const [broken, setBroken] = useState(false);
 useEffect(() => setBroken(false), [src]);
 return src && !broken
   ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
   : <span className="item-emoji" aria-label="Photo unavailable">{emoji || '📦'}</span>;
}
export default function App(){
 const [items,setItems] = useState(saved);
 const [query,setQuery] = useState('');
 const [category,setCategory] = useState('all');
 const [sort,setSort] = useState('featured');
 const [selected,setSelected] = useState(null);
 const [editor,setEditor] = useState(null); // null or {id,form}
 const [error,setError] = useState('');
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState('');
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(items)),[items]);
 useEffect(()=>setActivePhoto(0),[selected]);
 const listing = useMemo(()=>{let a=items.filter(x=>(category==='all'||x.category===category)&&`${x.title} ${x.category} ${x.description}`.toLowerCase().includes(query.toLowerCase()));if(sort==='low')a.sort((a,b)=>a.price-b.price);if(sort==='high')a.sort((a,b)=>b.price-a.price);return a;},[items,category,query,sort]);
 function startEdit(item){if(item&&item.owner!=='you')return;setError('');setEditor({id:item?.id||null,form:item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup || '',status:item.status}:{...emptyForm}});}
 function submit(event){event.preventDefault();const f=editor.form;const err=findError(f);if(err){setError('Unable to save item. Check the form.');return;}const original=editor.id?items.find(x=>x.id===editor.id):null;const next={...f, title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos:original?.photos || [],emoji:original?.emoji || '📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
 if(editor.id){setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));setNotice('Changes saved.');}else{setItems([{...next,id:`m-${Date.now()}`,status:'active'},...items]);setNotice('Item listed.');}setEditor(null);setSelected(null);}
 function reset(){setItems(seed);setSelected(null);setEditor(null);setQuery('');setCategory('all');setSort('featured');setNotice('Example items restored.');}
 return <div className="market-app">
  <header className="topbar">
   <div className="topbar-inner">
    <button className="brand" onClick={()=>{setSelected(null);setCategory('all')}}>
     <span className="brand-mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1.5-5h15L21 9"/><path d="M3 9h18v1.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M5 13v7h14v-7"/><path d="M10 20v-4h4v4"/></svg></span>
     <span className="brand-name">Campus Marketplace</span>
    </button>
    <div className="topbar-actions">
     <button className="btn btn-primary" onClick={()=>startEdit(null)}>+ Sell an item</button>
     <span className="user-chip"><span className="avatar" aria-hidden="true">{currentUser.name[0]}</span><span>{currentUser.name}</span></span>
    </div>
   </div>
  </header>
  <main className="main"><div className="main-inner">
   <section className="hero" aria-labelledby="hero-title">
    <div className="hero-copy">
     <p className="kicker">GUC CAMPUS MARKETPLACE</p>
     <h1 id="hero-title">Everything you need, right around campus.</h1>
     <p className="hero-sub">Second-hand items from GUC students · All prices in EGP</p>
    </div>
    <div><button className="btn btn-primary btn-lg" onClick={()=>document.getElementById('discover')?.scrollIntoView({behavior:'smooth'})}>Explore listings</button></div>
   </section>
   <div className="discover" id="discover">
    <section className="shop-cats" aria-labelledby="shop-cats-title">
     <h2 className="section-label" id="shop-cats-title">Shop by category</h2>
     <ul className="cat-strip">
      {categories.map(c=><li key={c}><button className="cat-tile" aria-pressed={category===c} onClick={()=>setCategory(c)}>
       <span className="cat-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{{
        all:<><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></>,
        textbooks:<><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5"/><path d="M8 7h7"/></>,
        electronics:<><path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/></>,
        furniture:<><path d="M5 11V8a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v3"/><path d="M3 13a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3z"/><path d="M5 18v2M19 18v2"/></>,
        clothing:<><path d="M8 3l4 2 4-2 5 4-3 3-2-1v12H8V9l-2 1-3-3z"/></>,
        other:<><path d="M3 7l9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/></>,
       }[c]}</svg></span>
       <span>{c==='all'?'All items':cap(c)}</span>
      </button></li>)}
     </ul>
    </section>
    <section className="browse" aria-labelledby="browse-title">
     <header className="browse-head">
      <div>
       <h2 id="browse-title">Browse listings</h2>
       <p className="result-count">{listing.length} {listing.length===1?'result':'results'}{query&&<> for “{query}”</>}</p>
      </div>
      <div className="browse-tools">
       <label className="search-box"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input type="search" aria-label="Search listings" placeholder="Search textbooks, lamps, headphones…" value={query} onChange={e=>setQuery(e.target.value)}/></label>
       <label className="sort-box"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></label>
      </div>
     </header>
     {notice&&<p className="notice" role="status"><span>{notice}</span><button className="icon-btn" aria-label="Dismiss message" onClick={()=>setNotice('')}>×</button></p>}
     <div className="listing-grid">{listing.map(item=><article className={item.status==='sold'?'listing-card is-sold':'listing-card'} key={item.id}>
      <div className="card-photo" onClick={()=>setSelected(item.id)}><ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" /></div>
      <div className="card-body">
       <div className="pill-row"><span className={`cond-pill cond-${item.condition}`}>{item.condition==='new'&&<svg className="cond-star" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>}{cap(item.condition)}</span>{item.status==='sold'&&<span className="status-pill status-sold">Sold out</span>}</div>
       <div className="card-title-row"><h3>{item.title}</h3><strong className="price">EGP {item.price.toLocaleString()}</strong></div>
       <p className="card-pickup">{item.pickup || 'Arrange directly with seller'}</p>
       <button className="btn btn-secondary btn-block" aria-label={`View details for ${item.title}`} onClick={()=>setSelected(item.id)}>Details</button>
      </div>
     </article>)}{listing.length===0&&<p className="card empty-state">No listings match your search.</p>}</div>
    </section>
   </div>
   <footer className="site-footer"><button className="btn btn-secondary" onClick={reset}>Reset demo</button></footer>
  </div></main>
  {selected&&(()=>{
   const item=items.find(x=>x.id===selected);if(!item)return null;
   const images=item.photos || [];
   const subject=encodeURIComponent(`Campus Exchange: ${item.title}`);
   const body=encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);
   return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setSelected(null)}>
    <section className="detail-panel" role="dialog" aria-modal="true" aria-label="Item details">
     <div className="dv-top">
      <nav className="dv-crumbs" aria-label="Breadcrumb"><span>Browse</span><span aria-hidden="true">/</span><span>{cap(item.category)}</span><span aria-hidden="true">/</span><strong>{item.title}</strong></nav>
      <button className="close" aria-label="Close item details" onClick={()=>setSelected(null)}><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
     </div>
     <div className="dv-body">
      <div className="dv-media">
       <div className="dv-frame"><ListingImage src={images[activePhoto] || images[0]} alt={`${item.title} photo ${activePhoto+1}`} emoji={item.emoji} className="dv-img" /></div>
       {images.length>1&&<div className="dv-thumbs" aria-label="Item photos">{images.map((src,index)=><button type="button" key={index} className={activePhoto===index?'dv-thumb active':'dv-thumb'} aria-label={`Show photo ${index+1} of ${images.length}`} aria-pressed={activePhoto===index} onClick={()=>setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="dv-thumb-img" /></button>)}</div>}
      </div>
      <div className="dv-info">
       <p className="dv-kicker">{cap(item.category)} · {cap(item.condition)}</p>
       <h2 className="dv-title">{item.title}</h2>
       <div className="dv-price-row"><p className="dv-price">EGP {item.price.toLocaleString()}</p>{item.status==='sold'&&<span className="status-pill status-sold">Sold out</span>}</div>
       <p className="dv-desc" tabIndex={0} aria-label="Description">{item.description||'No description supplied.'}</p>
       <dl className="dv-facts">
        <div><dt>Pickup</dt><dd>{item.pickup || 'Arrange directly with seller'}</dd></div>
        <div><dt>Condition</dt><dd><span className={`cond-pill cond-${item.condition}`}>{item.condition==='new'&&<svg className="cond-star" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>}{cap(item.condition)}</span></dd></div>
       </dl>
       <div className="dv-buy">
        <div className="dv-seller"><span className="dv-avatar" aria-hidden="true">{(item.seller||'?').charAt(0)}</span><div><span className="dv-seller-label">Seller</span><strong>{item.seller}</strong></div></div>
        {item.owner==='you'
          ? <button className="btn btn-primary dv-cta" onClick={()=>startEdit(item)}>Edit your listing</button>
          : item.status==='sold'
            ? <p className="dv-sold-note">This item is marked as sold.</p>
            : <><a className="btn btn-primary dv-cta" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>Contact seller</a><p className="dv-help">Opens your email app with a message to the seller.</p></>}
       </div>
      </div>
     </div>
    </section>
   </div>;
  })()}
  {editor&&<div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setEditor(null)}><section className="sell-modal" role="dialog" aria-modal="true" aria-label={editor.id?'Edit item':'Sell item'}><button className="close" aria-label="Close form" onClick={()=>setEditor(null)}>×</button><div className="modal-head"><div><p className="section-kicker">CAMPUS EXCHANGE</p><h2>{editor.id?'Edit your listing':'Sell an item'}</h2><p>Add the details and we'll take care of the rest.</p></div></div><form onSubmit={submit}><div className="field-grid"><label><span>Item title *</span><input value={editor.form.title} onChange={e=>setEditor(s=>({...s,form:{...s.form,title:e.target.value}}))} placeholder="What are you selling?"/></label><label><span>Price (EGP) *</span><input type="number" min="0" step="0.01" value={editor.form.price} onChange={e=>setEditor(s=>({...s,form:{...s.form,price:e.target.value}}))} placeholder="Price"/></label><label><span>Category *</span><select value={editor.form.category} onChange={e=>setEditor(s=>({...s,form:{...s.form,category:e.target.value}}))}><option value="">Select</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label><label><span>Condition *</span><select value={editor.form.condition} onChange={e=>setEditor(s=>({...s,form:{...s.form,condition:e.target.value}}))}><option value="">Select</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label><label className="wide"><span>Description</span><textarea value={editor.form.description} onChange={e=>setEditor(s=>({...s,form:{...s.form,description:e.target.value}}))} placeholder="Description" rows="5"/></label><label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={e=>setEditor(s=>({...s,form:{...s.form,pickup:e.target.value}}))} placeholder="e.g. Library entrance or arrange on campus" /></label><label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small></label>{editor.id&&<label><span>Status</span><select className={`status-select status-select-${editor.form.status}`} value={editor.form.status} onChange={e=>setEditor(s=>({...s,form:{...s.form,status:e.target.value}}))}><option value="active">For sale</option><option value="sold">Sold out</option></select></label>}</div>{error&&<p className="alert" role="alert">{error}</p>}<div className="modal-foot"><button type="button" onClick={()=>setEditor(null)}>Cancel</button><button className="sell-cta" type="submit">{editor.id?'Save changes':'Publish item'}</button></div></form></section></div>}
 </div>;
}
