import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Play, Pause, RotateCcw, Zap, Settings } from 'lucide-react';

const ControlPanel = ({ 
  onAllocate, 
  onDeallocate, 
  onRunGC, 
  onGenerateWorkload,
  onReset,
  isAutoRunning,
  onToggleAutoRun
}) => {
  const [algorithm, setAlgorithm] = useState('mark-sweep');
  const [workloadType, setWorkloadType] = useState('random');
  const [workloadCount, setWorkloadCount] = useState([10]);
  const [minorOnly, setMinorOnly] = useState(true);
  
  const algorithms = [
    { value: 'mark-sweep', label: 'Mark-Sweep' },
    { value: 'reference-counting', label: 'Reference Counting' },
    { value: 'generational', label: 'Generational' },
    { value: 'copying', label: 'Copying (Semi-space)' }
  ];
  
  const workloads = [
    { value: 'random', label: 'Random Objects' },
    { value: 'circular', label: 'Circular References' },
    { value: 'long-lived', label: 'Long-lived Objects' },
    { value: 'short-lived', label: 'Short-lived Objects' },
    { value: 'mixed', label: 'Mixed Workload' }
  ];
  
  return (
    <Card data-testid="control-panel" className="p-6 bg-slate-900 border-slate-700">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-slate-100 mb-1">Control Panel</h3>
          <p className="text-sm text-slate-400">Manage memory allocation and garbage collection</p>
        </div>
        
        {/* Algorithm Selection */}
        <div className="space-y-2">
          <Label className="text-slate-300">GC Algorithm</Label>
          <Select value={algorithm} onValueChange={setAlgorithm}>
            <SelectTrigger data-testid="algorithm-select" className="bg-slate-800 border-slate-700 text-slate-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {algorithms.map(algo => (
                <SelectItem key={algo.value} value={algo.value} className="text-slate-100">
                  {algo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Generational Options */}
        {algorithm === 'generational' && (
          <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
            <Label htmlFor="minor-only" className="text-slate-300">Minor Collection Only</Label>
            <Switch
              id="minor-only"
              checked={minorOnly}
              onCheckedChange={setMinorOnly}
              data-testid="minor-only-switch"
            />
          </div>
        )}
        
        {/* GC Controls */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            data-testid="run-gc-button"
            onClick={() => onRunGC(algorithm, minorOnly)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            Run GC
          </Button>
          <Button
            data-testid="auto-run-toggle"
            onClick={onToggleAutoRun}
            variant={isAutoRunning ? 'destructive' : 'outline'}
            className={isAutoRunning ? '' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}
          >
            {isAutoRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isAutoRunning ? 'Pause Auto' : 'Auto Run'}
          </Button>
        </div>
        
        {/* Workload Generation */}
        <div className="border-t border-slate-700 pt-6">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Workload Generation</h4>
          <div className="space-y-3">
            <Select value={workloadType} onValueChange={setWorkloadType}>
              <SelectTrigger data-testid="workload-select" className="bg-slate-800 border-slate-700 text-slate-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {workloads.map(wl => (
                  <SelectItem key={wl.value} value={wl.value} className="text-slate-100">
                    {wl.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Object Count: {workloadCount[0]}</Label>
              <Slider
                data-testid="workload-count-slider"
                value={workloadCount}
                onValueChange={setWorkloadCount}
                min={3}
                max={30}
                step={1}
                className="py-2"
              />
            </div>
            
            <Button
              data-testid="generate-workload-button"
              onClick={() => onGenerateWorkload(workloadType, workloadCount[0])}
              variant="outline"
              className="w-full border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Settings className="w-4 h-4 mr-2" />
              Generate Workload
            </Button>
          </div>
        </div>
        
        {/* Manual Controls */}
        <div className="border-t border-slate-700 pt-6">
          <h4 className="text-sm font-semibold text-slate-300 mb-3">Manual Controls</h4>
          <div className="grid grid-cols-2 gap-3">
            <Button
              data-testid="allocate-button"
              onClick={() => onAllocate(1, false)}
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Allocate Object
            </Button>
            <Button
              data-testid="allocate-root-button"
              onClick={() => onAllocate(1, true)}
              variant="outline"
              size="sm"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Allocate Root
            </Button>
          </div>
        </div>
        
        {/* Reset */}
        <Button
          data-testid="reset-button"
          onClick={onReset}
          variant="destructive"
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset Simulation
        </Button>
      </div>
    </Card>
  );
};

export default ControlPanel;