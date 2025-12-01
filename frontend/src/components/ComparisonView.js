import React from 'react';
import { Card } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const ComparisonView = ({ cycles }) => {
  if (!cycles || cycles.length === 0) {
    return (
      <Card data-testid="comparison-view-empty" className="p-6 bg-slate-900 border-slate-700">
        <p className="text-slate-400 text-center">No GC cycles recorded yet. Run some garbage collections to see comparison data.</p>
      </Card>
    );
  }
  
  // Aggregate data by algorithm
  const algorithmData = {};
  cycles.forEach(cycle => {
    const algo = cycle.algorithm || 'Unknown';
    if (!algorithmData[algo]) {
      algorithmData[algo] = {
        algorithm: algo,
        cycles: 0,
        totalFreed: 0,
        totalBytes: 0,
        totalPause: 0,
        pauseTimes: []
      };
    }
    
    algorithmData[algo].cycles += 1;
    algorithmData[algo].totalFreed += cycle.objects_freed || 0;
    algorithmData[algo].totalBytes += cycle.bytes_reclaimed || 0;
    algorithmData[algo].totalPause += cycle.pause_duration || 0;
    algorithmData[algo].pauseTimes.push(cycle.pause_duration || 0);
  });
  
  // Calculate averages and prepare chart data
  const comparisonData = Object.values(algorithmData).map(data => ({
    name: data.algorithm,
    'Avg Pause (ms)': (data.totalPause / data.cycles).toFixed(3),
    'Total Objects Freed': data.totalFreed,
    'Total Bytes Reclaimed': data.totalBytes,
    'Throughput (obj/cycle)': (data.totalFreed / data.cycles).toFixed(2),
    cycles: data.cycles
  }));
  
  // Prepare pause time timeline
  const timelineData = cycles.map((cycle, idx) => ({
    cycle: idx + 1,
    [cycle.algorithm]: cycle.pause_duration,
    algorithm: cycle.algorithm
  }));
  
  // Get unique algorithms for line colors
  const algorithms = [...new Set(cycles.map(c => c.algorithm))];
  const colors = ['#06b6d4', '#22c55e', '#a855f7', '#f59e0b', '#ef4444'];
  
  return (
    <div data-testid="comparison-view" className="space-y-6">
      {/* Performance Comparison */}
      <Card className="p-6 bg-slate-900 border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Algorithm Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comparisonData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Legend wrapperStyle={{ color: '#94a3b8' }} />
            <Bar dataKey="Avg Pause (ms)" fill="#06b6d4" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Throughput (obj/cycle)" fill="#22c55e" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      
      {/* Pause Time Timeline */}
      <Card className="p-6 bg-slate-900 border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Pause Duration Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="cycle" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" label={{ value: 'Pause (ms)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            <Legend wrapperStyle={{ color: '#94a3b8' }} />
            {algorithms.map((algo, idx) => (
              <Line 
                key={algo}
                type="monotone" 
                dataKey={algo} 
                stroke={colors[idx % colors.length]} 
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>
      
      {/* Summary Table */}
      <Card className="p-6 bg-slate-900 border-slate-700">
        <h3 className="text-lg font-semibold text-slate-100 mb-4">Detailed Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Algorithm</th>
                <th className="text-right py-3 px-4 text-slate-300 font-semibold">Cycles</th>
                <th className="text-right py-3 px-4 text-slate-300 font-semibold">Avg Pause</th>
                <th className="text-right py-3 px-4 text-slate-300 font-semibold">Total Freed</th>
                <th className="text-right py-3 px-4 text-slate-300 font-semibold">Total Bytes</th>
                <th className="text-right py-3 px-4 text-slate-300 font-semibold">Throughput</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-800 hover:bg-slate-800 transition-colors">
                  <td className="py-3 px-4 text-slate-100 font-mono">{row.name}</td>
                  <td className="py-3 px-4 text-right text-slate-100 font-mono">{row.cycles}</td>
                  <td className="py-3 px-4 text-right text-yellow-400 font-mono">{row['Avg Pause (ms)']} ms</td>
                  <td className="py-3 px-4 text-right text-red-400 font-mono">{row['Total Objects Freed']}</td>
                  <td className="py-3 px-4 text-right text-cyan-400 font-mono">{row['Total Bytes Reclaimed']} B</td>
                  <td className="py-3 px-4 text-right text-green-400 font-mono">{row['Throughput (obj/cycle)']} obj/c</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ComparisonView;