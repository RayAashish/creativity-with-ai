package com.antigravity.note.ui.shapes.uml.model

import org.json.JSONArray
import org.json.JSONObject

/**
 * High-speed JSON serializer/deserializer for UML diagrams.
 * Zero external dependencies, 100% backward/forward compatible schema.
 */
object UmlSerializer {

    fun toJson(diagram: UmlDiagram): String {
        val root = JSONObject()
        root.put("id", diagram.id)
        root.put("version", diagram.version)
        root.put("title", diagram.title)
        root.put("viewportZoom", diagram.viewportZoom.toDouble())
        root.put("viewportPanX", diagram.viewportPanX.toDouble())
        root.put("viewportPanY", diagram.viewportPanY.toDouble())
        root.put("isDarkMode", diagram.isDarkMode)

        // Nodes
        val nodesArr = JSONArray()
        for (n in diagram.nodes) {
            val no = JSONObject()
            no.put("id", n.id)
            no.put("type", n.type.name)
            no.put("x", n.x.toDouble())
            no.put("y", n.y.toDouble())
            no.put("width", n.width.toDouble())
            no.put("height", n.height.toDouble())
            no.put("title", n.title)
            if (n.stereotype != null) no.put("stereotype", n.stereotype)

            val attrsArr = JSONArray()
            for (a in n.attributes) attrsArr.put(a)
            no.put("attributes", attrsArr)

            val methsArr = JSONArray()
            for (m in n.methods) methsArr.put(m)
            no.put("methods", methsArr)

            if (n.customFillColor != null) no.put("customFillColor", n.customFillColor)
            if (n.customStrokeColor != null) no.put("customStrokeColor", n.customStrokeColor)
            no.put("isLocked", n.isLocked)
            nodesArr.put(no)
        }
        root.put("nodes", nodesArr)

        // Edges
        val edgesArr = JSONArray()
        for (e in diagram.edges) {
            val eo = JSONObject()
            eo.put("id", e.id)
            eo.put("sourceNodeId", e.sourceNodeId)
            eo.put("sourcePortPosition", e.sourcePortPosition.name)
            eo.put("targetNodeId", e.targetNodeId)
            eo.put("targetPortPosition", e.targetPortPosition.name)
            eo.put("relationshipType", e.relationshipType.name)
            eo.put("routingMode", e.routingMode.name)
            if (e.sourceMultiplicity != null) eo.put("sourceMultiplicity", e.sourceMultiplicity)
            if (e.targetMultiplicity != null) eo.put("targetMultiplicity", e.targetMultiplicity)
            if (e.label != null) eo.put("label", e.label)

            val wpArr = JSONArray()
            for (wp in e.customWaypoints) {
                val wpo = JSONObject()
                wpo.put("x", wp.x.toDouble())
                wpo.put("y", wp.y.toDouble())
                wpArr.put(wpo)
            }
            eo.put("customWaypoints", wpArr)
            edgesArr.put(eo)
        }
        root.put("edges", edgesArr)

        return root.toString(2)
    }

