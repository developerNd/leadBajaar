'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { ReactFlow, MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge, Connection, Edge, NodeTypes, ReactFlowInstance, OnNodesChange, OnEdgesChange, applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChatbotNode, ChatbotEdge, MessageNodeData, TriggerConfig } from '@/types/nodes'
import { PlusCircle, Tag, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import MessageNode from '@/components/reactflow/MessageNode'
import InputNode from '@/components/reactflow/InputNode'
import ConditionNode from '@/components/reactflow/ConditionNode'
import ApiNode from '@/components/reactflow/ApiNode'
import FunctionNode from '@/components/reactflow/FunctionNode'
import FlowNode from '@/components/reactflow/FlowNode'
import { ChatbotFlow, chatbotService } from '@/services/chatbot'
import { useToast } from '@/components/ui/use-toast'

const nodeTypes: NodeTypes = {
  message: MessageNode,
  input: InputNode,
  condition: ConditionNode,
  api: ApiNode,
  function: FunctionNode,
  flow: FlowNode,
}

const TRIGGER_TYPES = {
  'message': 'Message Contains',
  'exact_match': 'Exact Message Match',
  'button': 'Button Click',
  'api': 'API Webhook',
  'schedule': 'Scheduled',
  'event': 'Custom Event',
  'regex': 'Regular Expression',
  'intent': 'Intent Match',
  'fallback': 'Fallback',
  'start': 'Conversation Start',
} as const;

const PREDEFINED_FUNCTIONS = {
  'save_name': {
    label: 'Save Name',
    description: 'Save user name to database',
    code: `
      // Save user name to database
      async function saveName(message) {
        try {
          const name = message.trim();
          await saveUserData({ name });
          return 'Name saved successfully!';
        } catch (error) {
          console.error('Error saving name:', error);
          return 'Failed to save name.';
        }
      }
    `
  },
  'save_email': {
    label: 'Save Email',
    description: 'Save user email to database',
    code: `
      // Save user email to database
      async function saveEmail(message) {
        try {
          const email = message.trim();
          await saveUserData({ email });
          return 'Email saved successfully!';
        } catch (error) {
          console.error('Error saving email:', error);
          return 'Failed to save email.';
        }
      }
    `
  },
  'save_phone': {
    label: 'Save Phone',
    description: 'Save user phone number to database',
    code: `
      // Save user phone to database
      async function savePhone(message) {
        try {
          const phone = message.trim();
          await saveUserData({ phone });
          return 'Phone number saved successfully!';
        } catch (error) {
          console.error('Error saving phone:', error);
          return 'Failed to save phone number.';
        }
      }
    `
  },
  'custom': {
    label: 'Custom Function',
    description: 'Write your own custom function',
    code: ''
  }
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
  flowId: string | null
  isNew?: boolean
  onSave?: (flow: ChatbotFlow) => void
}

export default function FlowBuilder({ flowId, isNew = false, onSave }: FlowBuilderProps) {
  const router = useRouter()
  const [nodes, setNodes] = useState<ChatbotNode[]>(isNew ? initialNodes : [])
  const [edges, setEdges] = useState<ChatbotEdge[]>(isNew ? initialEdges : [])
  const [selectedNode, setSelectedNode] = useState<ChatbotNode | null>(null)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<ChatbotNode, ChatbotEdge> | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const [flowName, setFlowName] = useState('')
  const [flowDescription, setFlowDescription] = useState('')
  const [flowTrigger, setFlowTrigger] = useState<TriggerConfig>({
    type: 'message',
    value: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  const onNodesChange = useCallback<OnNodesChange<ChatbotNode>>(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  )

  const onEdgesChange = useCallback<OnEdgesChange<ChatbotEdge>>(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  )

  const loadFlow = useCallback(async () => {
    if (isNew) return
    
    try {
      setLoading(true)
      setError(null)
      const flow = await chatbotService.getFlow(flowId!)
      
      setNodes(flow.nodes || [])
      setEdges(flow.edges || [])
      setFlowName(flow.name || '')
      setFlowDescription(flow.description || '')

      // Parse the trigger string into our TriggerConfig format
      const [triggerType, triggerValue] = (flow.trigger || '').includes(':') 
        ? flow.trigger.split(':') 
        : ['message', flow.trigger]

      setFlowTrigger({
        type: triggerType as keyof typeof TRIGGER_TYPES,
        value: triggerValue || ''
      })
    } catch (err) {
      console.error('Error loading flow:', err)
      setError(err instanceof Error ? err.message : 'Failed to load flow')
      toast({
        title: 'Error',
        description: 'Failed to load flow',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [flowId, isNew])

  useEffect(() => {
    if (!isNew && flowId) {
      loadFlow()
    }
  }, [flowId, isNew, loadFlow])

  const saveFlow = async () => {
    try {
      setIsSaving(true)
      const flowData = {
        id: flowId || undefined,
        name: flowName || 'Untitled Flow',
        description: flowDescription || '',
        // Convert trigger object to string format that Laravel expects
        trigger: flowTrigger.type === 'message' ? flowTrigger.value : 
                `${flowTrigger.type}:${flowTrigger.value}`,
        nodes,
        edges,
      }

      const savedFlow = await chatbotService.saveFlow(flowData)
      
      // Parse the trigger string back into our TriggerConfig format
      const [triggerType, triggerValue] = (savedFlow.trigger || '').includes(':') 
        ? savedFlow.trigger.split(':') 
        : ['message', savedFlow.trigger]

      setFlowName(savedFlow.name || '')
      setFlowDescription(savedFlow.description || '')
      setFlowTrigger({
        type: triggerType as keyof typeof TRIGGER_TYPES,
        value: triggerValue || ''
      })
      setNodes(savedFlow.nodes || [])
      setEdges(savedFlow.edges || [])

      toast({
        title: 'Success',
        description: 'Flow saved successfully',
      })

      if (isNew) {
        router.replace(`/chatbot/builder/${savedFlow.id}`)
        flowId = savedFlow.id
        isNew = false
      }

      onSave?.(savedFlow)
      return savedFlow
    } catch (err) {
      console.error('Save error:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to save flow',
        variant: 'destructive',
      })
      throw err
    } finally {
      setIsSaving(false)
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
              value={flowName || ''}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="Flow Name"
              className="text-lg font-semibold"
            />
            <Input
              value={flowDescription || ''}
              onChange={(e) => setFlowDescription(e.target.value)}
              placeholder="Flow Description"
              className="mt-1"
            />
          </div>
          <div className="flex flex-col gap-2 w-[300px]">
            <Select 
              value={flowTrigger?.type || 'message'}
              onValueChange={(value) => setFlowTrigger(prev => ({
                ...prev,
                type: value as keyof typeof TRIGGER_TYPES
              }))}
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
            <Input
              value={flowTrigger?.value || ''}
              onChange={(e) => setFlowTrigger(prev => ({
                ...prev,
                value: e.target.value
              }))}
              placeholder={getTriggerPlaceholder(flowTrigger?.type)}
            />
          </div>
        </div>
        <Button onClick={saveFlow} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Flow'}
        </Button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
            <p className="mt-2">Loading flow...</p>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-3/4 h-full" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
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
                    {selectedNode.type === 'function' && (
                      <div className="space-y-4">
                        <div>
                          <Label>Function Type</Label>
                          <Select
                            value={selectedNode.data.functionType || 'custom'}
                            onValueChange={(value) => {
                              const functionData = PREDEFINED_FUNCTIONS[value as keyof typeof PREDEFINED_FUNCTIONS];
                              updateNodeData(selectedNode.id, {
                                functionType: value,
                                label: functionData.label,
                                description: functionData.description,
                                functionBody: value === 'custom' ? selectedNode.data.functionBody : functionData.code
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select function type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PREDEFINED_FUNCTIONS).map(([value, { label }]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedNode.data.functionType === 'custom' && (
                          <div>
                            <Label>Function Body</Label>
                            <Textarea
                              value={selectedNode.data.functionBody || ''}
                              onChange={(e) => updateNodeData(selectedNode.id, { functionBody: e.target.value })}
                              className="min-h-[200px] font-mono"
                              placeholder="Write your custom function here..."
                            />
                          </div>
                        )}

                        <div>
                          <Label>Description</Label>
                          <Input
                            value={selectedNode.data.description || ''}
                            onChange={(e) => updateNodeData(selectedNode.id, { description: e.target.value })}
                            placeholder="Function description"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function getTriggerPlaceholder(triggerType?: keyof typeof TRIGGER_TYPES): string {
  switch (triggerType) {
    case 'message':
      return 'Enter keywords (comma separated)'
    case 'exact_match':
      return 'Enter exact message'
    case 'button':
      return 'Enter button ID or text'
    case 'api':
      return 'Enter webhook endpoint'
    case 'schedule':
      return 'Enter cron expression'
    case 'event':
      return 'Enter event name'
    case 'regex':
      return 'Enter regular expression'
    case 'intent':
      return 'Enter intent name'
    default:
      return 'Enter trigger value'
  }
}