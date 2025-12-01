from typing import Dict, List, Set
from .memory import HeapSimulator, MemoryBlock
from datetime import datetime, timezone
import time

class MarkSweepGC:
    """Mark and Sweep Garbage Collector"""
    
    def __init__(self, heap: HeapSimulator):
        self.heap = heap
        self.name = "Mark-Sweep"
        
    def mark(self, block_id: str, marked: Set[str]):
        """Recursively mark reachable objects"""
        if block_id in marked or block_id not in self.heap.blocks:
            return
            
        marked.add(block_id)
        block = self.heap.blocks[block_id]
        block.marked = True
        
        # Recursively mark referenced objects
        for ref_id in block.references:
            self.mark(ref_id, marked)
    
    def collect(self) -> Dict:
        """Run mark and sweep garbage collection"""
        start_time = time.time()
        marked = set()
        
        # Mark phase: Start from roots
        for root_id in self.heap.roots:
            self.mark(root_id, marked)
        
        # Sweep phase: Remove unmarked objects
        blocks_to_remove = []
        for block_id, block in self.heap.blocks.items():
            if not block.marked:
                blocks_to_remove.append(block_id)
            else:
                block.marked = False  # Reset for next cycle
                block.age += 1
        
        # Perform deallocation
        bytes_reclaimed = 0
        for block_id in blocks_to_remove:
            block = self.heap.blocks.get(block_id)
            if block:
                bytes_reclaimed += block.size * self.heap.block_size
                self.heap.deallocate(block_id)
        
        end_time = time.time()
        pause_duration = (end_time - start_time) * 1000  # Convert to ms
        
        return {
            'algorithm': self.name,
            'objects_scanned': len(self.heap.blocks) + len(blocks_to_remove),
            'objects_freed': len(blocks_to_remove),
            'bytes_reclaimed': bytes_reclaimed,
            'pause_duration': round(pause_duration, 3),
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'marked_objects': len(marked)
        }
