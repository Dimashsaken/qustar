#!/usr/bin/env python3
"""
BirdNET API Server for QuStar Bird Identification App
Enhanced with robust mobile audio format support, better error handling,
and Russian bird name translation using Cornell Lab's official translation files
"""

import os
import sys
import argparse
import tempfile
import urllib.request
import urllib.error
import subprocess
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import numpy as np  # type: ignore
import json # Added for json.loads
import pandas as pd  # Added for CSV processing
import requests  # Added for downloading translation files

# Import BirdNET-Analyzer package
analyze = None  # Initialize to avoid linter errors
species = None

try:
    # For the installed package version
    import birdnetlib  # type: ignore
    import birdnetlib.analyzer  # type: ignore
    BIRDNET_PACKAGE = True
    logger = logging.getLogger(__name__)
    logger.info("Using BirdNET package version")
except ImportError:
    try:
        # Fallback to analyze module approach
        sys.path.extend(["/app/BirdNET-Analyzer", "/app"])
        import analyze  # type: ignore
        import species  # type: ignore
        BIRDNET_PACKAGE = False
        logger = logging.getLogger(__name__)
        logger.info("Using BirdNET legacy module approach")
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
LABELS_FILE = "/app/BirdNET-Analyzer/labels/V2.4/BirdNET_GLOBAL_6K_V2.4_Labels.txt"
analyzer = None

# Russian translation cache
RUSSIAN_TRANSLATIONS = {}
TRANSLATION_CACHE_FILE = "/tmp/cornell_lab_russian_translations.csv"

# Mobile audio format configurations
MOBILE_AUDIO_FORMATS = {
    'ios': ['.m4a', '.aac', '.mp4'],
    'android': ['.mp4', '.3gp', '.amr', '.m4a'],
    'common': ['.wav', '.mp3', '.flac', '.ogg']
}

def download_russian_translations():
    """Download Cornell Lab's official Russian bird name translations"""
    try:
        logger.info("Downloading Cornell Lab Russian bird name translations...")
        
        # Cornell Lab eBird/Clements Checklist with Russian names
        # This URL provides the official Clements Checklist with multilingual names
        translation_url = "https://www.birds.cornell.edu/clementschecklist/wp-content/uploads/2024/10/Clements-Checklist-v2024-October-2024.xlsx"
        
        # Download the Excel file
        response = requests.get(translation_url, timeout=60)
        response.raise_for_status()
        
        # Save as temporary Excel file
        excel_temp = "/tmp/clements_checklist.xlsx"
        with open(excel_temp, 'wb') as f:
            f.write(response.content)
        
        logger.info(f"Downloaded Clements Checklist: {len(response.content)} bytes")
        
        # Read the Excel file - typically the main data is in the first sheet
        try:
            df = pd.read_excel(excel_temp, sheet_name=0)
            logger.info(f"Loaded Excel with {len(df)} rows and columns: {list(df.columns)}")
            
            # Save as CSV for easier processing
            df.to_csv(TRANSLATION_CACHE_FILE, index=False)
            logger.info(f"Saved translation cache to {TRANSLATION_CACHE_FILE}")
            
            # Clean up Excel file
            os.remove(excel_temp)
            
            return True
            
        except Exception as e:
            logger.error(f"Error processing Excel file: {e}")
            # Fallback: try alternative URL for CSV format
            return download_russian_translations_fallback()
            
    except Exception as e:
        logger.error(f"Error downloading Russian translations: {e}")
        return download_russian_translations_fallback()

