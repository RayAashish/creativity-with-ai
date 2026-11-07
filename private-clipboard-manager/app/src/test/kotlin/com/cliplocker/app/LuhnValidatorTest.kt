package com.cliplocker.app

import com.cliplocker.app.core.detector.LuhnValidator
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class LuhnValidatorTest {

    @Test
    fun testValidVisaCards() {
        // Standard 16-digit Visa test card
        assertTrue(LuhnValidator.isValid("4242 4242 4242 4242"))
        assertTrue(LuhnValidator.isRecognizedCard("4242-4242-4242-4242"))
        assertTrue(LuhnValidator.isValid("4532015112830366"))
    }

    @Test
    fun testValidMastercard() {
        // Valid Luhn Mastercard test card
        assertTrue(LuhnValidator.isValid("5555555555554444"))
        assertTrue(LuhnValidator.isRecognizedCard("5555 5555 5555 4444"))
    }

    @Test
    fun testValidAmex() {
        // 15 digits Amex
        assertTrue(LuhnValidator.isValid("378282246310005"))
        assertTrue(LuhnValidator.isRecognizedCard("3782-822463-10005"))
    }

    @Test
    fun testInvalidNumbersFailLuhn() {
        // Inverted checksum on 4242424242424242 -> 4242424242424241
        assertFalse(LuhnValidator.isValid("4242424242424241"))
        assertFalse(LuhnValidator.isValid("5555555555554441"))
        // Short numbers
        assertFalse(LuhnValidator.isValid("1234567"))
        assertFalse(LuhnValidator.isValid(""))
    }
}
