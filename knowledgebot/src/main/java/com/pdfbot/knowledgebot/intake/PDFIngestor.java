package com.pdfbot.knowledgebot.intake;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class PDFIngestor {

    public List<String> extractChunks(File pdfFile, int chunkSizeWords) throws IOException {
        try (PDDocument document = PDDocument.load(pdfFile)) {
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);
            return chunkText(text, chunkSizeWords);
        }
    }

    private List<String> chunkText(String text, int chunkSizeWords) {
        String[] words = text.split("\\s+"); // splits text into words based on any spacing pattern.
        List<String> chunks = new ArrayList<>();

        StringBuilder chunk = new StringBuilder();
        int wordCount = 0;

        for (String word : words) {
            chunk.append(word).append(" ");
            wordCount++;

            if (wordCount >= chunkSizeWords) {
                chunks.add(chunk.toString().trim());
                chunk.setLength(0);
                wordCount = 0;
            }
        }

        if (chunk.length() > 0) {
            chunks.add(chunk.toString().trim());
        }

        return chunks;
    }
}
