package com.pdfbot.knowledgebot.core;

import com.pdfbot.knowledgebot.payload.ChatMessage;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class chatHistoryMemoryService {
    private final Map<String, List<ChatMessage>> sessionMemory=new HashMap<>();

    public void addUserMessage(String sessionId, String message) {
        sessionMemory.computeIfAbsent(sessionId, k -> new ArrayList<>())
                .add(new ChatMessage("user", message));
    }

    public void addAssistantMessage(String sessionId, String message) {
        sessionMemory.computeIfAbsent(sessionId, k -> new ArrayList<>())
                .add(new ChatMessage("assistant", message));
    }

    public List<ChatMessage> getMessages(String sessionId) {
        return sessionMemory.getOrDefault(sessionId, List.of());
    }

    public void reset(String sessionId) {
        sessionMemory.remove(sessionId);
    }
}
