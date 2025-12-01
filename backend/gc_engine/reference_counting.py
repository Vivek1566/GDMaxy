from typing import Dict, List, Set
from .memory import HeapSimulator
from datetime import datetime, timezone
import time

class ReferenceCountingGC:
    """Reference Counting Garbage Collector"""
    
    def __init__(self, heap: HeapSimulator):
        self.heap = heap
        self.name = "Reference Counting"
        self.ref_counts: Dict[str, int] = {}
        
    def _update_ref_counts(self):
        """Update reference counts for all objects"""
        self.ref_counts.clear()
        
        # Initialize all objects with 0 count
        for block_id in self.heap.blocks:
            self.ref_counts[block_id] = 0
        
        # Count references from roots
        for root_id in self.heap.roots:
            if root_id in self.ref_counts:
                self.ref_counts[root_id] += 1
        
        # Count references from other objects
        for block_id, block in self.heap.blocks.items():
            for ref_id in block.references:
                if ref_id in self.ref_counts:
                    self.ref_counts[ref_id] += 1
    
    def _detect_cycles(self) -> Set[str]:
        """Simple cycle detection using DFS"""
        cycles = set()
        visited = set()
        rec_stack = set()
        
        def dfs(block_id: str) -> bool:
            if block_id not in self.heap.blocks:
                return False
                
            visited.add(block_id)
            rec_stack.add(block_id)
            
            for ref_id in self.heap.blocks[block_id].references:
                if ref_id not in visited:
                    if dfs(ref_id):
                        cycles.add(block_id)
                        return True
                elif ref_id in rec_stack:
                    cycles.add(block_id)
                    return True
            
            rec_stack.remove(block_id)
            return False
        
        for block_id in self.heap.blocks:
            if block_id not in visited:
                dfs(block_id)
        
        return cycles
    
    def collect(self) -> Dict:
        """Run reference counting garbage collection"""
        start_time = time.time()
        
        # Update reference counts
        self._update_ref_counts()
        
        # Detect cycles (objects with ref count > 0 but unreachable)
        cycles = self._detect_cycles()
        
        # Collect objects with zero references
        blocks_to_remove = []
        for block_id, count in self.ref_counts.items():
            if count == 0 or block_id in cycles:
                blocks_to_remove.append(block_id)
        
        # Perform deallocation
        bytes_reclaimed = 0
        for block_id in blocks_to_remove:
            block = self.heap.blocks.get(block_id)
            if block and not block.root:  # Don't collect roots
                bytes_reclaimed += block.size * self.heap.block_size
                self.heap.deallocate(block_id)
        
        # Update ages
        for block in self.heap.blocks.values():
            block.age += 1
        
        end_time = time.time()
        pause_duration = (end_time - start_time) * 1000
        
        return {
            'algorithm': self.name,
            'objects_scanned': len(self.ref_counts),
            'objects_freed': len(blocks_to_remove),
            'bytes_reclaimed': bytes_reclaimed,
            'pause_duration': round(pause_duration, 3),
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'cycles_detected': len(cycles)
        }
