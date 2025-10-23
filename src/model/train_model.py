import pandas as pd
import pickle
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

# Загрузите ваши данные
# df = pd.read_csv('your_data.csv')

# Пример с фиктивными данными (замените на реальные!)
# Создайте DataFrame с вашими фичами (БЕЗ stress_level - это целевая переменная!)
features = [
    'anxiety_level', 'self_esteem', 'mental_health_history', 'depression',
    'headache', 'blood_pressure', 'sleep_quality', 'breathing_problem',
    'noise_level', 'living_conditions', 'safety', 'basic_needs',
    'academic_performance', 'study_load', 'teacher_student_relationship',
    'future_career_concerns', 'social_support', 'peer_pressure',
    'extracurricular_activities', 'bullying'
]

# ЗАМЕНИТЕ ЭТО НА ЗАГРУЗКУ ВАШИХ РЕАЛЬНЫХ ДАННЫХ!
# df = pd.read_csv('your_training_data.csv')
# X = df[features]  # Признаки БЕЗ stress_level
# y = df['stress_class']  # Целевая переменная (0, 1 или 2)

# Обучите модель
# model = LogisticRegression(max_iter=1000)
# model.fit(X, y)

# Сохраните обученную модель
# with open('final_model.pkl', 'wb') as f:
#     pickle.dump(model, f)

print("Обучите модель на ваших данных и сохраните в final_model.pkl")
