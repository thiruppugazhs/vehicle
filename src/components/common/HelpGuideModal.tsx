import React from 'react';
import { HelpCircle, Shield, Key, Search, Bell, CheckCircle2, BookOpen, Layers } from 'lucide-react';
import { Modal } from './Modal';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="SERVIQ Knowledge Base & Help Guide"
      subtitle="Operational shortcuts, role-based capabilities, and maintenance guidelines."
      maxWidth="lg"
    >
      <div className="space-y-4 text-left text-xs text-slate-600">
        {/* Quick Shortcuts */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl">
          <h4 className="font-bold text-amber-950 flex items-center gap-1.5 mb-2 text-xs">
            <Search className="w-4 h-4 text-amber-600" />
            Productivity Keyboard Shortcuts
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-amber-100">
              <span className="text-slate-600 font-medium">Universal Global Search</span>
              <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-slate-800 text-[10px]">
                ⌘K / Ctrl+K
              </kbd>
            </div>
            <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-amber-100">
              <span className="text-slate-600 font-medium">Close Active Modal / Drawer</span>
              <kbd className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono font-bold text-slate-800 text-[10px]">
                Esc
              </kbd>
            </div>
          </div>
        </div>

        {/* Roles Breakdown (Requirement 41) */}
        <div>
          <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-slate-700" />
            Role-Based Access Control (RBAC) Matrix
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                Owner
              </span>
              <p className="font-bold text-slate-800 pt-1">Full System Authority</p>
              <p className="text-[11px] text-slate-500">
                Complete access to all fleet telemetry, expenses, organizational settings, user invites, role simulation, and database resets.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-extrabold text-blue-900 bg-blue-100 px-2 py-0.5 rounded text-[10px]">
                Fleet Manager
              </span>
              <p className="font-bold text-slate-800 pt-1">Operational Supervisor</p>
              <p className="text-[11px] text-slate-500">
                Can create and manage vehicles, drivers, maintenance schedules, repair work orders, expenses, and download executive reports.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-extrabold text-purple-900 bg-purple-100 px-2 py-0.5 rounded text-[10px]">
                Driver
              </span>
              <p className="font-bold text-slate-800 pt-1">Field Operator</p>
              <p className="text-[11px] text-slate-500">
                Focused vehicle dashboard displaying only the driver's assigned asset. Can log current odometer readings, report issues, and check schedules.
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-extrabold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                Technician
              </span>
              <p className="font-bold text-slate-800 pt-1">Workshop Specialist</p>
              <p className="text-[11px] text-slate-500">
                Access to assigned repair tickets. Can advance lifecycle stages (`Reported` → `Inspection` → `Repair In Progress` → `Completed`), add notes, and upload invoices.
              </p>
            </div>
          </div>
        </div>

        {/* Maintenance Formula Guidelines */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            Fleet Health & Compliance Formulas
          </h4>
          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-600">
            <li><strong>Health Score (0–100):</strong> Starts at 100. Deducts points for overdue services (-25), critical open repairs (-20), and expired compliance papers (-15).</li>
            <li><strong>Service Compliance Rate:</strong> (Completed on time ÷ Total scheduled events) × 100%. Targeted fleet benchmark is ≥ 90%.</li>
            <li><strong>Unusual Variance Spike:</strong> Triggered when actual workshop costs exceed approved estimate by &gt; 10% or &gt; ₹1,000.</li>
          </ul>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-xs cursor-pointer"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </Modal>
  );
};
