import { RegisterForm } from "../ui/register-form";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">University Exam Portal</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign up to access your exam portal</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}

