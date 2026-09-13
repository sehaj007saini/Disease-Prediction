package com.disease.prediction.dto;

import java.util.List;

public class GeminiChatRequestDto {
    private String message;
    private List<ConversationMessage> conversationHistory;

    public GeminiChatRequestDto() {}

    public GeminiChatRequestDto(String message, List<ConversationMessage> conversationHistory) {
        this.message = message;
        this.conversationHistory = conversationHistory;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<ConversationMessage> getConversationHistory() {
        return conversationHistory;
    }

    public void setConversationHistory(List<ConversationMessage> conversationHistory) {
        this.conversationHistory = conversationHistory;
    }

    public static class ConversationMessage {
        private String sender;  // "user" or "bot"
        private String text;

        public ConversationMessage() {}

        public ConversationMessage(String sender, String text) {
            this.sender = sender;
            this.text = text;
        }

        public String getSender() {
            return sender;
        }

        public void setSender(String sender) {
            this.sender = sender;
        }

        public String getText() {
            return text;
        }

        public void setText(String text) {
            this.text = text;
        }
    }
}
