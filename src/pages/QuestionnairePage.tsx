import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import QuestionnaireSection, { Field } from "@/components/QuestionnaireSection";
import { Loader2 } from "lucide-react";

export interface QuestionnaireData {
  anxiety_level: number;
  self_esteem: number;
  mental_health_history: number;
  depression: number;
  headache: number;
  blood_pressure: number;
  sleep_quality: number;
  breathing_problem: number;
  noise_level: number;
  living_conditions: number;
  safety: number;
  basic_needs: number;
  academic_performance: number;
  study_load: number;
  teacher_student_relationship: number;
  future_career_concerns: number;
  social_support: number;
  peer_pressure: number;
  extracurricular_activities: number;
  bullying: number;
}

const QuestionnairePage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<QuestionnaireData>({
    anxiety_level: 0,
    self_esteem: 15,
    mental_health_history: 0,
    depression: 0,
    headache: 0,
    blood_pressure: 2,
    sleep_quality: 3,
    breathing_problem: 0,
    noise_level: 2,
    living_conditions: 3,
    safety: 4,
    basic_needs: 4,
    academic_performance: 3,
    study_load: 3,
    teacher_student_relationship: 3,
    future_career_concerns: 2,
    social_support: 3,
    peer_pressure: 2,
    extracurricular_activities: 2,
    bullying: 0,
  });

  const sections: { title: string; fields: Field[] }[] = [
    {
      title: "Psychological Factors",
      fields: [
        { key: 'anxiety_level', label: 'Anxiety Level', min: 0, max: 21, step: 1 },
        { key: 'self_esteem', label: 'Self Esteem', min: 0, max: 30, step: 1 },
        { key: 'mental_health_history', label: 'Mental Health History', type: 'radio' as const },
        { key: 'depression', label: 'Depression', min: 0, max: 27, step: 1 }
      ]
    },
    {
      title: "Physiological Factors", 
      fields: [
        { key: 'headache', label: 'Headache', min: 0, max: 5, step: 1 },
        { key: 'blood_pressure', label: 'Blood Pressure', type: 'dropdown' as const, options: [
          { value: 1, label: 'Low' },
          { value: 2, label: 'Normal' },
          { value: 3, label: 'High' }
        ]},
        { key: 'sleep_quality', label: 'Sleep Quality', min: 0, max: 5, step: 1 },
        { key: 'breathing_problem', label: 'Breathing Problem', min: 0, max: 5, step: 1 }
      ]
    },
    {
      title: "Environmental Factors",
      fields: [
        { key: 'noise_level', label: 'Noise Level', min: 0, max: 5, step: 1 },
        { key: 'living_conditions', label: 'Living Conditions', min: 0, max: 5, step: 1 },
        { key: 'safety', label: 'Safety', min: 0, max: 5, step: 1 },
        { key: 'basic_needs', label: 'Basic Needs', min: 0, max: 5, step: 1 }
      ]
    },
    {
      title: "Academic Factors",
      fields: [
        { key: 'academic_performance', label: 'Academic Performance', min: 0, max: 5, step: 1 },
        { key: 'study_load', label: 'Study Load', min: 0, max: 5, step: 1 },
        { key: 'teacher_student_relationship', label: 'Teacher-Student Relationship', min: 0, max: 5, step: 1 },
        { key: 'future_career_concerns', label: 'Future Career Concerns', min: 0, max: 5, step: 1 }
      ]
    },
    {
      title: "Social Factors",
      fields: [
        { key: 'social_support', label: 'Social Support', min: 0, max: 5, step: 1 },
        { key: 'peer_pressure', label: 'Peer Pressure', min: 0, max: 5, step: 1 },
        { key: 'extracurricular_activities', label: 'Extracurricular Activities', min: 0, max: 5, step: 1 },
        { key: 'bullying', label: 'Bullying', min: 0, max: 5, step: 1 }
      ]
    }
  ];

  const totalFields = sections.reduce((acc, section) => acc + section.fields.length, 0);
  const completedFields = Object.keys(formData).length;
  const progress = (completedFields / totalFields) * 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock response for demo
      const mockResponse = {
        stress_level: Math.floor(Math.random() * 3),
        probabilities: [
          Math.random() * 0.4,
          Math.random() * 0.6,
          Math.random() * 0.4
        ]
      };

      // Store results in localStorage for the results page
      localStorage.setItem('stressPredictionResults', JSON.stringify(mockResponse));
      
      navigate('/results');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process your assessment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (key: keyof QuestionnaireData, value: number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-soft py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Stress Assessment Questionnaire
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Please answer all questions honestly. This will help us provide you with accurate results.
          </p>
          
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {sections.map((section, index) => (
            <Card key={index} className="bg-gradient-card shadow-soft border-0">
              <CardHeader>
                <CardTitle className="text-xl text-foreground">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <QuestionnaireSection
                  fields={section.fields}
                  formData={formData}
                  updateFormData={updateFormData}
                />
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-center pt-6">
            <Button 
              type="submit" 
              disabled={isLoading}
              size="lg"
              className="bg-gradient-primary hover:shadow-medium transition-all duration-300 px-12 py-3 h-auto text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Submit Assessment'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionnairePage;