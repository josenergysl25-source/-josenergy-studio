import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Home, FileText, Users, Package, Settings, Plus, Mic, CheckSquare,
  ClipboardList, Camera, Euro, Search, ChevronRight, CircleAlert,
  ShoppingCart, Clock3, X, Check, ArrowLeft, Sparkles
} from "lucide-react";
import "./styles.css";

const initialWorks = [
  {
    id: 1,
    client: "Juan García",
    title: "Reforma vivienda",
    address: "Valencia",
    budget: 4850,
    extras: 730,
    checklist: [
      { text: "50 m de tubo de 25 mm", done: false },
      { text: "20 cajas universales", done: false },
      { text: "10 mecanismos Simon 100", done: true },
      { text: "Diferencial 40 A", done: false }
    ]
  },
  {
    id: 2,
    client: "María López",
    title: "Instalación fotovoltaica",
    address: "L'Eliana",
    budget: 7420,
    extras: 0,
    checklist: [
      { text: "Comprobar estructura", done: true },
      { text: "Recoger cableado", done: false }
    ]
  }
];

const initialProducts = [
  { id: 1, brand: "Simon", series: "Simon 100", name: "Base enchufe Schuko", ref: "SIM-100-SCH", price: 8.50 },
  { id: 2, brand: "Simon", series: "Simon 100", name: "Conmutador", ref: "SIM-100-CON", price: 9.20 },
  { id: 3, brand: "BJC", series: "Iris", name: "Base enchufe Schuko", ref: "BJC-IRIS-SCH", price: 7.80 },
  { id: 4, brand: "Legrand", series: "Valena", name: "Base enchufe Schuko", ref: "LEG-VAL-SCH", price: 8.10 }
];

