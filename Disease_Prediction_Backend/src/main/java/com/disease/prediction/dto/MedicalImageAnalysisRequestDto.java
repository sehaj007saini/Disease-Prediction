package com.disease.prediction.dto;

public class MedicalImageAnalysisRequestDto {
    private String modality; // XRAY, CT, MRI, ULTRASOUND
    private String base64Image; // Base64 encoded image string
    private String mimeType; // image/jpeg, image/png, etc.
    private Long patientId;
    private String patientName;
    private String additionalClinicalNotes;

    public MedicalImageAnalysisRequestDto() {}

    public MedicalImageAnalysisRequestDto(String modality, String base64Image, String mimeType, Long patientId, String patientName, String additionalClinicalNotes) {
        this.modality = modality;
        this.base64Image = base64Image;
        this.mimeType = mimeType;
        this.patientId = patientId;
        this.patientName = patientName;
        this.additionalClinicalNotes = additionalClinicalNotes;
    }

    public String getModality() {
        return modality;
    }

    public void setModality(String modality) {
        this.modality = modality;
    }

    public String getBase64Image() {
        return base64Image;
    }

    public void setBase64Image(String base64Image) {
        this.base64Image = base64Image;
    }

    public String getMimeType() {
        return mimeType;
    }

    public void setMimeType(String mimeType) {
        this.mimeType = mimeType;
    }

    public Long getPatientId() {
        return patientId;
    }

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getAdditionalClinicalNotes() {
        return additionalClinicalNotes;
    }

    public void setAdditionalClinicalNotes(String additionalClinicalNotes) {
        this.additionalClinicalNotes = additionalClinicalNotes;
    }
}
