from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import numpy as np
from datetime import datetime
import logging
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from werkzeug.utils import secure_filename

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__, template_folder='./templates', static_folder='./static')

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['UPLOAD_FOLDER'] = './uploaded_images'
app.config['ALLOWED_EXTENSIONS'] = {'jpg', 'jpeg', 'png', 'bmp', 'gif'}

# Load the trained CNN model
try:
    model = load_model('banana_Leaf_disease_model.h5')
    logger.info("✅ Model loaded successfully")
except Exception as e:
    logger.error(f"❌ Error loading model: {e}")
    model = None

# Disease categories and information
DISEASE_INFO = {
    'Healthy': {
        'description': 'Plant appears healthy with no visible disease symptoms',
        'causes': 'Proper plant care and healthy growing conditions',
        'prevention': 'Continue good plant care practices, regular monitoring, proper watering, adequate nutrition'
    },
    'Sigatoka': {
        'description': 'Fungal disease affecting banana leaves',
        'causes': 'High humidity, poor plant hygiene, dense planting, inadequate drainage, fungal spores',
        'prevention': 'Improve drainage, increase plant spacing, apply fungicides, remove infected leaves'
    },
    'Xanthomonas': {
        'description': 'Bacterial wilt disease',
        'causes': 'Bacterial infection, warm humid weather, plant wounds, contaminated tools',
        'prevention': 'Use disease-free seeds, sanitize tools, apply copper-based bactericides'
    }
}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def preprocess_image(img_path):
    """Preprocess the input image for model prediction"""
    try:
        img = image.load_img(img_path, target_size=(224, 224), color_mode="grayscale")
        img_array = image.img_to_array(img)
        img_array = np.expand_dims(img_array, axis=0)
        img_array /= 255.0
        return img_array
    except Exception as e:
        logger.error(f"Error processing image {img_path}: {e}")
        raise

def predict_disease(image_path):
    """Predict disease from image"""
    if model is None:
        raise Exception("Model not loaded")
    
    img_array = preprocess_image(image_path)
    predictions = model.predict(img_array)
    predicted_class = np.argmax(predictions[0])
    confidence = float(predictions[0][predicted_class])
    disease_name = list(DISEASE_INFO.keys())[predicted_class]
    
    return disease_name, confidence

@app.route('/')
def home():
    """Render the main page"""
    return render_template('index1.html')

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/diseases')
def get_diseases():
    """Get information about all diseases"""
    return jsonify(DISEASE_INFO)

@app.route('/predict', methods=['POST'])
def predict():
    """Handle image upload and prediction"""
    if 'image' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({
            'error': f'Invalid file type. Allowed: {", ".join(app.config["ALLOWED_EXTENSIONS"])}'
        }), 400

    if model is None:
        return jsonify({
            'error': 'Model not loaded',
            'details': 'Please check server logs'
        }), 500

    try:
        # Create upload directory if not exists
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        # Save with timestamp to avoid filename conflicts
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{secure_filename(file.filename)}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        logger.info(f"Image saved to {file_path}")

        # Predict disease
        disease, confidence = predict_disease(file_path)
        logger.info(f"Prediction: {disease} ({confidence*100:.2f}%)")

        # Get disease information
        disease_data = DISEASE_INFO.get(disease, {})
        
        # Prepare response
        response = {
            "disease": disease,
            "confidence": f"{confidence * 100:.2f}%",
            "description": disease_data.get('description', ''),
            "causes": disease_data.get('causes', ''),
            "prevention": disease_data.get('prevention', ''),
            "filename": file.filename,
            "timestamp": datetime.now().isoformat()
        }

        return jsonify(response)

    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}")
        return jsonify({
            'error': f"Prediction failed: {str(e)}",
            'details': 'Check server logs for more information'
        }), 500

    finally:
        # Clean up uploaded file
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                logger.info(f"Cleaned up {file_path}")
        except Exception as e:
            logger.warning(f"Failed to clean up file: {e}")

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serve uploaded files"""
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    # Print startup information
    print("🚀 Starting GREEN Diagnosis Backend...")
    print("=" * 60)
    print(f"📍 Server URL: http://localhost:5000")
    print(f"🔗 Health Check: http://localhost:5000/health")
    print(f"🎯 Prediction: http://localhost:5000/predict")
    print("=" * 60)
    
    if model is None:
        print("⚠️  WARNING: Model not loaded!")
        print("💡 Make sure 'banana_Leaf_disease_model.h5' is in the server directory")
    
    app.run(debug=True, host='0.0.0.0', port=5000)