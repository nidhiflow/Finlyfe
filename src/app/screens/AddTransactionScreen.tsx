import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, ScanLine, Camera, Image as ImageIcon,
  Repeat, ChevronDown, ChevronLeft, ChevronRight,
  Plus, Pencil, Trash2, Check, X, Bell,
  Calculator, Calendar, Zap, Sparkles,
} from "lucide-react";

// ─── Single Source of Truth ────────────────────────────────────────────────────
// All categories/subcategories come from the shared CategoryContext.
// Any changes made in CategoriesScreen are reflected here immediately.
import { useCategoryContext, Cat, Sub } from "../context/CategoryContext";

// ─── Local types ───────────────────────────────────────────────────────────────
// Cat and Sub are imported from context; Acc is local to this screen.
interface Acc { id: string; name: string; emoji: string; type: string; color: string; balance: number; }
type TxType = "expense" | "income" | "transfer";

// ─── Accounts (local – could be moved to AccountContext later) ─────────────────
const ACCOUNTS: Acc[] = [
  { id:"a1", name:"HDFC Savings",      emoji:"🏦", type:"Savings",    color:"#4895EF", balance:45230  },
  { id:"a2", name:"SBI Salary A/C",   emoji:"💰", type:"Salary",     color:"#22C55E", balance:125000 },
  { id:"a3", name:"ICICI Credit Card",emoji:"💳", type:"Credit Card", color:"#F72585", balance:-18500 },
  { id:"a4", name:"Cash Wallet",      emoji:"💵", type:"Cash",        color:"#FFB703", balance:3200   },
];

