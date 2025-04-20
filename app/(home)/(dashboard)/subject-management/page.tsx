"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

// Mock data for departments and courses
const departments = [
  { id: 1, name: "Computer Science" },
  { id: 2, name: "Electrical Engineering" },
  { id: 3, name: "Mechanical Engineering" },
  { id: 4, name: "Civil Engineering" },
  { id: 5, name: "Business Administration" },
]

const courses = [
  { id: 1, name: "Bachelor of Science in Computer Science", departmentId: 1, code: "BSCS" },
  { id: 2, name: "Master of Science in Computer Science", departmentId: 1, code: "MSCS" },
  { id: 3, name: "Bachelor of Science in Electrical Engineering", departmentId: 2, code: "BSEE" },
  { id: 4, name: "Master of Science in Electrical Engineering", departmentId: 2, code: "MSEE" },
  { id: 5, name: "Bachelor of Science in Mechanical Engineering", departmentId: 3, code: "BSME" },
  { id: 6, name: "Bachelor of Science in Civil Engineering", departmentId: 4, code: "BSCE" },
  { id: 7, name: "Bachelor of Business Administration", departmentId: 5, code: "BBA" },
]

// Mock data for subjects
const subjects = [
  {
    id: 1,
    code: "CS101",
    name: "Introduction to Programming",
    description: "Basic concepts of programming using Python",
    creditHours: 3,
    courseId: 1,
    departmentId: 1,
    semester: 1,
    status: "active",
  },
  {
    id: 2,
    code: "CS201",
    name: "Data Structures",
    description: "Study of data structures and algorithms",
    creditHours: 4,
    courseId: 1,
    departmentId: 1,
    semester: 3,
    status: "active",
  },
  {
    id: 3,
    code: "CS301",
    name: "Database Systems",
    description: "Introduction to database design and SQL",
    creditHours: 3,
    courseId: 1,
    departmentId: 1,
    semester: 5,
    status: "active",
  },
  {
    id: 4,
    code: "EE101",
    name: "Circuit Theory",
    description: "Basic electrical circuit analysis",
    creditHours: 4,
    courseId: 3,
    departmentId: 2,
    semester: 1,
    status: "active",
  },
  {
    id: 5,
    code: "ME101",
    name: "Engineering Mechanics",
    description: "Study of forces and their effects on rigid bodies",
    creditHours: 3,
    courseId: 5,
    departmentId: 3,
    semester: 1,
    status: "active",
  },
]

