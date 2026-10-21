import { LearningTopic } from '../../types';

export const CN_LEARNING_TOPICS: LearningTopic[] = [
  {
    id: 'cn-osi-tcpip',
    subject: 'cn',
    title: 'OSI 7-Layer vs TCP/IP Protocol Suite',
    category: 'Network Architectures',
    readTimeMinutes: 8,
    summary: 'Deep dive into each OSI layer, PDU encapsulation (Data, Segment, Packet, Frame, Bit), and port mappings.',
    content: {
      coreConcept: `The OSI model is a 7-layer theoretical conceptual model, while the TCP/IP stack is a 4 or 5-layer practical implementation used on the Internet.

### Layer Comparison & PDUs:
1. **Application (Layer 7)**: PDU = Data/Message. Protocols: HTTP (80), HTTPS (443), DNS (53), SMTP (25), DHCP (67/68), FTP (20/21), SSH (22).
2. **Presentation (Layer 6)**: Encryption/Decryption, Compression, Translation (ASCII, EBCDIC). SSL/TLS operates here/between transport.
3. **Session (Layer 5)**: Dialog control, Token management, Synchronization checkpoints (RPC, NetBIOS).
4. **Transport (Layer 4)**: PDU = Segment. End-to-end reliability, Port addressing, Multiplexing, Flow control (TCP, UDP).
5. **Network (Layer 3)**: PDU = Packet. Host-to-host logical addressing (IPv4, IPv6), Routing (OSPF, BGP), ICMP, ARP (Layer 2.5).
6. **Data Link (Layer 2)**: PDU = Frame. Hop-to-hop framing, Physical MAC addressing (48-bit), Error detection (CRC), CSMA/CD, Switches.
7. **Physical (Layer 1)**: PDU = Bit. Electrical signals, Cables (Fiber, Coax, Twisted Pair), Hubs, Repeaters.`,
      keyPoints: [
        'Hub is Layer 1 device (single collision domain, single broadcast domain).',
        'Switch/Bridge is Layer 2 device (separate collision domains per port, single broadcast domain).',
        'Router is Layer 3 device (breaks both collision and broadcast domains).'
      ],
      diagramOrAscii: `
      Encapsulation Flow:
      [Application Data]
      [TCP Header | Application Data]                  (Segment)
      [IP Header | TCP Header | Application Data]      (Packet)
      [Frame Hdr | IP Header | TCP Header | Data | CRC] (Frame)
      0110100100101100101001010101010110...           (Bits)
      `,
      interviewPitfalls: [
        'Confusing Hubs and Switches: Hub broadcasts incoming bits to all ports without looking at MAC addresses. Switch inspects MAC header to forward to specific port.',
        'Believing ARP belongs strictly to Layer 3: ARP takes an IP address and resolves the corresponding 48-bit MAC address; operates at Layer 2/3 boundary.'
      ],
      gateOrPlacementTip: 'GATE frequently asks PDU unit names: Application=Data, Transport=Segment, Network=Datagram/Packet, Data Link=Frame, Physical=Bits.'
    },
    quickQuiz: [
      {
        question: 'Which of the following devices separates both collision domains AND broadcast domains?',
        options: ['Layer 2 Switch', 'Repeater', 'Router', 'Hub'],
        correctAnswer: 2,
        explanation: 'A Router functions at Layer 3 and does not forward broadcasts by default, thereby creating separate collision domains as well as separate broadcast domains.'
      }
    ]
  },
  {
    id: 'cn-ip-subnetting',
    subject: 'cn',
    title: 'IPv4 Addressing, Subnetting & CIDR',
    category: 'Network Layer',
    readTimeMinutes: 11,
    summary: 'Classful addressing ranges, CIDR slash notation, Subnet mask calculation, Subnet address vs Broadcast address, and Host capacity.',
    content: {
      coreConcept: `IPv4 uses 32-bit addresses (4 octets, e.g., 192.168.1.1).

### Classful Addressing:
- **Class A**: \`0.0.0.0\` to \`127.255.255.255\` (Leading bits: \`0\`, Default mask: \`/8\`)
- **Class B**: \`128.0.0.0\` to \`191.255.255.255\` (Leading bits: \`10\`, Default mask: \`/16\`)
- **Class C**: \`192.0.0.0\` to \`223.255.255.255\` (Leading bits: \`110\`, Default mask: \`/24\`)
- **Class D**: \`224.0.0.0\` to \`239.255.255.255\` (Multicast, \`1110\`)
- **Class E**: \`240.0.0.0\` to \`255.255.255.255\` (Experimental, \`1111\`)

### CIDR & Subnetting Formulas:
In a \`/n\` subnet:
- Network bits = $n$, Host bits = $h = 32 - n$.
- Total IP addresses in subnet = $2^h$.
- Usable host addresses = $2^h - 2$ (Subtract Network ID and Directed Broadcast ID).
- Subnet ID is obtained by bitwise AND of IP with Subnet Mask.
- Directed Broadcast ID has all host bits set to 1.`,
      keyPoints: [
        'Private IP Ranges: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16.',
        'Loopback IP range: 127.0.0.0/8 (usually 127.0.0.1).',
        'APIPA (Automatic Private IP Addressing): 169.254.0.0/16 when DHCP fails.'
      ],
      formulasAndRules: [
        { title: 'Subnet Size Formula', detail: 'Total IPs = 2^(32 - prefix_length). Usable hosts = 2^(32 - prefix_length) - 2.' },
        { title: 'Subnet Mask Calculation', detail: '/26 has 26 ones => 11111111.11111111.11111111.11000000 = 255.255.255.192' }
      ],
      interviewPitfalls: [
        'Forgetting to subtract 2 for usable hosts: If /29 is allocated, total IPs = 2^(32-29) = 8, but usable hosts is 8 - 2 = 6.',
        'Assuming all subnets must have the same size. Modern networks use VLSM (Variable Length Subnet Masking).'
      ],
      gateOrPlacementTip: 'GATE question pattern: "Find the directed broadcast address for 192.168.10.150/27". With /27 (step=32), block is 128 to 159. Network ID is 192.168.10.128, Directed Broadcast is 192.168.10.159.'
    },
    quickQuiz: [
      {
        question: 'An organization is granted the block 130.56.0.0/16. The admin needs 1000 subnets. What should the new subnet mask prefix be?',
        options: ['/24', '/26', '/27', '/28'],
        correctAnswer: 1,
        explanation: 'To create at least 1000 subnets, we need 2^k >= 1000 => k = 10 bits. Adding 10 bits to prefix /16 gives 16 + 10 = /26. (2^10 = 1024 >= 1000).'
      }
    ]
  },
  {
    id: 'cn-tcp-udp-flow',
    subject: 'cn',
    title: 'TCP vs UDP, 3-Way Handshake & Congestion Control',
    category: 'Transport Layer',
    readTimeMinutes: 10,
    summary: 'TCP flag bits, 3-way handshake, 4-way FIN teardown, Sliding Window flow control, and TCP Congestion Control (Tahoe vs Reno).',
    content: {
      coreConcept: `Transport layer provides process-to-process communication using 16-bit Port Numbers (0 to 65535).
- **TCP**: Connection-oriented, reliable, in-order, byte-stream, flow & congestion control, header size 20-60 bytes.
- **UDP**: Connectionless, unreliable, best-effort, message-stream, minimal overhead, header size 8 bytes.

### TCP 3-Way Handshake:
1. **SYN**: Client sends \`Seq = x\`, SYN bit = 1.
2. **SYN + ACK**: Server replies \`Seq = y\`, \`Ack = x + 1\`, SYN=1, ACK=1.
3. **ACK**: Client sends \`Seq = x + 1\`, \`Ack = y + 1\`, ACK=1. Connection ESTABLISHED!

### TCP Congestion Control States:
1. **Slow Start**: Congestion Window ($cwnd$) starts at 1 MSS, doubles every RTT (exponential growth: $1, 2, 4, 8...$) until Slow Start Threshold ($ssthresh$).
2. **Congestion Avoidance**: When $cwnd \\ge ssthresh$, $cwnd$ increases linearly by 1 MSS per RTT (Additive Increase).
3. **Loss Event Handling**:
   - **Timeout (Severe)**: $ssthresh = cwnd / 2$, $cwnd = 1$ MSS. Slow Start restarts!
   - **3 Duplicate ACKs (Mild)**: In **TCP Reno**, Fast Recovery sets $ssthresh = cwnd / 2$ and $cwnd = ssthresh$ (skips Slow Start, jumps to Congestion Avoidance - Multiplicative Decrease).`,
      keyPoints: [
        'TCP Header minimum size is 20 bytes (when Options field is empty; HLEN = 5 => 5 * 4 = 20 bytes).',
        'TIME_WAIT state in TCP teardown lasts for 2 * MSL (Maximum Segment Lifetime) to ensure final ACK was received.',
        'Flow Control uses Receiver Advertised Window (rwnd) to prevent overflowing receiver buffer.'
      ],
      interviewPitfalls: [
        'Confusing Flow Control with Congestion Control: Flow control prevents sender from overwhelming the receiver; Congestion control prevents senders from overwhelming the network switches/links.',
        'Thinking TCP guarantees real-time delivery: TCP guarantees reliability, not timeliness (UDP is preferred for VoIP and gaming).'
      ],
      gateOrPlacementTip: 'GATE calculation: Maximum effective throughput = min(Congestion Window, Receiver Window) / Round Trip Time (RTT).'
    },
    quickQuiz: [
      {
        question: 'In TCP Congestion Control (Reno), if cwnd is 32 MSS and 3 duplicate ACKs are received, what are the new ssthresh and cwnd?',
        options: ['ssthresh = 16, cwnd = 1', 'ssthresh = 16, cwnd = 16', 'ssthresh = 8, cwnd = 8', 'ssthresh = 32, cwnd = 1'],
        correctAnswer: 1,
        explanation: 'On 3 duplicate ACKs (Fast Retransmit/Fast Recovery in Reno), ssthresh becomes cwnd/2 = 16 MSS, and cwnd is set to ssthresh = 16 MSS (avoiding slow start reset to 1).'
      }
    ]
  }
];
