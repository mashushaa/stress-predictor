import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Brain, ArrowRight, Heart, Shield } from "lucide-react";
import cloudBackground from "@/assets/cloud-background.png";

const HomePage = () => {
  const handleStartClick = () => {
    // Use window.location for consistent navigation
    window.location.href = '/questionnaire';
  };

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Hero Section */}
      <div 
        className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${cloudBackground})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/90 rounded-full shadow-soft">
              <Brain className="w-12 h-12 text-primary" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
            Student Stress Predictor
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md">
            Answer a short questionnaire to assess your stress level and get personalized recommendations
          </p>
          
          <Button 
            onClick={handleStartClick}
            size="lg"
            className="bg-gradient-primary hover:shadow-medium transition-all duration-300 transform hover:scale-105 text-lg px-8 py-4 h-auto"
          >
            Start Questionnaire
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Your Mental Health Matters
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Our scientifically-based assessment helps identify stress levels and provides actionable insights for your wellbeing.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center bg-gradient-card shadow-soft border-0 hover:shadow-medium transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Scientific Assessment</h3>
              <p className="text-muted-foreground">
                Based on validated psychological and physiological stress indicators used in research.
              </p>
            </Card>
            
            <Card className="p-8 text-center bg-gradient-card shadow-soft border-0 hover:shadow-medium transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Personalized Care</h3>
              <p className="text-muted-foreground">
                Receive tailored recommendations based on your specific stress level and contributing factors.
              </p>
            </Card>
            
            <Card className="p-8 text-center bg-gradient-card shadow-soft border-0 hover:shadow-medium transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Privacy First</h3>
              <p className="text-muted-foreground">
                Your responses are processed securely and anonymously. No personal data is stored.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;