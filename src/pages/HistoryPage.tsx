import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, ArrowLeft, Eye } from "lucide-react";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HistoryResult {
  id: string;
  created_at: string;
  probabilities: any; // JSON field from database
  anxiety_level?: number;
  self_esteem?: number;
  sleep_quality?: number;
  study_load?: number;
  social_support?: number;
}

const HistoryPage = () => {
  const { user, isLoading } = useAuth();
  const [history, setHistory] = useState<HistoryResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<HistoryResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('questionnaire_responses')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
        return;
      }

      setHistory(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStressLabel = (stressClass: number) => {
    switch (stressClass) {
      case 0: return { label: "Отсутствие стресса", color: "bg-green-500" };
      case 1: return { label: "Позитивный стресс", color: "bg-yellow-500" };
      case 2: return { label: "Негативный стресс", color: "bg-red-500" };
      default: return { label: "Неизвестно", color: "bg-gray-500" };
    }
  };

  const getChartData = () => {
    if (history.length === 0) return null;

    const chartHistory = [...history].reverse(); // Reverse to show chronological order

    return {
      labels: chartHistory.map(item => 
        format(new Date(item.created_at), 'dd.MM.yyyy', { locale: ru })
      ),
      datasets: [
        {
          label: 'Уровень стресса',
          data: chartHistory.map(item => item.probabilities?.predicted_class ?? 0),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: chartHistory.map(item => {
            const stressClass = item.probabilities?.predicted_class ?? 0;
            return stressClass === 0 ? '#10b981' : 
                   stressClass === 1 ? '#f59e0b' : '#ef4444';
          }),
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const stressClass = context.parsed.y;
            const { label } = getStressLabel(stressClass);
            return `Уровень стресса: ${label}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 2,
        ticks: {
          stepSize: 1,
          callback: (value: any) => {
            const { label } = getStressLabel(value);
            return label;
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 45
        }
      }
    }
  };

  const viewResult = (result: HistoryResult) => {
    // Store result data for ResultsPage
    const resultData = {
      stressLevel: getStressLabel(result.probabilities?.predicted_class ?? 0).label,
      stressClass: result.probabilities?.predicted_class ?? 0,
      confidence: Math.max(
        result.probabilities?.no_stress ?? 0,
        result.probabilities?.positive_stress ?? 0,
        result.probabilities?.negative_stress ?? 0
      ),
      probabilities: {
        no_stress: result.probabilities?.no_stress ?? 0,
        positive_stress: result.probabilities?.positive_stress ?? 0,
        negative_stress: result.probabilities?.negative_stress ?? 0
      },
      recommendations: "Исторический результат - рекомендации недоступны"
    };

    localStorage.setItem('predictionResults', JSON.stringify(resultData));
    window.location.href = '/results?from=history';
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    window.location.href = '/auth';
    return null;
  }

  const chartData = getChartData();

  return (
    <div className="min-h-screen bg-gradient-soft p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/'}
              className="bg-white/20 text-white border-white/30 hover:bg-white/30 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Главная
            </Button>
            <h1 className="text-3xl font-bold text-white">История результатов</h1>
          </div>
        </div>

        {history.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8 text-center">
              <p className="text-white text-lg">У вас пока нет результатов тестирования</p>
              <Button 
                onClick={() => window.location.href = '/questionnaire'}
                className="mt-4 bg-gradient-primary hover:shadow-medium"
              >
                Пройти тест
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Chart */}
            {chartData && (
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Динамика уровня стресса
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white/90 p-4 rounded-lg">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* History List */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  История прохождений ({history.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {history.map((result) => {
                  const stressInfo = getStressLabel(result.probabilities?.predicted_class ?? 0);
                  return (
                    <div 
                      key={result.id}
                      className="bg-white/20 backdrop-blur-sm p-4 rounded-lg border border-white/30 hover:bg-white/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="text-white">
                            <div className="font-medium">
                              {format(new Date(result.created_at), 'dd MMMM yyyy, HH:mm', { locale: ru })}
                            </div>
                            <div className="text-sm text-white/70 mt-1">
                              Результат тестирования
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <Badge 
                            className={`${stressInfo.color} text-white border-0`}
                          >
                            {stressInfo.label}
                          </Badge>
                          
                          <Button
                            size="sm"
                            onClick={() => viewResult(result)}
                            className="bg-gradient-primary hover:shadow-medium"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Просмотреть
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;