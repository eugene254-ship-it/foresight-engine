import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, FileSpreadsheet, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockRiskEvents } from '@/data/mockRiskData';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  open: boolean;
  onClose: () => void;
}

function downloadFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function riskEventsToCSV(events: typeof mockRiskEvents) {
  const headers = ['Name', 'Region', 'Sector', 'Probability', 'Severity', 'Exposure', 'Velocity', 'Confidence', 'Cascade Potential', 'Status', 'Impact Window', 'Drivers', 'Interventions'];
  const rows = events.map(e => [
    e.name, e.region, e.sector, e.probability, e.severity, e.exposure,
    e.velocity, e.confidence, e.cascadePotential, e.status, e.impactWindow,
    `"${e.drivers.join('; ')}"`, `"${e.interventions.join('; ')}"`,
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function liveEventsToCSV(events: any[]) {
  const headers = ['Name', 'Region', 'Sector', 'Probability', 'Severity', 'Exposure', 'Velocity', 'Confidence', 'Cascade Potential', 'Status', 'Updated At'];
  const rows = events.map(e => [
    e.name, e.region, e.sector, e.probability, e.severity, e.exposure,
    e.velocity, e.confidence, e.cascade_potential, e.status, e.updated_at,
  ]);
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function generatePDFContent(events: typeof mockRiskEvents, liveEvents: any[]) {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  let html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Atlas Sanctum Risk Report</title>
<style>
body{font-family:monospace;padding:40px;color:#111;font-size:11px}
h1{font-size:16px;letter-spacing:2px;border-bottom:2px solid #111;padding-bottom:8px}
h2{font-size:13px;margin-top:24px;color:#444;letter-spacing:1px}
table{width:100%;border-collapse:collapse;margin-top:8px}
th,td{border:1px solid #ddd;padding:4px 8px;text-align:left;font-size:10px}
th{background:#f5f5f5;font-weight:600;text-transform:uppercase;letter-spacing:0.5px}
.critical{color:#ef4444}.high{color:#f97316}.medium{color:#eab308}.low{color:#22c55e}
.meta{color:#888;font-size:10px;margin-top:4px}
</style></head><body>
<h1>ATLAS SANCTUM — RISK REPORT</h1>
<p class="meta">Generated: ${timestamp} UTC</p>`;

  html += `<h2>STATIC RISK EVENTS (${events.length})</h2>
<table><thead><tr><th>Event</th><th>Region</th><th>Sector</th><th>Prob%</th><th>Severity</th><th>Exposure</th><th>Status</th><th>Cascade%</th></tr></thead><tbody>`;
  events.forEach(e => {
    html += `<tr><td>${e.name}</td><td>${e.region}</td><td>${e.sector}</td><td>${e.probability}</td><td>${e.severity}/100</td><td>${(e.exposure / 1000).toFixed(0)}K</td><td class="${e.status}">${e.status}</td><td>${e.cascadePotential}%</td></tr>`;
  });
  html += `</tbody></table>`;

  if (liveEvents.length > 0) {
    html += `<h2>LIVE STREAM EVENTS (${liveEvents.length})</h2>
<table><thead><tr><th>Event</th><th>Region</th><th>Sector</th><th>Prob%</th><th>Severity</th><th>Status</th><th>Updated</th></tr></thead><tbody>`;
    liveEvents.forEach(e => {
      html += `<tr><td>${e.name}</td><td>${e.region}</td><td>${e.sector}</td><td>${e.probability}</td><td>${e.severity}/100</td><td class="${e.status}">${e.status}</td><td>${e.updated_at?.slice(0, 19) ?? '-'}</td></tr>`;
    });
    html += `</tbody></table>`;
  }

  html += `</body></html>`;
  return html;
}

export const ExportPanel = ({ open, onClose }: Props) => {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = async (format: 'csv-static' | 'csv-live' | 'pdf') => {
    setExporting(format);
    const timestamp = new Date().toISOString().slice(0, 10);

    if (format === 'csv-static') {
      downloadFile(riskEventsToCSV(mockRiskEvents), `risk-events-${timestamp}.csv`, 'text/csv');
    } else if (format === 'csv-live') {
      const { data } = await supabase.from('live_risk_events').select('*').order('updated_at', { ascending: false });
      downloadFile(liveEventsToCSV(data ?? []), `live-events-${timestamp}.csv`, 'text/csv');
    } else if (format === 'pdf') {
      const { data: liveData } = await supabase.from('live_risk_events').select('*').order('updated_at', { ascending: false });
      const html = generatePDFContent(mockRiskEvents, liveData ?? []);
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => printWindow.print(), 300);
      }
    }

    setTimeout(() => setExporting(null), 500);
  };

  const exports = [
    { id: 'csv-static' as const, icon: FileSpreadsheet, label: 'Risk Events CSV', desc: 'Static risk analysis data' },
    { id: 'csv-live' as const, icon: FileSpreadsheet, label: 'Live Events CSV', desc: 'Real-time streamed events from database' },
    { id: 'pdf' as const, icon: FileText, label: 'Full Report (PDF)', desc: 'Printable report with all risk data' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-card border border-border rounded-lg z-50 overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-mono font-semibold text-foreground tracking-wider uppercase">Export Data</h2>
                </div>
                <button onClick={onClose} className="p-1 rounded hover:bg-secondary transition-colors">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="space-y-2">
                {exports.map(exp => (
                  <button
                    key={exp.id}
                    onClick={() => handleExport(exp.id)}
                    disabled={exporting !== null}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                      exporting === exp.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-secondary/30'
                    )}
                  >
                    <exp.icon className={cn('w-5 h-5', exporting === exp.id ? 'text-primary animate-pulse' : 'text-muted-foreground')} />
                    <div>
                      <div className="text-xs font-mono font-medium text-foreground">{exp.label}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{exp.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
