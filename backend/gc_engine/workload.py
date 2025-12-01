import random
from typing import List, Tuple
from .memory import HeapSimulator

class WorkloadGenerator:
    """Generate workload patterns for testing GC algorithms"""
    
    def __init__(self, heap: HeapSimulator):
        self.heap = heap
    
    def random_allocation(self, count: int = 10, root_prob: float = 0.3) -> List[str]:
        """Allocate random objects"""
        allocated = []
        for _ in range(count):
            size = random.randint(1, 3)
            is_root = random.random() < root_prob
            block_id = self.heap.allocate(size=size, root=is_root)
            if block_id:
                allocated.append(block_id)
        return allocated
    
    def create_references(self, blocks: List[str], ref_density: float = 0.3):
        """Create random references between blocks"""
        for from_block in blocks:
            for to_block in blocks:
                if from_block != to_block and random.random() < ref_density:
                    self.heap.add_reference(from_block, to_block)
    
    def create_circular_reference(self, size: int = 3) -> List[str]:
        """Create a circular reference chain"""
        blocks = []
        for _ in range(size):
            block_id = self.heap.allocate(size=1, root=False)
            if block_id:
                blocks.append(block_id)
        
        # Create circular references
        for i in range(len(blocks)):
            next_i = (i + 1) % len(blocks)
            self.heap.add_reference(blocks[i], blocks[next_i])
        
        return blocks
    
    def simulate_long_lived_objects(self, count: int = 5) -> List[str]:
        """Create long-lived root objects"""
        objects = []
        for _ in range(count):
            obj_id = self.heap.allocate(size=random.randint(2, 5), root=True)
            if obj_id:
                objects.append(obj_id)
        return objects
    
    def simulate_short_lived_objects(self, count: int = 10) -> List[str]:
        """Create short-lived non-root objects"""
        objects = []
        for _ in range(count):
            obj_id = self.heap.allocate(size=1, root=False)
            if obj_id:
                objects.append(obj_id)
        return objects
    
    def mixed_workload(self) -> Tuple[List[str], List[str]]:
        """Generate a mixed workload"""
        long_lived = self.simulate_long_lived_objects(count=3)
        short_lived = self.simulate_short_lived_objects(count=7)
        
        # Create some references from long-lived to short-lived
        for ll in long_lived[:2]:
            for sl in random.sample(short_lived, min(3, len(short_lived))):
                self.heap.add_reference(ll, sl)
        
        return long_lived, short_lived
