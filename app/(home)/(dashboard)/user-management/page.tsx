"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Copy,
  Filter,
  GraduationCap,
  LayoutDashboard,
  Mail,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  Trash,
  UserPlus,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, BarChart, Settings } from "lucide-react";

// Mock data for university users
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "supervisor",
    department: "Computer Science",
    status: "active",
    createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
    lastLogin: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "teacher",
    department: "Computer Science",
    status: "active",
    createdAt: Date.now() - 25 * 24 * 60 * 60 * 1000,
    lastLogin: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert@example.com",
    role: "teacher",
    department: "Electrical Engineering",
    status: "active",
    createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
    lastLogin: Date.now() - 3 * 24 * 60 * 60 * 1000,
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    role: "exam_controller",
    department: "Administration",
    status: "active",
    createdAt: Date.now() - 15 * 24 * 60 * 60 * 1000,
    lastLogin: Date.now() - 1 * 24 * 60 * 60 * 1000,
  },
  {
    id: "5",
    name: "Michael Brown",
    email: "michael@example.com",
    role: "teacher",
    department: "Business Administration",
    status: "pending",
    createdAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    lastLogin: null,
  },
  {
    id: "6",
    name: "Sarah Wilson",
    email: "sarah@example.com",
    role: "supervisor",
    department: "Physics",
    status: "pending",
    createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    lastLogin: null,
  },
];

