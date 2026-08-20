package com.disease.prediction.service;

import com.disease.prediction.dto.*;

public interface MlInferenceService {
    MlModelApiResponse predictDisease(MlModelApiRequest request);
    MultiDiseaseResponseDto predictMultiDisease(MultiDiseaseRequestDto request);
    CounterfactualResponseDto simulateCounterfactual(CounterfactualRequestDto request);
    GlobalXaiDto getGlobalXai();
    MlServiceStatusDto checkMlServiceStatus();
}
