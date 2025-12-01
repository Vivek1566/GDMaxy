import React, { useEffect, useRef } from 'react';
import { Card } from './ui/card';
import * as d3 from 'd3-force';

const GraphView = ({ blocks, roots }) => {
  const canvasRef = useRef(null);
  const simulationRef = useRef(null);
  
  useEffect(() => {
    if (!canvasRef.current || blocks.length === 0) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Create nodes and links
    const nodes = blocks.map(block => ({
      id: block.id,
      root: block.root,
      marked: block.marked,
      size: block.size,
      age: block.age
    }));
    
    const links = [];
    blocks.forEach(block => {
      block.references.forEach(refId => {
        if (blocks.find(b => b.id === refId)) {
          links.push({ source: block.id, target: refId });
        }
      });
    });
    
    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(25));
    
    simulationRef.current = simulation;
    
    simulation.on('tick', () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw links
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      links.forEach(link => {
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.stroke();
        
        // Draw arrow
        const angle = Math.atan2(link.target.y - link.source.y, link.target.x - link.source.x);
        const arrowSize = 8;
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(link.target.x, link.target.y);
        ctx.lineTo(
          link.target.x - arrowSize * Math.cos(angle - Math.PI / 6),
          link.target.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          link.target.x - arrowSize * Math.cos(angle + Math.PI / 6),
          link.target.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
      });
      
      // Draw nodes
      nodes.forEach(node => {
        const radius = 15 + node.size * 2;
        
        // Node color based on state
        let fillColor = '#06b6d4'; // cyan - allocated
        if (node.root) fillColor = '#a855f7'; // purple - root
        else if (node.marked) fillColor = '#22c55e'; // green - marked
        
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Border
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.id.substring(0, 4), node.x, node.y);
      });
    });
    
    return () => {
      simulation.stop();
    };
  }, [blocks, roots]);
  
  return (
    <Card data-testid="graph-view-container" className="p-6 bg-slate-900 border-slate-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-100 mb-3">Reference Graph</h3>
        <p className="text-sm text-slate-400">Objects and their reference relationships</p>
      </div>
      <div className="flex justify-center">
        <canvas
          ref={canvasRef}
          data-testid="graph-canvas"
          width={800}
          height={400}
          className="border border-slate-700 rounded-lg bg-slate-950"
        />
      </div>
    </Card>
  );
};

export default GraphView;