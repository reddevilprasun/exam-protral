"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Edit,
  Filter,
  GraduationCap,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  Trash,
  User,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetUniversityStudent } from "./api/use-get-student";
import { useNewStudent } from "./hooks/use-new-student";
import { Loading } from "@/components/Loading";
import { useGetDepartment } from "../department-management/api/use-get-department";
import { useGetBatch } from "../batch-management/api/use-get-batch";
import { useOpenStudent } from "./hooks/use-open-student";


export default function StudentManagementPage() {
  const router = useRouter();
  const newStudent = useNewStudent();
  const editStudent = useOpenStudent();
  const { data: students, isLoading: studentLoading } =
    useGetUniversityStudent();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const departments = useGetDepartment();
  const batches = useGetBatch();

  const departmentsOptions = (departments.data || []).map((department) => ({
    label: department.name,
    value: department._id
  }))

  const batchesOptions = (batches.data || []).flatMap((course) =>
    course.batches.map((batch) => ({
      label: batch.name,
      value: batch.id,
      courseId: course.courseId,
    }))
  );
  

  // Filter students
  const filteredStudents = students?.filter((student) => {
    const matchesSearch = searchQuery
      ? `${student.firstName} ${student.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.academicId.toString().includes(searchQuery)
      : true;

    const matchesDepartment =
      departmentFilter === "all"
        ? true
        : student.departmentId === departmentFilter;
    const matchesBatch =
      batchFilter === "all" ? true : student.batchId === batchFilter;

    return matchesSearch && matchesDepartment && matchesBatch;
  });

  // Pagination
  const totalPages = Math.ceil((filteredStudents?.length ?? 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = (filteredStudents ?? []).slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if(studentLoading) return <Loading/>;

  return (
    <>
      <div className="p-6">
        <div className="container">
          {/* Stats Cards */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Students
                  </p>
                  <p className="text-2xl font-bold">{students?.length}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Active Students
                  </p>
                  {/* TODO: Need to implement active student count */}
                  <p className="text-2xl font-bold">4</p>
                </div>
                <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                  <User className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Departments
                  </p>
                  <p className="text-2xl font-bold">
                    {new Set(students?.map((s) => s.departmentId)).size}
                  </p>
                </div>
                <div className="rounded-full bg-blue-500/10 p-2 text-blue-500">
                  <GraduationCap className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Batches
                  </p>
                  <p className="text-2xl font-bold">
                    {new Set(students?.map((s) => s.batchId)).size}
                  </p>
                </div>
                <div className="rounded-full bg-purple-500/10 p-2 text-purple-500">
                  <BookOpen className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departmentsOptions.map((dept) => (
                      <SelectItem key={dept.value} value={dept.value}>
                        {dept.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={batchFilter} onValueChange={setBatchFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Batches</SelectItem>
                    {batchesOptions.map((batch) => (
                      <SelectItem key={batch.value} value={batch.value}>
                        {batch.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={newStudent.onOpen}>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>

          {/* Students Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Added On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No students found matching your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          {student.firstName} {student.lastName}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.academicId}</Badge>
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>
                          {student.departmentName || "N/A"}
                        </TableCell>
                        <TableCell>
                          {student.courseName || "N/A"}
                        </TableCell>
                        <TableCell>
                          {student.batchName || "N/A"}  
                        </TableCell>
                        <TableCell>
                          {formatDate(student.enrollmentDate)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  router.push(
                                    `/teacher/student-management/${student.id}`
                                  )
                                }
                              >
                                <User className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => editStudent.onOpen(student.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Student
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  window.open(`mailto:${student.email}`)
                                }
                              >
                                <Mail className="mr-2 h-4 w-4" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {}}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete Student
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to{" "}
                {Math.min(
                  startIndex + itemsPerPage,
                  filteredStudents?.length ?? 0
                )}{" "}
                of {filteredStudents?.length} students
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
