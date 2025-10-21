from flask import Flask, request, jsonify
import pickle
import pandas as pd

app = Flask(__name__)

# В Railway файлы будут в корневой директории
with open('final_model.pkl', 'rb') as model_file:
    model = pickle.load(model_file)

@app.route('/predict', methods=['POST'])
def predict():
    input_json = request.get_json()
    # Преобразуем в DataFrame (ожидается, что ключи совпадают с названиями столбцов data)
    input_df = pd.DataFrame([input_json])
    pred = model.predict(input_df)[0]
    return jsonify({'predicted_class': int(pred)})

if __name__ == '__main__':
    app.run(debug=True)

