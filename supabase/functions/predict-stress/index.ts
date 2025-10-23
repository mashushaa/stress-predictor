import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Функция предсказания уровня стресса через Railway API
async function predictStressLevel(data: any): Promise<number> {
  try {
    console.log('Sending data to Railway API:', JSON.stringify(data));
    
    const response = await fetch('https://web-production-1b134.up.railway.app/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    console.log('Railway API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Railway API error response:', errorText);
      throw new Error(`Railway API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Railway API prediction result:', result);
    
    return result.predicted_class;
  } catch (error) {
    console.error('Error calling Railway API:', error);
    throw error;
  }
}

async function generateRecommendations(stressClass: number, questionnaireData: any): Promise<string> {
  const recommendations = {
    0: `**Excellent results!** Your stress level is within normal range.

**Recommendations for maintaining well-being:**
• Continue engaging in activities that bring you joy
• Maintain regular sleep and eating patterns
• Develop your strengths and interests
• Help other students cope with stress
• Engage in regular physical activity`,

    1: `**Positive stress** can be beneficial for motivation, but it's important not to let it transition into negative stress.

**Recommendations:**
• Plan time for rest between academic tasks
• Use relaxation techniques (breathing exercises, meditation)
• Maintain social connections with friends and family
• Engage in physical exercises to release tension
• Seek support if you feel overwhelmed`,

    2: `**High stress level** requires active steps to improve your well-being.

**Urgent recommendations:**
• Contact a psychologist or counselor at your university
• Review your academic workload and priorities
• Make sure to allocate time for adequate sleep (7-9 hours)
• Practice stress management techniques daily
• Talk to close people about your experiences
• Consider temporarily reducing your workload`
  };

  return recommendations[stressClass as keyof typeof recommendations] || recommendations[1];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionnaireData, userId } = await req.json();
    
    console.log('Received questionnaire data:', questionnaireData);

    // Убираем stress_level - это то, что мы предсказываем, а не входной признак
    const { stress_level, ...dataForPrediction } = questionnaireData;

    // Предсказание уровня стресса с помощью вашей модели через Railway
    const predictedStressClass = await predictStressLevel(dataForPrediction);
    
    console.log('Predicted stress class:', predictedStressClass);

    // Генерация персональных рекомендаций
    const recommendations = await generateRecommendations(predictedStressClass, questionnaireData);
    
    console.log('Generated recommendations:', recommendations);

    // Save results to database (create new record each time)
    const { error: saveError } = await supabase
      .from('questionnaire_responses')
      .insert({
        user_id: userId,
        ...questionnaireData,
        probabilities: {
          no_stress: predictedStressClass === 0 ? 0.8 : 0.1,
          positive_stress: predictedStressClass === 1 ? 0.8 : 0.1,
          negative_stress: predictedStressClass === 2 ? 0.8 : 0.1,
          predicted_class: predictedStressClass
        },
        recommendations: recommendations // Save recommendations in separate column
      });

    if (saveError) {
      console.error('Error saving to database:', saveError);
      throw new Error('Ошибка сохранения в базу данных');
    }

    const stressLabels = {
      0: "No Stress",
      1: "Positive Stress", 
      2: "Negative Stress"
    };

    const result = {
      stressLevel: stressLabels[predictedStressClass as keyof typeof stressLabels],
      stressClass: predictedStressClass,
      recommendations: recommendations,
      confidence: 80, // Вы можете настроить это значение
      probabilities: {
        no_stress: predictedStressClass === 0 ? 80 : 10,
        positive_stress: predictedStressClass === 1 ? 80 : 10,
        negative_stress: predictedStressClass === 2 ? 80 : 10
      }
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error in predict-stress function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Внутренняя ошибка сервера' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});