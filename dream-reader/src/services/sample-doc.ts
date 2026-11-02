export const SAMPLE_SYSTEM_DESIGN_MD = `# System Design: Distributed Cache & Virtual Memory

Welcome to **ReadMaster**. This is a sample technical document designed to demonstrate offline reading, syntax highlighting, heading-based navigation, and font customization.

## 1. Introduction to Virtual Memory

Virtual memory is a foundational memory management technique providing an idealized abstraction of storage resources. The key goals are:

1. **Isolation**: Each process executes within its own private virtual address space.
2. **Illusion of Abundant Memory**: Enables processes to address more memory than is physically available in RAM using paging and swap space.
3. **Hardware-Enforced Protection**: Memory segments have read, write, and execute permissions enforced at the hardware level via the **MMU (Memory Management Unit)**.

\`\`\`c
// Allocating a 4KB virtual memory page using mmap
#include <sys/mman.h>
#include <stdio.h>

int main() {
    size_t length = 4096; // One 4KB page
    void* addr = mmap(NULL, length, PROT_READ | PROT_WRITE, 
                      MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    
    if (addr == MAP_FAILED) {
        perror("mmap failed");
        return 1;
    }
    
    printf("Allocated virtual memory at address: %p\\n", addr);
    munmap(addr, length);
    return 0;
}
\`\`\`

## 2. Multi-Level Page Tables

In a 64-bit architecture (x86-64), a single flat page table would consume millions of gigabytes just to store page mappings. Operating systems resolve this using **Multi-Level Page Tables**:

- **PML4** (Page Map Level 4)
- **PDPT** (Page Directory Pointer Table)
- **PD** (Page Directory)
- **PT** (Page Table)

Pages are allocated on-demand, saving tremendous physical RAM until memory is actually referenced.

\`\`\`rust
// Rust implementation of a basic Cache Entry
pub struct CacheEntry<V> {
    pub key: String,
    pub value: V,
    pub frequency: usize,
}

impl<V: Clone> CacheEntry<V> {
    pub fn new(key: &str, value: V) -> Self {
        Self {
            key: key.to_string(),
            value,
            frequency: 1,
        }
    }
}
\`\`\`

## 3. Concurrency and Synchronization

When multiple threads concurrently read and mutate a shared key-value store, synchronization primitives such as reader-writer locks (\`RwLock\`) or lock-free compare-and-swap algorithms are indispensable.

## 4. Summary & Best Practices

Understanding memory layout, cache hierarchy (L1/L2/L3), and concurrency semantics enables engineers to write high-throughput, low-latency distributed systems.
`;