def download_russian_translations_fallback():
    """Fallback method to get Russian translations from eBird API or alternative source"""
    try:
        logger.info("Trying fallback method for Russian translations...")
        
        # Alternative: Use eBird taxonomy API to get species list, then match with known Russian names
        # For now, create a basic mapping of common species in Kazakhstan
        basic_russian_names = {
            "Corvus corax": "Ворон",
            "Corvus cornix": "Серая ворона", 
            "Pica pica": "Сорока",
            "Passer montanus": "Полевой воробей",
            "Passer domesticus": "Домовый воробей",
            "Turdus merula": "Чёрный дрозд",
            "Turdus pilaris": "Рябинник",
            "Sturnus vulgaris": "Обыкновенный скворец",
            "Hirundo rustica": "Деревенская ласточка",
            "Falco tinnunculus": "Обыкновенная пустельга",
            "Buteo buteo": "Канюк",
            "Accipiter nisus": "Перепелятник",
            "Aquila chrysaetos": "Беркут",
            "Haliaeetus albicilla": "Орлан-белохвост",
            "Anas platyrhynchos": "Кряква",
            "Cygnus olor": "Лебедь-шипун",
            "Ardea cinerea": "Серая цапля",
            "Vanellus vanellus": "Чибис",
            "Columba livia": "Сизый голубь",
            "Streptopelia decaocto": "Кольчатая горлица",
            "Cuculus canorus": "Обыкновенная кукушка",
            "Upupa epops": "Удод",
            "Merops apiaster": "Золотистая щурка",
            "Alcedo atthis": "Обыкновенный зимородок",
            "Picus viridis": "Зелёный дятел",
            "Dendrocopos major": "Большой пёстрый дятел",
            "Alauda arvensis": "Полевой жаворонок",
            "Motacilla alba": "Белая трясогузка",
            "Anthus trivialis": "Лесной конёк",
            "Phoenicurus phoenicurus": "Обыкновенная горихвостка",
            "Saxicola rubetra": "Луговой чекан",
            "Oenanthe oenanthe": "Обыкновенная каменка",
            "Sylvia atricapilla": "Черноголовка",
            "Phylloscopus trochilus": "Пеночка-весничка",
            "Regulus regulus": "Желтоголовый королёк",
            "Ficedula hypoleuca": "Мухоловка-пеструшка",
            "Muscicapa striata": "Серая мухоловка",
            "Aegithalos caudatus": "Длиннохвостая синица",
            "Parus major": "Большая синица",
            "Cyanistes caeruleus": "Лазоревка",
            "Sitta europaea": "Обыкновенный поползень",
            "Certhia brachydactyla": "Короткопалая пищуха",
            "Oriolus oriolus": "Иволга",
            "Garrulus glandarius": "Сойка",
            "Fringilla coelebs": "Зяблик",
            "Carduelis carduelis": "Щегол",
            "Chloris chloris": "Зеленушка",
            "Acanthis flammea": "Чечётка",
            "Pyrrhula pyrrhula": "Снегирь",
            "Emberiza citrinella": "Обыкновенная овсянка"
        }
        
        # Create a simple CSV with the basic translations
        df = pd.DataFrame([
            {"scientific_name": sci_name, "russian_name": rus_name, "english_name": ""} 
            for sci_name, rus_name in basic_russian_names.items()
        ])
        
        df.to_csv(TRANSLATION_CACHE_FILE, index=False)
        logger.info(f"Created basic Russian translation cache with {len(basic_russian_names)} species")
        
        return True
        
    except Exception as e:
        logger.error(f"Error in fallback Russian translations: {e}")
        return False

def load_russian_translations():
    """Load Russian translations from cache file"""
    global RUSSIAN_TRANSLATIONS
    
    try:
        # Check if cache file exists, if not download it
        if not os.path.exists(TRANSLATION_CACHE_FILE):
            logger.info("Russian translation cache not found, downloading...")
            if not download_russian_translations():
                logger.error("Failed to download Russian translations")
                return False
        
        # Load translations from CSV
        df = pd.read_csv(TRANSLATION_CACHE_FILE)
        logger.info(f"Loading Russian translations from CSV with columns: {list(df.columns)}")
        
        # Handle different possible column names from Cornell Lab data
        scientific_col = None
        russian_col = None
        
        # Find scientific name column
        for col in df.columns:
            if 'scientific' in col.lower() or 'sci_name' in col.lower() or col.lower() == 'scientific_name':
                scientific_col = col
                break
        
        # Find Russian name column  
        for col in df.columns:
            if 'russian' in col.lower() or 'ru' in col.lower() or 'rus' in col.lower():
                russian_col = col
                break
        
        if not scientific_col:
            logger.warning("No scientific name column found, using default mapping")
            return True  # Use the basic fallback mapping
            
        # Build translation dictionary
        RUSSIAN_TRANSLATIONS = {}
        russian_count = 0
        
        for _, row in df.iterrows():
            try:
                scientific_name = str(row[scientific_col]).strip()
                
                # Get Russian name if available
                russian_name = ""
                if russian_col and pd.notna(row[russian_col]):
                    russian_name = str(row[russian_col]).strip()
                    if russian_name and russian_name.lower() not in ['nan', 'none', '']:
                        RUSSIAN_TRANSLATIONS[scientific_name] = russian_name
                        russian_count += 1
                        
            except Exception as e:
                continue  # Skip problematic rows
        
        logger.info(f"Loaded {russian_count} Russian bird name translations")
        logger.info(f"Sample translations: {dict(list(RUSSIAN_TRANSLATIONS.items())[:5])}")
        
        return True
        
    except Exception as e:
        logger.error(f"Error loading Russian translations: {e}")
        return False

