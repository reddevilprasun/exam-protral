// components/GroupPreviewDialog.tsx

"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { QuestionGroupType } from "../../lib/types"
import { useGetQuestionByIds } from "../api/use-get-QuestionByIds"
import { Loading } from "@/components/Loading"

interface GroupPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  previewGroup: QuestionGroupType | null
}

export function GroupPreviewDialog({
  open,
  onOpenChange,
  previewGroup,
}: GroupPreviewDialogProps) {
  
  const {
    data: questions,
    isLoading,
  } = useGetQuestionByIds(previewGroup?.selectedQuestions || [])

  const calculateTotalMarks = () => {
    return questions?.reduce((sum, q) => sum + (q.marks || 0), 0) || 0
  }

  if(isLoading) {
    <Loading/>
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Group Preview: {previewGroup?.title}</DialogTitle>
          <DialogDescription>Preview questions in this group</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Metadata section */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <p className="text-sm font-medium">Subject</p>
              <p className="text-sm text-muted-foreground">
                {
                  previewGroup?.subjectName
                }
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Questions</p>
              <p className="text-sm text-muted-foreground">
                {previewGroup?.selectedQuestions?.length} questions
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Total Marks</p>
              <p className="text-sm text-muted-foreground">
                {calculateTotalMarks()} marks
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">Difficulty</p>
              <p className="text-sm text-muted-foreground">
                {previewGroup?.targetDifficulty || "Mixed"}
              </p>
            </div>
          </div>

          {/* Description */}
          {previewGroup?.description && (
            <div>
              <p className="text-sm font-medium mb-2">Description</p>
              <p className="text-sm text-muted-foreground">{previewGroup.description}</p>
            </div>
          )}

          {/* Tags */}
          {(previewGroup?.tags ?? []).length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Tags</p>
              <div className="flex flex-wrap gap-1">
                {(previewGroup?.tags ?? []).map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Questions */}
          <div>
            <p className="text-sm font-medium mb-3">
              Questions ({questions?.length || 0})
            </p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {questions?.map((question, index) => (
                <div key={question._id} className="border rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium">Q{index + 1}.</span>
                        <Badge variant="outline" className="text-xs">{question.questionType}</Badge>
                        <Badge variant="secondary" className="text-xs">{question.difficultyLevel}</Badge>
                        <Badge variant="default" className="text-xs">{question.marks} marks</Badge>
                      </div>
                      <p className="text-sm line-clamp-2">{question.questionText}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
