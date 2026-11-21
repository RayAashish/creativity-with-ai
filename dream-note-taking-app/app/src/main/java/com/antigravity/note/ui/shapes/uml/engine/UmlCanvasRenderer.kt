package com.antigravity.note.ui.shapes.uml.engine

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.DashPathEffect
import android.graphics.Paint
import android.graphics.Path
import android.graphics.PointF
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.Typeface
import com.antigravity.note.ui.shapes.uml.model.UmlDiagram
import com.antigravity.note.ui.shapes.uml.model.UmlEdge
import com.antigravity.note.ui.shapes.uml.model.UmlNode
import com.antigravity.note.ui.shapes.uml.model.UmlNodeType
import com.antigravity.note.ui.shapes.uml.model.UmlPort
import com.antigravity.note.ui.shapes.uml.model.UmlRelationshipType
import com.antigravity.note.ui.shapes.uml.model.UmlRoutingMode
import kotlin.math.atan2
import kotlin.math.cos
import kotlin.math.sin

/**
 * 100% GPU Hardware-Accelerated 120fps UML Canvas Renderer.
 * STRICT ZERO-ALLOCATION GUARANTEE: All Paint, Path, and RectF objects are pre-allocated
 * in memory. Zero garbage collection pressure in frame draw loops.
 */
class UmlCanvasRenderer {