def get_russian_name(scientific_name):
    """Get Russian name for a bird by scientific name"""
    try:
        # Direct lookup in translations
        if scientific_name in RUSSIAN_TRANSLATIONS:
            return RUSSIAN_TRANSLATIONS[scientific_name]
        
        # Try without subspecies (e.g., "Corvus corax corax" -> "Corvus corax")
        if ' ' in scientific_name:
            genus_species = ' '.join(scientific_name.split()[:2])
            if genus_species in RUSSIAN_TRANSLATIONS:
                return RUSSIAN_TRANSLATIONS[genus_species]
        
        # No translation found
        return None
        
    except Exception as e:
        logger.error(f"Error getting Russian name for {scientific_name}: {e}")
        return None

def load_species_list():
    """Load species list from labels file"""
    try:
        with open(LABELS_FILE, 'r') as f:
            return [line.strip() for line in f.readlines()]
    except Exception as e:
        logger.error(f"Error loading species list: {e}")
        return []

def detect_audio_format(file_path):
    """Detect audio format and codec information using ffprobe"""
    try:
        cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', file_path]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        
        if result.returncode == 0:
            probe_data = json.loads(result.stdout)
            format_info = probe_data.get('format', {})
            streams = probe_data.get('streams', [])
            
            audio_streams = [s for s in streams if s.get('codec_type') == 'audio']
            if not audio_streams:
                return None, "No audio streams found"
            
            audio_stream = audio_streams[0]
            
            return {
                'format_name': format_info.get('format_name', 'unknown'),
                'duration': float(format_info.get('duration', 0)),
                'size': int(format_info.get('size', 0)),
                'codec_name': audio_stream.get('codec_name', 'unknown'),
                'sample_rate': int(audio_stream.get('sample_rate', 0)),
                'channels': int(audio_stream.get('channels', 0)),
                'bit_rate': int(audio_stream.get('bit_rate', 0)) if audio_stream.get('bit_rate') else None,
            }, None
        else:
            return None, f"ffprobe failed: {result.stderr}"
            
    except subprocess.TimeoutExpired:
        return None, "Audio format detection timed out"
    except json.JSONDecodeError:
        return None, "Failed to parse ffprobe output"
    except Exception as e:
        return None, f"Error detecting audio format: {e}"

def download_audio_file(url, output_path):
    """Download audio file with enhanced error handling and mobile optimization"""
    try:
        logger.info(f"Downloading audio from: {url}")
        
        # Create a custom request with mobile-friendly headers
        req = urllib.request.Request(url, headers={
            'User-Agent': 'QuStar BirdNET Audio Analyzer/1.0',
            'Accept': 'audio/*,*/*;q=0.8',
            'Accept-Encoding': 'identity'  # Avoid compression issues
        })
        
        # Download with timeout and error handling
        with urllib.request.urlopen(req, timeout=60) as response:  # Increased timeout for large mobile files
            # Verify we got a successful response
            if response.getcode() != 200:
                logger.error(f"HTTP error: {response.getcode()}")
                return False
            
            # Check content type if available
            content_type = response.getheader('Content-Type', '')
            content_length = response.getheader('Content-Length')
            logger.info(f"Content-Type: {content_type}")
            if content_length:
                logger.info(f"Content-Length: {content_length} bytes")
            
            # Download content in chunks for large files
            content = b''
            chunk_size = 8192
            max_size = 100 * 1024 * 1024  # 100MB limit
            
            while True:
                chunk = response.read(chunk_size)
                if not chunk:
                    break
                content += chunk
                
                # Check size limit
                if len(content) > max_size:
                    logger.error(f"File too large: {len(content)} bytes (limit: {max_size})")
                    return False
            
            # Verify we got content
            if not content:
                logger.error("Downloaded content is empty")
                return False
                
            logger.info(f"Downloaded {len(content)} bytes")
            
            # Write to file
            with open(output_path, 'wb') as f:
                f.write(content)
            
            # Verify file was written and has content
            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                logger.error("Downloaded file is empty or wasn't created")
                return False
            
            file_size = os.path.getsize(output_path)
            logger.info(f"Successfully downloaded audio file: {file_size} bytes")
            return True
            
    except urllib.error.HTTPError as e:
        logger.error(f"HTTP error downloading audio: {e.code} - {e.reason}")
        return False
    except urllib.error.URLError as e:
        logger.error(f"URL error downloading audio: {e.reason}")
        return False
    except Exception as e:
        logger.error(f"Error downloading audio file: {e}")
        return False

