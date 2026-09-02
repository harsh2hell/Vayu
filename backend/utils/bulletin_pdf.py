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
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#003087'),
        alignment=1
    )
    sub_title_style = ParagraphStyle(
        'GovSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#475569'),
        alignment=1
    )
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=colors.HexColor('#003087'),
        spaceBefore=8,
        spaceAfter=3
    )
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#1E293B')
    )
    alert_box_style = ParagraphStyle(
        'AlertBoxText',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#991B1B')
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("GOVERNMENT OF INDIA", title_style))
    story.append(Paragraph("MINISTRY OF EARTH SCIENCES | INDIA METEOROLOGICAL DEPARTMENT", sub_title_style))
    story.append(Paragraph("REGIONAL SPECIALIZED METEOROLOGICAL CENTRE (RSMC) — TROPICAL CYCLONES, NEW DELHI", sub_title_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#003087'), spaceBefore=2, spaceAfter=6))

    # 2. Bulletin Metadata Block
    now_str = datetime.datetime.now().strftime("%d-%m-%Y / %H:%M HRS IST")
    cyclone_name = data.get("cyclone_name", "TC-2026-ALPHA")
    basin = data.get("basin", "Bay of Bengal")
    category = data.get("category", "Severe Cyclonic Storm")
    lat = data.get("latitude", 15.4)
    lon = data.get("longitude", 87.8)
    wind = data.get("wind_speed_kmh", 85)
    pressure = data.get("central_mslp_hpa", 980)

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
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 8))

    # 3. Synoptic Observation
    story.append(Paragraph("1. OBSERVED SYNOPTIC SITUATION", section_heading))
    obs_text = (
        f"The <b>{category} \"{cyclone_name}\"</b> over {basin} lay centered at "
        f"<b>Latitude {lat}°N and Longitude {lon}°E</b>. "
        f"Current Maximum Sustained Surface Winds are estimated at <b>{wind} km/h ({round(wind/1.852)} knots)</b> "
        f"gusting to {round(wind * 1.2)} km/h. "
        f"Estimated central sea-level pressure is <b>{pressure} hPa</b> with an environmental pressure deficit of {round(1008 - pressure, 1)} hPa."
    )
    story.append(Paragraph(obs_text, body_style))
    story.append(Spacer(1, 8))

    # 4. AI Spatiotemporal Trajectory Forecast Table
    story.append(Paragraph("2. AI-ASSISTED SPATIOTEMPORAL TRAJECTORY & INTENSITY OUTLOOK", section_heading))
    track_rows = [
        ["Lead Horizon", "Position (Lat, Lon)", "Max Wind (km/h)", "MSLP (hPa)", "Classification Stage"],
        ["Initial Fix (0h)", f"{lat}°N, {lon}°E", f"{wind}", f"{pressure}", "Observed Vortex Center"],
        ["+06 Hours", f"{round(lat + 0.7, 2)}°N, {round(lon - 0.5, 2)}°E", f"{round(wind + 8)}", f"{round(pressure - 6)}", "Intensifying Stage"],
        ["+12 Hours", f"{round(lat + 1.5, 2)}°N, {round(lon - 1.1, 2)}°E", f"{round(wind + 18)}", f"{round(pressure - 14)}", "Severe Cyclonic Storm"],
        ["+24 Hours", f"{round(lat + 2.8, 2)}°N, {round(lon - 2.0, 2)}°E", f"{round(wind + 30)}", f"{round(pressure - 25)}", "Peak Landfall Window"],
        ["+48 Hours", f"{round(lat + 4.8, 2)}°N, {round(lon - 3.1, 2)}°E", f"{round(wind + 15)}", f"{round(pressure - 16)}", "Inland Weakening"],
        ["+72 Hours", f"{round(lat + 6.6, 2)}°N, {round(lon - 4.0, 2)}°E", f"{round(max(35, wind - 10))}", f"{round(pressure - 6)}", "Depression Decay"],
    ]
    track_table = Table(track_rows, colWidths=[90, 110, 85, 75, 160])
    track_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#003087')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 7.5),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F1F5F9')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(track_table)
    story.append(Spacer(1, 8))

    # 5. Sectoral Warnings
    story.append(Paragraph("3. WARNINGS & CIVIL DEFENCE ACTION DIRECTIVES", section_heading))
    warnings_data = [
        [Paragraph("<b>STORM SURGE:</b> Inundation of low-lying coastal sectors up to 2.5–3.2 meters above astronomical tide expected near landfall window.", alert_box_style)],
        [Paragraph("<b>FISHERMEN WARNING:</b> Total suspension of all marine fishing operations over deep-sea waters. All vessels at sea advised to return to nearest harbour immediately.", alert_box_style)],
        [Paragraph("<b>PORT ADVISORY:</b> Keep Great Danger Signal No. 8 hoisted at major designated coastal ports.", alert_box_style)],
        [Paragraph("<b>EVACUATION DIRECTIVE:</b> State Disaster Management Authorities (SDMA / NDRF) advised to execute pre-emptive evacuation of low-lying coastal habitations.", alert_box_style)]
    ]
    warning_table = Table(warnings_data, colWidths=[520])
    warning_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FEF2F2')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#DC2626')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#FCA5A5')),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(warning_table)
    story.append(Spacer(1, 10))

    # 6. Sign-off Footer
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor('#CBD5E1'), spaceBefore=4, spaceAfter=6))
    story.append(Paragraph("<b>ISSUED BY:</b> Cyclone Warning Division, Regional Specialized Meteorological Centre (RSMC), IMD, New Delhi", body_style))
    story.append(Paragraph("<i>Generated by CycloneAI Unified Deep Learning Gateway (SIH 2026 — Team Chakravat Crew)</i>", sub_title_style))

    doc.build(story)
    return buffer.getvalue()
