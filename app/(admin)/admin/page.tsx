"use client";
import { Loading } from "@/components/Loading";
import { useIsAdmin } from "../api/check-isAdmin";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useState } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetUniversityCreateRequest } from "../api/get-university-request";
import { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useApproveOrRejectUniversity } from "../api/use-approve-reject-university";
import { toast } from "sonner";
import { ConvexError } from "convex/values";
import { useConfirmModal } from "@/hooks/use-confirm-model";

export default function AdminPage() {
  const router = useRouter();
  type UniversityRequest = FunctionReturnType<
    typeof api.admin.getUniversityCreateRequests
  >[number];
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();
  const { data: requests, isLoading: requestsLoading } =
    useGetUniversityCreateRequest();

  const isLoading = isAdminLoading || requestsLoading;

  const { mutated, isPending } = useApproveOrRejectUniversity();

  const [confirmReject, ConfirmDialogReject] = useConfirmModal(
    "Are you sure?",
    "Are you sure you want to reject this request? This action cannot be undone."
  );
  const [confirmApprove, ConfirmDialogApprove] = useConfirmModal(
    "Are you sure?",
    "Are you sure you want to approve this request? This action cannot be undone."
  );

  const [selectedRequest, setSelectedRequest] =
    useState<UniversityRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (isAdmin === false) {
      router.replace("/"); // Redirect non-admin users
    }
  }, [isAdmin]);
  if (isLoading) {
    return <Loading />;
  }
  if (!isAdmin) {
    return <div>You are not authorized to access this page.</div>;
  }

  const handleViewRequest = (request: UniversityRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const handleApproveRequest = async(id: Id<"universityCreateRequest">) => {
    if (isPending) return;
    const request = requests?.find((request) => request.id === id);
    if (!request) return;
    const ok = await confirmApprove();
    if (!ok) return;
    mutated(
      {
        requestId: id,
        status: "approved",
      },
      {
        onSuccess: () => {
          toast.success("Request approved successfully", {
            description:
              "The university creation request has been approved by the admin.",
          });
        },
        : (error) => {
          const errorMessage =
            error instanceof ConvexError
           onError   ? (error.data as string)
              : "An error occurred";
          toast.error("Error approving request", {
            description: errorMessage,
          });
        },
        onSettled: () => {
          setIsDialogOpen(false);
          setSelectedRequest(null);
        },
      }
    );
  };

  const handleRejectRequest = async(id: Id<"universityCreateRequest">) => {
    if (isPending) return;
    const request = requests?.find((request) => request.id === id);
    if (!request) return;
    const ok = await confirmReject();
    if (!ok) return;
    mutated(
      {
        requestId: id,
        status: "rejected",
      },
      {
        onSuccess: () => {
          toast.success("Request rejected successfully", {
            description:
              "The university creation request has been rejected by the admin.",
          });
        },
        onError: (error) => {
          const errorMessage =
            error instanceof ConvexError
              ? (error.data as string)
              : "An error occurred";
          toast.error("Error rejecting request", {
            description: errorMessage,
          });
        },
        onSettled: () => {
          setIsDialogOpen(false);
          setSelectedRequest(null);
        },
      }
    );
  };

  const formatDate = (date: number) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return (
          <Badge
            variant="outline"
            className="border-yellow-500 text-yellow-500"
          >
            Pending
          </Badge>
        );
    }
  };

  const pendingRequests = requests?.filter(
    (request) => request.status === "pending"
  );
  const approvedRequests = requests?.filter(
    (request) => request.status === "approved"
  );
  const rejectedRequests = requests?.filter(
    (request) => request.status === "rejected"
  );
  return (
    <>
      <ConfirmDialogReject />
      <ConfirmDialogApprove />
      <main className="flex-1 p-6">
        <div className="container">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage university creation requests and system settings
            </p>
          </div>

          <Tabs defaultValue="pending">
            <TabsList className="mb-6">
              <TabsTrigger value="pending">
                Pending Requests
                {(pendingRequests ?? []).length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {pendingRequests?.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              {pendingRequests?.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-10">
                    <p className="text-center text-muted-foreground">
                      There are no pending university creation requests.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6">
                  {pendingRequests?.map((request) => (
                    <Card key={request.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle>{request.universityName}</CardTitle>
                          {getStatusBadge(request.status)}
                        </div>
                        <CardDescription>
                          Submitted by {request.userFullName} on{" "}
                          {formatDate(request.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {request.universityDescription}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => handleViewRequest(request)}
                        >
                          View Details
                        </Button>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            onClick={() => handleRejectRequest(request.id)}
                            disabled={isPending}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            className="bg-green-500 text-white hover:bg-green-600"
                            onClick={() => handleApproveRequest(request.id)}
                            disabled={isPending}
                          >
                            <Check className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="approved">
              <div className="grid gap-6">
                {approvedRequests?.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <p className="text-center text-muted-foreground">
                        There are no approved university creation requests.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  approvedRequests?.map((request) => (
                    <Card key={request.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle>{request.universityName}</CardTitle>
                          {getStatusBadge(request.status)}
                        </div>
                        <CardDescription>
                          Submitted by {request.userFullName} on{" "}
                          {formatDate(request.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {request.universityDescription}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          onClick={() => handleViewRequest(request)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="rejected">
              <div className="grid gap-6">
                {rejectedRequests?.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <p className="text-center text-muted-foreground">
                        There are no rejected university creation requests.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  rejectedRequests?.map((request) => (
                    <Card key={request.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle>{request.universityName}</CardTitle>
                          {getStatusBadge(request.status)}
                        </div>
                        <CardDescription>
                          Submitted by {request.userFullName} on{" "}
                          {formatDate(request.createdAt)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {request.universityDescription}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="outline"
                          onClick={() => handleViewRequest(request)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {selectedRequest && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedRequest.universityName}</DialogTitle>
              <DialogDescription>
                University creation request details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <div className="text-sm font-medium">Status</div>
                <div className="mt-1">
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Submitted By</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {selectedRequest.userFullName} ({selectedRequest.userEmail})
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Description</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {selectedRequest.universityDescription}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Address</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {selectedRequest.universityLocation}
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Website</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  <a
                    href={selectedRequest.universityWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    {selectedRequest.universityWebsite}
                  </a>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Submitted On</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {formatDate(selectedRequest.createdAt)}
                </div>
              </div>
            </div>
            {selectedRequest.status === "pending" && (
              <DialogFooter>
                <Button
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                  onClick={() => handleRejectRequest(selectedRequest.id)}
                  disabled={isPending}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  className="bg-green-500 text-white hover:bg-green-600"
                  onClick={() => handleApproveRequest(selectedRequest.id)}
                  disabled={isPending}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
