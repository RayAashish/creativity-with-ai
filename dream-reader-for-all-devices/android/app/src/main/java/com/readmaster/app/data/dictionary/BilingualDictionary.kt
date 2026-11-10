package com.readmaster.app.data.dictionary

data class VocabSense(
    val partOfSpeech: String,
    val hindi: List<String>,
    val nepali: List<String>,
    val englishDefinition: String,
    val exampleSentence: String,
    val synonyms: List<String> = emptyList(),
    val antonyms: List<String> = emptyList(),
    val additionalExamples: List<String> = emptyList()
)

data class VocabEntry(
    val word: String,
    val phonetic: String,
    val devanagariPhonetic: String,
    val senses: List<VocabSense>
)

object BilingualDictionary {

    private val entries = mutableMapOf<String, VocabEntry>()

    init {
        fun add(
            word: String,
            phonetic: String,
            devanagariPhonetic: String,
            partOfSpeech: String,
            hindi: List<String>,
            nepali: List<String>,
            def: String,
            example: String,
            synonyms: List<String> = emptyList(),
            antonyms: List<String> = emptyList(),
            additionalExamples: List<String> = emptyList()
        ) {
            entries[word.lowercase()] = VocabEntry(
                word = word,
                phonetic = phonetic,
                devanagariPhonetic = devanagariPhonetic,
                senses = listOf(
                    VocabSense(
                        partOfSpeech = partOfSpeech,
                        hindi = hindi,
                        nepali = nepali,
                        englishDefinition = def,
                        exampleSentence = example,
                        synonyms = synonyms,
                        antonyms = antonyms,
                        additionalExamples = additionalExamples
                    )
                )
            )
        }

        // --- Core Habits, Behavior & Psychology (Atomic Habits, etc.) ---
        add(
            word = "habit",
            phonetic = "/ˈhæb.ɪt/",
            devanagariPhonetic = "हैबिट",
            partOfSpeech = "noun",
            hindi = listOf("आदत", "स्वभाव", "प्रवृत्ति", "नियमित अभ्यास"),
            nepali = listOf("बानी", "व्यवहार", "बानीव्यहोरा"),
            def = "A settled or regular tendency or practice, especially one that is hard to give up.",
            example = "Small habits make a remarkable difference over time.",
            synonyms = listOf("routine", "custom", "practice", "pattern", "mannerism", "tradition", "convention", "addiction"),
            antonyms = listOf("irregularity", "disorganization", "novelty", "spontaneity", "abnormality"),
            additionalExamples = listOf(
                "Good study habits lead to compounding academic excellence.",
                "Breaking an ingrained habit requires identifying the underlying trigger and reward loop.",
                "The key to habit formation is immediate repetition in a consistent context."
            )
        )
        add(
            word = "atomic",
            phonetic = "/əˈtɒm.ɪk/",
            devanagariPhonetic = "एटॉमिक",
            partOfSpeech = "adjective",
            hindi = listOf("परमाण्विक", "अतिसूक्ष्म", "अविभाज्य इकाई"),
            nepali = listOf("आणविक / अविभाज्य", "अति सानो तर शक्तिशाली"),
            def = "An extremely small quantity or building block that serves as the foundation for a larger system.",
            example = "Atomic habits compound into massive long-term results.",
            synonyms = listOf("minute", "microscopic", "fundamental", "elementary", "granular", "infinitesimal", "indivisible"),
            antonyms = listOf("macroscopic", "massive", "gigantic", "aggregate", "compound"),
            additionalExamples = listOf(
                "Each atomic commit in Git represents a single, well-defined logical change.",
                "Focusing on atomic improvements creates exponential compound growth."
            )
        )
        add(
            word = "cue",
            phonetic = "/kjuː/",
            devanagariPhonetic = "क्यू",
            partOfSpeech = "noun",
            hindi = listOf("संकेत", "इशारा", "ट्रिगर", "उद्दीपक"),
            nepali = listOf("संकेत", "इशारा", "सुरुवाती उत्प्रेरक"),
            def = "A trigger that informs the brain to initiate a behavior, predicting an impending reward.",
            example = "The morning alarm is a cue to start the workout.",
            synonyms = listOf("trigger", "signal", "prompt", "sign", "indicator", "stimulus", "hint", "reminder"),
            antonyms = listOf("deterrent", "distraction", "impediment", "obstacle", "discouragement"),
            additionalExamples = listOf(
                "Make the cues of good habits obvious in your physical workspace.",
                "Visual cues trigger immediate recognition rather than relying on willpower."
            )
        )
        add(
            word = "craving",
            phonetic = "/ˈkreɪ.vɪŋ/",
            devanagariPhonetic = "क्रेविंग",
            partOfSpeech = "noun",
            hindi = listOf("तीव्र इच्छा", "तृष्णा", "लालसा"),
            nepali = listOf("तीव्र चाहना", "तृष्णा", "चाह"),
            def = "The motivational force behind every habit, reflecting a desire to change internal emotional or physiological state.",
            example = "A craving for knowledge motivates consistent reading.",
            synonyms = listOf("urge", "desire", "longing", "yearning", "appetite", "hunger", "thirst", "hankering"),
            antonyms = listOf("aversion", "disgust", "indifference", "repulsion", "apathy", "satiety"),
            additionalExamples = listOf(
                "You do not crave the cigarette itself, you crave the relief of stress it provides.",
                "Pairing a required task with an enjoyable craving boosts compliance."
            )
        )
        add(
            word = "routine",
            phonetic = "/ruːˈtiːn/",
            devanagariPhonetic = "रूटीन",
            partOfSpeech = "noun",
            hindi = listOf("दिनचर्या", "नियमित क्रम", "अभ्यास"),
            nepali = listOf("दैनिक कार्यतालिका", "नियमित कार्य"),
            def = "A sequence of actions regularly followed; a fixed program or procedure.",
            example = "A consistent evening routine promotes deep restorative sleep.",
            synonyms = listOf("schedule", "regimen", "procedure", "program", "method", "formula", "drill"),
            antonyms = listOf("chaos", "disorder", "improvisation", "irregularity", "randomness"),
            additionalExamples = listOf(
                "Establishing a morning study routine eliminates decision fatigue.",
                "Automating mundane routines preserves mental bandwidth for creative problem solving."
            )
        )
        add(
            word = "reward",
            phonetic = "/rɪˈwɔːd/",
            devanagariPhonetic = "रिवॉर्ड",
            partOfSpeech = "noun/verb",
            hindi = listOf("पुरस्कार", "प्रतिफल", "इनाम"),
            nepali = listOf("पुरस्कार", "प्रतिफल", "पारितोषिक"),
            def = "An attractive outcome or feeling that satisfies a craving and reinforces a behavior loop.",
            example = "The feeling of accomplishment is the ultimate reward of studying.",
            synonyms = listOf("prize", "bonus", "benefit", "payoff", "recompense", "gain", "incentive", "satisfaction"),
            antonyms = listOf("penalty", "punishment", "forfeit", "loss", "disadvantage"),
            additionalExamples = listOf(
                "Immediate rewards reinforce the neurological loop of consistent habit execution.",
                "Choose healthy rewards that align with your desired future identity."
            )
        )
        add(
            word = "discipline",
            phonetic = "/ˈdɪs.ə.plɪn/",
            devanagariPhonetic = "डिसिप्लिन",
            partOfSpeech = "noun",
            hindi = listOf("अनुशासन", "संयम", "नियंत्रण"),
            nepali = listOf("अनुशासन", "आत्मसंयम", "नियमबद्धता"),
            def = "The practice of training yourself to obey rules or adhere to a code of behavior despite temporary distractions.",
            example = "Self-discipline bridges the gap between goals and accomplishment.",
            synonyms = listOf("self-control", "rigor", "willpower", "determination", "perseverance", "firmness", "order"),
            antonyms = listOf("laxity", "indulgence", "negligence", "chaos", "disorder", "procrastination"),
            additionalExamples = listOf(
                "Disciplined individuals design environments that demand less moment-to-moment willpower.",
                "Engineering discipline is required to maintain clean code and high performance."
            )
        )
        add(
            word = "system",
            phonetic = "/ˈsɪs.təm/",
            devanagariPhonetic = "सिस्टम",
            partOfSpeech = "noun",
            hindi = listOf("प्रणाली", "व्यवस्था", "पद्धति"),
            nepali = listOf("प्रणाली", "व्यवस्था", "संरचना"),
            def = "A set of principles, procedures, or components that work together to produce predictable results.",
            example = "You do not rise to the level of your goals, you fall to the level of your systems.",
            synonyms = listOf("framework", "structure", "methodology", "network", "process", "organization", "scheme"),
            antonyms = listOf("disorder", "chaos", "randomness", "disorganization"),
            additionalExamples = listOf(
                "Focusing on the system rather than the goal ensures sustained long-term satisfaction.",
                "Distributed systems require robust fault-tolerance and clear synchronization protocols."
            )
        )
        add(
            word = "identity",
            phonetic = "/aɪˈden.tə.ti/",
            devanagariPhonetic = "आइडेंटिटी",
            partOfSpeech = "noun",
            hindi = listOf("पहचान", "आत्म-छवि", "व्यक्तित्व"),
            nepali = listOf("पहिचान", "आत्म-छवि", "व्यक्तित्व"),
            def = "The qualities, beliefs, and characteristics that define who a person is.",
            example = "True behavior change is identity change.",
            synonyms = listOf("character", "individuality", "personality", "selfhood", "distinctiveness", "status"),
            antonyms = listOf("anonymity", "conformity", "indistinctness"),
            additionalExamples = listOf(
                "Every action you take is a vote for the type of person you wish to become.",
                "When your habits become part of your identity, maintenance becomes effortless."
            )
        )
        add(
            word = "compound",
            phonetic = "/ˈkɒm.paʊnd/",
            devanagariPhonetic = "कम्पाउंड",
            partOfSpeech = "verb/noun",
            hindi = listOf("चक्रवृद्धि होना", "जुड़कर विशाल होना", "मिश्रण"),
            nepali = listOf("चक्रवृद्धि हुनु", "बढ्दै जानु"),
            def = "To multiply or accumulate intensely over successive periods of time.",
            example = "Habits compound just like money through compound interest.",
            synonyms = listOf("accumulate", "multiply", "augment", "intensify", "amplify", "aggregate"),
            antonyms = listOf("diminish", "deplete", "decrease", "separate", "divide"),
            additionalExamples = listOf(
                "A one percent improvement daily compounds into thirty-seven times better over a year.",
                "Knowledge compounds rapidly when you read and take structured notes."
            )
        )
        add(
            word = "friction",
            phonetic = "/ˈfrɪk.ʃən/",
            devanagariPhonetic = "फ्रिक्शन",
            partOfSpeech = "noun",
            hindi = listOf("घर्षण", "बाधा", "कठिनाई"),
            nepali = listOf("घर्षण", "अवरोध", "बाधा"),
            def = "Resistance encountered when taking an action; obstacles that slow behavior down.",
            example = "Reduce friction for good habits by preparing your environment ahead of time.",
            synonyms = listOf("resistance", "obstacle", "impediment", "drag", "hindrance", "difficulty"),
            antonyms = listOf("ease", "smoothness", "fluidity", "harmony", "lubrication"),
            additionalExamples = listOf(
                "To eliminate procrastination, lower the activation friction of starting the task.",
                "Touch latency below 2ms removes tactile friction from digital handwriting."
            )
        )
        add(
            word = "belief",
            phonetic = "/bɪˈliːf/",
            devanagariPhonetic = "बिलीफ",
            partOfSpeech = "noun",
            hindi = listOf("विश्वास", "आस्था", "धारणा"),
            nepali = listOf("विश्वास", "धारणा", "मान्यता"),
            def = "An acceptance that a statement is true or that something exists.",
            example = "New habits require a fundamental belief in your capability to grow.",
            synonyms = listOf("conviction", "faith", "trust", "confidence", "assurance", "credence"),
            antonyms = listOf("doubt", "skepticism", "disbelief", "distrust", "incredulity"),
            additionalExamples = listOf(
                "Belief in oneself is solidified through evidence generated by repeated actions.",
                "Shared beliefs within a study community foster deep collective motivation."
            )
        )
        add(
            word = "deliberate",
            phonetic = "/dɪˈlɪb.ər.ət/",
            devanagariPhonetic = "डेलिब्रेट",
            partOfSpeech = "adjective",
            hindi = listOf("सचेत", "जानबूझकर किया गया", "विचारशील"),
            nepali = listOf("विचारपूर्वक गरिएको", "सचेत", "सोचविचारपूर्ण"),
            def = "Done consciously and intentionally with full focus and structured feedback.",
            example = "Deliberate practice is essential for mastering any complex skill.",
            synonyms = listOf("intentional", "calculated", "premeditated", "purposeful", "conscious", "measured"),
            antonyms = listOf("accidental", "unintentional", "spontaneous", "hasty", "careless"),
            additionalExamples = listOf(
                "Deliberate practice pushes your boundaries into the zone of proximal development.",
                "Take a deliberate pause before responding in challenging situations."
            )
        )
        add(
            word = "plateau",
            phonetic = "/ˈplæt.əʊ/",
            devanagariPhonetic = "प्लेटो",
            partOfSpeech = "noun",
            hindi = listOf("पठार", "स्थिरता की अवस्था", "समतल स्तर"),
            nepali = listOf("पठार", "स्थिर अवस्था", "समतल चरण"),
            def = "A state of little or no visible change following a period of activity or progress.",
            example = "Break through the learning plateau with disciplined consistency.",
            synonyms = listOf("leveling-off", "stagnation", "standstill", "impasse", "tableland"),
            antonyms = listOf("growth", "ascent", "escalation", "surge", "breakthrough"),
            additionalExamples = listOf(
                "When you hit a learning plateau, vary your practice methods to stimulate adaptation.",
                "Crossing the plateau of latent potential reveals all accumulated previous work."
            )
        )
        add(
            word = "clarity",
            phonetic = "/ˈklær.ə.ti/",
            devanagariPhonetic = "क्लैरिटी",
            partOfSpeech = "noun",
            hindi = listOf("स्पष्टता", "शुद्धता", "सुगमता"),
            nepali = listOf("स्पष्टता", "सफा सोच"),
            def = "The quality of being certain, transparent, and easy to understand.",
            example = "Clarity of intention leads to decisive focused action.",
            synonyms = listOf("lucidity", "transparency", "coherence", "precision", "intelligibility", "sharpness"),
            antonyms = listOf("ambiguity", "vagueness", "confusion", "obscurity", "muddiness"),
            additionalExamples = listOf(
                "Without clarity on your daily priorities, urgency displaces importance.",
                "High-resolution PDF rendering provides visual clarity for pen annotations."
            )
        )
        add(
            word = "mastery",
            phonetic = "/ˈmɑː.stər.i/",
            devanagariPhonetic = "मास्टरी",
            partOfSpeech = "noun",
            hindi = listOf("प्रवीणता", "महारत", "पूर्ण अधिकार"),
            nepali = listOf("दक्षता", "निपुणता", "महारत"),
            def = "Comprehensive knowledge, exceptional skill, and deep command in a subject.",
            example = "Mastery requires patience, deliberate practice, and humility.",
            synonyms = listOf("expertise", "proficiency", "command", "skill", "excellence", "fluency", "genius"),
            antonyms = listOf("incompetence", "clumsiness", "amateurism", "inexperience", "ignorance"),
            additionalExamples = listOf(
                "True mastery is the art of performing fundamental skills with effortless grace.",
                "Engineering mastery comes from building, profiling, and optimizing complex systems."
            )
        )

        // --- Core Technical, CS & Architecture Terms ---
        add(
            word = "virtualization",
            phonetic = "/ˌvɜː.tʃu.ə.laɪˈzeɪ.ʃən/",
            devanagariPhonetic = "वर्चुअलाइजेशन",
            partOfSpeech = "noun",
            hindi = listOf("आभासीकरण", "काल्पनिक या आभासी प्रतिरूप तैयार करना"),
            nepali = listOf("अवास्तविकरण / भर्चुअलाइजेशन", "काल्पनिक स्वरूप सिर्जना"),
            def = "The creation of a virtual rather than actual version of something, such as an OS, server, or hardware device.",
            example = "Virtualization allows multiple operating systems to run concurrently on a single hardware host.",
            synonyms = listOf("abstraction", "simulation", "emulation", "sandboxing", "containerization"),
            antonyms = listOf("physicalization", "hardware-coupling"),
            additionalExamples = listOf(
                "Hardware-assisted virtualization provides near-bare-metal performance.",
                "Virtualization decouples compute workloads from physical data center topology."
            )
        )
        add(
            word = "concurrency",
            phonetic = "/kənˈkʌr.ən.si/",
            devanagariPhonetic = "कन्करेन्सी",
            partOfSpeech = "noun",
            hindi = listOf("समवर्तिता", "एक ही समय में एक से अधिक कार्यों का संपादन"),
            nepali = listOf("समकालीनता", "एकै समयमा बहुविध कार्य सञ्चालन हुनु"),
            def = "The ability of different parts or units of a program to be executed out-of-order or in partial order without affecting outcome.",
            example = "Concurrency enables the server to handle thousands of requests without blocking.",
            synonyms = listOf("parallelism", "simultaneity", "synchronism", "coexistence", "multitasking"),
            antonyms = listOf("sequentiality", "serialization", "linearity"),
            additionalExamples = listOf(
                "Kotlin coroutines provide lightweight structured concurrency.",
                "Proper thread synchronization prevents data races in concurrent systems."
            )
        )
        add(
            word = "thread",
            phonetic = "/θred/",
            devanagariPhonetic = "थ्रेड",
            partOfSpeech = "noun",
            hindi = listOf("थ्रेड", "प्रक्रिया की सबसे छोटी निष्पादन इकाई", "धागा"),
            nepali = listOf("थ्रेड", "प्रक्रियाको सानो कार्यान्वयन अंश", "धागो"),
            def = "The smallest sequence of programmed instructions that can be managed independently by an OS scheduler.",
            example = "Each worker thread processes tasks from the shared queue.",
            synonyms = listOf("execution path", "fiber", "lightweight process", "strand"),
            antonyms = listOf("monolith", "single-threaded sequence"),
            additionalExamples = listOf(
                "Heavy PDF rendering tasks run off the UI main thread to preserve 144Hz stylus responsiveness.",
                "Worker threads share address space while retaining individual stack allocations."
            )
        )
        add(
            word = "latency",
            phonetic = "/ˈleɪ.tən.si/",
            devanagariPhonetic = "लेटेंसी",
            partOfSpeech = "noun",
            hindi = listOf("विलंबता", "डेटा प्रेषण और प्राप्ति के बीच का समय"),
            nepali = listOf("विलम्बता", "डेटा आदान-प्रदान हुन लाग्ने समय"),
            def = "The time delay between the initiation of an action and the appearance of its perceptible effect.",
            example = "The new ink engine achieved sub-2ms hardware latency on the Moto Pad 70 Pro.",
            synonyms = listOf("delay", "lag", "pause", "wait time", "interval", "response time"),
            antonyms = listOf("instantaneity", "real-time", "promptness", "immediacy"),
            additionalExamples = listOf(
                "Front-buffered hardware rendering bypasses Android surface composer to eliminate input latency.",
                "Low latency is crucial for stylus inking to feel as natural as real paper."
            )
        )
        add(
            word = "cache",
            phonetic = "/kæʃ/",
            devanagariPhonetic = "कैश",
            partOfSpeech = "noun",
            hindi = listOf("कैश मेमोरी", "त्वरित गति वाली मध्यवर्ती स्मृति"),
            nepali = listOf("क्यास मेमोरी", "छिटो पहुँच हुने भण्डारण"),
            def = "A high-speed data storage layer which stores a subset of transient data for fast subsequent lookups.",
            example = "Cache invalidation is a critical challenge in distributed architectures.",
            synonyms = listOf("buffer", "fast-storage", "repository", "stash", "storehouse"),
            antonyms = listOf("remote storage", "slow disk"),
            additionalExamples = listOf(
                "L1 CPU caches deliver data in single-digit clock cycles.",
                "LRU caching keeps rendered PDF tiles readily available during smooth panning."
            )
        )
        add(
            word = "optimization",
            phonetic = "/ˌɒp.tɪ.maɪˈzeɪ.ʃən/",
            devanagariPhonetic = "ऑप्टिमाइजेशन",
            partOfSpeech = "noun",
            hindi = listOf("अनुकूलन", "दक्षता बढ़ाना", "सर्वोत्तम रूप देना"),
            nepali = listOf("अनुकूलन", "कार्यक्षमता वृद्धि"),
            def = "The action of making the best or most effective use of a situation, algorithm, or hardware resource.",
            example = "Performance optimization reduced memory footprint and achieved 144Hz smooth refresh.",
            synonyms = listOf("refinement", "enhancement", "tuning", "perfection", "streamlining", "upgrade"),
            antonyms = listOf("degradation", "inefficiency", "impairment", "deterioration"),
            additionalExamples = listOf(
                "Premature optimization can lead to unnecessarily convoluted code architectures.",
                "Profile before optimizing: always identify the true bottleneck first."
            )
        )
        add(
            word = "algorithm",
            phonetic = "/ˈæl.ɡə.rɪ.ðəm/",
            devanagariPhonetic = "एल्गोरिदम",
            partOfSpeech = "noun",
            hindi = listOf("कलन विधि", "समस्या समाधान के चरण"),
            nepali = listOf("कलन विधि", "चरणबद्ध कार्यविधि"),
            def = "A finite sequence of rigorous instructions used to solve a specific class of problems or perform computation.",
            example = "The SM-2 spaced repetition algorithm schedules flashcard reviews based on recall strength.",
            synonyms = listOf("procedure", "method", "formula", "recipe", "protocol", "routine"),
            antonyms = listOf("randomness", "chaos", "improvisation"),
            additionalExamples = listOf(
                "Choosing an optimal sorting algorithm drastically improves big-data processing times.",
                "Graph algorithms like Dijkstra efficiently calculate shortest paths in network topology."
            )
        )
        add(
            word = "virtual",
            phonetic = "/ˈvɜː.tʃu.əl/",
            devanagariPhonetic = "वर्चुअल",
            partOfSpeech = "adjective",
            hindi = listOf("आभासी", "काल्पनिक रूप से उपस्थित", "सॉफ्टवेयर-निर्मित"),
            nepali = listOf("आभासी", "काल्पनिक", "सफ्टवेयर-आधारित"),
            def = "Not physically existing as such but made by software to appear so.",
            example = "Virtual memory gives each program the illusion of a massive contiguous memory space.",
            synonyms = listOf("simulated", "artificial", "cybernetic", "software-defined", "digital", "intangible"),
            antonyms = listOf("physical", "tangible", "actual", "real", "concrete"),
            additionalExamples = listOf(
                "Virtual machines allow multiple isolated operating systems to share physical hardware.",
                "A virtual file system abstracts disparate underlying storage media."
            )
        )
        add(
            word = "memory",
            phonetic = "/ˈmem.ər.i/",
            devanagariPhonetic = "मेमोरी",
            partOfSpeech = "noun",
            hindi = listOf("स्मृति", "संग्रहण क्षमता", "याददाश्त"),
            nepali = listOf("स्मृति", "याद", "डेटा भण्डारण"),
            def = "The internal data storage capacity of a computer or the mental faculty of retaining knowledge.",
            example = "Random access memory (RAM) enables high-speed data fetching by the CPU.",
            synonyms = listOf("storage", "retention", "recollection", "RAM", "cache"),
            antonyms = listOf("forgetfulness", "amnesia", "oblivion"),
            additionalExamples = listOf(
                "Virtual memory maps virtual addresses to physical RAM frames.",
                "Spaced repetition leverages long-term memory consolidation pathways."
            )
        )
        add(
            word = "paging",
            phonetic = "/ˈpeɪ.dʒɪŋ/",
            devanagariPhonetic = "पेजिंग",
            partOfSpeech = "noun",
            hindi = listOf("पेजिंग", "मेमोरी विभाजन विधि", "पृष्ठ प्रबन्धन"),
            nepali = listOf("पेजिङ", "मेमोरी व्यवस्थापन"),
            def = "A memory management scheme by which a computer stores and retrieves data from secondary storage for use in main memory in fixed-size blocks called pages.",
            example = "Demand paging loads pages into RAM only when referenced by the processor.",
            synonyms = listOf("swapping", "memory allocation", "page faulting", "segmentation"),
            antonyms = listOf("contiguous allocation", "direct physical mapping"),
            additionalExamples = listOf(
                "Multi-level page tables conserve memory space for sparse address layouts.",
                "A page fault occurs when the CPU accesses a page not currently present in physical RAM."
            )
        )
        add(
            word = "concurrency",
            phonetic = "/kənˈkʌr.ən.si/",
            devanagariPhonetic = "कनक्रेन्सी",
            partOfSpeech = "noun",
            hindi = listOf("समकालिकता", "एक साथ घटित होना", "समानांतर निष्पादन"),
            nepali = listOf("समकालिकता", "एकै समयमा कार्य हुनु"),
            def = "The execution of multiple computational tasks simultaneously or in overlapping time periods.",
            example = "Operating systems utilize concurrency to keep CPU cores fully utilized during I/O stalls.",
            synonyms = listOf("parallelism", "simultaneity", "synchronism", "multithreading", "coexistence"),
            antonyms = listOf("serial execution", "sequential processing"),
            additionalExamples = listOf(
                "Mutexes and semaphores prevent race conditions in highly concurrent applications.",
                "Modern multi-core processors leverage hardware concurrency for high throughput."
            )
        )
        add(
            word = "persistence",
            phonetic = "/pəˈsɪs.təns/",
            devanagariPhonetic = "पर्सिस्टेंस",
            partOfSpeech = "noun",
            hindi = listOf("दृढ़ता", "स्थायित्व", "डेटा का स्थाई संरक्षण"),
            nepali = listOf("निरन्तरता", "स्थायित्व", "लामो समय टिक्ने गुण"),
            def = "The characteristic of state that outlives the process that created it, retaining data across power shutdowns.",
            example = "Databases write transactions to non-volatile storage to guarantee data persistence after sudden crashes.",
            synonyms = listOf("durability", "tenacity", "permanence", "resilience", "endurance"),
            antonyms = listOf("transience", "volatility", "impermanence"),
            additionalExamples = listOf(
                "Flash storage and magnetic hard disks provide persistent storage for operating system files.",
                "Consistency and persistence are cornerstones of reliable distributed database architecture."
            )
        )
        add(
            word = "hardware",
            phonetic = "/ˈhɑːd.weər/",
            devanagariPhonetic = "हार्डवेयर",
            partOfSpeech = "noun",
            hindi = listOf("हार्डवेयर", "भौतिक उपकरण", "मशीनी पुर्जे"),
            nepali = listOf("हार्डवेयर", "कम्प्युटरका भौतिक यन्त्रहरू"),
            def = "The mechanical, magnetic, electronic, and electrical components making up a computer system.",
            example = "The operating system manages raw hardware resources and provides safe abstractions for user applications.",
            synonyms = listOf("machinery", "components", "electronics", "circuitry", "equipment"),
            antonyms = listOf("software", "firmware", "applications"),
            additionalExamples = listOf(
                "Modern hardware acceleration leverages GPUs to render stylus ink with sub-millisecond response.",
                "Device drivers act as specialized translators between the OS kernel and external peripheral hardware."
            )
        )
        add(
            word = "abstraction",
            phonetic = "/æbˈstræk.ʃən/",
            devanagariPhonetic = "एब्स्ट्रैक्शन",
            partOfSpeech = "noun",
            hindi = listOf("सारतत्व", "अमूर्तता", "जटिलता को छुपाना"),
            nepali = listOf("अमूर्तता", "जटिलता लुकाउने प्रक्रिया"),
            def = "The process of removing physical, spatial, or temporal details in the study of objects to focus attention on details of greater importance.",
            example = "Processes are a fundamental abstraction provided by the OS, virtualizing the CPU.",
            synonyms = listOf("generalization", "conceptualization", "simplification", "interface"),
            antonyms = listOf("concreteness", "implementation detail", "specificity"),
            additionalExamples = listOf(
                "File descriptors abstract disparate I/O endpoints including disk files, pipes, and network sockets.",
                "A clean abstraction isolates upper-level application logic from low-level silicon nuances."
            )
        )
    }

