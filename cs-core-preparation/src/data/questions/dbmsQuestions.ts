import { Question } from '../../types';

export const DBMS_QUESTIONS: Question[] = [
  {
    "id": "dbms-q1",
    "subject": "dbms",
    "topic": "Relational Model",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What is a Super Key in relational database terminology?",
    "options": [
      "A set of attributes that uniquely identifies each tuple in a relation",
      "A key that must contain all columns",
      "A foreign key with cascade delete",
      "A primary key containing nulls"
    ],
    "correctAnswer": 0,
    "explanation": "A Super Key is any superset of attributes whose values uniquely distinguish every row in a table.",
    "keyFormulaOrNote": "Core DBMS Concept: Relational Model"
  },
  {
    "id": "dbms-q2",
    "subject": "dbms",
    "topic": "Relational Model",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What is a Candidate Key?",
    "options": [
      "A minimal Super Key with no redundant attributes",
      "Any primary key",
      "A key that contains NULLs",
      "A foreign key pointing to itself"
    ],
    "correctAnswer": 0,
    "explanation": "A Candidate Key is an irreducible (minimal) Super Key from which no attribute can be removed without losing uniqueness.",
    "keyFormulaOrNote": "Core DBMS Concept: Relational Model"
  },
  {
    "id": "dbms-q3",
    "subject": "dbms",
    "topic": "Relational Model",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Can a Primary Key column contain NULL values in a relational database?",
    "options": [
      "Yes, up to one NULL",
      "No, never (Entity Integrity Constraint)",
      "Yes, if defined with UNIQUE",
      "Depends on SQL dialect"
    ],
    "correctAnswer": 1,
    "explanation": "The Entity Integrity constraint mandates that no primary key attribute can be NULL to ensure every tuple is uniquely addressable.",
    "keyFormulaOrNote": "Core DBMS Concept: Relational Model"
  },
  {
    "id": "dbms-q4",
    "subject": "dbms",
    "topic": "Normalization",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What requirement must a relation satisfy to be in First Normal Form (1NF)?",
    "options": [
      "All attribute values must be atomic",
      "No partial dependencies",
      "No transitive dependencies",
      "LHS of every FD must be a super key"
    ],
    "correctAnswer": 0,
    "explanation": "1NF prohibits composite and multi-valued attributes, requiring all table cell entries to be atomic values.",
    "keyFormulaOrNote": "Core DBMS Concept: Normalization"
  },
  {
    "id": "dbms-q5",
    "subject": "dbms",
    "topic": "Normalization",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "A table in 1NF is in Second Normal Form (2NF) if and only if it has NO:",
    "options": [
      "Transitive dependencies",
      "Partial dependencies on any candidate key",
      "Multi-valued dependencies",
      "Foreign keys"
    ],
    "correctAnswer": 1,
    "explanation": "2NF eliminates partial dependencies: no non-prime attribute may functionally depend on a proper subset of any candidate key.",
    "keyFormulaOrNote": "Core DBMS Concept: Normalization"
  },
  {
    "id": "dbms-q6",
    "subject": "dbms",
    "topic": "Normalization",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "For a relation to be in Third Normal Form (3NF), for every non-trivial FD X -> Y, what condition must hold?",
    "options": [
      "X must be a super key OR Y must be a prime attribute",
      "X must always be a candidate key",
      "Y must be a foreign key",
      "X and Y must be identical"
    ],
    "correctAnswer": 0,
    "explanation": "3NF allows non-trivial FD X -> Y if either X is a Super Key OR Y is part of some candidate key (a Prime attribute).",
    "keyFormulaOrNote": "Core DBMS Concept: Normalization"
  },
  {
    "id": "dbms-q7",
    "subject": "dbms",
    "topic": "Normalization",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Boyce-Codd Normal Form (BCNF) is strictly stronger than 3NF because it requires that for EVERY non-trivial FD X -> Y:",
    "options": [
      "X must be a Super Key",
      "Y must be a prime attribute",
      "X must have only 1 attribute",
      "The table has only 2 rows"
    ],
    "correctAnswer": 0,
    "explanation": "BCNF removes the prime-attribute exception from 3NF: the left-hand side X MUST be a super key for all non-trivial dependencies.",
    "keyFormulaOrNote": "Core DBMS Concept: Normalization"
  },
  {
    "id": "dbms-q8",
    "subject": "dbms",
    "topic": "Normalization",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Can every relational schema be decomposed into BCNF while simultaneously guaranteeing Lossless Join AND Dependency Preservation?",
    "options": [
      "Yes, always",
      "Lossless join is guaranteed, but Dependency Preservation is NOT always guaranteed in BCNF",
      "Neither is guaranteed",
      "Only for tables with 3 columns"
    ],
    "correctAnswer": 1,
    "explanation": "BCNF decomposition is always lossless, but preserving all functional dependencies may be impossible without violating BCNF. 3NF always guarantees both.",
    "keyFormulaOrNote": "Core DBMS Concept: Normalization"
  },
  {
    "id": "dbms-q9",
    "subject": "dbms",
    "topic": "Transactions & ACID",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which ACID property guarantees that all operations of a transaction are completed successfully, or none of them are reflected in the database?",
    "options": [
      "Atomicity",
      "Consistency",
      "Isolation",
      "Durability"
    ],
    "correctAnswer": 0,
    "explanation": "Atomicity ensures \"all or nothing\" execution, maintained by database write-ahead logging (WAL) and rollbacks.",
    "keyFormulaOrNote": "Core DBMS Concept: Transactions & ACID"
  },
  {
    "id": "dbms-q10",
    "subject": "dbms",
    "topic": "Transactions & ACID",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which component of the DBMS is primarily responsible for ensuring the ISOLATION property of concurrent transactions?",
    "options": [
      "Recovery Manager",
      "Concurrency Control Manager (Locking/Timestamping)",
      "Buffer Pool Manager",
      "Query Optimizer"
    ],
    "correctAnswer": 1,
    "explanation": "The Concurrency Control Manager enforces serializability and prevents dirty reads, unrepeatable reads, and phantom reads.",
    "keyFormulaOrNote": "Core DBMS Concept: Transactions & ACID"
  },
  {
    "id": "dbms-q11",
    "subject": "dbms",
    "topic": "Serializability",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Two operations in a concurrent schedule conflict if and only if:",
    "options": [
      "They belong to different transactions, access the same data item, and at least one is a write",
      "They read the same item",
      "They belong to the same transaction",
      "They commit at the same time"
    ],
    "correctAnswer": 0,
    "explanation": "Conflicting operations: (1) different transactions, (2) same data item, (3) at least one is a WRITE operation.",
    "keyFormulaOrNote": "Core DBMS Concept: Serializability"
  },
  {
    "id": "dbms-q12",
    "subject": "dbms",
    "topic": "Serializability",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "How do we test if a schedule is Conflict Serializable?",
    "options": [
      "Check if its Precedence (Serialization) Graph is ACYCLIC",
      "Check if all transactions commit simultaneously",
      "Count the number of locks",
      "Check if there are no write operations"
    ],
    "correctAnswer": 0,
    "explanation": "A schedule is conflict serializable if and only if its precedence graph contains no directed cycles. Topological sort gives the equivalent serial order.",
    "keyFormulaOrNote": "Core DBMS Concept: Serializability"
  },
  {
    "id": "dbms-q13",
    "subject": "dbms",
    "topic": "Concurrency Control",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "In Basic Two-Phase Locking (2PL), what can a transaction NOT do once it enters the Shrinking Phase?",
    "options": [
      "Acquire any new locks",
      "Release any locks",
      "Commit",
      "Read unlocked data"
    ],
    "correctAnswer": 0,
    "explanation": "2PL rule: Once a transaction releases any lock (enters shrinking phase), it is strictly prohibited from acquiring any further locks.",
    "keyFormulaOrNote": "Core DBMS Concept: Concurrency Control"
  },
  {
    "id": "dbms-q14",
    "subject": "dbms",
    "topic": "Concurrency Control",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Does Basic Two-Phase Locking (2PL) guarantee freedom from DEADLOCKS?",
    "options": [
      "Yes, 2PL completely eliminates deadlocks",
      "No, 2PL guarantees conflict serializability, but deadlocks can still occur",
      "Only if exclusive locks are used",
      "Only for read-only transactions"
    ],
    "correctAnswer": 1,
    "explanation": "2PL ensures serializability but does NOT prevent cyclic lock waits (deadlocks), which must be handled via timeouts or wait-for graph detection.",
    "keyFormulaOrNote": "Core DBMS Concept: Concurrency Control"
  },
  {
    "id": "dbms-q15",
    "subject": "dbms",
    "topic": "Concurrency Control",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "What additional guarantee does STRICT Two-Phase Locking provide over basic 2PL?",
    "options": [
      "It prevents cascading rollbacks by holding exclusive locks until transaction completion",
      "It eliminates all deadlocks",
      "It runs without lock manager",
      "It allows dirty reads"
    ],
    "correctAnswer": 0,
    "explanation": "Strict 2PL holds all exclusive (write) locks until the transaction commits or aborts, ensuring no other transaction reads uncommitted dirty data.",
    "keyFormulaOrNote": "Core DBMS Concept: Concurrency Control"
  },
  {
    "id": "dbms-q16",
    "subject": "dbms",
    "topic": "SQL & Queries",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What is the key difference between WHERE and HAVING clauses in SQL?",
    "options": [
      "WHERE filters rows before grouping; HAVING filters aggregated groups after GROUP BY",
      "WHERE is for strings; HAVING is for numbers",
      "HAVING cannot use comparison operators",
      "WHERE requires aggregate functions"
    ],
    "correctAnswer": 0,
    "explanation": "WHERE filters individual tuples before aggregation occurs. HAVING filters aggregate bucket results generated by GROUP BY.",
    "keyFormulaOrNote": "Core DBMS Concept: SQL & Queries"
  },
  {
    "id": "dbms-q17",
    "subject": "dbms",
    "topic": "SQL & Queries",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which type of JOIN returns all records from the left table and matched records from the right table, filling non-matching right columns with NULL?",
    "options": [
      "INNER JOIN",
      "LEFT OUTER JOIN",
      "CROSS JOIN",
      "FULL OUTER JOIN"
    ],
    "correctAnswer": 1,
    "explanation": "LEFT OUTER JOIN preserves every row from the left table regardless of whether a matching predicate exists in the right table.",
    "keyFormulaOrNote": "Core DBMS Concept: SQL & Queries"
  },
  {
    "id": "dbms-q18",
    "subject": "dbms",
    "topic": "Indexing & Storage",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Why are B+ Trees preferred over B-Trees for database disk indexing?",
    "options": [
      "All data records/pointers are stored exclusively at the leaf level, allowing leaf nodes to be linked as a linked list for rapid range scans",
      "B+ trees have greater depth",
      "B+ trees consume more disk space",
      "B+ trees do not require balancing"
    ],
    "correctAnswer": 0,
    "explanation": "In B+ trees, internal nodes contain only routing keys (maximizing fanout and minimizing I/O depth), and leaves form a linked list for range queries.",
    "keyFormulaOrNote": "Core DBMS Concept: Indexing & Storage"
  },
  {
    "id": "dbms-q19",
    "subject": "dbms",
    "topic": "SQL Joins & Aggregates",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #19: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q20",
    "subject": "dbms",
    "topic": "Functional Dependencies",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #20: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q21",
    "subject": "dbms",
    "topic": "Transactions & Recovery",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #21: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q22",
    "subject": "dbms",
    "topic": "B+ Tree Indexing",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #22: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q23",
    "subject": "dbms",
    "topic": "View Serializability",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #23: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q24",
    "subject": "dbms",
    "topic": "Relational Algebra",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #24: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q25",
    "subject": "dbms",
    "topic": "SQL Joins & Aggregates",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #25: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q26",
    "subject": "dbms",
    "topic": "Functional Dependencies",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #26: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q27",
    "subject": "dbms",
    "topic": "Transactions & Recovery",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #27: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q28",
    "subject": "dbms",
    "topic": "B+ Tree Indexing",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #28: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q29",
    "subject": "dbms",
    "topic": "View Serializability",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #29: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q30",
    "subject": "dbms",
    "topic": "Relational Algebra",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #30: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q31",
    "subject": "dbms",
    "topic": "SQL Joins & Aggregates",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #31: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q32",
    "subject": "dbms",
    "topic": "Functional Dependencies",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #32: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q33",
    "subject": "dbms",
    "topic": "Transactions & Recovery",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #33: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q34",
    "subject": "dbms",
    "topic": "B+ Tree Indexing",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #34: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q35",
    "subject": "dbms",
    "topic": "View Serializability",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #35: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q36",
    "subject": "dbms",
    "topic": "Relational Algebra",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #36: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q37",
    "subject": "dbms",
    "topic": "SQL Joins & Aggregates",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #37: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q38",
    "subject": "dbms",
    "topic": "Functional Dependencies",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #38: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q39",
    "subject": "dbms",
    "topic": "Transactions & Recovery",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #39: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q40",
    "subject": "dbms",
    "topic": "B+ Tree Indexing",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #40: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q41",
    "subject": "dbms",
    "topic": "View Serializability",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #41: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q42",
    "subject": "dbms",
    "topic": "Relational Algebra",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #42: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q43",
    "subject": "dbms",
    "topic": "SQL Joins & Aggregates",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #43: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q44",
    "subject": "dbms",
    "topic": "Functional Dependencies",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #44: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q45",
    "subject": "dbms",
    "topic": "Transactions & Recovery",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #45: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q46",
    "subject": "dbms",
    "topic": "B+ Tree Indexing",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #46: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q47",
    "subject": "dbms",
    "topic": "View Serializability",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #47: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q48",
    "subject": "dbms",
    "topic": "Relational Algebra",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #48: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q49",
    "subject": "dbms",
    "topic": "SQL Joins & Aggregates",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #49: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q50",
    "subject": "dbms",
    "topic": "Functional Dependencies",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #50: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q51",
    "subject": "dbms",
    "topic": "Transactions & Recovery",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #51: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q52",
    "subject": "dbms",
    "topic": "B+ Tree Indexing",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #52: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q53",
    "subject": "dbms",
    "topic": "View Serializability",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #53: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q54",
    "subject": "dbms",
    "topic": "Relational Algebra",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #54: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q55",
    "subject": "dbms",
    "topic": "SQL Joins & Aggregates",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #55: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q56",
    "subject": "dbms",
    "topic": "Functional Dependencies",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #56: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q57",
    "subject": "dbms",
    "topic": "Transactions & Recovery",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #57: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q58",
    "subject": "dbms",
    "topic": "B+ Tree Indexing",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #58: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q59",
    "subject": "dbms",
    "topic": "View Serializability",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #59: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q60",
    "subject": "dbms",
    "topic": "Relational Algebra",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #60: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q61",
    "subject": "dbms",
    "topic": "SQL Joins & Aggregates",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #61: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q62",
    "subject": "dbms",
    "topic": "Functional Dependencies",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #62: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q63",
    "subject": "dbms",
    "topic": "Transactions & Recovery",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #63: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q64",
    "subject": "dbms",
    "topic": "B+ Tree Indexing",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #64: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q65",
    "subject": "dbms",
    "topic": "View Serializability",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #65: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q66",
    "subject": "dbms",
    "topic": "Relational Algebra",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #66: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q67",
    "subject": "dbms",
    "topic": "SQL Joins & Aggregates",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #67: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q68",
    "subject": "dbms",
    "topic": "Functional Dependencies",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #68: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q69",
    "subject": "dbms",
    "topic": "Transactions & Recovery",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #69: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q70",
    "subject": "dbms",
    "topic": "B+ Tree Indexing",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #70: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q71",
    "subject": "dbms",
    "topic": "View Serializability",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #71: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q72",
    "subject": "dbms",
    "topic": "Relational Algebra",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #72: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q73",
    "subject": "dbms",
    "topic": "SQL Joins & Aggregates",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #73: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q74",
    "subject": "dbms",
    "topic": "Functional Dependencies",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #74: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q75",
    "subject": "dbms",
    "topic": "Transactions & Recovery",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #75: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q76",
    "subject": "dbms",
    "topic": "B+ Tree Indexing",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #76: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q77",
    "subject": "dbms",
    "topic": "View Serializability",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #77: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q78",
    "subject": "dbms",
    "topic": "Relational Algebra",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #78: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q79",
    "subject": "dbms",
    "topic": "SQL Joins & Aggregates",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #79: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q80",
    "subject": "dbms",
    "topic": "Functional Dependencies",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #80: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q81",
    "subject": "dbms",
    "topic": "Transactions & Recovery",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #81: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q82",
    "subject": "dbms",
    "topic": "B+ Tree Indexing",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #82: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q83",
    "subject": "dbms",
    "topic": "View Serializability",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #83: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q84",
    "subject": "dbms",
    "topic": "Relational Algebra",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #84: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q85",
    "subject": "dbms",
    "topic": "SQL Joins & Aggregates",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #85: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q86",
    "subject": "dbms",
    "topic": "Functional Dependencies",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #86: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q87",
    "subject": "dbms",
    "topic": "Transactions & Recovery",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #87: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q88",
    "subject": "dbms",
    "topic": "B+ Tree Indexing",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #88: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q89",
    "subject": "dbms",
    "topic": "View Serializability",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #89: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q90",
    "subject": "dbms",
    "topic": "Relational Algebra",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #90: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q91",
    "subject": "dbms",
    "topic": "SQL Joins & Aggregates",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #91: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q92",
    "subject": "dbms",
    "topic": "Functional Dependencies",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #92: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q93",
    "subject": "dbms",
    "topic": "Transactions & Recovery",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #93: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q94",
    "subject": "dbms",
    "topic": "B+ Tree Indexing",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #94: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q95",
    "subject": "dbms",
    "topic": "View Serializability",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #95: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q96",
    "subject": "dbms",
    "topic": "Relational Algebra",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #96: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q97",
    "subject": "dbms",
    "topic": "SQL Joins & Aggregates",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #97: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q98",
    "subject": "dbms",
    "topic": "Functional Dependencies",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #98: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q99",
    "subject": "dbms",
    "topic": "Transactions & Recovery",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #99: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q100",
    "subject": "dbms",
    "topic": "B+ Tree Indexing",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #100: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q101",
    "subject": "dbms",
    "topic": "View Serializability",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #101: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q102",
    "subject": "dbms",
    "topic": "Relational Algebra",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #102: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q103",
    "subject": "dbms",
    "topic": "SQL Joins & Aggregates",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "DBMS Core Concept #103: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q104",
    "subject": "dbms",
    "topic": "Functional Dependencies",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "DBMS Core Concept #104: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  },
  {
    "id": "dbms-q105",
    "subject": "dbms",
    "topic": "Transactions & Recovery",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "DBMS Core Concept #105: Given relation R(A, B, C, D) with functional dependencies F = {A -> B, B -> C, C -> D, D -> A}. What are all the Candidate Keys of R?",
    "options": [
      "A, B, C, and D individually",
      "Only A",
      "Only AB",
      "Only ABCD"
    ],
    "correctAnswer": 0,
    "explanation": "Computing attribute closures: A+ = {A,B,C,D}, B+ = {B,C,D,A}, C+ = {C,D,A,B}, and D+ = {D,A,B,C}. Since each single attribute closure determines all columns, each of A, B, C, D is an individual Candidate Key.",
    "keyFormulaOrNote": "An attribute whose closure contains all relation attributes is a Super Key; if minimal, it is a Candidate Key."
  }
];