const RECENT_IDS = ["food", "vehicle", "bills"];
const RECENT_INCOME_IDS = ["i-salary", "i-biz"];

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// ─── Calculator Modal ──────────────────────────────────────────────────────────
function CalcModal({ value, onChange, onClose }: {
  value: string; onChange: (v: string) => void; onClose: () => void;
}) {
  const [display, setDisplay] = useState(value || "0");

  const tap = (k: string) => {
    setDisplay(prev => {
      if (k === "⌫") return prev.length > 1 ? prev.slice(0,-1) : "0";
      if (k === "C")  return "0";
      if (k === ".")  return prev.includes(".") ? prev : prev + ".";
      if (prev === "0" && k !== ".") return k;
      if (prev.includes(".") && prev.split(".")[1].length >= 2) return prev;
      return prev + k;
    });
  };

  const confirm = () => { onChange(display === "0" ? "" : display); onClose(); };

  const rows = [
    ["C","⌫"],
    ["7","8","9"],
    ["4","5","6"],
    ["1","2","3"],
    [".","0","✓"],
  ];

  return (
    <motion.div
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 flex items-end"
      style={{background:"rgba(0,0,0,0.8)",backdropFilter:"blur(14px)"}}
      onClick={onClose}>
      <motion.div
        initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
        transition={{duration:0.3,ease:[0.4,0,0.2,1]}}
        onClick={e=>e.stopPropagation()}
        className="w-full max-w-md mx-auto rounded-t-3xl p-5"
        style={{background:"linear-gradient(180deg,#1A2238 0%,#101828 100%)",border:"1px solid rgba(255,255,255,0.1)",borderBottom:"none"}}>

        <div className="flex justify-center mb-3">
          <div className="w-9 h-1 rounded-full bg-white/15" />
        </div>

        {/* Display */}
        <div className="text-right mb-4 px-2">
          <p className="text-white/35" style={{fontSize:12}}>Amount</p>
          <p className="text-white font-bold" style={{fontSize:40,letterSpacing:"-1px"}}>
            ₹ {parseFloat(display||"0").toLocaleString("en-IN",{minimumFractionDigits:display.includes(".")?display.split(".")[1].length:0})}
          </p>
        </div>

        {/* Keys */}
        {rows.map((row,ri) => (
          <div key={ri} className={`grid gap-2 mb-2 ${row.length===2?"grid-cols-2":row.length===3?"grid-cols-3":"grid-cols-2"}`}>
            {row.map(k => (
              <motion.button key={k} whileTap={{scale:0.9}}
                onClick={() => k==="✓" ? confirm() : tap(k)}
                className="py-4 rounded-2xl flex items-center justify-center font-bold transition-colors"
                style={{
                  fontSize: k==="✓" ? 20 : 22,
                  background: k==="✓" ? "linear-gradient(135deg,#7C5CFF,#4CC9F0)"
                    : k==="C" ? "rgba(239,68,68,0.15)"
                    : k==="⌫" ? "rgba(255,183,3,0.12)"
                    : "rgba(255,255,255,0.07)",
                  color: k==="✓" ? "white" : k==="C" ? "#F87171" : k==="⌫" ? "#FFB703" : "white",
                  boxShadow: k==="✓" ? "0 4px 16px rgba(124,92,255,0.4)" : "none",
                }}>
                {k}
              </motion.button>
            ))}
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

// ─── Subcategory Sheet ─────────────────────────────────────────────────────────
// Reads cat.subs LIVE from context (parent passes cat from getCatsByType).
// Adds/deletes inside this sheet also call context methods so CategoriesScreen
// stays in sync as well.
function SubcategorySheet({ cat, selectedSubId, onSelect, onClose }: {
  cat: Cat; selectedSubId: string|null; onSelect: (s:Sub)=>void; onClose: ()=>void;
}) {
  // Write ops go through the context → propagate to CategoriesScreen instantly
  const { addSubcategory, deleteSubcategory } = useCategoryContext();

  const [adding, setAdding]     = useState(false);
  const [newName, setNewName]   = useState("");
  const [newEmoji, setNewEmoji] = useState("📌");

  // Use cat.subs directly — they're already live from context via the parent
  const subs = cat.subs;

  const addSub = () => {
    if (!newName.trim()) return;
    addSubcategory(cat.id, { name: newName.trim(), emoji: newEmoji });
    setNewName(""); setNewEmoji("📌"); setAdding(false);
  };

  return (
    <motion.div
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 flex items-end"
      style={{background:"rgba(0,0,0,0.82)",backdropFilter:"blur(16px)"}}
      onClick={onClose}>
      <motion.div
        initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
        transition={{duration:0.3,ease:[0.4,0,0.2,1]}}
        onClick={e=>e.stopPropagation()}
        className="w-full max-w-md mx-auto rounded-t-3xl"
        style={{background:"linear-gradient(180deg,#16203A 0%,#0E1424 100%)",border:"1px solid rgba(255,255,255,0.09)",borderBottom:"none",maxHeight:"80vh",overflowY:"auto"}}>

        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-white/15" />
        </div>

        <div className="px-5 pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pt-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl"
                style={{background:`${cat.color}25`,border:`1px solid ${cat.color}35`}}>
                {cat.emoji}
              </div>
              <div>
                <p className="text-white font-bold" style={{fontSize:17}}>{cat.name}</p>
                <p className="text-white/38" style={{fontSize:12}}>Select subcategory</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{background:"rgba(255,255,255,0.07)"}}>
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          {/* Subcategory list */}
          <div className="space-y-2">
            {subs.map(sub => {
              const isSel = selectedSubId === sub.id;
              return (
                <motion.div key={sub.id} layout
                  whileTap={{scale:0.97}}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer"
                  style={{
                    background: isSel ? `${cat.color}1A` : "rgba(255,255,255,0.04)",
                    border: isSel ? `1.5px solid ${cat.color}50` : "1px solid rgba(255,255,255,0.07)",
                    boxShadow: isSel ? `0 4px 16px ${cat.color}18` : "none",
                  }}
                  onClick={() => onSelect(sub)}>
                  <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-lg"
                    style={{background:`${cat.color}18`,border:`1px solid ${cat.color}25`}}>
                    {sub.emoji}
                  </div>
                  <span className="flex-1 font-semibold"
                    style={{fontSize:14, color: isSel ? "white" : "rgba(255,255,255,0.72)"}}>
                    {sub.name}
                  </span>
                  {isSel && (
                    <div className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{background:`linear-gradient(135deg,${cat.color},${cat.color}cc)`}}>
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  {!isSel && (
                    <div className="flex gap-1 opacity-50">
                      <button onClick={e=>{e.stopPropagation();deleteSubcategory(cat.id, sub.id)}}
                        className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-rose-500/15">
                        <Trash2 className="w-3 h-3 text-rose-400/60" />
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Add subcategory */}
          <AnimatePresence>
            {adding ? (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
                exit={{opacity:0,height:0}} transition={{duration:0.22}}
                className="mt-3 p-4 rounded-2xl" style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)"}}>
                <div className="flex gap-2 mb-2">
                  <input value={newEmoji} onChange={e=>setNewEmoji(e.target.value.slice(-2))||newEmoji}
                    className="w-12 text-center rounded-xl text-xl bg-white/7 focus:outline-none" style={{fontSize:20}} />
                  <input value={newName} onChange={e=>setNewName(e.target.value)}
                    placeholder="Subcategory name…" autoFocus
                    onKeyDown={e=>e.key==="Enter"&&addSub()}
                    className="flex-1 px-3 py-2 rounded-xl text-white placeholder:text-white/22 focus:outline-none"
                    style={{background:"rgba(255,255,255,0.07)",border:`1px solid ${cat.color}30`,fontSize:14}} />
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>setAdding(false)}
                    className="flex-1 py-2 rounded-xl text-white/40 text-sm"
                    style={{background:"rgba(255,255,255,0.05)"}}>Cancel</button>
                  <motion.button whileTap={{scale:0.96}} onClick={addSub}
                    className="flex-1 py-2 rounded-xl text-white font-semibold text-sm"
                    style={{background:`linear-gradient(135deg,${cat.color},${cat.color}bb)`}}>Add</motion.button>
                </div>
              </motion.div>
            ) : (
              <motion.button whileTap={{scale:0.97}} onClick={()=>setAdding(true)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl"
                style={{background:"rgba(255,255,255,0.04)",border:"1px dashed rgba(255,255,255,0.15)",color:cat.color,fontSize:13,fontWeight:600}}>
                <Plus className="w-4 h-4" />
                Add Subcategory
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Account Sheet ─────────────────────────────────────────────────────────────
function AccountSheet({ selected, onSelect, onClose, excludeId }: {
  selected: string; onSelect: (a:Acc)=>void; onClose: ()=>void; excludeId?: string;
}) {
  const list = ACCOUNTS.filter(a => a.id !== excludeId);
  return (
    <motion.div
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 flex items-end"
      style={{background:"rgba(0,0,0,0.8)",backdropFilter:"blur(14px)"}}
      onClick={onClose}>
      <motion.div
        initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
        transition={{duration:0.28,ease:[0.4,0,0.2,1]}}
        onClick={e=>e.stopPropagation()}
        className="w-full max-w-md mx-auto rounded-t-3xl p-5"
        style={{background:"linear-gradient(180deg,#16203A 0%,#0E1424 100%)",border:"1px solid rgba(255,255,255,0.09)",borderBottom:"none"}}>
        <div className="flex justify-center mb-4">
          <div className="w-9 h-1 rounded-full bg-white/15" />
        </div>
        <p className="text-white font-bold mb-4" style={{fontSize:17}}>Select Account</p>
        <div className="space-y-2.5 pb-2">
          {list.map(acc => {
            const isSel = selected === acc.id;
            return (
              <motion.button key={acc.id} whileTap={{scale:0.97}} onClick={()=>{onSelect(acc);onClose();}}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left"
                style={{
                  background: isSel ? `${acc.color}18` : "rgba(255,255,255,0.04)",
                  border: isSel ? `1.5px solid ${acc.color}45` : "1px solid rgba(255,255,255,0.07)",
                }}>
                <div className="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl"
                  style={{background:`${acc.color}22`,border:`1px solid ${acc.color}35`}}>
                  {acc.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold" style={{fontSize:14}}>{acc.name}</p>
                  <p className="text-white/38" style={{fontSize:11}}>{acc.type}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{fontSize:14,color:acc.balance<0?"#F87171":"#4ADE80"}}>
                    {acc.balance<0?"-":""} ₹{Math.abs(acc.balance).toLocaleString("en-IN")}
                  </p>
                  {isSel && <Check className="w-4 h-4 ml-auto mt-0.5" style={{color:acc.color}} />}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Date Picker Modal ─────────────────────────────────────────────────────────
function DatePickerModal({ date, onSelect, onClose }: {
  date: Date; onSelect: (d:Date)=>void; onClose: ()=>void;
}) {
  const [view, setView] = useState(new Date(date));
  const today = new Date(2026,3,1); // April 1, 2026

  const daysInMonth = new Date(view.getFullYear(), view.getMonth()+1, 0).getDate();
  const firstDay    = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
  const cells       = Array.from({length: firstDay + daysInMonth}, (_,i) => i < firstDay ? null : i - firstDay + 1);

  return (
    <motion.div
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 flex items-end"
      style={{background:"rgba(0,0,0,0.8)",backdropFilter:"blur(14px)"}}
      onClick={onClose}>
      <motion.div
        initial={{y:"100%"}} animate={{y:0}} exit={{y:"100%"}}
        transition={{duration:0.28,ease:[0.4,0,0.2,1]}}
        onClick={e=>e.stopPropagation()}
        className="w-full max-w-md mx-auto rounded-t-3xl p-5"
        style={{background:"linear-gradient(180deg,#16203A 0%,#0E1424 100%)",border:"1px solid rgba(255,255,255,0.09)",borderBottom:"none"}}>
        <div className="flex justify-center mb-4">
          <div className="w-9 h-1 rounded-full bg-white/15" />
        </div>
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={()=>setView(v=>new Date(v.getFullYear(),v.getMonth()-1,1))}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/7">
            <ChevronLeft className="w-4 h-4 text-white/55" />
          </button>
          <p className="text-white font-bold" style={{fontSize:16}}>
            {MONTHS_SHORT[view.getMonth()]} {view.getFullYear()}
          </p>
          <button onClick={()=>setView(v=>new Date(v.getFullYear(),v.getMonth()+1,1))}
            className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/7">
            <ChevronRight className="w-4 h-4 text-white/55" />
          </button>
        </div>
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <p key={d} className="text-center text-white/30 font-semibold" style={{fontSize:11}}>{d}</p>
          ))}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7 gap-y-1">
          {cells.map((day,i) => {
            if (!day) return <div key={`e-${i}`} />;
            const thisDate = new Date(view.getFullYear(), view.getMonth(), day);
            const isToday  = thisDate.toDateString() === today.toDateString();
            const isSel    = thisDate.toDateString() === date.toDateString();
            return (
              <motion.button key={day} whileTap={{scale:0.85}}
                onClick={() => { onSelect(thisDate); onClose(); }}
                className="aspect-square rounded-full flex items-center justify-center"
                style={{
                  background: isSel ? "linear-gradient(135deg,#7C5CFF,#4CC9F0)" : isToday ? "rgba(124,92,255,0.18)" : "transparent",
                  boxShadow: isSel ? "0 4px 12px rgba(124,92,255,0.45)" : "none",
                }}>
                <span style={{fontSize:13, fontWeight: isSel||isToday ? 700 : 400,
                  color: isSel ? "white" : isToday ? "#9D7EFF" : "rgba(255,255,255,0.65)"}}>
                  {day}
                </span>
              </motion.button>
            );
          })}
        </div>
        {/* Quick shortcuts */}
        <div className="flex gap-2 mt-4">
          {["Today","Yesterday","This Week"].map(s => (
            <button key={s} onClick={() => {
              const d = new Date(today);
              if(s==="Yesterday") d.setDate(d.getDate()-1);
              else if(s==="This Week") d.setDate(d.getDate()-d.getDay());
              onSelect(d); onClose();
            }}
              className="flex-1 py-2 rounded-xl text-center"
              style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.09)",fontSize:12,color:"rgba(255,255,255,0.55)",fontWeight:600}}>
              {s}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Success Overlay ───────────────────────────────────────────────────────────
function SuccessOverlay({ txType, onDone }: { txType: TxType; onDone: ()=>void }) {
  const icon = txType==="income" ? "💰" : txType==="transfer" ? "🔄" : "💸";
  const color = txType==="income" ? "#22C55E" : txType==="transfer" ? "#4CC9F0" : "#7C5CFF";
  useEffect(() => { const t = setTimeout(onDone, 1800); return ()=>clearTimeout(t); }, []);
  return (
    <motion.div
      initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{background:"rgba(11,15,26,0.94)",backdropFilter:"blur(20px)"}}>
      <motion.div
        initial={{scale:0}} animate={{scale:1}}
        transition={{type:"spring",stiffness:260,damping:18,delay:0.1}}>
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mb-6"
          style={{background:`linear-gradient(135deg,${color}30,${color}18)`,border:`2px solid ${color}50`,boxShadow:`0 0 40px ${color}40`}}>
          {icon}
        </div>
      </motion.div>
      <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:0.3}}>
        <p className="text-white font-bold text-center" style={{fontSize:22}}>Transaction Saved!</p>
        <p className="text-white/38 text-center mt-1" style={{fontSize:14}}>Successfully recorded ✅</p>
      </motion.div>
      <motion.div
        className="absolute bottom-0 left-0 h-1 rounded-full"
        style={{background:`linear-gradient(90deg,${color},transparent)`}}
        initial={{width:"0%"}}
        animate={{width:"100%"}}
        transition={{duration:1.8,ease:"linear"}}
      />
    </motion.div>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────
export function AddTransactionScreen() {
  const navigate = useNavigate();
  const [txType, setTxType]     = useState<TxType>("expense");
  const [amount, setAmount]     = useState("");
  const [catId,  setCatId]      = useState<string|null>(null);
  const [subId,  setSubId]      = useState<string|null>(null);
  const [accId,  setAccId]      = useState("a1");
  const [toAccId,setToAccId]    = useState("a4");
  const [date,   setDate]       = useState(new Date(2026,3,1));
  const [note,   setNote]       = useState("");
  const [recurring,setRecurring]= useState(false);
  const [recurFreq,setRecurFreq]= useState<"daily"|"weekly"|"monthly"|"yearly">("monthly");
  const [aiScanning, setAiScan] = useState(false);
  const [errors, setErrors]     = useState<Record<string,string>>({});
  const [saved,  setSaved]      = useState(false);

  // Modal states
  const [showCalc,    setShowCalc]    = useState(false);
  const [showSubSheet,setShowSubSheet]= useState(false);
  const [showAccSheet,setShowAccSheet]= useState(false);
  const [showToAcc,   setShowToAcc]   = useState(false);
  const [showDate,    setShowDate]    = useState(false);

  // ─── Derive live category list from context ─────────────────────────────────
  // getCatsByType always reflects the latest state from CategoriesScreen.
  const { getCatsByType } = useCategoryContext();
  const cats = getCatsByType(txType === "income" ? "income" : "expense");
  const selectedCat= cats.find(c => c.id === catId);
  const selectedSub= selectedCat?.subs.find(s => s.id === subId);
  const selectedAcc= ACCOUNTS.find(a => a.id === accId)!;
  const selectedTo = ACCOUNTS.find(a => a.id === toAccId);
  const recentIds  = txType === "income" ? RECENT_INCOME_IDS : RECENT_IDS;
  const recentCats = cats.filter(c => recentIds.includes(c.id));

  const typeAccent = txType==="income" ? "#22C55E" : txType==="transfer" ? "#4CC9F0" : "#7C5CFF";
  const typeBg     = txType==="income"
    ? "linear-gradient(135deg,#22C55E 0%,#4CC9F0 100%)"
    : txType==="transfer"
    ? "linear-gradient(135deg,#4CC9F0 0%,#7C5CFF 100%)"
    : "linear-gradient(135deg,#7C5CFF 0%,#F72585 100%)";

  const fmtDate = (d: Date) => {
    const today = new Date(2026,3,1);
    if (d.toDateString()===today.toDateString()) return "Today";
    const yesterday = new Date(2026,3,0);
    if (d.toDateString()===yesterday.toDateString()) return "Yesterday";
    return `${MONTHS_SHORT[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  const resetCat = () => { setCatId(null); setSubId(null); };

  const switchType = (t: TxType) => {
    setTxType(t); resetCat(); setErrors({});
  };

  const validate = () => {
    const e: Record<string,string> = {};
    if (!amount || parseFloat(amount) <= 0) e.amount = "Please enter a valid amount";
    if (txType !== "transfer") {
      if (!catId) e.cat = "Please select a category";
      else if (selectedCat?.subs.length && !subId) e.sub = "Please select a subcategory";
    } else {
      if (accId === toAccId) e.toAcc = "From and To accounts must be different";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaved(true);
  };

  const handleAIScan = () => {
    setAiScan(true);
    setTimeout(() => {
      setAmount("2450"); setCatId("food"); setSubId("fd6");
      setNote("Dinner at restaurant"); setAiScan(false);
    }, 2200);
  };

  return (
    <div className="relative" style={{background:"linear-gradient(180deg,#0B0F1A 0%,#121826 100%)",minHeight:"100vh"}}>
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 pointer-events-none"
        style={{background:`radial-gradient(ellipse at 50% 0%,${typeAccent}14 0%,transparent 70%)`,transition:"background 0.4s"}} />

      <div className="relative z-10 pb-36">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <motion.button whileTap={{scale:0.88}} onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)"}}>
            <ArrowLeft className="w-5 h-5 text-white/70" />
          </motion.button>
          <p className="text-white font-bold" style={{fontSize:17}}>Add Transaction</p>
          <div className="flex gap-2">
            <motion.button whileTap={{scale:0.88}}
              className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)"}}>
              <Bell className="w-4.5 h-4.5 text-white/55" />
            </motion.button>
          </div>
        </div>

        {/* ── Type Toggle ── */}
        <div className="px-4 mb-4">
          <div className="relative flex p-1 rounded-2xl"
            style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.07)"}}>
            <motion.div className="absolute top-1 bottom-1 rounded-xl"
              animate={{
                left: txType==="income" ? 4 : txType==="expense" ? "calc(33.33% + 2px)" : "calc(66.66% + 0px)",
                width: "calc(33.33% - 4px)",
              }}
              transition={{duration:0.3,ease:[0.4,0,0.2,1]}}
              style={{background: typeBg, boxShadow:`0 4px 16px ${typeAccent}35`}} />
            {([
              {id:"expense" as TxType, label:"💸 Expense"},
              {id:"income"  as TxType, label:"💰 Income"},
              {id:"transfer"as TxType, label:"🔄 Transfer"},
            ] as {id:TxType;label:string}[]).map(t => (
              <button key={t.id} onClick={()=>switchType(t.id)}
                className="relative flex-1 py-3 rounded-xl z-10 text-center"
                style={{fontSize:12, fontWeight:700, color: txType===t.id ? "white" : "rgba(255,255,255,0.38)"}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Amount Card ── */}
        <div className="mx-4 mb-4 rounded-3xl overflow-hidden relative"
          style={{
            background:"linear-gradient(135deg,rgba(255,255,255,0.06) 0%,rgba(255,255,255,0.02) 100%)",
            border:`1px solid ${errors.amount ? "#EF4444" : `${typeAccent}30`}`,
            boxShadow:`0 8px 32px ${typeAccent}12`,
          }}>
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
            style={{background:`radial-gradient(circle,${typeAccent}20 0%,transparent 70%)`}} />
          <div className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-1">
              <p style={{fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.38)", letterSpacing:"0.6px"}}>
                {txType==="income" ? "INCOME AMOUNT" : txType==="transfer" ? "TRANSFER AMOUNT" : "EXPENSE AMOUNT"}
              </p>
              <motion.button whileTap={{scale:0.9}} onClick={()=>setShowCalc(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                style={{background:`${typeAccent}18`,border:`1px solid ${typeAccent}30`}}>
                <Calculator className="w-3.5 h-3.5" style={{color:typeAccent}} />
                <span style={{fontSize:11, fontWeight:600, color:typeAccent}}>Calculator</span>
              </motion.button>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="font-bold" style={{fontSize:36, color:`${typeAccent}cc`}}>₹</span>
              <input
                type="text" inputMode="decimal"
                value={amount} onChange={e=>{
                  const v = e.target.value.replace(/[^0-9.]/g,"");
                  if((v.match(/\./g)||[]).length <= 1) setAmount(v);
                }}
                placeholder="0"
                className="flex-1 bg-transparent font-bold text-white focus:outline-none placeholder:text-white/18"
                style={{fontSize:44, letterSpacing:"-1px"}}
              />
            </div>
            {errors.amount && (
              <p className="text-rose-400 mt-2" style={{fontSize:12}}>{errors.amount}</p>
            )}
          </div>
        </div>

        {/* ── Category Section (Income/Expense only) ── */}
        {txType !== "transfer" && (
          <div className="mb-4">
            <div className="px-4 mb-2.5 flex items-center justify-between">
              <p className="text-white/38 font-semibold" style={{fontSize:11, letterSpacing:"0.5px"}}>CATEGORY</p>
              {catId && (
                <button onClick={resetCat}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl"
                  style={{background:"rgba(255,255,255,0.07)",fontSize:11,color:"rgba(255,255,255,0.45)"}}>
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>

            {/* Recent strip */}
            {recentCats.length > 0 && (
              <div className="px-4 mb-2.5">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-3 h-3 text-[#FFB703]" />
                  <p style={{fontSize:11, color:"rgba(255,255,255,0.38)", fontWeight:600}}>RECENT</p>
                </div>
                <div className="flex gap-2">
                  {recentCats.map(c => (
                    <motion.button key={c.id} whileTap={{scale:0.92}}
                      onClick={() => { setCatId(c.id); setSubId(null); setShowSubSheet(true); }}
                      className="flex items-center gap-2 px-3 py-2 rounded-2xl"
                      style={{
                        background: catId===c.id ? `${c.color}22` : "rgba(255,255,255,0.06)",
                        border: catId===c.id ? `1.5px solid ${c.color}45` : "1px solid rgba(255,255,255,0.09)",
                      }}>
                      <span style={{fontSize:14}}>{c.emoji}</span>
                      <span style={{fontSize:12, fontWeight:600, color: catId===c.id ? c.color : "rgba(255,255,255,0.55)"}}>
                        {c.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Category grid */}
            {errors.cat && (
              <p className="px-4 text-rose-400 mb-2" style={{fontSize:12}}>{errors.cat}</p>
            )}
            <div className="px-4">
              <div className="grid grid-cols-4 gap-2">
                {cats.map(c => {
                  const isSel = catId === c.id;
                  return (
                    <motion.button key={c.id} whileTap={{scale:0.9}}
                      onClick={() => {
                        if (catId === c.id) { setShowSubSheet(true); return; }
                        setCatId(c.id); setSubId(null); setErrors(e=>({...e,cat:undefined!}));
                        setShowSubSheet(true);
                      }}
                      className="flex flex-col items-center gap-1.5 py-3 rounded-2xl relative overflow-hidden"
                      style={{
                        background: isSel ? `linear-gradient(135deg,${c.color}28,${c.color}10)` : "rgba(255,255,255,0.05)",
                        border: isSel ? `1.5px solid ${c.color}55` : "1px solid rgba(255,255,255,0.07)",
                        boxShadow: isSel ? `0 4px 14px ${c.color}25` : "none",
                      }}>
                      <span style={{fontSize:18}}>{c.emoji}</span>
                      <span style={{fontSize:9.5, fontWeight:700, textAlign:"center", lineHeight:1.2,
                        color: isSel ? c.color : "rgba(255,255,255,0.45)"}}>
                        {c.name.replace(" &","").replace(" and","").replace("& ","").slice(0,10)}
                      </span>
                      {isSel && (
                        <div className="absolute top-1 right-1 w-3 h-3 rounded-full flex items-center justify-center"
                          style={{background:c.color}}>
                          <Check className="w-2 h-2 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Selected subcategory display */}
            <AnimatePresence>
              {catId && (
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}}
                  exit={{opacity:0,height:0}} transition={{duration:0.22}}
                  className="px-4 mt-3 overflow-hidden">
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl"
                    style={{
                      background: selectedCat ? `${selectedCat.color}10` : "rgba(255,255,255,0.05)",
                      border: `1px solid ${selectedCat?.color ?? "#fff"}22`,
                    }}>
                    <span style={{fontSize:18}}>{selectedCat?.emoji}</span>
                    <div className="flex-1">
                      <p className="text-white font-semibold" style={{fontSize:13}}>{selectedCat?.name}</p>
                      {subId ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span style={{fontSize:12}}>{selectedSub?.emoji}</span>
                          <span className="text-white/55" style={{fontSize:12}}>{selectedSub?.name}</span>
                        </div>
                      ) : (
                        <p style={{fontSize:11, color: errors.sub ? "#F87171" : "rgba(255,255,255,0.35)"}}>
                          {errors.sub || "No subcategory selected"}
                        </p>
                      )}
                    </div>
                    <motion.button whileTap={{scale:0.9}}
                      onClick={()=>setShowSubSheet(true)}
                      className="px-2.5 py-1.5 rounded-xl"
                      style={{background:`${selectedCat?.color}22`,fontSize:11,fontWeight:600,color:selectedCat?.color}}>
                      {subId ? "Change" : "Select ↓"}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Account Section ── */}
        <div className="px-4 mb-4">
          <p className="text-white/38 font-semibold mb-2.5" style={{fontSize:11, letterSpacing:"0.5px"}}>
            {txType==="transfer" ? "FROM ACCOUNT" : "ACCOUNT"}
          </p>
          <motion.button whileTap={{scale:0.98}} onClick={()=>setShowAccSheet(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left"
            style={{
              background:`linear-gradient(135deg,${selectedAcc.color}18 0%,${selectedAcc.color}08 100%)`,
              border:`1px solid ${selectedAcc.color}35`,
            }}>
            <div className="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl"
              style={{background:`${selectedAcc.color}22`,border:`1px solid ${selectedAcc.color}35`}}>
              {selectedAcc.emoji}
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold" style={{fontSize:14}}>{selectedAcc.name}</p>
              <p className="text-white/38" style={{fontSize:11}}>{selectedAcc.type}</p>
            </div>
            <div className="text-right">
              <p className="font-bold" style={{fontSize:14, color:selectedAcc.balance<0?"#F87171":"#4ADE80"}}>
                ₹{Math.abs(selectedAcc.balance).toLocaleString("en-IN")}
              </p>
              <ChevronDown className="w-4 h-4 text-white/30 ml-auto mt-0.5" />
            </div>
          </motion.button>
        </div>

        {/* ── Transfer To Account ── */}
        {txType === "transfer" && (
          <div className="px-4 mb-4">
            <p className="text-white/38 font-semibold mb-2.5" style={{fontSize:11, letterSpacing:"0.5px"}}>TO ACCOUNT</p>
            <motion.button whileTap={{scale:0.98}} onClick={()=>setShowToAcc(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left"
              style={{
                background: selectedTo ? `${selectedTo.color}18` : "rgba(255,255,255,0.05)",
                border: errors.toAcc ? "1px solid #EF4444" : `1px solid ${selectedTo?.color ?? "rgba(255,255,255,0.09)"}35`,
              }}>
              {selectedTo ? (
                <>
                  <div className="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl"
                    style={{background:`${selectedTo.color}22`}}>
                    {selectedTo.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-semibold" style={{fontSize:14}}>{selectedTo.name}</p>
                    <p className="text-white/38" style={{fontSize:11}}>{selectedTo.type}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/30" />
                </>
              ) : (
                <>
                  <div className="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center"
                    style={{background:"rgba(255,255,255,0.07)"}}>
                    <Plus className="w-5 h-5 text-white/30" />
                  </div>
                  <p className="text-white/35 flex-1" style={{fontSize:14}}>Select destination account</p>
                  <ChevronDown className="w-4 h-4 text-white/30" />
                </>
              )}
            </motion.button>
            {errors.toAcc && <p className="text-rose-400 mt-1.5 px-1" style={{fontSize:12}}>{errors.toAcc}</p>}
          </div>
        )}

        {/* ── Date ── */}
        <div className="px-4 mb-4">
          <p className="text-white/38 font-semibold mb-2.5" style={{fontSize:11, letterSpacing:"0.5px"}}>DATE</p>
          <motion.button whileTap={{scale:0.98}} onClick={()=>setShowDate(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl"
            style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)"}}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{background:"rgba(124,92,255,0.18)"}}>
              <Calendar className="w-4 h-4 text-[#9D7EFF]" />
            </div>
            <span className="flex-1 text-left text-white font-semibold" style={{fontSize:14}}>{fmtDate(date)}</span>
            <ChevronDown className="w-4 h-4 text-white/30" />
          </motion.button>
        </div>

        {/* ── Note ── */}
        <div className="px-4 mb-4">
          <p className="text-white/38 font-semibold mb-2.5" style={{fontSize:11, letterSpacing:"0.5px"}}>NOTE</p>
          <textarea
            value={note} onChange={e=>setNote(e.target.value)}
            placeholder="Add a note…" rows={2}
            className="w-full px-4 py-3.5 rounded-2xl text-white placeholder:text-white/22 focus:outline-none resize-none"
            style={{
              background:"rgba(255,255,255,0.05)",
              border:`1px solid ${note ? `${typeAccent}35` : "rgba(255,255,255,0.09)"}`,
              fontSize:14,transition:"border-color 0.2s",
            }} />
        </div>

        {/* ── Attachments ── */}
        <div className="px-4 mb-4">
          <p className="text-white/38 font-semibold mb-2.5" style={{fontSize:11, letterSpacing:"0.5px"}}>ATTACHMENTS</p>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              {icon:<Camera className="w-5 h-5" />,  label:"Camera",  bg:"rgba(124,92,255,0.12)"},
              {icon:<ImageIcon className="w-5 h-5" />,label:"Gallery", bg:"rgba(76,201,240,0.12)"},
            ].map(b => (
              <motion.button key={b.label} whileTap={{scale:0.96}}
                className="flex items-center justify-center gap-2.5 py-3.5 rounded-2xl"
                style={{background:b.bg,border:"1px solid rgba(255,255,255,0.09)"}}>
                <span className="text-white/55">{b.icon}</span>
                <span className="text-white/55 font-semibold" style={{fontSize:13}}>{b.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── AI Scan ── */}
        <div className="px-4 mb-4">
          <motion.button
            whileTap={{scale:0.97}}
            onClick={handleAIScan}
            disabled={aiScanning}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl relative overflow-hidden"
            style={{
              background:"linear-gradient(135deg,#7C5CFF 0%,#4CC9F0 100%)",
              boxShadow:"0 8px 28px rgba(124,92,255,0.42)",
              animation: aiScanning ? "none" : "aiGlow 2.5s ease-in-out infinite",
            }}>
            {aiScanning ? (
              <>
                <motion.div
                  animate={{rotate:360}} transition={{duration:1,repeat:Infinity,ease:"linear"}}
                  className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white" />
                <span className="text-white font-bold" style={{fontSize:14}}>Scanning Receipt…</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-white" />
                <span className="text-white font-bold" style={{fontSize:14}}>Scan Receipt with AI</span>
                <ScanLine className="w-4 h-4 text-white/70" />
              </>
            )}
          </motion.button>
        </div>

        {/* ── Recurring ── */}
        <div className="px-4 mb-6">
          <div className="px-4 py-3.5 rounded-2xl"
            style={{
              background: recurring ? "rgba(124,92,255,0.10)" : "rgba(255,255,255,0.04)",
              border: recurring ? "1px solid rgba(124,92,255,0.3)" : "1px solid rgba(255,255,255,0.07)",
            }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{background: recurring ? "rgba(124,92,255,0.22)" : "rgba(255,255,255,0.07)"}}>
                  <Repeat className="w-4 h-4" style={{color: recurring ? "#9D7EFF" : "rgba(255,255,255,0.35)"}} />
                </div>
                <div>
                  <p className="text-white font-semibold" style={{fontSize:14}}>Recurring Transaction</p>
                  <p className="text-white/35" style={{fontSize:11}}>Repeat {recurFreq}</p>
                </div>
              </div>
              <motion.button whileTap={{scale:0.9}}
                onClick={()=>setRecurring(v=>!v)}
                className="w-12 h-6 rounded-full relative flex-shrink-0"
                style={{background: recurring ? "linear-gradient(135deg,#7C5CFF,#4CC9F0)" : "rgba(255,255,255,0.12)"}}>
                <motion.div
                  animate={{x: recurring ? 24 : 2}}
                  transition={{duration:0.22,ease:[0.4,0,0.2,1]}}
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white"
                  style={{boxShadow:"0 2px 6px rgba(0,0,0,0.3)"}} />
              </motion.button>
            </div>
            {/* Frequency chips */}
            <AnimatePresence>
              {recurring && (
                <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}}
                  exit={{height:0,opacity:0}} transition={{duration:0.22}}
                  className="overflow-hidden">
                  <div className="flex gap-2 mt-3 pt-3"
                    style={{borderTop:"1px solid rgba(255,255,255,0.07)"}}>
                    {(["daily","weekly","monthly","yearly"] as const).map(f => (
                      <motion.button key={f} whileTap={{scale:0.92}}
                        onClick={()=>setRecurFreq(f)}
                        className="flex-1 py-2 rounded-xl capitalize"
                        style={{
                          background: recurFreq===f ? "rgba(124,92,255,0.3)" : "rgba(255,255,255,0.06)",
                          border: recurFreq===f ? "1px solid rgba(124,92,255,0.5)" : "1px solid transparent",
                          fontSize:11, fontWeight:700,
                          color: recurFreq===f ? "#9D7EFF" : "rgba(255,255,255,0.38)",
                        }}>
                        {f}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Sticky Save Button ── */}
      <div className="fixed bottom-16 left-0 right-0 z-40 px-4 pb-2 max-w-md mx-auto"
        style={{background:"linear-gradient(0deg,#0B0F1A 60%,transparent 100%)"}}>
        <motion.button
          whileTap={{scale:0.97}}
          onClick={handleSave}
          className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
          style={{
            background: typeBg,
            boxShadow:`0 8px 28px ${typeAccent}50`,
            fontSize:15,
          }}>
          <Check className="w-5 h-5" strokeWidth={2.5} />
          Save Transaction
        </motion.button>
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showCalc && <CalcModal key="calc" value={amount} onChange={setAmount} onClose={()=>setShowCalc(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showSubSheet && selectedCat && (
          <SubcategorySheet
            key="sub"
            cat={selectedCat}
            selectedSubId={subId}
            onSelect={s => { setSubId(s.id); setErrors(e=>({...e,sub:undefined!})); setShowSubSheet(false); }}
            onClose={()=>setShowSubSheet(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAccSheet && (
          <AccountSheet key="acc" selected={accId} excludeId={txType==="transfer"?toAccId:undefined}
            onSelect={a=>setAccId(a.id)} onClose={()=>setShowAccSheet(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showToAcc && (
          <AccountSheet key="to-acc" selected={toAccId} excludeId={accId}
            onSelect={a=>setToAccId(a.id)} onClose={()=>setShowToAcc(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showDate && (
          <DatePickerModal key="date" date={date} onSelect={setDate} onClose={()=>setShowDate(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {saved && <SuccessOverlay key="success" txType={txType} onDone={()=>navigate("/dashboard/transactions")} />}
      </AnimatePresence>

      <style>{`
        @keyframes aiGlow {
          0%,100% { box-shadow: 0 8px 28px rgba(124,92,255,0.42); }
          50%      { box-shadow: 0 8px 48px rgba(124,92,255,0.72), 0 0 0 8px rgba(124,92,255,0.10); }
        }
      `}</style>
    </div>
  );
}