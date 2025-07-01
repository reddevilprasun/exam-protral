"use client";
import { EditBatchSheet } from "@/app/(home)/(dashboard)/[universityId]/[role]/[userId]/batch-management/components/edit-batch";
import { NewBatchSheet } from "@/app/(home)/(dashboard)/[universityId]/[role]/[userId]/batch-management/components/new-batch";
import { EditCourseSheet } from "@/app/(home)/(dashboard)/[universityId]/[role]/[userId]/course-management/components/edit-department";
import { NewCourseSheet } from "@/app/(home)/(dashboard)/[universityId]/[role]/[userId]/course-management/components/new-department";
import { EditDepartmentSheet } from "@/app/(home)/(dashboard)/[universityId]/[role]/[userId]/department-management/components/edit-department";
import { NewDepartmentSheet } from "@/app/(home)/(dashboard)/[universityId]/[role]/[userId]/department-management/components/new-department";
import { EditStudentSheet } from "@/app/(home)/(dashboard)/[universityId]/[role]/[userId]/student-management/components/edit-student";
import { NewStudentSheet } from "@/app/(home)/(dashboard)/[universityId]/[role]/[userId]/student-management/components/new-student";
import { EditSubjectSheet } from "@/app/(home)/(dashboard)/[universityId]/[role]/[userId]/subject-management/components/edit-subject";
import { NewSubjectSheet } from "@/app/(home)/(dashboard)/[universityId]/[role]/[userId]/subject-management/components/new-subject";
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
      <NewStudentSheet/>
      <EditStudentSheet/>
    </>
  )
}