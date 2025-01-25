import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface MessageNodeData {
  label: string;
  content: string;
  buttons?: Array<{
    id: string;
    text: string;
  }>;
}

function MessageNode({ data }: { data: MessageNodeData }) {
  return (
    <Card className="w-[200px]">
      <CardHeader className="p-2">
        <CardTitle className="text-sm">{data.label}</CardTitle>
      </CardHeader>
      <CardContent className="p-2 space-y-2">
        <div className="text-xs">{data.content}</div>
        {data.buttons && data.buttons.length > 0 && (
          <div className="flex flex-col gap-1">
            {data.buttons.map((button) => (
              <div key={button.id} className="relative">
                <Button variant="secondary" size="sm" className="w-full text-xs">
                  {button.text}
                </Button>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`button-${button.id}`}
                  style={{ right: -8, top: '50%' }}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id="main" />
    </Card>
  )
}

export default memo(MessageNode)
