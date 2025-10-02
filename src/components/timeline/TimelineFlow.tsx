/**
 * Timeline Flow Component - Main React Flow container
 */

'use client'

import { useCallback, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { TimelineNode } from './TimelineNode'
import { useTimelineStore } from '@/lib/store/timelineStore'
import { useUIStore } from '@/lib/store/uiStore'
import { calculateLayout, toReactFlowNodes, generateEdges } from '@/lib/utils/layoutEngine'

const nodeTypes = {
  timeline: TimelineNode,
}

export function TimelineFlow() {
  const timelineNodes = useTimelineStore(state => state.nodes)
  const theme = useUIStore(state => state.theme)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Convert timeline nodes to React Flow nodes with layout
  useEffect(() => {
    const nodeArray = Object.values(timelineNodes.byId)
    if (nodeArray.length === 0) return

    // Calculate layout positions
    const positions = calculateLayout(nodeArray, {
      direction: 'TB',
      nodeWidth: 300,
      nodeHeight: 220,
      rankSep: 120,
      nodeSep: 100,
    })

    // Convert to React Flow nodes
    const flowNodes = toReactFlowNodes(nodeArray, positions)
    setNodes(flowNodes)

    // Generate edges
    const flowEdges = generateEdges(nodeArray)
    setEdges(flowEdges)
  }, [timelineNodes, setNodes, setEdges])

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  // Memoize proOptions to prevent re-renders
  const proOptions = useMemo(() => ({ hideAttribution: true }), [])

  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={proOptions}
        className="bg-transparent"
      >
        <Background
          color={theme === 'dark' ? '#ffffff20' : '#00000020'}
          gap={20}
          size={1}
        />
        <Controls
          className="!bg-white/10 !backdrop-blur-md !border-white/20 dark:!bg-black/20 dark:!border-white/10"
        />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as any
            if (data?.type === 'original') {
              return theme === 'dark' ? 'rgb(0, 240, 255)' : 'rgb(30, 144, 255)'
            }
            return theme === 'dark' ? 'rgb(183, 148, 244)' : 'rgb(159, 122, 234)'
          }}
          className="!bg-white/10 !backdrop-blur-md !border-white/20 dark:!bg-black/20 dark:!border-white/10"
        />
      </ReactFlow>
    </div>
  )
}
