'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Connection, Edge, NodeTypes, ReactFlowInstance, OnNodesChange, OnEdgesChange } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChatbotNode, ChatbotEdge, MessageNodeData } from '@/types/nodes'
import { PlusCircle, Tag, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import MessageNode from '@/components/reactflow/MessageNode'
import InputNode from '@/components/reactflow/InputNode'
import ConditionNode from '@/components/reactflow/ConditionNode'
import ApiNode from '@/components/reactflow/ApiNode'
import FunctionNode from '@/components/reactflow/FunctionNode'
import FlowNode from '@/components/reactflow/FlowNode'
import { chatbotService } from '@/services/chatbot'
import { toast } from 'sonner'

const nodeTypes: NodeTypes = {
  message: MessageNode,
  input: InputNode,
  condition: ConditionNode,
  api: ApiNode,
  function: FunctionNode,
  flow: FlowNode,
}

const TRIGGER_TYPES = {
  'message': 'Message Received',
  'button': 'Button Clicked',
  'api': 'API Called',
  'schedule': 'Scheduled',
  'event': 'Custom Event',
} as const;

const initialNodes: ChatbotNode[] = [
  { 
    id: 'flow-1',
    type: 'flow',
    position: { x: 0, y: 0 },
    data: {
      label: 'Welcome Flow',
      content: 'Main welcome flow for new users',
      trigger: 'message',
    }
  },
  { 
    id: '1', 
    type: 'message', 
    position: { x: 0, y: 100 }, 
    data: { 
      label: 'Welcome Message', 
      content: 'Welcome! How can I help you today?',
      buttons: [
        { id: 'btn1', text: 'Pricing Info', action: 'show_pricing' },
        { id: 'btn2', text: 'Get Support', action: 'get_support' }
      ]
    } 
  },
]

const initialEdges: ChatbotEdge[] = [
  { id: 'e1-2', source: 'flow-1', target: '1' },
]

const isMessageNode = (node: ChatbotNode): node is ChatbotNode & { data: MessageNodeData } => {
  return node.type === 'message';
}

interface FlowBuilderProps {
  flowId: string;
}

export default function FlowBuilder({ flowId }: FlowBuilderProps) {
  const router = useRouter()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<ChatbotNode | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<ChatbotNode, ChatbotEdge> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [flowName, setFlowName] = useState('')
  const [flowDescription, setFlowDescription] = useState('')
  const [flowTrigger, setFlowTrigger] = useState('message')

  const loadFlow = useCallback(async () => {
    try {
      setIsLoading(true)
      const flow = await chatbotService.getFlow(flowId)
      setNodes(flow.nodes)
      setEdges(flow.edges)
      setFlowName(flow.name)
      setFlowDescription(flow.description)
      setFlowTrigger(flow.trigger)
    } catch (error) {
      toast.error('Failed to load flow')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [flowId, setNodes, setEdges])

  useEffect(() => {
    if (flowId !== 'new') {
      loadFlow()
    }
  }, [flowId, loadFlow])

  const saveFlow = async () => {
    try {
      setIsLoading(true)
      const flow = await chatbotService.saveFlow({
        id: flowId !== 'new' ? flowId : undefined,
        name: flowName,
        description: flowDescription,
        trigger: flowTrigger,
        nodes,
        edges,
      })
      toast.success('Flow saved successfully')
      if (flowId === 'new') {
        router.push(`/chatbot/builder/${flow.id}`)
      }
    } catch (error) {
      toast.error('Failed to save flow')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (selectedNode) {
      const updatedNode = nodes.find(node => node.id === selectedNode.id)
      if (updatedNode) {
        setSelectedNode(updatedNode)
      }
    }
  }, [nodes, selectedNode])

  const onConnect = useCallback((params: Edge | Connection) => {
    setEdges((eds) => {
      const newEdge: ChatbotEdge = {
        ...params,
        id: `e${params.source}-${params.target}`,
        label: params.sourceHandle?.startsWith('button-') ? 'button' : undefined,
        action: params.sourceHandle?.startsWith('button-') ? 'button_click' : undefined
      }
      return addEdge(newEdge, eds) as ChatbotEdge[]
    })
  }, [setEdges])

  const onNodeClick = useCallback((event: React.MouseEvent, node: ChatbotNode) => {
    event.preventDefault()
    setSelectedNode(node)
  }, [])

  const updateNodeData = useCallback((id: string, newData: Partial<ChatbotNode['data']>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          const updatedData = {
            ...node.data,
            ...newData,
          }
          
          if (isMessageNode(node) && 'buttons' in newData) {
            updatedData.buttons = newData.buttons || []
          }
          
          return {
            ...node,
            data: updatedData
          }
        }
        return node
      })
    )
  }, [setNodes])

  const addNode = useCallback((type: string) => {
    if (reactFlowInstance) {
      const { x, y, zoom } = reactFlowInstance.getViewport()
      const centerX = -x / zoom + (reactFlowWrapper.current?.clientWidth || 0) / (2 * zoom)
      const centerY = -y / zoom + (reactFlowWrapper.current?.clientHeight || 0) / (2 * zoom)

      const newNode: ChatbotNode = {
        id: `${type}-${Date.now()}`,
        type,
        position: { 
          x: centerX - 100,
          y: centerY - 50
        },
        data: { 
          label: `New ${type}`, 
          content: '',
          ...(type === 'flow' ? { trigger: 'message' } : {})
        },
      }
      setNodes((nds) => [...nds, newNode])
    }
  }, [setNodes, reactFlowInstance])

  return (
    <div className="flex flex-col h-screen">
      <div className="flex items-center gap-4 p-4 border-b">
        <Button variant="ghost" size="sm" onClick={() => router.push('/chatbot')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Flows
        </Button>
        <div className="flex-1 flex items-center gap-4">
          <div className="flex-1">
            <Input
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="Flow Name"
              className="text-lg font-semibold"
            />
            <Input
              value={flowDescription}
              onChange={(e) => setFlowDescription(e.target.value)}
              placeholder="Flow Description"
              className="mt-1"
            />
          </div>
          <Select value={flowTrigger} onValueChange={setFlowTrigger}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select trigger" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TRIGGER_TYPES).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={saveFlow} disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Flow'}
        </Button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-3/4 h-full" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange as OnNodesChange<ChatbotNode>}
            onEdgesChange={onEdgesChange as OnEdgesChange<ChatbotEdge>}
            onConnect={onConnect}
            onNodeClick={(event, node) => onNodeClick(event, node as ChatbotNode)}
            nodeTypes={nodeTypes}
            onInit={setReactFlowInstance}
            fitView
            deleteKeyCode="Delete"
            multiSelectionKeyCode="Control"
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>
        <div className="w-1/4 p-4 bg-gray-100 dark:bg-gray-800 overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle>Flow Builder</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                <Button onClick={() => addNode('flow')} size="sm"><Tag className="w-4 h-4 mr-2" /> Flow</Button>
                <Button onClick={() => addNode('message')} size="sm"><PlusCircle className="w-4 h-4 mr-2" /> Message</Button>
                <Button onClick={() => addNode('input')} size="sm"><PlusCircle className="w-4 h-4 mr-2" /> Input</Button>
                <Button onClick={() => addNode('condition')} size="sm"><PlusCircle className="w-4 h-4 mr-2" /> Condition</Button>
                <Button onClick={() => addNode('api')} size="sm"><PlusCircle className="w-4 h-4 mr-2" /> API</Button>
                <Button onClick={() => addNode('function')} size="sm"><PlusCircle className="w-4 h-4 mr-2" /> Function</Button>
              </div>
              {selectedNode && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Edit Node</h3>
                  <div>
                    <Label>Label</Label>
                    <Input
                      value={selectedNode.data.label}
                      onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={selectedNode.data.content}
                      onChange={(e) => updateNodeData(selectedNode.id, { content: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                  {selectedNode.type === 'flow' && (
                    <div>
                      <Label>Trigger</Label>
                      <Select
                        value={selectedNode.data.trigger}
                        onValueChange={(value) => updateNodeData(selectedNode.id, { trigger: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select trigger type" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TRIGGER_TYPES).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {isMessageNode(selectedNode) && (
                    <div>
                      <Label>Buttons</Label>
                      {selectedNode.data.buttons?.map((button, index) => (
                        <div key={button.id} className="flex flex-col gap-2 mt-2 border rounded-lg p-2">
                          <Input
                            value={button.text}
                            onChange={(e) => {
                              const buttons = [...(selectedNode.data.buttons || [])];
                              buttons[index] = { ...button, text: e.target.value };
                              updateNodeData(selectedNode.id, { buttons });
                            }}
                            placeholder="Button text"
                          />
                          <Input
                            value={button.action}
                            onChange={(e) => {
                              const buttons = [...(selectedNode.data.buttons || [])];
                              buttons[index] = { ...button, action: e.target.value };
                              updateNodeData(selectedNode.id, { buttons });
                            }}
                            placeholder="Button action (e.g., show_pricing)"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              const buttons = selectedNode.data.buttons?.filter(b => b.id !== button.id) || [];
                              updateNodeData(selectedNode.id, { buttons });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 w-full"
                        onClick={() => {
                          const buttons = [...(selectedNode.data.buttons || []), { id: `btn${Date.now()}`, text: 'New Button' }];
                          updateNodeData(selectedNode.id, { buttons });
                        }}
                      >
                        Add Button
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}