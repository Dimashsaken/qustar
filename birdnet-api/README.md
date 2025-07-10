# BirdNET API Server for QuStar

Enhanced BirdNET API server with robust mobile audio format support, better error handling, and **Russian bird name translation** using Cornell Lab's official translation files.

## Features

### 🎯 **Core Functionality**
- Bird identification using BirdNET model
- Mobile audio format support (iOS M4A, Android 3GP/AMR, etc.)
- Real-time audio analysis with confidence scoring
- Kazakhstan geographic optimization

### 🌍 **Multilingual Support** 
- **Russian Names**: Official translations from Cornell Lab covering ~50% of global species
- **English Names**: Full BirdNET species coverage
- **Language Parameter**: Choose `"en"` or `"ru"` in API requests
- **Automatic Fallback**: Uses English when Russian not available

### 📱 **Mobile Optimized**
- Enhanced iOS/Android audio format support
- Automatic format detection and conversion
- FFmpeg-powered audio processing
- Timeout protection and error handling

## API Usage

### Basic Request
```bash
curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/bird-audio.m4a",
    "min_conf": 0.1,
    "language": "ru"
  }'
```

### Request Parameters
- `url` (required): Audio file URL
- `min_conf` (optional): Minimum confidence threshold (0.0-1.0, default: 0.1)
- `language` (optional): Response language - `"en"` (English) or `"ru"` (Russian), default: `"en"`

### Response Format
```json
{
  "status": "success",
  "language": "ru",
  "results": [
    {
      "species": "Common Raven_Corvus corax",
      "common_name": "Common Raven",
      "scientific_name": "Corvus corax",
      "display_name": "Ворон",
      "russian_name": "Ворон",
      "confidence": 0.95,
      "start_time": 0.0,
      "end_time": 3.0
    }
  ],
  "timestamp": "2024-01-01T12:00:00",
  "audio_info": {...},
  "processed_duration": 5.2
}
```

### Response Fields
- `display_name`: The localized name to show users (Russian if available, English fallback)
- `russian_name`: Russian translation (only included when `language: "ru"`)
- `common_name`: English common name (always included)
- `scientific_name`: Scientific name (always included)

## Installation & Setup

### Requirements
```bash
pip install -r requirements.txt
```

### Dependencies
- **Flask**: Web API framework
- **BirdNET**: Cornell Lab's bird identification model
- **FFmpeg**: Audio format conversion
- **Pandas + OpenPyXL**: Excel processing for translation files
- **Requests**: Translation file downloads

### Running the Server
```bash
python server.py --model /path/to/BirdNET_model.tflite --port 8080 --host 0.0.0.0
```

## Translation System

### Data Source
- **Cornell Lab eBird/Clements Checklist**: Official multilingual bird taxonomy
- **Russian Coverage**: ~50% of global species, maintained by expert ornithologists
- **Update Frequency**: Downloaded automatically, cached for performance

### Fallback Strategy
1. **Primary**: Cornell Lab official Russian translations
2. **Secondary**: Curated list of common Kazakhstan species
3. **Fallback**: English common names

### Cache Management
- Translation files cached in `/tmp/cornell_lab_russian_translations.csv`
- Automatic download on first Russian request
- Graceful degradation if download fails

## Kazakhstan Focus

### Geographic Optimization
- **Coordinates**: Nur-Sultan/Astana (51.1694°N, 71.4491°E)
- **Species Focus**: Central Asia bird species prioritized
- **Common Species**: Enhanced coverage for Kazakhstan birds

### Audio Formats
- **iOS**: M4A, AAC, MP4 (common in Kazakhstan iPhone recordings)
- **Android**: 3GP, AMR, M4A (popular Android formats)
- **Universal**: WAV, MP3, FLAC, OGG

## Error Handling

### Robust Processing
- **Audio Validation**: Format detection, duration checks, file integrity
- **Timeout Protection**: Prevents hanging on large/corrupt files
- **Graceful Degradation**: Falls back to English if Russian unavailable
- **Detailed Logging**: Comprehensive error reporting

### Common Issues
- **No Russian Translation**: Returns English name in `display_name`
- **Audio Format Issues**: Automatic conversion attempts multiple strategies
- **Network Problems**: Uses cached translations when possible

## Development

### Testing Russian Support
```bash
# Test with Russian language
curl -X POST http://localhost:8080/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/raven-call.m4a",
    "language": "ru",
    "min_conf": 0.2
  }'
```

### Health Check
```bash
curl http://localhost:8080/
```

## License & Attribution

- **BirdNET**: Cornell Lab of Ornithology
- **Translation Data**: Cornell Lab eBird/Clements Checklist
- **Russian Names**: Maintained by Andrey Vlasenko and Nathan Pieplow
- **Audio Processing**: FFmpeg Project

Built for the QuStar Kazakhstan Bird Identification App. 