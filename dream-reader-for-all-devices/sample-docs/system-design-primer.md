# System Design: Distributed Cache & Virtual Memory

Welcome to **ReadMaster**. This is a sample technical document designed to demonstrate offline reading, syntax highlighting, heading-based navigation, and font customization.

## Introduction to Virtual Memory

Virtual memory is a memory management technique that provides an "idealized abstraction of the storage resources that are actually available on a given machine". The primary benefits include:

1. **Isolation**: Each process has its own address space. A faulty process cannot corrupt the memory of another.
2. **Illusion of Abundant Memory**: Enables processes to address more memory than is physically available in RAM using paging and disk swap.
3. **Protection**: Memory segments have read, write, and execute permissions enforced at hardware level via the MMU (Memory Management Unit).

```c
// Sample C code for allocating virtual memory page
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
    
    printf("Allocated virtual memory at address: %p\n", addr);
    munmap(addr, length);
    return 0;
}
```

## Multi-Level Page Tables

In a 64-bit architecture, a single flat page table would require millions of gigabytes just to store page mappings. To solve this, operating systems use a **Multi-Level Page Table**:

- **PML4** (Page Map Level 4)
- **PDPT** (Page Directory Pointer Table)
- **PD** (Page Directory)
- **PT** (Page Table)

```rust
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
```

## Concurrency and Cache Invalidation

There are only two hard things in Computer Science: cache invalidation and naming things.

When multiple threads concurrently read and mutate a shared hash map or key-value store, synchronization primitives such as `RwLock` or lock-free concurrency (e.g. compare-and-swap) become essential.
