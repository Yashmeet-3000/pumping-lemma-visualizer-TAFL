"use client";
import { useState, useEffect } from "react";

// --- HELPERS & CONSTANTS ---
const SUPS = ['⁰', '¹', '²', '³', '⁴', '⁵'];

const LANGS = {
  anbn: {
    label: "aⁿbⁿ", cat: "CLASSIC",
    gen: (p) => 'a'.repeat(p) + 'b'.repeat(p),
    decompose: (s, p) => ({ x: 'a', y: 'a'.repeat(Math.min(2, p)), z: s.slice(1 + Math.min(2, p)) }),
    pump: (x, y, z, i) => x + y.repeat(i) + z,
    check: (s) => {
      if (s.length % 2 !== 0) return false;
      const h = s.length / 2;
      return [...s.slice(0, h)].every(c => c === 'a') && [...s.slice(h)].every(c => c === 'b');
    },
    condition: "aⁿbⁿ (equal a's and b's)",
  },
  zeroOne: {
    label: "0ⁿ11ⁿ", cat: "BINARY",
    gen: (p) => '0'.repeat(p) + '1' + '1'.repeat(p),
    decompose: (s, p) => ({ x: '0', y: '0'.repeat(Math.min(2, p)), z: s.slice(1 + Math.min(2, p)) }),
    pump: (x, y, z, i) => x + y.repeat(i) + z,
    check: (s) => {
      if (!/^0+1+$/.test(s)) return false;
      const zeros = (s.match(/0/g) || []).length;
      const ones = (s.match(/1/g) || []).length;
      return ones === zeros + 1;
    },
    condition: "0ⁿ11ⁿ (one more '1' than '0')",
  },
  anbmck: {
    label: "aⁿbᵐcᵏ", cat: "COMPLEX",
    gen: (p) => 'a'.repeat(p) + 'b'.repeat(p) + 'c'.repeat(p + 1),
    decompose: (s, p) => ({ x: 'a', y: 'a'.repeat(Math.min(2, p)), z: s.slice(1 + Math.min(2, p)) }),
    pump: (x, y, z, i) => x + y.repeat(i) + z,
    check: (s) => {
      let ia = 0, ib = 0, ic = 0;
      for (const c of s) { if (c === 'a') ia++; else if (c === 'b') ib++; else if (c === 'c') ic++; }
      return ia === ib || ib <= ic;
    },
    condition: "n=m or m≤k",
  },
  palindrome: {
    label: "wwᴿ (Palindrome)", cat: "PATTERN",
    gen: (p) => 'a'.repeat(p) + 'b' + 'b' + 'a'.repeat(p),
    decompose: (s, p) => ({ x: 'a', y: 'a'.repeat(Math.min(2, p)), z: s.slice(1 + Math.min(2, p)) }),
    pump: (x, y, z, i) => x + y.repeat(i) + z,
    check: (s) => {
      if (s.length % 2 !== 0) return false;
      const h = s.length / 2;
      return s.slice(0, h) === s.slice(h).split('').reverse().join('');
    },
    condition: "wwᴿ (symmetric palindrome)",
  },
  perfectSquare: {
    label: "a^(n²)", cat: "MATH",
    gen: (p) => 'a'.repeat(p * p),
    decompose: (s, p) => ({ x: 'a', y: 'a'.repeat(Math.min(2, p)), z: s.slice(1 + Math.min(2, p)) }),
    pump: (x, y, z, i) => x + y.repeat(i) + z,
    check: (s) => {
      if (!/^a+$/.test(s)) return false;
      const root = Math.sqrt(s.length);
      return root === Math.floor(root);
    },
    condition: "length is a perfect square",
  }
};

