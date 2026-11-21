package com.antigravity.note.ui.shapes.uml.model

import java.util.UUID

enum class UmlRelationshipType(val displayName: String) {
    ASSOCIATION("Association (—)"),
    DIRECTED("Directed (—>)"),
    INHERITANCE("Inheritance (—▷)"),
    REALIZATION("Realization (--▷)"),
    AGGREGATION("Aggregation (—◇)"),
    COMPOSITION("Composition (—◆)"),
    DEPENDENCY("Dependency (-->)")
}

enum class UmlRoutingMode(val displayName: String) {
    ORTHOGONAL("90° Elbow"),
    STRAIGHT("Straight"),
    CURVED("Curved Bézier")
}

/**
 * Immutable UML Edge representing connections between two node anchor ports.
 */
data class UmlEdge(
    val id: String = UUID.randomUUID().toString(),
    val sourceNodeId: String,
    val sourcePortPosition: UmlPortPosition,
    val targetNodeId: String,
    val targetPortPosition: UmlPortPosition,
    val relationshipType: UmlRelationshipType = UmlRelationshipType.DIRECTED,
    val routingMode: UmlRoutingMode = UmlRoutingMode.ORTHOGONAL,
    val sourceMultiplicity: String? = null,
    val targetMultiplicity: String? = null,
    val label: String? = null,
    val customWaypoints: List<UmlPoint> = emptyList()
)
