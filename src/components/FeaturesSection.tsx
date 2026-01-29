import { 
  Link2, 
  Map, 
  Timer, 
  Brain, 
  BarChart3, 
  Moon 
} from "lucide-react";
import { FeatureCard } from "./FeatureCard";

const features = [
  {
    icon: Link2,
    title: "Universal URL Import",
    description: "Paste any YouTube playlist, course page, or resource list. We'll automatically detect and structure your learning content."
  },
  {
    icon: Map,
    title: "Smart Roadmaps",
    description: "Get a personalized day-by-day schedule that adapts to your pace. Drag, drop, and rebalance anytime."
  },
  {
    icon: Timer,
    title: "Focus Timer",
    description: "Built-in Pomodoro timer with customizable sessions. Stay in flow without watching the clock."
  },
  {
    icon: Brain,
    title: "AI Mentor",
    description: "Your personal learning coach. Get advice, reschedule sessions, and recover from missed days without guilt."
  },
  {
    icon: BarChart3,
    title: "Visual Progress",
    description: "Watch your progress grow with beautiful visualizations. Celebrate milestones and stay motivated."
  },
  {
    icon: Moon,
    title: "Focus Mode",
    description: "Distraction-free learning with dark mode and reduced motion. Study for hours without eye strain."
  }
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything you need to <span className="text-gradient-primary">learn better</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            A complete toolkit designed to help you learn anything efficiently, without the burnout.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
