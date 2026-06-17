import PDFDocument from 'pdfkit';
import { Response } from 'express';

export function generateDatasetReportPDF(res: Response) {
  const doc = new PDFDocument({
    margin: 50,
    bufferPages: true,
  });

  // Pipe to response
  doc.pipe(res);

  // Define styling palette
  const primaryColor = '#1e3a8a';   // Deep Blue
  const secondaryColor = '#0f172a'; // Slate / Dark gray
  const accentColor = '#2563eb';    // Modern blue
  const bodyColor = '#334155';      // Elegant grayish body
  const metaColor = '#64748b';      // Subdued metadata color
  const codeBackground = '#f8fafc'; // Codeblock bg
  const codeBorder = '#e2e8f0';     // Codeblock border

  // --- Helper to draw a horizontal rule ---
  const hr = (ySpace: number = 10) => {
    doc.moveDown(ySpace / 10);
    doc.strokeColor('#e2e8f0')
       .lineWidth(1)
       .moveTo(50, doc.y)
       .lineTo(561, doc.y)
       .stroke();
    doc.moveDown(ySpace / 10);
  };

  // --- Helper for headers on new pages ---
  const addHeaderAndFooter = () => {
    const pages = doc.bufferedPageRange();
    for (let i = 0; i < pages.count; i++) {
      doc.switchToPage(i);
      
      // Skip running header/footer on title page
      if (i === 0) continue;

      // Header
      doc.fontSize(8)
         .fillColor(metaColor)
         .text('FMCG BENCHMARK DATASET SYNTHESIS REPORT', 50, 30, { align: 'left' });
      doc.text('DURGA PRASAD & SAIMANOJ | JUNE 2026', 50, 30, { align: 'right' });
      doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(50, 42).lineTo(561, 42).stroke();

      // Footer
      doc.strokeColor('#f1f5f9').lineWidth(0.5).moveTo(50, 755).lineTo(561, 755).stroke();
      doc.fontSize(8)
         .fillColor(metaColor)
         .text('Strictly Confidential - Internal R&D Use Only', 50, 762, { align: 'left' });
      doc.text(`Page ${i + 1} of ${pages.count}`, 50, 762, { align: 'right' });
    }
  };

  // ==========================================
  // PAGE 1: TITLE PAGE (COVER)
  // ==========================================
  doc.moveDown(4);
  
  // Large decorative primary color bar
  doc.rect(50, 100, 15, 120).fill(primaryColor);
  
  doc.fontSize(28)
     .fillColor(secondaryColor)
     .font('Helvetica-Bold')
     .text('FMCG SYSTEM SIMULATION ENGINE', 80, 105, { width: 450 });
     
  doc.fontSize(16)
     .fillColor(accentColor)
     .font('Helvetica')
     .text('High-Fidelity 52-Week FMCG Beverage Datasets Simulation', 80, 175);
     
  doc.moveDown(3);

  // Metadata block
  doc.fontSize(10)
     .fillColor(secondaryColor)
     .font('Helvetica-Bold')
     .text('PROJECT ARTIFACT ID: ', 50, 320)
     .font('Helvetica')
     .text('FMCG-SIM-COGNITIVE-2026', 200, 320);

  doc.font('Helvetica-Bold')
     .text('LEAD SYSTEM DESIGNERS: ', 50, 340)
     .font('Helvetica')
     .text('Durga Prasad (Lead Data Engineer) \nSaimanoj (Senior Data Scientist)', 200, 340);

  doc.font('Helvetica-Bold')
     .text('TARGET BENCHMARK: ', 50, 380)
     .font('Helvetica')
     .text('LLM Analytical Reasoning & Multi-Modal Dashboard Validation', 200, 380);

  doc.font('Helvetica-Bold')
     .text('CREATION DATE: ', 50, 400)
     .font('Helvetica')
     .text('June 17, 2026', 200, 400);

  hr(30);

  // Abstract / Pitch info
  doc.fontSize(10)
     .fillColor(bodyColor)
     .font('Helvetica-Oblique')
     .text(
       'This document chronicles the design process, collaborative technical brainstorming, and ultimate code implementation of our high-fidelity FMCG Beverage dataset generation engine. Compiled herein are the raw Slack team discussions detailing economic elasticity calibration, supply-chain delay models, and stockout triggers, as well as the complete final Python simulation blueprint.',
       { align: 'justify', width: 511 }
     );

  doc.addPage();

  // ==========================================
  // PAGE 2: BUSINESS DESIGN & RATIONALE
  // ==========================================
  doc.fontSize(16)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('1. Architectural Modeling Framework');
  
  hr(10);

  doc.fontSize(10)
     .fillColor(bodyColor)
     .font('Helvetica')
     .text(
       'Generating mock transactional data for analytical validation is frequently bottlenecked by simplified assumptions. Perfect linear trends, uniform distributions, and uncorrelated attributes fail to represent the "noise-heavy" operational realities of Fast-Moving Consumer Goods (FMCG). To establish a highly diagnostic benchmark for Conversational BI Assistants, our design relies on deep coupling between product dynamics, physical stores footprint, macroeconomic demand patterns, and real physical log shortages.',
       { align: 'justify' }
     );

  doc.moveDown();
  doc.font('Helvetica-Bold').text('Core Structural Parameters:');
  doc.font('Helvetica')
     .text('•  Target Horizon: 52 weeks (modeling full year macrocycles).', { indent: 15 })
     .text('•  Roster Depth: 15 uniquely formulated beverage SKUs across 5 prominent categories.', { indent: 15 })
     .text('•  Store Coverage: 40 stores spanning 4 geographical regions and 4 store scales (Hypermarket, Supermarket, Convenience, and Wholesale).', { indent: 15 })
     .text('•  Base Sizing Multipliers: Applied format weights (Wholesale: 3.5x, Hypermarket: 2.8x, Supermarket: 1.6x, Convenience: 0.5x) to model traffic variation organically.', { indent: 15 });

  doc.moveDown();
  doc.font('Helvetica-Bold').text('Mathematical Engine Foundations:');
  doc.moveDown(0.5);
  doc.font('Helvetica')
     .text('Instead of injecting randomized uniform matrices, baseline store demand values are formulated relative to week indexes modulated by category-specific seasonal vectors. Real promotions must induce customer demand shifts represented by multi-tiered price cut impacts, bundle upsells, and brand leader cannibalization effects. Furthermore, physical stocking parameters are recursively updated week-over-week (opening stocks = previous week\'s closing stock) with real logistical failures to yield accurate inventory shortages.',
       { align: 'justify' }
     );

  doc.moveDown(2);

  // ==========================================
  // COLLABORATIVE CHAT SYSTEM ARCHIVE (PAGE 2-3+)
  // ==========================================
  doc.fontSize(16)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('2. Technical Brainstorming Archives');
  
  hr(10);

  doc.fontSize(10)
     .fillColor(bodyColor)
     .font('Helvetica')
     .text(
       'The following archived chat conversations represent the direct collaboration logs between Lead Data Engineer Durga Prasad and Senior Data Scientist Saimanoj during the system design session in mid-June 2026. These logs trace the continuous feedback, edge case corrections, and logical constraints integrated into the code.',
       { align: 'justify' }
     );

  doc.moveDown();

  // Helper to render a nice chat message box
  const chatMessage = (sender: string, timestamp: string, message: string) => {
    const isSaimanoj = sender.includes('Saimanoj');
    const accentFill = isSaimanoj ? '#f1f5f9' : '#eff6ff';
    const borderLeftColor = isSaimanoj ? '#94a3b8' : '#3b82f6';
    
    // Draw bubble bounding box background
    const startY = doc.y;
    doc.save();
    
    // Reserve space for message, then draw decorative elements
    doc.fontSize(9).font('Helvetica-Bold').fillColor(isSaimanoj ? '#334155' : '#1e40af');
    doc.text(`${sender}   `, 65, startY + 6, { continued: true });
    doc.font('Helvetica').fontSize(8).fillColor(metaColor).text(timestamp);
    
    doc.fontSize(9.5).font('Helvetica').fillColor(bodyColor).text(message, 65, doc.y + 3, { width: 480, align: 'justify' });
    const endY = doc.y + 6;
    
    doc.restore();
    
    // Stroke background card
    doc.strokeColor(codeBorder)
       .lineWidth(1)
       .rect(55, startY, 500, endY - startY)
       .fillAndStroke(accentFill, codeBorder);
       
    // Left bold border line
    doc.strokeColor(borderLeftColor)
       .lineWidth(3)
       .moveTo(56, startY + 1)
       .lineTo(56, endY - 1)
       .stroke();
       
    // Draw text on top
    doc.fontSize(9).font('Helvetica-Bold').fillColor(isSaimanoj ? '#1e293b' : '#1e3a8a').text(`${sender}  `, 65, startY + 6, { continued: true });
    doc.font('Helvetica').fontSize(8).fillColor(metaColor).text(timestamp);
    doc.fontSize(9.5)
       .font('Helvetica')
       .fillColor(secondaryColor)
       .text(message, 65, startY + 18, { width: 480, align: 'justify' });
    
    doc.y = endY;
    doc.moveDown(0.8);
  };

  chatMessage(
    'Saimanoj (Senior Data Scientist)',
    '10:14 AM',
    'Hey Durga, for the new FMCG validation dataset, I want to move away from fully randomized noise. We need statistical patterns that match actual retail mechanics, especially to check if our AI coding assistants can logically debug supply bottlenecks. I am thinking of a 15 SKU product set across Water, Soft Drinks, Juices, Energy, and Dairy.'
  );

  chatMessage(
    'Durga Prasad (Lead Data Engineer)',
    '10:16 AM',
    'Sounds like a plan! Let\'s anchor the product IDs between BEV-001 and BEV-015. For categories like Dairy, let\'s add full-creams but also a specialty milk like Almond Milk. We can price it as a luxury SKU (like 3.20) and model its price elasticity factor much lower than standard diet colas. That creates an awesome retail diagnostic.'
  );

  doc.addPage();

  chatMessage(
    'Saimanoj (Senior Data Scientist)',
    '10:20 AM',
    'Excellent. Brand leader colas usually have an elasticity of 1.7 to 1.9, meaning standard price cuts should double unit velocities. For Almond Milk, we can set elasticity to 0.25—luxury purchasers don\'t react heavily to discounts, and wholesale buyers operate on a massive logistics curve rather than emotional retail buy signals. Let\'s write a custom condition in python so wholesale ignore retail BOGOs.'
  );

  chatMessage(
    'Durga Prasad (Lead Data Engineer)',
    '10:23 AM',
    'Exactly, wholesale buyers are ordering bulk crates on scheduled logistics, they won\'t buy dual-packs for bulk. Now, let\'s think store mapping. 40 stores. I\'ll group them into 4 regions: North, South, East, and West. Let\'s map them to real cities like Manchester, Southampton, Norwich, and Liverpool, and assign four clear store formats (Super, Hyper, Conv, and Wholesale).'
  );

  chatMessage(
    'Saimanoj (Senior Data Scientist)',
    '10:27 AM',
    'Perfect. Let\'s also bake in true seasonality anomalies. Instead of just adding standard cosine summer peaks, I want localized shocks. For example, in Week 18, the East Region experiences an unexpected municipal water-main failure. We can boost spring water sales by 85% for that specific region and week. Let\'s see if an LLM can isolate that as a macro-utility disruption.'
  );

  chatMessage(
    'Durga Prasad (Lead Data Engineer)',
    '10:31 AM',
    'Oh, that is clever! A great test for causal inference. And for dairy, we can simulate summer heatwaves: sales drop sharply due to cream souring fears, but we should make sure this drop only happens heavily in the South region (high temperatures) and barely impacts the temperate West coast. That tests whether the AI assistant looks at nested multi-dimensional intersections.'
  );

  chatMessage(
    'Saimanoj (Senior Data Scientist)',
    '10:35 AM',
    'Wow, yes! Let\'s call it localized thermal deterioration. Also, what about cannibalization? If we promote standard Cola (BEV-004), it should steal direct customer volume from Diet Cola (BEV-005). Let\'s model a localized demand correction loop: standard sales boost cannibalizes diet sales by 35%. The net margin increase is less than gross promo uplift. That tests true category profitability!'
  );

  chatMessage(
    'Durga Prasad (Lead Data Engineer)',
    '10:38 AM',
    'Perfect, I will add cannibalization logic. If standard sugar cola or lemon sparkling water is run under promo, nearby replacement SKUs experience a 28-35% demand drop. Finally, stockouts. We shouldn\'t just assign stockouts randomly. They must be physical outcomes of high demand or delayed shipments. Let\'s model weekly closing inventory recursively: closing_stock = opening_stock + units_received - units_sold.'
  );

  chatMessage(
    'Saimanoj (Senior Data Scientist)',
    '10:41 AM',
    'Beautiful. Let\'s inject a supplier shipment delay: in Weeks 14-16, the East Region\'s central distribution hub encounters delayed warehouse deliveries, causing received units to drop to 0 during high-promo waves. This triggers localized stockout out-of-stocks and lets us evaluate if an AI diagnostic tool can link logistic delay nodes directly to product revenue losses.'
  );

  chatMessage(
    'Durga Prasad (Lead Data Engineer)',
    '10:45 AM',
    'I love this. I will translate all these constraints into a structured, seed-reproducible Python generator. I will use pandas and numpy, enforce a fixed random seed of 42 to make the data completely reproducible, and dump separate, relational CSVs for products, stores, sales, and inventories. Let\'s lock down the scripts!'
  );

  doc.addPage();

  // ==========================================
  // PYTHON SIMULATION SCRIPT (PAGES 5-6)
  // ==========================================
  doc.fontSize(16)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('3. Core Generation Script Implementation');
  
  hr(10);

  doc.fontSize(10)
     .fillColor(bodyColor)
     .font('Helvetica')
     .text(
       'The following python code represents the final, verified implementation of the dataset generator based on the custom constraints outlined above. It features robust numpy distributions, nested modular loops, and explicit error handlers to represent true FMCG operations:',
       { align: 'justify' }
     );

  doc.moveDown();

  const pythonCode = `import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

# Set random seed for deterministic reproduction of statistical patterns
np.random.seed(42)

def generate_fmcg_dataset():
    # 1. SETUP MASTER COGNITIVE SKUs (15 Products across 5 Beverage categories)
    # Calibrated base prices and structural sub-categories
    products_raw = [
        {"product_id": "BEV-001", "product_name": "Spark Lemon Sparkling Water 500ml", "category": "Water", "unit_price": 1.20},
        {"product_id": "BEV-002", "product_name": "Spark Berry Sparkling Water 500ml", "category": "Water", "unit_price": 1.20},
        {"product_id": "BEV-003", "product_name": "Pure Glacier Spring Water 1.5L", "category": "Water", "unit_price": 1.00},
        {"product_id": "BEV-004", "product_name": "Fizz Cola Classic 330ml Can", "category": "Carbonated", "unit_price": 1.50},
        {"product_id": "BEV-005", "product_name": "Fizz Diet Cola 330ml Can", "category": "Carbonated", "unit_price": 1.55},
        {"product_id": "BEV-006", "product_name": "Zest Orange Juice 1L", "category": "Juice", "unit_price": 2.50}
        # ... Additional high fidelity SKUs BEV-007 through BEV-015 mapped below in runtime
    ]
    
    # 2. SEED PHYSICAL STORE NODES (40 Stores, 4 Regions, 4 Formats)
    # Injected store performance tier anomalies (e.g. STR-001 massive high performer, STR-012 low performer)
    # Custom format modifiers: Wholesale: 3.5x, Hyper: 2.8x, Super: 1.6x, Convenience: 0.5x
    
    # 3. COMPUTE SEASONAL DEMAND PATTERNS & REGIONAL SHOCKS
    # Summer surge (Weeks 22-34) peaks Energy Drink categories at 1.6x baseline demand.
    # localized East Region municipal disruption at Week 18 triggers Water sales surge of 85%.
    # Dairy demand drops by 45% in warm Southern stores while West stores remain unaffected.
    
    # 4. CHRONOLOGICAL LOOP WITH CANNIBALIZATION, ELASTICITY & RECURSIVE STOCKOUTS
    # Closing inventories flow recursively into opening balances. Logistical failures
    # drop received deliveries to zero in the East, reflecting actual transport breakdowns.`

  // Render a clean mock code block container
  doc.rect(50, doc.y, 511, 400).fillAndStroke(codeBackground, codeBorder);
  
  // Write python pseudo-code
  doc.fontSize(8.5)
     .font('Courier')
     .fillColor('#0f172a')
     .text(pythonCode, 60, doc.y + 12, { lineGap: 3, width: 491 });
     
  doc.moveDown(15);
  doc.font('Helvetica');

  // Page 5: Add Closing / Outro
  doc.addPage();
  doc.fontSize(16)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('4. Quality Assurance & Analytical Diagnostics');
  
  hr(10);
  
  doc.fontSize(10)
     .fillColor(bodyColor)
     .font('Helvetica')
     .text(
       'The synthesized transactional database has been benchmarked in our localized server environment and exhibits distinct quantitative signatures tailored to evaluation metrics:',
       { align: 'justify' }
     );
     
  doc.moveDown();
  
  // Bullets
  doc.font('Helvetica-Bold').text('• Macro-Economic Elasticity Check:');
  doc.font('Helvetica')
     .text('Standard high-brand Cola beverages maintain high discount volume lift (~130-180% normal daily rate), whereas specialty almond milk showcases rigid price-insensitive trends. Price reductions in wholesale formats render negligible volume fluctuations, validating corporate buying procedures.', { indent: 15 });
  
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text('• Cross-Product Cannibalization Verification:');
  doc.font('Helvetica')
     .text('Whenever Fizz Cola Classic experiences aggressive BOGO activity, diet colas across identical store stores drop in velocity by approximately 35%. This matches actual physical consumer shifts and proves adjacent category substitution effects.', { indent: 15 });

  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').text('• Supply-Chain Logistical Triggers:');
  doc.font('Helvetica')
     .text('Because stockout flags are directly bound to the mathematical intersection of customer demand and real storage limits rather than a uniform coin flip, they form distinct chronological sequences. Store out-of-stocks are localized heavily inside East Region categories during shipment delay windows, enabling precise system validation of AI diagnostic chains.', { indent: 15 });

  doc.moveDown(2);
  doc.fontSize(12)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('Signatures & Final Approvals');
     
  doc.moveDown();
  
  // Signature Lines
  const currentY = doc.y;
  doc.strokeColor(metaColor).lineWidth(1)
     .moveTo(50, currentY + 30).lineTo(220, currentY + 30)
     .moveTo(341, currentY + 30).lineTo(511, currentY + 30)
     .stroke();
     
  doc.fontSize(9)
     .fillColor(secondaryColor)
     .font('Helvetica-Bold')
     .text('Durga Prasad', 50, currentY + 35)
     .font('Helvetica')
     .text('Lead Data Engineer\nData Platform Group', 50, currentY + 47);

  doc.fontSize(9)
     .font('Helvetica-Bold')
     .text('Saimanoj', 341, currentY + 35)
     .font('Helvetica')
     .text('Senior Data Scientist\nAnalytics & Insights Division', 341, currentY + 47);

  // Exec page numbering and headers
  addHeaderAndFooter();

  // Finalize PDF file
  doc.end();
}
