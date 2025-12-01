import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Download, FileJson, FileSpreadsheet, Camera } from 'lucide-react';
import html2canvas from 'html2canvas';

const ExportPanel = ({ cycles, heapStats }) => {
  const exportCSV = () => {
    if (!cycles || cycles.length === 0) {
      alert('No data to export');
      return;
    }
    
    const headers = ['Cycle ID', 'Algorithm', 'Timestamp', 'Objects Scanned', 'Objects Freed', 'Bytes Reclaimed', 'Pause Duration (ms)'];
    const rows = cycles.map(cycle => [
      cycle.cycle_id,
      cycle.algorithm,
      cycle.timestamp,
      cycle.objects_scanned,
      cycle.objects_freed,
      cycle.bytes_reclaimed,
      cycle.pause_duration
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gc_metrics_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const exportJSON = () => {
    if (!cycles || cycles.length === 0) {
      alert('No data to export');
      return;
    }
    
    const exportData = {
      timestamp: new Date().toISOString(),
      heap_stats: heapStats,
      cycles: cycles
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gc_report_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const captureScreenshot = async () => {
    try {
      const element = document.getElementById('gc-dashboard');
      if (!element) return;
      
      const canvas = await html2canvas(element, {
        backgroundColor: '#0f172a',
        scale: 2
      });
      
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `gc_dashboard_${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      console.error('Screenshot failed:', error);
      alert('Failed to capture screenshot');
    }
  };
  
  return (
    <Card data-testid="export-panel" className="p-6 bg-slate-900 border-slate-700">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-1">Export & Reports</h3>
          <p className="text-sm text-slate-400">Download metrics and visualization data</p>
        </div>
        
        <div className="grid gap-3">
          <Button
            data-testid="export-csv-button"
            onClick={exportCSV}
            variant="outline"
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 justify-start"
          >
            <FileSpreadsheet className="w-4 h-4 mr-3" />
            Export as CSV
          </Button>
          
          <Button
            data-testid="export-json-button"
            onClick={exportJSON}
            variant="outline"
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 justify-start"
          >
            <FileJson className="w-4 h-4 mr-3" />
            Export as JSON
          </Button>
          
          <Button
            data-testid="screenshot-button"
            onClick={captureScreenshot}
            variant="outline"
            className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 justify-start"
          >
            <Camera className="w-4 h-4 mr-3" />
            Capture Screenshot
          </Button>
        </div>
        
        <div className="pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-500">
            Exports include all recorded GC cycles with detailed metrics for analysis and reporting.
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ExportPanel;