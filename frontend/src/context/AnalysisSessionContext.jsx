import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

// Default Verified Benchmark Presets with explicit NASA GIBS scene extents [min_lat, min_lon, max_lat, max_lon]
export const DEFAULT_PRESETS = [
  {
    id: 'dana-2024',
    name: 'Cyclone DANA (2024)',
    date: '2024-10-24',
    basin: 'Bay of Bengal',
    bbox_geo: [8.0, 75.0, 23.0, 95.0],
    ground_truth_center: { lat: 18.2, lon: 88.0, name: 'IMD Best Track Fix' },
    url: 'https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&BBOX=8,75,23,95&TIME=2024-10-24&WIDTH=1024&HEIGHT=768&FORMAT=image/png'
  },
  {
    id: 'biparjoy-2023',
    name: 'Cyclone BIPARJOY (2023)',
    date: '2023-06-12',
    basin: 'Arabian Sea',
    bbox_geo: [12.0, 58.0, 26.0, 76.0],
    ground_truth_center: { lat: 21.9, lon: 66.3, name: 'IMD Best Track Fix' },
    url: 'https://wvs.earthdata.nasa.gov/api/v1/snapshot?REQUEST=GetSnapshot&LAYERS=VIIRS_SNPP_CorrectedReflectance_TrueColor&BBOX=12,58,26,76&TIME=2023-06-12&WIDTH=1024&HEIGHT=768&FORMAT=image/png'
  }
];

const AnalysisSessionContext = createContext(null);

export const AnalysisSessionProvider = ({ children }) => {
  // Authoritative in-memory analysis session
  const [currentInput, setCurrentInput] = useState(() => {
    const defaultPreset = DEFAULT_PRESETS[0];
    return {
      sessionId: `session_preset_${defaultPreset.id}_init`,
      inputType: 'preset', // 'preset' | 'upload'
      name: defaultPreset.name,
      source: 'DANA Benchmark Frame',
      sourceType: 'benchmark',
      presetId: defaultPreset.id,
      file: null,
      imageUrl: defaultPreset.url,
      basin: defaultPreset.basin,
      bbox_geo: defaultPreset.bbox_geo,
      is_georeferenced: true,
      ground_truth_center: defaultPreset.ground_truth_center,
      metadata: {
        dimensions: '1024 × 768 px',
        sizeKb: null,
        type: 'NASA GIBS Tile Snapshot'
      },
      timestamp: new Date().toISOString()
    };
  });

  // Results strictly tied to a specific sessionId to prevent cross-image contamination
  const [sessionResults, setSessionResults] = useState({
    sessionId: `session_preset_${DEFAULT_PRESETS[0].id}_init`,
    detectionResult: null,
    classificationResult: null
  });

  // Switch input to a user-uploaded image (generates a new unique sessionId and clears dependent results)
  const setInputFromUpload = useCallback((file, objectUrl, metadata = {}, basin = 'Bay of Bengal') => {
    const newSessionId = `session_upload_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    setCurrentInput({
      sessionId: newSessionId,
      inputType: 'upload',
      name: file.name,
      source: 'User Uploaded Frame',
      sourceType: 'user_upload',
      presetId: null,
      file: file,
      imageUrl: objectUrl,
      basin: basin,
      // Generic upload has NO verified geospatial bounding box / CRS metadata
      bbox_geo: null,
      is_georeferenced: false,
      ground_truth_center: null,
      metadata: {
        dimensions: metadata.dimensions || 'Image Frame',
        sizeKb: metadata.sizeKb || (file.size / 1024).toFixed(1),
        type: file.type || 'image/png'
      },
      timestamp: new Date().toISOString()
    });

    // Clear dependent results on new input
    setSessionResults({
      sessionId: newSessionId,
      detectionResult: null,
      classificationResult: null
    });
  }, []);

  // Switch input to a verified benchmark preset
  const setInputFromPreset = useCallback((preset) => {
    const newSessionId = `session_preset_${preset.id}_${Date.now()}`;
    
    setCurrentInput({
      sessionId: newSessionId,
      inputType: 'preset',
      name: preset.name,
      source: `${preset.name} (Verified)`,
      sourceType: 'benchmark',
      presetId: preset.id,
      file: null,
      imageUrl: preset.url || preset.image,
      basin: preset.basin || 'Bay of Bengal',
      bbox_geo: preset.bbox_geo || null,
      is_georeferenced: !!preset.bbox_geo,
      ground_truth_center: preset.ground_truth_center || null,
      metadata: {
        dimensions: '1024 × 768 px',
        sizeKb: null,
        type: 'NASA GIBS Tile Snapshot'
      },
      timestamp: new Date().toISOString()
    });

    // Clear previous results on switching preset
    setSessionResults({
      sessionId: newSessionId,
      detectionResult: null,
      classificationResult: null
    });
  }, []);

  // Store MobileNetV3 Detection Result for the current session
  const setDetectionResult = useCallback((result) => {
    if (!result) return;
    setSessionResults(prev => ({
      ...prev,
      detectionResult: {
        ...result,
        sessionId: currentInput.sessionId
      }
    }));
  }, [currentInput.sessionId]);

  // Store ResNet18 Morphology Classification Result for the current session
  const setClassificationResult = useCallback((result) => {
    if (!result) return;
    setSessionResults(prev => ({
      ...prev,
      classificationResult: {
        ...result,
        sessionId: currentInput.sessionId
      }
    }));
  }, [currentInput.sessionId]);

  // Store both Detection + Classification results (e.g., from Satellite "Run AI Analysis")
  const setFullPipelineResults = useCallback(({ detectionResult, classificationResult }) => {
    setSessionResults({
      sessionId: currentInput.sessionId,
      detectionResult: detectionResult ? { ...detectionResult, sessionId: currentInput.sessionId } : null,
      classificationResult: classificationResult ? { ...classificationResult, sessionId: currentInput.sessionId } : null
    });
  }, [currentInput.sessionId]);

  // Read only the results matching the active sessionId (prevents any stale result leakage)
  const activeDetectionResult = useMemo(() => {
    if (sessionResults.sessionId === currentInput.sessionId) {
      return sessionResults.detectionResult;
    }
    return null;
  }, [sessionResults, currentInput.sessionId]);

  const activeClassificationResult = useMemo(() => {
    if (sessionResults.sessionId === currentInput.sessionId) {
      return sessionResults.classificationResult;
    }
    return null;
  }, [sessionResults, currentInput.sessionId]);

  const value = useMemo(() => ({
    currentInput,
    detectionResult: activeDetectionResult,
    classificationResult: activeClassificationResult,
    setInputFromUpload,
    setInputFromPreset,
    setDetectionResult,
    setClassificationResult,
    setFullPipelineResults
  }), [
    currentInput,
    activeDetectionResult,
    activeClassificationResult,
    setInputFromUpload,
    setInputFromPreset,
    setDetectionResult,
    setClassificationResult,
    setFullPipelineResults
  ]);

  return (
    <AnalysisSessionContext.Provider value={value}>
      {children}
    </AnalysisSessionContext.Provider>
  );
};

export const useAnalysisSession = () => {
  const context = useContext(AnalysisSessionContext);
  if (!context) {
    throw new Error('useAnalysisSession must be used within an AnalysisSessionProvider');
  }
  return context;
};
