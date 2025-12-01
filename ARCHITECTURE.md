# GC Simulator - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐   │
│  │   Control   │  │ Visualization │  │    Metrics &    │   │
│  │    Panel    │  │  Components   │  │   Comparison    │   │
│  └─────────────┘  └──────────────┘  └─────────────────┘   │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST API
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              API Endpoints Layer                      │  │
│  │  (heap, gc, metrics, workload management)            │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │              GC Engine Core                           │  │
│  │  ┌──────────────┐  ┌────────────────────────────┐   │  │
│  │  │    Heap      │  │   GC Algorithms            │   │  │
│  │  │  Simulator   │◄─┤ • Mark-Sweep               │   │  │
│  │  │              │  │ • Reference Counting       │   │  │
│  │  │ • Blocks     │  │ • Generational             │   │  │
│  │  │ • References │  │ • Copying (Semi-space)     │   │  │
│  │  └──────────────┘  └────────────────────────────┘   │  │
│  │                                                       │  │
│  │  ┌──────────────┐  ┌────────────────────────────┐   │  │
│  │  │   Metrics    │  │   Workload Generator       │   │  │
│  │  │   Tracker    │  │ • Random patterns          │   │  │
│  │  │              │  │ • Circular refs            │   │  │
│  │  └──────────────┘  └────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Frontend Architecture

#### Main Application (App.js)
- **State Management**: React hooks for heap state, metrics, cycles
- **API Communication**: Axios for REST calls
- **View Routing**: Tabs for simulation, comparison, analysis
- **Auto-run Mode**: Interval-based automated testing

#### Visualization Components

**GridView.js**
- Grid-based heap representation
- Color-coded block states
- Responsive layout
- Hover tooltips for block info

**GraphView.js**
- D3 force-directed graph
- Canvas-based rendering for performance
- Real-time node positioning
- Reference arrows and node labels

**ControlPanel.js**
- Algorithm selection dropdown
- Workload configuration
- Manual/auto mode controls
- Reset functionality

**MetricsPanel.js**
- Real-time heap statistics
- Last GC cycle details
- Icon-based metric display
- Color-coded values

**ComparisonView.js**
- Recharts bar and line charts
- Algorithm performance table
- Pause duration timeline
- Throughput analysis

**ExportPanel.js**
- CSV export with all metrics
- JSON export for raw data
- Screenshot capture (html2canvas)
- Download functionality

### 2. Backend Architecture

#### API Layer (server.py)

**Endpoints:**
```python
# Heap Management
POST   /api/heap/init          # Initialize heap
GET    /api/heap/state         # Get heap state
POST   /api/heap/allocate      # Allocate memory
DELETE /api/heap/deallocate    # Deallocate memory
POST   /api/heap/reference     # Add reference
DELETE /api/heap/reference     # Remove reference
POST   /api/heap/reset         # Reset simulation

# Garbage Collection
POST   /api/gc/collect         # Run GC

# Metrics
GET    /api/metrics/cycles    # All cycles
GET    /api/metrics/summary   # Aggregate stats
GET    /api/metrics/comparison # Algorithm comparison
GET    /api/metrics/export/csv # CSV export

# Workload
POST   /api/workload/generate # Generate workload
```

#### GC Engine Core

**memory.py - HeapSimulator**
```python
class HeapSimulator:
    - total_size: Heap capacity
    - block_size: Size of each block
    - blocks: Dictionary of MemoryBlock objects
    - roots: Set of root object IDs
    - free_blocks: Available memory
    
    Methods:
    - allocate(size, root)
    - deallocate(block_id)
    - add_reference(from_id, to_id)
    - remove_reference(from_id, to_id)
    - get_stats()
```

**MemoryBlock**
```python
@dataclass
class MemoryBlock:
    id: str
    size: int
    allocated: bool
    marked: bool
    generation: int
    references: Set[str]
    age: int
    root: bool
```

#### GC Algorithm Implementations

**mark_sweep.py**
```python
class MarkSweepGC:
    def mark(block_id, marked):
        # Recursive marking from roots
        
    def collect():
        # 1. Mark phase: traverse from roots
        # 2. Sweep phase: free unmarked objects
        # 3. Return metrics
```

**reference_counting.py**
```python
class ReferenceCountingGC:
    def _update_ref_counts():
        # Count references to each object
        
    def _detect_cycles():
        # DFS-based cycle detection
        
    def collect():
        # 1. Update reference counts
        # 2. Detect cycles
        # 3. Free objects with count=0 or in cycles
```

**generational.py**
```python
class GenerationalGC:
    def collect_generation(generation):
        # Collect specific generation
        
    def collect(minor_only):
        # 1. Minor collection (gen 0)
        # 2. Optional major collection (all gens)
        # 3. Promote old objects
```

**copying.py**
```python
class CopyingGC:
    def _copy_object(block_id, copied):
        # Recursively copy reachable objects
        
    def collect():
        # 1. Copy live objects to to-space
        # 2. Free from-space
        # 3. Swap spaces
```