def validate_audio_file(file_path):
    """Enhanced audio file validation with mobile format support"""
    try:
        # Check file exists and has content
        if not os.path.exists(file_path):
            logger.error("Audio file does not exist")
            return False, "File not found"
            
        file_size = os.path.getsize(file_path)
        if file_size == 0:
            logger.error("Audio file is empty")
            return False, "File is empty"
            
        if file_size < 1024:  # Less than 1KB is suspicious for audio
            logger.error(f"Audio file suspiciously small: {file_size} bytes")
            return False, f"File too small: {file_size} bytes"
        
        # Detect audio format and validate
        format_info, error = detect_audio_format(file_path)
        if error:
            logger.error(f"Audio format detection failed: {error}")
            return False, error
        
        if not format_info:
            logger.error("Could not detect audio format")
            return False, "Unknown audio format"
        
        # Validate audio properties
        duration = format_info.get('duration', 0)
        sample_rate = format_info.get('sample_rate', 0)
        channels = format_info.get('channels', 0)
        
        if duration < 0.1:
            return False, f"Audio too short: {duration:.2f}s"
        
        if duration > 300:  # 5 minutes max
            return False, f"Audio too long: {duration:.1f}s (max 5 minutes)"
            
        if sample_rate < 8000:
            return False, f"Sample rate too low: {sample_rate}Hz (min 8kHz)"
            
        if channels < 1 or channels > 2:
            return False, f"Invalid channel count: {channels}"
        
        logger.info(f"Audio validation successful: {format_info['format_name']}, "
                   f"{duration:.1f}s, {sample_rate}Hz, {channels}ch")
        return True, format_info
        
    except Exception as e:
        logger.error(f"Error validating audio file: {e}")
        return False, f"Validation error: {e}"

def convert_audio_format(input_path, output_path):
    """Enhanced audio conversion optimized for mobile recordings and BirdNET requirements"""
    try:
        # First validate the input file
        is_valid, validation_result = validate_audio_file(input_path)
        if not is_valid:
            logger.error(f"Input audio file validation failed: {validation_result}")
            return False, validation_result
        
        format_info = validation_result
        logger.info(f"Converting from {format_info['format_name']} "
                   f"({format_info['codec_name']}) to WAV")
        
        # Build conversion command optimized for the detected format
        base_cmd = [
            'ffmpeg',
            '-i', input_path,
            '-vn',  # Disable video
            '-acodec', 'pcm_s16le',  # Use PCM 16-bit little-endian for WAV
            '-ar', '48000',  # Set sample rate to 48kHz (BirdNET requirement)
            '-ac', '1',  # Convert to mono
            '-f', 'wav',  # Output format
            '-y',  # Overwrite output file
            '-v', 'error',  # Only show errors
        ]
        
        # Add format-specific optimizations
        codec_name = format_info.get('codec_name', '').lower()
        if codec_name in ['aac', 'mp4a']:
            # AAC/M4A specific optimizations (common in iOS recordings)
            cmd = base_cmd + [
                '-avoid_negative_ts', 'make_zero',
                '-af', 'highpass=f=80,lowpass=f=20000',  # Filter for bird sounds
                output_path
            ]
        elif codec_name in ['amr_nb', 'amr_wb']:
            # AMR format (Android voice recordings)
            cmd = base_cmd + [
                '-af', 'volume=2.0,highpass=f=100',  # Boost volume and filter
                output_path
            ]
        elif codec_name == 'opus':
            # Opus format (web/modern Android)
            cmd = base_cmd + [
                '-af', 'highpass=f=80',
                output_path
            ]
        else:
            # Generic conversion
            cmd = base_cmd + [
                '-avoid_negative_ts', 'make_zero',
                output_path
            ]
        
        logger.info(f"Converting audio with command: {' '.join(cmd)}")
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)  # 3 minute timeout
        
        if result.returncode != 0:
            logger.error(f"FFmpeg conversion failed with code {result.returncode}")
            logger.error(f"FFmpeg stderr: {result.stderr}")
            
            # Try alternative conversion for problematic files
            logger.info("Attempting alternative conversion method...")
            alt_cmd = [
                'ffmpeg',
                '-i', input_path,
                '-vn',
                '-ar', '48000',
                '-ac', '1',
                '-sample_fmt', 's16',
                '-f', 'wav',
                '-y',
                '-v', 'error',
                output_path
            ]
            
            alt_result = subprocess.run(alt_cmd, capture_output=True, text=True, timeout=180)
            
            if alt_result.returncode != 0:
                error_msg = f"Conversion failed: {alt_result.stderr}"
                logger.error(error_msg)
                return False, error_msg
            else:
                logger.info("Alternative conversion succeeded")
        
        # Verify output file was created and has content
        if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
            error_msg = "Converted file is empty or wasn't created"
            logger.error(error_msg)
            return False, error_msg
        
        # Validate the converted WAV file
        output_valid, output_info = validate_audio_file(output_path)
        if not output_valid:
            error_msg = f"Converted file validation failed: {output_info}"
            logger.error(error_msg)
            return False, error_msg
        
        output_size = os.path.getsize(output_path)
        logger.info(f"Successfully converted audio to WAV format: {output_size} bytes, "
                   f"{output_info['duration']:.1f}s")
        return True, output_info
        
    except subprocess.TimeoutExpired:
        error_msg = "FFmpeg conversion timed out"
        logger.error(error_msg)
        return False, error_msg
    except Exception as e:
        error_msg = f"Error converting audio format: {e}"
        logger.error(error_msg)
        return False, error_msg