export default function Home() {
  // --- STATE ---
  const [langKey, setLangKey] = useState("anbn");
  const [p, setP] = useState(3);
  const [i, setI] = useState(2);
  const [parts, setParts] = useState({ x: "", y: "", z: "", baseStr: "" });

  // --- LOGIC ---
  useEffect(() => {
    const lang = LANGS[langKey];
    const baseStr = lang.gen(p);
    const { x, y, z } = lang.decompose(baseStr, p);
    setParts({ x, y, z, baseStr });
  }, [langKey, p]);

  const lang = LANGS[langKey];
  const { x, y, z, baseStr } = parts;
  const pumped = lang.pump(x, y, z, i);
  const isValid = lang.check(pumped);
  const xyValid = x.length + y.length <= p && y.length >= 1;

  // --- Vibrant Node Component ---
  const NodeGroup = ({ chars, label, theme }) => {
    const themes = {
      violet: { border: "border-violet-400/50", text: "text-violet-600", bg: "bg-white/25", line: "bg-violet-500" },
      primary: { border: "border-[#6a37d4]/20", text: "text-[#6a37d4]", bg: "bg-white/25 shadow-[#6a37d4]/30", line: "bg-[#6a37d4]" },
      slate: { border: "border-slate-300/50", text: "text-slate-500", bg: "bg-white/25", line: "bg-slate-300" }
    };
    const t = themes[theme] || themes.slate;

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-1 min-h-[64px]">
          {chars.length === 0 ? (
             <div className={`shrink-0 w-12 h-16 rounded-xl border border-dashed flex items-center justify-center text-xs opacity-50 ${t.border} ${t.text}`}>∅</div>
          ) : (
            chars.map((char, idx) => (
              <div key={`${char}-${idx}`} className={`shrink-0 w-12 h-16 rounded-xl border flex items-center justify-center text-2xl font-black backdrop-blur-md ${t.border} ${t.text} ${t.bg}`}>
                {char}
              </div>
            ))
          )}
        </div>
        <div className={`h-1.5 w-full rounded-full ${t.line}`}></div>
        <span className={`text-sm font-bold uppercase tracking-widest whitespace-nowrap ${t.text}`}>{label}</span>
      </div>
    );
  };

  // --- RENDER ---
  return (
    <div 
      className="min-h-screen text-[#2c2f31] font-sans antialiased overflow-x-hidden selection:bg-[#6a37d4]/20"
      style={{
        backgroundImage: `radial-gradient(at 0% 0%, #00e5ff 0px, transparent 50%),
                          radial-gradient(at 50% 0%, #ff00ff 0px, transparent 50%),
                          radial-gradient(at 100% 0%, #ffff00 0px, transparent 50%),
                          radial-gradient(at 100% 100%, #8a2be2 0px, transparent 50%),
                          radial-gradient(at 0% 100%, #00ffff 0px, transparent 50%)`,
        backgroundColor: "#f5f7f9",
        backgroundAttachment: "fixed"
      }}
    >
      
      {/* Decorative Blur Orbs */}
      <div className="fixed top-1/4 -left-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="fixed bottom-1/4 -right-20 w-96 h-96 bg-magenta-400/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 h-16 bg-white/30 backdrop-blur-xl rounded-full mt-4 mx-4 border border-white/50 shadow-[0px_20px_40px_rgba(44,47,49,0.06)]">
        <div className="flex items-center gap-4">
          <span className="text-xl font-black text-violet-600 tracking-widest uppercase">PUMPING LEMMA VISUALIZER</span>
        </div>
      </nav>

      {/* MAIN LAYOUT */}
      <main className="pt-28 px-4 md:px-8 pb-8 flex flex-col md:flex-row gap-8 min-h-screen max-w-[1600px] mx-auto">
        
        {/* SIDEBAR */}
        <aside className="w-full md:w-80 flex flex-col gap-6 shrink-0">
          <div className="bg-white/30 backdrop-blur-2xl rounded-[2rem] border-l border-t border-white/50 shadow-xl shadow-slate-200/50 p-6 flex flex-col gap-6">
            <div>
              <h2 className="uppercase text-xs tracking-widest text-violet-600 font-bold mb-1">Parameters</h2>
              <p className="text-[#2c2f31]/60 text-xs font-semibold">Automata Theory</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2c2f31]/50">Language Definition</label>
                <div className="relative">
                  <select 
                    value={langKey} 
                    onChange={(e) => { setLangKey(e.target.value); setI(2); }}
                    className="w-full bg-white/40 backdrop-blur-md border border-white/50 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-[#6a37d4] appearance-none outline-none cursor-pointer"
                  >
                    {Object.entries(LANGS).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#2c2f31]/50">Pumping Length (p)</label>
                <input 
                  type="number" 
                  value={p} 
                  onChange={(e) => setP(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-white/40 backdrop-blur-md border border-white/50 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-[#6a37d4] outline-none"
                />
              </div>

              <div className="p-4 bg-white/40 backdrop-blur-md border border-white/50 rounded-2xl">
                <label className="text-[10px] uppercase tracking-widest font-bold text-[#6a37d4]/70 block mb-2">Base String (s)</label>
                <div className="text-lg font-bold tracking-widest text-[#6a37d4] break-all font-mono">
                  {baseStr}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* WORKSPACE */}
        <section className="flex-1 flex flex-col gap-8 overflow-hidden">
          
          {/* VISUALIZATION STAGE */}
          <div className="bg-white/30 backdrop-blur-2xl border border-white/50 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-800">String Decomposition</h1>
                <p className="text-slate-600 font-medium">Visualize how the string <span className="font-bold text-[#6a37d4]">s = xyz</span> is partitioned</p>
              </div>
            </div>

            {/* The Layout Fix: Overflow wrapper with inner w-max container */}
            <div className="w-full overflow-x-auto py-12 pb-6 relative z-10">
              <div className="flex items-end gap-6 mx-auto w-max px-4">
                <NodeGroup chars={x.split('')} label="x (prefix)" theme="violet" />
                <NodeGroup chars={y.repeat(i).split('')} label={`y${SUPS[i] || i} (pumped)`} theme="primary" />
                <NodeGroup chars={z.split('')} label="z (suffix)" theme="slate" />
              </div>
            </div>
          </div>

          {/* CONTROLS & STATS */}
          <div className="bg-white/30 backdrop-blur-2xl border border-white/50 rounded-[2rem] p-8 shadow-xl shadow-slate-200/50">
            <div className="flex flex-col xl:flex-row gap-12 items-center">
              
              <div className="flex-1 w-full space-y-6">
                <div className="flex justify-between items-end">
                  <h3 className="font-bold text-xl text-slate-800">Iteration Control</h3>
                  <div className="text-[#6a37d4] font-bold text-3xl">i = {i}</div>
                </div>
                <div className="px-2 relative">
                  <input 
                    type="range" min="0" max="5" value={i} 
                    onChange={(e) => setI(parseInt(e.target.value))}
                    className="w-full h-3 bg-white/50 rounded-full appearance-none cursor-pointer accent-[#6a37d4]"
                  />
                  <div className="flex justify-between mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <span>Empty (0)</span>
                    <span>Standard (1)</span>
                    <span>Pumping (2-5)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full xl:w-auto">
                <div className="px-6 py-4 bg-white/40 border border-white/50 rounded-2xl text-center shadow-sm">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">P (Length)</div>
                  <div className="text-2xl font-black text-slate-800">{p}</div>
                </div>
                <div className="px-6 py-4 bg-white/40 border border-white/50 rounded-2xl text-center shadow-sm">
                  <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">|xyⁱz|</div>
                  <div className="text-2xl font-black text-slate-800">{pumped.length}</div>
                </div>
                <div className={`px-6 py-4 border rounded-2xl text-center shadow-sm ${xyValid ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className={`text-[10px] font-bold uppercase mb-1 ${xyValid ? 'text-emerald-700' : 'text-red-700'}`}>|xy|≤p, |y|≥1</div>
                  <div className={`text-2xl font-black ${xyValid ? 'text-emerald-600' : 'text-red-600'}`}>{xyValid ? 'YES' : 'NO'}</div>
                </div>
                <div className={`px-6 py-4 border rounded-2xl text-center shadow-sm ${isValid ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className={`text-[10px] font-bold uppercase mb-1 ${isValid ? 'text-emerald-700' : 'text-red-700'}`}>Valid in L</div>
                  <div className={`text-2xl font-black ${isValid ? 'text-emerald-600' : 'text-red-600'}`}>{isValid ? 'YES' : 'NO'}</div>
                </div>
              </div>
              
            </div>
          </div>

          {/* BOTTOM PANELS: NOTES & THEORY */}
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Dynamic Analysis Note */}
            <div className={`bg-white/30 backdrop-blur-2xl rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 border-l-8 ${isValid ? 'border-l-emerald-500 border-t border-r border-b border-white/50' : 'border-l-red-500 border-t border-r border-b border-white/50'}`}>
              <div className="flex items-center gap-3 mb-4">
                <h4 className="font-bold text-lg text-slate-800">Dynamic Analysis</h4>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                The resulting string is <span className="font-mono font-bold text-[#6a37d4] break-all">'{pumped}'</span>.
                <br/><br/>
                {isValid 
                  ? `This string satisfies the condition: ${lang.condition}. The contradiction has not yet been proven.` 
                  : <span>This string VIOLATES the condition. This proves the language is <strong className="text-red-600">NOT regular</strong>.</span>}
              </p>
              
              <div className="mt-6 flex flex-wrap gap-2">
                <span className={`text-[10px] font-bold uppercase py-1.5 px-3 rounded-full ${i === 1 ? 'bg-blue-500/10 text-blue-700 border border-blue-500/20' : isValid ? 'bg-amber-500/10 text-amber-700 border border-amber-500/20' : 'bg-red-500/10 text-red-700 border border-red-500/20'}`}>
                   {i === 1 ? "Neutral State (i=1)" : isValid ? `Condition holds for i=${i}` : "Pumping Lemma Disproved"}
                </span>
              </div>
            </div>

            {/* Theory Text */}
            <div className="bg-white/30 backdrop-blur-2xl rounded-[2rem] p-6 border-l-8 border-l-violet-500 border-t border-r border-b border-white/50 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-3 mb-4">
                <h4 className="font-bold text-lg text-slate-800">Formal Theorem</h4>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                For any regular language <span className="italic font-serif">L</span>, there exists a pumping length <span className="italic font-serif">p</span> such that any string <span className="italic font-serif">w</span> in <span className="italic font-serif">L</span> (where <span className="italic font-serif">|w| ≥ p</span>) can be divided into <span className="font-bold text-violet-600">w = xyz</span> satisfying:
              </p>
              <ol className="list-decimal list-inside text-sm text-slate-700 mt-4 space-y-2 font-medium">
                <li><strong className="text-violet-600">|y| ≥ 1</strong> (The middle cannot be empty)</li>
                <li><strong className="text-violet-600">|xy| ≤ p</strong> (The prefix and pump fall within p)</li>
                <li><strong className="text-violet-600">xyⁱz ∈ L</strong> for all i ≥ 0 (It can be pumped)</li>
              </ol>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}