#### Metrics System

**metrics.py**
```python
class MetricsTracker:
    - cycles: List of all GC cycles
    - current_cycle: Counter
    
    Methods:
    - record_cycle(metrics)
    - get_all_cycles()
    - get_summary()
    - get_algorithm_comparison()
    - export_csv()
```

#### Workload Generator

**workload.py**
```python
class WorkloadGenerator:
    Methods:
    - random_allocation(count, root_prob)
    - create_references(blocks, ref_density)
    - create_circular_reference(size)
    - simulate_long_lived_objects(count)
    - simulate_short_lived_objects(count)
    - mixed_workload()
```

## Data Flow

### 1. Memory Allocation Flow
```
User clicks "Allocate Object"
    ↓
Frontend sends POST /api/heap/allocate
    ↓
HeapSimulator.allocate() creates MemoryBlock
    ↓
Updates blocks dict and free_blocks counter
    ↓
Returns block_id and updated heap stats
    ↓
Frontend updates state and re-renders
    ↓
GridView and GraphView show new object
```

### 2. GC Collection Flow
```
User selects algorithm and clicks "Run GC"
    ↓
Frontend sends POST /api/gc/collect {algorithm}
    ↓
Server selects GC algorithm instance
    ↓
Algorithm.collect() executes:
  - Mark/count/copy phase
  - Sweep/free phase
  - Metrics calculation
    ↓
MetricsTracker.record_cycle(metrics)
    ↓
Returns metrics + updated heap state
    ↓
Frontend updates all panels
    ↓
Visualizations show freed objects
```

### 3. Comparison Flow
```
User switches to Comparison tab
    ↓
Frontend reads allCycles state
    ↓
ComparisonView aggregates data by algorithm
    ↓
Recharts renders bar/line charts
    ↓
Table displays detailed metrics
```

## Performance Considerations

### Frontend
- **Canvas rendering** for graph (better than SVG for many nodes)
- **Memoization** of chart data calculations
- **Debounced updates** for slider controls
- **Lazy loading** of heavy components

### Backend
- **Efficient data structures** (sets for O(1) lookups)
- **Iterative algorithms** where possible (avoid deep recursion)
- **Batched updates** for metrics
- **Fast serialization** with Pydantic

## Scalability

### Current Limits
- Heap size: 1024 bytes (configurable)
- Max objects: ~60-70 for clear visualization
- GC cycles tracked: Unlimited (in-memory)

### Extension Points
- Add more GC algorithms (tri-color marking, concurrent GC)
- Implement write barriers for generational GC
- Add memory allocation strategies (first-fit, best-fit)
- Support for object sizes and types
- Multi-threaded GC simulation

## Technology Stack

### Backend
- **FastAPI**: Modern async web framework
- **Pydantic**: Data validation
- **Motor**: Async MongoDB driver (for future persistence)
- **Python 3.8+**: Core language

### Frontend
- **React 19**: UI framework
- **D3.js**: Graph visualization
- **Recharts**: Charts and graphs
- **Shadcn UI**: Component library
- **Tailwind CSS**: Styling
- **Axios**: HTTP client
- **html2canvas**: Screenshot capture

### Development
- **Supervisor**: Process management
- **Hot reload**: Auto-restart on changes
- **Yarn**: Package management
- **pip**: Python packages

## Security Considerations

- **CORS**: Configured for local development
- **Input validation**: Pydantic models
- **No persistent storage**: All data in-memory
- **No authentication**: Educational app, local use only

## Testing Strategy

### Unit Tests (Recommended)
```python
# Test heap operations
def test_allocate_deallocate()
def test_reference_management()

# Test each GC algorithm
def test_mark_sweep_basic()
def test_reference_counting_cycles()
def test_generational_promotion()
def test_copying_compaction()

# Test metrics
def test_cycle_recording()
def test_comparison_aggregation()
```

### Integration Tests
```python
# Test API endpoints
def test_full_gc_cycle()
def test_workload_generation()
def test_metrics_export()
```

### Manual Testing
- Visual inspection of UI
- Cross-algorithm comparison
- Performance under load
- Edge cases (empty heap, full heap)

## Deployment

### Development
```bash
# Backend
cd backend && uvicorn server:app --reload

# Frontend  
cd frontend && yarn start
```

### Production
```bash
# Supervisor manages both services
sudo supervisorctl restart backend frontend
```

## Future Enhancements

1. **More GC Algorithms**
   - Tri-color marking
   - Incremental GC
   - Concurrent GC
   - Compacting collectors

2. **Advanced Features**
   - Object type system
   - Custom allocation strategies
   - Memory pressure simulation
   - Multi-threaded scenarios

3. **Educational Tools**
   - Step-by-step execution
   - Algorithm explanation overlays
   - Interactive tutorials
   - Quiz mode

4. **Persistence**
   - Save/load simulations
   - Historical data analysis
   - User accounts
   - Shared scenarios

5. **Visualization**
   - 3D heap view
   - Animation of GC phases
   - Memory timeline
   - Heat maps
