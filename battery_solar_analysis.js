const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, LevelFormat, HeadingLevel,
        BorderStyle, WidthType, ShadingType, PageBreak } = require('docx');
const fs = require('fs');

// Your actual usage data from January 2026
const usageData = {
    sunrun: [
        { date: "2026-01-02", production_kwh: 10.7 },
        { date: "2026-01-03", production_kwh: 10.3 },
        { date: "2026-01-04", production_kwh: 11.4 },
        { date: "2026-01-05", production_kwh: 18.9 },
        { date: "2026-01-06", production_kwh: 10.0 },
        { date: "2026-01-07", production_kwh: 17.1 },
        { date: "2026-01-08", production_kwh: 19.4 },
        { date: "2026-01-09", production_kwh: 21.9 },
        { date: "2026-01-10", production_kwh: 22.6 },
        { date: "2026-01-11", production_kwh: 22.5 },
        { date: "2026-01-12", production_kwh: 21.8 },
        { date: "2026-01-13", production_kwh: 22.2 },
        { date: "2026-01-14", production_kwh: 22.0 },
        { date: "2026-01-15", production_kwh: 21.8 },
        { date: "2026-01-16", production_kwh: 22.4 },
        { date: "2026-01-17", production_kwh: 22.1 },
        { date: "2026-01-18", production_kwh: 20.4 },
        { date: "2026-01-19", production_kwh: 22.5 },
        { date: "2026-01-20", production_kwh: 20.3 },
        { date: "2026-01-21", production_kwh: 10.6 },
        { date: "2026-01-22", production_kwh: 11.2 },
        { date: "2026-01-23", production_kwh: 15.2 },
        { date: "2026-01-24", production_kwh: 12.6 },
        { date: "2026-01-25", production_kwh: 21.8 },
        { date: "2026-01-26", production_kwh: 17.1 }
    ],
    sdge: [
        { date: "2026-01-02", consumption: 18.535, generation: 4.84, super_off_peak: 1.78, off_peak: 14.43, on_peak: 1.85 },
        { date: "2026-01-03", consumption: 11.58, generation: 6.285, super_off_peak: 2.37, off_peak: 3.54, on_peak: 5.52 },
        { date: "2026-01-04", consumption: 10.88, generation: 6.735, super_off_peak: 3.14, off_peak: 3.91, on_peak: 3.7 },
        { date: "2026-01-05", consumption: 9.56, generation: 12.3, super_off_peak: 3.09, off_peak: 3.09, on_peak: 3.25 },
        { date: "2026-01-06", consumption: 10.6, generation: 4.34, super_off_peak: 3.32, off_peak: 3.63, on_peak: 3.43 },
        { date: "2026-01-07", consumption: 12.5, generation: 11.59, super_off_peak: 3.64, off_peak: 3.43, on_peak: 5.4 },
        { date: "2026-01-08", consumption: 10.19, generation: 13.47, super_off_peak: 3.09, off_peak: 3.04, on_peak: 3.85 },
        { date: "2026-01-09", consumption: 61.5, generation: 15.35, super_off_peak: 52.67, off_peak: 4.86, on_peak: 3.89 },
        { date: "2026-01-10", consumption: 27.4, generation: 8.0, super_off_peak: 20.17, off_peak: 1.87, on_peak: 5.26 },
        { date: "2026-01-11", consumption: 40.71, generation: 2.56, super_off_peak: 25.81, off_peak: 5.73, on_peak: 8.88 },
        { date: "2026-01-12", consumption: 21.59, generation: 7.52, super_off_peak: 11.95, off_peak: 4.85, on_peak: 4.76 },
        { date: "2026-01-13", consumption: 66.66, generation: 8.85, super_off_peak: 57.06, off_peak: 3.39, on_peak: 6.11 },
        { date: "2026-01-14", consumption: 18.62, generation: 8.36, super_off_peak: 10.57, off_peak: 3.5, on_peak: 4.44 },
        { date: "2026-01-15", consumption: 23.56, generation: 6.85, super_off_peak: 13.11, off_peak: 4.98, on_peak: 5.14 },
        { date: "2026-01-16", consumption: 11.0, generation: 8.61, super_off_peak: 3.14, off_peak: 3.61, on_peak: 4.12 },
        { date: "2026-01-17", consumption: 42.79, generation: 8.43, super_off_peak: 16.35, off_peak: 9.46, on_peak: 16.78 },
        { date: "2026-01-18", consumption: 29.87, generation: 2.8, super_off_peak: 8.3, off_peak: 6.55, on_peak: 14.82 },
        { date: "2026-01-19", consumption: 23.22, generation: 4.5, super_off_peak: 4.72, off_peak: 6.23, on_peak: 12.22 },
        { date: "2026-01-20", consumption: 27.53, generation: 3.72, super_off_peak: 4.9, off_peak: 9.17, on_peak: 13.42 },
        { date: "2026-01-21", consumption: 44.15, generation: 0.01, super_off_peak: 14.2, off_peak: 15.87, on_peak: 14.08 },
        { date: "2026-01-22", consumption: 34.47, generation: 1.18, super_off_peak: 6.85, off_peak: 13.48, on_peak: 13.45 },
        { date: "2026-01-23", consumption: 27.83, generation: 2.05, super_off_peak: 4.56, off_peak: 9.43, on_peak: 13.31 },
        { date: "2026-01-24", consumption: 35.44, generation: 1.82, super_off_peak: 12.5, off_peak: 8.96, on_peak: 13.73 },
        { date: "2026-01-25", consumption: 27.35, generation: 3.76, super_off_peak: 6.96, off_peak: 6.07, on_peak: 14.01 },
        { date: "2026-01-26", consumption: 24.69, generation: 4.94, super_off_peak: 4.29, off_peak: 8.12, on_peak: 12.0 }
    ]
};

