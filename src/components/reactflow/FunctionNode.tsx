import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function FunctionNode({ data }: { data: { label: string; content: string } }) {
  return (
    <Card className="w-[200px]">
      <CardHeader className="p-2">
        <CardTitle className="text-sm">{data.label}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 text-xs">{data.content}</CardContent>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Card>
  )
}

export default memo(FunctionNode)