@app.route('/', methods=['GET'])
def health_check():
    """Enhanced health check endpoint with more diagnostic info"""
    return jsonify({
        "status": "healthy",
        "service": "BirdNET API",
        "version": "2.4",
        "model_loaded": MODEL_PATH is not None,
        "birdnet_package": BIRDNET_PACKAGE,
        "supported_formats": MOBILE_AUDIO_FORMATS,
        "max_file_size": "100MB",
        "max_duration": "5 minutes"
    })

@app.route('/analyze', methods=['POST'])
def analyze_audio():
    """Enhanced audio analysis with mobile format support and Russian translation"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        audio_url = data.get('url')
        min_conf = float(data.get('min_conf', 0.1))
        language = data.get('language', 'en').lower()  # Default to English
        
        if not audio_url:
            return jsonify({"error": "No audio URL provided"}), 400
        
        # Validate language parameter
        if language not in ['en', 'ru']:
            return jsonify({"error": "language must be 'en' (English) or 'ru' (Russian)"}), 400
        
        logger.info(f"Analyzing audio from: {audio_url}")
        
        # Create temporary files for download and conversion
        download_temp = None
        converted_temp = None
        
        try:
            # Create temporary file for download (format-agnostic)
            with tempfile.NamedTemporaryFile(delete=False, suffix='.audio') as temp_file:
                download_temp = temp_file.name
            
            # Download audio file with enhanced error handling
            if not download_audio_file(audio_url, download_temp):
                return jsonify({
                    "error": "Failed to download audio file",
                    "details": "Could not retrieve audio from the provided URL"
                }), 500
            
            # Validate downloaded file
            is_valid, validation_result = validate_audio_file(download_temp)
            if not is_valid:
                return jsonify({
                    "error": "Invalid audio file",
                    "details": validation_result
                }), 400
            
            # Create temporary file for converted audio
            with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as converted_file:
                converted_temp = converted_file.name
            
            # Convert audio to WAV format with enhanced mobile support
            conversion_success, conversion_result = convert_audio_format(download_temp, converted_temp)
            if not conversion_success:
                return jsonify({
                    "error": "Failed to convert audio format",
                    "details": conversion_result
                }), 500
            
            # Analyze converted audio using BirdNET
            results, analysis_error = analyze_audio_file(converted_temp, min_conf, language)
            if analysis_error:
                return jsonify({
                    "error": "BirdNET analysis failed",
                    "details": analysis_error
                }), 500
            
            return jsonify({
                "status": "success",
                "results": results,
                "audio_url": audio_url,
                "min_confidence": min_conf,
                "language": language,
                "timestamp": datetime.now().isoformat(),
                "audio_info": validation_result,
                "processed_duration": conversion_result.get('duration', 0)
            })
            
        except Exception as e:
            logger.error(f"Error processing audio: {e}")
            return jsonify({
                "error": f"Failed to process audio: {str(e)}",
                "details": "Internal processing error"
            }), 500
        
        finally:
            # Clean up temporary files
            for temp_path in [download_temp, converted_temp]:
                if temp_path and os.path.exists(temp_path):
                    try:
                        os.unlink(temp_path)
                        logger.info(f"Cleaned up temporary file: {temp_path}")
                    except Exception as e:
                        logger.warning(f"Failed to clean up {temp_path}: {e}")
    
    except Exception as e:
        logger.error(f"Error in analyze endpoint: {e}")
        return jsonify({
            "error": f"Analysis failed: {str(e)}",
            "details": "Server error during analysis"
        }), 500

def analyze_audio_file(audio_path, min_conf, language='en'):
    """Enhanced BirdNET analysis with better error handling and Russian translation"""
    try:
        detections = []
        
        if BIRDNET_PACKAGE and analyzer:
            # Use birdnetlib package
            from birdnetlib import Recording
            
            recording = Recording(
                analyzer,
                audio_path,
                lat=51.1694,  # Nur-Sultan/Astana, Kazakhstan
                lon=71.4491,
                date=datetime(2024, 1, 1),  # Default date as datetime object
                min_conf=min_conf
            )
            
            try:
                recording.analyze()
                
                for detection in recording.detections:
                    scientific_name = detection['scientific_name']
                    common_name = detection['common_name']
                    
                    # Get Russian name if requested
                    display_name = common_name  # Default to English common name
                    if language == 'ru':
                        russian_name = get_russian_name(scientific_name)
                        if russian_name:
                            display_name = russian_name
                    
                    detection_result = {
                        "species": f"{common_name}_{scientific_name}",
                        "common_name": common_name,
                        "scientific_name": scientific_name,
                        "display_name": display_name,  # The name to show to user
                        "confidence": float(detection['confidence']),
                        "start_time": float(detection['start_time']),
                        "end_time": float(detection['end_time'])
                    }
                    
                    # Add Russian name if available and requested
                    if language == 'ru':
                        russian_name = get_russian_name(scientific_name)
                        detection_result["russian_name"] = russian_name
                    
                    detections.append(detection_result)
                    
            except Exception as e:
                return [], f"BirdNET package analysis failed: {e}"
        
        else:
            # Use legacy analyze module
            try:
                species_list = load_species_list()
                
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
                                
                                # Get display name based on language
                                display_name = common_name  # Default to English common name
                                if language == 'ru' and scientific_name:
                                    russian_name = get_russian_name(scientific_name)
                                    if russian_name:
                                        display_name = russian_name
                                
                                detection_result = {
                                    "species": species_name,
                                    "common_name": common_name,
                                    "scientific_name": scientific_name,
                                    "display_name": display_name,  # The name to show to user
                                    "confidence": float(p_filtered[i]),
                                    "start_time": chunk_index * 3.0,  # 3 second chunks
                                    "end_time": (chunk_index + 1) * 3.0
                                }
                                
                                # Add Russian name if available and requested
                                if language == 'ru' and scientific_name:
                                    russian_name = get_russian_name(scientific_name)
                                    detection_result["russian_name"] = russian_name
                                
                                detections.append(detection_result)
                else:
                    return [], "BirdNET model not loaded"
                    
            except Exception as e:
                return [], f"BirdNET legacy analysis failed: {e}"
        
        # Sort by confidence and return top detections
        detections.sort(key=lambda x: x['confidence'], reverse=True)
        top_detections = detections[:10]  # Return top 10 detections
        
        logger.info(f"Analysis completed: {len(top_detections)} detections found")
        return top_detections, None
        
    except Exception as e:
        error_msg = f"Error in BirdNET analysis: {e}"
        logger.error(error_msg)
        return [], error_msg

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
    
    logger.info(f"Starting Enhanced BirdNET API server on {args.host}:{args.port}")
    logger.info(f"Using model: {MODEL_PATH}")
    
    # Initialize BirdNET
    try:
        if BIRDNET_PACKAGE:
            # Initialize birdnetlib analyzer
            from birdnetlib.analyzer import Analyzer
            analyzer = Analyzer()
            logger.info("BirdNET package analyzer loaded successfully")
        else:
            # Initialize legacy analyze module
            analyze.loadModel(MODEL_PATH)
            logger.info("BirdNET legacy model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load BirdNET model: {e}")
        sys.exit(1)
    
    # Initialize Russian translations
    try:
        logger.info("Loading Russian bird name translations...")
        if load_russian_translations():
            logger.info("Russian translations loaded successfully")
        else:
            logger.warning("Failed to load Russian translations - will use English only")
    except Exception as e:
        logger.warning(f"Error loading Russian translations: {e} - will use English only")
    
    # Start Flask server
    app.run(host=args.host, port=args.port, debug=False) 