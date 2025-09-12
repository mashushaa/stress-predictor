import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QuestionnaireData } from "@/pages/QuestionnairePage";

export interface Field {
  key: keyof QuestionnaireData;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  type?: 'slider' | 'radio' | 'dropdown';
  options?: { value: number; label: string }[];
}

interface QuestionnaireSectionProps {
  fields: Field[];
  formData: QuestionnaireData;
  updateFormData: (key: keyof QuestionnaireData, value: number) => void;
}

const QuestionnaireSection = ({ fields, formData, updateFormData }: QuestionnaireSectionProps) => {
  return (
    <div className="grid gap-6">
      {fields.map((field) => (
        <div key={field.key} className="space-y-3">
          <Label className="text-base font-medium text-foreground">
            {field.label}
          </Label>
          
          {field.type === 'radio' ? (
            <RadioGroup
              value={formData[field.key].toString()}
              onValueChange={(value) => updateFormData(field.key, parseInt(value))}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0" id={`${field.key}-no`} />
                <Label htmlFor={`${field.key}-no`}>No</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1" id={`${field.key}-yes`} />
                <Label htmlFor={`${field.key}-yes`}>Yes</Label>
              </div>
            </RadioGroup>
          ) : field.type === 'dropdown' ? (
            <Select
              value={formData[field.key].toString()}
              onValueChange={(value) => updateFormData(field.key, parseInt(value))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{field.min}</span>
                <span className="font-medium text-foreground">
                  Current: {formData[field.key]}
                </span>
                <span>{field.max}</span>
              </div>
              <Slider
                value={[formData[field.key]]}
                onValueChange={(value) => updateFormData(field.key, value[0])}
                max={field.max}
                min={field.min}
                step={field.step}
                className="w-full"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuestionnaireSection;