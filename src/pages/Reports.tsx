import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Filter, Loader2, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface Report {
  id: string;
  name: string;
  date: string;
  size: string;
  isNew?: boolean;
}

const initialReports: Report[] = [
  { id: '1', name: 'July 2026 - Central Div Stats', date: 'Jul 01, 2026', size: '2.4 MB' },
  { id: '2', name: 'Q2 2026 Traffic Offenses Summary', date: 'Jun 30, 2026', size: '5.1 MB' },
  { id: '3', name: 'Cyber Crime Weekly Roundup', date: 'Jun 28, 2026', size: '1.2 MB' },
];

export default function Reports() {
  const [reports, setReports] = useState<Report[]>(initialReports);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Form State
  const [reportType, setReportType] = useState('Monthly Crime Statistics');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [jurisdiction, setJurisdiction] = useState('All Stations');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    setIsGenerating(true);
    
    // Simulate backend report generation
    setTimeout(() => {
      const newReport: Report = {
        id: Date.now().toString(),
        name: `${reportType} - ${jurisdiction}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        size: (Math.random() * 5 + 1).toFixed(1) + ' MB',
        isNew: true
      };
      
      setReports([newReport, ...reports]);
      setIsGenerating(false);
      
      // Reset form
      setReportType('Monthly Crime Statistics');
      setJurisdiction('All Stations');
      setStartDate('');
      setEndDate('');
    }, 2000);
  };

  const handleDownload = (report: Report) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // 1. Top Header Banner
    doc.setFillColor(15, 23, 42); // #0f172a
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Accent line
    doc.setFillColor(0, 240, 255); // cyan accent
    doc.rect(0, 28, pageWidth, 1.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('KARNATAKA STATE POLICE', 14, 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('SHERLOCK INTELLIGENCE & CRIME ANALYTICS PLATFORM', 14, 18);
    doc.text('CONFIDENTIAL // LAW ENFORCEMENT OPERATIONAL REPORT', 14, 23);

    // 2. Report Title & Metadata Box
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(report.name, 14, 40);

    // Metadata Box
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, 45, pageWidth - 28, 28, 2, 2, 'FD');

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);

    doc.text('REPORT ID:', 18, 53);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`KSP-REP-${report.id.slice(-6)}`, 45, 53);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('GENERATED ON:', 18, 60);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(report.date, 48, 60);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('JURISDICTION:', 18, 67);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(jurisdiction || 'Statewide', 48, 67);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('SECURITY LEVEL:', 115, 53);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28); // red
    doc.text('OFFICIAL / RESTRICTED', 148, 53);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('AUDIT TOKEN:', 115, 60);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text('AUTH-KSP-99021', 145, 60);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(71, 85, 105);
    doc.text('DISPATCH UNIT:', 115, 67);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text('Bengaluru Central Command', 148, 67);

    // 3. Section 1: Executive Summary
    let yPos = 83;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('1. EXECUTIVE SUMMARY & SITUATIONAL ASSESSMENT', 14, yPos);

    yPos += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const summaryText = `This report provides an automated operational synthesis of registered crime incidents, spatial clustering densities, and suspect recidivism trends. Based on neural pattern matching, property offenses and cyber financial fraud patterns represent the primary risk drivers in the evaluated sector. Night patrol units and station investigation officers are instructed to maintain targeted surveillance in accordance with the attached action directives.`;
    const splitSummary = doc.splitTextToSize(summaryText, pageWidth - 28);
    doc.text(splitSummary, 14, yPos);

    // 4. Section 2: Threat Breakdown Table
    yPos += splitSummary.length * 4.5 + 7;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('2. CATEGORICAL INCIDENT & THREAT METRICS', 14, yPos);

    yPos += 5;
    doc.setFillColor(226, 232, 240); // table header
    doc.rect(14, yPos, pageWidth - 28, 6.5, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('CRIME CATEGORY', 18, yPos + 4.5);
    doc.text('INCIDENTS', 88, yPos + 4.5);
    doc.text('TREND (VS PREV CYCLE)', 122, yPos + 4.5);
    doc.text('RISK STATUS', 168, yPos + 4.5);

    const tableData = [
      { cat: 'Property Offenses (Theft/Burglary)', count: '142', trend: '+6.2% Elevation', status: 'ELEVATED' },
      { cat: 'Cyber Financial & UPI Fraud', count: '89', trend: '+18.4% Spike', status: 'CRITICAL' },
      { cat: 'Violent Crimes & Assault', count: '34', trend: '-2.1% Stable', status: 'CONTROLLED' },
      { cat: 'Narcotics & Illicit Substances', count: '21', trend: '+1.5% Normal', status: 'MONITORED' },
      { cat: 'Vehicular & Traffic Violations', count: '215', trend: '+4.0% Active', status: 'ROUTINE' },
    ];

    yPos += 6.5;
    tableData.forEach((row, i) => {
      if (i % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, yPos, pageWidth - 28, 6.5, 'F');
      }
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      doc.text(row.cat, 18, yPos + 4.5);
      doc.text(row.count, 88, yPos + 4.5);
      doc.text(row.trend, 122, yPos + 4.5);

      if (row.status === 'CRITICAL' || row.status === 'ELEVATED') {
        doc.setTextColor(185, 28, 28);
        doc.setFont('helvetica', 'bold');
      } else {
        doc.setTextColor(16, 185, 129);
      }
      doc.text(row.status, 168, yPos + 4.5);
      yPos += 6.5;
    });

    // 5. Section 3: Operational Directives
    yPos += 7;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('3. OPERATIONAL DIRECTIVES & PATROL PROTOCOL', 14, yPos);

    yPos += 6;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    const directives = [
      '• Intensify PCR vehicle patrolling along identified nocturnal hotspot corridors between 22:00 and 04:00.',
      '• Accelerate Section 151 CrPC preventive detention reviews for repeat offenders with active bail status.',
      '• Coordinate with Cyber Crime Cell for immediate freezing of flagged mule accounts and phishing SIM cards.',
      '• Ensure CCTV/ANPR camera network feeds at primary intersection checkpoints are active and calibrated.'
    ];
    directives.forEach(dir => {
      doc.text(dir, 14, yPos);
      yPos += 5;
    });

    // 6. Sign-off & Verification Footer
    yPos = 268;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, yPos, pageWidth - 14, yPos);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('CONFIDENTIAL - KARNATAKA STATE POLICE INTERNAL INTELLIGENCE REPORT', 14, yPos + 5);
    doc.text(`Digital Verification Hash: SHA256-${Date.now().toString(16).toUpperCase()} | Page 1 of 1`, 14, yPos + 9);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('VERIFIED BY:', 150, yPos + 5);
    doc.setFont('helvetica', 'normal');
    doc.text('Command Officer, KSP Hub', 150, yPos + 9);

    // Save as PDF file
    doc.save(`${report.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-200">Intelligence Reports</h1>
          <p className="text-sm text-slate-400 mt-1">Generate and export comprehensive case reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Generator Form */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 bg-panel border border-edge rounded-xl p-6 space-y-5">
          <h3 className="text-lg font-medium text-slate-200 border-b border-edge pb-3">New Report</h3>
          
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-1.5">Report Type</label>
              <select 
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-abyss border border-edge rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-neon transition-colors"
                disabled={isGenerating}
              >
                <option>Monthly Crime Statistics</option>
                <option>Active Case Summary</option>
                <option>Officer Performance Review</option>
                <option>Predictive Hotspot Forecast</option>
                <option>Financial Fraud Analysis</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-1.5">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                 <input 
                   type="date" 
                   required
                   value={startDate}
                   onChange={(e) => setStartDate(e.target.value)}
                   className="w-full bg-abyss border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon transition-colors" 
                   disabled={isGenerating}
                 />
                 <input 
                   type="date" 
                   required
                   value={endDate}
                   onChange={(e) => setEndDate(e.target.value)}
                   className="w-full bg-abyss border border-edge rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-neon transition-colors" 
                   disabled={isGenerating}
                 />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-400 uppercase mb-1.5">Jurisdiction</label>
              <select 
                value={jurisdiction}
                onChange={(e) => setJurisdiction(e.target.value)}
                className="w-full bg-abyss border border-edge rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-neon transition-colors"
                disabled={isGenerating}
              >
                <option>All Stations</option>
                <option>Central Division</option>
                <option>East Division</option>
                <option>West Division</option>
                <option>North Division</option>
                <option>South Division</option>
              </select>
            </div>
            
            <button 
              type="submit"
              disabled={isGenerating}
              className="w-full py-3 bg-neon text-void font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-neon-bright transition-colors mt-6 shadow-neon-sm disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Synthesizing Data...</>
              ) : (
                'Generate Report'
              )}
            </button>
          </form>
        </motion.div>

        {/* Report Archives */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 bg-panel border border-edge rounded-xl p-6 flex flex-col max-h-[800px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-lg font-medium text-slate-200 flex items-center gap-2">
              Archived Reports
              <span className="bg-abyss border border-edge text-slate-400 text-xs px-2 py-0.5 rounded-full font-mono">{reports.length}</span>
            </h3>
            <button className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
          
          <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
            <AnimatePresence initial={false}>
              {reports.map((report) => (
                <motion.div 
                  key={report.id}
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 12 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg transition-colors group ${
                    report.isNew ? 'bg-neon/5 border-neon/30 shadow-neon-sm' : 'bg-abyss border-edge hover:border-neon/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded border flex items-center justify-center ${
                      report.isNew ? 'bg-neon/10 border-neon/30 text-neon-bright' : 'bg-panel border-edge text-slate-400'
                    }`}>
                      {report.isNew ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-200 flex items-center gap-2">
                        {report.name}
                        {report.isNew && (
                          <span className="text-[9px] uppercase tracking-wider font-bold bg-neon text-void px-1.5 py-0.5 rounded-sm">New</span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{report.date} &middot; Official PDF &middot; {report.size}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDownload(report)}
                    className={`mt-4 sm:mt-0 px-4 py-2 border rounded text-sm transition-colors flex items-center justify-center gap-2 font-medium ${
                      report.isNew 
                        ? 'border-neon/50 bg-neon/10 text-neon-bright hover:bg-neon hover:text-void' 
                        : 'border-edge bg-panel text-slate-300 hover:text-neon hover:border-neon'
                    }`}
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  )
}