#!/usr/bin/env python3
"""
BirdNET API Server for QuStar Bird Identification App
Provides HTTP endpoints for bird audio analysis using BirdNET models
"""

import os
import sys
import argparse
import tempfile
import urllib.request
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

# Add BirdNET modules to path
sys.path.append('/app')
try:
    import analyze
    import species
except ImportError as e:
    print(f"Error importing BirdNET modules: {e}")
    sys.exit(1)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global variables for model
MODEL_PATH = None
LABELS_FILE = "/app/labels/V2.4/BirdNET_GLOBAL_6K_V2.4_Labels.txt"

def load_species_list():
    """Load species list from labels file"""
    try:
        with open(LABELS_FILE, 'r') as f:
            return [line.strip() for line in f.readlines()]
    except Exception as e:
        logger.error(f"Error loading species list: {e}")
        return []

@app.route('/', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "BirdNET API",
        "version": "2.4",
        "model_loaded": MODEL_PATH is not None
    })

@app.route('/analyze', methods=['POST'])
def analyze_audio():
    """Analyze bird audio from URL"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        audio_url = data.get('url')
        min_conf = float(data.get('min_conf', 0.1))
        
        if not audio_url:
            return jsonify({"error": "No audio URL provided"}), 400
        
        logger.info(f"Analyzing audio from: {audio_url}")
        
        # Download audio file to temporary location
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            try:
                urllib.request.urlretrieve(audio_url, temp_file.name)
                temp_path = temp_file.name
                
                # Analyze audio using BirdNET
                results = analyze_audio_file(temp_path, min_conf)
                
                return jsonify({
                    "status": "success",
                    "results": results,
                    "audio_url": audio_url,
                    "min_confidence": min_conf,
                    "timestamp": datetime.now().isoformat()
                })
                
            except Exception as e:
                logger.error(f"Error downloading or analyzing audio: {e}")
                return jsonify({"error": f"Failed to process audio: {str(e)}"}), 500
            
            finally:
                # Clean up temporary file
                try:
                    os.unlink(temp_path)
                except:
                    pass
    
    except Exception as e:
        logger.error(f"Error in analyze endpoint: {e}")
        return jsonify({"error": f"Analysis failed: {str(e)}"}), 500

def analyze_audio_file(audio_path, min_conf):
    """Analyze audio file using BirdNET"""
    try:
        # Get species list
        species_list = load_species_list()
        
        # Run BirdNET analysis
        # This calls the analyze.py script functionality
        detections = []
        
        # Set analysis parameters
        analyze.LATITUDE = 51.1694  # Nur-Sultan/Astana, Kazakhstan
        analyze.LONGITUDE = 71.4491
        analyze.WEEK = -1  # Use all weeks
        analyze.OVERLAP = 0.0
        analyze.SENSITIVITY = 1.0
        analyze.MIN_CONFIDENCE = min_conf
        analyze.SIGMOID_SENSITIVITY = 1.0
        
        # Load and run model
        if MODEL_PATH and os.path.exists(MODEL_PATH):
            # Process audio file
            sig, rate = analyze.openAudioFile(audio_path, 48000)
            
            # Get audio chunks
            chunks = analyze.getAudioChunks(sig, rate)
            
            # Analyze each chunk
            for chunk_index, chunk in enumerate(chunks):
                # Get prediction
                p = analyze.predict(chunk, analyze.SIGMOID_SENSITIVITY)
                
                # Get species with confidence above threshold
                p_filtered = analyze.filterPredictions(p, analyze.SENSITIVITY)
                
                # Convert predictions to results
                for i in range(len(p_filtered)):
                    if p_filtered[i] >= min_conf:
                        species_name = species_list[i] if i < len(species_list) else f"Unknown_{i}"
                        
                        # Parse common and scientific names
                        if '_' in species_name:
                            common_name, scientific_name = species_name.split('_', 1)
                        else:
                            common_name = species_name
                            scientific_name = ""
                        
                        detections.append({
                            "species": species_name,
                            "common_name": common_name,
                            "scientific_name": scientific_name,
                            "confidence": float(p_filtered[i]),
                            "start_time": chunk_index * 3.0,  # 3 second chunks
                            "end_time": (chunk_index + 1) * 3.0
                        })
        
        # Sort by confidence
        detections.sort(key=lambda x: x['confidence'], reverse=True)
        
        return detections[:10]  # Return top 10 detections
        
    except Exception as e:
        logger.error(f"Error in BirdNET analysis: {e}")
        raise

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='BirdNET API Server')
    parser.add_argument('--model', type=str, required=True, help='Path to BirdNET model file')
    parser.add_argument('--port', type=int, default=8080, help='Port to run server on')
    parser.add_argument('--host', type=str, default='0.0.0.0', help='Host to bind server to')
    
    args = parser.parse_args()
    
    # Set global model path
    MODEL_PATH = args.model
    
    # Verify model file exists
    if not os.path.exists(MODEL_PATH):
        logger.error(f"Model file not found: {MODEL_PATH}")
        sys.exit(1)
    
    logger.info(f"Starting BirdNET API server on {args.host}:{args.port}")
    logger.info(f"Using model: {MODEL_PATH}")
    
    # Initialize BirdNET
    try:
        analyze.loadModel(MODEL_PATH)
        logger.info("BirdNET model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load BirdNET model: {e}")
        sys.exit(1)
    
    # Start Flask server
    app.run(host=args.host, port=args.port, debug=False) 