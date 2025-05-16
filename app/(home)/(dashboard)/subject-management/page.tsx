"use client";

import type React from "react";

import { useState } from "react";
import { Plus, Search, Filter, Edit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNewSubject } from "./hooks/use-new-subject";
import { useGetSubject } from "./api/use-get-subject";
import { Loading } from "@/components/Loading";
import { useGetCourse } from "../course-management/api/use-get-department";
import { useGetDepartment } from "../department-management/api/use-get-department";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { useOpenSubject } from "./hooks/use-open-subject";

export default function SubjectManagementPage() {
  const newSubject = useNewSubject();
  const editSubject = useOpenSubject();
  const { data: subjects, isLoading: subjectsLoading } = useGetSubject();
  const { data: courses, isLoading: coursesLoading } = useGetCourse();
  const { data: departments, isLoading: departmentLoading } =
    useGetDepartment();
  const isLoading = subjectsLoading || coursesLoading || departmentLoading;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<string>("");

  if (isLoading) return <Loading />;

  // Filter subjects based on search query and filters
  const filteredSubjects = subjects?.filter((subject) => {
    const matchesSearch =
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment = selectedDepartment
      ? subject.department.id === selectedDepartment
      : true;
    const matchesCourse = selectedCourse
      ? subject.course.id === selectedCourse
      : true;
    const matchesSemester = selectedSemester
      ? subject.semester.toString() === selectedSemester
      : true;

    return (
      matchesSearch && matchesDepartment && matchesCourse && matchesSemester
    );
  });

  // Get course name by ID
  const getCourseName = (courseId: Id<"courses">) => {
    const course = courses?.find((c) => c?.id === courseId);
    return course ? course.name : "Unknown Course";
  };

  // Get department name by ID
  const getDepartmentName = (departmentId: Id<"department">) => {
    const department = departments?.find((d) => d._id === departmentId);
    return department ? department.name : "Unknown Department";
  };

  return (
    <div className="flex-1 p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <Button className="mt-4 md:mt-0" onClick={newSubject.onOpen}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Subjects</CardTitle>
            <CardDescription>View and manage all subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subjects..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-60">
                  <DropdownMenuLabel>Filter Subjects</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <div className="space-y-2 mb-2">
                      <Label htmlFor="department-filter">Department</Label>
                      <Select
                        value={selectedDepartment}
                        onValueChange={setSelectedDepartment}
                      >
                        <SelectTrigger id="department-filter">
                          <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments?.map((department) => (
                            <SelectItem
                              key={department._id}
                              value={department._id}
                            >
                              {department.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 mb-2">
                      <Label htmlFor="course-filter">Course</Label>
                      <Select
                        value={selectedCourse}
                        onValueChange={setSelectedCourse}
                        disabled={!selectedDepartment}
                      >
                        <SelectTrigger id="course-filter">
                          <SelectValue
                            placeholder={
                              selectedDepartment
                                ? "All Courses"
                                : "Select Department First"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDepartment &&
                            (courses ?? [])
                              .filter(
                                (course) =>
                                  course?.department.id === selectedDepartment
                              )
                              .map((course) => (
                                <SelectItem
                                  key={course?.id}
                                  value={course?.id.toString() || ""}
                                >
                                  {course?.name}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="semester-filter">Semester</Label>
                      <Select
                        value={selectedSemester}
                        onValueChange={setSelectedSemester}
                      >
                        <SelectTrigger id="semester-filter">
                          <SelectValue placeholder="All Semesters" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Semesters</SelectItem>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                            <SelectItem
                              key={semester}
                              value={semester.toString()}
                            >
                              Semester {semester}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedDepartment("");
                        setSelectedCourse("");
                        setSelectedSemester("");
                      }}
                    >
                      Remove Filters
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Subjects</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
              <TabsContent value="all">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Department
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Course
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Semester
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Credit Hours
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubjects?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No subjects found. Try adjusting your search or
                            filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSubjects?.map((subject) => (
                          <TableRow key={subject.id}>
                            <TableCell className="font-medium">
                              {subject.code}
                            </TableCell>
                            <TableCell>{subject.name}</TableCell>
                            <TableCell className="hidden md:table-cell">
                              {getDepartmentName(subject.department.id)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {getCourseName(subject.course.id)}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              Semester {subject.semester}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {subject.creditHours}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  subject.status === "active"
                                    ? "default"
                                    : "secondary"
                                }
                                className="capitalize"
                              >
                                {subject.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => editSubject.onOpen(subject.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                                {/* <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {}}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button> */}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="active">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Department
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Course
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Semester
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Credit Hours
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubjects?.filter((s) => s.status === "active")
                        .length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No active subjects found. Try adjusting your search
                            or filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        (filteredSubjects ?? [])
                          .filter((s) => s.status === "active")
                          .map((subject) => (
                            <TableRow key={subject.id}>
                              <TableCell className="font-medium">
                                {subject.code}
                              </TableCell>
                              <TableCell>{subject.name}</TableCell>
                              <TableCell className="hidden md:table-cell">
                                {getDepartmentName(subject.department.id)}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {getCourseName(subject.course.id)}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                Semester {subject.semester}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {subject.creditHours}
                              </TableCell>
                              <TableCell>
                                <Badge variant="default" className="capitalize">
                                  {subject.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    onClick={() =>
                                      editSubject.onOpen(subject.id)
                                    }
                                    variant="ghost"
                                    size="icon"
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  {/* <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {}}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button> */}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="inactive">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Department
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Course
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Semester
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Credit Hours
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubjects?.filter((s) => s.status === "inactive")
                        .length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            No inactive subjects found. Try adjusting your
                            search or filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        (filteredSubjects ?? [])
                          .filter((s) => s.status === "inactive")
                          .map((subject) => (
                            <TableRow key={subject.id}>
                              <TableCell className="font-medium">
                                {subject.code}
                              </TableCell>
                              <TableCell>{subject.name}</TableCell>
                              <TableCell className="hidden md:table-cell">
                                {getDepartmentName(subject.department.id)}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {getCourseName(subject.course.id)}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                Semester {subject.semester}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                {subject.creditHours}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className="capitalize"
                                >
                                  {subject.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    onClick={() =>
                                      editSubject.onOpen(subject.id)
                                    }
                                    variant="ghost"
                                    size="icon"
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Button>
                                  {/* <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {}}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button> */}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredSubjects?.length} of {subjects?.length} subjects
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
