package com.antigravity.note.ui.shapes.uml.engine

import com.antigravity.note.ui.shapes.uml.model.UmlDiagram

/**
 * Command-pattern undo/redo state stack for the UML Editor.
 * Stores lightweight immutable snapshots of [UmlDiagram] with bounded history.
 */
class UmlUndoRedoStack(initialDiagram: UmlDiagram, private val maxHistory: Int = 50) {

    private val undoList = mutableListOf<UmlDiagram>()
    private val redoList = mutableListOf<UmlDiagram>()
    var currentDiagram: UmlDiagram = initialDiagram
        private set

    val canUndo: Boolean get() = undoList.isNotEmpty()
    val canRedo: Boolean get() = redoList.isNotEmpty()

    fun pushState(newDiagram: UmlDiagram) {
        if (newDiagram == currentDiagram) return
        undoList.add(currentDiagram)
        if (undoList.size > maxHistory) {
            undoList.removeAt(0)
        }
        redoList.clear()
        currentDiagram = newDiagram
    }

    fun undo(): UmlDiagram? {
        if (!canUndo) return null
        val previous = undoList.removeAt(undoList.size - 1)
        redoList.add(currentDiagram)
        currentDiagram = previous
        return currentDiagram
    }

    fun redo(): UmlDiagram? {
        if (!canRedo) return null
        val next = redoList.removeAt(redoList.size - 1)
        undoList.add(currentDiagram)
        currentDiagram = next
        return currentDiagram
    }

    fun reset(diagram: UmlDiagram) {
        undoList.clear()
        redoList.clear()
        currentDiagram = diagram
    }
}