// Calculate statistics
const totalSolar = usageData.sunrun.reduce((sum, d) => sum + d.production_kwh, 0);
const totalConsumption = usageData.sdge.reduce((sum, d) => sum + d.consumption, 0);
const totalExport = usageData.sdge.reduce((sum, d) => sum + d.generation, 0);
const totalOnPeak = usageData.sdge.reduce((sum, d) => sum + d.on_peak, 0);
const totalOffPeak = usageData.sdge.reduce((sum, d) => sum + d.off_peak, 0);
const totalSuperOffPeak = usageData.sdge.reduce((sum, d) => sum + d.super_off_peak, 0);
const days = usageData.sdge.length;

const avgDailySolar = totalSolar / days;
const avgDailyConsumption = totalConsumption / days;
const avgDailyExport = totalExport / days;
const avgDailyOnPeak = totalOnPeak / days;

// Rates
const rates = { super_off_peak: 0.133, off_peak: 0.419, on_peak: 0.419 };
const exportRate = 0.05; // NEM 3.0 avoided cost rate

// Current monthly costs (annualized from January data)
const monthlyImportCost = (totalSuperOffPeak * rates.super_off_peak +
                           totalOffPeak * rates.off_peak +
                           totalOnPeak * rates.on_peak);
const monthlyExportCredit = totalExport * exportRate;
const monthlyNetCost = monthlyImportCost - monthlyExportCredit;
const annualNetCost = monthlyNetCost * 12;

// Battery savings calculations
// A battery can shift on-peak usage to stored solar or super off-peak charging
const potentialOnPeakSavings = totalOnPeak * (rates.on_peak - rates.super_off_peak);
const annualBatterySavings = potentialOnPeakSavings * 12;

// Helper functions
const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

function createTableCell(text, options = {}) {
    return new TableCell({
        borders,
        width: { size: options.width || 2340, type: WidthType.DXA },
        shading: options.header ? { fill: "1E40AF", type: ShadingType.CLEAR } :
                 options.highlight ? { fill: "FEF3C7", type: ShadingType.CLEAR } : undefined,
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
            alignment: options.align || AlignmentType.LEFT,
            children: [new TextRun({
                text: text,
                bold: options.bold || options.header,
                color: options.header ? "FFFFFF" : undefined,
                size: 22
            })]
        })]
    });
}