export default function SubjectManagementPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedCourse, setSelectedCourse] = useState<string>("")
  const [selectedSemester, setSelectedSemester] = useState<string>("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [subjectToDelete, setSubjectToDelete] = useState<number | null>(null)

  // Form state for adding a new subject
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    creditHours: 3,
    courseId: "",
    departmentId: "",
    semester: 1,
    status: "active",
  })

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // If department changes, reset course
    if (name === "departmentId") {
      setFormData((prev) => ({
        ...prev,
        courseId: "",
      }))
    }
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.code || !formData.name || !formData.courseId || !formData.departmentId) {
      toast(
        "Validation Error",
        {
        description: "Please fill in all required fields.",
      })
      return
    }

    // In a real app, this would be an API call to add the subject
    toast(
      "Subject Added",
      {
        description: `${formData.code} - ${formData.name} has been added successfully.`,
    })

    // Reset form and close dialog
    setFormData({
      code: "",
      name: "",
      description: "",
      creditHours: 3,
      courseId: "",
      departmentId: "",
      semester: 1,
      status: "active",
    })
    setIsAddDialogOpen(false)
  }

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (subjectToDelete) {
      // In a real app, this would be an API call to delete the subject
      toast(
        "Subject Deleted",
        {
        description: "The subject has been deleted successfully.",
      })
      setSubjectToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  // Filter subjects based on search query and filters
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDepartment = selectedDepartment ? subject.departmentId.toString() === selectedDepartment : true
    const matchesCourse = selectedCourse ? subject.courseId.toString() === selectedCourse : true
    const matchesSemester = selectedSemester ? subject.semester.toString() === selectedSemester : true

    return matchesSearch && matchesDepartment && matchesCourse && matchesSemester
  })

  // Get course name by ID
  const getCourseName = (courseId: number) => {
    const course = courses.find((c) => c.id === courseId)
    return course ? course.name : "Unknown Course"
  }

  // Get department name by ID
  const getDepartmentName = (departmentId: number) => {
    const department = departments.find((d) => d.id === departmentId)
    return department ? department.name : "Unknown Department"
  }

  return (
      <div className="flex-1 p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <Button className="mt-4 md:mt-0" onClick={() => setIsAddDialogOpen(true)}>
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
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Filter Subjects</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <div className="p-2">
                      <div className="space-y-2 mb-2">
                        <Label htmlFor="department-filter">Department</Label>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                          <SelectTrigger id="department-filter">
                            <SelectValue placeholder="All Departments" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {departments.map((department) => (
                              <SelectItem key={department.id} value={department.id.toString()}>
                                {department.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 mb-2">
                        <Label htmlFor="course-filter">Course</Label>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={!selectedDepartment}>
                          <SelectTrigger id="course-filter">
                            <SelectValue placeholder={selectedDepartment ? "All Courses" : "Select Department First"} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Courses</SelectItem>
                            {selectedDepartment &&
                              courses
                                .filter((course) => course.departmentId === Number.parseInt(selectedDepartment))
                                .map((course) => (
                                  <SelectItem key={course.id} value={course.id.toString()}>
                                    {course.name}
                                  </SelectItem>
                                ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="semester-filter">Semester</Label>
                        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                          <SelectTrigger id="semester-filter">
                            <SelectValue placeholder="All Semesters" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Semesters</SelectItem>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                              <SelectItem key={semester} value={semester.toString()}>
                                Semester {semester}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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
                          <TableHead className="hidden md:table-cell">Department</TableHead>
                          <TableHead className="hidden md:table-cell">Course</TableHead>
                          <TableHead className="hidden md:table-cell">Semester</TableHead>
                          <TableHead className="hidden md:table-cell">Credit Hours</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubjects.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              No subjects found. Try adjusting your search or filters.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSubjects.map((subject) => (
                            <TableRow key={subject.id}>
                              <TableCell className="font-medium">{subject.code}</TableCell>
                              <TableCell>{subject.name}</TableCell>
                              <TableCell className="hidden md:table-cell">
                                {getDepartmentName(subject.departmentId)}
                              </TableCell>
                              <TableCell className="hidden md:table-cell">{getCourseName(subject.courseId)}</TableCell>
                              <TableCell className="hidden md:table-cell">Semester {subject.semester}</TableCell>
                              <TableCell className="hidden md:table-cell">{subject.creditHours}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={subject.status === "active" ? "default" : "secondary"}
                                  className="capitalize"
                                >
                                  {subject.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/subject-management/${subject.id}`}>
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Edit</span>
                                    </Link>
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSubjectToDelete(subject.id)
                                      setIsDeleteDialogOpen(true)
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                  </Button>
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
                          <TableHead className="hidden md:table-cell">Department</TableHead>
                          <TableHead className="hidden md:table-cell">Course</TableHead>
                          <TableHead className="hidden md:table-cell">Semester</TableHead>
                          <TableHead className="hidden md:table-cell">Credit Hours</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubjects.filter((s) => s.status === "active").length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              No active subjects found. Try adjusting your search or filters.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSubjects
                            .filter((s) => s.status === "active")
                            .map((subject) => (
                              <TableRow key={subject.id}>
                                <TableCell className="font-medium">{subject.code}</TableCell>
                                <TableCell>{subject.name}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {getDepartmentName(subject.departmentId)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {getCourseName(subject.courseId)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">Semester {subject.semester}</TableCell>
                                <TableCell className="hidden md:table-cell">{subject.creditHours}</TableCell>
                                <TableCell>
                                  <Badge variant="default" className="capitalize">
                                    {subject.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" asChild>
                                      <Link href={`/subject-management/${subject.id}`}>
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setSubjectToDelete(subject.id)
                                        setIsDeleteDialogOpen(true)
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Delete</span>
                                    </Button>
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
                          <TableHead className="hidden md:table-cell">Department</TableHead>
                          <TableHead className="hidden md:table-cell">Course</TableHead>
                          <TableHead className="hidden md:table-cell">Semester</TableHead>
                          <TableHead className="hidden md:table-cell">Credit Hours</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredSubjects.filter((s) => s.status === "inactive").length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-8">
                              No inactive subjects found. Try adjusting your search or filters.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSubjects
                            .filter((s) => s.status === "inactive")
                            .map((subject) => (
                              <TableRow key={subject.id}>
                                <TableCell className="font-medium">{subject.code}</TableCell>
                                <TableCell>{subject.name}</TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {getDepartmentName(subject.departmentId)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                  {getCourseName(subject.courseId)}
                                </TableCell>
                                <TableCell className="hidden md:table-cell">Semester {subject.semester}</TableCell>
                                <TableCell className="hidden md:table-cell">{subject.creditHours}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="capitalize">
                                    {subject.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" asChild>
                                      <Link href={`/subject-management/${subject.id}`}>
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Edit</span>
                                      </Link>
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        setSubjectToDelete(subject.id)
                                        setIsDeleteDialogOpen(true)
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Delete</span>
                                    </Button>
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
                Showing {filteredSubjects.length} of {subjects.length} subjects
              </p>
            </CardFooter>
          </Card>
        </div>

        {/* Add Subject Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>Create a new subject for a course.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Subject Code*</Label>
                    <Input
                      id="code"
                      name="code"
                      placeholder="e.g., CS101"
                      value={formData.code}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="creditHours">Credit Hours*</Label>
                    <Select
                      name="creditHours"
                      value={formData.creditHours.toString()}
                      onValueChange={(value) => handleSelectChange("creditHours", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select credit hours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1</SelectItem>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                        <SelectItem value="5">5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Subject Name*</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Introduction to Programming"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="departmentId">Department*</Label>
                    <Select
                      name="departmentId"
                      value={formData.departmentId.toString()}
                      onValueChange={(value) => handleSelectChange("departmentId", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id.toString()}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courseId">Course*</Label>
                    <Select
                      name="courseId"
                      value={formData.courseId.toString()}
                      onValueChange={(value) => handleSelectChange("courseId", value)}
                      disabled={!formData.departmentId}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={formData.departmentId ? "Select course" : "Select department first"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.departmentId &&
                          courses
                            .filter((course) => course.departmentId === Number.parseInt(formData.departmentId))
                            .map((course) => (
                              <SelectItem key={course.id} value={course.id.toString()}>
                                {course.name}
                              </SelectItem>
                            ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester*</Label>
                    <Select
                      name="semester"
                      value={formData.semester.toString()}
                      onValueChange={(value) => handleSelectChange("semester", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => (
                          <SelectItem key={semester} value={semester.toString()}>
                            Semester {semester}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      name="status"
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter subject description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Subject</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this subject? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}
