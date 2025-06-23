package com.pdfbot.knowledgebot.config;


import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.embedding.onnx.allminilml6v2.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class RAGConfig {

    /**
     * Loads the local ONNX-based MiniLM embedding model.
     */
    @Bean
    public EmbeddingModel embeddingModel() {
        return new AllMiniLmL6V2EmbeddingModel();
    }

    /**
     * Creates an in-memory embedding store for local vector search.
     */
    @Bean
    public EmbeddingStore<?> embeddingStore() {
        return new InMemoryEmbeddingStore<>();
    }

}