function App() {
  const [page, setPage] = useState("home");
  const [works, setWorks] = useState(initialWorks);
  const [products] = useState(initialProducts);
  const [selectedWork, setSelectedWork] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [newMode, setNewMode] = useState(null);
  const [draft, setDraft] = useState("");
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");

  const currentWork = works.find(w => w.id === selectedWork);

  function openWork(id) {
    setSelectedWork(id);
    setPage("work");
  }

  function createDraft() {
    const text = draft.toLowerCase();
    const detected = [];
    const findQty = (regex, fallback=1) => {
      const m = text.match(regex);
      return m ? Number(m[1]) : fallback;
    };
    if (text.includes("enchufe")) {
      detected.push({ name: "Base enchufe", brand: text.includes("simon") ? "Simon" : "Sin especificar", series: text.includes("100") ? "Simon 100" : "", qty: findQty(/(\d+)\s*(?:enchufes|enchufe)/, 1), price: text.includes("simon") ? 8.50 : 0 });
    }
    if (text.includes("punto de luz") || text.includes("puntos de luz")) {
      detected.push({ name: "Punto de luz", brand: "", series: "", qty: findQty(/(\d+)\s*(?:puntos? de luz)/, 1), price: 18 });
    }
    if (text.includes("boletín") || text.includes("boletin")) {
      detected.push({ name: "Boletín eléctrico", brand: "Josenergy", series: "", qty: 1, price: 150 });
    }
    if (text.includes("cuadro")) {
      detected.push({ name: "Cuadro eléctrico", brand: "", series: "", qty: 1, price: 485 });
    }
    if (!detected.length) {
      detected.push({ name: "Partida pendiente de concretar", brand: "", series: "", qty: 1, price: 0 });
    }
    setItems(detected);
    setNewMode("review");
  }

  function addChecklist(text) {
    setWorks(ws => ws.map(w => w.id === selectedWork
      ? {...w, checklist: [...w.checklist, { text, done: false }]}
      : w
    ));
  }

  function toggleChecklist(index) {
    setWorks(ws => ws.map(w => {
      if (w.id !== selectedWork) return w;
      return {...w, checklist: w.checklist.map((x,i) => i === index ? {...x, done: !x.done} : x)};
    }));
  }

  const total = useMemo(() => items.reduce((s, x) => s + x.qty * x.price, 0), [items]);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand"><div className="brandMark">J</div><div><strong>JOSENERGY</strong><span>Studio</span></div></div>
        <nav>
          <Nav icon={<Home/>} label="Inicio" active={page==="home"} onClick={()=>setPage("home")}/>
          <Nav icon={<FileText/>} label="Presupuestos" active={page==="budgets"} onClick={()=>setPage("budgets")}/>
          <Nav icon={<Users/>} label="Clientes" active={page==="clients"} onClick={()=>setPage("clients")}/>
          <Nav icon={<Package/>} label="Catálogo" active={page==="catalog"} onClick={()=>setPage("catalog")}/>
          <Nav icon={<Settings/>} label="Configuración" active={page==="settings"} onClick={()=>setPage("settings")}/>
        </nav>
        <div className="sidebarTip"><Sparkles size={17}/><div><b>Modo obra</b><small>Extras y checklist sin perder nada.</small></div></div>
      </aside>

      <main className="main">
        {page === "home" && <HomePage works={works} openWork={openWork} setShowNew={setShowNew} />}
        {page === "budgets" && <Budgets works={works} openWork={openWork} setShowNew={setShowNew}/>}
        {page === "clients" && <SimplePage title="Clientes" icon={<Users/>} text="Aquí gestionaremos clientes y contactos."/>}
        {page === "settings" && <SimplePage title="Configuración" icon={<Settings/>} text="Aquí añadiremos precios fijos Josenergy, IVA, márgenes, datos de empresa y condiciones."/>}
        {page === "catalog" && <Catalog products={products} search={search} setSearch={setSearch}/>}
        {page === "work" && currentWork && <WorkPage work={currentWork} addChecklist={addChecklist} toggleChecklist={toggleChecklist} setPage={setPage}/>}
      </main>

      {showNew && <Modal title="Nuevo presupuesto" close={()=>{setShowNew(false);setNewMode(null);setDraft("");setItems([])}} >
        {!newMode && <div className="modeGrid">
          <ModeButton color="green" icon={<Mic/>} title="Rápido" desc="Dicta la instalación y revisa las partidas." onClick={()=>setNewMode("quick")}/>
          <ModeButton color="blue" icon={<ClipboardList/>} title="Detallado" desc="Añade y revisa cada partida manualmente." onClick={()=>setNewMode("detail")}/>
          <ModeButton color="orange" icon={<Camera/>} title="Visita" desc="Registra lo que encuentres durante la obra." onClick={()=>setNewMode("visit")}/>
        </div>}
        {newMode==="quick" && <div className="dictate">
          <label>Describe la instalación</label>
          <textarea value={draft} onChange={e=>setDraft(e.target.value)} placeholder='Ej.: "Vivienda de 100 m², 25 enchufes Simon 100, 12 puntos de luz, cuadro nuevo y boletín eléctrico."'/>
          <button className="micButton"><Mic size={28}/> Dictar (demo)</button>
          <button className="primary" onClick={createDraft}>Interpretar presupuesto</button>
        </div>}
        {newMode==="review" && <Review items={items} setItems={setItems} total={total}/>}
        {newMode==="detail" && <div className="emptyState"><ClipboardList size={38}/><h3>Modo detallado</h3><p>La siguiente versión permitirá buscar materiales, cantidades, mano de obra y servicios.</p><button className="primary" onClick={()=>setNewMode("review")}>Empezar</button></div>}
        {newMode==="visit" && <div className="emptyState"><Camera size={38}/><h3>Modo visita</h3><p>Registra extras, cambios, fotos y notas directamente dentro de una obra.</p><button className="primary" onClick={()=>setShowNew(false)}>Crear obra y empezar</button></div>}
      </Modal>}
    </div>
  );
}

function Nav({icon,label,active,onClick}) {
  return <button className={"navBtn "+(active?"active":"")} onClick={onClick}>{icon}<span>{label}</span></button>
}

