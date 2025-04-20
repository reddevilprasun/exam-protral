"use client";

import { Building, Edit, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loading } from "@/components/Loading";
import { useNewCourse } from "./hooks/use-new-department";
import { useOpenCourse } from "./hooks/use-open-department";
import { useGetCourse } from "./api/use-get-department";

export default function DepartmentManagementPage() {
  const newCourse = useNewCourse();
  const editCourse = useOpenCourse();
  const { data: courses, isLoading } = useGetCourse();

  const formatDate = (date: number) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) return <Loading />;
  if (!courses) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>No courses found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 container">
      <div className="mb-6 flex justify-between">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Courses</h2>
        </div>

        <Button onClick={newCourse.onOpen}>
          <Plus className="mr-2 h-4 w-4" />
          Add Course
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length !== 0 ? (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">
                    {course.name}
                  </TableCell>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.department.name}</TableCell>
                  <TableCell className="truncate">
                    {course.description}
                  </TableCell>
                  <TableCell>{formatDate(course.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editCourse.onOpen(course.id)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  No departments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
