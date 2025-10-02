/**
 * Layout engine using Dagre for automatic tree layout
 */

import dagre from 'dagre'
import { Node, Edge } from '@xyflow/react'
import { TimelineNode } from '../types/timeline'

export interface LayoutOptions {
  direction?: 'TB' | 'LR' | 'BT' | 'RL'
  nodeWidth?: number
  nodeHeight?: number
  rankSep?: number
  nodeSep?: number
}

const defaultOptions: Required<LayoutOptions> = {
  direction: 'TB',
  nodeWidth: 300,
  nodeHeight: 200,
  rankSep: 100,
  nodeSep: 80,
}

/**
 * Calculate layout positions for nodes using Dagre
 */
export function calculateLayout(
  nodes: TimelineNode[],
  options: LayoutOptions = {}
): Map<string, { x: number; y: number }> {
  const opts = { ...defaultOptions, ...options }

  // Create Dagre graph
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({
    rankdir: opts.direction,
    ranksep: opts.rankSep,
    nodesep: opts.nodeSep,
  })

  // Add nodes to graph
  nodes.forEach(node => {
    dagreGraph.setNode(node.id, {
      width: opts.nodeWidth,
      height: opts.nodeHeight,
    })
  })

  // Add edges (connections between parent and children)
  nodes.forEach(node => {
    if (node.parentId) {
      dagreGraph.setEdge(node.parentId, node.id)
    }
  })

  // Calculate layout
  dagre.layout(dagreGraph)

  // Extract positions
  const positions = new Map<string, { x: number; y: number }>()
  nodes.forEach(node => {
    const nodeData = dagreGraph.node(node.id)
    if (nodeData) {
      positions.set(node.id, {
        x: nodeData.x - opts.nodeWidth / 2,
        y: nodeData.y - opts.nodeHeight / 2,
      })
    }
  })

  return positions
}

/**
 * Convert TimelineNodes to React Flow nodes with positions
 */
export function toReactFlowNodes(
  timelineNodes: TimelineNode[],
  positions: Map<string, { x: number; y: number }>
): Node[] {
  return timelineNodes.map(node => {
    const position = positions.get(node.id) || { x: 0, y: 0 }
    return {
      id: node.id,
      type: 'timeline',
      position,
      data: node,
    }
  })
}

/**
 * Generate edges from parent-child relationships
 */
export function generateEdges(timelineNodes: TimelineNode[]): Edge[] {
  const edges: Edge[] = []

  timelineNodes.forEach(node => {
    if (node.parentId) {
      edges.push({
        id: `${node.parentId}-${node.id}`,
        source: node.parentId,
        target: node.id,
        type: 'smoothstep',
        animated: node.type === 'alternate',
        style: {
          stroke: node.type === 'original' ? '#00F0FF' : '#B794F4',
          strokeWidth: 2,
        },
      })
    }
  })

  return edges
}

/**
 * Get responsive layout direction based on screen width
 */
export function getResponsiveDirection(width: number): 'TB' | 'LR' {
  return width < 768 ? 'TB' : 'LR'
}
