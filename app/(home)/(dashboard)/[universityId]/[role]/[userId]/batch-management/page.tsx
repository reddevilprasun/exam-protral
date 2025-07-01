"use client";

import { useState } from "react";
import { GraduationCap, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useNewBatch } from "./hooks/use-new-batch";
import { useOpenBatch } from "./hooks/use-open-batch";
import { useGetBatch } from "./api/use-get-batch";
import { Loading } from "@/components/Loading";

// Mock data for departments and batches


export default function BatchManagementPage() {
  const newBatch = useNewBatch();
  const editBatch = useOpenBatch();
  const { data:departmentBatches, isLoading} = useGetBatch();

  const [activeTab, setActiveTab] = useState("all");

  if (isLoading) return <Loading />;
  if (!departmentBatches) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>No batches found.</p>
      </div>
    );
  }
  // Get all unique academic years from all batches
  const academicYears = Array.from(
    new Set(
      departmentBatches.flatMap((dept) =>
        dept.batches.map((batch) => batch.academicYear)
      )
    )
  )
    .sort()
    .reverse();

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Filter batches based on active tab (academic year)
  const filteredDepartments = departmentBatches
    .map((dept) => ({
      ...dept,
      batches:
        activeTab === "all"
          ? dept.batches
          : dept.batches.filter((batch) => batch.academicYear === activeTab),
    }))
    .filter((dept) => dept.batches.length > 0);

  return (
    <div className="p-6">
      <div className="container">
        <div className="mb-6 flex justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Student Batches</h2>
          </div>

          <Button onClick={newBatch.onOpen}>
            <Plus className="mr-2 h-4 w-4" />
            Create Batch
          </Button>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Years</TabsTrigger>
            {academicYears.map((year) => (
              <TabsTrigger key={year} value={year}>
                {year}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredDepartments.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-10">
                  <p className="text-center text-muted-foreground">
                    No batches found for the selected academic year. Create your
                    first batch.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredDepartments.map((dept) => (
                  <Card key={dept.courseId}>
                    <CardHeader>
                      <CardTitle>{dept.courseName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Batch Name</TableHead>
                            <TableHead>Academic Year</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead>End Date</TableHead>
                            <TableHead>Students</TableHead>
                            <TableHead className="text-right">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dept.batches.map((batch) => (
                            <TableRow key={batch.id}>
                              <TableCell className="font-medium">
                                {batch.name}
                              </TableCell>
                              <TableCell>{batch.academicYear}</TableCell>
                              <TableCell>
                                {formatDate(batch.startDate)}
                              </TableCell>
                              <TableCell>{formatDate(batch.endDate)}</TableCell>
                              <TableCell>{batch.noOfStudents || 0}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      editBatch.onOpen(batch.id)
                                    }
                                  >
                                    View
                                  </Button>
                                  {/* <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteBatch(dept.courseId, batch.id)
                                    }
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button> */}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
