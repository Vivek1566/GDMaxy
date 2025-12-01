import React from 'react';
import { Card } from './ui/card';

const GridView = ({ blocks, heapSize = 1024, blockSize = 16 }) => {
  const numBlocks = heapSize / blockSize;
  const gridCols = Math.ceil(Math.sqrt(numBlocks));
  
  // Create a map of block positions
  const blockMap = {};
  let position = 0;
  
  blocks.forEach(block => {
    blockMap[position] = block;
    position += block.size;
  });
  
  // Create grid cells
  const cells = [];
  for (let i = 0; i < numBlocks; i++) {
    const block = blockMap[i];
    
    let bgColor = 'bg-slate-800'; // Free
    let label = '';
    
    if (block) {
      if (block.root) {
        bgColor = 'bg-purple-500';
        label = 'R';
      } else if (block.marked) {
        bgColor = 'bg-green-500';
        label = 'M';
      } else if (block.allocated) {
        bgColor = 'bg-cyan-500';
        label = 'A';
      }
    }
    
    cells.push(
      <div
        key={i}
        data-testid={`grid-cell-${i}`}
        className={`${bgColor} border border-slate-700 flex items-center justify-center text-xs font-mono text-white transition-colors duration-300`}
        title={block ? `ID: ${block.id}, Size: ${block.size}, Age: ${block.age}` : 'Free'}
      >
        {label}
      </div>
    );
  }
  
  return (
    <Card data-testid="grid-view-container" className="p-6 bg-slate-900 border-slate-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-100 mb-3">Heap Memory Grid</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-800 border border-slate-700"></div>
            <span className="text-slate-300">Free</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-500"></div>
            <span className="text-slate-300">Allocated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500"></div>
            <span className="text-slate-300">Marked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500"></div>
            <span className="text-slate-300">Root</span>
          </div>
        </div>
      </div>
      <div 
        className="grid gap-1"
        style={{ 
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          maxHeight: '400px',
          overflowY: 'auto'
        }}
      >
        {cells}
      </div>
    </Card>
  );
};

export default GridView;