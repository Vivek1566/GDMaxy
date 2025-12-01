from typing import List, Dict
from datetime import datetime, timezone
import json

class MetricsTracker:
    """Track and aggregate GC metrics"""
    
    def __init__(self):
        self.cycles: List[Dict] = []
        self.current_cycle = 0
        
    def record_cycle(self, metrics: Dict):
        """Record a GC cycle"""
        self.current_cycle += 1
        cycle_data = {
            'cycle_id': self.current_cycle,
            **metrics
        }
        self.cycles.append(cycle_data)
        
    def get_all_cycles(self) -> List[Dict]:
        """Get all recorded cycles"""
        return self.cycles
    
    def get_summary(self) -> Dict:
        """Get summary statistics"""
        if not self.cycles:
            return {
                'total_cycles': 0,
                'total_objects_freed': 0,
                'total_bytes_reclaimed': 0,
                'avg_pause_duration': 0,
                'max_pause_duration': 0,
                'min_pause_duration': 0
            }
        
        total_freed = sum(c.get('objects_freed', 0) for c in self.cycles)
        total_bytes = sum(c.get('bytes_reclaimed', 0) for c in self.cycles)
        pause_durations = [c.get('pause_duration', 0) for c in self.cycles]
        
        return {
            'total_cycles': len(self.cycles),
            'total_objects_freed': total_freed,
            'total_bytes_reclaimed': total_bytes,
            'avg_pause_duration': round(sum(pause_durations) / len(pause_durations), 3) if pause_durations else 0,
            'max_pause_duration': round(max(pause_durations), 3) if pause_durations else 0,
            'min_pause_duration': round(min(pause_durations), 3) if pause_durations else 0
        }
    
    def get_algorithm_comparison(self) -> Dict:
        """Compare metrics across different algorithms"""
        algorithms = {}
        
        for cycle in self.cycles:
            algo = cycle.get('algorithm', 'Unknown')
            if algo not in algorithms:
                algorithms[algo] = {
                    'cycles': 0,
                    'total_freed': 0,
                    'total_bytes': 0,
                    'pause_times': []
                }
            
            algorithms[algo]['cycles'] += 1
            algorithms[algo]['total_freed'] += cycle.get('objects_freed', 0)
            algorithms[algo]['total_bytes'] += cycle.get('bytes_reclaimed', 0)
            algorithms[algo]['pause_times'].append(cycle.get('pause_duration', 0))
        
        # Calculate averages
        comparison = {}
        for algo, data in algorithms.items():
            avg_pause = sum(data['pause_times']) / len(data['pause_times']) if data['pause_times'] else 0
            comparison[algo] = {
                'cycles': data['cycles'],
                'total_objects_freed': data['total_freed'],
                'total_bytes_reclaimed': data['total_bytes'],
                'avg_pause_duration': round(avg_pause, 3),
                'max_pause_duration': round(max(data['pause_times']), 3) if data['pause_times'] else 0,
                'throughput': round(data['total_freed'] / data['cycles'], 2) if data['cycles'] > 0 else 0
            }
        
        return comparison
    
    def reset(self):
        """Reset all metrics"""
        self.cycles.clear()
        self.current_cycle = 0
    
    def export_csv(self) -> str:
        """Export metrics as CSV string"""
        if not self.cycles:
            return ""
        
        headers = ['cycle_id', 'algorithm', 'timestamp', 'objects_scanned', 'objects_freed', 
                   'bytes_reclaimed', 'pause_duration']
        
        csv_lines = [','.join(headers)]
        
        for cycle in self.cycles:
            row = [
                str(cycle.get('cycle_id', '')),
                cycle.get('algorithm', ''),
                cycle.get('timestamp', ''),
                str(cycle.get('objects_scanned', 0)),
                str(cycle.get('objects_freed', 0)),
                str(cycle.get('bytes_reclaimed', 0)),
                str(cycle.get('pause_duration', 0))
            ]
            csv_lines.append(','.join(row))
        
        return '\n'.join(csv_lines)