function HomePage({works,openWork,setShowNew}) {
  const pending = works.reduce((s,w)=>s+w.checklist.filter(x=>!x.done).length,0);
  return <div className="content">
    <header><div><p className="eyebrow">JOSENERGY STUDIO</p><h1>Buenos días 👋</h1><p className="muted">Presupuestos, obras, extras y tareas en un solo sitio.</p></div><button className="primary big" onClick={()=>setShowNew(true)}><Plus/> Nuevo presupuesto</button></header>
    <section className="stats">
      <Stat icon={<FileText/>} label="Presupuestos" value="18" note="este mes"/>
      <Stat icon={<Euro/>} label="Pendiente de cobrar" value="6.280 €" note="estimado"/>
      <Stat icon={<CircleAlert/>} label="Extras registrados" value="9" note="por revisar"/>
      <Stat icon={<CheckSquare/>} label="Tareas pendientes" value={pending} note="en obras"/>
    </section>
    <section className="sectionHead"><div><h2>Obras recientes</h2><p className="muted">Acceso rápido al trabajo de hoy.</p></div></section>
    <div className="cards">{works.map(w=><WorkCard key={w.id} work={w} open={()=>openWork(w.id)}/>)}</div>
  </div>
}

function Budgets({works,openWork,setShowNew}) {
  return <div className="content"><header><div><p className="eyebrow">GESTIÓN</p><h1>Presupuestos</h1><p className="muted">Crea, revisa y convierte presupuestos en obras.</p></div><button className="primary big" onClick={()=>setShowNew(true)}><Plus/> Nuevo</button></header>
  <div className="table"><div className="tableHead"><span>Cliente / obra</span><span>Importe</span><span>Estado</span><span></span></div>{works.map(w=><button className="tableRow" key={w.id} onClick={()=>openWork(w.id)}><span><b>{w.client}</b><small>{w.title}</small></span><strong>{(w.budget+w.extras).toLocaleString("es-ES")} €</strong><span className="badge">En revisión</span><ChevronRight/></button>)}</div></div>
}

function WorkPage({work,addChecklist,toggleChecklist,setPage}) {
  const [task,setTask]=useState("");
  const [extra,setExtra]=useState("");
  return <div className="content">
    <button className="back" onClick={()=>setPage("home")}><ArrowLeft size={17}/> Volver</button>
    <header><div><p className="eyebrow">OBRA</p><h1>{work.title}</h1><p className="muted">{work.client} · {work.address}</p></div><button className="secondary"><Camera size={17}/> Añadir foto</button></header>
    <div className="workGrid">
      <section className="panel"><div className="panelTitle"><div><h2>Resumen económico</h2><p className="muted">Presupuesto + extras registrados.</p></div><Euro/></div>
        <div className="money"><div><small>Presupuesto</small><b>{work.budget.toLocaleString("es-ES")} €</b></div><div><small>Extras</small><b>+{work.extras.toLocaleString("es-ES")} €</b></div><div className="total"><small>Total actual</small><b>{(work.budget+work.extras).toLocaleString("es-ES")} €</b></div></div>
        <div className="quickActions"><button><Plus/> Extra</button><button><FileText/> Cambio</button><button><Camera/> Foto</button></div>
      </section>
      <section className="panel"><div className="panelTitle"><div><h2>Checklist de obra</h2><p className="muted">Material y tareas pendientes.</p></div><CheckSquare/></div>
        <div className="addLine"><input value={task} onChange={e=>setTask(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&task.trim()){addChecklist(task.trim());setTask("")}}} placeholder="Añadir material o tarea..."/><button onClick={()=>{if(task.trim()){addChecklist(task.trim());setTask("")}}}><Plus/></button></div>
        <div className="checklist">{work.checklist.map((x,i)=><button className={"checkItem "+(x.done?"done":"")} key={i} onClick={()=>toggleChecklist(i)}><span>{x.done?<Check size={16}/>:null}</span><label>{x.text}</label></button>)}</div>
      </section>
    </div>
    <section className="panel"><div className="panelTitle"><div><h2>Extras y cambios</h2><p className="muted">Nada que ocurra en la obra debe quedarse sin cobrar.</p></div><CircleAlert/></div>
      <div className="extraComposer"><input value={extra} onChange={e=>setExtra(e.target.value)} placeholder='Ej.: "Añadir 3 enchufes y 2 h de mano de obra como extra"'/><button className="primary" onClick={()=>setExtra("")}><Mic size={17}/> Dictar extra</button></div>
      <div className="notice"><CircleAlert size={18}/><div><b>Control de cierre</b><span>Los extras pendientes se mostrarán aquí antes de cerrar la obra.</span></div></div>
    </section>
  </div>
}

