import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight } from "lucide-react";
import QuestionnaireSection, { Field } from "@/components/QuestionnaireSection";
import { QuestionnaireData } from "@/pages/QuestionnairePage";

interface QuestionnaireStepProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  fields: Field[];
  formData: QuestionnaireData;
  updateFormData: (key: keyof QuestionnaireData, value: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

const QuestionnaireStep = ({
  stepNumber,
  totalSteps,
  title,
  fields,
  formData,
  updateFormData,
  onNext,
  onPrevious,
  onSubmit,
  isLoading = false
}: QuestionnaireStepProps) => {
  // Calculate progress based on completed fields across all steps
  const totalFields = 20; // Total number of fields across all steps
  const completedFields = Object.values(formData).filter((value, index) => {
    // Check if field has been modified from default values
    const defaultValues = [0, 15, 0, 0, 0, 2, 3, 0, 2, 3, 4, 4, 3, 3, 3, 2, 3, 2, 2, 0];
    return value !== defaultValues[index];
  }).length;
  
  const progress = (completedFields / totalFields) * 100;

  // Check if current step fields are completed
  const isStepComplete = fields.every(field => {
    const value = formData[field.key];
    const defaultValues: Record<string, number> = {
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
    };
    return value !== defaultValues[field.key];
  });

  const isLastStep = stepNumber === totalSteps;

  return (
    <div className="min-h-screen bg-gradient-soft py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
            Stress Assessment - Step {stepNumber} of {totalSteps}
          </h1>
          
          <div className="max-w-md mx-auto mb-6">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>
          
          <p className="text-lg text-muted-foreground">
            Please answer all questions in this section honestly.
          </p>
        </div>

        <Card className="bg-gradient-card shadow-soft border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <QuestionnaireSection
              fields={fields}
              formData={formData}
              updateFormData={updateFormData}
            />
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            onClick={onPrevious}
            variant="outline"
            disabled={stepNumber === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </Button>

          {isLastStep ? (
            <Button
              onClick={onSubmit}
              disabled={!isStepComplete || isLoading}
              className="bg-gradient-primary hover:shadow-medium transition-all duration-300 flex items-center gap-2 px-8"
            >
              {isLoading ? 'Analyzing...' : 'Submit Assessment'}
            </Button>
          ) : (
            <Button
              onClick={onNext}
              disabled={!isStepComplete}
              className="bg-gradient-primary hover:shadow-medium transition-all duration-300 flex items-center gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireStep;