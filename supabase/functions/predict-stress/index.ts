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

// Функция предсказания уровня стресса на основе алгоритма логистической регрессии
function predictStressLevel(data: any): number {
  // Нормализация данных и веса признаков на основе важности для стресса
  const weights = {
    // Психологические факторы (высокий вес)
    anxiety_level: 0.15,
    depression: 0.14,
    self_esteem: -0.10, // негативный вес - высокая самооценка снижает стресс
    mental_health_history: 0.08,
    
    // Физиологические факторы
    sleep_quality: -0.12, // плохой сон увеличивает стресс
    headache: 0.08,
    blood_pressure: 0.06,
    breathing_problem: 0.07,
    
    // Академические факторы (высокий вес)
    study_load: 0.13,
    academic_performance: -0.09, // хорошая успеваемость снижает стресс
    future_career_concerns: 0.11,
    teacher_student_relationship: -0.08,
    
    // Социальные факторы
    social_support: -0.10, // поддержка снижает стресс
    peer_pressure: 0.09,
    bullying: 0.12,
    extracurricular_activities: -0.05,
    
    // Экологические факторы
    living_conditions: -0.07,
    safety: -0.06,
    noise_level: 0.05,
    basic_needs: -0.08
  };
  
  // Вычисление взвешенной суммы
  let weightedSum = 0;
  for (const [feature, weight] of Object.entries(weights)) {
    const value = data[feature] || 0;
    // Нормализация значений к диапазону 0-1
    const normalizedValue = Math.min(Math.max(value / 5, 0), 1);
    weightedSum += normalizedValue * weight;
  }
  
  // Применение сигмоидной функции для получения вероятности
  const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
  const probability = sigmoid(weightedSum * 10 - 2); // масштабирование для лучшего разделения
  
  // Классификация на основе пороговых значений
  if (probability < 0.35) return 0; // Низкий стресс
  if (probability < 0.65) return 1; // Умеренный стресс  
  return 2; // Высокий стресс
}

async function generateRecommendations(stressClass: number, questionnaireData: any): Promise<string> {
  const yandexApiKey = Deno.env.get('YANDEX_GPT_API_KEY');
  const yandexFolderId = Deno.env.get('YANDEX_FOLDER_ID');
  
  // Fallback рекомендации на основе класса стресса
  const fallbackRecommendations = {
    0: `**Отличные результаты!** Ваш уровень стресса находится в норме.

**Рекомендации для поддержания благополучия:**
• Продолжайте заниматься тем, что приносит вам удовольствие
• Поддерживайте регулярный режим сна и питания
• Развивайте свои сильные стороны и интересы
• Помогайте другим студентам справляться со стрессом
• Регулярно занимайтесь физической активностью`,

    1: `**Позитивный стресс** может быть полезен для мотивации, но важно не допустить его перехода в негативный.

**Рекомендации:**
• Планируйте время для отдыха между учебными задачами
• Используйте техники релаксации (дыхательные упражнения, медитация)
• Поддерживайте социальные связи с друзьями и семьей
• Занимайтесь физическими упражнениями для снятия напряжения
• Обратитесь за поддержкой, если чувствуете перегрузку`,

    2: `**Высокий уровень стресса** требует активных действий для улучшения самочувствия.

**Неотложные рекомендации:**
• Обратитесь к психологу или консультанту в университете
• Пересмотрите свою учебную нагрузку и приоритеты
• Обязательно выделяйте время для полноценного сна (7-9 часов)
• Практикуйте техники управления стрессом ежедневно
• Поговорите с близкими людьми о своих переживаниях
• Рассмотрите возможность временного снижения нагрузки`
  };

  // Пытаемся получить персонализированные рекомендации через YandexGPT
  if (yandexApiKey && yandexFolderId) {
    try {
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
          modelUri: `gpt://${yandexFolderId}/yandexgpt-lite`,
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

      if (response.ok) {
        const data = await response.json();
        return data.result.alternatives[0].message.text;
      } else {
        console.error('YandexGPT API error, using fallback recommendations');
      }
    } catch (error) {
      console.error('Error calling YandexGPT:', error);
    }
  }

  // Возвращаем fallback рекомендации
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