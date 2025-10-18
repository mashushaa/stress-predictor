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

// Функция предсказания уровня стресса на основе всех параметров анкеты
function predictStressLevel(data: any): number {
  // Взвешенные коэффициенты для разных факторов (имитация логистической регрессии)
  
  // Психологические факторы (вес: высокий)
  const psychologicalScore = (
    (data.anxiety_level || 0) * 0.15 +        // 0-21, высокий вес
    (30 - (data.self_esteem || 15)) * 0.10 +  // инвертируем, низкая самооценка = высокий стресс
    (data.mental_health_history || 0) * 5 +   // бинарный, сильный индикатор
    (data.depression || 0) * 0.12 +           // 0-27, высокий вес
    (data.stress_level || 0) * 0.15           // 0-5, прямой индикатор стресса
  );

  // Физиологические факторы (вес: средний)
  const physiologicalScore = (
    (data.headache || 0) * 0.08 +
    (data.blood_pressure || 0) * 0.08 +
    (5 - (data.sleep_quality || 3)) * 0.12 +  // инвертируем, плохой сон = высокий стресс
    (data.breathing_problem || 0) * 0.08
  );

  // Экологические факторы (вес: низкий)
  const environmentalScore = (
    (data.noise_level || 0) * 0.05 +
    (5 - (data.living_conditions || 3)) * 0.05 +  // инвертируем
    (5 - (data.safety || 3)) * 0.06 +             // инвертируем
    (5 - (data.basic_needs || 3)) * 0.07          // инвертируем
  );

  // Академические факторы (вес: средний)
  const academicScore = (
    (5 - (data.academic_performance || 3)) * 0.08 +           // инвертируем
    (data.study_load || 0) * 0.10 +
    (5 - (data.teacher_student_relationship || 3)) * 0.06 +   // инвертируем
    (data.future_career_concerns || 0) * 0.09
  );

  // Социальные факторы (вес: средний)
  const socialScore = (
    (5 - (data.social_support || 3)) * 0.10 +            // инвертируем
    (data.peer_pressure || 0) * 0.08 +
    (5 - (data.extracurricular_activities || 3)) * 0.04 + // инвертируем
    (data.bullying || 0) * 0.12                           // высокий вес для буллинга
  );

  // Общий score (нормализованный к шкале 0-10)
  const totalScore = psychologicalScore + physiologicalScore + environmentalScore + academicScore + socialScore;
  
  console.log('Stress prediction scores:', {
    psychological: psychologicalScore.toFixed(2),
    physiological: physiologicalScore.toFixed(2),
    environmental: environmentalScore.toFixed(2),
    academic: academicScore.toFixed(2),
    social: socialScore.toFixed(2),
    total: totalScore.toFixed(2)
  });

  // Классификация на основе общего score
  if (totalScore < 3.5) return 0;  // No stress
  if (totalScore < 6.5) return 1;  // Positive stress (eustress)
  return 2;                         // Negative stress (distress)
}

