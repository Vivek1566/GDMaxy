# How GCMaxy Works - Complete Guide

## 🎯 Overview

GCMaxy is a **Garbage Collection Simulator** that helps you understand how different garbage collection algorithms work in operating systems. This document explains what the application does, how it works, and why certain design decisions were made.

## 🏗️ Application Architecture

### High-Level Flow

```
User Action (Frontend) 
    ↓
API Request (Axios)
    ↓
FastAPI Backend
    ↓
GC Engine Processing
    ↓
Response with Updated State
    ↓
Frontend Updates Visualization
```

### Components Breakdown

#### **Frontend (React)**
- **Purpose**: Provides interactive UI for visualizing garbage collection
- **Technology**: React 19 with functional components and hooks
- **Hosting**: Vercel (auto-deploys from GitHub)
- **URL**: https://gd-maxy-8dwf.vercel.app

#### **Backend (Python + FastAPI)**
- **Purpose**: Simulates memory management and garbage collection algorithms
- **Technology**: FastAPI with Uvicorn ASGI server
- **Hosting**: Railway (auto-deploys from GitHub)
- **URL**: https://gdmaxy-production.up.railway.app

## 🔄 How Garbage Collection Works

### 1. Memory Heap Simulation

**What happens:**
- Backend creates a simulated heap (default: 1024 bytes)
- Heap is divided into blocks (default: 16 bytes each)
- Each block can be: FREE, ALLOCATED, or MARKED

**Why this design:**
- Real operating systems manage memory in blocks/pages
- Block-based allocation is easier to visualize
- Simulates real memory fragmentation scenarios

### 2. Object Allocation

**User Action**: Click "Allocate Object" or "Generate Workload"

**What happens:**
```
Frontend → POST /api/heap/allocate
Backend → Find free block
Backend → Create MemoryBlock object
Backend → Update heap state
Backend → Return block details
Frontend → Update grid visualization
```

**Data Structure:**
```python
class MemoryBlock:
    id: str          # Unique identifier
    size: int        # Size in blocks
    is_root: bool    # Is this a root object?
    references: []   # IDs of objects this refers to
    marked: bool     # Used during mark phase
```

**Why this design:**
- Root objects represent global/stack variables (always reachable)
- Non-root objects represent heap-allocated data
- References create object graph for reachability analysis

### 3. Garbage Collection Algorithms

#### **Mark-Sweep Algorithm**

**Step 1: Mark Phase**
```python
1. Start with all root objects
2. Mark each root as "reachable"
3. Follow all references recursively
4. Mark all reachable objects
```

**Step 2: Sweep Phase**
```python
1. Iterate through entire heap
2. Find unmarked objects (unreachable)
3. Deallocate unmarked objects
4. Reset marks for next cycle
```

**Visual Effect:**
- Grid blocks turn GREEN during marking
- Unmarked blocks turn GRAY (freed)
- Graph nodes disappear when freed

**Best Use Case:**
- Applications with complex object graphs
- When cycle detection is needed
- Acceptable pause times

**Trade-offs:**
- ✅ Handles circular references automatically
- ✅ Simple implementation
- ❌ "Stop-the-world" pauses during collection
- ❌ Can cause memory fragmentation

---

#### **Reference Counting Algorithm**

**How it works:**
```python
1. Each object has a reference counter
2. Counter increments when reference added
3. Counter decrements when reference removed
4. When counter = 0 → immediate deallocation
```

**Cycle Detection:**
```python
1. Periodically scan for potential cycles
2. Use Depth-First Search (DFS)
3. Find strongly connected components
4. Free cyclic garbage
```

**Visual Effect:**
- Objects freed immediately when no references
- Periodic cycle detection highlighted
- Smooth animation (no pause)

**Best Use Case:**
- Real-time systems requiring predictable performance
- Mobile devices with limited memory
- Reference-heavy applications

**Trade-offs:**
- ✅ Low pause times (incremental)
- ✅ Predictable performance
- ❌ Overhead on every reference operation
- ❌ Cannot handle cycles without extra logic
- ❌ Higher memory overhead (counter storage)

---

#### **Generational Algorithm**

**Concept: Generational Hypothesis**
> "Most objects die young"

**How it works:**
```python
Heap divided into 2 generations:
├── Young Generation (Nursery)
│   ├── New objects allocated here
│   └── Collected frequently (minor GC)
└── Old Generation (Tenured)
    ├── Long-lived objects promoted here
    └── Collected rarely (major GC)
```

**Object Lifecycle:**
```
1. Allocate in Young Gen
2. Survive minor GC → age++
3. If age > threshold → promote to Old Gen
4. Old objects rarely collected
```

