package com.pdfbot.knowledgebot.core;


import com.pdfbot.knowledgebot.engine.GeminiEngine;
import com.pdfbot.knowledgebot.payload.ChatMessage;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.EmbeddingSearchResult;
import dev.langchain4j.store.embedding.EmbeddingStore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static dev.langchain4j.data.segment.TextSegment.from;

/**
 * VectorStoreService
 *
 * 📌 Purpose:
 * This service handles the embedding and storage of text chunks (from PDF files) in memory.
 * It uses the MiniLM embedding model to convert text into numerical vectors (embeddings),
 * stores them in an in-memory vector store, and allows similarity-based retrieval of relevant chunks.
 *
 * ✅ Used for:
 * - RAG (Retrieval-Augmented Generation) based question answering
 * - Storing chunks of PDFs as vectors
 * - Searching semantically similar content for user questions
 */

@Slf4j
@Service
public class VectorStoreService {

    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;
    private final GeminiEngine geminiEngine;
    private final chatHistoryMemoryService chatHistoryMemoryService;

    public VectorStoreService(EmbeddingModel embeddingModel, EmbeddingStore<TextSegment> embeddingStore, GeminiEngine geminiEngine, chatHistoryMemoryService chatHistoryMemoryService) {
        this.embeddingModel = embeddingModel;
        this.embeddingStore = embeddingStore;
        this.geminiEngine = geminiEngine;
        this.chatHistoryMemoryService = chatHistoryMemoryService;
    }

    /**
     * Adds a list of text chunks into the vector store after converting them into embeddings.
     */
    public void addChunks(List<String> chunks) {
        List<TextSegment> segments = new ArrayList<>();
        for (String chunk : chunks) {
            segments.add(from(chunk));
        }

        List<Embedding> embeddings = embeddingModel.embedAll(segments).content();
        embeddingStore.addAll(embeddings, segments);

        log.info("✅ Added {} chunks into vector store.", segments.size());
    }

    public String answerQuestion(String sessionId, String question) {
        chatHistoryMemoryService.addUserMessage(sessionId, question);

        // 1. Embed the user question
        Embedding questionEmbedding = embeddingModel.embed(question).content();

        // 2. Build the search request
        EmbeddingSearchRequest embeddingSearchRequest = EmbeddingSearchRequest.builder()
                .queryEmbedding(questionEmbedding)
                .maxResults(3)
                .minScore(0.0)
                .build();

        // 3. Perform semantic search
        EmbeddingSearchResult<TextSegment> result = embeddingStore.search(embeddingSearchRequest);

        // 4. Extract matched chunks from the result
        String relevantContext = result.matches().stream()
                .map(match -> match.embedded().text())  // Get the raw text from each matched TextSegment
                .collect(Collectors.joining("\n\n"));

        // 5. Build conversation context
        StringBuilder historyPrompt = new StringBuilder();
        for (ChatMessage msg : chatHistoryMemoryService.getMessages(sessionId)) {
            historyPrompt.append(msg.role()).append(": ").append(msg.content()).append("\n");
        }

        // 6. Build the prompt
        String finalPrompt = """
        You are a helpful PDF assistant. Use the document context below and the ongoing conversation to respond.

        Document Context:
        %s

        Conversation:
        %s

        Current Question:
        %s
        """.formatted(relevantContext, historyPrompt, question);

        // 7. Call Gemini (assuming geminiEngine is declared in your class)
        return geminiEngine.fireUpEngines(finalPrompt);
    }
}
