"use client";
import { useState, useEffect } from "react";

// --- HELPERS & CONSTANTS ---
const SUPS = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];

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
  const [langKey, setLangKey] = useState("anbn");
  const [p, setP] = useState(3);
  const [i, setI] = useState(2);
  const [parts, setParts] = useState({ x: "", y: "", z: "", baseStr: "" });

  useEffect(() => {
    const lang = LANGS[langKey];
    const baseStr = lang.gen(p);
    const { x, y, z } = lang.decompose(baseStr, p);
    setParts({ x, y, z, baseStr });
  }, [langKey, p]);

  const lang = LANGS[langKey];
  const { x, y, z, baseStr } = parts;
  const pumpedY = y.repeat(i);
  const pumped = x + pumpedY + z;
  const isValid = lang.check(pumped);
  
  const initialXYLength = x.length + y.length;
  const isDecompositionValid = initialXYLength <= p && y.length >= 1;

  const NodeGroup = ({ chars, label, theme, delayStart = 0 }) => {
    const themes = {
      violet: { border: "border-white/40", text: "text-violet-700", bg: "bg-white/20 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]", line: "bg-violet-500/50" },
      primary: { border: "border-white/60", text: "text-[#6a37d4]", bg: "bg-white/40 shadow-[inset_0_2px_6px_rgba(255,255,255,0.6)]", line: "bg-[#6a37d4]/50" },
      slate: { border: "border-white/30", text: "text-slate-600", bg: "bg-white/10 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]", line: "bg-slate-300/50" }
    };
    const t = themes[theme] || themes.slate;

    return (
      <div className="flex flex-col items-center gap-5">
        <div className="flex gap-1.5 min-h-[70px] items-center">
          {chars.length === 0 ? (
             <div className="shrink-0 w-12 h-12 rounded-full border border-dashed border-white/40 flex items-center justify-center text-xs opacity-50">∅</div>
          ) : (
            chars.map((char, idx) => (
              <div 
                key={`${char}-${idx}`} 
                style={{ animationDelay: `${(delayStart + idx) * 0.08}s` }}
                className={`shrink-0 w-12 h-12 rounded-full border flex items-center justify-center text-xl font-bold backdrop-blur-sm animate-energetic-bounce ${t.border} ${t.text} ${t.bg}`}
              >
                {char}
              </div>
            ))
          )}
        </div>
        <div className="w-full h-[2px] relative flex justify-center">
            <div className={`h-full w-full rounded-full ${t.line}`}></div>
        </div>
        <span className={`text-[10px] font-black uppercase tracking-widest whitespace-nowrap px-3 py-1 bg-white/20 rounded-full border border-white/30 ${t.text}`}>{label}</span>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen text-[#2c2f31] font-sans antialiased overflow-x-hidden"
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
      <style>{`
        @keyframes energeticBounce {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-16px) scale(1.05); }
        }
        .animate-energetic-bounce { animation: energeticBounce 2.2s ease-in-out infinite; }
      `}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-8 h-16 bg-white/30 backdrop-blur-xl rounded-full mt-4 mx-4 border border-white/50 shadow-lg">
        <span className="text-xl font-black text-violet-600 tracking-widest uppercase">PUMPING LEMMA VISUALIZER</span>
      </nav>

      <main className="pt-28 px-4 md:px-8 pb-8 flex flex-col md:flex-row gap-8 min-h-screen max-w-[1600px] mx-auto">
        <aside className="w-full md:w-80 flex flex-col gap-6 shrink-0">
          <div className="bg-white/30 backdrop-blur-2xl rounded-[2rem] border-l border-t border-white/50 shadow-xl p-6 flex flex-col gap-6">
            <h2 className="uppercase text-xs tracking-widest text-violet-600 font-bold">Parameters</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Language Definition</label>
                <div className="relative">
                  <select 
                    value={langKey} 
                    onChange={(e) => setLangKey(e.target.value)} 
                    className="w-full bg-white/10 backdrop-blur-md border border-white/30 rounded-full px-5 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-violet-400 appearance-none transition-all cursor-pointer"
                  >
                    {Object.entries(LANGS).map(([key, val]) => <option key={key} value={key} className="bg-white text-slate-800">{val.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-bold opacity-50">Pumping Length (p)</label>
                <input type="number" value={p} onChange={(e) => setP(Math.max(1, parseInt(e.target.value) || 1))} className="w-full bg-white/40 border border-white/50 rounded-full px-5 py-3 text-sm font-bold outline-none" />
              </div>
              <div className="p-4 bg-white/40 border border-white/50 rounded-2xl shadow-inner">
                <label className="text-[10px] uppercase font-bold text-violet-600 block mb-2">Base String (s)</label>
                <div className="text-lg font-bold tracking-widest break-all font-mono text-[#6a37d4]">{baseStr}</div>
              </div>
            </div>
          </div>

          <div className="bg-white/30 backdrop-blur-2xl rounded-[2rem] border-l border-t border-white/50 shadow-xl p-6">
             <h2 className="uppercase text-xs tracking-widest text-violet-600 font-bold mb-4">Lemma Checklist</h2>
             <ul className="space-y-4">
                <li className="flex items-center gap-3 text-xs font-bold text-emerald-600">
                    <span className="w-5 h-5 flex items-center justify-center bg-emerald-500 text-white rounded-full text-[10px] shadow-sm">✓</span>
                    |y| ≥ 1 (Non-empty)
                </li>
                <li className={`flex items-center gap-3 text-xs font-bold transition-all duration-500 ${isDecompositionValid ? 'text-emerald-600' : 'text-red-600'}`}>
                    <div className="relative w-5 h-5 transition-all duration-500" style={{ transform: isDecompositionValid ? 'rotateY(0deg)' : 'rotateY(180deg)', transformStyle: 'preserve-3d' }}>
                        <span className="absolute inset-0 flex items-center justify-center bg-emerald-500 text-white rounded-full text-[10px] shadow-sm" style={{ backfaceVisibility: 'hidden' }}>✓</span>
                        <span className="absolute inset-0 flex items-center justify-center bg-red-500 text-white rounded-full text-[10px] shadow-sm" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>✕</span>
                    </div>
                    |xy| ≤ p ({initialXYLength} ≤ {p})
                </li>
                <li className={`flex items-center gap-3 text-xs font-bold transition-all duration-500 ${isValid ? 'text-emerald-600' : 'text-red-600'}`}>
                    <div className="relative w-5 h-5 transition-all duration-500" style={{ transform: isValid ? 'rotateY(0deg)' : 'rotateY(180deg)', transformStyle: 'preserve-3d' }}>
                        <span className="absolute inset-0 flex items-center justify-center bg-emerald-500 text-white rounded-full text-[10px] shadow-sm" style={{ backfaceVisibility: 'hidden' }}>✓</span>
                        <span className="absolute inset-0 flex items-center justify-center bg-red-500 text-white rounded-full text-[10px] shadow-sm" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>✕</span>
                    </div>
                    xyⁱz ∈ L (Valid String)
                </li>
             </ul>
          </div>
        </aside>

        <section className="flex-1 flex flex-col gap-8 overflow-hidden">
          <div className="bg-white/30 backdrop-blur-2xl border border-white/50 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
            <h1 className="text-2xl font-black mb-1">String Decomposition</h1>
            <p className="text-xs font-medium text-slate-600 mb-8 uppercase">Split: <span className="text-violet-600">x</span> + <span className="text-[#6a37d4] font-bold">yⁱ</span> + <span className="text-slate-500">z</span></p>

            <div className="w-full overflow-x-auto py-12 pb-6 [&::-webkit-scrollbar]:h-2.5 [&::-webkit-scrollbar-track]:bg-white/20 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-violet-400 [&::-webkit-scrollbar-thumb]:rounded-full">
              <div className="flex items-end gap-10 mx-auto w-max px-8">
                <NodeGroup chars={x.split('')} label="X (PREFIX)" theme="violet" />
                <NodeGroup chars={pumpedY.split('')} label={`Y${SUPS[i] || i} (PUMPED)`} theme="primary" delayStart={x.length} />
                <NodeGroup chars={z.split('')} label="Z (SUFFIX)" theme="slate" delayStart={x.length + pumpedY.length} />
              </div>
            </div>
          </div>

          <div className="bg-white/30 backdrop-blur-2xl border border-white/50 rounded-[2rem] p-8 shadow-xl">
             <div className="flex flex-col xl:flex-row gap-12 items-center">
                <div className="flex-1 w-full space-y-10">
                   {/* FIXED ALIGNMENT: items-baseline + whitespace-nowrap ensures i = 2 is one line and centered */}
                   <div className="flex justify-between items-center mb-2">
                      <h3 className="font-bold text-xl leading-none">Iteration Control</h3>
                      <div className="text-[#6a37d4] font-black text-4xl leading-none whitespace-nowrap">i = {i}</div>
                   </div>
                   <input type="range" min="0" max="5" value={i} onChange={(e) => setI(parseInt(e.target.value))} className="w-full h-3 bg-white/50 rounded-full appearance-none cursor-pointer accent-[#6a37d4]" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full xl:w-auto font-bold text-center">
                   <div className="px-6 py-4 bg-white/40 border border-white/50 rounded-2xl shadow-sm"><div className="text-[9px] text-slate-500 uppercase">Length</div><div className="text-xl font-black">{pumped.length}</div></div>
                   <div className="px-6 py-4 bg-white/40 border border-white/50 rounded-2xl shadow-sm"><div className="text-[9px] text-slate-500 uppercase">P Val</div><div className="text-xl font-black">{p}</div></div>
                   <div className={`px-6 py-4 border rounded-2xl shadow-md transition-all duration-300 ${isDecompositionValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-red-500/10 border-red-500/30 text-red-600'}`}>
                      <div className="text-[9px] uppercase leading-none mb-1">|xy| ≤ p (Initial)</div>
                      <div className="text-xl font-black leading-none">{isDecompositionValid ? 'YES' : 'NO'}</div>
                   </div>
                   <div className={`px-6 py-4 border rounded-2xl shadow-md transition-all duration-300 ${isValid ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600' : 'bg-red-500/10 border-red-500/30 text-red-600'}`}>
                      <div className="text-[9px] uppercase leading-none mb-1">Valid in L</div>
                      <div className="text-xl font-black leading-none">{isValid ? 'YES' : 'NO'}</div>
                   </div>
                </div>
             </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
             <div className={`bg-white/30 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-xl border-l-8 transition-all duration-500 flex flex-col justify-between ${isValid ? 'border-l-emerald-500' : 'border-l-red-500'}`}>
                <div>
                  <h4 className="font-bold text-xl mb-6">Dynamic Analysis</h4>
                  <div className="space-y-6">
                    <p className="text-sm font-medium">The resulting string is <span className="font-mono font-bold text-violet-700 bg-white/40 px-2 py-1 rounded shadow-sm">'{pumped}'</span>.</p>
                    <p className="text-sm font-medium leading-relaxed">
                      {isValid 
                        ? `This string satisfies the condition. The condition for ${lang.label} is currently maintained.` 
                        : <span>This string <span className="font-bold text-red-600 uppercase tracking-tight">Violates</span> the condition. This proves the language is <span className="font-bold text-red-600 text-base">NOT regular</span>.</span>}
                    </p>
                  </div>
                </div>
                <div className="mt-8">
                  <div className={`inline-block px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${isValid ? 'bg-emerald-500/20 text-emerald-700' : 'bg-red-500/20 text-red-700'}`}>
                    {isValid ? "Condition Maintained" : "Pumping Lemma Disproved"}
                  </div>
                </div>
             </div>

             <div className="bg-white/30 backdrop-blur-2xl rounded-[2.5rem] p-8 border-l-8 border-l-violet-500 border-t border-r border-b border-white/50 shadow-xl">
              <h4 className="font-bold text-xl text-slate-800 mb-4">Formal Theorem</h4>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                For any regular language <span className="italic font-serif">L</span>, there exists a pumping length <span className="italic font-serif">p</span> such that any string <span className="italic font-serif">w</span> in <span className="italic font-serif">L</span> (where <span className="italic font-serif">|w| ≥ p</span>) can be divided into <span className="font-bold text-violet-600">w = xyz</span> satisfying:
              </p>
              <ol className="list-decimal list-inside text-sm text-slate-700 mt-6 space-y-3 font-bold">
                <li><span className="text-violet-600 text-lg">|y| ≥ 1</span> (The middle cannot be empty)</li>
                <li><span className="text-violet-600 text-lg">|xy| ≤ p</span> (Prefix and pump fall within p)</li>
                <li><span className="text-violet-600 text-lg">xyⁱz ∈ L</span> for all i ≥ 0 (Can be pumped)</li>
              </ol>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}