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
  stressLevel: string;
  stressClass: number;
  recommendations: string;
  confidence: number;
  probabilities: {
    no_stress: number;
    positive_stress: number;
    negative_stress: number;
  };
}

const ResultsPage = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState<PredictionResults | null>(null);

  useEffect(() => {
    const storedResults = localStorage.getItem('stressPredictionResults');
    if (storedResults) {
      setResults(JSON.parse(storedResults));
    } else {
      window.location.href = '/questionnaire';
    }
  }, []);

  if (!results) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  const stressLabels = ['Отсутствие стресса', 'Позитивный стресс', 'Негативный стресс'];
  const stressColors = ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];
  const currentStressLevel = results.stressClass;
  const currentStressLabel = results.stressLevel;
  const currentStressColor = stressColors[currentStressLevel];

  const chartData = {
    labels: stressLabels,
    datasets: [
      {
        label: 'Вероятность',
        data: [results.probabilities.no_stress, results.probabilities.positive_stress, results.probabilities.negative_stress],
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
        text: 'Распределение вероятностей стресса',
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

  const confidencePercentage = results.confidence;

  return (
    <div className="min-h-screen bg-gradient-soft py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Результаты анализа стресса
          </h1>
          <p className="text-lg text-muted-foreground">
            На основе ваших ответов мы получили следующие результаты
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
                Прогноз уровня стресса
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
                Уверенность: {confidencePercentage}%
              </p>
              <Progress 
                value={confidencePercentage} 
                className="w-full max-w-xs mx-auto h-3"
              />
            </CardContent>
          </Card>

          {/* Probability Chart */}
          <Card className="bg-gradient-card shadow-soft border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <TrendingUp className="w-5 h-5" />
                Распределение вероятностей
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          {/* Personalized Recommendations */}
          <Card className="bg-gradient-card shadow-soft border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Heart className="w-5 h-5" />
                Персональные рекомендации
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                {results.recommendations}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.location.href = '/questionnaire'}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Пройти тест заново
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              size="lg"
              className="bg-gradient-primary hover:shadow-medium transition-all duration-300 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              На главную
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;