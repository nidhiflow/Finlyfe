import { useState } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Sparkles, ScanLine, TrendingUp, Target } from "lucide-react";

export function OnboardingScreen() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: Sparkles,
      gradient: "from-[#7C5CFF] to-[#9D7EFF]",
      title: "Welcome to Finly",
      description: "Your AI-powered personal finance companion that makes managing money effortless and intelligent.",
    },
    {
      icon: ScanLine,
      gradient: "from-[#4CC9F0] to-[#7C5CFF]",
      title: "Smart Receipt Scanning",
      description: "Simply snap a photo of your receipt and let AI automatically extract and categorize every expense.",
    },
    {
      icon: TrendingUp,
      gradient: "from-[#7C5CFF] to-[#F72585]",
      title: "Track Every Penny",
      description: "Get real-time insights into your spending habits with beautiful reports and analytics.",
    },
    {
      icon: Target,
      gradient: "from-[#4CC9F0] to-[#3A86FF]",
      title: "Achieve Your Goals",
      description: "Set budgets, track goals, and receive personalized recommendations to reach your financial dreams.",
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handleSkip = () => {
    navigate("/login");
  };

  const handleGetStarted = () => {
    navigate("/signup");
  };

  const currentSlideData = slides[currentSlide];
  const Icon = currentSlideData.icon;
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <div className="min-h-screen bg-[#0D0F14] flex flex-col">
      <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
        {/* Skip Button */}
        {!isLastSlide && (
          <div className="flex justify-end px-6 pt-6">
            <button
              onClick={handleSkip}
              className="text-white/50 text-sm font-medium hover:text-white/70 transition-colors"
            >
              Skip
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {/* Icon */}
          <div className="relative mb-12">
            {/* Animated background blur */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentSlideData.gradient} opacity-20 blur-3xl scale-150 animate-pulse`} />
            
            {/* Icon container */}
            <div className={`relative w-32 h-32 rounded-3xl bg-gradient-to-br ${currentSlideData.gradient} flex items-center justify-center shadow-2xl shadow-[#7C5CFF]/30`}>
              <Icon className="w-16 h-16 text-white" strokeWidth={1.5} />
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-4 leading-tight">
              {currentSlideData.title}
            </h1>
            <p className="text-white/60 text-base leading-relaxed max-w-sm mx-auto">
              {currentSlideData.description}
            </p>
          </div>

          {/* Pagination Dots */}
          <div className="flex gap-2 mb-12">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? "w-8 bg-[#7C5CFF]"
                    : "w-2 bg-white/20"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="px-6 pb-8 space-y-3">
          {!isLastSlide ? (
            <button
              onClick={handleNext}
              className="w-full py-4 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-2xl text-white font-semibold shadow-lg shadow-[#7C5CFF]/30 hover:shadow-[#7C5CFF]/50 transition-all flex items-center justify-center gap-2"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <>
              <button
                onClick={handleGetStarted}
                className="w-full py-4 bg-gradient-to-r from-[#7C5CFF] to-[#9D7EFF] rounded-2xl text-white font-semibold shadow-lg shadow-[#7C5CFF]/30 hover:shadow-[#7C5CFF]/50 transition-all"
              >
                Get Started
              </button>
              <button
                onClick={handleSkip}
                className="w-full py-4 bg-[#1B2130] border border-white/10 rounded-2xl text-white font-semibold hover:border-white/20 transition-colors"
              >
                I Already Have an Account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
