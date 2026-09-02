import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Building2,
  Car,
  Server,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Search,
  RefreshCw,
  UserX,
  UserCheck,
  Download,
  Terminal
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  status: 'Active' | 'Suspended';
  lastActive: string;
}

const INITIAL_ADMIN_USERS: AdminUser[] = [];

export const AdminPanelView: React.FC = () => {
  const {
    vehicles,
    organizations,
    activeRole,
    auditLogs,
    showToast
  } = useFleet();

  const [activeAdminTab, setActiveAdminTab] = useState<'users' | 'organizations' | 'health' | 'logs'>('users');
  const [usersList, setUsersList] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [searchUser, setSearchUser] = useState('');
  const [isSuperAdminElevated, setIsSuperAdminElevated] = useState(true);

  // Requirement 68: Do not expose admin functionality to normal users
  const isAuthorized = isSuperAdminElevated && (activeRole === 'Owner' || activeRole === 'Fleet Manager');

  const toggleUserStatus = (userId: string) => {
    setUsersList(prev =>
      prev.map(u => {
        if (u.id === userId) {
          const nextStatus = u.status === 'Active' ? 'Suspended' : 'Active';
          showToast(`User ${u.name} is now ${nextStatus}`);
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const filteredUsers = usersList.filter(
    u =>
      u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.organization.toLowerCase().includes(searchUser.toLowerCase())
  );

  if (!isAuthorized) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-center space-y-4">
        <div className="w-16 h-16 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-center mx-auto text-rose-600">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Restricted Administrative Area</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
          The Central Superadmin Console is strictly reserved for Platform Administrators and Organization Owners. Your current role (<strong>{activeRole}</strong>) does not have authorization to view multi-tenant telemetry.
        </p>
        <button
          onClick={() => setIsSuperAdminElevated(true)}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
        >
          Request Elevated Superadmin Access
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Superadmin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-300">
              PLATFORM SUPERADMIN
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Root Authorization Active
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Platform Operations & Multi-Tenant Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor ecosystem load, enforce workspace security boundaries, and supervise tenant account lifecycles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Platform telemetry metrics refreshed')}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* KPI Cards: Platform Usage (Requirement 68) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Platform Users</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{usersList.length}</p>
          <span className="text-[11px] text-emerald-700 font-bold mt-0.5 block">
            {usersList.filter(u => u.status === 'Active').length} Active Sessions
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Organizations</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{organizations.length}</p>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">100% Multi-Tenant Isolated</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Managed Vehicles</span>
            <Car className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{vehicles.length}</p>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">Across all corporate fleets</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">System SLA Health</span>
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">99.98%</p>
          <span className="text-[11px] text-emerald-700 font-bold mt-0.5 block">All microservices operational</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        {[
          { id: 'users', label: 'User Directory & Suspension', count: usersList.length },
          { id: 'organizations', label: 'Corporate Workspaces', count: organizations.length },
          { id: 'health', label: 'Platform Diagnostics & SLA' },
          { id: 'logs', label: 'Security & Root Audit Trail', count: auditLogs.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveAdminTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeAdminTab === tab.id
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeAdminTab === tab.id ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Subtab 1: User Management (Requirement 68) */}
      {activeAdminTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchUser}
                onChange={e => setSearchUser(e.target.value)}
                placeholder="Search user name, email, or tenant..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>

            <button
              onClick={() => showToast('User directory exported as audit CSV')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Export Directory
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{u.organization}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 font-mono text-[11px] font-bold text-slate-700 rounded-md">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{u.lastActive}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          u.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {u.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer border ${
                          u.status === 'Active'
                            ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                        }`}
                      >
                        {u.status === 'Active' ? (
                          <>
                            <UserX className="w-3.5 h-3.5" />
                            Suspend
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            Activate
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Organizations Management */}
      {activeAdminTab === 'organizations' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Registered Corporate Workspaces</h3>
            <span className="text-xs text-slate-500">2 Active Tenants</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizations.map(org => (
              <div key={org.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{org.name}</h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">Tenant ID: {org.id}</p>
                  </div>
                  <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                    Enterprise Tier
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>📍 {org.address}</p>
                  <p>📞 {org.contactPhone} • ✉️ {org.contactEmail}</p>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-semibold">
                  <span className="text-emerald-700">● Status: Active & In Good Standing</span>
                  <button
                    onClick={() => showToast(`Audit report compiled for ${org.name}`)}
                    className="text-amber-800 hover:text-amber-900 font-bold cursor-pointer"
                  >
                    View Audit
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Platform Diagnostics & Health */}
      {activeAdminTab === 'health' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Database Query Latency</span>
              <p className="text-xl font-black text-slate-900">14.2 ms</p>
              <span className="text-xs font-bold text-emerald-700">Healthy (PostgreSQL p99 &lt; 30ms)</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Scheduled Cron Automation</span>
              <p className="text-xl font-black text-emerald-700">Active (Worker #01)</p>
              <span className="text-xs text-slate-500">Last scanned: 2 mins ago</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Encrypted Storage</span>
              <p className="text-xl font-black text-slate-900">1.4 GB / 50 GB</p>
              <span className="text-xs text-slate-500">2.8% storage capacity utilized</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-600" />
              Microservice Uptime & Core Capabilities
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { service: 'Authentication & Session Store', status: 'Operational', uptime: '100%' },
                { service: 'PostgreSQL Relational Engine', status: 'Operational', uptime: '99.99%' },
                { service: 'Background Reminder Engine', status: 'Operational', uptime: '99.95%' },
                { service: 'Static Asset & Invoice CDN', status: 'Operational', uptime: '100%' }
              ].map(s => (
                <div key={s.service} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-800">{s.service}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500">{s.uptime}</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {s.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Subtab 4: Root Audit Logs */}
      {activeAdminTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-slate-500" />
              Root Security & Audit Log Feed
            </h3>
            <span className="text-xs text-slate-500">{auditLogs.length} events logged</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {auditLogs.map(log => (
              <div key={log.id} className="py-2.5 flex items-start justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-amber-900 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {log.action}
                    </span>
                    <span className="font-semibold text-slate-900">{log.description}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Actor: {log.actorName} ({log.actorRole})
                  </p>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
