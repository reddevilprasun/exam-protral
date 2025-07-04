import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogFooter,
 } from "@/components/ui/dialog"
import { QuestionType } from "../../lib/types"
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "../../lib/utils";
interface previewQuestionDialogProps {
  question: QuestionType | null;
  isOpen: boolean;
  onClose: () => void;
}

const getQuestionTypeName = (type: string) => {
  switch (type) {
    case "mcq":
      return "Multiple Choice Question";
    case "saq":
      return "Short Answer Question";
    case "true_false":
      return "True/False Question";
    case "fill_in_the_blank":
      return "Fill in the Blank Question";
    default:
      return "Unknown Type";
  }
}
const PreviewQuestionDialog = ({
  question,
  isOpen,
  onClose,
}:previewQuestionDialogProps) => {
  return (
    <Dialog
          open={isOpen}
          onOpenChange={onClose}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Question Preview</DialogTitle>
              <DialogDescription>
                Preview how this question will appear to students
              </DialogDescription>
            </DialogHeader>
            {question && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {getQuestionTypeName(question.questionType)}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        question.difficultyLevel === "easy"
                          ? "secondary"
                          : question.difficultyLevel === "medium"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {question.difficultyLevel
                        .charAt(0)
                        .toUpperCase() +
                        question.difficultyLevel.slice(1)}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {question.marks} marks
                    </span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="font-medium mb-4">
                    {question.questionText}
                  </p>

                  {question.questionType === "mcq" &&
                    question.options && (
                      <div className="space-y-2">
                        {question.options.map(
                          (
                            option: { text: string; isCorrect: boolean },
                            index: number
                          ) => (
                            <div
                              key={index}
                              className="flex items-center space-x-2"
                            >
                              <div className="w-4 h-4 border rounded-full flex items-center justify-center">
                                {option.isCorrect && (
                                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                                )}
                              </div>
                              <span
                                className={
                                  option.isCorrect
                                    ? "text-green-600 font-medium"
                                    : ""
                                }
                              >
                                {option.text}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                  {question.questionType === "true_false" && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border rounded-full flex items-center justify-center">
                          {question.correctTrueFalseAnswer && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          )}
                        </div>
                        <span
                          className={
                            question.correctTrueFalseAnswer
                              ? "text-green-600 font-medium"
                              : ""
                          }
                        >
                          True
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border rounded-full flex items-center justify-center">
                          {!question.correctTrueFalseAnswer && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          )}
                        </div>
                        <span
                          className={
                            !question.correctTrueFalseAnswer
                              ? "text-green-600 font-medium"
                              : ""
                          }
                        >
                          False
                        </span>
                      </div>
                    </div>
                  )}

                  {(question.questionType === "saq" ||
                    question.questionType === "fill_in_the_blank") && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-sm font-medium text-green-800 mb-1">
                        {question.questionType === "saq"
                          ? "Sample Answer:"
                          : "Correct Answer:"}
                      </p>
                      <p className="text-green-700">
                        {question.answerText}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {question.tags?.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Subject: {question.subjectName}</p>
                  <p>Created: {formatDate(question.createdAt)}</p>
                  <p>Last updated: {formatDate(question.updatedAt)}</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
  )
}

export default PreviewQuestionDialog
