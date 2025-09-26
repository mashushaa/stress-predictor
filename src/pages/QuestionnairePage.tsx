import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import QuestionnaireStep from "@/components/QuestionnaireStep";
import { Field } from "@/components/QuestionnaireSection";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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
  const { user, isLoading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);
  const [formData, setFormData] = useState<QuestionnaireData>({
    anxiety_level: 0,
    self_esteem: 0,
    mental_health_history: 0,
    depression: 0,
    headache: 0,
    blood_pressure: 0,
    sleep_quality: 0,
    breathing_problem: 0,
    noise_level: 0,
    living_conditions: 0,
    safety: 0,
    basic_needs: 0,
    academic_performance: 0,
    study_load: 0,
    teacher_student_relationship: 0,
    future_career_concerns: 0,
    social_support: 0,
    peer_pressure: 0,
    extracurricular_activities: 0,
    bullying: 0,
  });

  const sections: { title: string; fields: Field[] }[] = [
    {
      title: "Psychological Factors",
      fields: [
        { key: 'anxiety_level', label: 'Rate your anxiety level over the past week: (0 = No anxiety, 21 = Severe anxiety)', min: 0, max: 21, step: 1 },
        { key: 'self_esteem', label: 'How confident do you feel about yourself and your abilities? (0 = Very low self-esteem, 30 = Very high self-esteem)', min: 0, max: 30, step: 1 },
        { key: 'mental_health_history', label: 'Have you ever been diagnosed with a mental health condition?', type: 'radio' as const },
        { key: 'depression', label: 'Rate your depression level over the past two weeks: (0 = No depression, 27 = Severe depression)', min: 0, max: 27, step: 1 }
      ]
    },
    {
      title: "Physiological Factors", 
      fields: [
        { key: 'headache', label: 'Rate the frequency of your headaches: (0 = Never, 5 = Daily)', min: 0, max: 5, step: 1 },
        { key: 'blood_pressure', label: 'What is your typical blood pressure level?', type: 'dropdown' as const, options: [
          { value: 1, label: 'Low' },
          { value: 2, label: 'Normal' },
          { value: 3, label: 'High' }
        ]},
        { key: 'sleep_quality', label: 'Rate your sleep quality: (1 = Very poor, 2 = Poor, 3 = Fair, 4 = Good, 5 = Excellent)', min: 0, max: 5, step: 1 },
        { key: 'breathing_problem', label: 'Rate your breathing comfort during daily activities: (1 = Very difficult, 2 = Difficult, 3 = Neutral, 4 = Easy, 5 = Very easy)', min: 0, max: 5, step: 1 }
      ]
    },
    {
      title: "Environmental Factors",
      fields: [
        { key: 'noise_level', label: 'Rate the noise level in your living/study environment: (1 = Very quiet, 2 = Quiet, 3 = Moderate, 4 = Loud, 5 = Very loud)', min: 0, max: 5, step: 1 },
        { key: 'living_conditions', label: 'Rate your overall living conditions: (1 = Very poor, 2 = Poor, 3 = Fair, 4 = Good, 5 = Excellent)', min: 0, max: 5, step: 1 },
        { key: 'safety', label: 'How safe do you feel in your living environment? (1 = Very unsafe, 2 = Unsafe, 3 = Neutral, 4 = Safe, 5 = Very safe)', min: 0, max: 5, step: 1 },
        { key: 'basic_needs', label: 'How often do you worry about meeting your basic needs? (0 = Never, 5 = Always', min: 0, max: 5, step: 1 }
      ]
    },
    {
      title: "Academic Factors",
      fields: [
        { key: 'academic_performance', label: 'Rate your current academic performance: (1 = Very poor, 2 = Poor, 3 = Average, 4 = Good, 5 = Excellent)', min: 0, max: 5, step: 1 },
        { key: 'study_load', label: 'How would you rate your current study workload? (1 = Very light, 2 = Light, 3 = Moderate, 4 = Heavy, 5 = Overwhelming)', min: 0, max: 5, step: 1 },
        { key: 'teacher_student_relationship', label: 'Rate your relationship with your teachers: (1 = Very poor, 2 = Poor, 3 = Fair, 4 = Good, 5 = Excellent)', min: 0, max: 5, step: 1 },
        { key: 'future_career_concerns', label: 'How worried are you about your future career prospects? (1 = Not worried at all, 2 = Slightly worried, 3 = Moderately worried, 4 = Very worried, 5 = Extremely worried)', min: 0, max: 5, step: 1 }
      ]
    },
    {
      title: "Social Factors",
      fields: [
        { key: 'social_support', label: 'Rate the level of social support you receive: (1 = Very low, 2 = Low, 3 = Moderate, 4 = High, 5 = Very high)', min: 0, max: 5, step: 1 },
        { key: 'peer_pressure', label: 'Rate the intensity of peer pressure you feel: (1 = None, 2 = Minimal, 3 = Moderate, 4 = High, 5 = Extreme)', min: 0, max: 5, step: 1 },
        { key: 'extracurricular_activities', label: 'Rate your satisfaction with your extracurricular involvement: (1 = Very dissatisfied, 2 = Dissatisfied, 3 = Neutral, 4 = Satisfied, 5 = Very satisfied)', min: 0, max: 5, step: 1 },
        { key: 'bullying', label: 'Have you experienced bullying in the past 6 months? (0 = Never, 5 = Constantly)', min: 0, max: 5, step: 1 }
      ]
    }
  ];

  const updateFormData = (key: keyof QuestionnaireData, value: number) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (currentStep < sections.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsLoading(true);

    try {
      // Call the stress prediction edge function
      const { data, error } = await supabase.functions.invoke('predict-stress', {
        body: {
          questionnaireData: formData,
          userId: user.id
        }
      });

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Не удалось получить результаты предсказания');
      }

      // Store results in localStorage for the results page
      localStorage.setItem('predictionResults', JSON.stringify(data));
      
      toast({
        title: "Успешно",
        description: "Ваши ответы обработаны и сохранены",
      });

      // Navigate to results page
      navigate('/results');
    } catch (error: any) {
      console.error('Error submitting questionnaire:', error);
      toast({
        title: "Ошибка",
        description: error.message || "Не удалось обработать ответы. Попробуйте снова.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const currentSection = sections[currentStep - 1];

  return (
    <QuestionnaireStep
      stepNumber={currentStep}
      totalSteps={sections.length}
      title={currentSection.title}
      fields={currentSection.fields}
      formData={formData}
      updateFormData={updateFormData}
      onNext={handleNext}
      onPrevious={handlePrevious}
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
};

export default QuestionnairePage;
