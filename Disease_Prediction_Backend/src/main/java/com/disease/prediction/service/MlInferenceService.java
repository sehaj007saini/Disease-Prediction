package com.disease.prediction.service;

import com.disease.prediction.dto.MlModelApiRequest;
import com.disease.prediction.dto.MlModelApiResponse;
import com.disease.prediction.dto.MlServiceStatusDto;

public interface MlInferenceService {
    MlModelApiResponse predictDisease(MlModelApiRequest request);
    MlServiceStatusDto checkMlServiceStatus();
}
