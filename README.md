# GCMaxy - Garbage Collection Simulator

A comprehensive, interactive web-based simulation system for visualizing and comparing garbage collection algorithms in operating systems.

## 🌐 Live Demo

- **Frontend**: [https://gd-maxy-8dwf.vercel.app](https://gd-maxy-8dwf.vercel.app)
- **Backend API**: [https://gdmaxy-production.up.railway.app](https://gdmaxy-production.up.railway.app)

## 🎯 Project Overview

This application provides a complete working simulation of memory management and garbage collection, featuring:

- **4 GC Algorithms**: Mark-Sweep, Reference Counting, Generational, and Copying (Semi-space)
- **Real-time Visualization**: Grid-based heap view and interactive reference graph
- **Performance Metrics**: Detailed tracking of pause times, throughput, and memory reclamation
- **Algorithm Comparison**: Side-by-side analysis with charts and graphs
- **Interactive Controls**: Manual and automated simulation modes
- **Export Capabilities**: CSV, JSON, and screenshot export for reports

## 🏗️ Architecture

### Backend (Python + FastAPI)
```
/backend/
├── server.py              # FastAPI application with all GC endpoints
├── gc_engine/
│   ├── memory.py          # Heap simulator and memory block management
│   ├── mark_sweep.py      # Mark-Sweep GC implementation
│   ├── reference_counting.py  # Reference Counting with cycle detection
│   ├── generational.py    # 2-generation GC (young/old)
│   ├── copying.py         # Copying GC with semi-space
│   ├── metrics.py         # Performance tracking and aggregation
│   └── workload.py        # Workload generation for testing
└── requirements.txt
```

### Frontend (React)
```
/frontend/src/
├── App.js                 # Main application with state management
├── components/
│   ├── GridView.js        # Heap memory grid visualization
│   ├── GraphView.js       # Reference graph with D3 force simulation
│   ├── ControlPanel.js    # Algorithm selection and controls
│   ├── MetricsPanel.js    # Real-time statistics display
│   ├── ComparisonView.js  # Algorithm comparison charts
│   └── ExportPanel.js     # Data export functionality
└── components/ui/         # Shadcn UI components
```

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 16+
- Yarn package manager

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/Vivek1566/GDMaxy.git
cd GDMaxy
```

2. **Backend Setup**
```bash
cd backend
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd frontend
yarn install
```

4. **Start Backend**
```bash
cd backend
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

5. **Start Frontend** (in a new terminal)
```bash
cd frontend
yarn start
```

6. **Access the application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### Deployment

The application is deployed using:
- **Frontend**: Vercel (automatically deploys from main branch)
- **Backend**: Railway (automatically deploys from main branch)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## 📊 Features

### 1. Garbage Collection Algorithms

#### Mark-Sweep
- **Phase 1 (Mark)**: Traverses from root objects, marking all reachable objects
- **Phase 2 (Sweep)**: Deallocates unmarked objects
- **Pros**: Simple, handles cycles
- **Cons**: Fragmentation, "stop-the-world" pauses

#### Reference Counting
- Maintains count of references to each object
- Immediate deallocation when count reaches zero
- Includes cycle detection using DFS
- **Pros**: Low pause times, predictable
- **Cons**: Overhead per reference operation, cycle detection needed

#### Generational
- Two generations: Young (nursery) and Old (tenured)
- Objects promoted after surviving multiple collections
- Minor collections focus on young generation
- **Pros**: Efficient for short-lived objects, reduced pause times
- **Cons**: More complex, requires write barriers

#### Copying (Semi-space)
- Divides heap into two semi-spaces
- Copies live objects to other space during collection
- Automatically compacts memory
- **Pros**: No fragmentation, fast allocation
- **Cons**: Only uses half of available memory

### 2. Visualization Components

#### Heap Memory Grid
- Visual representation of memory blocks
- Color-coded states:
  - Gray: Free memory
  - Cyan: Allocated objects
  - Green: Marked (reachable) objects
  - Purple: Root objects

#### Reference Graph
- Interactive force-directed graph using D3
- Shows object relationships and reference chains
- Real-time updates during allocation and collection

### 3. Performance Metrics

**Per-Cycle Metrics:**
- Objects scanned
- Objects freed
- Bytes reclaimed
- Pause duration (ms)
- Generation/collection type

**Aggregate Metrics:**
- Total cycles
- Average pause duration
- Total memory reclaimed
- Throughput (objects per cycle)
- Fragmentation percentage

### 4. Workload Patterns

- **Random**: Mixed allocation with configurable root probability
- **Circular References**: Creates reference cycles for testing
- **Long-lived Objects**: Simulates persistent data
- **Short-lived Objects**: Simulates temporary allocations
- **Mixed Workload**: Combination of long and short-lived objects

### 5. Simulation Modes

#### Manual Mode
- Step-by-step control
- Manual object allocation
- Trigger GC on demand
- Ideal for demonstrations and education

#### Auto Mode
- Automated workload generation
- Periodic GC cycles
- Rotates through different algorithms
- Perfect for benchmarking and comparison

## 🔧 API Endpoints

### Heap Management
- `POST /api/heap/init` - Initialize/reset heap
- `GET /api/heap/state` - Get current heap state
- `POST /api/heap/allocate` - Allocate memory block
- `DELETE /api/heap/deallocate/{block_id}` - Deallocate block
- `POST /api/heap/reference` - Add reference between blocks
- `DELETE /api/heap/reference` - Remove reference
- `POST /api/heap/reset` - Reset entire simulation

### Garbage Collection
- `POST /api/gc/collect` - Run GC with specified algorithm

### Metrics & Analysis
- `GET /api/metrics/cycles` - Get all GC cycles
- `GET /api/metrics/summary` - Get aggregate metrics
- `GET /api/metrics/comparison` - Compare algorithms
- `GET /api/metrics/export/csv` - Export metrics as CSV

### Workload Generation
- `POST /api/workload/generate` - Generate test workload

## 📈 Using the Application

### Basic Workflow

1. **Generate Workload**
   - Select workload type (random, circular, mixed, etc.)
   - Adjust object count
   - Click "Generate Workload"

2. **View Memory State**
   - Observe heap grid showing allocated blocks
   - Check reference graph for object relationships
   - Monitor real-time statistics

3. **Run Garbage Collection**
   - Select GC algorithm
   - Click "Run GC" or enable "Auto Run"
   - Watch visualization update in real-time

4. **Analyze Results**
   - Switch to "Comparison" tab for algorithm analysis
   - View performance charts and metrics
   - Export data for reports

### For Viva/Demonstration

1. Start with Manual Mode
2. Explain heap initialization
3. Allocate a few root and non-root objects manually
4. Create some references to show the graph
5. Run Mark-Sweep and explain the mark and sweep phases
6. Show how unmarked objects are freed
7. Switch algorithms and compare pause times
8. Use Auto Mode to demonstrate continuous operation
9. Navigate to Comparison tab to show performance graphs
10. Export metrics for report

## 📊 Sample Test Cases

### Test Case 1: Basic Mark-Sweep
```python
# Generate 10 random objects
# 3 roots, 7 non-roots, some references
# Run Mark-Sweep GC
# Verify: Only reachable objects remain
```

### Test Case 2: Circular Reference Detection
```python
# Create circular reference chain (size 3)
# No roots pointing to the chain
# Run Reference Counting GC
# Verify: Cycle detected and freed
```

### Test Case 3: Generational Promotion
```python
# Generate mixed workload
# Run multiple minor collections
# Verify: Old objects promoted to tenured generation
```

### Test Case 4: Copying Compaction
```python
# Allocate fragmented memory
# Run Copying GC
# Verify: Memory compacted, no fragmentation
```

## 🎓 Educational Value

### Learning Outcomes

1. **Memory Management Concepts**
   - Heap organization
   - Block allocation/deallocation
   - Fragmentation
   - Reference tracking

2. **GC Algorithm Trade-offs**
   - Pause time vs throughput
   - Memory overhead
   - Fragmentation handling
   - Cycle detection

3. **Performance Analysis**
   - Metric interpretation
   - Workload impact
   - Algorithm selection criteria

### Viva Questions Coverage

- What is garbage collection?
- Explain Mark-Sweep algorithm
- How does Reference Counting handle cycles?
- What is generational hypothesis?
- Compare pause times of different algorithms
- What causes memory fragmentation?
- How does Copying GC eliminate fragmentation?
- What are root objects?
- Explain reachability in GC
- Why is GC important in OS?

## 📝 Report Generation

### Included Metrics

1. **Performance Graphs**
   - Pause duration comparison
   - Throughput analysis
   - Memory reclamation trends

2. **Statistical Data**
   - Average pause times
   - Total objects freed
   - Bytes reclaimed
   - Fragmentation percentage

3. **Algorithm Analysis**
   - Best/worst case scenarios
   - Trade-off discussion
   - Use case recommendations

### Export Options

- **CSV**: Raw data for Excel analysis
- **JSON**: Complete state for processing
- **Screenshots**: Visual evidence for report

## 🔍 Technical Implementation Details

### Backend Design

- **HeapSimulator**: Core memory management
- **MemoryBlock**: Object representation with metadata
- **GC Algorithms**: Modular implementations with common interface
- **MetricsTracker**: Performance data collection
- **WorkloadGenerator**: Test case creation

### Frontend Design

- **React Hooks**: State management
- **D3 Force Simulation**: Graph visualization
- **Recharts**: Performance charts
- **Shadcn UI**: Modern component library
- **Axios**: API communication

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors, ensure:
- Backend `ALLOWED_ORIGINS` environment variable includes your frontend URL
- Railway deployment has restarted after environment variable changes

### Backend Not Responding
Check Railway deployment logs for errors. Common issues:
- Missing environment variables
- Dependencies not installed correctly
- Port binding issues

### Frontend Build Failures
Ensure all dependencies are installed:
```bash
cd frontend
yarn install
yarn build
```

## 📚 References

- Operating System Concepts (Silberschatz)
- The Garbage Collection Handbook
- Java Garbage Collection documentation
- V8 Engine GC implementation

## 🛠️ Tech Stack

**Frontend:**
- React 19
- Tailwind CSS
- shadcn/ui components
- D3.js for visualizations
- Recharts for performance graphs
- Axios for API calls

**Backend:**
- Python 3.11
- FastAPI
- Uvicorn server
- Pydantic for data validation

**Deployment:**
- Vercel (Frontend)
- Railway (Backend)

## 👥 Credits

Garbage Collection Simulator for Operating Systems course project

## 📄 License

MIT License - Educational use
