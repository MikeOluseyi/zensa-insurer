"use client";

import { useEffect, useState } from "react";
import { X, Plus, Trash2, Loader2, Search } from "lucide-react";
import { PlanAPI, Plan, CoverageRule, CPTCode, ICD10Code } from "@/services/plans";

export default function PlanRulesModal({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const [rules, setRules] = useState<CoverageRule[]>([]);
  const [loading, setLoading] = useState(true);

  const [codeType, setCodeType] = useState<"CPT" | "ICD10">("CPT");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<(CPTCode | ICD10Code)[]>([]);
  const [selectedCode, setSelectedCode] = useState<CPTCode | ICD10Code | null>(null);
  const [covered, setCovered] = useState(true);
  const [requiresAuth, setRequiresAuth] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => { loadRules(); }, []);

  async function loadRules() {
    setLoading(true);
    try { setRules(await PlanAPI.getRules(plan.id)); }
    finally { setLoading(false); }
  }

  async function doSearch(term: string) {
    setSearch(term);
    setSelectedCode(null);
    if (!term.trim()) { setResults([]); return; }
    const data = codeType === "CPT" ? await PlanAPI.searchCPT(term) : await PlanAPI.searchICD10(term);
    setResults(data);
  }

  async function addRule() {
    if (!selectedCode) return;
    setAdding(true);
    try {
      await PlanAPI.addRule(plan.id, {
        cptCodeId: codeType === "CPT" ? selectedCode.id : undefined,
        icd10Id: codeType === "ICD10" ? selectedCode.id : undefined,
        covered,
        requiresAuthorization: requiresAuth,
      });
      setSearch(""); setResults([]); setSelectedCode(null); setCovered(true); setRequiresAuth(false);
      loadRules();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to add rule.");
    } finally {
      setAdding(false);
    }
  }

  async function removeRule(ruleId: string) {
    try { await PlanAPI.deleteRule(ruleId); loadRules(); }
    catch (err: any) { alert(err.response?.data?.error || "Failed to remove rule."); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Coverage Rules</h2>
            <p className="text-xs text-slate-500">{plan.name}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X size={18} /></button>
        </div>

        <div className="px-6 py-4 border-b border-slate-100 space-y-3 shrink-0">
          <div className="flex gap-2">
            <button onClick={() => { setCodeType("CPT"); setSearch(""); setResults([]); setSelectedCode(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${codeType === "CPT" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
              CPT (Service)
            </button>
            <button onClick={() => { setCodeType("ICD10"); setSearch(""); setResults([]); setSelectedCode(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium ${codeType === "ICD10" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
              ICD-10 (Diagnosis)
            </button>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => doSearch(e.target.value)}
              placeholder={`Search ${codeType === "CPT" ? "services" : "diagnoses"}...`}
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-200 text-sm" />
            {results.length > 0 && !selectedCode && (
              <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                {results.map((r) => (
                  <button key={r.id} onClick={() => setSelectedCode(r)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50 text-sm">
                    <span className="font-mono text-xs text-slate-500">{r.code}</span>{" — "}
                    {"name" in r ? r.name : r.description}
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedCode && (
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm flex items-center justify-between">
              <span>{selectedCode.code} — {"name" in selectedCode ? selectedCode.name : selectedCode.description}</span>
              <button onClick={() => setSelectedCode(null)}><X size={14} /></button>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm">
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={covered} onChange={(e) => setCovered(e.target.checked)} />Covered</label>
            <label className="flex items-center gap-1.5"><input type="checkbox" checked={requiresAuth} onChange={(e) => setRequiresAuth(e.target.checked)} />Requires pre-auth</label>
          </div>

          <button onClick={addRule} disabled={!selectedCode || adding}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Add Rule
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-slate-400" /></div>
          ) : rules.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No rules yet — everything is {plan.scope === "GENERAL" ? "covered" : "uncovered"} by default.</p>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg text-sm">
                  <div>
                    <span className="font-mono text-xs text-slate-500">{rule.cptCode?.code || rule.icd10?.code}</span>{" — "}
                    {rule.cptCode?.name || rule.icd10?.description}
                    <div className="flex gap-1.5 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${rule.covered ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {rule.covered ? "Covered" : "Not covered"}
                      </span>
                      {rule.requiresAuthorization && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700">Pre-auth</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => removeRule(rule.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}