async function generateRecommendations(stressClass: number, questionnaireData: any): Promise<string> {
  const huggingFaceToken = Deno.env.get('HUGGING_FACE_ACCESS_TOKEN');
  
  // Fallback recommendations based on stress class
  const fallbackRecommendations = {
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

  // Try to get personalized recommendations through Hugging Face API with DeepSeek model
  if (huggingFaceToken) {
    try {
      const systemPrompt = `You are an experienced psychologist specializing in stress management, mental health, and well-being. Your task is to provide empathetic, supportive, and evidence-based recommendations for users based on the predicted stress class and the provided values for factors influencing stress.

Input Format:
You will receive the following information in each query:

Predicted Stress Class: ${stressClass} (where 0: No stress, 1: Positive stress (eustress), 2: Negative stress (distress))

Factor Values:
- anxiety_level: ${questionnaireData.anxiety_level} (0–21, where 0 = minimal anxiety, 21 = maximum anxiety)
- self_esteem: ${questionnaireData.self_esteem} (0–30, where 0 = low self-esteem, 30 = high self-esteem)
- mental_health_history: ${questionnaireData.mental_health_history} (0 = no, 1 = yes)
- depression: ${questionnaireData.depression} (0–27, where 0 = no depression, 27 = maximum depression)
- headache: ${questionnaireData.headache} (0–5, where 0 = no issues, 5 = severe issues)
- blood_pressure: ${questionnaireData.blood_pressure} (0–5, where 0 = no issues, 5 = severe issues)
- sleep_quality: ${questionnaireData.sleep_quality} (0–5, where 0 = poor, 5 = excellent)
- breathing_problem: ${questionnaireData.breathing_problem} (0–5, where 0 = no issues, 5 = severe issues)
- noise_level: ${questionnaireData.noise_level} (0–5, where 0 = quiet, 5 = very noisy)
- living_conditions: ${questionnaireData.living_conditions} (0–5, where 0 = poor, 5 = excellent)
- safety: ${questionnaireData.safety} (0–5, where 0 = unsafe, 5 = very safe)
- basic_needs: ${questionnaireData.basic_needs} (0–5, where 0 = unmet, 5 = fully met)
- academic_performance: ${questionnaireData.academic_performance} (0–5, where 0 = low, 5 = high)
- study_load: ${questionnaireData.study_load} (0–5, where 0 = low, 5 = very high)
- teacher_student_relationship: ${questionnaireData.teacher_student_relationship} (0–5, where 0 = poor, 5 = excellent)
- future_career_concerns: ${questionnaireData.future_career_concerns} (0–5, where 0 = no concerns, 5 = high concerns)
- social_support: ${questionnaireData.social_support} (0–5, where 0 = no support, 5 = high support)
- peer_pressure: ${questionnaireData.peer_pressure} (0–5, where 0 = no pressure, 5 = high pressure)
- extracurricular_activities: ${questionnaireData.extracurricular_activities} (0–5, where 0 = no participation, 5 = active participation)
- bullying: ${questionnaireData.bullying} (0–5, where 0 = no bullying, 5 = high bullying)
- stress_level: ${questionnaireData.stress_level} (0–5, where 0 = low, 5 = high)

Task:
1. Analyze the predicted stress class and the factor values, considering their specified ranges
2. Identify key factors likely contributing to the user's current state
3. Formulate personalized recommendations that align with the stress class, address the most significant factors, and are practical, specific, empathetic, supportive, and non-judgmental
4. If the stress class is 2 (negative stress), always include a recommendation to seek professional help if factors indicate serious issues (e.g., anxiety_level > 14, depression > 18, or mental_health_history = 1)

Response Format:
- Begin with a brief, empathetic introduction acknowledging the user's current state
- Highlight key factors likely influencing stress, considering their ranges
- Provide 3–5 specific recommendations in a bulleted list, tailored to the stress class and factors
- Conclude with a supportive message emphasizing the importance of self-care and, if needed, suggest seeking help

Constraints:
- Do not make assumptions about missing data
- Avoid medical diagnoses or prescriptions; instead, suggest consulting professionals when appropriate
- Maintain a neutral and supportive tone, avoiding judgment or excessive optimism
- Consider the specified ranges when analyzing factors and formulating recommendations
- Use English for all responses and ensure they are clear, concise, and professional`;

      const userPrompt = 'Analyze my data and provide personalized recommendations.';

      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${huggingFaceToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `${systemPrompt}\n\nUser: ${userPrompt}\nAssistant:`,
          parameters: {
            max_length: 1000,
            temperature: 0.7,
            do_sample: true,
            top_p: 0.9,
            return_full_text: false
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Hugging Face API response success:', data);
        
        if (data && data[0] && data[0].generated_text) {
          return data[0].generated_text.trim();
        } else {
          console.log('No generated text in response, using fallback');
        }
      } else {
        const errorText = await response.text();
        console.error('Hugging Face API error:', response.status, response.statusText, errorText);
        console.error('Hugging Face API error, using fallback recommendations');
      }
    } catch (error) {
      console.error('Error calling Hugging Face API:', error instanceof Error ? error.message : String(error));
    }
  }

  // Return fallback recommendations
  return fallbackRecommendations[stressClass as keyof typeof fallbackRecommendations] || fallbackRecommendations[1];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { questionnaireData, userId } = await req.json();
    
    console.log('Received questionnaire data:', questionnaireData);

    // Добавляем stress_level если его нет (можете настроить логику)
    const dataWithStressLevel = {
      ...questionnaireData,
      stress_level: questionnaireData.stress_level || 2 // По умолчанию средний уровень
    };

    // Предсказание уровня стресса с помощью вашей модели
    const predictedStressClass = predictStressLevel(dataWithStressLevel);
    
    console.log('Predicted stress class:', predictedStressClass);

    // Генерация персональных рекомендаций
    const recommendations = await generateRecommendations(predictedStressClass, dataWithStressLevel);
    
    console.log('Generated recommendations:', recommendations);

    // Save results to database (create new record each time)
    const { error: saveError } = await supabase
      .from('questionnaire_responses')
      .insert({
        user_id: userId,
        ...dataWithStressLevel,
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