// Mock data for departments
const mockDepartments = [
  { id: "1", name: "Computer Science" },
  { id: "2", name: "Electrical Engineering" },
  { id: "3", name: "Mechanical Engineering" },
  { id: "4", name: "Physics" },
  { id: "5", name: "Business Administration" },
  { id: "6", name: "Administration" },
];

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState(mockUsers);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isInvitationDialogOpen, setIsInvitationDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentInvitation, setCurrentInvitation] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "teacher",
    department: "",
    sendInvitation: true,
    customMessage: "",
  });


  const handleAddUser = () => {
    if (
      !newUser.name ||
      !newUser.email ||
      !newUser.role ||
      !newUser.department
    ) {
      return;
    }

    //INFO: Generate a random invitation token
    const invitationToken = Math.random().toString(36).substring(2, 15);

    // Create new user
    const newUserData = {
      id: `new-${Date.now()}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      department: newUser.department,
      status: "pending",
      createdAt: Date.now(),
      lastLogin: null,
    };

    setUsers([...users, newUserData]);

    // Close the add user dialog
    setIsAddUserDialogOpen(false);

    // If send invitation is enabled, show the invitation dialog
    if (newUser.sendInvitation) {
      setCurrentInvitation({
        user: newUserData,
        token: invitationToken,
        invitationLink: `${window.location.origin}/register/complete?token=${invitationToken}&email=${encodeURIComponent(newUser.email)}`,
      });
      setIsInvitationDialogOpen(true);
    } else {
      // toast({
      //   title: "User added",
      //   description: `${newUser.name} has been added as a ${getRoleLabel(newUser.role)}.`,
      //   duration: 3000,
      // })
    }

    // Reset form
    setNewUser({
      name: "",
      email: "",
      role: "teacher",
      department: "",
      sendInvitation: true,
      customMessage: "",
    });
  };

  const handleDeleteUser = (id: string) => {
    // Check if user is a supervisor
    const userToDelete = users.find((user) => user.id === id);

    if (
      userToDelete?.role === "supervisor" &&
      userToDelete.status === "active"
    ) {
      // Count active supervisors
      const activeSupervisors = users.filter(
        (u) => u.role === "supervisor" && u.status === "active"
      ).length;

      if (activeSupervisors <= 1) {
        // toast({
        //   title: "Cannot delete supervisor",
        //   description: "You cannot delete the last active supervisor account.",
        //   variant: "destructive",
        //   duration: 3000,
        // })
        return;
      }
    }

    setUsers(users.filter((user) => user.id !== id));

    // toast({
    //   title: "User deleted",
    //   description: "The user has been removed from your university.",
    //   duration: 3000,
    // })
  };

  const handleResendInvitation = (user: any) => {
    // Generate a new invitation token
    const invitationToken = Math.random().toString(36).substring(2, 15);

    setCurrentInvitation({
      user,
      token: invitationToken,
      invitationLink: `${window.location.origin}/register/complete?token=${invitationToken}&email=${encodeURIComponent(user.email)}`,
    });
    setIsInvitationDialogOpen(true);
  };

  const handleCopyInvitationLink = () => {
    if (currentInvitation) {
      navigator.clipboard.writeText(currentInvitation.invitationLink);
      // toast({
      //   title: "Link copied",
      //   description: "Invitation link copied to clipboard.",
      //   duration: 3000,
      // })
    }
  };

  const handleSendInvitationEmail = () => {
    // In a real app, this would send an email
    // toast({
    //   title: "Invitation sent",
    //   description: `An invitation email has been sent to ${currentInvitation.user.email}.`,
    //   duration: 3000,
    // })
    setIsInvitationDialogOpen(false);
  };

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return "Never";

    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "supervisor":
        return "Supervisor";
      case "teacher":
        return "Teacher";
      case "exam_controller":
        return "Exam Controller";
      case "student":
        return "Student";
      default:
        return role;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "supervisor":
        return <Badge className="bg-purple-500">Supervisor</Badge>;
      case "teacher":
        return <Badge className="bg-blue-500">Teacher</Badge>;
      case "exam_controller":
        return <Badge className="bg-amber-500">Exam Controller</Badge>;
      case "student":
        return <Badge className="bg-green-500">Student</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "pending":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Pending
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-500">
            Inactive
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter users based on search query and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch = searchQuery
      ? user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesRole = roleFilter === "all" ? true : user.role === roleFilter;
    const matchesDepartment =
      departmentFilter === "all" ? true : user.department === departmentFilter;
    const matchesStatus =
      statusFilter === "all" ? true : user.status === statusFilter;

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  // Get counts for each role
  const userCounts = {
    all: users.length,
    supervisor: users.filter((user) => user.role === "supervisor").length,
    teacher: users.filter((user) => user.role === "teacher").length,
    exam_controller: users.filter((user) => user.role === "exam_controller")
      .length,
    student: users.filter((user) => user.role === "student").length,
  };

  return (
    <>
      <div className="p-6">
        <div className="container">

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold">{userCounts.all}</p>
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
                    Supervisors
                  </p>
                  <p className="text-2xl font-bold">{userCounts.supervisor}</p>
                </div>
                <div className="rounded-full bg-purple-500/10 p-2 text-purple-500">
                  <Shield className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Teachers
                  </p>
                  <p className="text-2xl font-bold">{userCounts.teacher}</p>
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
                    Exam Controllers
                  </p>
                  <p className="text-2xl font-bold">
                    {userCounts.exam_controller}
                  </p>
                </div>
                <div className="rounded-full bg-amber-500/10 p-2 text-amber-500">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="supervisor">Supervisors</SelectItem>
                    <SelectItem value="teacher">Teachers</SelectItem>
                    <SelectItem value="exam_controller">
                      Exam Controllers
                    </SelectItem>
                    <SelectItem value="student">Students</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={departmentFilter}
                  onValueChange={setDepartmentFilter}
                >
                  <SelectTrigger className="w-[160px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {mockDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => setIsAddUserDialogOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>

          <Tabs defaultValue="all">
            <TabsList className="mb-6">
              <TabsTrigger value="all">
                All Users
                <Badge variant="secondary" className="ml-2">
                  {userCounts.all}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            No users found matching your criteria.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">
                              {user.name}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell>{user.department}</TableCell>
                            <TableCell>{getStatusBadge(user.status)}</TableCell>
                            <TableCell>{formatDate(user.createdAt)}</TableCell>
                            <TableCell>{formatDate(user.lastLogin)}</TableCell>
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
                                      router.push(`/user-management/${user.id}`)
                                    }
                                  >
                                    View Details
                                  </DropdownMenuItem>
                                  {user.status === "pending" && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleResendInvitation(user)
                                      }
                                    >
                                      Resend Invitation
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    Delete User
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
            </TabsContent>

            <TabsContent value="active">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Login</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.filter((user) => user.status === "active")
                        .length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No active users found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers
                          .filter((user) => user.status === "active")
                          .map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                {user.name}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{getRoleBadge(user.role)}</TableCell>
                              <TableCell>{user.department}</TableCell>
                              <TableCell>
                                {formatDate(user.createdAt)}
                              </TableCell>
                              <TableCell>
                                {formatDate(user.lastLogin)}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                      Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        router.push(
                                          `/user-management/${user.id}`
                                        )
                                      }
                                    >
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-destructive focus:text-destructive"
                                      onClick={() => handleDeleteUser(user.id)}
                                    >
                                      Delete User
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
            </TabsContent>

            <TabsContent value="pending">
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.filter((user) => user.status === "pending")
                        .length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No pending invitations found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredUsers
                          .filter((user) => user.status === "pending")
                          .map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                {user.name}
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{getRoleBadge(user.role)}</TableCell>
                              <TableCell>{user.department}</TableCell>
                              <TableCell>
                                {formatDate(user.createdAt)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResendInvitation(user)}
                                  >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Resend
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteUser(user.id)}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Add a new user to your university. They will receive an email
              invitation to complete their registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="exam_controller">
                    Exam Controller
                  </SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={newUser.department}
                onValueChange={(value) =>
                  setNewUser({ ...newUser, department: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {mockDepartments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="send-invitation"
                checked={newUser.sendInvitation}
                onCheckedChange={(checked) =>
                  setNewUser({ ...newUser, sendInvitation: checked })
                }
              />
              <Label htmlFor="send-invitation">Send invitation email</Label>
            </div>
            {newUser.sendInvitation && (
              <div className="space-y-2">
                <Label htmlFor="custom-message">
                  Custom Message (Optional)
                </Label>
                <Textarea
                  id="custom-message"
                  value={newUser.customMessage}
                  onChange={(e) =>
                    setNewUser({ ...newUser, customMessage: e.target.value })
                  }
                  placeholder="Add a personal message to the invitation email..."
                  rows={3}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddUserDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invitation Dialog */}
      <Dialog
        open={isInvitationDialogOpen}
        onOpenChange={setIsInvitationDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>User Invitation</DialogTitle>
            <DialogDescription>
              {currentInvitation?.user?.name} has been added as a{" "}
              {currentInvitation?.user?.role &&
                getRoleLabel(currentInvitation.user.role)}
              . Send them an invitation to complete their registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-md bg-muted p-4">
              <div className="mb-2 text-sm font-medium">Invitation Link</div>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={currentInvitation?.invitationLink || ""}
                  className="h-9 font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyInvitationLink}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                This link will expire in 7 days. The user will need to set their
                password and complete their profile.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInvitationDialogOpen(false)}
            >
              Close
            </Button>
            <Button onClick={handleSendInvitationEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Send Email Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
