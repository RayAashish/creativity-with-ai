package com.antigravity.note.document

import com.antigravity.note.document.model.CanvasImage
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class CanvasImageTest {

    @Test
    fun testCanvasImagePropertiesAndHitTest() {
        val image = CanvasImage(
            id = "img_12345",
            assetRef = "hash_abcdef1234567890.webp",
            x = 100f,
            y = 150f,
            width = 400f,
            height = 300f,
            rotation = 0f,
            zIndex = 1
        )

        assertEquals(100f, image.x, 0.001f)
        assertEquals(150f, image.y, 0.001f)
        assertEquals(400f, image.width, 0.001f)
        assertEquals(300f, image.height, 0.001f)

        // Inside bounds
        assertTrue(image.contains(200f, 200f))
        assertTrue(image.contains(100f, 150f))
        assertTrue(image.contains(500f, 450f))

        // Outside bounds
        assertFalse(image.contains(90f, 150f))
        assertFalse(image.contains(505f, 200f))
        assertFalse(image.contains(200f, 460f))
    }

    @Test
    fun testCanvasImageJsonSerializationAndDeserialization() {
        val original = CanvasImage(
            id = "img_custom_999",
            assetRef = "hash_deadbeef.webp",
            x = 250.5f,
            y = 350.25f,
            width = 600f,
            height = 450f,
            rotation = 45f,
            zIndex = 3
        )

        val json = original.toJsonString()
        val parsed = CanvasImage.fromJson(json)

        assertNotNull(parsed)
        parsed?.let {
            assertEquals(original.id, it.id)
            assertEquals(original.type, it.type)
            assertEquals(original.assetRef, it.assetRef)
            assertEquals(original.x, it.x, 0.001f)
            assertEquals(original.y, it.y, 0.001f)
            assertEquals(original.width, it.width, 0.001f)
            assertEquals(original.height, it.height, 0.001f)
            assertEquals(original.rotation, it.rotation, 0.001f)
            assertEquals(original.zIndex, it.zIndex)
        }
    }
}