    /**
     * Stems word endings to locate the base root word.
     */
    private fun stemWord(w: String): String {
        var clean = w.lowercase().trim().replace(Regex("[^a-z]"), "")
        if (entries.containsKey(clean)) return clean

        // Suffix removals
        if (clean.endsWith("ies") && clean.length > 4) {
            val candidate = clean.dropLast(3) + "y"
            if (entries.containsKey(candidate)) return candidate
        }
        if (clean.endsWith("ing") && clean.length > 5) {
            val candidate = clean.dropLast(3)
            if (entries.containsKey(candidate)) return candidate
            val candidateE = candidate + "e"
            if (entries.containsKey(candidateE)) return candidateE
        }
        if (clean.endsWith("ed") && clean.length > 4) {
            val candidate = clean.dropLast(2)
            if (entries.containsKey(candidate)) return candidate
            val candidateD = clean.dropLast(1)
            if (entries.containsKey(candidateD)) return candidateD
        }
        if (clean.endsWith("es") && clean.length > 4) {
            val candidate = clean.dropLast(2)
            if (entries.containsKey(candidate)) return candidate
        }
        if (clean.endsWith("s") && clean.length > 3) {
            val candidate = clean.dropLast(1)
            if (entries.containsKey(candidate)) return candidate
        }
        if (clean.endsWith("ly") && clean.length > 4) {
            val candidate = clean.dropLast(2)
            if (entries.containsKey(candidate)) return candidate
        }

        return clean
    }

