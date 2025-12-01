from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional
import uuid
from datetime import datetime, timezone

from gc_engine.memory import HeapSimulator
from gc_engine.mark_sweep import MarkSweepGC
from gc_engine.reference_counting import ReferenceCountingGC
from gc_engine.generational import GenerationalGC
from gc_engine.copying import CopyingGC
from gc_engine.metrics import MetricsTracker
from gc_engine.workload import WorkloadGenerator

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Global GC engine instances
heap = HeapSimulator(total_size=1024, block_size=16)
mark_sweep_gc = MarkSweepGC(heap)
ref_counting_gc = ReferenceCountingGC(heap)
generational_gc = GenerationalGC(heap, promotion_age=2)
copying_gc = CopyingGC(heap)
metrics_tracker = MetricsTracker()
workload_gen = WorkloadGenerator(heap)

gc_algorithms = {
    'mark-sweep': mark_sweep_gc,
    'reference-counting': ref_counting_gc,
    'generational': generational_gc,
    'copying': copying_gc
}


# Define Models
class HeapConfig(BaseModel):
    total_size: int = 1024
    block_size: int = 16

class AllocationRequest(BaseModel):
    size: int = 1
    root: bool = False

class ReferenceRequest(BaseModel):
    from_id: str
    to_id: str

class GCRequest(BaseModel):
    algorithm: str
    minor_only: Optional[bool] = True

class WorkloadRequest(BaseModel):
    type: str
    count: Optional[int] = 10
    root_prob: Optional[float] = 0.3
    ref_density: Optional[float] = 0.3


# GC Simulation Routes
@api_router.get("/")
async def root():
    return {"message": "GCmaxy API", "version": "1.0.0", "app": "GCmaxy - Garbage Collection Simulator"}

@api_router.post("/heap/init")
async def init_heap(config: HeapConfig):
    """Initialize or reset heap with new configuration"""
    global heap, mark_sweep_gc, ref_counting_gc, generational_gc, copying_gc, workload_gen
    
    heap = HeapSimulator(total_size=config.total_size, block_size=config.block_size)
    mark_sweep_gc = MarkSweepGC(heap)
    ref_counting_gc = ReferenceCountingGC(heap)
    generational_gc = GenerationalGC(heap)
    copying_gc = CopyingGC(heap)
    workload_gen = WorkloadGenerator(heap)
    metrics_tracker.reset()
    
    return {"status": "success", "heap": heap.get_stats()}

@api_router.get("/heap/state")
async def get_heap_state():
    """Get current heap state"""
    return {
        "stats": heap.get_stats(),
        "blocks": heap.get_all_blocks(),
        "roots": list(heap.roots)
    }

@api_router.post("/heap/allocate")
async def allocate_memory(request: AllocationRequest):
    """Allocate a memory block"""
    block_id = heap.allocate(size=request.size, root=request.root)
    if not block_id:
        raise HTTPException(status_code=400, detail="Allocation failed: Out of memory")
    
    return {
        "status": "success",
        "block_id": block_id,
        "heap": heap.get_stats()
    }

@api_router.delete("/heap/deallocate/{block_id}")
async def deallocate_memory(block_id: str):
    """Manually deallocate a memory block"""
    success = heap.deallocate(block_id)
    if not success:
        raise HTTPException(status_code=404, detail="Block not found or already freed")
    
    return {
        "status": "success",
        "heap": heap.get_stats()
    }

@api_router.post("/heap/reference")
async def add_reference(request: ReferenceRequest):
    """Add a reference between two blocks"""
    success = heap.add_reference(request.from_id, request.to_id)
    if not success:
        raise HTTPException(status_code=404, detail="One or both blocks not found")
    
    return {"status": "success"}

@api_router.delete("/heap/reference")
async def remove_reference(request: ReferenceRequest):
    """Remove a reference between two blocks"""
    success = heap.remove_reference(request.from_id, request.to_id)
    if not success:
        raise HTTPException(status_code=404, detail="Reference not found")
    
    return {"status": "success"}

@api_router.post("/gc/collect")
async def run_gc(request: GCRequest):
    """Run garbage collection with specified algorithm"""
    if request.algorithm not in gc_algorithms:
        raise HTTPException(status_code=400, detail=f"Unknown algorithm: {request.algorithm}")
    
    gc = gc_algorithms[request.algorithm]
    
    # Run collection
    if request.algorithm == 'generational':
        metrics = gc.collect(minor_only=request.minor_only)
    else:
        metrics = gc.collect()
    
    # Record metrics
    metrics_tracker.record_cycle(metrics)
    
    return {
        "status": "success",
        "metrics": metrics,
        "heap": heap.get_stats(),
        "blocks": heap.get_all_blocks()
    }

@api_router.get("/metrics/cycles")
async def get_all_cycles():
    """Get all GC cycles"""
    return {
        "cycles": metrics_tracker.get_all_cycles(),
        "summary": metrics_tracker.get_summary()
    }

@api_router.get("/metrics/summary")
async def get_metrics_summary():
    """Get metrics summary"""
    return metrics_tracker.get_summary()

@api_router.get("/metrics/comparison")
async def get_algorithm_comparison():
    """Get algorithm comparison"""
    return metrics_tracker.get_algorithm_comparison()

@api_router.get("/metrics/export/csv")
async def export_metrics_csv():
    """Export metrics as CSV"""
    csv_data = metrics_tracker.export_csv()
    return {"csv": csv_data}

@api_router.post("/workload/generate")
async def generate_workload(request: WorkloadRequest):
    """Generate test workload"""
    result = {}
    
    if request.type == "random":
        allocated = workload_gen.random_allocation(count=request.count, root_prob=request.root_prob)
        workload_gen.create_references(allocated, ref_density=request.ref_density)
        result = {"allocated": allocated, "count": len(allocated)}
    
    elif request.type == "circular":
        blocks = workload_gen.create_circular_reference(size=request.count)
        result = {"circular_chain": blocks, "count": len(blocks)}
    
    elif request.type == "long-lived":
        objects = workload_gen.simulate_long_lived_objects(count=request.count)
        result = {"long_lived": objects, "count": len(objects)}
    
    elif request.type == "short-lived":
        objects = workload_gen.simulate_short_lived_objects(count=request.count)
        result = {"short_lived": objects, "count": len(objects)}
    
    elif request.type == "mixed":
        long_lived, short_lived = workload_gen.mixed_workload()
        result = {
            "long_lived": long_lived,
            "short_lived": short_lived,
            "total": len(long_lived) + len(short_lived)
        }
    
    else:
        raise HTTPException(status_code=400, detail=f"Unknown workload type: {request.type}")
    
    return {
        "status": "success",
        "workload": result,
        "heap": heap.get_stats()
    }

@api_router.post("/heap/reset")
async def reset_heap():
    """Reset heap and metrics"""
    heap.reset()
    metrics_tracker.reset()
    return {"status": "success", "heap": heap.get_stats()}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

