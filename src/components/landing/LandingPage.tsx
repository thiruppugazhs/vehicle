import React from 'react';
import {
  Bell,
  Wrench,
  AlertTriangle,
  Receipt,
  FileText,
  Truck,
  Users,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Shield,
  Clock,
  TrendingDown,
  Sparkles,
  Layers,
  ChevronRight,
  Gauge,
  PhoneCall,
  Mail,
  Car
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { StatusBadge } from '../common/StatusBadge';

export const LandingPage: React.FC = () => {
  const { setActiveTab, setIsAuthModalOpen, setIsOnboardingActive } = useFleet();

  const handleGetStarted = () => {
    setIsOnboardingActive(true);
    setActiveTab('dashboard');
  };

  const handleViewDemo = () => {
    setActiveTab('dashboard');
  };

  const features = [
    {
      icon: Bell,
      title: 'Smart Service Reminders',
      description: 'Predictive reminders based on calendar time, odometer readings, and daily driving averages.'
    },
    {
      icon: Wrench,
      title: 'Maintenance History',
      description: 'Comprehensive digital logbooks with itemized parts replaced, technician labor, and tax invoices.'
    },
    {
      icon: AlertTriangle,
      title: 'Repair Tracking',
      description: 'Track vehicle issues from initial breakdown reporting to service center sign-off and road test.'
    },
    {
      icon: Receipt,
      title: 'Expense Management',
      description: 'Monitor fuel logs, repair bills, tolls, and calculate true cost-per-kilometer across your fleet.'
    },
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Never miss an Insurance, PUC, Fitness, or Road Permit deadline with proactive expiry alerts.'
    },
    {
      icon: Truck,
      title: 'Fleet Management',
      description: 'Organize sedans, heavy haulers, delivery vans, and EVs across branches and operational hubs.'
    },
    {
      icon: Users,
      title: 'Driver Management',
      description: 'Assign drivers, monitor commercial license validity, and maintain driver performance history.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Visual cost breakdowns, downtime analysis, and downloadable PDF/CSV audit logs.'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Add your vehicles',
      description: 'Register passenger cars, delivery vans, or heavy haulers with registration, VIN, and current odometer.'
    },
    {
      step: '02',
      title: 'Track maintenance and repairs',
      description: 'Log routine services, parts replaced, workshop invoices, and unexpected breakdown tickets.'
    },
    {
      step: '03',
      title: 'Receive automatic reminders',
      description: 'Our smart algorithm calculates exact due dates and kilometer milestones ahead of time.'
    },
    {
      step: '04',
      title: 'Monitor costs and vehicle health',
      description: 'Get real-time 0–100 health ratings, identify expensive assets, and maximize vehicle uptime.'
    }
  ];

  const benefits = [
    { title: 'Reduce unexpected breakdowns', desc: 'Predictive maintenance stops minor wear from turning into roadside failures.' },
    { title: 'Reduce vehicle downtime', desc: 'Pre-schedule workshop slots and minimize commercial fleet standing days.' },
    { title: 'Never miss scheduled service', desc: 'Dual time and distance triggers ensure no fluid or brake check slips by.' },
    { title: 'Maintain accurate service history', desc: 'Protect resale value and warranty eligibility with verified digital service logs.' },
    { title: 'Control maintenance expenses', desc: 'Pinpoint which vehicles or parts drain operational capital unnecessarily.' },
    { title: 'Improve fleet visibility', desc: 'Central command center view of vehicle availability, assignments, and locations.' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-amber-100 selection:text-amber-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/95 border-b border-slate-200 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Layers className="w-5 h-5 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              FleetPulse
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-amber-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-amber-600 transition-colors">How It Works</a>
            <a href="#benefits" className="hover:text-amber-600 transition-colors">Benefits</a>
            <a href="#pricing" className="hover:text-amber-600 transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAuthModalOpen(true, 'login')}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-3 py-1.5"
            >
              Sign In
            </button>
            <button
              onClick={handleViewDemo}
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3.5 py-1.5 rounded-xl transition-all"
            >
              Live Demo
            </button>
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-1 text-sm font-semibold text-white bg-amber-500 hover:bg-amber-600 active:bg-amber-700 px-4 py-1.5 rounded-xl shadow-xs transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Next-Gen Vehicle & Fleet Maintenance Management
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight sm:leading-tight">
            Keep Every Vehicle Ready for the Road.
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Manage maintenance, repairs, service reminders, documents, and fleet costs from one intelligent platform.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base shadow-md hover:shadow-lg transition-all"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleViewDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-200 shadow-xs hover:border-slate-300 transition-all"
            >
              View Demo
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Free instant setup</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Dual calendar & odometer sync</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> 0-100 fleet health scoring</span>
          </div>

          {/* Hero Visual: Fleet Maintenance Command Center Preview */}
          <div className="mt-12 max-w-5xl mx-auto rounded-2xl border border-slate-200/90 bg-white p-3 sm:p-5 shadow-2xl">
            {/* Mock Dashboard Preview Window */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 sm:p-6 text-left">
              {/* Window Header */}
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/80">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                    <span className="w-3 h-3 rounded-full bg-slate-300" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">FleetPulse Command Center — Live Overview</span>
                </div>
                <button
                  onClick={handleViewDemo}
                  className="text-xs font-semibold text-amber-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-amber-50 transition-colors"
                >
                  Enter Interactive Mode →
                </button>
              </div>

              {/* Mock Dashboard Top Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-5">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Fleet</span>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">6 Units</div>
                  <span className="text-[11px] text-emerald-600 font-medium">95% Operational</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/30 shadow-2xs">
                  <span className="text-[11px] font-semibold text-amber-700 uppercase">Due for Service</span>
                  <div className="text-xl sm:text-2xl font-bold text-amber-900 mt-0.5">1 Vehicle</div>
                  <span className="text-[11px] text-amber-700 font-medium">Innova (in 1,500 km)</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-rose-200 bg-rose-50/30 shadow-2xs">
                  <span className="text-[11px] font-semibold text-rose-700 uppercase">Overdue Maintenance</span>
                  <div className="text-xl sm:text-2xl font-bold text-rose-900 mt-0.5">1 Urgent</div>
                  <span className="text-[11px] text-rose-600 font-medium">Brake check (13d late)</span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">Fleet Health Avg</span>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">86 / 100</div>
                  <span className="text-[11px] text-emerald-600 font-medium">Healthy condition</span>
                </div>
              </div>

              {/* Mock Maintenance Table Preview */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Upcoming & Overdue Service Schedules</span>
                  <span className="text-amber-700 font-bold">Live Predictive Sync</span>
                </div>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="p-3 flex items-center justify-between hover:bg-slate-50">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-sm">TN 01 AB 1234</span>
                      <div>
                        <p className="font-semibold text-slate-800">Innova Hycross Executive #01</p>
                        <p className="text-[11px] text-slate-400">Engine Oil & Synthetic Filter Service</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status="Due for Service" size="sm" />
                      <p className="text-[11px] text-slate-500 mt-0.5">Due at 50,000 km (1,500 km remaining)</p>
                    </div>
                  </div>
                  <div className="p-3 flex items-center justify-between bg-rose-50/40 hover:bg-rose-50/60">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded-sm">MH 02 CK 9876</span>
                      <div>
                        <p className="font-semibold text-slate-900">Tata Prima Hauler #04</p>
                        <p className="text-[11px] text-rose-600 font-medium">Heavy Air Brake Liners Inspection</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <StatusBadge status="Overdue" size="sm" />
                      <p className="text-[11px] text-rose-700 font-medium mt-0.5">Overdue by 13 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50/50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
              Comprehensive Platform Capabilities
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Everything Needed to Run Road-Ready Fleets
            </h3>
            <p className="mt-4 text-base text-slate-600">
              Engineered for individual owners and commercial operators seeking zero breakdown surprises and total expense control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-4 group-hover:bg-amber-500 group-hover:text-white transition-all">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{feat.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
              Simple 4-Step Workflow
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              How FleetPulse Works
            </h3>
            <p className="mt-4 text-base text-slate-600">
              From day one to 200,000 kilometers, stay ahead of maintenance with effortless automation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {steps.map((item, idx) => (
              <div key={idx} className="relative bg-slate-50 rounded-2xl p-6 border border-slate-200 text-left">
                <span className="text-3xl font-extrabold text-amber-500 block mb-3 font-mono">{item.step}</span>
                <h4 className="text-base font-bold text-slate-900 mb-2">{item.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2">
              Measurable Business ROI
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Why Owners & Fleet Managers Rely on Us
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 flex gap-4 items-start shadow-xs">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{b.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-amber-500 to-amber-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start Managing Your Vehicles
          </h3>
          <p className="mt-4 text-base sm:text-lg text-amber-50 max-w-2xl mx-auto">
            Join thousands of individual owners and fleet managers who keep downtime to zero.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="px-8 py-3.5 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100 shadow-lg transition-all"
            >
              Get Started Free
            </button>
            <button
              onClick={handleViewDemo}
              className="px-8 py-3.5 rounded-xl bg-amber-700 text-white font-bold hover:bg-amber-800 border border-amber-400 transition-all"
            >
              Explore Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 text-white">
                  <Layers className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="font-bold text-lg text-slate-900">FleetPulse</span>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed mb-4">
                The centralized digital command center for vehicle maintenance schedules, repair tracking, document compliance, and fleet operational intelligence.
              </p>
              <div className="text-xs text-slate-500 space-y-1">
                <p className="flex items-center gap-2"><PhoneCall className="w-3.5 h-3.5 text-amber-600" /> +91 1800 425 8899</p>
                <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-amber-600" /> support@fleetpulse.io</p>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Product</h5>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><a href="#features" className="hover:text-amber-600">Features</a></li>
                <li><button onClick={handleViewDemo} className="hover:text-amber-600 text-left">Live Demo</button></li>
                <li><a href="#pricing" className="hover:text-amber-600">Pricing</a></li>
                <li><a href="#" className="hover:text-amber-600">Releases</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Resources</h5>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><a href="#" className="hover:text-amber-600">Help Center</a></li>
                <li><a href="#" className="hover:text-amber-600">Maintenance Guides</a></li>
                <li><a href="#" className="hover:text-amber-600">API Documentation</a></li>
                <li><a href="#" className="hover:text-amber-600">Service Checklist</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Legal & Company</h5>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><a href="#" className="hover:text-amber-600">About Us</a></li>
                <li><a href="#" className="hover:text-amber-600">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-amber-600">Terms of Service</a></li>
                <li><a href="#" className="hover:text-amber-600">Contact Support</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
            <p>© {new Date().getFullYear()} FleetPulse Inc. All rights reserved. Enterprise Fleet Maintenance Command Center.</p>
            <div className="flex gap-4 mt-4 sm:mt-0">
              <span className="hover:text-slate-800 cursor-pointer">Security</span>
              <span className="hover:text-slate-800 cursor-pointer">Status</span>
              <span className="hover:text-slate-800 cursor-pointer">Cookies</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
