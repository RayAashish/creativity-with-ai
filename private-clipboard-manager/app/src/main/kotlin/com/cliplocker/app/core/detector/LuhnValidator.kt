package com.cliplocker.app.core.detector

object LuhnValidator {

    /**
     * Validates whether a credit card number is structurally valid
     * using the standard Luhn algorithm (mod-10).
     */
    fun isValid(cardNumber: String): Boolean {
        val cleanNumber = cardNumber.replace(Regex("[\\s\\-]"), "")
        if (cleanNumber.length !in 13..19) return false
        if (!cleanNumber.all { it.isDigit() }) return false

        var sum = 0
        var alternate = false

        for (i in cleanNumber.length - 1 downTo 0) {
            var n = cleanNumber[i] - '0'
            if (alternate) {
                n *= 2
                if (n > 9) {
                    n -= 9
                }
            }
            sum += n
            alternate = !alternate
        }

        return sum % 10 == 0
    }

    /**
     * Checks if the card number matches common IIN (Issuer Identification Number) prefixes
     * in addition to passing the Luhn check.
     */
    fun isRecognizedCard(cardNumber: String): Boolean {
        val cleanNumber = cardNumber.replace(Regex("[\\s\\-]"), "")
        if (!isValid(cleanNumber)) return false

        // Visa: starts with 4, length 13, 16, or 19
        if (cleanNumber.startsWith("4") && cleanNumber.length in listOf(13, 16, 19)) return true

        // Mastercard: starts with 51-55 or 2221-2720, length 16
        val prefix2 = cleanNumber.take(2).toIntOrNull() ?: -1
        val prefix4 = cleanNumber.take(4).toIntOrNull() ?: -1
        if ((prefix2 in 51..55 || prefix4 in 2221..2720) && cleanNumber.length == 16) return true

        // American Express: starts with 34 or 37, length 15
        if ((cleanNumber.startsWith("34") || cleanNumber.startsWith("37")) && cleanNumber.length == 15) return true

        // Discover: starts with 6011, 65, 644-649, length 16
        if ((cleanNumber.startsWith("6011") || cleanNumber.startsWith("65") ||
                (prefix2 == 64 && cleanNumber.length == 16)) && cleanNumber.length in 16..19) return true

        // Diners Club: starts with 300-305, 36, 38, length 14
        if ((cleanNumber.startsWith("36") || cleanNumber.startsWith("38") ||
                (cleanNumber.take(3).toIntOrNull() in 300..305)) && cleanNumber.length == 14) return true

        // Default: If it passes Luhn and has 13-19 digits, treat as payment card
        return cleanNumber.length in 13..19
    }
}