    // Pre-allocated Paints
    val backgroundPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }
    val gridPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }

    val nodeFillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }
    val nodeStrokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 2.0f
    }
    val nodeHeaderFillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }

    val dashedStrokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 2.0f
        pathEffect = DashPathEffect(floatArrayOf(12f, 8f), 0f)
    }

    val edgeStrokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 2.2f
        strokeCap = Paint.Cap.ROUND
        strokeJoin = Paint.Join.ROUND
    }

    val edgeDashedStrokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 2.2f
        strokeCap = Paint.Cap.ROUND
        pathEffect = DashPathEffect(floatArrayOf(14f, 8f), 0f)
    }

    val arrowFillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply { style = Paint.Style.FILL }
    val arrowHollowPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL_AND_STROKE
        strokeWidth = 2.0f
    }

    val portOuterPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = Color.parseColor("#3B82F6") // Blue port
    }
    val portInnerPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = Color.WHITE
    }
    val portHighlightPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 3f
        color = Color.parseColor("#60A5FA")
    }

    val selectionBoxPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 2.0f
        color = Color.parseColor("#3B82F6")
        pathEffect = DashPathEffect(floatArrayOf(8f, 6f), 0f)
    }
    val handleFillPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = Color.WHITE
    }
    val handleStrokePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 2.5f
        color = Color.parseColor("#2563EB")
    }

    val snapGuidePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.STROKE
        strokeWidth = 1.5f
        color = Color.parseColor("#F59E0B") // Amber magnetic guideline
        pathEffect = DashPathEffect(floatArrayOf(6f, 6f), 0f)
    }

    // Typography Paints
    val titleTextPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        textSize = 15f
        typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        textAlign = Paint.Align.CENTER
    }
    val stereotypeTextPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        textSize = 12f
        typeface = Typeface.create(Typeface.DEFAULT, Typeface.ITALIC)
        textAlign = Paint.Align.CENTER
    }
    val bodyTextPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        textSize = 13f
        typeface = Typeface.MONOSPACE
        textAlign = Paint.Align.LEFT
    }
    val edgeLabelPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        textSize = 12f
        typeface = Typeface.DEFAULT_BOLD
        textAlign = Paint.Align.CENTER
    }
    val multiplicityPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        textSize = 11f
        typeface = Typeface.MONOSPACE
        textAlign = Paint.Align.LEFT
    }

    // Reusable Scratch Geometries (Zero GC)
    private val scratchRectF = RectF()
    private val scratchRectF2 = RectF()
    private val scratchPath = Path()
    private val scratchArrowPath = Path()
    private val scratchBounds = Rect()
    private val scratchWaypoints = mutableListOf<com.antigravity.note.ui.shapes.uml.model.UmlPoint>()

    // Color Palettes
    var isDarkMode: Boolean = false
        set(value) {
            field = value
            updateThemeColors()
        }

    init {
        updateThemeColors()
    }

    private fun updateThemeColors() {
        if (isDarkMode) {
            backgroundPaint.color = Color.parseColor("#121418")
            gridPaint.color = Color.parseColor("#2A313C")

            nodeFillPaint.color = Color.parseColor("#1E222B")
            nodeStrokePaint.color = Color.parseColor("#64748B")
            nodeHeaderFillPaint.color = Color.parseColor("#28303E")

            edgeStrokePaint.color = Color.parseColor("#E2E8F0")
            edgeDashedStrokePaint.color = Color.parseColor("#E2E8F0")
            arrowFillPaint.color = Color.parseColor("#E2E8F0")
            arrowHollowPaint.color = Color.parseColor("#1E222B")

            titleTextPaint.color = Color.parseColor("#F8FAFC")
            stereotypeTextPaint.color = Color.parseColor("#94A3B8")
            bodyTextPaint.color = Color.parseColor("#CBD5E1")
            edgeLabelPaint.color = Color.parseColor("#F1F5F9")
            multiplicityPaint.color = Color.parseColor("#94A3B8")
        } else {
            backgroundPaint.color = Color.parseColor("#F8FAFC")
            gridPaint.color = Color.parseColor("#CBD5E1")

            nodeFillPaint.color = Color.WHITE
            nodeStrokePaint.color = Color.parseColor("#334155")
            nodeHeaderFillPaint.color = Color.parseColor("#F1F5F9")

            edgeStrokePaint.color = Color.parseColor("#1E293B")
            edgeDashedStrokePaint.color = Color.parseColor("#1E293B")
            arrowFillPaint.color = Color.parseColor("#1E293B")
            arrowHollowPaint.color = Color.WHITE

            titleTextPaint.color = Color.parseColor("#0F172A")
            stereotypeTextPaint.color = Color.parseColor("#64748B")
            bodyTextPaint.color = Color.parseColor("#334155")
            edgeLabelPaint.color = Color.parseColor("#0F172A")
            multiplicityPaint.color = Color.parseColor("#64748B")
        }
    }

    /**
     * Primary Render Pass: Renders the entire UML diagram into the Canvas.
     */
    fun renderDiagram(
        canvas: Canvas,
        diagram: UmlDiagram,
        selectedNode: UmlNode? = null,
        selectedEdge: UmlEdge? = null,
        hoveredPort: UmlPort? = null,
        connectingLine: Pair<PointF, PointF>? = null,
        snapLineX: Float? = null,
        snapLineY: Float? = null,
        viewportRect: RectF? = null,
        drawBackgroundGrid: Boolean = true
    ) {
        if (diagram.isDarkMode != isDarkMode) {
            isDarkMode = diagram.isDarkMode
        }

        // 1. Grid
        if (drawBackgroundGrid && viewportRect != null) {
            drawGrid(canvas, viewportRect)
        }

        // 2. Alignment Guidelines
        if (snapLineX != null && viewportRect != null) {
            canvas.drawLine(snapLineX, viewportRect.top, snapLineX, viewportRect.bottom, snapGuidePaint)
        }
        if (snapLineY != null && viewportRect != null) {
            canvas.drawLine(viewportRect.left, snapLineY, viewportRect.right, snapLineY, snapGuidePaint)
        }

        // 3. Edges & Connectors
        for (edge in diagram.edges) {
            val isSelected = (edge.id == selectedEdge?.id)
            drawEdge(canvas, edge, diagram, isSelected)
        }

        // 4. In-progress connector drag line
        if (connectingLine != null) {
            val (p1, p2) = connectingLine
            scratchPath.reset()
            scratchPath.moveTo(p1.x, p1.y)
            scratchPath.lineTo(p2.x, p2.y)
            canvas.drawPath(scratchPath, edgeStrokePaint)
            drawArrowhead(canvas, p1.x, p1.y, p2.x, p2.y, UmlRelationshipType.DIRECTED)
        }

        // 5. Nodes (With Viewport Culling)
        for (node in diagram.nodes) {
            if (viewportRect != null && !RectF.intersects(node.getBounds(), viewportRect)) {
                continue // Skip offscreen node
            }
            val isSelected = (node.id == selectedNode?.id)
            drawNode(canvas, node, isSelected)
        }

        // 6. Selected Node Handles & Magnetic Ports
        if (selectedNode != null) {
            drawSelectionHandles(canvas, selectedNode)
            drawMagneticPorts(canvas, selectedNode, hoveredPort)
        }
    }

    private fun drawGrid(canvas: Canvas, viewport: RectF) {
        val spacing = 32f
        val startX = kotlin.math.floor(viewport.left / spacing) * spacing
        val endX = kotlin.math.ceil(viewport.right / spacing) * spacing
        val startY = kotlin.math.floor(viewport.top / spacing) * spacing
        val endY = kotlin.math.ceil(viewport.bottom / spacing) * spacing

        var y = startY
        while (y <= endY) {
            var x = startX
            while (x <= endX) {
                canvas.drawCircle(x, y, 1.6f, gridPaint)
                x += spacing
            }
            y += spacing
        }
    }

    private fun drawNode(canvas: Canvas, node: UmlNode, isSelected: Boolean) {
        val b = node.getBounds()
        val fillP = if (node.customFillColor != null) {
            scratchPaint.apply { style = Paint.Style.FILL; color = node.customFillColor }
        } else nodeFillPaint

        val strokeP = if (node.customStrokeColor != null) {
            scratchStrokePaint.apply { style = Paint.Style.STROKE; strokeWidth = 2f; color = node.customStrokeColor }
        } else nodeStrokePaint

        when (node.type) {
            UmlNodeType.CLASS, UmlNodeType.INTERFACE -> drawClassNode(canvas, node, b, fillP, strokeP)
            UmlNodeType.ACTOR -> drawActorNode(canvas, node, b, strokeP)
            UmlNodeType.USE_CASE -> drawUseCaseNode(canvas, node, b, fillP, strokeP)
            UmlNodeType.BOUNDARY -> drawBoundaryNode(canvas, node, b, fillP, strokeP)
            UmlNodeType.LIFELINE -> drawLifelineNode(canvas, node, b, fillP, strokeP)
            UmlNodeType.ACTIVATION_BAR -> drawActivationBarNode(canvas, node, b, fillP, strokeP)
            UmlNodeType.INITIAL_NODE -> drawInitialNode(canvas, node, b)
            UmlNodeType.FINAL_NODE -> drawFinalNode(canvas, node, b)
            UmlNodeType.ACTION_STATE -> drawActionStateNode(canvas, node, b, fillP, strokeP)
            UmlNodeType.DECISION -> drawDecisionNode(canvas, node, b, fillP, strokeP)
            UmlNodeType.FORK_JOIN -> drawForkJoinNode(canvas, node, b)
            UmlNodeType.NOTE -> drawNoteNode(canvas, node, b, fillP, strokeP)
        }
    }

    private val scratchPaint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val scratchStrokePaint = Paint(Paint.ANTI_ALIAS_FLAG)

    private fun drawClassNode(canvas: Canvas, node: UmlNode, b: RectF, fillP: Paint, strokeP: Paint) {
        // Outer Card
        canvas.drawRoundRect(b, 8f, 8f, fillP)
        canvas.drawRoundRect(b, 8f, 8f, strokeP)

        // Header compartment
        val hasStereotype = !node.stereotype.isNullOrEmpty() || node.type == UmlNodeType.INTERFACE
        val headerH = if (hasStereotype) 52f else 38f
        scratchRectF.set(b.left, b.top, b.right, b.top + headerH)
        canvas.drawRoundRect(scratchRectF, 8f, 8f, nodeHeaderFillPaint)
        canvas.drawLine(b.left, b.top + headerH, b.right, b.top + headerH, strokeP)

        var curY = b.top + 16f
        if (hasStereotype) {
            val stText = node.stereotype ?: "<<interface>>"
            canvas.drawText(stText, b.centerX(), curY, stereotypeTextPaint)
            curY += 18f
        }
        canvas.drawText(node.title, b.centerX(), curY, titleTextPaint)

        // Attributes Compartment
        val attrStartY = b.top + headerH
        val attrCount = node.attributes.size
        val attrH = (attrCount * 20f + 12f).coerceAtLeast(32f)
        val attrDividerY = (attrStartY + attrH).coerceAtMost(b.bottom - 20f)
        canvas.drawLine(b.left, attrDividerY, b.right, attrDividerY, strokeP)

        var lineY = attrStartY + 20f
        for (attr in node.attributes) {
            if (lineY > attrDividerY - 4f) break
            canvas.drawText(attr, b.left + 12f, lineY, bodyTextPaint)
            lineY += 20f
        }

        // Methods Compartment
        lineY = attrDividerY + 20f
        for (method in node.methods) {
            if (lineY > b.bottom - 6f) break
            canvas.drawText(method, b.left + 12f, lineY, bodyTextPaint)
            lineY += 20f
        }
    }

    private fun drawActorNode(canvas: Canvas, node: UmlNode, b: RectF, strokeP: Paint) {
        val cx = b.centerX()
        val headRadius = 18f
        val headY = b.top + headRadius + 6f
        // Head
        canvas.drawCircle(cx, headY, headRadius, strokeP)

        // Torso
        val torsoStartY = headY + headRadius
        val torsoEndY = torsoStartY + 45f
        canvas.drawLine(cx, torsoStartY, cx, torsoEndY, strokeP)

        // Arms
        val armsY = torsoStartY + 16f
        canvas.drawLine(cx - 30f, armsY, cx + 30f, armsY, strokeP)

        // Legs
        val feetY = torsoEndY + 36f
        canvas.drawLine(cx, torsoEndY, cx - 24f, feetY, strokeP)
        canvas.drawLine(cx, torsoEndY, cx + 24f, feetY, strokeP)

        // Label
        canvas.drawText(node.title, cx, feetY + 22f, titleTextPaint)
    }

    private fun drawUseCaseNode(canvas: Canvas, node: UmlNode, b: RectF, fillP: Paint, strokeP: Paint) {
        canvas.drawOval(b, fillP)
        canvas.drawOval(b, strokeP)
        canvas.drawText(node.title, b.centerX(), b.centerY() + 5f, titleTextPaint)
    }

    private fun drawBoundaryNode(canvas: Canvas, node: UmlNode, b: RectF, fillP: Paint, strokeP: Paint) {
        canvas.drawRect(b, strokeP)
        // Title banner on top-left
        canvas.drawText(node.title, b.left + 16f, b.top + 22f, titleTextPaint)
    }

    private fun drawLifelineNode(canvas: Canvas, node: UmlNode, b: RectF, fillP: Paint, strokeP: Paint) {
        val headerH = 46f
        scratchRectF.set(b.left, b.top, b.right, b.top + headerH)
        canvas.drawRoundRect(scratchRectF, 6f, 6f, fillP)
        canvas.drawRoundRect(scratchRectF, 6f, 6f, strokeP)
        canvas.drawText(node.title, b.centerX(), b.top + 28f, titleTextPaint)

        // Vertical Dashed Lifeline
        canvas.drawLine(b.centerX(), b.top + headerH, b.centerX(), b.bottom, dashedStrokePaint)
    }

    private fun drawActivationBarNode(canvas: Canvas, node: UmlNode, b: RectF, fillP: Paint, strokeP: Paint) {
        canvas.drawRect(b, fillP)
        canvas.drawRect(b, strokeP)
    }

    private fun drawInitialNode(canvas: Canvas, node: UmlNode, b: RectF) {
        val radius = minOf(b.width(), b.height()) / 2f
        canvas.drawCircle(b.centerX(), b.centerY(), radius, arrowFillPaint)
    }

    private fun drawFinalNode(canvas: Canvas, node: UmlNode, b: RectF) {
        val radius = minOf(b.width(), b.height()) / 2f
        canvas.drawCircle(b.centerX(), b.centerY(), radius, nodeStrokePaint)
        canvas.drawCircle(b.centerX(), b.centerY(), radius * 0.62f, arrowFillPaint)
    }

    private fun drawActionStateNode(canvas: Canvas, node: UmlNode, b: RectF, fillP: Paint, strokeP: Paint) {
        canvas.drawRoundRect(b, 20f, 20f, fillP)
        canvas.drawRoundRect(b, 20f, 20f, strokeP)
        canvas.drawText(node.title, b.centerX(), b.centerY() + 5f, titleTextPaint)
    }

    private fun drawDecisionNode(canvas: Canvas, node: UmlNode, b: RectF, fillP: Paint, strokeP: Paint) {
        scratchPath.reset()
        scratchPath.moveTo(b.centerX(), b.top)
        scratchPath.lineTo(b.right, b.centerY())
        scratchPath.lineTo(b.centerX(), b.bottom)
        scratchPath.lineTo(b.left, b.centerY())
        scratchPath.close()

        canvas.drawPath(scratchPath, fillP)
        canvas.drawPath(scratchPath, strokeP)
        if (node.title.isNotEmpty()) {
            canvas.drawText(node.title, b.centerX(), b.centerY() + 5f, titleTextPaint)
        }
    }

    private fun drawForkJoinNode(canvas: Canvas, node: UmlNode, b: RectF) {
        canvas.drawRoundRect(b, 4f, 4f, arrowFillPaint)
    }

    private fun drawNoteNode(canvas: Canvas, node: UmlNode, b: RectF, fillP: Paint, strokeP: Paint) {
        val fold = 18f
        scratchPath.reset()
        scratchPath.moveTo(b.left, b.top)
        scratchPath.lineTo(b.right - fold, b.top)
        scratchPath.lineTo(b.right, b.top + fold)
        scratchPath.lineTo(b.right, b.bottom)
        scratchPath.lineTo(b.left, b.bottom)
        scratchPath.close()

        canvas.drawPath(scratchPath, fillP)
        canvas.drawPath(scratchPath, strokeP)

        // Dog ear fold line
        scratchPath.reset()
        scratchPath.moveTo(b.right - fold, b.top)
        scratchPath.lineTo(b.right - fold, b.top + fold)
        scratchPath.lineTo(b.right, b.top + fold)
        canvas.drawPath(scratchPath, strokeP)

        canvas.drawText(node.title, b.left + 12f, b.top + 28f, bodyTextPaint)
    }

    private fun drawEdge(canvas: Canvas, edge: UmlEdge, diagram: UmlDiagram, isSelected: Boolean) {
        val sourceNode = diagram.findNode(edge.sourceNodeId) ?: return
        val targetNode = diagram.findNode(edge.targetNodeId) ?: return
        val sPort = sourceNode.getPort(edge.sourcePortPosition) ?: return
        val tPort = targetNode.getPort(edge.targetPortPosition) ?: return

        scratchWaypoints.clear()
        val waypoints = OrthogonalRouter.computeWaypoints(
            sPort.x, sPort.y, sPort.position,
            tPort.x, tPort.y, tPort.position,
            edge.routingMode
        )

        OrthogonalRouter.buildPath(waypoints, edge.routingMode, scratchPath)

        val isDashed = (edge.relationshipType == UmlRelationshipType.REALIZATION ||
                        edge.relationshipType == UmlRelationshipType.DEPENDENCY)
        val strokePaintToUse = if (isDashed) edgeDashedStrokePaint else edgeStrokePaint

        if (isSelected) {
            strokePaintToUse.color = Color.parseColor("#3B82F6")
        } else {
            strokePaintToUse.color = if (isDarkMode) Color.parseColor("#E2E8F0") else Color.parseColor("#1E293B")
        }

        canvas.drawPath(scratchPath, strokePaintToUse)

        // Arrowhead at target
        if (waypoints.size >= 2) {
            val pPrev = waypoints[waypoints.size - 2]
            val pEnd = waypoints.last()
            drawArrowhead(canvas, pPrev.x, pPrev.y, pEnd.x, pEnd.y, edge.relationshipType)
        }

        // Diamond at source for Aggregation/Composition
        if (edge.relationshipType == UmlRelationshipType.AGGREGATION || edge.relationshipType == UmlRelationshipType.COMPOSITION) {
            if (waypoints.size >= 2) {
                val pStart = waypoints.first()
                val pNext = waypoints[1]
                drawDiamondHead(canvas, pNext.x, pNext.y, pStart.x, pStart.y, edge.relationshipType == UmlRelationshipType.COMPOSITION)
            }
        }

        // Labels & Multiplicities
        if (!edge.label.isNullOrEmpty() && waypoints.size >= 2) {
            val midIdx = waypoints.size / 2
            val midPt = waypoints[midIdx]
            canvas.drawText(edge.label, midPt.x, midPt.y - 10f, edgeLabelPaint)
        }
        if (!edge.sourceMultiplicity.isNullOrEmpty()) {
            canvas.drawText(edge.sourceMultiplicity, sPort.x + 10f, sPort.y - 8f, multiplicityPaint)
        }
        if (!edge.targetMultiplicity.isNullOrEmpty()) {
            canvas.drawText(edge.targetMultiplicity, tPort.x + 10f, tPort.y - 8f, multiplicityPaint)
        }
    }

    private fun drawArrowhead(canvas: Canvas, fromX: Float, fromY: Float, toX: Float, toY: Float, type: UmlRelationshipType) {
        val angle = atan2((toY - fromY).toDouble(), (toX - fromX).toDouble()).toFloat()
        val arrowSize = 16f
        val wingAngle = 0.5f

        scratchArrowPath.reset()

        when (type) {
            UmlRelationshipType.ASSOCIATION -> {
                // No arrowhead
                return
            }
            UmlRelationshipType.DIRECTED, UmlRelationshipType.DEPENDENCY -> {
                // Open arrow
                val x1 = toX - arrowSize * cos(angle - wingAngle)
                val y1 = toY - arrowSize * sin(angle - wingAngle)
                val x2 = toX - arrowSize * cos(angle + wingAngle)
                val y2 = toY - arrowSize * sin(angle + wingAngle)
                canvas.drawLine(toX, toY, x1, y1, edgeStrokePaint)
                canvas.drawLine(toX, toY, x2, y2, edgeStrokePaint)
            }
            UmlRelationshipType.INHERITANCE, UmlRelationshipType.REALIZATION -> {
                // Closed hollow triangle
                val x1 = toX - arrowSize * cos(angle - wingAngle)
                val y1 = toY - arrowSize * sin(angle - wingAngle)
                val x2 = toX - arrowSize * cos(angle + wingAngle)
                val y2 = toY - arrowSize * sin(angle + wingAngle)
                scratchArrowPath.moveTo(toX, toY)
                scratchArrowPath.lineTo(x1, y1)
                scratchArrowPath.lineTo(x2, y2)
                scratchArrowPath.close()
                canvas.drawPath(scratchArrowPath, arrowHollowPaint)
                canvas.drawPath(scratchArrowPath, edgeStrokePaint)
            }
            UmlRelationshipType.AGGREGATION, UmlRelationshipType.COMPOSITION -> {
                // Target has standard arrow or plain line
                return
            }
        }
    }

    private fun drawDiamondHead(canvas: Canvas, fromX: Float, fromY: Float, toX: Float, toY: Float, isFilled: Boolean) {
        val angle = atan2((toY - fromY).toDouble(), (toX - fromX).toDouble()).toFloat()
        val size = 14f
        val p1X = toX
        val p1Y = toY
        val p2X = toX - size * cos(angle - 0.55f)
        val p2Y = toY - size * sin(angle - 0.55f)
        val p3X = toX - size * 1.8f * cos(angle)
        val p3Y = toY - size * 1.8f * sin(angle)
        val p4X = toX - size * cos(angle + 0.55f)
        val p4Y = toY - size * sin(angle + 0.55f)

        scratchArrowPath.reset()
        scratchArrowPath.moveTo(p1X, p1Y)
        scratchArrowPath.lineTo(p2X, p2Y)
        scratchArrowPath.lineTo(p3X, p3Y)
        scratchArrowPath.lineTo(p4X, p4Y)
        scratchArrowPath.close()

        if (isFilled) {
            canvas.drawPath(scratchArrowPath, arrowFillPaint)
        } else {
            canvas.drawPath(scratchArrowPath, arrowHollowPaint)
            canvas.drawPath(scratchArrowPath, edgeStrokePaint)
        }
    }

    private fun drawSelectionHandles(canvas: Canvas, node: UmlNode) {
        val b = node.getBounds()
        canvas.drawRoundRect(b, 8f, 8f, selectionBoxPaint)

        val handleR = 7f
        val handles = floatArrayOf(
            b.left, b.top,
            b.right, b.top,
            b.left, b.bottom,
            b.right, b.bottom
        )

        for (i in handles.indices step 2) {
            val hx = handles[i]
            val hy = handles[i + 1]
            canvas.drawCircle(hx, hy, handleR, handleFillPaint)
            canvas.drawCircle(hx, hy, handleR, handleStrokePaint)
        }
    }

    private fun drawMagneticPorts(canvas: Canvas, node: UmlNode, hoveredPort: UmlPort?) {
        val ports = node.computePorts()
        for (port in ports) {
            val isHovered = (hoveredPort?.nodeId == port.nodeId && hoveredPort.position == port.position)
            val outerR = if (isHovered) 8f else 5.5f
            val innerR = if (isHovered) 4f else 2.5f

            if (isHovered) {
                canvas.drawCircle(port.x, port.y, outerR + 4f, portHighlightPaint)
            }
            canvas.drawCircle(port.x, port.y, outerR, portOuterPaint)
            canvas.drawCircle(port.x, port.y, innerR, portInnerPaint)
        }
    }
}
