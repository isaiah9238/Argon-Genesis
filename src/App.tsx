/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { LabProvider, useLab } from './context/LabContext';
import { SimulationsView } from './components/SimulationsView';
import { ChronicleView } from './components/ChronicleView';
import { ResearchChatView } from './components/ResearchChatView';
import { VideoLabView } from './components/VideoLabView';
import { VoiceLiveView } from './components/VoiceLiveView';
import { SavedLabDrawer } from './components/SavedLabDrawer';

const AppShell: React.FC = () => {
  const { user, experiments, notes, setIsDrawerOpen } = useLab();
  const totalSaved = experiments.length + notes.length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] blueprint-grid overflow-x-hidden">
      {/* Strictly adheres to the 3-Zone Top Bar Contract across desktop & mobile */}
      <header className="sticky top-0 z-40 flex flex-wrap lg:flex-nowrap items-center justify-between gap-y-1.5 gap-x-2 lg:gap-8 px-3 sm:px-6 py-2.5 sm:py-4 bg-white/95 backdrop-blur-xs border-b border-slate-200">
        {/* Zone 1: Single text element wordmark */}
        <NavLink
          to="/"
          className="text-xs sm:text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 font-editorial"
        >
          Genesis of Machine Cognition
        </NavLink>

        {/* Zone 2: 5 concise single-line navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="order-3 lg:order-2 w-full lg:w-auto flex items-center justify-between sm:justify-start gap-2 sm:gap-7 text-[11px] sm:text-sm font-medium text-slate-600 border-t lg:border-t-0 border-slate-100 pt-1.5 lg:pt-0"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 py-0.5 ${
                isActive
                  ? 'text-[#0284C7] font-semibold underline underline-offset-4 decoration-2'
                  : 'hover:text-slate-900'
              }`
            }
          >
            Simulations
          </NavLink>
          <NavLink
            to="/chronicle"
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 py-0.5 ${
                isActive
                  ? 'text-[#0284C7] font-semibold underline underline-offset-4 decoration-2'
                  : 'hover:text-slate-900'
              }`
            }
          >
            Chronicle
          </NavLink>
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 py-0.5 ${
                isActive
                  ? 'text-[#0284C7] font-semibold underline underline-offset-4 decoration-2'
                  : 'hover:text-slate-900'
              }`
            }
          >
            Research Chat
          </NavLink>
          <NavLink
            to="/video"
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 py-0.5 ${
                isActive
                  ? 'text-[#0284C7] font-semibold underline underline-offset-4 decoration-2'
                  : 'hover:text-slate-900'
              }`
            }
          >
            Video Lab
          </NavLink>
          <NavLink
            to="/voice"
            className={({ isActive }) =>
              `transition-colors whitespace-nowrap shrink-0 py-0.5 ${
                isActive
                  ? 'text-[#0284C7] font-semibold underline underline-offset-4 decoration-2'
                  : 'hover:text-slate-900'
              }`
            }
          >
            Voice Live
          </NavLink>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="order-2 lg:order-3 flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="px-2.5 sm:px-4 py-1 sm:py-2 text-[11px] sm:text-xs font-semibold text-white bg-[#0F172A] rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 tabular-nums"
          >
            {user ? `Cloud Notebook (${totalSaved})` : `Research Notebook (${totalSaved})`}
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Routes>
          <Route path="/" element={<SimulationsView />} />
          <Route path="/chronicle" element={<ChronicleView />} />
          <Route path="/chat" element={<ResearchChatView />} />
          <Route path="/video" element={<VideoLabView />} />
          <Route path="/voice" element={<VoiceLiveView />} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 sm:px-6 py-5 mt-12">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            Genesis of Machine Cognition · Silicon Photolithography, Historical Logic & Biophysical Computing
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="hover:text-slate-900 underline"
            >
              Open Research Vault & Firebase Sync
            </button>
          </div>
        </div>
      </footer>

      <SavedLabDrawer />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <LabProvider>
        <AppShell />
      </LabProvider>
    </BrowserRouter>
  );
}
