"use client";
import { EditBatchSheet } from "@/app/(home)/(dashboard)/batch-management/components/edit-batch";
import { NewBatchSheet } from "@/app/(home)/(dashboard)/batch-management/components/new-batch";
import { EditCourseSheet } from "@/app/(home)/(dashboard)/course-management/components/edit-department";
import { NewCourseSheet } from "@/app/(home)/(dashboard)/course-management/components/new-department";
import { EditDepartmentSheet } from "@/app/(home)/(dashboard)/department-management/components/edit-department";
import { NewDepartmentSheet } from "@/app/(home)/(dashboard)/department-management/components/new-department";
import { EditSubjectSheet } from "@/app/(home)/(dashboard)/subject-management/components/edit-subject";
import { NewSubjectSheet } from "@/app/(home)/(dashboard)/subject-management/components/new-subject";
import { useMountedState } from "react-use";


export const SheetProvider = () => {
  const isMounted = useMountedState();

  if(!isMounted) return null;
  
  return (
    <>
      <NewDepartmentSheet/>
      <EditDepartmentSheet/>
      <NewCourseSheet/>
      <EditCourseSheet/>
      <NewBatchSheet/>
      <EditBatchSheet/>
      <NewSubjectSheet/>
      <EditSubjectSheet/>
    </>
  )
}