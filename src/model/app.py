from flask import Flask, request, jsonify
import pickle
import pandas as pd
import os
import sys

app = Flask(__name__)

# Логирование для отладки
print("Starting Flask application...", file=sys.stderr)

# В Railway файлы будут в корневой директории
try:
    with open('final_model.pkl', 'rb') as model_file:
        model = pickle.load(model_file)
    print("Model loaded successfully", file=sys.stderr)
    print(f"Model type: {type(model)}", file=sys.stderr)
except Exception as e:
    print(f"Error loading model: {e}", file=sys.stderr)
    raise

@app.route('/predict', methods=['POST'])
def predict():
    try:
        print("Received prediction request", file=sys.stderr)
        
        input_json = request.get_json()
        print(f"Input JSON: {input_json}", file=sys.stderr)
        
        # Преобразуем в DataFrame
        input_df = pd.DataFrame([input_json])
        print(f"DataFrame shape: {input_df.shape}", file=sys.stderr)
        print(f"DataFrame columns: {list(input_df.columns)}", file=sys.stderr)
        
        # Предсказание
        pred = model.predict(input_df)[0]
        print(f"Prediction: {pred}", file=sys.stderr)
        
        result = {'predicted_class': int(pred)}
        print(f"Returning result: {result}", file=sys.stderr)
        
        return jsonify(result)
    except Exception as e:
        print(f"Error in predict: {str(e)}", file=sys.stderr)
        print(f"Error type: {type(e)}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    print(f"Starting server on 0.0.0.0:{port}", file=sys.stderr)
    app.run(host='0.0.0.0', port=port, debug=True)