**Visual Effect:**
- Young objects: CYAN
- Old objects: DARKER CYAN
- Promotion animation shown

**Best Use Case:**
- Applications creating many temporary objects
- Web servers with request-scoped data
- Modern JVM applications

**Trade-offs:**
- ✅ Lower average pause times
- ✅ Efficient for short-lived objects
- ✅ Reduced GC overhead overall
- ❌ More complex implementation
- ❌ Write barriers needed (performance cost)
- ❌ Occasional full GC still needed

---

#### **Copying (Semi-Space) Algorithm**

**How it works:**
```python
Heap divided into 2 equal spaces:
├── From-Space (active)
└── To-Space (empty)

During GC:
1. Start with root objects
2. Copy live objects from From-Space → To-Space
3. Update all references to new locations
4. Swap spaces (To becomes From)
5. All dead objects left behind (automatically freed)
```

**Visual Effect:**
- Objects move to new locations
- Heap automatically compacted
- No fragmentation visible

**Best Use Case:**
- Applications requiring defragmentation
- When allocation speed is critical
- Functional programming languages

**Trade-offs:**
- ✅ No fragmentation (automatic compaction)
- ✅ Very fast allocation (bump pointer)
- ✅ Single pass (mark + sweep combined)
- ❌ Only 50% of heap usable
- ❌ Copying overhead for large objects
- ❌ All references must be updated

## 📊 Metrics Explained

### Per-Cycle Metrics

**Objects Scanned**
- Total objects examined during GC
- Higher = more work, longer pause

**Objects Freed**
- Number of garbage objects reclaimed
- Higher = more effective collection

**Bytes Reclaimed**
- Memory recovered (objects × block size)
- Tracks actual memory savings

**Pause Duration**
- Time application frozen during GC (milliseconds)
- Critical for real-time systems
- Lower is better

### Aggregate Metrics

**Average Pause**
- Mean pause time across all cycles
- Indicates typical application freeze time

**Throughput**
- Objects processed per GC cycle
- Higher = more efficient

**Fragmentation**
- Percentage of unusable memory gaps
- Lower is better
- Only relevant for non-copying GCs

## 🎮 User Interaction Flow

### Scenario 1: Manual Exploration

```
1. User clicks "Initialize Heap"
   → Backend creates empty heap
   → Frontend shows grid of gray blocks

2. User clicks "Allocate Object" (Root)
   → Backend allocates block, marks as root
   → Frontend shows cyan block with "R" label

3. User clicks "Allocate Object" (Non-root)
   → Backend allocates block
   → Frontend shows cyan block

4. User creates reference (drag-and-drop)
   → Backend links objects
   → Frontend draws arrow in graph

5. User removes root reference
   → Backend updates reference list
   → Graph arrow disappears

6. User clicks "Run Mark-Sweep GC"
   → Backend marks reachable objects
   → Backend sweeps unmarked objects
   → Frontend animates: green → gray
   → Metrics panel updates

7. User views results
   → Check metrics (pause time, objects freed)
   → Compare with other algorithms
```

### Scenario 2: Automated Testing

```
1. User selects workload type (e.g., "Circular References")
   → Frontend sends workload config

2. User clicks "Generate Workload"
   → Backend creates objects with circular refs
   → Frontend shows complex graph

3. User enables "Auto Run"
   → Backend runs GC every N seconds
   → Frontend updates in real-time

4. User switches algorithms
   → Backend uses different GC strategy
   → User observes different behavior

5. User navigates to "Comparison" tab
   → Frontend shows charts comparing all algorithms
   → Pause times, throughput, fragmentation graphs
```

## 🔍 Why This Design?

### Frontend Architecture

**React with Hooks (not classes)**
- Simpler state management
- Better performance with memoization
- Modern React best practices

**D3.js for Graph Visualization**
- Force-directed layout natural for reference graphs
- Interactive and responsive
- Industry-standard for data visualization

**Tailwind CSS + shadcn/ui**
- Rapid UI development
- Consistent design system
- Accessible components out-of-the-box

**Separate Components**
- `GridView`: Heap memory visualization
- `GraphView`: Object reference graph
- `ControlPanel`: User controls
- `MetricsPanel`: Performance data
- `ComparisonView`: Algorithm comparison
- `ExportPanel`: Data export

**Why separated?**
- Easier to maintain and test
- Can update visualizations independently
- Reusable across similar projects

### Backend Architecture

**FastAPI (not Flask/Django)**
- Async support for better performance
- Automatic API documentation (Swagger UI)
- Type hints with Pydantic validation
- Modern Python 3.11+ features

