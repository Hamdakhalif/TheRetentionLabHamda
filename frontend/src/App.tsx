import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import Nav from "@/components/lab/Nav";
import Hero from "@/components/lab/Hero";
import Competitive from "@/components/lab/Competitive";
import CohortLab from "@/components/lab/CohortLab";
import RescueStudio from "@/components/lab/RescueStudio";
import LifecycleStudio from "@/components/lab/LifecycleStudio";
import Experiments from "@/components/lab/Experiments";
import ClvSimulator from "@/components/lab/ClvSimulator";
import HciLab from "@/components/lab/HciLab";
import About from "@/components/lab/About";
import Roadmap from "@/components/lab/Roadmap";

export default function App() {
  return (
    <div className="min-h-screen bg-ivory text-espresso">
      <Nav />
      <main>
        <Hero />
        <Competitive />
        <CohortLab />
        <RescueStudio />
        <LifecycleStudio />
        <Experiments />
        <ClvSimulator />
        <HciLab />
        <About />
        <Roadmap />
      </main>
      <Toaster position="bottom-center" />
    </div>
  );
}
