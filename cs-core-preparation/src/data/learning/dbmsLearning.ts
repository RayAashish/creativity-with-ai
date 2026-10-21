import { LearningTopic } from '../../types';

export const DBMS_LEARNING_TOPICS: LearningTopic[] = [
  {
    id: 'dbms-normalization',
    subject: 'dbms',
    title: 'Functional Dependencies & Normalization (1NF to BCNF)',
    category: 'Database Design',
    readTimeMinutes: 12,
    summary: 'Candidate key identification, attribute closures, 1NF, 2NF, 3NF, BCNF definitions, Lossless Join and Dependency Preservation.',
    content: {
      coreConcept: `Normalization organizes database attributes to minimize redundancy and prevent Insertion, Deletion, and Updation anomalies.

### Normal Forms Hierarchy:
$$1NF \\subset 2NF \\subset 3NF \\subset BCNF$$

1. **1NF (First Normal Form)**: All attribute values must be **atomic** (no multi-valued or composite attributes).
2. **2NF (Second Normal Form)**: Must be in 1NF and have **no partial dependencies** (no non-prime attribute should depend on a proper subset of any candidate key).
3. **3NF (Third Normal Form)**: Must be in 2NF and have **no transitive dependencies** (for every non-trivial $X \\to Y$, either $X$ is a Super Key or $Y$ is a Prime Attribute).
4. **BCNF (Boyce-Codd Normal Form)**: Stricter than 3NF. For EVERY non-trivial FD $X \\to Y$, $X$ **MUST be a Super Key**.

### Property Guarantees:
- **Lossless Join Decomposition**: Always achievable for both 3NF and BCNF.
  - Test for $R(A, B, C)$ decomposed into $R_1(A, B)$ and $R_2(B, C)$: $(R_1 \\cap R_2) \\to R_1$ OR $(R_1 \\cap R_2) \\to R_2$ must hold in $F^+$.
- **Dependency Preservation**: Always achievable in 3NF, but **NOT guaranteed** in BCNF!`,
      keyPoints: [
        'Prime Attribute: An attribute that is part of ANY candidate key.',
        'Non-Prime Attribute: An attribute not part of ANY candidate key.',
        'A relation with only 2 attributes is ALWAYS in BCNF.',
        'A relation where every candidate key consists of a single attribute and is in 1NF is automatically in 2NF.'
      ],
      formulasAndRules: [
        { title: 'Attribute Closure X+', detail: 'Compute all attributes functionally determined by X under FD set F. If X+ = All attributes, X is a Super Key.' },
        { title: '3NF vs BCNF Rule', detail: 'In X -> Y: If X is not super key, 3NF allows it IF Y is prime. BCNF strictly rejects it!' }
      ],
      interviewPitfalls: [
        'Finding only one candidate key when multiple candidate keys exist. Prime attributes include attributes from ALL candidate keys combined!',
        'Assuming BCNF is always preferred over 3NF: Enforcing BCNF can sacrifice functional dependency preservation, requiring expensive cross-table joins during updates.'
      ],
      gateOrPlacementTip: 'GATE classical problem: Given R(A, B, C, D) with F = {A -> B, B -> C, C -> D, D -> A}. Here keys are A, B, C, D. All attributes are prime! Hence R is guaranteed to be in 3NF automatically.'
    },
    quickQuiz: [
      {
        question: 'Given relation R(A, B, C, D) with candidate key AB and FD: C -> D. What is the highest normal form of R?',
        options: ['1NF', '2NF', '3NF', 'BCNF'],
        correctAnswer: 1,
        explanation: 'Candidate key is AB. Prime attributes: {A, B}. Non-prime attributes: {C, D}. In C -> D, C is not a proper subset of key AB (so no partial dependency, satisfying 2NF). But in C -> D, C is NOT a super key and D is NOT prime, violating 3NF. Thus highest normal form is 2NF.'
      }
    ]
  },
  {
    id: 'dbms-transactions-acid',
    subject: 'dbms',
    title: 'Transactions, ACID & Concurrency Control (2PL)',
    category: 'Transaction Management',
    readTimeMinutes: 11,
    summary: 'ACID properties, Conflict Serializability, Precedence Graphs, Recoverable vs Cascadeless schedules, and Two-Phase Locking (2PL).',
    content: {
      coreConcept: `A transaction is a logical unit of database processing that must satisfy **ACID**:
- **Atomicity**: All or nothing (handled by Transaction Log / Recovery Manager via UNDO/REDO).
- **Consistency**: Preserves database integrity constraints.
- **Isolation**: Concurrent executions do not interfere (handled by Concurrency Control / Locks).
- **Durability**: Committed changes persist across system crashes.

### Conflict Serializability:
Two operations in a schedule conflict if:
1. They belong to different transactions.
2. They access the same data item $Q$.
3. At least one of them is a \`write(Q)\`.

A schedule is **Conflict Serializable** if and only if its **Precedence Graph (Serialization Graph)** has **NO CYCLES**.

### Two-Phase Locking (2PL):
- **Growing Phase**: Transaction may acquire locks, but release none.
- **Shrinking Phase**: Transaction may release locks, but acquire none.
- **Guarantees**: Standard 2PL guarantees Conflict Serializability, but can suffer from **Cascading Aborts** and **Deadlocks**.
- **Strict 2PL**: Holds all exclusive (write) locks until COMMIT/ABORT => Guarantees Strict Recoverability (Cascadeless).
- **Rigorous 2PL**: Holds ALL locks (shared and exclusive) until COMMIT/ABORT.`,
      keyPoints: [
        'Recoverable Schedule: If Tj reads data written by Ti, then Ti must commit BEFORE Tj commits.',
        'Cascadeless Schedule: Tj reads data written by Ti ONLY AFTER Ti has committed.',
        'Strict Schedule: Data written by Ti cannot be read OR written by Tj until Ti commits.',
        'Strict $\\subset$ Cascadeless $\\subset$ Recoverable.'
      ],
      interviewPitfalls: [
        'Believing 2PL prevents deadlocks. Standard 2PL guarantees serializability, NOT freedom from deadlocks! (Deadlocks can and do occur in 2PL).',
        'Confusing View Serializability with Conflict Serializability: Every conflict serializable schedule is view serializable, but not vice-versa. Testing View Serializability is NP-Complete.'
      ],
      gateOrPlacementTip: 'To check Conflict Serializability in GATE: Draw directed edge Ti -> Tj if Ti executes conflicting operation before Tj on same item. If graph has a topological sort, schedule is serializable with that exact serial order.'
    },
    quickQuiz: [
      {
        question: 'Which of the following guarantees both Conflict Serializability and freedom from cascading aborts?',
        options: ['Basic 2PL', 'Strict 2PL', 'Conservative 2PL', 'Time-stamp Ordering with no buffering'],
        correctAnswer: 1,
        explanation: 'Strict 2PL holds all Exclusive locks until the transaction commits or aborts. This prevents other transactions from reading uncommitted modifications, completely eliminating cascading rollbacks while ensuring serializability.'
      }
    ]
  }
];
