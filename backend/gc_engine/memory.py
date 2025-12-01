import uuid
from typing import Dict, List, Set, Optional
from dataclasses import dataclass, field
from datetime import datetime, timezone

@dataclass
class MemoryBlock:
    """Represents a single memory block"""
    id: str
    size: int
    allocated: bool = False
    marked: bool = False
    generation: int = 0  # For generational GC
    references: Set[str] = field(default_factory=set)
    age: int = 0  # Number of GC cycles survived
    root: bool = False  # Is this a root object
    
class HeapSimulator:
    """Simulates a memory heap for garbage collection"""
    
    def __init__(self, total_size: int = 1024, block_size: int = 16):
        self.total_size = total_size
        self.block_size = block_size
        self.num_blocks = total_size // block_size
        self.blocks: Dict[str, MemoryBlock] = {}
        self.roots: Set[str] = set()
        self.free_blocks = self.num_blocks
        self.allocated_blocks = 0
        
    def allocate(self, size: int = 1, root: bool = False) -> Optional[str]:
        """Allocate memory blocks"""
        if self.free_blocks < size:
            return None
            
        block_id = str(uuid.uuid4())[:8]
        block = MemoryBlock(
            id=block_id,
            size=size,
            allocated=True,
            root=root
        )
        self.blocks[block_id] = block
        self.free_blocks -= size
        self.allocated_blocks += size
        
        if root:
            self.roots.add(block_id)
            
        return block_id
    
    def deallocate(self, block_id: str) -> bool:
        """Deallocate a memory block"""
        if block_id not in self.blocks:
            return False
            
        block = self.blocks[block_id]
        if not block.allocated:
            return False
            
        self.free_blocks += block.size
        self.allocated_blocks -= block.size
        
        # Remove from roots if present
        if block_id in self.roots:
            self.roots.remove(block_id)
            
        # Remove all references
        block.references.clear()
        del self.blocks[block_id]
        
        return True
    
    def add_reference(self, from_id: str, to_id: str) -> bool:
        """Add a reference from one block to another"""
        if from_id not in self.blocks or to_id not in self.blocks:
            return False
            
        self.blocks[from_id].references.add(to_id)
        return True
    
    def remove_reference(self, from_id: str, to_id: str) -> bool:
        """Remove a reference"""
        if from_id not in self.blocks:
            return False
            
        if to_id in self.blocks[from_id].references:
            self.blocks[from_id].references.remove(to_id)
            return True
        return False
    
    def get_stats(self) -> Dict:
        """Get current heap statistics"""
        total_allocated = sum(b.size for b in self.blocks.values() if b.allocated)
        
        return {
            'total_size': self.total_size,
            'free_blocks': self.free_blocks,
            'allocated_blocks': self.allocated_blocks,
            'total_objects': len(self.blocks),
            'fragmentation': self._calculate_fragmentation(),
            'root_objects': len(self.roots)
        }
    
    def _calculate_fragmentation(self) -> float:
        """Calculate memory fragmentation percentage"""
        if self.total_size == 0:
            return 0.0
        used = self.allocated_blocks * self.block_size
        return round((self.total_size - used - (self.free_blocks * self.block_size)) / self.total_size * 100, 2)
    
    def reset(self):
        """Reset the heap"""
        self.blocks.clear()
        self.roots.clear()
        self.free_blocks = self.num_blocks
        self.allocated_blocks = 0
    
    def get_all_blocks(self) -> List[Dict]:
        """Get all blocks as dict"""
        return [
            {
                'id': block.id,
                'size': block.size,
                'allocated': block.allocated,
                'marked': block.marked,
                'generation': block.generation,
                'references': list(block.references),
                'age': block.age,
                'root': block.root
            }
            for block in self.blocks.values()
        ]
