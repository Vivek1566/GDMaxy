import { useState, useEffect, useRef } from "react";
import "@/App.css";
import axios from "axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import GridView from "@/components/GridView";
import GraphView from "@/components/GraphView";
import ControlPanel from "@/components/ControlPanel";
import MetricsPanel from "@/components/MetricsPanel";
import ComparisonView from "@/components/ComparisonView";
import ExportPanel from "@/components/ExportPanel";
import { Activity } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [heapState, setHeapState] = useState({ stats: {}, blocks: [], roots: [] });
  const [lastGCMetrics, setLastGCMetrics] = useState(null);
  const [allCycles, setAllCycles] = useState([]);
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [currentView, setCurrentView] = useState('simulation');
  const autoRunInterval = useRef(null);

  // Fetch heap state
  const fetchHeapState = async () => {
    try {
      const response = await axios.get(`${API}/heap/state`);
      setHeapState(response.data);
    } catch (error) {
      console.error('Failed to fetch heap state:', error);
    }
  };

  // Fetch all GC cycles
  const fetchCycles = async () => {
    try {
      const response = await axios.get(`${API}/metrics/cycles`);
      setAllCycles(response.data.cycles || []);
    } catch (error) {
      console.error('Failed to fetch cycles:', error);
    }
  };

  // Initialize heap
  const initializeHeap = async () => {
    try {
      await axios.post(`${API}/heap/init`, {
        total_size: 1024,
        block_size: 16
      });
      await fetchHeapState();
      toast.success('Heap initialized successfully');
    } catch (error) {
      toast.error('Failed to initialize heap');
    }
  };

  useEffect(() => {
    initializeHeap();
  }, []);

  // Allocate memory
  const handleAllocate = async (size = 1, root = false) => {
    try {
      await axios.post(`${API}/heap/allocate`, { size, root });
      await fetchHeapState();
      toast.success(`Allocated ${root ? 'root' : ''} object`);
    } catch (error) {
      toast.error('Allocation failed');
    }
  };

  // Run GC
  const handleRunGC = async (algorithm, minorOnly = true) => {
    try {
      const response = await axios.post(`${API}/gc/collect`, {
        algorithm,
        minor_only: minorOnly
      });
      setLastGCMetrics(response.data.metrics);
      setHeapState({
        stats: response.data.heap,
        blocks: response.data.blocks,
        roots: heapState.roots
      });
      await fetchCycles();
      toast.success(`GC completed: ${response.data.metrics.objects_freed} objects freed`);
    } catch (error) {
      toast.error('GC failed');
    }
  };

  // Generate workload
  const handleGenerateWorkload = async (type, count) => {
    try {
      await axios.post(`${API}/workload/generate`, {
        type,
        count,
        root_prob: 0.3,
        ref_density: 0.3
      });
      await fetchHeapState();
      toast.success(`Generated ${type} workload`);
    } catch (error) {
      toast.error('Workload generation failed');
    }
  };

  // Reset simulation
  const handleReset = async () => {
    try {
      await axios.post(`${API}/heap/reset`);
      await fetchHeapState();
      setLastGCMetrics(null);
      setAllCycles([]);
      toast.success('Simulation reset');
    } catch (error) {
      toast.error('Reset failed');
    }
  };

  // Auto-run toggle
  const toggleAutoRun = () => {
    if (isAutoRunning) {
      if (autoRunInterval.current) {
        clearInterval(autoRunInterval.current);
        autoRunInterval.current = null;
      }
      setIsAutoRunning(false);
      toast.info('Auto-run stopped');
    } else {
      const algorithms = ['mark-sweep', 'reference-counting', 'generational', 'copying'];
      let algoIndex = 0;
      
      autoRunInterval.current = setInterval(async () => {
        // Generate some workload
        await handleGenerateWorkload('random', 8);
        
        // Run GC with different algorithm
        setTimeout(async () => {
          await handleRunGC(algorithms[algoIndex % algorithms.length]);
          algoIndex++;
        }, 1000);
      }, 5000);
      
      setIsAutoRunning(true);
      toast.info('Auto-run started');
    }
  };

  useEffect(() => {
    return () => {
      if (autoRunInterval.current) {
        clearInterval(autoRunInterval.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <Toaster position="top-right" theme="dark" />
      
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-cyan-400" />
              <div>
                <h1 className="text-2xl font-bold text-slate-100">GC Simulator</h1>
                <p className="text-sm text-slate-400">Operating System - Garbage Collection Algorithms</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-300">System Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div id="gc-dashboard" className="max-w-[1800px] mx-auto px-6 py-6">
        <Tabs value={currentView} onValueChange={setCurrentView} className="space-y-6">
          <TabsList data-testid="main-tabs" className="bg-slate-900 border border-slate-700">
            <TabsTrigger value="simulation" data-testid="simulation-tab" className="data-[state=active]:bg-slate-800">
              Simulation
            </TabsTrigger>
            <TabsTrigger value="comparison" data-testid="comparison-tab" className="data-[state=active]:bg-slate-800">
              Comparison
            </TabsTrigger>
            <TabsTrigger value="analysis" data-testid="analysis-tab" className="data-[state=active]:bg-slate-800">
              Analysis
            </TabsTrigger>
          </TabsList>

          {/* Simulation View */}
          <TabsContent value="simulation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Left: Control Panel */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  <ControlPanel
                    onAllocate={handleAllocate}
                    onDeallocate={() => {}}
                    onRunGC={handleRunGC}
                    onGenerateWorkload={handleGenerateWorkload}
                    onReset={handleReset}
                    isAutoRunning={isAutoRunning}
                    onToggleAutoRun={toggleAutoRun}
                  />
                  <ExportPanel cycles={allCycles} heapStats={heapState.stats} />
                </div>
              </div>

              {/* Right: Visualizations */}
              <div className="lg:col-span-3 space-y-6">
                <MetricsPanel heapStats={heapState.stats} lastGCMetrics={lastGCMetrics} />
                
                <GridView
                  blocks={heapState.blocks}
                  heapSize={heapState.stats.total_size}
                  blockSize={16}
                />
                
                <GraphView
                  blocks={heapState.blocks}
                  roots={heapState.roots}
                />
              </div>
            </div>
          </TabsContent>

          {/* Comparison View */}
          <TabsContent value="comparison">
            <ComparisonView cycles={allCycles} />
          </TabsContent>

          {/* Analysis View */}
          <TabsContent value="analysis">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ComparisonView cycles={allCycles} />
              <div className="space-y-6">
                <MetricsPanel heapStats={heapState.stats} lastGCMetrics={lastGCMetrics} />
                <ExportPanel cycles={allCycles} heapStats={heapState.stats} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