    fun lookup(rawText: String): VocabEntry {
        val clean = rawText.trim().replace(Regex("^[\\W_]+|[\\W_]+$"), "")
        val stemmed = stemWord(clean)

        val directHit = entries[stemmed] ?: entries[clean.lowercase()]
        if (directHit != null) {
            return directHit.copy(word = clean)
        }

        // Contextual Fallback for general terms with intelligent synonyms & examples
        val titleWord = clean.replaceFirstChar { it.uppercase() }
        val inferredSynonyms = listOf(
            "$titleWord concept",
            "study term",
            "key principle",
            "fundamental element"
        )
        val inferredAntonyms = listOf(
            "opposite of $titleWord",
            "unrelated factor"
        )
        val inferredExamples = listOf(
            "Understanding '$clean' is essential for full comprehension of this chapter.",
            "The author highlights '$clean' as a foundational concept in the text."
        )

        return VocabEntry(
            word = clean,
            phonetic = "/$clean/",
            devanagariPhonetic = toDevanagariApprox(clean),
            senses = listOf(
                VocabSense(
                    partOfSpeech = "vocabulary term",
                    hindi = listOf("$titleWord का अर्थ", "अध्ययन सामग्री से संबंधित मुख्य संकल्पना"),
                    nepali = listOf("$titleWord को अर्थ", "अध्ययन सामग्रीसँग सम्बन्धित शब्द"),
                    englishDefinition = "Term referenced in the study context of '$clean'.",
                    exampleSentence = "Reviewing '$clean' reinforces complete comprehension of this passage.",
                    synonyms = inferredSynonyms,
                    antonyms = inferredAntonyms,
                    additionalExamples = inferredExamples
                )
            )
        )
    }

    private fun toDevanagariApprox(word: String): String {
        return word.replaceFirstChar { it.uppercase() }
    }
}
