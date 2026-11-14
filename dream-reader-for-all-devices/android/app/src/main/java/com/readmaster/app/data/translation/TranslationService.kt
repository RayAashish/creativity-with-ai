package com.readmaster.app.data.translation

import com.readmaster.app.data.dictionary.BilingualDictionary
import com.readmaster.app.data.dictionary.VocabEntry
import com.readmaster.app.data.dictionary.VocabSense
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

/**
 * Intelligent online & offline translation engine.
 * Supports:
 * 1. Single word deep lookup with phonetics, definitions, and synonyms.
 * 2. Full sentence and multi-word phrase translation (English to Hindi & Nepali).
 * 3. Graceful offline fallback to embedded lexicon.
 */
object TranslationService {

    private val cache = HashMap<String, VocabEntry>()

    /**
     * Translates a word or an entire sentence.
     * If online, fetches live translations from Google Translate and Free Dictionary API.
     * If offline or on network failure, falls back to offline lexicon.
     */
    suspend fun translateText(rawText: String): VocabEntry = withContext(Dispatchers.IO) {
        val trimmed = rawText.trim()
        if (trimmed.isEmpty()) {
            return@withContext BilingualDictionary.lookup("")
        }

        val cacheKey = trimmed.lowercase()
        synchronized(cache) {
            val cached = cache[cacheKey]
            if (cached != null) return@withContext cached
        }

        val isSentence = trimmed.contains(" ") || trimmed.length > 25

        // Check if offline dictionary has an exact hit
        val offlineHit = if (!isSentence) BilingualDictionary.findExactHit(trimmed) else null

        // Try online translation
        try {
            val hindiText = fetchGoogleTranslation(trimmed, "hi")
            val nepaliText = fetchGoogleTranslation(trimmed, "ne")

            val definition: String
            val phonetics: String
            val synonyms = mutableListOf<String>()
            val antonyms = mutableListOf<String>()
            val examples = mutableListOf<String>()
            val partOfSpeech: String

            if (!isSentence) {
                // Fetch dictionary metadata
                val dictData = fetchWordDefinition(trimmed)
                if (dictData != null) {
                    definition = dictData.definition.ifBlank { offlineHit?.senses?.firstOrNull()?.englishDefinition ?: "Vocabulary term" }
                    phonetics = dictData.phonetic.ifBlank { "/$trimmed/" }
                    partOfSpeech = dictData.partOfSpeech.ifBlank { "vocabulary term" }
                    synonyms.addAll(dictData.synonyms)
                    antonyms.addAll(dictData.antonyms)
                    if (dictData.example.isNotBlank()) {
                        examples.add(dictData.example)
                    }
                } else if (offlineHit != null) {
                    val sense = offlineHit.senses.first()
                    definition = sense.englishDefinition
                    phonetics = offlineHit.phonetic
                    partOfSpeech = sense.partOfSpeech
                    synonyms.addAll(sense.synonyms)
                    antonyms.addAll(sense.antonyms)
                    examples.addAll(sense.additionalExamples)
                } else {
                    definition = "Definition referenced in study context: '$trimmed'."
                    phonetics = "/$trimmed/"
                    partOfSpeech = "vocabulary term"
                }
            } else {
                definition = "Full sentence translation."
                phonetics = ""
                partOfSpeech = "sentence"
                examples.add("\"$trimmed\"")
            }

            val finalHindi = if (hindiText.isNotBlank()) listOf(hindiText) else (offlineHit?.senses?.firstOrNull()?.hindi ?: listOf("$trimmed का अनुवाद"))
            val finalNepali = if (nepaliText.isNotBlank()) listOf(nepaliText) else (offlineHit?.senses?.firstOrNull()?.nepali ?: listOf("$trimmed को अनुवाद"))

            val entry = VocabEntry(
                word = trimmed,
                phonetic = phonetics,
                devanagariPhonetic = if (!isSentence) hindiText.split(" ").firstOrNull() ?: trimmed else "",
                senses = listOf(
                    VocabSense(
                        partOfSpeech = partOfSpeech,
                        hindi = finalHindi,
                        nepali = finalNepali,
                        englishDefinition = definition,
                        exampleSentence = examples.firstOrNull() ?: trimmed,
                        synonyms = synonyms,
                        antonyms = antonyms,
                        additionalExamples = examples
                    )
                )
            )

            synchronized(cache) {
                cache[cacheKey] = entry
            }

            return@withContext entry
        } catch (_: Exception) {
            // Offline fallback
            val fallback = BilingualDictionary.lookup(trimmed)
            return@withContext fallback
        }
    }

