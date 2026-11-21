package com.antigravity.note.ui.shapes.uml.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.antigravity.note.ui.shapes.uml.model.UmlEdge
import com.antigravity.note.ui.shapes.uml.model.UmlRelationshipType
import com.antigravity.note.ui.shapes.uml.model.UmlRoutingMode

/**
 * Structured Material 3 bottom sheet for editing UML relationships and connectors.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UmlEdgeEditBottomSheet(
    edge: UmlEdge,
    onSaveEdge: (UmlEdge) -> Unit,
    onDeleteEdge: (String) -> Unit,
    onDismissRequest: () -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    var selectedType by remember { mutableStateOf(edge.relationshipType) }
    var selectedRouting by remember { mutableStateOf(edge.routingMode) }
    var sourceMult by remember { mutableStateOf(edge.sourceMultiplicity ?: "") }
    var targetMult by remember { mutableStateOf(edge.targetMultiplicity ?: "") }
    var label by remember { mutableStateOf(edge.label ?: "") }

    ModalBottomSheet(
        onDismissRequest = onDismissRequest,
        sheetState = sheetState
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp)
                .padding(bottom = 36.dp)
                .verticalScroll(rememberScrollState())
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Edit Relationship Connector",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )

                IconButton(onClick = onDismissRequest) {
                    Icon(Icons.Default.Close, contentDescription = "Close")
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Relationship Type Picker
            Text("Relationship Type", fontWeight = FontWeight.Bold, fontSize = 13.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                UmlRelationshipType.values().forEach { type ->
                    FilterChip(
                        selected = (selectedType == type),
                        onClick = { selectedType = type },
                        label = { Text(type.displayName, fontSize = 12.sp) },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Routing Mode Picker
            Text("Routing Mode", fontWeight = FontWeight.Bold, fontSize = 13.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                UmlRoutingMode.values().forEach { mode ->
                    FilterChip(
                        selected = (selectedRouting == mode),
                        onClick = { selectedRouting = mode },
                        label = { Text(mode.displayName, fontSize = 12.sp) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Multiplicity & Label
            Text("Multiplicity & Label", fontWeight = FontWeight.Bold, fontSize = 13.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = sourceMult,
                    onValueChange = { sourceMult = it },
                    label = { Text("Source (e.g. 1)") },
                    singleLine = true,
                    modifier = Modifier.weight(1f)
                )
                OutlinedTextField(
                    value = targetMult,
                    onValueChange = { targetMult = it },
                    label = { Text("Target (e.g. 0..*)") },
                    singleLine = true,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(8.dp))
            OutlinedTextField(
                value = label,
                onValueChange = { label = it },
                label = { Text("Connection Label (e.g. 'owns', 'manages')") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(
                    onClick = {
                        onDeleteEdge(edge.id)
                        onDismissRequest()
                    },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Delete Connection")
                }

                Button(
                    onClick = {
                        val updated = edge.copy(
                            relationshipType = selectedType,
                            routingMode = selectedRouting,
                            sourceMultiplicity = sourceMult.trim().ifEmpty { null },
                            targetMultiplicity = targetMult.trim().ifEmpty { null },
                            label = label.trim().ifEmpty { null }
                        )
                        onSaveEdge(updated)
                        onDismissRequest()
                    },
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Save Connection", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
