import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageNodeData } from '@/types/nodes'

function MessageNode({ data }: { data: MessageNodeData }) {
  const renderContent = () => {
    switch (data.messageType) {
      case 'cta_url':
        return (
          <div className="space-y-2">
            {data.ctaUrl?.header && (
              <div className="text-xs font-semibold">{data.ctaUrl.header}</div>
            )}
            <div className="text-xs">{data.ctaUrl?.body}</div>
            {data.ctaUrl?.footer && (
              <div className="text-xs text-gray-500">{data.ctaUrl.footer}</div>
            )}
            {data.ctaUrl?.button && (
              <div className="relative">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => window.open(data.ctaUrl?.button.url, '_blank')}
                >
                  {data.ctaUrl.button.display_text}
                </Button>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`button-cta`}
                  style={{ right: -8, top: '50%' }}
                />
              </div>
            )}
          </div>
        )
      
      case 'template':
        return (
          <div className="space-y-2">
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
          </div>
        )
      
      default: // text message
        return (
          <div className="space-y-2">
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
          </div>
        )
    }
  }

  return (
    <Card className="w-[200px]">
      <CardHeader className="p-2">
        <CardTitle className="text-sm">{data.label}</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        {renderContent()}
      </CardContent>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} id="main" />
    </Card>
  )
}

export default memo(MessageNode)