function Catalog({products,search,setSearch}) {
  const filtered=products.filter(p=>(p.name+" "+p.brand+" "+p.series+" "+p.ref).toLowerCase().includes(search.toLowerCase()));
  return <div className="content"><header><div><p className="eyebrow">MATERIALES</p><h1>Catálogo</h1><p className="muted">Base inicial de marcas y referencias. Preparado para incorporar precios Sonepar.</p></div></header>
  <div className="search"><Search/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar Simon 100, BJC Iris, referencia..."/></div>
  <div className="table"><div className="tableHead"><span>Producto</span><span>Referencia</span><span>PVP</span><span></span></div>{filtered.map(p=><div className="tableRow" key={p.id}><span><b>{p.brand} · {p.series}</b><small>{p.name}</small></span><span>{p.ref}</span><strong>{p.price.toFixed(2)} €</strong><ChevronRight/></div>)}</div></div>
}

function Review({items,setItems,total}) {
  return <div><div className="aiHeader"><Sparkles/><div><h3>Revisión de interpretación</h3><p>Comprueba cantidades, marcas y precios antes de generar el presupuesto.</p></div></div>
  <div className="reviewList">{items.map((it,i)=><div className="reviewItem" key={i}><input value={it.name} onChange={e=>setItems(xs=>xs.map((x,j)=>j===i?{...x,name:e.target.value}:x))}/><input value={it.brand} placeholder="Marca" onChange={e=>setItems(xs=>xs.map((x,j)=>j===i?{...x,brand:e.target.value}:x))}/><input type="number" value={it.qty} onChange={e=>setItems(xs=>xs.map((x,j)=>j===i?{...x,qty:Number(e.target.value)}:x))}/><input type="number" value={it.price} onChange={e=>setItems(xs=>xs.map((x,j)=>j===i?{...x,price:Number(e.target.value)}:x))}/><b>{(it.qty*it.price).toFixed(2)} €</b></div>)}</div>
  <div className="reviewTotal"><span>Total provisional</span><b>{total.toFixed(2)} €</b></div><button className="primary full">Generar presupuesto</button></div>
}

function WorkCard({work,open}) {
  const pending=work.checklist.filter(x=>!x.done).length;
  return <button className="workCard" onClick={open}><div className="workIcon"><ClipboardList/></div><div className="workInfo"><b>{work.client}</b><h3>{work.title}</h3><small>{work.address}</small><div className="workMeta"><span><Euro size={14}/> {(work.budget+work.extras).toLocaleString("es-ES")} €</span><span><ShoppingCart size={14}/> {pending} pendientes</span></div></div><ChevronRight/></button>
}

function Stat({icon,label,value,note}) { return <div className="stat"><div className="statIcon">{icon}</div><div><small>{label}</small><b>{value}</b><span>{note}</span></div></div> }
function ModeButton({color,icon,title,desc,onClick}) { return <button className="modeButton" onClick={onClick}><div className={"modeIcon "+color}>{icon}</div><div><b>{title}</b><span>{desc}</span></div><ChevronRight/></button> }
function Modal({title,close,children}) { return <div className="overlay"><div className="modal"><div className="modalHead"><h2>{title}</h2><button onClick={close}><X/></button></div>{children}</div></div> }
function SimplePage({title,icon,text}) { return <div className="content"><header><div><p className="eyebrow">JOSENERGY</p><h1>{title}</h1><p className="muted">{text}</p></div></header><div className="emptyState"><div className="bigIcon">{icon}</div><h2>Preparado para construir</h2><p>Esta sección queda conectada a la estructura de la aplicación para las siguientes fases.</p></div></div> }

createRoot(document.getElementById("root")).render(<App />);
