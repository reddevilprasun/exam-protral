import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle, School } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <>
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  The Complete Exam Management Solution
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Create your university, manage exams, and streamline the
                  entire examination process in one platform.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signUp">
                  <Button size="lg" className="gap-1">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#how-it-works">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[350px] w-full overflow-hidden rounded-xl bg-muted md:h-[450px]">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-purple-500/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="max-w-md space-y-4 rounded-xl bg-background/80 p-6 backdrop-blur">
                    <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>University request approved</span>
                    </div>
                    <h3 className="text-xl font-bold">Welcome to ExamPortal</h3>
                    <p className="text-sm text-muted-foreground">
                      Your university has been created successfully. You can now
                      start managing exams.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section
        id="features"
        className="w-full bg-muted/50 py-12 md:py-24 lg:py-32"
      >
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Everything You Need for Exam Management
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform provides a comprehensive solution for universities
                to manage their examination processes.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="rounded-lg border bg-background p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                How It Works
              </div>
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                Simple Process to Get Started
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Follow these simple steps to create your university and start
                managing exams.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center text-center"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-7 hidden h-0.5 w-full -translate-x-1/2 bg-border md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="w-full border-t bg-background py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row m-auto">
          <div className="flex items-center gap-2 font-bold">
            <School className="h-5 w-5" />
            <span>ExamPortal</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ExamPortal. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}

const features = [
  {
    icon: <School className="h-6 w-6 text-primary" />,
    title: "University Creation",
    description:
      "Create and manage your university profile with all necessary details.",
  },
  {
    icon: <BookOpen className="h-6 w-6 text-primary" />,
    title: "Exam Management",
    description: "Create, schedule, and manage exams with ease.",
  },
  {
    icon: <CheckCircle className="h-6 w-6 text-primary" />,
    title: "Result Processing",
    description: "Process and publish exam results efficiently.",
  },
  {
    icon: <ArrowRight className="h-6 w-6 text-primary" />,
    title: "Student Portal",
    description: "Provide students with access to exam schedules and results.",
  },
  {
    icon: <ArrowRight className="h-6 w-6 text-primary" />,
    title: "Admin Dashboard",
    description:
      "Comprehensive dashboard for administrators to manage the entire system.",
  },
  {
    icon: <ArrowRight className="h-6 w-6 text-primary" />,
    title: "Real-time Updates",
    description:
      "Get real-time updates on university creation requests and exam status.",
  },
];

const steps = [
  {
    title: "Register",
    description: "Create an account with your email and password.",
  },
  {
    title: "Create University",
    description: "Submit your university details for approval.",
  },
  {
    title: "Get Approved",
    description: "Admin reviews and approves your university request.",
  },
  {
    title: "Start Managing",
    description: "Begin managing exams and students.",
  },
];
