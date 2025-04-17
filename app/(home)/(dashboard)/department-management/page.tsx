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
import { useGetDepartment } from "./api/use-get-department";
import { useNewDepartment } from "./hooks/use-new-department";
import { Loading } from "@/components/Loading";
import { useOpenDepartment } from "./hooks/use-open-department";

export default function DepartmentManagementPage() {
  const newDepartment = useNewDepartment();
  const editDepartment = useOpenDepartment();
  const { data: departments, isLoading } = useGetDepartment();

  const formatDate = (date: number) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) return <Loading />;
  if (!departments) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>No departments found.</p>
      </div>
    );
  }

  return (
    <div className="p-6 container">
      <div className="mb-6 flex justify-between">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Departments</h2>
        </div>

        <Button onClick={newDepartment.onOpen}>
          <Plus className="mr-2 h-4 w-4" />
          Add Department
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created On</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length !== 0 ? (
              departments.map((department) => (
                <TableRow key={department._id}>
                  <TableCell className="font-medium">
                    {department.name}
                  </TableCell>
                  <TableCell>{department.code}</TableCell>
                  <TableCell className="truncate">
                    {department.description}
                  </TableCell>
                  <TableCell>{formatDate(department.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => editDepartment.onOpen(department._id)}
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
