import React from 'react'
import { TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from 'lucide-react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableQuestion } from './SortableQuestion'

interface Props {
  eventType: any
  addQuestion: () => void
  updateQuestion: (index: number, field: string, value: any) => void
  removeQuestion: (index: number) => void
  handleQuestionDragEnd: (event: any) => void
  sensors: any
}

export const QuestionsTab = ({ 
  eventType, 
  addQuestion, 
  updateQuestion, 
  removeQuestion,
  handleQuestionDragEnd,
  sensors 
}: Props) => {
  return (
    <TabsContent value="questions">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Booking Questions</h3>
              <Button onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleQuestionDragEnd}
            >
              <SortableContext
                items={eventType.questions.map((q: any) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                {eventType.questions.map((question: any, index: number) => (
                  <SortableQuestion
                    key={question.id}
                    question={question}
                    index={index}
                    updateQuestion={updateQuestion}
                    removeQuestion={removeQuestion}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
} 