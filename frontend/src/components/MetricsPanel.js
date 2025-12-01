import React from 'react';
import { Card } from './ui/card';
import { Activity, Cpu, HardDrive, Clock, Trash2, BarChart3 } from 'lucide-react';

const MetricsPanel = ({ heapStats, lastGCMetrics }) => {
  const metrics = [
    {
      icon: HardDrive,
      label: 'Total Memory',
      value: `${heapStats?.total_size || 0} bytes`,
      color: 'text-blue-400'
    },
    {
      icon: Activity,
      label: 'Free Blocks',
      value: heapStats?.free_blocks || 0,
      color: 'text-green-400'
    },
    {
      icon: Cpu,
      label: 'Allocated',
      value: heapStats?.allocated_blocks || 0,
      color: 'text-cyan-400'
    },
    {
      icon: BarChart3,
      label: 'Total Objects',
      value: heapStats?.total_objects || 0,
      color: 'text-purple-400'
    },
    {
      icon: Trash2,
      label: 'Fragmentation',
      value: `${heapStats?.fragmentation || 0}%`,
      color: 'text-yellow-400'
    },
    {
      icon: Clock,
      label: 'Root Objects',
      value: heapStats?.root_objects || 0,
      color: 'text-pink-400'
    }
  ];
  
  return (
    <div data-testid="metrics-panel" className="space-y-4">
      {/* Real-time Heap Stats */}
      <Card className="p-6 bg-slate-900 border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Real-time Heap Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} data-testid={`metric-${metric.label.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-start gap-3 p-3 bg-slate-800 rounded-lg">
                <Icon className={`w-5 h-5 ${metric.color} mt-0.5`} />
                <div>
                  <p className="text-xs text-slate-400 mb-1">{metric.label}</p>
                  <p className="text-lg font-semibold text-slate-100">{metric.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      
      {/* Last GC Cycle */}
      {lastGCMetrics && (
        <Card className="p-6 bg-slate-900 border-slate-700">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Last GC Cycle</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
              <span className="text-slate-400">Algorithm</span>
              <span className="text-slate-100 font-mono font-semibold">{lastGCMetrics.algorithm}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
              <span className="text-slate-400">Objects Scanned</span>
              <span className="text-emerald-400 font-mono font-semibold">{lastGCMetrics.objects_scanned}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
              <span className="text-slate-400">Objects Freed</span>
              <span className="text-red-400 font-mono font-semibold">{lastGCMetrics.objects_freed}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
              <span className="text-slate-400">Bytes Reclaimed</span>
              <span className="text-cyan-400 font-mono font-semibold">{lastGCMetrics.bytes_reclaimed} bytes</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
              <span className="text-slate-400">Pause Duration</span>
              <span className="text-yellow-400 font-mono font-semibold">{lastGCMetrics.pause_duration} ms</span>
            </div>
            {lastGCMetrics.collection_type && (
              <div className="flex justify-between items-center p-3 bg-slate-800 rounded">
                <span className="text-slate-400">Collection Type</span>
                <span className="text-purple-400 font-mono font-semibold">{lastGCMetrics.collection_type}</span>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default MetricsPanel;