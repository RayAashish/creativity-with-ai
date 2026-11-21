package com.antigravity.note.ui.shapes.uml

import android.graphics.PointF
import com.antigravity.note.ui.shapes.uml.engine.OrthogonalRouter
import com.antigravity.note.ui.shapes.uml.engine.UmlSpatialIndex
import com.antigravity.note.ui.shapes.uml.engine.UmlUndoRedoStack
import com.antigravity.note.ui.shapes.uml.model.UmlDiagram
import com.antigravity.note.ui.shapes.uml.model.UmlEdge
import com.antigravity.note.ui.shapes.uml.model.UmlNode
import com.antigravity.note.ui.shapes.uml.model.UmlNodeType
import com.antigravity.note.ui.shapes.uml.model.UmlPortPosition
import com.antigravity.note.ui.shapes.uml.model.UmlRelationshipType
import com.antigravity.note.ui.shapes.uml.model.UmlRoutingMode
import com.antigravity.note.ui.shapes.uml.model.UmlSerializer
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class UmlEngineTest {

    @Test
    fun testUmlDiagramSerializationRoundTrip() {
        val node1 = UmlNode(
            id = "node-1",
            type = UmlNodeType.CLASS,
            x = 100f, y = 150f,
            width = 240f, height = 160f,
            title = "User",
            stereotype = "<<entity>>",
            attributes = listOf("+ id: Long", "+ email: String"),
            methods = listOf("+ getRole(): String")
        )
        val node2 = UmlNode(
            id = "node-2",
            type = UmlNodeType.INTERFACE,
            x = 450f, y = 150f,
            width = 200f, height = 120f,
            title = "Repository",
            stereotype = "<<interface>>",
            methods = listOf("+ findById(id: Long): User")
        )
        val edge = UmlEdge(
            id = "edge-1",
            sourceNodeId = "node-1",
            sourcePortPosition = UmlPortPosition.EAST,
            targetNodeId = "node-2",
            targetPortPosition = UmlPortPosition.WEST,
            relationshipType = UmlRelationshipType.DIRECTED,
            routingMode = UmlRoutingMode.ORTHOGONAL,
            label = "persistsWith"
        )
        val diagram = UmlDiagram(
            id = "diag-1",
            title = "Architecture Overview",
            nodes = listOf(node1, node2),
            edges = listOf(edge),
            isDarkMode = true
        )

        val json = UmlSerializer.toJson(diagram)
        val parsed = UmlSerializer.fromJson(json)

        assertEquals("diag-1", parsed.id)
        assertEquals("Architecture Overview", parsed.title)
        assertTrue(parsed.isDarkMode)
        assertEquals(2, parsed.nodes.size)
        assertEquals(1, parsed.edges.size)

        val parsedNode1 = parsed.findNode("node-1")
        assertNotNull(parsedNode1)
        assertEquals("User", parsedNode1?.title)
        assertEquals("<<entity>>", parsedNode1?.stereotype)
        assertEquals(2, parsedNode1?.attributes?.size)

        val parsedEdge = parsed.findEdge("edge-1")
        assertNotNull(parsedEdge)
        assertEquals(UmlRelationshipType.DIRECTED, parsedEdge?.relationshipType)
        assertEquals("persistsWith", parsedEdge?.label)
    }

    @Test
    fun testOrthogonalRouterElbowWaypoints() {
        val waypoints = OrthogonalRouter.computeWaypoints(
            sx = 100f, sy = 200f, sPos = UmlPortPosition.EAST,
            tx = 400f, ty = 350f, tPos = UmlPortPosition.WEST,
            mode = UmlRoutingMode.ORTHOGONAL
        )

        assertTrue(waypoints.size >= 3)
        assertEquals(100f, waypoints.first().x, 0.01f)
        assertEquals(200f, waypoints.first().y, 0.01f)
        assertEquals(400f, waypoints.last().x, 0.01f)
        assertEquals(350f, waypoints.last().y, 0.01f)
    }

    @Test
    fun testSpatialIndexHitTesting() {
        val node = UmlNode(
            id = "hit-node",
            type = UmlNodeType.CLASS,
            x = 200f, y = 300f,
            width = 150f, height = 100f,
            title = "Target"
        )
        val nodes = listOf(node)

        // Hit inside
        val hit = UmlSpatialIndex.hitTestNode(250f, 350f, nodes)
        assertNotNull(hit)
        assertEquals("hit-node", hit?.id)

        // Miss outside
        val miss = UmlSpatialIndex.hitTestNode(50f, 50f, nodes)
        assertNull(miss)

        // Magnetic port hit test with 48dp slop
        // North port is at (275f, 300f)
        val hitPort = UmlSpatialIndex.hitTestPort(278f, 302f, nodes, touchSlopPx = 48f)
        assertNotNull(hitPort)
        assertEquals(UmlPortPosition.NORTH, hitPort?.position)
    }

    @Test
    fun testUndoRedoStackOperations() {
        val d1 = UmlDiagram(id = "d1", title = "Step 1")
        val stack = UmlUndoRedoStack(d1)

        assertFalse(stack.canUndo)
        assertFalse(stack.canRedo)

        val d2 = UmlDiagram(id = "d2", title = "Step 2")
        stack.pushState(d2)

        assertTrue(stack.canUndo)
        assertFalse(stack.canRedo)
        assertEquals("Step 2", stack.currentDiagram.title)

        val undone = stack.undo()
        assertNotNull(undone)
        assertEquals("Step 1", undone?.title)
        assertFalse(stack.canUndo)
        assertTrue(stack.canRedo)

        val redone = stack.redo()
        assertNotNull(redone)
        assertEquals("Step 2", redone?.title)
        assertTrue(stack.canUndo)
        assertFalse(stack.canRedo)
    }
}
