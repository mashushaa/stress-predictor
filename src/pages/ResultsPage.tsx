import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, ArrowLeft, TrendingUp, Heart, Brain } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PredictionResults {
  stress_level: number;
  probabilities: number[];
}

const ResultsPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<PredictionResults | null>(null);

  useEffect(() => {
    const storedResults = localStorage.getItem('stressPredictionResults');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      navigate('/questionnaire');
    }
  }, [navigate]);

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  const stressLabels = ['Low Stress', 'Medium Stress', 'High Stress'];
  const stressColors = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];
  const currentStressLevel = results.stress_level;
  const currentStressLabel = stressLabels[currentStressLevel];
  const currentStressColor = stressColors[currentStressLevel];

  const recommendations = {
    0: {
      title: "Great job maintaining low stress!",
      description: "Your stress level is low. Maintain a balanced lifestyle with regular exercise and hobbies.",
      tips: [
        "Continue your current stress management practices",
        "Maintain regular exercise and physical activity",
        "Keep pursuing hobbies and interests you enjoy",
        "Stay connected with friends and family",
        "Practice preventive self-care techniques"
      ]
    },
    1: {
      title: "Moderate stress detected",
      description: "Moderate stress detected. Try mindfulness techniques, time management, or talking to friends.",
      tips: [
        "Practice mindfulness and meditation techniques",
        "Improve your time management skills",
        "Talk to trusted friends or family members",
        "Consider establishing a regular sleep schedule",
        "Try relaxation techniques like deep breathing"
      ]
    },
    2: {
      title: "High stress level identified",
      description: "High stress detected. Seek support from a counselor, prioritize rest, and consider professional help.",
      tips: [
        "Consider reaching out to a mental health professional",
        "Prioritize rest and adequate sleep",
        "Connect with campus counseling services",
        "Practice stress-reduction techniques daily",
        "Don't hesitate to seek support from trusted individuals"
      ]
    }
  };

  const chartData = {
    labels: stressLabels,
    datasets: [
      {
        label: 'Probability',
        data: results.probabilities.map(p => (p * 100).toFixed(1)),
        backgroundColor: stressColors.map(color => color + '80'),
        borderColor: stressColors,
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Stress Level Probabilities',
        font: {
          size: 16,
          weight: 'bold' as const,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
  };

  const currentRecommendation = recommendations[currentStressLevel as keyof typeof recommendations];
  const confidencePercentage = (results.probabilities[currentStressLevel] * 100).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-soft py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Your Stress Assessment Results
          </h1>
          <p className="text-lg text-muted-foreground">
            Based on your responses, here's what we found
          </p>
        </div>

        <div className="grid gap-8">
          {/* Main Result Card */}
          <Card className="bg-gradient-card shadow-strong border-0">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <div 
                  className="p-4 rounded-full shadow-soft"
                  style={{ backgroundColor: currentStressColor + '20' }}
                >
                  <Brain className="w-12 h-12" style={{ color: currentStressColor }} />
                </div>
              </div>
              <CardTitle className="text-2xl text-foreground">
                Predicted Stress Level
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <Badge 
                className="text-lg px-6 py-2 mb-4"
                style={{ 
                  backgroundColor: currentStressColor,
                  color: 'white'
                }}
              >
                {currentStressLabel}
              </Badge>
              <p className="text-muted-foreground mb-4">
                Confidence: {confidencePercentage}%
              </p>
              <Progress 
                value={parseFloat(confidencePercentage)} 
                className="w-full max-w-xs mx-auto h-3"
              />
            </CardContent>
          </Card>

          {/* Probability Chart */}
          <Card className="bg-gradient-card shadow-soft border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="w-5 h-5" />
                Probability Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-gradient-card shadow-soft border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Heart className="w-5 h-5" />
                {currentRecommendation.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                {currentRecommendation.description}
              </p>
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Recommended Actions:</h4>
                <ul className="space-y-2">
                  {currentRecommendation.tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-muted-foreground">
                      <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/questionnaire')}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Retake Questionnaire
            </Button>
            <Button
              onClick={() => navigate('/')}
              size="lg"
              className="bg-gradient-primary hover:shadow-medium transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;