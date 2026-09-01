import io
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_official_cyclone_bulletin_pdf(data: dict) -> bytes:
    """
    Generates a professional, print-ready Indian Meteorological Department (IMD)
    standard Tropical Cyclone Advisory Bulletin as a PDF in memory.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, 
        pagesize=letter, 
        rightMargin=40, 
        leftMargin=40, 
        topMargin=40, 
        bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'GovTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=colors.HexColor('#003087'),
        alignment=1
    )
    sub_title_style = ParagraphStyle(
        'GovSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#475569'),
        alignment=1
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#003087'),
        spaceBefore=10,
        spaceAfter=4
    )
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1E293B')
    )
    alert_box_style = ParagraphStyle(
        'AlertBoxText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#991B1B')
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("GOVERNMENT OF INDIA", title_style))
    story.append(Paragraph("MINISTRY OF EARTH SCIENCES | INDIA METEOROLOGICAL DEPARTMENT", sub_title_style))
    story.append(Paragraph("REGIONAL SPECIALIZED METEOROLOGICAL CENTRE (RSMC) — TROPICAL CYCLONES, NEW DELHI", sub_title_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#003087'), spaceBefore=2, spaceAfter=8))

    # 2. Bulletin Metadata Block
    now_str = datetime.datetime.now().strftime("%d-%m-%Y / %H:%M HRS IST")
    cyclone_name = data.get("cyclone_name", "TC-2026-ALPHA")
    basin = data.get("basin", "Bay of Bengal")
    category = data.get("category", "Severe Cyclonic Storm")

    meta_table_data = [
        [Paragraph("<b>BULLETIN NO.:</b> CYCLONEAI/RSMC/2026/04", body_style), Paragraph(f"<b>TIME OF ISSUE:</b> {now_str}", body_style)],
        [Paragraph(f"<b>TARGET SYSTEM:</b> {cyclone_name}", body_style), Paragraph(f"<b>OCEAN BASIN:</b> {basin}", body_style)],
        [Paragraph(f"<b>INTENSITY CLASSIFICATION:</b> {category}", body_style), Paragraph("<b>WARNING STATUS:</b> RED ALERT (Level 3)", body_style)],
    ]
    meta_table = Table(meta_table_data, colWidths=[260, 260])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 12))

    # 3. Synoptic Observation
    story.append(Paragraph("1. OBSERVED SYNOPTIC SITUATION", section_heading))
    lat = data.get("latitude", 15.4)
    lon = data.get("longitude", 87.8)
    wind = data.get("wind_speed_kmh", 85)
    pressure = data.get("central_mslp_hpa", 980)

    obs_text = (
        f"The <b>{category} \"{cyclone_name}\"</b> over West-Central {basin} moved North-Westwards "
        f"and lay centered at 0830 UTC near <b>Latitude {lat}°N and Longitude {lon}°E</b>. "
        f"Current Maximum Sustained Surface Winds are estimated at <b>{wind} km/h (46 knots)</b> gusting to {wind + 20} km/h. "
        f"Estimated central central sea-level pressure is <b>{pressure} hPa</b> with an environmental pressure deficit of 28 hPa."
    )
    story.append(Paragraph(obs_text, body_style))
    story.append(Spacer(1, 10))

    # 4. AI 72-Hour Forecast Track Table
    story.append(Paragraph("2. AI-ASSISTED SPATIOTEMPORAL TRAJECTORY & INTENSITY OUTLOOK", section_heading))
    track_rows = [
        ["Date / Time", "Projected Position", "Max Wind (km/h)", "MSLP (hPa)", "Classification Stage"],
        ["29-08 / 14:30 IST", f"{lat}°N, {lon}°E", f"{wind}", f"{pressure}", "Current Fix"],
        ["30-08 / 02:30 IST (+12h)", "16.9°N, 86.5°E", "101", "966", "Severe Cyclonic Storm"],
        ["30-08 / 14:30 IST (+24h)", "18.2°N, 85.6°E", "115", "955", "Landfall Window (Peak)"],
        ["31-08 / 14:30 IST (+48h)", "20.1°N, 84.2°E", "105", "962", "Inland Weakening"],
        ["01-09 / 14:30 IST (+72h)", "22.0°N, 83.0°E", "90", "970", "Deep Depression"],
    ]
    track_table = Table(track_rows, colWidths=[110, 110, 85, 75, 140])
    track_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003087')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F1F5F9')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(track_table)
    story.append(Spacer(1, 10))

    # 5. Sectoral Warnings
    story.append(Paragraph("3. WARNINGS & CIVIL DEFENCE ACTION DIRECTIVES", section_heading))
    warnings_data = [
        [Paragraph("<b>STORM SURGE:</b> Inundation of low-lying coastal areas of Ganjam, Puri, and Srikakulam up to 2.5–3.2 meters above astronomical tide at time of landfall.", alert_box_style)],
        [Paragraph("<b>FISHERMEN WARNING:</b> Total suspension of all marine fishing operations over West-Central and North Bay of Bengal. Vessels at sea advised to return immediately.", alert_box_style)],
        [Paragraph("<b>PORT ADVISORY:</b> Hoist Great Danger Signal No. 8 at Gopalpur and Paradip ports. Local Cautionary Signal No. 3 at Visakhapatnam.", alert_box_style)],
        [Paragraph("<b>EVACUATION DIRECTIVE:</b> State Disaster Management Authorities (OSDMA/APSDMA) advised to complete evacuation of vulnerable villages within 5 km of shoreline by 30th morning.", alert_box_style)]
    ]
    warning_table = Table(warnings_data, colWidths=[520])
    warning_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FEF2F2')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#DC2626')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#FCA5A5')),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(warning_table)
    story.append(Spacer(1, 15))

    # 6. Sign-off Footer
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#CBD5E1'), spaceBefore=5, spaceAfter=8))
    story.append(Paragraph("<b>ISSUED BY:</b> Cyclone Warning Division, India Meteorological Department, New Delhi", body_style))
    story.append(Paragraph("<i>Powered by CycloneAI Deep Learning Inference Engine (SIH 2026)</i>", sub_title_style))

    doc.build(story)
    return buffer.getvalue()