    fun fromJson(jsonStr: String): UmlDiagram {
        val root = JSONObject(jsonStr)
        val id = root.optString("id", "")
        val version = root.optInt("version", 1)
        val title = root.optString("title", "UML Diagram")
        val viewportZoom = root.optDouble("viewportZoom", 1.0).toFloat()
        val viewportPanX = root.optDouble("viewportPanX", 0.0).toFloat()
        val viewportPanY = root.optDouble("viewportPanY", 0.0).toFloat()
        val isDarkMode = root.optBoolean("isDarkMode", false)

        val nodesList = mutableListOf<UmlNode>()
        val nodesArr = root.optJSONArray("nodes")
        if (nodesArr != null) {
            for (i in 0 until nodesArr.length()) {
                val no = nodesArr.getJSONObject(i)
                val typeStr = no.optString("type", UmlNodeType.CLASS.name)
                val type = try { UmlNodeType.valueOf(typeStr) } catch (_: Exception) { UmlNodeType.CLASS }
                val attrs = mutableListOf<String>()
                val aArr = no.optJSONArray("attributes")
                if (aArr != null) {
                    for (j in 0 until aArr.length()) attrs.add(aArr.getString(j))
                }
                val meths = mutableListOf<String>()
                val mArr = no.optJSONArray("methods")
                if (mArr != null) {
                    for (j in 0 until mArr.length()) meths.add(mArr.getString(j))
                }

                nodesList.add(
                    UmlNode(
                        id = no.optString("id", ""),
                        type = type,
                        x = no.optDouble("x", 0.0).toFloat(),
                        y = no.optDouble("y", 0.0).toFloat(),
                        width = no.optDouble("width", 200.0).toFloat(),
                        height = no.optDouble("height", 140.0).toFloat(),
                        title = no.optString("title", "Node"),
                        stereotype = if (no.has("stereotype")) no.getString("stereotype") else null,
                        attributes = attrs,
                        methods = meths,
                        customFillColor = if (no.has("customFillColor")) no.getInt("customFillColor") else null,
                        customStrokeColor = if (no.has("customStrokeColor")) no.getInt("customStrokeColor") else null,
                        isLocked = no.optBoolean("isLocked", false)
                    )
                )
            }
        }

        val edgesList = mutableListOf<UmlEdge>()
        val edgesArr = root.optJSONArray("edges")
        if (edgesArr != null) {
            for (i in 0 until edgesArr.length()) {
                val eo = edgesArr.getJSONObject(i)
                val relStr = eo.optString("relationshipType", UmlRelationshipType.DIRECTED.name)
                val relType = try { UmlRelationshipType.valueOf(relStr) } catch (_: Exception) { UmlRelationshipType.DIRECTED }
                val routeStr = eo.optString("routingMode", UmlRoutingMode.ORTHOGONAL.name)
                val routeMode = try { UmlRoutingMode.valueOf(routeStr) } catch (_: Exception) { UmlRoutingMode.ORTHOGONAL }
                val spStr = eo.optString("sourcePortPosition", UmlPortPosition.EAST.name)
                val sPort = try { UmlPortPosition.valueOf(spStr) } catch (_: Exception) { UmlPortPosition.EAST }
                val tpStr = eo.optString("targetPortPosition", UmlPortPosition.WEST.name)
                val tPort = try { UmlPortPosition.valueOf(tpStr) } catch (_: Exception) { UmlPortPosition.WEST }

                val waypoints = mutableListOf<UmlPoint>()
                val wpArr = eo.optJSONArray("customWaypoints")
                if (wpArr != null) {
                    for (j in 0 until wpArr.length()) {
                        val wpo = wpArr.getJSONObject(j)
                        waypoints.add(UmlPoint(wpo.optDouble("x", 0.0).toFloat(), wpo.optDouble("y", 0.0).toFloat()))
                    }
                }

                edgesList.add(
                    UmlEdge(
                        id = eo.optString("id", ""),
                        sourceNodeId = eo.optString("sourceNodeId", ""),
                        sourcePortPosition = sPort,
                        targetNodeId = eo.optString("targetNodeId", ""),
                        targetPortPosition = tPort,
                        relationshipType = relType,
                        routingMode = routeMode,
                        sourceMultiplicity = if (eo.has("sourceMultiplicity")) eo.getString("sourceMultiplicity") else null,
                        targetMultiplicity = if (eo.has("targetMultiplicity")) eo.getString("targetMultiplicity") else null,
                        label = if (eo.has("label")) eo.getString("label") else null,
                        customWaypoints = waypoints
                    )
                )
            }
        }

        return UmlDiagram(
            id = id,
            version = version,
            title = title,
            viewportZoom = viewportZoom,
            viewportPanX = viewportPanX,
            viewportPanY = viewportPanY,
            nodes = nodesList,
            edges = edgesList,
            isDarkMode = isDarkMode
        )
    }
}
