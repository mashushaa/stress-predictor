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
      // Mock response for demo
      const mockResponse = {
        stress_level: Math.floor(Math.random() * 3),
        probabilities: [
          Math.random() * 0.4,
          Math.random() * 0.6,
          Math.random() * 0.4
        ]
      };

      // Save questionnaire response to database
      const { error } = await supabase
        .from('questionnaire_responses')
        .insert({
          user_id: user.id,
          ...formData,
          stress_level: mockResponse.stress_level,
          probabilities: mockResponse.probabilities
        });

      if (error) throw error;

      // Store results in localStorage for the results page
      localStorage.setItem('stressPredictionResults', JSON.stringify(mockResponse));
      
      toast({
        title: "Successful",
        description: "Your answers are saved",
      });

      // Use window.location instead of navigate to avoid router issues
      window.location.href = '/results';
    } catch (error: any) {
      toast({
        title: "Error",
        description: "It was not possible to save the answers. Try it again.",
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
