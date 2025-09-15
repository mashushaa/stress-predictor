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

// Временная функция для эмуляции вашей модели
// Замените эту функцию на вызов вашей реальной модели
function predictStressLevel(data: any): number {
  // Это временная логика - замените на вашу модель
  const features = [
    data.anxiety_level, data.self_esteem, data.mental_health_history,
    data.depression, data.headache, data.blood_pressure, data.sleep_quality,
    data.breathing_problem, data.noise_level, data.living_conditions,
    data.safety, data.basic_needs, data.academic_performance, data.study_load,
    data.teacher_student_relationship, data.future_career_concerns,
    data.social_support, data.peer_pressure, data.extracurricular_activities,
    data.bullying
  ];
  
  // Временная логика для демонстрации
  const average = features.reduce((sum, val) => sum + val, 0) / features.length;
  
  if (average <= 1) return 0; // Нет стресса
  if (average <= 2.5) return 1; // Позитивный стресс
  return 2; // Негативный стресс
}

async function generateRecommendations(stressClass: number, questionnaireData: any): Promise<string> {
  const yandexApiKey = Deno.env.get('YANDEX_GPT_API_KEY');
  
  if (!yandexApiKey) {
    throw new Error('YANDEX_GPT_API_KEY не найден');
  }

  const stressLabels = {
    0: "отсутствие стресса",
    1: "позитивный стресс", 
    2: "негативный стресс"
  };

  const systemPrompt = `Ты - профессиональный психолог, специализирующийся на работе со студентами. 
  Твоя задача - дать персональные рекомендации студенту на основе результатов анализа уровня стресса.

  Результат анализа: ${stressLabels[stressClass as keyof typeof stressLabels]}
  
  Данные анкеты студента:
  - Уровень тревожности: ${questionnaireData.anxiety_level}/4
  - Самооценка: ${questionnaireData.self_esteem}/4
  - История проблем с психическим здоровьем: ${questionnaireData.mental_health_history}/4
  - Депрессия: ${questionnaireData.depression}/4
  - Головные боли: ${questionnaireData.headache}/4
  - Артериальное давление: ${questionnaireData.blood_pressure}/4
  - Качество сна: ${questionnaireData.sleep_quality}/4
  - Проблемы с дыханием: ${questionnaireData.breathing_problem}/4
  - Уровень шума в окружении: ${questionnaireData.noise_level}/4
  - Условия проживания: ${questionnaireData.living_conditions}/4
  - Безопасность: ${questionnaireData.safety}/4
  - Удовлетворение базовых потребностей: ${questionnaireData.basic_needs}/4
  - Академическая успеваемость: ${questionnaireData.academic_performance}/4
  - Учебная нагрузка: ${questionnaireData.study_load}/4
  - Отношения с преподавателями: ${questionnaireData.teacher_student_relationship}/4
  - Беспокойство о будущей карьере: ${questionnaireData.future_career_concerns}/4
  - Социальная поддержка: ${questionnaireData.social_support}/4
  - Давление сверстников: ${questionnaireData.peer_pressure}/4
  - Внеучебные активности: ${questionnaireData.extracurricular_activities}/4
  - Буллинг: ${questionnaireData.bullying}/4

  Дай персональные, практичные и конкретные рекомендации (3-5 пунктов) на русском языке. 
  Будь эмпатичным, конструктивным и давай действенные советы.`;

  const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Api-Key ${yandexApiKey}`,
    },
    body: JSON.stringify({
      modelUri: 'gpt://b1gfa3n2p0q5qunqp6b8/yandexgpt-lite',
      completionOptions: {
        stream: false,
        temperature: 0.7,
        maxTokens: 1000
      },
      messages: [
        {
          role: 'system',
          text: systemPrompt
        },
        {
          role: 'user', 
          text: 'Проанализируй мои данные и дай персональные рекомендации.'
        }
      ]
    })
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('YandexGPT API error:', errorData);
    throw new Error(`YandexGPT API error: ${response.status}`);
  }

  const data = await response.json();
  return data.result.alternatives[0].message.text;
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

    // Сохранение результатов в базу данных
    const { error: saveError } = await supabase
      .from('questionnaire_responses')
      .upsert({
        user_id: userId,
        ...dataWithStressLevel,
        probabilities: {
          no_stress: predictedStressClass === 0 ? 0.8 : 0.1,
          positive_stress: predictedStressClass === 1 ? 0.8 : 0.1,
          negative_stress: predictedStressClass === 2 ? 0.8 : 0.1,
          predicted_class: predictedStressClass
        },
        updated_at: new Date().toISOString()
      });

    if (saveError) {
      console.error('Error saving to database:', saveError);
      throw new Error('Ошибка сохранения в базу данных');
    }

    const stressLabels = {
      0: "Отсутствие стресса",
      1: "Позитивный стресс", 
      2: "Негативный стресс"
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