'use client'

import { use } from 'react'
import FlowBuilder from '@/components/chatbot/flow-builder'

export default function ChatbotBuilderPage({ params }: { params: Promise<{ flowId: string }> }) {
  const { flowId } = use(params)
  return <FlowBuilder flowId={flowId} />
}