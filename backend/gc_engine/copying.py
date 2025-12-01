from typing import Dict, List, Set
from .memory import HeapSimulator, MemoryBlock
from datetime import datetime, timezone
import time
import uuid

class CopyingGC:
    """Copying Garbage Collector (Semi-space)"""
    
    def __init__(self, heap: HeapSimulator):
        self.heap = heap
        self.name = "Copying (Semi-space)"
        # In copying GC, we use two semi-spaces
        self.from_space = set()  # IDs in from-space
        self.to_space = set()    # IDs in to-space
        
        # Initially all objects are in from-space
        self.from_space = set(self.heap.blocks.keys())
    
    def _copy_object(self, block_id: str, copied: Dict[str, str]) -> str:
        """Copy an object from from-space to to-space"""
        if block_id in copied:
            return copied[block_id]
        
        if block_id not in self.heap.blocks:
            return block_id
        
        old_block = self.heap.blocks[block_id]
        
        # Create new block ("copy" to to-space)
        new_id = str(uuid.uuid4())[:8]
        new_block = MemoryBlock(
            id=new_id,
            size=old_block.size,
            allocated=True,
            generation=old_block.generation,
            root=old_block.root,
            age=old_block.age + 1
        )
        
        copied[block_id] = new_id
        self.to_space.add(new_id)
        
        # Copy references recursively
        for ref_id in old_block.references:
            new_ref_id = self._copy_object(ref_id, copied)
            new_block.references.add(new_ref_id)
        
        self.heap.blocks[new_id] = new_block
        
        # Update roots if necessary
        if old_block.root:
            self.heap.roots.add(new_id)
            if block_id in self.heap.roots:
                self.heap.roots.remove(block_id)
        
        return new_id
    
    def collect(self) -> Dict:
        """Run copying garbage collection"""
        start_time = time.time()
        
        copied = {}  # Mapping from old ID to new ID
        self.to_space.clear()
        
        original_count = len(self.heap.blocks)
        
        # Copy all reachable objects starting from roots
        for root_id in list(self.heap.roots):
            self._copy_object(root_id, copied)
        
        # Remove all objects in from-space that weren't copied
        bytes_reclaimed = 0
        blocks_to_remove = []
        
        for block_id in self.from_space:
            if block_id not in copied and block_id in self.heap.blocks:
                block = self.heap.blocks[block_id]
                bytes_reclaimed += block.size * self.heap.block_size
                blocks_to_remove.append(block_id)
        
        for block_id in blocks_to_remove:
            if block_id in self.heap.blocks:
                del self.heap.blocks[block_id]
                self.heap.allocated_blocks -= self.heap.blocks.get(block_id, MemoryBlock(id='', size=1)).size
                self.heap.free_blocks += self.heap.blocks.get(block_id, MemoryBlock(id='', size=1)).size
        
        # Swap spaces
        self.from_space = self.to_space.copy()
        self.to_space.clear()
        
        end_time = time.time()
        pause_duration = (end_time - start_time) * 1000
        
        return {
            'algorithm': self.name,
            'objects_scanned': original_count,
            'objects_copied': len(copied),
            'objects_freed': len(blocks_to_remove),
            'bytes_reclaimed': bytes_reclaimed,
            'pause_duration': round(pause_duration, 3),
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'compaction': True
        }
