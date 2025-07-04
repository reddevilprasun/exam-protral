import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { QuestionType } from "../../lib/types";
import { Id } from "@/convex/_generated/dataModel";

interface QuestionPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questions: QuestionType[];
  selectedQuestions: Id<"questions">[];
  onSelect: (questionId: Id<"questions">) => void;
  subjectOptions: { label: string; value: string }[];
}

export function QuestionPickerDialog({
  open,
  onOpenChange,
  questions,
  selectedQuestions,
  onSelect,
  subjectOptions,
}: QuestionPickerDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState("all");
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] =
    useState("any");

  const handleQuestionToggle = (questionId: Id<"questions">) => {
    if (selectedQuestions.includes(questionId)) {
      onSelect(questionId); // Deselect
    } else {
      onSelect(questionId); // Select
    }
  };

  const filteredQuestions = useMemo(() => {
    return questions.filter((question) => {
      const matchesSearch =
        !searchQuery ||
        question.questionText
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        question.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesSubject =
        selectedSubjectFilter === "all"
          ? true
          : question.subjectId === selectedSubjectFilter;

      const matchesDifficulty =
        selectedDifficultyFilter === "any"
          ? true
          : question.difficultyLevel === selectedDifficultyFilter;

      return matchesSearch && matchesSubject && matchesDifficulty;
    });
  }, [questions, searchQuery, selectedSubjectFilter, selectedDifficultyFilter]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select Questions</DialogTitle>
          <DialogDescription>
            Choose questions to add to this group
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select
                value={selectedSubjectFilter}
                onValueChange={setSelectedSubjectFilter}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjectOptions.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedDifficultyFilter}
                onValueChange={setSelectedDifficultyFilter}
              >
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
            {filteredQuestions.map((question) => (
              <div
                key={question._id}
                className="flex items-center space-x-3 p-4 border-b last:border-b-0"
              >
                <Checkbox
                  checked={selectedQuestions.includes(question._id)}
                  onCheckedChange={() => handleQuestionToggle(question._id)}
                />
                <div className="flex-1">
                  <p className="font-medium line-clamp-2">{question.questionText}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {
                      question.questionType.charAt(0).toUpperCase() +
                      question.questionType.slice(1)
                      }
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {question.difficultyLevel.charAt(0).toUpperCase() +
                        question.difficultyLevel.slice(1)}
                    </Badge>
                    <Badge variant="default" className="text-xs">
                      {question.marks} marks
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {question.subjectName}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(question.tags ?? []).map((tag, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Add Selected Questions ({selectedQuestions.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
