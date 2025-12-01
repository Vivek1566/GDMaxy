from typing import Dict, List, Set
from .memory import HeapSimulator
from datetime import datetime, timezone
import time

class GenerationalGC:
    """Generational Garbage Collector (2 generations: young/nursery and old/tenured)"""
    
    def __init__(self, heap: HeapSimulator, promotion_age: int = 2):
        self.heap = heap
        self.name = "Generational"
        self.promotion_age = promotion_age  # Age at which objects get promoted
        
    def mark(self, block_id: str, marked: Set[str]):
        """Recursively mark reachable objects"""
        if block_id in marked or block_id not in self.heap.blocks:
            return
            
        marked.add(block_id)
        block = self.heap.blocks[block_id]
        block.marked = True
        
        for ref_id in block.references:
            self.mark(ref_id, marked)
    
    def collect_generation(self, generation: int) -> tuple:
        """Collect a specific generation"""
        marked = set()
        
        # Mark from roots
        for root_id in self.heap.roots:
            self.mark(root_id, marked)
        
        # Sweep unmarked objects in this generation
        blocks_to_remove = []
        blocks_to_promote = []
        
        for block_id, block in self.heap.blocks.items():
            if block.generation == generation:
                if not block.marked:
                    blocks_to_remove.append(block_id)
                else:
                    block.marked = False
                    block.age += 1
                    
                    # Promote to next generation if old enough
                    if block.age >= self.promotion_age and generation == 0:
                        blocks_to_promote.append(block_id)
        
        # Perform promotions
        for block_id in blocks_to_promote:
            if block_id in self.heap.blocks:
                self.heap.blocks[block_id].generation = 1
        
        # Perform deallocation
        bytes_reclaimed = 0
        for block_id in blocks_to_remove:
            block = self.heap.blocks.get(block_id)
            if block:
                bytes_reclaimed += block.size * self.heap.block_size
                self.heap.deallocate(block_id)
        
        return len(blocks_to_remove), bytes_reclaimed, len(blocks_to_promote)
    
    def collect(self, minor_only: bool = True) -> Dict:
        """Run generational garbage collection"""
        start_time = time.time()
        
        total_freed = 0
        total_bytes = 0
        promotions = 0
        
        # Minor collection (generation 0 - young objects)
        freed, bytes_rec, promo = self.collect_generation(0)
        total_freed += freed
        total_bytes += bytes_rec
        promotions += promo
        
        collection_type = "Minor (Young)"
        
        # Major collection (all generations) - less frequent
        if not minor_only:
            freed, bytes_rec, _ = self.collect_generation(1)
            total_freed += freed
            total_bytes += bytes_rec
            collection_type = "Major (Full)"
        
        end_time = time.time()
        pause_duration = (end_time - start_time) * 1000
        
        return {
            'algorithm': self.name,
            'collection_type': collection_type,
            'objects_scanned': len(self.heap.blocks) + total_freed,
            'objects_freed': total_freed,
            'objects_promoted': promotions,
            'bytes_reclaimed': total_bytes,
            'pause_duration': round(pause_duration, 3),
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
