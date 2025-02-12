import { Node, Edge } from '@xyflow/react'

export interface ButtonData {
  id: string
  text: string
  action?: string
}

export interface BaseNodeData extends Record<string, unknown> {
  label: string
  content: string
  trigger?: string
  action?: string
}

export interface MessageNodeData extends BaseNodeData {
  buttons?: ButtonData[]
}

export interface InputNodeData extends BaseNodeData {
  inputType?: 'text' | 'number' | 'email' | 'phone'
  validation?: string
}

export interface ConditionNodeData extends BaseNodeData {
  condition?: string
}

export interface ApiNodeData extends BaseNodeData {
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
}

export interface FunctionNodeData extends BaseNodeData {
  functionType?: keyof typeof PREDEFINED_FUNCTIONS
  functionBody?: string
  description?: string
}

export interface FlowNodeData extends BaseNodeData {
  description?: string
}

export interface TriggerConfig {
  type: string
  value: string
  metadata?: Record<string, any>
}

export interface ChatbotFlow {
  id: string
  name: string
  description: string
  trigger: TriggerConfig
  updatedAt: string
  nodes: ChatbotNode[]
  edges: ChatbotEdge[]
}

export type NodeData = 
  | MessageNodeData 
  | InputNodeData 
  | ConditionNodeData 
  | ApiNodeData 
  | FunctionNodeData
  | FlowNodeData

export type ChatbotNode = Node<NodeData>

export interface ChatbotEdge extends Edge {
  label?: string
  condition?: string
  action?: string
}
