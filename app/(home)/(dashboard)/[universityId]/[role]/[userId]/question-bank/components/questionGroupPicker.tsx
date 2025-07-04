"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Package } from "lucide-react";
import { QuestionGroupType } from "../../lib/types";
import { useGetTeacherQuestionGroups } from "../api/use-getTeacher-questionGroup";
import { Id } from "@/convex/_generated/dataModel";
import { GroupPreviewDialog } from "./groupPreview";

interface GroupPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGroups: (
    groupIds: Id<"questionGroups">[],
    questionIds: Id<"questions">[]
  ) => void;
  assignedSubjects?: { value: Id<"subjects">; label: string }[];
  selectedGroups?: Id<"questionGroups">[];
}

export function GroupPicker({
  isOpen,
  onClose,
  onSelectGroups,
  selectedGroups = [],
  assignedSubjects,
}: GroupPickerProps) {
  const [localSelectedGroups, setLocalSelectedGroups] =
    useState<Id<"questionGroups">[]>(selectedGroups);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [previewGroup, setPreviewGroup] = useState<QuestionGroupType | null>(
    null
  );
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { data: initialQuestionGroups } = useGetTeacherQuestionGroups();

  const handleGroupToggle = (groupId: Id<"questionGroups">) => {
    setLocalSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleConfirmSelection = () => {
    const allQuestionIds = localSelectedGroups.reduce<Id<"questions">[]>((acc, groupId)=> {
      const group = initialQuestionGroups?.find(
        (g) => g._id === groupId
      );
      return group && group.selectedQuestions
        ? [...acc, ...group.selectedQuestions]
        : acc;
    },[])

    // Remove duplicates
    const uniqueQuestionIds = Array.from(new Set(allQuestionIds));

    onSelectGroups(
      localSelectedGroups,
      uniqueQuestionIds
    );
    onClose();
  };

  const handlePreviewGroup = (group: QuestionGroupType) => {
    setPreviewGroup(group);
    setIsPreviewOpen(true);
  };

  // Filter groups based on search and filters
  const filteredGroups = initialQuestionGroups?.filter((group) => {
    const matchesSearch = searchQuery
      ? group.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.tags ?? []).some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : true;

    const matchesSubject =
      selectedSubject === "all"
        ? true
        : group.subjectId === (selectedSubject as Id<"subjects">);

    return matchesSearch && matchesSubject;
  });


  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Question Groups</DialogTitle>
            <DialogDescription>
              Choose question groups to import into your exam
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search groups..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {assignedSubjects?.map((subject) => (
                    <SelectItem key={subject.value} value={subject.value}>
                      {subject.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto">
              {filteredGroups?.map((group) => (
                <Card
                  key={group._id}
                  className={`cursor-pointer transition-colors ${
                    localSelectedGroups.includes(group._id)
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={localSelectedGroups.includes(group._id)}
                          onCheckedChange={() => handleGroupToggle(group._id)}
                        />
                        <div>
                          <CardTitle className="text-base">
                            {group.title}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {
                              group.subjectName
                            }
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreviewGroup(group)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {group.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Package className="h-4 w-4" />
                        <span>{group.selectedQuestions?.length} questions</span>
                        <span>•</span>
                        <span>{group.totalMarks} marks</span>
                      </div>
                      {group.targetDifficulty && (
                        <Badge variant="secondary" className="text-xs">
                          {
                            group.targetDifficulty.charAt(0).toUpperCase() +
                            group.targetDifficulty.slice(1)
                          }
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {(group.tags ?? []).slice(0, 3).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                      {(group.tags?.length ?? 0) > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(group.tags?.length ?? 0) - 3} more
                        </Badge>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <p>Usage: {group.intendedUse}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredGroups?.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No question groups found matching your criteria.</p>
              </div>
            )}
          </div>
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {localSelectedGroups.length} group(s) selected
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSelection}
                disabled={localSelectedGroups.length === 0}
              >
                Import Selected Groups
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <GroupPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        previewGroup={previewGroup ?? null}
      />
    </>
  );
}
