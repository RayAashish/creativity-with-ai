import { LearningTopic } from '../../types';

export const OOPS_LEARNING_TOPICS: LearningTopic[] = [
  {
    id: 'oops-4-pillars',
    subject: 'oops',
    title: 'The 4 Pillars of OOP & Polymorphism Internals',
    category: 'Core Concepts',
    readTimeMinutes: 9,
    summary: 'Encapsulation, Data Hiding, Abstraction, Inheritance, Compile-time vs Run-time Polymorphism, and VTABLE/VPTR mechanics.',
    content: {
      coreConcept: `Object-Oriented Programming models software around real-world data and behavior:
1. **Encapsulation**: Bundling data attributes and methods that operate on them into a single unit (Class), restricting direct access via access modifiers (\`private\`, \`protected\`, \`public\`).
2. **Abstraction**: Hiding internal implementation complexity and exposing only essential interfaces (Abstract Classes, Interfaces).
3. **Inheritance**: Deriving new classes from existing classes to achieve code reuse and hierarchical relationships (\`is-a\` relationship).
4. **Polymorphism**: The ability of a message or function to be processed in more than one form:
   - **Compile-Time (Static)**: Function Overloading, Operator Overloading. Resolved via name mangling at compile time.
   - **Run-Time (Dynamic)**: Method Overriding using \`virtual\` functions in C++ or overridden methods in Java. Resolved dynamically via **VPTR** and **VTABLE**.

### How VTABLE Works:
When a class declares a virtual function, the compiler inserts a hidden pointer (\`vptr\`) into every object instance pointing to the class's **Virtual Table (VTABLE)** — an array of function pointers. Calling \`ptr->virtualMethod()\` does an indirect lookup: \`*(ptr->vptr[index])()\`.`,
      keyPoints: [
        'VPTR increases object size by 8 bytes (on 64-bit systems).',
        'Constructors CANNOT be virtual (object is not constructed yet, VPTR not initialized).',
        'Destructors in base classes SHOULD be virtual if deleting derived objects via base pointer to prevent memory leaks!'
      ],
      codeExample: {
        language: 'cpp',
        code: `class Base {
public:
    virtual void show() { cout << "Base show" << endl; }
    virtual ~Base() { cout << "Base destructor" << endl; }
};

class Derived : public Base {
public:
    void show() override { cout << "Derived show" << endl; }
    ~Derived() { cout << "Derived destructor" << endl; }
};

Base* b = new Derived();
b->show(); // Output: "Derived show" (Dynamic dispatch via VTABLE)
delete b;  // Calls Derived destructor THEN Base destructor because ~Base() is virtual!`,
        explanation: 'Dynamic dispatch uses VPTR to invoke the most derived implementation at runtime.'
      },
      interviewPitfalls: [
        'Non-virtual destructor in base class: Deleting a Derived object through a Base pointer causes Undefined Behavior and memory leaks (Derived destructor never runs).',
        'Confusing Method Overloading (same name, different arguments in same class scope) with Method Overriding (same name and signature in derived class).'
      ],
      gateOrPlacementTip: 'Common placement question: "What is object slicing in C++?" It occurs when a Derived class object is assigned by value to a Base class instance, lopping off the derived members and resetting vptr to Base.'
    },
    quickQuiz: [
      {
        question: 'What happens if a base class destructor is NOT declared virtual and we execute: Base* b = new Derived(); delete b;',
        options: [
          'Compile-time error',
          'Only Base class destructor is called; Derived destructor is skipped leading to memory leak',
          'Only Derived class destructor is called',
          'Both destructors are called normally'
        ],
        correctAnswer: 1,
        explanation: 'Without virtual destructor in Base, the compiler performs static binding based on the pointer type (Base*), invoking only the Base destructor and causing a resource leak for Derived members.'
      }
    ]
  },
  {
    id: 'oops-solid-patterns',
    subject: 'oops',
    title: 'SOLID Principles & Essential Design Patterns',
    category: 'Design & Architecture',
    readTimeMinutes: 11,
    summary: 'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion, plus Singleton, Factory, and Observer patterns.',
    content: {
      coreConcept: `SOLID represents 5 core design guidelines for building robust, maintainable, and extensible software:
- **S - Single Responsibility Principle (SRP)**: A class should have only one reason to change.
- **O - Open/Closed Principle (OCP)**: Software entities should be open for extension, but closed for modification.
- **L - Liskov Substitution Principle (LSP)**: Derived classes must be substitutable for their base classes without altering program correctness (e.g., Square inheriting from Rectangle breaks LSP if height and width can be modified independently).
- **I - Interface Segregation Principle (ISP)**: Clients should not be forced to depend on interfaces they do not use (lean, focused interfaces).
- **D - Dependency Inversion Principle (DIP)**: High-level modules should not depend on low-level modules; both should depend on abstractions.

### Top Gang of Four (GoF) Design Patterns:
1. **Singleton (Creational)**: Ensures only one instance exists with global access point (watch out for thread-safe double-checked locking).
2. **Factory Method (Creational)**: Defines an interface for creating objects, delegating instantiation to subclasses.
3. **Observer (Behavioral)**: One-to-many dependency; when subject state changes, all registered observers are notified automatically (Publish-Subscribe basis).
4. **Strategy (Behavioral)**: Enables selecting an algorithm's behavior at runtime by encapsulating interchangeable strategies behind a common interface.`,
      keyPoints: [
        'Favor Composition over Inheritance to avoid rigid hierarchies and fragile base class problem.',
        'Singleton pattern must make constructor private, delete copy constructor & assignment operator.',
        'Dependency Injection is the primary technique to implement the Dependency Inversion Principle.'
      ],
      formulasAndRules: [
        { title: 'LSP Violation Sign', detail: 'If a derived class throws UnsupportedOperationException or has empty override methods, LSP is violated.' },
        { title: 'Thread-Safe Singleton (Java)', detail: 'Use volatile instance variable + synchronized(Singleton.class) block with double-checked null validation.' }
      ],
      interviewPitfalls: [
        'Making classes God objects that violate SRP (handling business logic, logging, and database operations in one class).',
        'Over-engineering with design patterns when simple procedural code suffices.'
      ],
      gateOrPlacementTip: 'In TCS, Infosys, and Amazon interviews: "Explain why Square inheriting from Rectangle violates Liskov Substitution Principle." (Answer: A rectangle allows width and height to vary independently; a square enforces equality, altering invariant expectations).'
    },
    quickQuiz: [
      {
        question: 'Which SOLID principle is directly violated when a subclass throws "NotImplementedException" for a method inherited from an interface or base class?',
        options: ['Liskov Substitution Principle (LSP)', 'Open/Closed Principle (OCP)', 'Single Responsibility Principle (SRP)', 'Dependency Inversion Principle (DIP)'],
        correctAnswer: 0,
        explanation: 'LSP requires that subtypes must be completely substitutable for their base types. If calling a base-typed method on a derived instance results in a runtime error or refusal to execute, LSP is broken.'
      }
    ]
  }
];
