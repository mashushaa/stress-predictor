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
import { enUS } from 'date-fns/locale';

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
  recommendations?: string; // Recommendations from database
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
      case 0: return { label: "No Stress", color: "bg-green-500" };
      case 1: return { label: "Positive Stress", color: "bg-yellow-500" };
      case 2: return { label: "Negative Stress", color: "bg-red-500" };
      default: return { label: "Unknown", color: "bg-gray-500" };
    }
  };

  const getChartData = () => {
    if (history.length === 0) return null;

    const chartHistory = [...history].reverse(); // Reverse to show chronological order

    return {
      labels: chartHistory.map(item => 
        format(new Date(item.created_at), 'dd.MM.yyyy', { locale: enUS })
      ),
      datasets: [
        {
          label: 'Stress Level',
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
            return `Stress Level: ${label}`;
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
    console.log('Raw probabilities from DB:', result.probabilities);
    
    const maxProbability = Math.max(
      result.probabilities?.no_stress ?? 0,
      result.probabilities?.positive_stress ?? 0,
      result.probabilities?.negative_stress ?? 0
    );
    
    const resultData = {
      stressLevel: getStressLabel(result.probabilities?.predicted_class ?? 0).label,
      stressClass: result.probabilities?.predicted_class ?? 0,
      confidence: Math.round(maxProbability * 100),
      probabilities: {
        no_stress: Math.round((result.probabilities?.no_stress ?? 0) * 100),
        positive_stress: Math.round((result.probabilities?.positive_stress ?? 0) * 100),
        negative_stress: Math.round((result.probabilities?.negative_stress ?? 0) * 100)
      },
      recommendations: result.recommendations || result.probabilities?.recommendations || "Recommendations are not available for this result"
    };

    console.log('Converted probabilities (%):', resultData.probabilities);
    console.log('Confidence:', resultData.confidence);
    
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="py-8 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/'}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Button>
              <h1 className="text-3xl font-bold text-foreground">Results History</h1>
            </div>
          </div>

          {history.length === 0 ? (
            <Card className="bg-gradient-card shadow-soft border-0">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground text-lg">You don't have any test results yet</p>
                <Button 
                  onClick={() => window.location.href = '/questionnaire'}
                  className="mt-4 bg-gradient-primary hover:shadow-medium"
                >
                  Take Test
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* Chart */}
              {chartData && (
                <Card className="bg-gradient-card shadow-soft border-0">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Stress Level Dynamics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white p-4 rounded-lg">
                      <div className="h-48">
                        <Line data={chartData} options={chartOptions} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* History List */}
              <Card className="bg-gradient-card shadow-soft border-0">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Test History ({history.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {history.map((result) => {
                    const stressInfo = getStressLabel(result.probabilities?.predicted_class ?? 0);
                    return (
                      <div 
                        key={result.id}
                        className="bg-white/50 p-4 rounded-lg border border-gray-200 hover:bg-white/70 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-foreground">
                              <div className="font-medium">
                                {format(new Date(result.created_at), 'dd MMMM yyyy, HH:mm', { locale: enUS })}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Test Result
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
                              View
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

      {/* Features Section Background */}
      <div className="py-20 px-4 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Track Your Mental Health Journey
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Monitor your stress levels over time and see how your wellbeing evolves with our comprehensive tracking system.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center bg-gradient-card shadow-soft border-0 hover:shadow-medium transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Progress Tracking</h3>
              <p className="text-muted-foreground">
                Visualize your stress level changes over time with detailed charts and trend analysis.
              </p>
            </Card>
            
            <Card className="p-8 text-center bg-gradient-card shadow-soft border-0 hover:shadow-medium transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Historical Data</h3>
              <p className="text-muted-foreground">
                Access all your previous assessments and compare results to understand your patterns.
              </p>
            </Card>
            
            <Card className="p-8 text-center bg-gradient-card shadow-soft border-0 hover:shadow-medium transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Detailed Insights</h3>
              <p className="text-muted-foreground">
                Review specific test results and recommendations to better understand your mental health.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;