package com.pdfbot.knowledgebot.core;

import com.pdfbot.knowledgebot.intake.PDFIngestor;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Service
public class FlightComputer {

    private final PDFIngestor pdfIngestor;
    private final VectorStoreService vectorStoreService;

    public FlightComputer(PDFIngestor pdfIngestor, VectorStoreService vectorStoreService) {
        this.pdfIngestor = pdfIngestor;
        this.vectorStoreService = vectorStoreService;
    }

    public String processMission(File pdfFile, String userQuestion, String sessionId) throws IOException {
        // Extract text in chunks
        List<String> chunks = pdfIngestor.extractChunks(pdfFile, 300);
        vectorStoreService.addChunks(chunks);

        // Step 2: Ask question using vector search
        return vectorStoreService.answerQuestion(sessionId, userQuestion);
    }

}
