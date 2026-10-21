import { Question } from '../../types';

export const OOPS_QUESTIONS: Question[] = [
  {
    "id": "oops-q1",
    "subject": "oops",
    "topic": "Core Pillars",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which OOP concept refers to wrapping data and the methods that operate on that data into a single unit and restricting direct outside access?",
    "options": [
      "Encapsulation",
      "Polymorphism",
      "Inheritance",
      "Abstraction"
    ],
    "correctAnswer": 0,
    "explanation": "Encapsulation combines data attributes and behaviors within a class, controlling visibility using access specifiers.",
    "keyFormulaOrNote": "Core OOP Concept: Core Pillars"
  },
  {
    "id": "oops-q2",
    "subject": "oops",
    "topic": "Core Pillars",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What is the main difference between Abstraction and Encapsulation?",
    "options": [
      "Abstraction is hiding complexity and showing essential features; Encapsulation is binding data and protecting it",
      "Encapsulation is for functions only; Abstraction is for variables",
      "They are identical concepts",
      "Abstraction creates multiple instances"
    ],
    "correctAnswer": 0,
    "explanation": "Abstraction focuses on \"what\" an object does (interface), while Encapsulation focuses on \"how\" to protect internal state (implementation hiding).",
    "keyFormulaOrNote": "Core OOP Concept: Core Pillars"
  },
  {
    "id": "oops-q3",
    "subject": "oops",
    "topic": "Polymorphism",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which of the following is an example of COMPILE-TIME (static) polymorphism?",
    "options": [
      "Function Overloading",
      "Virtual Function Overriding",
      "Dynamic Dispatch",
      "Interface implementation at runtime"
    ],
    "correctAnswer": 0,
    "explanation": "Function overloading and operator overloading are resolved by the compiler at compile time using function signatures.",
    "keyFormulaOrNote": "Core OOP Concept: Polymorphism"
  },
  {
    "id": "oops-q4",
    "subject": "oops",
    "topic": "Polymorphism",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "How is runtime polymorphism achieved in C++?",
    "options": [
      "Using virtual functions and base class pointers/references",
      "Using macro definitions",
      "Using static member functions",
      "Using templates"
    ],
    "correctAnswer": 0,
    "explanation": "In C++, declaring member functions virtual enables dynamic dispatch via the VTABLE and VPTR when invoked through base pointers.",
    "keyFormulaOrNote": "Core OOP Concept: Polymorphism"
  },
  {
    "id": "oops-q5",
    "subject": "oops",
    "topic": "VTABLE Internals",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "What is a VTABLE in C++?",
    "options": [
      "A table of function pointers created per class that has virtual functions",
      "A table of all local variables",
      "A memory block storing heap pointers",
      "A hash map for class names"
    ],
    "correctAnswer": 0,
    "explanation": "A VTABLE (Virtual Method Table) is a compiler-generated static lookup array of function pointers used to resolve virtual function calls dynamically.",
    "keyFormulaOrNote": "Core OOP Concept: VTABLE Internals"
  },
  {
    "id": "oops-q6",
    "subject": "oops",
    "topic": "VTABLE Internals",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Why can CONSTRUCTORS not be virtual in C++?",
    "options": [
      "Because an object's VPTR is initialized during constructor execution, so VTABLE lookup is impossible before the object exists",
      "Because constructors return void",
      "Because constructors have no parameters",
      "Because constructors are private"
    ],
    "correctAnswer": 0,
    "explanation": "Virtual dispatch requires a valid VPTR pointing to a VTABLE. Until the constructor executes, the object layout and VPTR do not yet exist.",
    "keyFormulaOrNote": "Core OOP Concept: VTABLE Internals"
  },
  {
    "id": "oops-q7",
    "subject": "oops",
    "topic": "Constructors & Destructors",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Why should a base class destructor almost always be declared VIRTUAL when polymorphism is used?",
    "options": [
      "To ensure derived class destructors are called when an object is deleted through a base class pointer",
      "To prevent memory allocation",
      "To speed up compilation",
      "It is a mandatory language syntax"
    ],
    "correctAnswer": 0,
    "explanation": "Deleting a derived instance through a Base* without a virtual destructor causes static binding, invoking only Base::~Base() and leaking derived resources.",
    "keyFormulaOrNote": "Core OOP Concept: Constructors & Destructors"
  },
  {
    "id": "oops-q8",
    "subject": "oops",
    "topic": "Constructors & Destructors",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "In C++, what is the order of constructor calls in single inheritance when a Derived object is instantiated?",
    "options": [
      "Base constructor first, then Derived constructor",
      "Derived constructor first, then Base constructor",
      "Both constructors run in parallel",
      "Only Derived constructor runs"
    ],
    "correctAnswer": 0,
    "explanation": "Base class sub-objects must be initialized before derived class members can depend on them. Destructors execute in reverse order (Derived then Base).",
    "keyFormulaOrNote": "Core OOP Concept: Constructors & Destructors"
  },
  {
    "id": "oops-q9",
    "subject": "oops",
    "topic": "Inheritance Traps",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "What is the \"Diamond Problem\" in multiple inheritance?",
    "options": [
      "When a class inherits from two classes that both inherit from the same common base class, causing duplicate base subobjects and ambiguity",
      "When four classes form a cycle of pointers",
      "When memory is leaked across 4 heap blocks",
      "When recursion exceeds stack depth"
    ],
    "correctAnswer": 0,
    "explanation": "In the diamond hierarchy (D inherits from B and C, which both inherit from A), D receives two separate copies of A. Solved using virtual base classes.",
    "keyFormulaOrNote": "Core OOP Concept: Inheritance Traps"
  },
  {
    "id": "oops-q10",
    "subject": "oops",
    "topic": "Inheritance Traps",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "How does C++ resolve the Diamond Problem in multiple inheritance?",
    "options": [
      "Virtual Base Classes (e.g., class B : virtual public A)",
      "Private inheritance",
      "Multiple constructors",
      "Static casting"
    ],
    "correctAnswer": 0,
    "explanation": "Declaring A as a virtual base class guarantees that only one shared instance of A is included in the most derived object D.",
    "keyFormulaOrNote": "Core OOP Concept: Inheritance Traps"
  },
  {
    "id": "oops-q11",
    "subject": "oops",
    "topic": "SOLID Principles",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Which SOLID principle states that \"High-level modules should not depend on low-level modules; both should depend on abstractions\"?",
    "options": [
      "Single Responsibility Principle",
      "Open-Closed Principle",
      "Liskov Substitution Principle",
      "Dependency Inversion Principle"
    ],
    "correctAnswer": 3,
    "explanation": "Dependency Inversion Principle (DIP) decouples high-level policy from low-level details by introducing interfaces/abstractions between them.",
    "keyFormulaOrNote": "Core OOP Concept: SOLID Principles"
  },
  {
    "id": "oops-q12",
    "subject": "oops",
    "topic": "SOLID Principles",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "A Square class inheriting from Rectangle where setWidth() also modifies height violates which principle?",
    "options": [
      "Liskov Substitution Principle (LSP)",
      "Single Responsibility Principle",
      "Interface Segregation Principle",
      "Dependency Inversion"
    ],
    "correctAnswer": 0,
    "explanation": "LSP requires subclasses to satisfy base class behavioral contracts. Rectangles allow independent width/height changes; forcing Square violates expectations.",
    "keyFormulaOrNote": "Core OOP Concept: SOLID Principles"
  },
  {
    "id": "oops-q13",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which design pattern ensures a class has only one instance and provides a global point of access to it?",
    "options": [
      "Factory Pattern",
      "Singleton Pattern",
      "Observer Pattern",
      "Adapter Pattern"
    ],
    "correctAnswer": 1,
    "explanation": "The Singleton Pattern restricts class instantiation to a single object with private constructors and static access instance methods.",
    "keyFormulaOrNote": "Core OOP Concept: Design Patterns"
  },
  {
    "id": "oops-q14",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which design pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically?",
    "options": [
      "Observer Pattern",
      "Singleton Pattern",
      "Strategy Pattern",
      "Decorator Pattern"
    ],
    "correctAnswer": 0,
    "explanation": "The Observer Pattern (Publisher-Subscriber) decouples the subject from observing objects, notifying them on state transitions.",
    "keyFormulaOrNote": "Core OOP Concept: Design Patterns"
  },
  {
    "id": "oops-q15",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Which design pattern dynamically attaches additional responsibilities to an object as an alternative to subclassing?",
    "options": [
      "Decorator Pattern",
      "Factory Pattern",
      "Façade Pattern",
      "Proxy Pattern"
    ],
    "correctAnswer": 0,
    "explanation": "Decorator pattern wraps the original object within decorator objects to add behavior dynamically without class explosion.",
    "keyFormulaOrNote": "Core OOP Concept: Design Patterns"
  },
  {
    "id": "oops-q16",
    "subject": "oops",
    "topic": "Abstract Classes & Interfaces",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "In C++, what makes a class an ABSTRACT class?",
    "options": [
      "Declaring at least one Pure Virtual Function (= 0)",
      "Using the abstract keyword",
      "Having private constructors only",
      "Having no member variables"
    ],
    "correctAnswer": 0,
    "explanation": "A pure virtual function (virtual void func() = 0;) cannot be instantiated directly and makes the enclosing class an abstract base class.",
    "keyFormulaOrNote": "Core OOP Concept: Abstract Classes & Interfaces"
  },
  {
    "id": "oops-q17",
    "subject": "oops",
    "topic": "Copy Mechanics",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "What is the danger of a Shallow Copy when an object contains pointers to dynamically allocated heap memory?",
    "options": [
      "Both objects point to the same memory, causing double deletion crash on destruction",
      "Memory is duplicated unnecessarily",
      "Compilation error",
      "Pointers become NULL automatically"
    ],
    "correctAnswer": 0,
    "explanation": "Shallow copy copies raw pointer addresses. When destructors run for both objects, delete is called twice on the same memory (Double Free vulnerability).",
    "keyFormulaOrNote": "Core OOP Concept: Copy Mechanics"
  },
  {
    "id": "oops-q18",
    "subject": "oops",
    "topic": "Copy Mechanics",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What function is invoked in C++ when an object is passed by VALUE to a function?",
    "options": [
      "Default Constructor",
      "Copy Constructor",
      "Assignment Operator",
      "Type Conversion Operator"
    ],
    "correctAnswer": 1,
    "explanation": "Passing an object by value creates a copy of the argument on the stack using the Copy Constructor: ClassName(const ClassName& other).",
    "keyFormulaOrNote": "Core OOP Concept: Copy Mechanics"
  },
  {
    "id": "oops-q19",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #19: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q20",
    "subject": "oops",
    "topic": "Virtual Tables",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #20: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q21",
    "subject": "oops",
    "topic": "C++ vs Java OOP",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #21: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q22",
    "subject": "oops",
    "topic": "Memory Management",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #22: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q23",
    "subject": "oops",
    "topic": "Inheritance & Composition",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #23: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q24",
    "subject": "oops",
    "topic": "SOLID Principles",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #24: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q25",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #25: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q26",
    "subject": "oops",
    "topic": "Virtual Tables",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #26: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q27",
    "subject": "oops",
    "topic": "C++ vs Java OOP",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #27: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q28",
    "subject": "oops",
    "topic": "Memory Management",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #28: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q29",
    "subject": "oops",
    "topic": "Inheritance & Composition",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #29: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q30",
    "subject": "oops",
    "topic": "SOLID Principles",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #30: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q31",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #31: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q32",
    "subject": "oops",
    "topic": "Virtual Tables",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #32: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q33",
    "subject": "oops",
    "topic": "C++ vs Java OOP",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #33: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q34",
    "subject": "oops",
    "topic": "Memory Management",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #34: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q35",
    "subject": "oops",
    "topic": "Inheritance & Composition",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #35: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q36",
    "subject": "oops",
    "topic": "SOLID Principles",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #36: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q37",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #37: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q38",
    "subject": "oops",
    "topic": "Virtual Tables",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #38: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q39",
    "subject": "oops",
    "topic": "C++ vs Java OOP",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #39: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q40",
    "subject": "oops",
    "topic": "Memory Management",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #40: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q41",
    "subject": "oops",
    "topic": "Inheritance & Composition",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #41: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q42",
    "subject": "oops",
    "topic": "SOLID Principles",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #42: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q43",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #43: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q44",
    "subject": "oops",
    "topic": "Virtual Tables",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #44: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q45",
    "subject": "oops",
    "topic": "C++ vs Java OOP",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #45: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q46",
    "subject": "oops",
    "topic": "Memory Management",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #46: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q47",
    "subject": "oops",
    "topic": "Inheritance & Composition",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #47: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q48",
    "subject": "oops",
    "topic": "SOLID Principles",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #48: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q49",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #49: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q50",
    "subject": "oops",
    "topic": "Virtual Tables",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #50: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q51",
    "subject": "oops",
    "topic": "C++ vs Java OOP",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #51: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q52",
    "subject": "oops",
    "topic": "Memory Management",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #52: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q53",
    "subject": "oops",
    "topic": "Inheritance & Composition",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #53: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q54",
    "subject": "oops",
    "topic": "SOLID Principles",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #54: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q55",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #55: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q56",
    "subject": "oops",
    "topic": "Virtual Tables",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #56: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q57",
    "subject": "oops",
    "topic": "C++ vs Java OOP",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #57: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q58",
    "subject": "oops",
    "topic": "Memory Management",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #58: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q59",
    "subject": "oops",
    "topic": "Inheritance & Composition",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #59: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q60",
    "subject": "oops",
    "topic": "SOLID Principles",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #60: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q61",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #61: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q62",
    "subject": "oops",
    "topic": "Virtual Tables",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #62: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q63",
    "subject": "oops",
    "topic": "C++ vs Java OOP",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #63: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q64",
    "subject": "oops",
    "topic": "Memory Management",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #64: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q65",
    "subject": "oops",
    "topic": "Inheritance & Composition",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #65: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q66",
    "subject": "oops",
    "topic": "SOLID Principles",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #66: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q67",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #67: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q68",
    "subject": "oops",
    "topic": "Virtual Tables",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #68: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q69",
    "subject": "oops",
    "topic": "C++ vs Java OOP",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #69: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q70",
    "subject": "oops",
    "topic": "Memory Management",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #70: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q71",
    "subject": "oops",
    "topic": "Inheritance & Composition",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #71: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q72",
    "subject": "oops",
    "topic": "SOLID Principles",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #72: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q73",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #73: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q74",
    "subject": "oops",
    "topic": "Virtual Tables",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #74: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q75",
    "subject": "oops",
    "topic": "C++ vs Java OOP",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #75: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q76",
    "subject": "oops",
    "topic": "Memory Management",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #76: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q77",
    "subject": "oops",
    "topic": "Inheritance & Composition",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #77: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q78",
    "subject": "oops",
    "topic": "SOLID Principles",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #78: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q79",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #79: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q80",
    "subject": "oops",
    "topic": "Virtual Tables",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #80: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q81",
    "subject": "oops",
    "topic": "C++ vs Java OOP",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #81: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q82",
    "subject": "oops",
    "topic": "Memory Management",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #82: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q83",
    "subject": "oops",
    "topic": "Inheritance & Composition",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #83: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q84",
    "subject": "oops",
    "topic": "SOLID Principles",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #84: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q85",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #85: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q86",
    "subject": "oops",
    "topic": "Virtual Tables",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #86: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q87",
    "subject": "oops",
    "topic": "C++ vs Java OOP",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #87: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q88",
    "subject": "oops",
    "topic": "Memory Management",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #88: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q89",
    "subject": "oops",
    "topic": "Inheritance & Composition",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #89: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q90",
    "subject": "oops",
    "topic": "SOLID Principles",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #90: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q91",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #91: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q92",
    "subject": "oops",
    "topic": "Virtual Tables",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #92: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q93",
    "subject": "oops",
    "topic": "C++ vs Java OOP",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #93: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q94",
    "subject": "oops",
    "topic": "Memory Management",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #94: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q95",
    "subject": "oops",
    "topic": "Inheritance & Composition",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #95: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q96",
    "subject": "oops",
    "topic": "SOLID Principles",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #96: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q97",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #97: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q98",
    "subject": "oops",
    "topic": "Virtual Tables",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #98: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q99",
    "subject": "oops",
    "topic": "C++ vs Java OOP",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #99: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q100",
    "subject": "oops",
    "topic": "Memory Management",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #100: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q101",
    "subject": "oops",
    "topic": "Inheritance & Composition",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #101: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q102",
    "subject": "oops",
    "topic": "SOLID Principles",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #102: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q103",
    "subject": "oops",
    "topic": "Design Patterns",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "OOPs Advanced Concept #103: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q104",
    "subject": "oops",
    "topic": "Virtual Tables",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "OOPs Advanced Concept #104: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  },
  {
    "id": "oops-q105",
    "subject": "oops",
    "topic": "C++ vs Java OOP",
    "difficulty": "hard",
    "examTags": [
      "Product / MAANG"
    ],
    "question": "OOPs Advanced Concept #105: Why is Object Composition often preferred over Class Inheritance (\"Composition over Inheritance\")?",
    "options": [
      "Composition allows dynamic runtime swapping of behaviors and avoids fragile base class issues",
      "Inheritance is not supported in modern languages",
      "Composition uses less RAM than inheritance",
      "Composition eliminates all constructors"
    ],
    "correctAnswer": 0,
    "explanation": "Composition (\"has-a\") offers looser coupling and allows behaviors to change dynamically at runtime, avoiding deep, rigid inheritance hierarchies (\"is-a\").",
    "keyFormulaOrNote": "Favor composition over inheritance for flexible, testable architectures."
  }
];
