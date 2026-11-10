package com.readmaster.app

import android.graphics.PointF
import com.readmaster.app.data.dictionary.BilingualDictionary
import com.readmaster.app.engine.canvas.CanvasTransform
import com.readmaster.app.engine.palm.InputMode
import com.readmaster.app.engine.palm.PalmRejectionConfig
import com.readmaster.app.engine.palm.PalmRejectionFilter
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test

class AppUnitTest {

    @Test
    fun testCanvasTransform_ScaleAndTranslate() {
        val transform = CanvasTransform()
        assertEquals(1.0f, transform.scale, 0.001f)
        assertEquals(0.0f, transform.translationX, 0.001f)
        assertEquals(0.0f, transform.translationY, 0.001f)

        // Translate
        transform.postTranslate(100f, 200f)
        assertEquals(100f, transform.translationX, 0.001f)
        assertEquals(200f, transform.translationY, 0.001f)

        // Scale centered on (100, 200)
        transform.postScale(2.0f, 100f, 200f)
        assertEquals(2.0f, transform.scale, 0.001f)

        // Scale within bounds (0.5 to 10.0)
        transform.postScale(20.0f, 0f, 0f)
        assertEquals(10.0f, transform.scale, 0.001f)
    }

    @Test
    fun testBilingualDictionary_Lookups() {
        val entry = BilingualDictionary.lookup("virtualization")
        assertEquals("virtualization", entry.word)
        assertEquals("वर्चुअलाइजेशन", entry.devanagariPhonetic)
        assertTrue(entry.senses.isNotEmpty())
        assertTrue(entry.senses[0].hindi.contains("आभासीकरण"))
        assertTrue(entry.senses[0].nepali.any { it.contains("भर्चुअलाइजेशन") })

        val habitEntry = BilingualDictionary.lookup("habit")
        assertEquals("habit", habitEntry.word)
        assertTrue(habitEntry.senses[0].hindi.contains("आदत"))
        assertTrue(habitEntry.senses[0].nepali.contains("बानी"))
    }

    @Test
    fun testPalmRejection_PenPriorityConfig() {
        val filter = PalmRejectionFilter(
            config = PalmRejectionConfig(
                inputMode = InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM,
                graceWindowMs = 350L
            )
        )
        assertEquals(InputMode.PEN_DRAWS_FINGERS_PAN_ZOOM, filter.config.inputMode)
        assertEquals(350L, filter.config.graceWindowMs)
    }
}
