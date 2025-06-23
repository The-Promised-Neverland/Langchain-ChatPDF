package com.pdfbot.knowledgebot.controller;

import com.pdfbot.knowledgebot.core.FlightComputer;
import com.pdfbot.knowledgebot.core.VectorStoreService;
import com.pdfbot.knowledgebot.core.chatHistoryMemoryService;
import com.pdfbot.knowledgebot.intake.PDFIngestor;
import com.pdfbot.knowledgebot.payload.JSONRes;
import com.pdfbot.knowledgebot.payload.QuestionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/mission")
@RequiredArgsConstructor
public class MissionControl {

    private final FlightComputer flightComputer;
    private final PDFIngestor pdfIngestor;
    private final VectorStoreService vectorStoreService;
    private final chatHistoryMemoryService chatHistoryMemoryService;


    @PostMapping("/upload")
    public ResponseEntity<JSONRes> uploadPdf(@RequestParam("file") MultipartFile file) {
        try {
            File tempFile = File.createTempFile("mission_", ".pdf");
            file.transferTo(tempFile);

            List<String> chunks = pdfIngestor.extractChunks(tempFile, 300);
            vectorStoreService.addChunks(chunks);

            tempFile.delete();

            return ResponseEntity.ok(new JSONRes("✅ PDF embedded into memory and vector store."));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(new JSONRes("❌ Failed to process the PDF."));
        }
    }

    @PostMapping("/ask")
    public ResponseEntity<JSONRes> ask(@RequestBody QuestionRequest request) {
        String response = vectorStoreService.answerQuestion(request.sessionId(), request.question());
        return ResponseEntity.ok(new JSONRes(response));
    }

    @PostMapping("/reset")
    public ResponseEntity<String> resetSession(@RequestParam("sessionId") String sessionId) {
        chatHistoryMemoryService.reset(sessionId);
        return ResponseEntity.ok("✅ Chat reset.");
    }
}

