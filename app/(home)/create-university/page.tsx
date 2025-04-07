import { CreateUniversityForm } from "../components/create-university-form";

export default function CreateUniversityPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="container max-w-3xl py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create University</h1>
          <p className="text-muted-foreground mt-2">Fill in the details below to add a new university to the system.</p>
        </div>
        <CreateUniversityForm />
      </div>
    </div>
  );
}
