import fs from 'fs';
import path from 'path';

// Generate a valid minimal 3-page PDF with text and outline
function generateSamplePdf() {
  const content = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R /Outlines 6 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R 4 0 R 5 0 R] /Count 3 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 7 0 R /Resources << /Font << /F1 10 0 R >> >> >>
endobj

4 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 8 0 R /Resources << /Font << /F1 10 0 R >> >> >>
endobj

5 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 9 0 R /Resources << /Font << /F1 10 0 R >> >> >>
endobj

6 0 obj
<< /Type /Outlines /First 11 0 R /Last 12 0 R /Count 2 >>
endobj

11 0 obj
<< /Title (Chapter 1: Operating Systems Overview) /Parent 6 0 R /Next 12 0 R /Dest [3 0 R /Fit] >>
endobj

12 0 obj
<< /Title (Chapter 2: Virtual Memory and Paging) /Parent 6 0 R /Prev 11 0 R /Dest [4 0 R /Fit] >>
endobj

7 0 obj
<< /Length 200 >>
stream
BT
/F1 22 Tf
50 720 Td
(Chapter 1: Introduction to Computer Systems) Tj
/F1 13 Tf
0 -40 Td
(Welcome to ReadMaster. This is a technical PDF document sample.) Tj
0 -25 Td
(Operating systems manage hardware resources and provide abstractions for software.) Tj
0 -25 Td
(Key concepts include virtualization, concurrency, and persistence.) Tj
ET
endstream
endobj

8 0 obj
<< /Length 210 >>
stream
BT
/F1 22 Tf
50 720 Td
(Chapter 2: Virtual Memory and Paging) Tj
/F1 13 Tf
0 -40 Td
(Virtual memory creates the illusion of a large, contiguous address space.) Tj
0 -25 Td
(The CPU Memory Management Unit translates virtual addresses to physical frames.) Tj
0 -25 Td
(Multi-level page tables save memory by allocating tables on demand.) Tj
ET
endstream
endobj

9 0 obj
<< /Length 200 >>
stream
BT
/F1 22 Tf
50 720 Td
(Chapter 3: Concurrency and Multi-threading) Tj
/F1 13 Tf
0 -40 Td
(A thread is a lightweight execution context within a process.) Tj
0 -25 Td
(Mutual exclusion locks prevent race conditions on shared data.) Tj
0 -25 Td
(Deadlocks occur when threads hold resources while waiting for others.) Tj
ET
endstream
endobj

10 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

xref
0 13
0000000000 65535 f 
0000000009 00000 n 
0000000082 00000 n 
0000000160 00000 n 
0000000282 00000 n 
0000000404 00000 n 
0000000526 00000 n 
0000000608 00000 n 
0000000918 00000 n 
0000001238 00000 n 
0000001548 00000 n 
0000001625 00000 n 
0000001732 00000 n 
trailer
<< /Size 13 /Root 1 0 R >>
startxref
1840
%%EOF
`;

  fs.mkdirSync('sample-docs', { recursive: true });
  fs.writeFileSync(path.join('sample-docs', 'sample-paper.pdf'), content.trim());
  console.log('Sample PDF created at sample-docs/sample-paper.pdf');
}

generateSamplePdf();
