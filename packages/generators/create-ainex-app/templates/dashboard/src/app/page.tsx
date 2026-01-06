"use client";

import { Container } from "@ainexsuite/ui/layout/container";
import { useAuth } from "@ainexsuite/auth";
import { StickyNote, BookOpen, CheckSquare, Calendar, Camera, TrendingUp, Heart, Dumbbell } from "lucide-react";
import Link from "next/link";

const apps = [
  {
    name: "Notes",
    slug: "notes",
    icon: StickyNote,
    color: "bg-orange-500",
    description: "Capture ideas and organize thoughts",
    domain: "notes.ainexspace.com",
  },
  {
    name: "Journal",
    slug: "journal",
    icon: BookOpen,
    color: "bg-blue-500",
    description: "Daily reflections and mood tracking",
    domain: "journal.ainexspace.com",
  },
  {
    name: "Todo",
    slug: "todo",
    icon: CheckSquare,
    color: "bg-green-500",
    description: "Task management and productivity",
    domain: "todo.ainexspace.com",
  },
  {
    name: "Health",
    slug: "health",
    icon: Calendar,
    color: "bg-emerald-500",
    description: "Body metrics and wellness tracking",
    domain: "health.ainexspace.com",
  },
  {
    name: "Moments",
    slug: "moments",
    icon: Camera,
    color: "bg-pink-500",
    description: "Photo journal and memories",
    domain: "moments.ainexspace.com",
  },
  {
    name: "Grow",
    slug: "grow",
    icon: TrendingUp,
    color: "bg-yellow-500",
    description: "Learning goals and progress",
    domain: "grow.ainexspace.com",
  },
  {
    name: "Pulse",
    slug: "pulse",
    icon: Heart,
    color: "bg-red-500",
    description: "Health metrics and wellness",
    domain: "pulse.ainexspace.com",
  },
  {
    name: "Fit",
    slug: "fit",
    icon: Dumbbell,
    color: "bg-cyan-500",
    description: "Workout tracking and fitness",
    domain: "fit.ainexspace.com",
  },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Container variant="wide">
        <div className="flex items-center justify-center py-20">
          <div className="text-ink-600">Loading...</div>
        </div>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container variant="wide">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-ink-900">Welcome to AINexSuite</h1>
            <p className="mt-4 text-lg text-ink-600">
              Your complete productivity suite with AI assistance
            </p>
            <p className="mt-2 text-ink-600">Please sign in to continue</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container variant="wide">
      <div className="space-y-8 py-8">
        {/* Page Header */}
        <header>
          <h1 className="text-4xl font-semibold text-ink-900">Your AINex Suite</h1>
          <p className="mt-2 text-lg text-ink-600">
            Welcome back, {user.displayName || user.email}
          </p>
          <p className="mt-1 text-sm text-ink-500">
            All your productivity tools in one place
          </p>
        </header>

        {/* App Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {apps.map((app) => (
            <Link
              key={app.slug}
              href={`https://${app.domain}`}
              className="group surface-card rounded-xl p-6 transition-all hover:scale-105 hover:shadow-xl"
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg ${app.color} text-white`}
                >
                  <app.icon className="h-6 w-6" />
                </div>
              </div>

              <h3 className="mt-4 text-xl font-semibold text-ink-900 group-hover:text-accent-500">
                {app.name}
              </h3>
              <p className="mt-2 text-sm text-ink-600">{app.description}</p>

              <div className="mt-4 flex items-center text-xs text-ink-500">
                <span className="truncate">{app.domain}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Activity Feed Section (placeholder) */}
        <section className="surface-card rounded-xl p-6">
          <h2 className="text-xl font-semibold text-ink-900">Recent Activity</h2>
          <p className="mt-2 text-sm text-ink-600">
            Your activity across all apps will appear here
          </p>
        </section>
      </div>
    </Container>
  );
}