**Separate GC Engine Modules**
```
gc_engine/
├── memory.py          → Core heap simulation
├── mark_sweep.py      → Mark-Sweep implementation
├── reference_counting.py → Ref counting + cycle detection
├── generational.py    → Generational GC
├── copying.py         → Semi-space copying
├── metrics.py         → Performance tracking
└── workload.py        → Test case generation
```

**Why modular?**
- Easy to add new algorithms
- Each algorithm is self-contained
- Testable in isolation
- Clear separation of concerns

### API Design

**RESTful Endpoints**
```
/api/heap/*      → Heap state management
/api/gc/*        → Garbage collection operations
/api/metrics/*   → Performance data retrieval
/api/workload/*  → Test case generation
```

**Why REST?**
- Simple and well-understood
- Easy to test with curl/Postman
- Works with any frontend framework
- Stateless (scalable)

### Deployment Strategy

**Vercel for Frontend**
- Zero-config React deployment
- Automatic HTTPS
- CDN for fast global access
- Git-based workflow (push to deploy)

**Railway for Backend**
- Easy Python deployment
- Automatic environment management
- Built-in PostgreSQL/Redis (if needed)
- Free tier suitable for demos

**Why separate deployments?**
- Independent scaling (frontend vs backend)
- Frontend can use CDN caching
- Backend can be updated without redeploying frontend
- Industry-standard microservices approach

## 🚀 Performance Optimizations

### Frontend

1. **React Memoization**
   - `useMemo` for expensive calculations
   - `useCallback` for stable function references
   - Prevents unnecessary re-renders

2. **Debounced API Calls**
   - User interactions debounced to reduce requests
   - Batch updates when possible

3. **Lazy Loading**
   - Components loaded on-demand
   - Reduces initial bundle size

### Backend

1. **In-Memory State**
   - No database for simulation state
   - Fast read/write operations
   - State reset per session

2. **Efficient Algorithms**
   - DFS for reachability (O(V+E))
   - Bitmap for marked objects
   - Minimal memory allocations

## 🎓 Educational Value

### What Students Learn

1. **Memory Management**
   - How heaps work
   - Block allocation strategies
   - Fragmentation problems

2. **Algorithm Trade-offs**
   - Pause time vs throughput
   - Memory overhead vs simplicity
   - Deterministic vs non-deterministic behavior

3. **Object Graphs**
   - Reachability concept
   - Root set importance
   - Circular reference challenges

4. **Performance Analysis**
   - Reading metrics
   - Comparing algorithms
   - Understanding workload impact

### Real-World Applications

- **Java/JVM**: Uses Generational GC (G1GC, ZGC)
- **Python**: Uses Reference Counting + Mark-Sweep for cycles
- **JavaScript/V8**: Generational + Mark-Sweep
- **Rust**: No GC (ownership model, similar to ref counting)
- **Go**: Concurrent Mark-Sweep

## 🐛 Common Issues & Solutions

### Issue: "Failed to initialize heap"

**Cause**: Backend not responding or CORS issue

**Solution:**
1. Check Railway logs for backend errors
2. Verify `ALLOWED_ORIGINS` includes your Vercel URL
3. Ensure backend is deployed and running

### Issue: Graph not showing connections

**Cause**: References not created properly

**Solution:**
1. Ensure objects are allocated first
2. Create references after allocation
3. Check browser console for errors

### Issue: Metrics not updating

**Cause**: API call failing or frontend state stale

**Solution:**
1. Open browser DevTools → Network tab
2. Check for failed API requests
3. Verify backend URL in environment variables

## 📚 Further Learning

### Recommended Reading

1. **Operating System Concepts** by Silberschatz
   - Chapter on Memory Management
   - GC section in language runtimes

2. **The Garbage Collection Handbook**
   - In-depth algorithm analysis
   - Performance tuning strategies

3. **JVM Internals**
   - Real-world GC implementation
   - G1GC and ZGC details

### Online Resources

- [Python Memory Management](https://docs.python.org/3/c-api/memory.html)
- [Java Garbage Collection Tuning](https://docs.oracle.com/en/java/javase/17/gctuning/)
- [V8 Blog - Trash Talk](https://v8.dev/blog/trash-talk)

## 🎯 Summary

**What GCMaxy Does:**
- Simulates 4 different garbage collection algorithms
- Visualizes memory heap and object references
- Tracks performance metrics
- Compares algorithm efficiency

**Why It's Built This Way:**
- **Modular**: Easy to extend with new algorithms
- **Educational**: Clear visualization of abstract concepts
- **Performant**: Optimized for smooth real-time updates
- **Accessible**: Deployed and available online
- **Professional**: Industry-standard tech stack

**Key Takeaway:**
Garbage collection is about **trade-offs**. No single algorithm is "best" - the right choice depends on your application's requirements (pause time, throughput, memory overhead, predictability).
