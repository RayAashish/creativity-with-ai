import { VocabMeaning } from '../types';

export const DICTIONARY_DATABASE: Record<string, VocabMeaning> = {
  virtualization: {
    word: 'virtualization',
    phonetic: '/ˌvɜː.tʃu.ə.laɪˈzeɪ.ʃən/',
    devanagariPhonetic: 'वर्चुअलाइजेशन',
    senses: [
      {
        partOfSpeech: 'noun (संगणक/कम्प्युटर)',
        hindi: ['आभासीकरण', 'काल्पनिक या आभासी प्रतिरूप तैयार करना'],
        nepali: ['अवास्तविकरण / भर्चुअलाइजेशन', 'काल्पनिक स्वरूप सिर्जना'],
        englishDefinition: 'The creation of a virtual (rather than actual) version of something, such as an operating system, server, storage device, or network resources.',
        exampleSentence: 'Virtualization allows multiple operating systems to run concurrently on a single hardware host.',
      },
    ],
  },
  concurrency: {
    word: 'concurrency',
    phonetic: '/kənˈkʌr.ən.si/',
    devanagariPhonetic: 'कन्करेन्सी',
    senses: [
      {
        partOfSpeech: 'noun (कम्प्यूटर)',
        hindi: ['समवर्तिता', 'एक ही समय में एक से अधिक कार्यों का संपादन'],
        nepali: ['समकालीनता', 'एकै समयमा बहुविध कार्य सञ्चालन हुनु'],
        englishDefinition: 'The ability of different parts or units of a program, algorithm, or problem to be executed out-of-order or in partial order, without affecting the outcome.',
        exampleSentence: 'Concurrency enables the server to handle thousands of requests without blocking.',
      },
    ],
  },
  thread: {
    word: 'thread',
    phonetic: '/θred/',
    devanagariPhonetic: 'थ्रेड',
    senses: [
      {
        partOfSpeech: 'noun (कम्प्यूटर विज्ञान)',
        hindi: ['थ्रेड', 'प्रक्रिया (process) की सबसे छोटी निष्पादन इकाई'],
        nepali: ['थ्रेड', 'प्रक्रियाको सानो कार्यान्वयन अंश'],
        englishDefinition: 'The smallest sequence of programmed instructions that can be managed independently by a scheduler.',
        exampleSentence: 'Each worker thread processes tasks from the shared queue.',
      },
      {
        partOfSpeech: 'noun (सामान्य)',
        hindi: ['धागा', 'सूत', 'तार'],
        nepali: ['धागो', 'सुता'],
        englishDefinition: 'A long, thin strand of cotton, nylon, or other fibers used in sewing or weaving.',
        exampleSentence: 'She tied the bundle with a strong thread.',
      },
    ],
  },
  process: {
    word: 'process',
    phonetic: '/ˈprəʊ.ses/',
    devanagariPhonetic: 'प्रोसेस',
    senses: [
      {
        partOfSpeech: 'noun (कम्प्यूटर विज्ञान)',
        hindi: ['प्रक्रिया', 'निष्पादन में चल रहा प्रोग्राम'],
        nepali: ['प्रक्रिया', 'सञ्चालनमा रहेको प्रोग्राम'],
        englishDefinition: 'An instance of a computer program that is being executed by one or many threads.',
        exampleSentence: 'The operating system allocates a dedicated address space to each process.',
      },
      {
        partOfSpeech: 'noun (सामान्य)',
        hindi: ['कार्यपद्धति', 'तरीका'],
        nepali: ['पद्धति', 'विधि'],
        englishDefinition: 'A series of actions or steps taken in order to achieve a particular end.',
        exampleSentence: 'Learning a programming language is a step-by-step process.',
      },
    ],
  },
  memory: {
    word: 'memory',
    phonetic: '/ˈmem.ər.i/',
    devanagariPhonetic: 'मेमोरी',
    senses: [
      {
        partOfSpeech: 'noun (कम्प्यूटर)',
        hindi: ['स्मृति', 'मेमोरी (रैम / रैम संग्रहण)'],
        nepali: ['मेमोरी / संचय इकाई'],
        englishDefinition: 'The device or computer components used to store data or programs on a temporary or permanent basis.',
        exampleSentence: 'Paging mechanisms prevent processes from exhausting physical memory.',
      },
      {
        partOfSpeech: 'noun (मानसिक)',
        hindi: ['याददाश्त', 'स्मरण शक्ति'],
        nepali: ['सम्झना शक्ति', 'याद'],
        englishDefinition: 'The faculty by which the mind stores and remembers information.',
        exampleSentence: 'He has an exceptional memory for mathematical formulas.',
      },
    ],
  },
  cache: {
    word: 'cache',
    phonetic: '/kæʃ/',
    devanagariPhonetic: 'कैश',
    senses: [
      {
        partOfSpeech: 'noun (कम्प्यूटर)',
        hindi: ['कैश मेमोरी', 'त्वरित गति वाली गुप्त या मध्यवर्ती स्मृति'],
        nepali: ['क्यास मेमोरी', 'छिटो पहुँच हुने भण्डारण'],
        englishDefinition: 'A high-speed data storage layer which stores a subset of data so that future requests for that data are served up faster.',
        exampleSentence: 'Cache invalidation is a critical challenge in distributed architectures.',
      },
    ],
  },
  mutex: {
    word: 'mutex',
    phonetic: '/ˈmjuː.teks/',
    devanagariPhonetic: 'म्यूटेक्स',
    senses: [
      {
        partOfSpeech: 'noun (कम्प्यूटर)',
        hindi: ['पारस्परिक अपवर्जन लॉक (Mutual Exclusion)'],
        nepali: ['म्युचुअल एक्सक्लुजन लक'],
        englishDefinition: 'A program object that allows multiple program threads to share the same resource, such as file access, but not simultaneously.',
        exampleSentence: 'Acquire the mutex lock before updating the global balance.',
      },
    ],
  },
  abstraction: {
    word: 'abstraction',
    phonetic: '/æbˈstræk.ʃən/',
    devanagariPhonetic: 'एब्सट्रैक्शन',
    senses: [
      {
        partOfSpeech: 'noun',
        hindi: ['अमूर्तिकरण', 'जटिलता को छिपाकर केवल आवश्यक विवरण प्रस्तुत करना'],
        nepali: ['अमूर्तिकरण', 'जटिल विवरण लुकाएर मुख्य ढाँचा देखाउनु'],
        englishDefinition: 'The quality of dealing with ideas rather than events; in software, hiding background details to reduce complexity.',
        exampleSentence: 'File systems provide an abstraction over raw magnetic or flash disk sectors.',
      },
    ],
  },
  latency: {
    word: 'latency',
    phonetic: '/ˈleɪ.tən.si/',
    devanagariPhonetic: 'लेटेंसी',
    senses: [
      {
        partOfSpeech: 'noun (नेटवर्क/कम्प्यूटर)',
        hindi: ['विलंबता', 'डेटा प्रेषण और प्राप्ति के बीच का समय'],
        nepali: ['विलम्बता', 'डेटा आदान-प्रदान हुन लाग्ने समय'],
        englishDefinition: 'The time that elapses between a cause and the effect for some physical change, especially in network transmissions.',
        exampleSentence: 'Edge computing reduces network latency for real-time mobile applications.',
      },
    ],
  },
  throughput: {
    word: 'throughput',
    phonetic: '/ˈθruː.pʊt/',
    devanagariPhonetic: 'थ्रूपुट',
    senses: [
      {
        partOfSpeech: 'noun',
        hindi: ['कार्यक्षमता दर', 'प्रति इकाई समय में संसाधित कार्य की मात्रा'],
        nepali: ['उत्पादन दर', 'समय इकाईमा सम्पन्न कार्यको परिमाण'],
        englishDefinition: 'The amount of material or data that passes through a system or process per unit time.',
        exampleSentence: 'The upgraded distributed database increased system throughput by 40%.',
      },
    ],
  },
  immutable: {
    word: 'immutable',
    phonetic: '/ɪˈmjuː.tə.bəl/',
    devanagariPhonetic: 'इम्यूटेबल',
    senses: [
      {
        partOfSpeech: 'adjective',
        hindi: ['अपरिवर्तनीय', 'जो बदला न जा सके', 'स्थिर'],
        nepali: ['अपरिवर्तनीय', 'बदल्न नसकिने'],
        englishDefinition: 'Unchanging over time or unable to be changed; in programming, an object whose state cannot be modified after it is created.',
        exampleSentence: 'Strings in Java and Python are immutable objects.',
      },
    ],
  },
  persistence: {
    word: 'persistence',
    phonetic: '/pəˈsɪs.təns/',
    devanagariPhonetic: 'पर्सिस्टेंस',
    senses: [
      {
        partOfSpeech: 'noun (कम्प्यूटर)',
        hindi: ['दृढ़ता / स्थायित्व', 'प्रोग्राम बंद होने के बाद भी डेटा का सुरक्षित रहना'],
        nepali: ['स्थायित्व', 'कार्यक्रम बन्द भए पनि डेटा सुरक्षित रहने गुण'],
        englishDefinition: 'The characteristic of state of a system that outlives the process that created it, typically saved to non-volatile storage.',
        exampleSentence: 'Databases guarantee persistence through write-ahead logging.',
      },
      {
        partOfSpeech: 'noun (सामान्य)',
        hindi: ['दृढ़ निश्चय', 'लगन', 'हठ'],
        nepali: ['लगनशीलता', 'अविचलित प्रयास'],
        englishDefinition: 'Firm or obstinate continuance in a course of action in spite of difficulty or opposition.',
        exampleSentence: 'Her persistence was rewarded with a top rank in the entrance examination.',
      },
    ],
  },
  allocation: {
    word: 'allocation',
    phonetic: '/ˌæl.əˈkeɪ.ʃən/',
    devanagariPhonetic: 'एलोकेशन',
    senses: [
      {
        partOfSpeech: 'noun',
        hindi: ['आवंटन', 'संसाधनों या स्मृति का वितरण'],
        nepali: ['बाँडफाँड', 'विनियोजन'],
        englishDefinition: 'The action or process of allocating or distributing something; in systems, reserving memory blocks for variables or buffers.',
        exampleSentence: 'Dynamic memory allocation is managed via malloc and free.',
      },
    ],
  },
  indispensable: {
    word: 'indispensable',
    phonetic: '/ˌɪn.dɪˈspen.sə.bəl/',
    devanagariPhonetic: 'इन्डिसपेन्सेबल',
    senses: [
      {
        partOfSpeech: 'adjective',
        hindi: ['अपरिहार्य', 'अत्यावश्यक', 'जिसके बिना काम न चल सके'],
        nepali: ['अपरिहार्य', 'अत्यन्त आवश्यक'],
        englishDefinition: 'Absolutely necessary; that cannot be dispensed with or done without.',
        exampleSentence: 'Version control is an indispensable tool for collaborative software development.',
      },
    ],
  },
  mitigate: {
    word: 'mitigate',
    phonetic: '/ˈmɪt.ɪ.ɡeɪt/',
    devanagariPhonetic: 'मिटिगेट',
    senses: [
      {
        partOfSpeech: 'verb',
        hindi: ['कम करना', 'तीव्रता घटाना', 'शांत करना'],
        nepali: ['कम गर्नु', 'जोखिम घटाउनु', 'न्यून गर्नु'],
        englishDefinition: 'Make less severe, serious, or painful; lessen the gravity of an offense or mistake.',
        exampleSentence: 'Automated testing helps mitigate the risk of regressions in production.',
      },
    ],
  },
  resilient: {
    word: 'resilient',
    phonetic: '/rɪˈzɪl.jənt/',
    devanagariPhonetic: 'रिजिलियन्ट',
    senses: [
      {
        partOfSpeech: 'adjective',
        hindi: ['लचीला', 'संकट झेलने में सक्षम', 'पुनः संभलने वाला'],
        nepali: ['लचिलो', 'प्रतिकूलता सामना गर्न सक्षम'],
        englishDefinition: 'Able to withstand or recover quickly from difficult conditions; fault-tolerant.',
        exampleSentence: 'The distributed cluster is resilient against individual node crashes.',
      },
    ],
  },
  paradox: {
    word: 'paradox',
    phonetic: '/ˈpær.ə.dɒks/',
    devanagariPhonetic: 'पैराडॉक्स',
    senses: [
      {
        partOfSpeech: 'noun',
        hindi: ['विरोधाभास', 'सत्याभासी कथन जो स्वयं का खंडन करता प्रतीत हो'],
        nepali: ['विरोधाभास'],
        englishDefinition: 'A seemingly absurd or self-contradictory statement or proposition that when investigated or explained may prove to be well founded or true.',
        exampleSentence: 'The paradox of modern multitasking is that it often slows down overall productivity.',
      },
    ],
  },
  comprehend: {
    word: 'comprehend',
    phonetic: '/ˌkɒm.prɪˈhend/',
    devanagariPhonetic: 'कम्प्रीहेन्ड',
    senses: [
      {
        partOfSpeech: 'verb',
        hindi: ['समझना', 'पूरी तरह हृदयंगम करना', 'बोध होना'],
        nepali: ['बुझ्नु', 'अर्थ लगाउनु'],
        englishDefinition: 'Grasp mentally; understand.',
        exampleSentence: 'ReadMaster helps students comprehend complex technical papers without distraction.',
      },
    ],
  },
  elucidate: {
    word: 'elucidate',
    phonetic: '/iˈluː.sɪ.deɪt/',
    devanagariPhonetic: 'इलुसिडेट',
    senses: [
      {
        partOfSpeech: 'verb',
        hindi: ['स्पष्ट करना', 'सविस्तार समझाना', 'प्रकाश डालना'],
        nepali: ['प्रष्ट पार्नु', 'खुलासा गर्नु'],
        englishDefinition: 'Make something clear; explain.',
        exampleSentence: 'The professor used diagrams to elucidate the concepts of virtual memory.',
      },
    ],
  },
  scrutinize: {
    word: 'scrutinize',
    phonetic: '/ˈskruː.tɪ.naɪz/',
    devanagariPhonetic: 'स्क्रूटिनाइज',
    senses: [
      {
        partOfSpeech: 'verb',
        hindi: ['बारीकी से जांचना', 'गहन छानबीन करना'],
        nepali: ['सुक्ष्म रूपले जाँच्नु'],
        englishDefinition: 'Examine or inspect closely and thoroughly.',
        exampleSentence: 'Security researchers scrutinize open-source code for potential vulnerabilities.',
      },
    ],
  },
  imperative: {
    word: 'imperative',
    phonetic: '/ɪmˈper.ə.tɪv/',
    devanagariPhonetic: 'इम्पेरेटिव',
    senses: [
      {
        partOfSpeech: 'adjective',
        hindi: ['अनिवार्य', 'अत्यावश्यक', 'आज्ञासूचक'],
        nepali: ['अपरिहार्य', 'आदेशात्मक'],
        englishDefinition: 'Of vital importance; crucial.',
        exampleSentence: 'Proper data validation is imperative before writing to the database.',
      },
    ],
  },
  isolation: {
    word: 'isolation',
    phonetic: '/ˌaɪ.səˈleɪ.ʃən/',
    devanagariPhonetic: 'आइसोलेशन',
    senses: [
      {
        partOfSpeech: 'noun (कम्प्यूटर)',
        hindi: ['पृथक्करण', 'एकांतता', 'प्रक्रियाओं का एक-दूसरे से स्वतंत्र रहना'],
        nepali: ['अलग्गिकरण', 'पृथकता'],
        englishDefinition: 'The state of being separated from others; in database transactions, the I in ACID ensuring transactions do not interfere with each other.',
        exampleSentence: 'Memory isolation prevents one process from reading or modifying another process memory.',
      },
    ],
  },
  permission: {
    word: 'permission',
    phonetic: '/pəˈmɪʃ.ən/',
    devanagariPhonetic: 'परमिशन',
    senses: [
      {
        partOfSpeech: 'noun',
        hindi: ['अनुमति', 'स्वीकृति', 'इजाज़त'],
        nepali: ['अनुमति', 'स्वीकृति'],
        englishDefinition: 'Consent; authorization to do something, such as read, write, or execute a file or memory region.',
        exampleSentence: 'The operating system denied write permission to the read-only segment.',
      },
    ],
  },
  corrupt: {
    word: 'corrupt',
    phonetic: '/kəˈrʌpt/',
    devanagariPhonetic: 'करप्ट',
    senses: [
      {
        partOfSpeech: 'verb (कम्प्यूटर)',
        hindi: ['दूषित करना', 'डेटा बिगाड़ना या नष्ट करना'],
        nepali: ['बिग्रनु / बिगार्नु', 'डेटा नष्ट हुनु'],
        englishDefinition: 'Cause errors or alterations in computer data or files so that they become unusable.',
        exampleSentence: 'A faulty memory stick can silently corrupt disk cache blocks.',
      },
      {
        partOfSpeech: 'adjective (सामान्य)',
        hindi: ['भ्रष्ट', 'बेईमान'],
        nepali: ['भ्रष्ट', 'अनुचित'],
        englishDefinition: 'Having or showing a willingness to act dishonestly in return for money or personal gain.',
        exampleSentence: 'A transparent system prevents corrupt practices.',
      },
    ],
  },
  idealized: {
    word: 'idealized',
    phonetic: '/aɪˈdɪə.laɪzd/',
    devanagariPhonetic: 'आइडियलाइज्ड',
    senses: [
      {
        partOfSpeech: 'adjective',
        hindi: ['आदर्शवादी', 'काल्पनिक रूप से उत्तम प्रस्तुत किया हुआ'],
        nepali: ['आदर्श बनाइएको'],
        englishDefinition: 'Regarded or represented as perfect or better than in reality.',
        exampleSentence: 'Virtual memory provides an idealized view of contiguous physical RAM.',
      },
    ],
  },
  synchronization: {
    word: 'synchronization',
    phonetic: '/ˌsɪŋ.krə.naɪˈzeɪ.ʃən/',
    devanagariPhonetic: 'सिंक्रोनाइजेशन',
    senses: [
      {
        partOfSpeech: 'noun (कम्प्यूटर)',
        hindi: ['तुल्यकालन', 'समकालन', 'थ्रेड्स के बीच समन्वय'],
        nepali: ['समन्वयीकरण', 'एकसाथ कार्य तालमेल'],
        englishDefinition: 'The coordination of events to operate a system in unison; ensuring multiple threads safely coordinate access to shared state.',
        exampleSentence: 'Improper synchronization often causes non-deterministic race condition bugs.',
      },
    ],
  },
  dependency: {
    word: 'dependency',
    phonetic: '/dɪˈpen.dən.si/',
    devanagariPhonetic: 'डिपेंडेंसी',
    senses: [
      {
        partOfSpeech: 'noun (सॉफ्टवेयर इंजीनियरिंग)',
        hindi: ['निर्भरता', 'सॉफ्टवेयर लाइब्रेरी या मॉड्यूल जिस पर प्रोग्राम निर्भर करता है'],
        nepali: ['निर्भरता', 'सफ्टवेयर मोड्युल वा लाइब्रेरी जसमाथि प्रोग्राम निर्भर रहन्छ'],
        englishDefinition: 'A software module, library, or package that another piece of code relies upon to execute properly.',
        exampleSentence: 'Spring manages object dependencies automatically via inversion of control.',
      },
      {
        partOfSpeech: 'noun (सामान्य)',
        hindi: ['आश्रय', 'पराधीनता'],
        nepali: ['आश्रय', 'अधीनता'],
        englishDefinition: 'The state of relying on or being controlled by someone or something else.',
        exampleSentence: 'The team reduced their dependency on external third-party services.',
      },
    ],
  },
  injection: {
    word: 'injection',
    phonetic: '/ɪnˈdʒek.ʃən/',
    devanagariPhonetic: 'इन्जेक्शन',
    senses: [
      {
        partOfSpeech: 'noun (सॉफ्टवेयर)',
        hindi: ['प्रवेशन', 'इन्जेक्शन (निर्भरता प्रदान करना)'],
        nepali: ['प्रविष्टि', 'निर्भरता प्रदान गर्ने विधि'],
        englishDefinition: 'The passing of a dependency into a client object that uses it.',
        exampleSentence: 'Dependency injection makes unit testing much simpler by allowing mocks.',
      },
    ],
  },
  computer: {
    word: 'computer',
    phonetic: '/kəmˈpjuː.tər/',
    devanagariPhonetic: 'कंप्यूटर',
    senses: [
      {
        partOfSpeech: 'noun',
        hindi: ['कंप्यूटर', 'संगणक'],
        nepali: ['कम्प्युटर', 'संगणक यन्त्र'],
        englishDefinition: 'An electronic device for storing and processing data, typically in binary form, according to instructions given to it in a variable program.',
        exampleSentence: 'Modern computer systems utilize multicore processors for parallel execution.',
      },
    ],
  },
  science: {
    word: 'science',
    phonetic: '/ˈsaɪ.əns/',
    devanagariPhonetic: 'साइंस',
    senses: [
      {
        partOfSpeech: 'noun',
        hindi: ['विज्ञान', 'शास्त्र'],
        nepali: ['विज्ञान', 'वैज्ञानिक अध्ययन'],
        englishDefinition: 'The systematic study of the structure and behavior of the physical and natural world through observation and experiment.',
        exampleSentence: 'Computer science combines theoretical algorithms with practical software design.',
      },
    ],
  },
  engineering: {
    word: 'engineering',
    phonetic: '/ˌen.dʒɪˈnɪə.rɪŋ/',
    devanagariPhonetic: 'इंजीनियरिंग',
    senses: [
      {
        partOfSpeech: 'noun',
        hindi: ['अभियांत्रिकी', 'इंजीनियरिंग'],
        nepali: ['इन्जिनियरिङ', 'प्राविधिक शास्त्र'],
        englishDefinition: 'The branch of science and technology concerned with the design, building, and use of engines, machines, and structures.',
        exampleSentence: 'Software engineering emphasizes maintainability, scalability, and code cleanliness.',
      },
    ],
  },
  framework: {
    word: 'framework',
    phonetic: '/ˈfreɪm.wɜːk/',
    devanagariPhonetic: 'फ्रेमवर्क',
    senses: [
      {
        partOfSpeech: 'noun (प्रोग्रामिंग)',
        hindi: ['ढांचा', 'फ्रेमवर्क (पूर्व-निर्मित सॉफ्टवेयर संरचना)'],
        nepali: ['ढाँचा', 'सफ्टवेयर विकासको आधारभूत संरचना'],
        englishDefinition: 'A platform for developing software applications providing a foundation on which software developers can build programs.',
        exampleSentence: 'Spring is a popular enterprise application framework for Java.',
      },
    ],
  },
  database: {
    word: 'database',
    phonetic: '/ˈdeɪ.tə.beɪs/',
    devanagariPhonetic: 'डेटाबेस',
    senses: [
      {
        partOfSpeech: 'noun',
        hindi: ['डेटाबेस', 'आंकड़ा संचय', 'समंक आधार'],
        nepali: ['डाटाबेस', 'तथ्याङ्क भण्डार'],
        englishDefinition: 'An organized collection of structured information, or data, typically stored electronically in a computer system.',
        exampleSentence: 'Relational databases store tables linked by primary and foreign keys.',
      },
    ],
  },
  repository: {
    word: 'repository',
    phonetic: '/rɪˈpɒz.ɪ.tər.i/',
    devanagariPhonetic: 'रिपोजिटरी',
    senses: [
      {
        partOfSpeech: 'noun',
        hindi: ['रिपोजिटरी', 'भंडार', 'कोष'],
        nepali: ['रिपोजिटरी', 'तथ्य भण्डार'],
        englishDefinition: 'A central location in which data or software code is stored and managed (e.g. Git repository or Spring Data repository).',
        exampleSentence: 'Clone the Git repository to set up the development environment.',
      },
    ],
  },
};

