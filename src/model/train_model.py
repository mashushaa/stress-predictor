import pandas as pd
import pickle
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

# ВАЖНО: Список признаков БЕЗ stress_level (это целевая переменная!)
features = [
    'anxiety_level', 'self_esteem', 'mental_health_history', 'depression',
    'headache', 'blood_pressure', 'sleep_quality', 'breathing_problem',
    'noise_level', 'living_conditions', 'safety', 'basic_needs',
    'academic_performance', 'study_load', 'teacher_student_relationship',
    'future_career_concerns', 'social_support', 'peer_pressure',
    'extracurricular_activities', 'bullying'
]

# ИНСТРУКЦИЯ: Замените на загрузку ВАШИХ реальных данных!
# df = pd.read_csv('your_training_data.csv')
# X = df[features]  # Только 20 признаков
# y = df['stress_class']  # Целевая переменная (0, 1 или 2)

# Обучите модель
# model = LogisticRegression(max_iter=1000, random_state=42)
# model.fit(X, y)

# ⚠️ КРИТИЧЕСКИ ВАЖНО: Сохраняйте ОБЪЕКТ МОДЕЛИ, а не массивы!
# with open('final_model.pkl', 'wb') as f:
#     pickle.dump(model, f)  # ✅ ПРАВИЛЬНО - сохраняем model
#     
#     # ❌ НЕ ДЕЛАЙТЕ ТАК:
#     # pickle.dump(model.coef_, f)  # Это numpy array, не модель!
#     # pickle.dump(model.predict(X), f)  # Это predictions, не модель!

# Проверка загрузки модели
# with open('final_model.pkl', 'rb') as f:
#     loaded_model = pickle.load(f)
#     print(f"Тип загруженной модели: {type(loaded_model)}")  # Должно быть LogisticRegression
#     print(f"Модель имеет метод predict: {hasattr(loaded_model, 'predict')}")  # Должно быть True

print("⚠️ ВНИМАНИЕ: В final_model.pkl должен быть сохранен объект модели LogisticRegression!")
print("Текущая ошибка: в pkl-файле сохранен numpy.ndarray вместо модели")
print("Переобучите модель и сохраните ОБЪЕКТ model с помощью pickle.dump(model, f)")