    private fun fetchGoogleTranslation(text: String, targetLang: String): String {
        val encoded = URLEncoder.encode(text, "UTF-8")
        val urlStr = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=$targetLang&dt=t&q=$encoded"
        val conn = (URL(urlStr).openConnection() as HttpURLConnection).apply {
            connectTimeout = 3000
            readTimeout = 3500
            setRequestProperty("User-Agent", "Mozilla/5.0 (Android; Mobile)")
        }

        try {
            if (conn.responseCode != 200) return ""
            val jsonStr = conn.inputStream.bufferedReader().use { it.readText() }
            val root = JSONArray(jsonStr)
            val parts = root.getJSONArray(0)
            val sb = StringBuilder()
            for (i in 0 until parts.length()) {
                val part = parts.getJSONArray(i)
                val trans = part.optString(0, "")
                if (trans.isNotBlank()) {
                    sb.append(trans)
                }
            }
            return sb.toString().trim()
        } finally {
            conn.disconnect()
        }
    }

    private data class DictData(
        val definition: String,
        val phonetic: String,
        val partOfSpeech: String,
        val example: String,
        val synonyms: List<String>,
        val antonyms: List<String>
    )

    private fun fetchWordDefinition(word: String): DictData? {
        val clean = word.lowercase().replace(Regex("[^a-z]"), "")
        if (clean.isBlank()) return null
        val urlStr = "https://api.dictionaryapi.dev/api/v2/entries/en/$clean"
        val conn = (URL(urlStr).openConnection() as HttpURLConnection).apply {
            connectTimeout = 3000
            readTimeout = 3500
            setRequestProperty("User-Agent", "Mozilla/5.0")
        }

        try {
            if (conn.responseCode != 200) return null
            val jsonStr = conn.inputStream.bufferedReader().use { it.readText() }
            val root = JSONArray(jsonStr)
            if (root.length() == 0) return null
            val first = root.getJSONObject(0)

            val phonetic = first.optString("phonetic", "")
            val meanings = first.optJSONArray("meanings") ?: return null
            if (meanings.length() == 0) return null

            val firstMeaning = meanings.getJSONObject(0)
            val pos = firstMeaning.optString("partOfSpeech", "term")
            val defs = firstMeaning.optJSONArray("definitions")
            var def = ""
            var example = ""
            if (defs != null && defs.length() > 0) {
                val firstDef = defs.getJSONObject(0)
                def = firstDef.optString("definition", "")
                example = firstDef.optString("example", "")
            }

            val syns = mutableListOf<String>()
            val synArray = firstMeaning.optJSONArray("synonyms")
            if (synArray != null) {
                for (i in 0 until synArray.length().coerceAtMost(6)) {
                    val s = synArray.getString(i)
                    if (s.isNotBlank()) syns.add(s)
                }
            }

            val ants = mutableListOf<String>()
            val antArray = firstMeaning.optJSONArray("antonyms")
            if (antArray != null) {
                for (i in 0 until antArray.length().coerceAtMost(4)) {
                    val a = antArray.getString(i)
                    if (a.isNotBlank()) ants.add(a)
                }
            }

            return DictData(
                definition = def,
                phonetic = phonetic,
                partOfSpeech = pos,
                example = example,
                synonyms = syns,
                antonyms = ants
            )
        } catch (_: Exception) {
            return null
        } finally {
            conn.disconnect()
        }
    }
}