/**
 * Normalizes a word for dictionary lookup:
 * - strips surrounding punctuation
 * - lowercases
 * - checks base forms (e.g. removing plural 's', 'es', past tense 'ed', 'ing')
 */
export function lookupWordInLocalDictionary(rawWord: string): VocabMeaning | null {
  const clean = rawWord.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
  if (!clean) return null;

  // 1. Direct hit
  if (DICTIONARY_DATABASE[clean]) {
    return DICTIONARY_DATABASE[clean];
  }

  // 2. Simple inflection stripping
  if (clean.endsWith('s') && DICTIONARY_DATABASE[clean.slice(0, -1)]) {
    return DICTIONARY_DATABASE[clean.slice(0, -1)];
  }
  if (clean.endsWith('es') && DICTIONARY_DATABASE[clean.slice(0, -2)]) {
    return DICTIONARY_DATABASE[clean.slice(0, -2)];
  }
  if (clean.endsWith('ed') && DICTIONARY_DATABASE[clean.slice(0, -2)]) {
    return DICTIONARY_DATABASE[clean.slice(0, -2)];
  }
  if (clean.endsWith('ing') && DICTIONARY_DATABASE[clean.slice(0, -3)]) {
    return DICTIONARY_DATABASE[clean.slice(0, -3)];
  }
  if (clean.endsWith('ing') && DICTIONARY_DATABASE[clean.slice(0, -3) + 'e']) {
    return DICTIONARY_DATABASE[clean.slice(0, -3) + 'e'];
  }

  return null;
}
