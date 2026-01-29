import { ArrowRight, Sparkles, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";

export function LandingHero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(var(--primary)/0.08),_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(var(--accent)/0.06),_transparent_50%)]" />
      
      {/* Floating elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />

      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4" />
          <span>AI-Powered Learning</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up">
          <span className="text-foreground">Learn anything</span>
          <br />
          <span className="text-gradient-primary">without burnout</span>
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Transform any playlist or course into a personalized roadmap. 
          <span className="text-foreground font-medium"> Your AI mentor adapts to your pace.</span>
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <Link to="/signup">
            <Button variant="hero" size="xl" className="group">
              Start Learning
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Button variant="hero-outline" size="xl">
            <Play className="w-5 h-5 mr-2" />
            Watch Demo
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-20 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">10k+</div>
            <div className="text-sm text-muted-foreground">Active learners</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">500k</div>
            <div className="text-sm text-muted-foreground">Sessions completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-foreground">98%</div>
            <div className="text-sm text-muted-foreground">Completion rate</div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