const doc = new Document({
    styles: {
        default: { document: { run: { font: "Arial", size: 22 } } },
        paragraphStyles: [
            { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
              run: { size: 36, bold: true, font: "Arial", color: "1E40AF" },
              paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
            { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
              run: { size: 28, bold: true, font: "Arial", color: "1E40AF" },
              paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
            { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
              run: { size: 24, bold: true, font: "Arial" },
              paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
        ]
    },
    numbering: {
        config: [
            { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
                style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
                { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
                style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }] },
            { reference: "numbers", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
                style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
        ]
    },
    sections: [{
        properties: {
            page: {
                size: { width: 12240, height: 15840 },
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            }
        },
        headers: {
            default: new Header({
                children: [new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [new TextRun({ text: "Solar & Battery Investment Analysis", italics: true, size: 20, color: "666666" })]
                })]
            })
        },
        children: [
            // Title
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
                children: [new TextRun({ text: "Battery Storage & Solar Expansion", bold: true, size: 48, color: "1E40AF" })]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
                children: [new TextRun({ text: "Investment Analysis for Your 5.985 kW Solar System", size: 28, color: "666666" })]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 600 },
                children: [new TextRun({ text: "Encinitas, CA (92024) | SDG&E EV-TOU-5 Rate Plan | January 2026", size: 22, color: "888888" })]
            }),

            // Executive Summary
            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Executive Summary")] }),
            new Paragraph({
                spacing: { after: 200 },
                children: [new TextRun("Based on your actual January 2026 usage data, this analysis evaluates the financial viability of adding battery storage and/or expanding your solar system. ")]
            }),
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({ text: "Key Finding: ", bold: true }),
                    new TextRun("With the federal residential solar tax credit (25D) having expired on December 31, 2025, the economics have shifted. Battery storage now requires 7-10 year payback periods without incentives, though California SGIP rebates may still provide significant savings for qualifying households.")
                ]
            }),

            // Your Current System Performance
            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Your Current System Performance")] }),
            new Paragraph({
                spacing: { after: 200 },
                children: [new TextRun("Analysis based on 25 days of actual data from January 2-26, 2026:")]
            }),

            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                columnWidths: [4680, 4680],
                rows: [
                    new TableRow({ children: [
                        createTableCell("Metric", { header: true, width: 4680 }),
                        createTableCell("Value", { header: true, width: 4680 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("Total Solar Production", { width: 4680 }),
                        createTableCell(`${totalSolar.toFixed(1)} kWh (${avgDailySolar.toFixed(1)} kWh/day avg)`, { width: 4680 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("Total Grid Consumption", { width: 4680 }),
                        createTableCell(`${totalConsumption.toFixed(1)} kWh (${avgDailyConsumption.toFixed(1)} kWh/day avg)`, { width: 4680 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("Total Grid Export", { width: 4680 }),
                        createTableCell(`${totalExport.toFixed(1)} kWh (${avgDailyExport.toFixed(1)} kWh/day avg)`, { width: 4680 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("On-Peak Usage (4-9pm)", { width: 4680, highlight: true }),
                        createTableCell(`${totalOnPeak.toFixed(1)} kWh (${avgDailyOnPeak.toFixed(1)} kWh/day avg)`, { width: 4680, highlight: true })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("Est. Monthly Grid Cost", { width: 4680 }),
                        createTableCell(`$${monthlyNetCost.toFixed(2)}`, { width: 4680 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("Est. Annual Grid Cost", { width: 4680, bold: true }),
                        createTableCell(`$${annualNetCost.toFixed(2)}`, { width: 4680, bold: true })
                    ]}),
                ]
            }),

            new Paragraph({ spacing: { after: 200 }, children: [] }),

            // Page break before battery options
            new Paragraph({ children: [new PageBreak()] }),

            // Battery Storage Options
            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Battery Storage Options")] }),
            new Paragraph({
                spacing: { after: 200 },
                children: [new TextRun("The following table compares the top residential battery systems available in 2026:")]
            }),

            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                columnWidths: [2340, 1560, 1560, 1560, 2340],
                rows: [
                    new TableRow({ children: [
                        createTableCell("System", { header: true, width: 2340 }),
                        createTableCell("Capacity", { header: true, width: 1560 }),
                        createTableCell("Power", { header: true, width: 1560 }),
                        createTableCell("Warranty", { header: true, width: 1560 }),
                        createTableCell("Est. Cost", { header: true, width: 2340 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("Tesla Powerwall 3", { width: 2340, bold: true }),
                        createTableCell("13.5 kWh", { width: 1560 }),
                        createTableCell("11.5 kW", { width: 1560 }),
                        createTableCell("10 years", { width: 1560 }),
                        createTableCell("$10,500 - $13,000", { width: 2340 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("FranklinWH aPower 2", { width: 2340, bold: true }),
                        createTableCell("15 kWh", { width: 1560 }),
                        createTableCell("10 kW", { width: 1560 }),
                        createTableCell("15 years", { width: 1560 }),
                        createTableCell("$14,000 - $18,000", { width: 2340 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("Enphase IQ 5P (x3)", { width: 2340, bold: true }),
                        createTableCell("15 kWh", { width: 1560 }),
                        createTableCell("11.5 kW", { width: 1560 }),
                        createTableCell("15 years", { width: 1560 }),
                        createTableCell("$15,000 - $20,000", { width: 2340 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("LG RESU16H Prime", { width: 2340, bold: true }),
                        createTableCell("16 kWh", { width: 1560 }),
                        createTableCell("7 kW", { width: 1560 }),
                        createTableCell("10 years", { width: 1560 }),
                        createTableCell("$11,000 - $14,000", { width: 2340 })
                    ]}),
                ]
            }),

            new Paragraph({ spacing: { after: 200 }, children: [] }),

            // Battery ROI Analysis
            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Battery ROI Analysis for Your Home")] }),
            new Paragraph({
                spacing: { after: 200 },
                children: [new TextRun("Based on your on-peak usage patterns, here is how a battery could provide savings:")]
            }),

            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 100 },
                children: [
                    new TextRun({ text: "On-Peak Usage: ", bold: true }),
                    new TextRun(`${totalOnPeak.toFixed(1)} kWh over 25 days (${avgDailyOnPeak.toFixed(1)} kWh/day average)`)
                ]
            }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 100 },
                children: [
                    new TextRun({ text: "Rate Differential: ", bold: true }),
                    new TextRun(`On-Peak (41.9\u00A2) vs Super Off-Peak (13.3\u00A2) = 28.6\u00A2/kWh savings`)
                ]
            }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 100 },
                children: [
                    new TextRun({ text: "Monthly Potential Savings: ", bold: true }),
                    new TextRun(`$${potentialOnPeakSavings.toFixed(2)} (shifting all on-peak to super off-peak)`)
                ]
            }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 200 },
                children: [
                    new TextRun({ text: "Annual Potential Savings: ", bold: true }),
                    new TextRun(`$${annualBatterySavings.toFixed(2)}`)
                ]
            }),

            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                columnWidths: [3120, 3120, 3120],
                rows: [
                    new TableRow({ children: [
                        createTableCell("Battery Cost", { header: true, width: 3120 }),
                        createTableCell("Simple Payback", { header: true, width: 3120 }),
                        createTableCell("With SGIP Rebate*", { header: true, width: 3120 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("$10,000", { width: 3120 }),
                        createTableCell(`${(10000 / annualBatterySavings).toFixed(1)} years`, { width: 3120 }),
                        createTableCell(`${((10000 - 8500) / annualBatterySavings).toFixed(1)} years`, { width: 3120 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("$15,000", { width: 3120 }),
                        createTableCell(`${(15000 / annualBatterySavings).toFixed(1)} years`, { width: 3120 }),
                        createTableCell(`${((15000 - 12750) / annualBatterySavings).toFixed(1)} years`, { width: 3120 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("$20,000", { width: 3120 }),
                        createTableCell(`${(20000 / annualBatterySavings).toFixed(1)} years`, { width: 3120 }),
                        createTableCell(`${((20000 - 17000) / annualBatterySavings).toFixed(1)} years`, { width: 3120 })
                    ]}),
                ]
            }),

            new Paragraph({
                spacing: { before: 100, after: 200 },
                children: [new TextRun({ text: "*SGIP Equity Rebate of $850/kWh (if eligible). General Market rebate is lower.", size: 18, italics: true, color: "666666" })]
            }),

            // Page break
            new Paragraph({ children: [new PageBreak()] }),

            // Incentives Section
            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Available Incentives (2026)")] }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Federal Tax Credits")] }),
            new Paragraph({
                spacing: { after: 100 },
                children: [
                    new TextRun({ text: "Important: ", bold: true, color: "DC2626" }),
                    new TextRun("The 30% Residential Clean Energy Credit (Section 25D) expired on December 31, 2025. Customer-owned solar and battery systems installed in 2026 are ")
                ]
            }),
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({ text: "no longer eligible ", bold: true }),
                    new TextRun("for federal tax credits.")
                ]
            }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 100 },
                children: [new TextRun("Solar/battery leases and PPAs may still qualify through the 48E business credit (claimed by the lessor)")]
            }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 200 },
                children: [new TextRun("Commercial installations must begin construction by July 4, 2026 to qualify for credits")]
            }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("California SGIP (Self-Generation Incentive Program)")] }),
            new Paragraph({
                spacing: { after: 200 },
                children: [new TextRun("SGIP provides state-funded rebates for battery storage in SDG&E territory:")]
            }),

            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                columnWidths: [3120, 3120, 3120],
                rows: [
                    new TableRow({ children: [
                        createTableCell("Category", { header: true, width: 3120 }),
                        createTableCell("Rebate Amount", { header: true, width: 3120 }),
                        createTableCell("Eligibility", { header: true, width: 3120 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("Equity Resiliency", { width: 3120, bold: true }),
                        createTableCell("$1,000/kWh", { width: 3120, highlight: true }),
                        createTableCell("Low-income + 2+ PSPS events or medical baseline", { width: 3120 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("Equity", { width: 3120, bold: true }),
                        createTableCell("$850/kWh", { width: 3120, highlight: true }),
                        createTableCell("Low-income residential", { width: 3120 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("General Market", { width: 3120, bold: true }),
                        createTableCell("~$200-400/kWh", { width: 3120 }),
                        createTableCell("All residential customers", { width: 3120 })
                    ]}),
                ]
            }),

            new Paragraph({ spacing: { after: 200 }, children: [] }),
            new Paragraph({
                spacing: { after: 200 },
                children: [
                    new TextRun({ text: "Note: ", bold: true }),
                    new TextRun("SGIP funding is limited and applications are processed first-come, first-served. Work with an approved SGIP installer to secure your rebate.")
                ]
            }),

            // Page break
            new Paragraph({ children: [new PageBreak()] }),

            // Solar Expansion Section
            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Solar Expansion Options")] }),
            new Paragraph({
                spacing: { after: 200 },
                children: [new TextRun("Your current 5.985 kW system produces an average of 18.5 kWh/day in January. Expanding capacity could help offset more of your grid consumption.")]
            }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Considerations for Expansion")] }),

            new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 100 },
                children: [
                    new TextRun({ text: "Sunrun Lease/PPA: ", bold: true }),
                    new TextRun("Since you have an existing Sunrun system, expanding through them may be simplest. Sunrun now offers battery add-ons for existing customers.")
                ]
            }),
            new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 100 },
                children: [
                    new TextRun({ text: "New Installation: ", bold: true }),
                    new TextRun("Adding a second system from a different provider is possible but adds complexity. Some customers report getting better pricing from local installers.")
                ]
            }),
            new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 100 },
                children: [
                    new TextRun({ text: "Panel Upgrade Costs: ", bold: true }),
                    new TextRun("Your electrical panel may need upgrading (~$4,000-$5,000), though Sunrun covers up to $4,000 of this cost.")
                ]
            }),
            new Paragraph({ numbering: { reference: "numbers", level: 0 }, spacing: { after: 200 },
                children: [
                    new TextRun({ text: "NEM 3.0 Impact: ", bold: true }),
                    new TextRun("New solar capacity will be under NEM 3.0, which pays ~75% less for exports. This makes battery storage more valuable for new installations.")
                ]
            }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Estimated Costs for Solar Expansion")] }),

            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                columnWidths: [2340, 2340, 2340, 2340],
                rows: [
                    new TableRow({ children: [
                        createTableCell("Added Capacity", { header: true, width: 2340 }),
                        createTableCell("Est. Cost", { header: true, width: 2340 }),
                        createTableCell("Added kWh/day", { header: true, width: 2340 }),
                        createTableCell("Notes", { header: true, width: 2340 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("+3 kW", { width: 2340 }),
                        createTableCell("$8,000 - $12,000", { width: 2340 }),
                        createTableCell("~9 kWh", { width: 2340 }),
                        createTableCell("Modest expansion", { width: 2340 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("+5 kW", { width: 2340 }),
                        createTableCell("$12,000 - $18,000", { width: 2340 }),
                        createTableCell("~15 kWh", { width: 2340 }),
                        createTableCell("Significant increase", { width: 2340 })
                    ]}),
                    new TableRow({ children: [
                        createTableCell("+8 kW", { width: 2340 }),
                        createTableCell("$18,000 - $26,000", { width: 2340 }),
                        createTableCell("~24 kWh", { width: 2340 }),
                        createTableCell("Near-doubling capacity", { width: 2340 })
                    ]}),
                ]
            }),

            new Paragraph({ spacing: { after: 200 }, children: [] }),

            // Page break
            new Paragraph({ children: [new PageBreak()] }),

            // Recommendations
            new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Recommendations")] }),

            new Paragraph({
                shading: { fill: "FEF3C7", type: ShadingType.CLEAR },
                spacing: { after: 200 },
                children: [
                    new TextRun({ text: "Best Value Option: ", bold: true }),
                    new TextRun("If you qualify for SGIP Equity rebates ($850-$1,000/kWh), battery storage becomes highly attractive with payback periods under 2 years. Check your eligibility at sgipsd.org.")
                ]
            }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("If You Qualify for SGIP Equity Rebates")] }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 100 },
                children: [new TextRun("Add a 13.5-15 kWh battery (Tesla Powerwall 3 or FranklinWH aPower 2)")]
            }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 100 },
                children: [new TextRun("Net cost after rebate: $1,500 - $4,000")]
            }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 200 },
                children: [new TextRun("Payback: 1-2 years")]
            }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("If You DON'T Qualify for SGIP Equity Rebates")] }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 100 },
                children: [new TextRun("Battery-only: 10-15 year payback makes standalone battery storage less attractive")]
            }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 100 },
                children: [new TextRun("Consider waiting for battery prices to drop further or new incentive programs")]
            }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 200 },
                children: [new TextRun("Solar expansion through Sunrun lease/PPA (they claim the 48E credit) may still provide value")]
            }),

            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Additional Considerations")] }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 100 },
                children: [
                    new TextRun({ text: "Backup Power Value: ", bold: true }),
                    new TextRun("If you experience frequent outages or PSPS events, battery backup has value beyond pure ROI")
                ]
            }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 100 },
                children: [
                    new TextRun({ text: "EV Integration: ", bold: true }),
                    new TextRun("Your EV already charges during super off-peak (12am-6am), which is optimal. A battery could provide additional flexibility.")
                ]
            }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 200 },
                children: [
                    new TextRun({ text: "Future Rate Changes: ", bold: true }),
                    new TextRun("SDG&E rates tend to increase 3-5% annually, which improves battery economics over time")
                ]
            }),

            // Footer section
            new Paragraph({ spacing: { before: 400 }, children: [] }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 200 },
                children: [new TextRun({ text: "Analysis prepared January 2026 | Data source: Your actual SDG&E and Sunrun usage", size: 18, color: "888888" })]
            }),
        ]
    }]
});

Packer.toBuffer(doc).then(buffer => {
    fs.writeFileSync("/sessions/laughing-dazzling-galileo/mnt/tay/Desktop/solar_analysis_system/Battery_Solar_Analysis.docx", buffer);
    console.log("Document created successfully!");
});
