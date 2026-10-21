import { Question } from '../../types';

export const CN_QUESTIONS: Question[] = [
  {
    "id": "cn-q1",
    "subject": "cn",
    "topic": "OSI Reference Model",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which layer of the OSI model is responsible for end-to-end process-to-process communication and port addressing?",
    "options": [
      "Network Layer",
      "Transport Layer",
      "Data Link Layer",
      "Session Layer"
    ],
    "correctAnswer": 1,
    "explanation": "The Transport Layer provides process-to-process communication using port numbers (e.g., TCP, UDP).",
    "keyFormulaOrNote": "Core Networking Concept: OSI Reference Model"
  },
  {
    "id": "cn-q2",
    "subject": "cn",
    "topic": "OSI Reference Model",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "At which layer does a standard Layer 2 Switch operate?",
    "options": [
      "Physical Layer",
      "Data Link Layer",
      "Network Layer",
      "Transport Layer"
    ],
    "correctAnswer": 1,
    "explanation": "A Layer 2 switch inspects MAC addresses located in the Data Link frame header to make forwarding decisions.",
    "keyFormulaOrNote": "Core Networking Concept: OSI Reference Model"
  },
  {
    "id": "cn-q3",
    "subject": "cn",
    "topic": "OSI Reference Model",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which OSI layer handles data compression, encryption, and syntax translation?",
    "options": [
      "Application Layer",
      "Presentation Layer",
      "Session Layer",
      "Transport Layer"
    ],
    "correctAnswer": 1,
    "explanation": "The Presentation Layer (Layer 6) transforms data into compatible syntax, handling encryption/decryption (TLS/SSL) and compression.",
    "keyFormulaOrNote": "Core Networking Concept: OSI Reference Model"
  },
  {
    "id": "cn-q4",
    "subject": "cn",
    "topic": "Physical Layer",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "According to Nyquist Theorem, what is the maximum data rate for a noiseless channel with bandwidth B Hz and V signal levels?",
    "options": [
      "2 * B * log2(V) bps",
      "B * log2(1 + SNR)",
      "B * V bps",
      "2 * B / V bps"
    ],
    "correctAnswer": 0,
    "explanation": "Nyquist formula states Max Data Rate = 2 * B * log2(V) bits/sec for a noiseless channel.",
    "keyFormulaOrNote": "Core Networking Concept: Physical Layer"
  },
  {
    "id": "cn-q5",
    "subject": "cn",
    "topic": "Physical Layer",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Shannon Capacity formula for a noisy channel with bandwidth B and Signal-to-Noise Ratio (SNR) is:",
    "options": [
      "C = B * log2(1 + SNR)",
      "C = 2B log2(SNR)",
      "C = B * SNR",
      "C = SNR / B"
    ],
    "correctAnswer": 0,
    "explanation": "Shannon's theorem gives the theoretical upper bound on channel capacity: C = B * log2(1 + S/N).",
    "keyFormulaOrNote": "Core Networking Concept: Physical Layer"
  },
  {
    "id": "cn-q6",
    "subject": "cn",
    "topic": "Data Link Layer",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What is the purpose of Cyclic Redundancy Check (CRC) in data communications?",
    "options": [
      "Data Encryption",
      "Error Detection",
      "Flow Control",
      "Congestion Control"
    ],
    "correctAnswer": 1,
    "explanation": "CRC uses polynomial binary division to compute a checksum appended to frames for detecting bit transmission errors.",
    "keyFormulaOrNote": "Core Networking Concept: Data Link Layer"
  },
  {
    "id": "cn-q7",
    "subject": "cn",
    "topic": "Data Link Layer",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "In CSMA/CD, if bandwidth is 10 Mbps and propagation delay is 25.6 microseconds, what is the minimum frame size to detect collisions?",
    "options": [
      "512 bits (64 bytes)",
      "256 bits",
      "1024 bits",
      "128 bits"
    ],
    "correctAnswer": 0,
    "explanation": "Minimum frame transmission time T_fr >= 2 * T_prop = 2 * 25.6 us = 51.2 us. Frame size = Bandwidth * 2 * T_prop = 10^7 bps * 51.2 * 10^-6 s = 512 bits = 64 bytes.",
    "keyFormulaOrNote": "Core Networking Concept: Data Link Layer"
  },
  {
    "id": "cn-q8",
    "subject": "cn",
    "topic": "Data Link Layer",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "In Go-Back-N protocol with m-bit sequence numbers, what is the maximum sender window size?",
    "options": [
      "2^m",
      "2^m - 1",
      "2^(m-1)",
      "m"
    ],
    "correctAnswer": 1,
    "explanation": "To avoid ambiguity between duplicate frames and new frames on ACK loss, GBN window size is strictly bounded by 2^m - 1.",
    "keyFormulaOrNote": "Core Networking Concept: Data Link Layer"
  },
  {
    "id": "cn-q9",
    "subject": "cn",
    "topic": "Data Link Layer",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "In Selective Repeat ARQ with m-bit sequence numbers, what is the maximum sender and receiver window size?",
    "options": [
      "2^m",
      "2^(m-1)",
      "2^m - 1",
      "m^2"
    ],
    "correctAnswer": 1,
    "explanation": "In Selective Repeat, sender and receiver window sizes must satisfy W_s + W_r <= 2^m. If W_s = W_r, then W = 2^(m-1).",
    "keyFormulaOrNote": "Core Networking Concept: Data Link Layer"
  },
  {
    "id": "cn-q10",
    "subject": "cn",
    "topic": "Network Layer",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "What is the network address for the host IP 192.168.10.138 with subnet mask /26 (255.255.255.192)?",
    "options": [
      "192.168.10.0",
      "192.168.10.128",
      "192.168.10.64",
      "192.168.10.192"
    ],
    "correctAnswer": 1,
    "explanation": "/26 block size = 256 - 192 = 64. Subnet intervals: 0, 64, 128, 192. Host 138 falls between 128 and 191. Network ID is 192.168.10.128.",
    "keyFormulaOrNote": "Core Networking Concept: Network Layer"
  },
  {
    "id": "cn-q11",
    "subject": "cn",
    "topic": "Network Layer",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "How many usable host IP addresses are available in a /28 subnet?",
    "options": [
      "16",
      "14",
      "30",
      "12"
    ],
    "correctAnswer": 1,
    "explanation": "Host bits = 32 - 28 = 4. Total IPs = 2^4 = 16. Usable hosts = 16 - 2 (subtract Network ID and Broadcast ID) = 14.",
    "keyFormulaOrNote": "Core Networking Concept: Network Layer"
  },
  {
    "id": "cn-q12",
    "subject": "cn",
    "topic": "Network Layer",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "What is the directed broadcast address for the subnet 172.16.20.0/22?",
    "options": [
      "172.16.20.255",
      "172.16.23.255",
      "172.16.21.255",
      "172.16.255.255"
    ],
    "correctAnswer": 1,
    "explanation": "/22 leaves 10 host bits. 22 prefix covers 2 full octets + 6 bits in 3rd octet (step of 4). Subnet spans 172.16.20.0 to 172.16.23.255. Broadcast is 172.16.23.255.",
    "keyFormulaOrNote": "Core Networking Concept: Network Layer"
  },
  {
    "id": "cn-q13",
    "subject": "cn",
    "topic": "Network Layer",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which protocol is used to map an IP address to a physical MAC address on a local area network?",
    "options": [
      "DNS",
      "ARP (Address Resolution Protocol)",
      "DHCP",
      "RARP"
    ],
    "correctAnswer": 1,
    "explanation": "ARP broadcasts on the local link to query which host possesses a given IP address, receiving its 48-bit MAC address in reply.",
    "keyFormulaOrNote": "Core Networking Concept: Network Layer"
  },
  {
    "id": "cn-q14",
    "subject": "cn",
    "topic": "Network Layer",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "In IPv4 packet fragmentation, what unit is the \"Fragment Offset\" measured in?",
    "options": [
      "1 byte",
      "4 bytes",
      "8 bytes",
      "16 bytes"
    ],
    "correctAnswer": 2,
    "explanation": "The Fragment Offset field in the IPv4 header is 13 bits long. To cover the 65,535 byte maximum packet length, offset is measured in units of 8 bytes (64 bits).",
    "keyFormulaOrNote": "Core Networking Concept: Network Layer"
  },
  {
    "id": "cn-q15",
    "subject": "cn",
    "topic": "Transport Layer",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What is the minimum header size of a standard TCP segment (without options)?",
    "options": [
      "8 bytes",
      "20 bytes",
      "32 bytes",
      "40 bytes"
    ],
    "correctAnswer": 1,
    "explanation": "A standard TCP header has a minimum length of 20 bytes (when Data Offset = 5 words * 4 bytes = 20 bytes).",
    "keyFormulaOrNote": "Core Networking Concept: Transport Layer"
  },
  {
    "id": "cn-q16",
    "subject": "cn",
    "topic": "Transport Layer",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What is the header size of a UDP datagram?",
    "options": [
      "8 bytes",
      "20 bytes",
      "16 bytes",
      "4 bytes"
    ],
    "correctAnswer": 0,
    "explanation": "UDP header is extremely lightweight, containing only Source Port, Destination Port, Length, and Checksum (2 bytes each = 8 bytes total).",
    "keyFormulaOrNote": "Core Networking Concept: Transport Layer"
  },
  {
    "id": "cn-q17",
    "subject": "cn",
    "topic": "Transport Layer",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "In TCP 3-way handshake, what flag bits are set in the second packet sent from Server to Client?",
    "options": [
      "SYN only",
      "ACK only",
      "SYN and ACK",
      "FIN and ACK"
    ],
    "correctAnswer": 2,
    "explanation": "The server responds with SYN=1 (synchronizing its own initial sequence number) and ACK=1 (acknowledging client's ISN).",
    "keyFormulaOrNote": "Core Networking Concept: Transport Layer"
  },
  {
    "id": "cn-q18",
    "subject": "cn",
    "topic": "Transport Layer",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Why does TCP enter the TIME_WAIT state during connection teardown?",
    "options": [
      "To wait for new incoming connections",
      "To allow old duplicate segments to expire in the network and ensure final ACK reached other end",
      "To reset the window size",
      "To save memory"
    ],
    "correctAnswer": 1,
    "explanation": "TIME_WAIT lasts for 2*MSL (Maximum Segment Lifetime) to ensure that any delayed packets die out and the remote side received the final ACK.",
    "keyFormulaOrNote": "Core Networking Concept: Transport Layer"
  },
  {
    "id": "cn-q19",
    "subject": "cn",
    "topic": "Transport Layer",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "In TCP Tahoe, when a packet loss is detected via Retransmission Timeout (RTO), what happens to cwnd and ssthresh?",
    "options": [
      "ssthresh = cwnd / 2, cwnd = 1 MSS",
      "ssthresh = cwnd, cwnd = cwnd / 2",
      "cwnd = ssthresh, ssthresh unchanged",
      "cwnd remains same"
    ],
    "correctAnswer": 0,
    "explanation": "On timeout, TCP sets ssthresh = cwnd / 2 and resets cwnd to 1 MSS, restarting the Slow Start phase.",
    "keyFormulaOrNote": "Core Networking Concept: Transport Layer"
  },
  {
    "id": "cn-q20",
    "subject": "cn",
    "topic": "Routing Protocols",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Which algorithm is used by OSPF (Open Shortest Path First)?",
    "options": [
      "Bellman-Ford Distance Vector",
      "Dijkstra's Link State Algorithm",
      "Floyd-Warshall",
      "Path Vector BGP"
    ],
    "correctAnswer": 1,
    "explanation": "OSPF is an interior link-state routing protocol that floods link states and executes Dijkstra's shortest path algorithm on every router.",
    "keyFormulaOrNote": "Core Networking Concept: Routing Protocols"
  },
  {
    "id": "cn-q21",
    "subject": "cn",
    "topic": "Routing Protocols",
    "difficulty": "medium",
    "examTags": [
      "Campus Placement"
    ],
    "question": "What problem in Distance Vector routing causes routers to slowly increment routing metrics to infinity when a link breaks?",
    "options": [
      "Count-to-Infinity problem",
      "Split Horizon error",
      "BGP flapping",
      "Subnet starvation"
    ],
    "correctAnswer": 0,
    "explanation": "The Count-to-Infinity problem occurs due to routing loops in Distance Vector protocols, mitigated using Split Horizon and Poison Reverse.",
    "keyFormulaOrNote": "Core Networking Concept: Routing Protocols"
  },
  {
    "id": "cn-q22",
    "subject": "cn",
    "topic": "Application Layer",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "What port does HTTPS use by default?",
    "options": [
      "80",
      "443",
      "8080",
      "22"
    ],
    "correctAnswer": 1,
    "explanation": "HTTP uses port 80, while encrypted HTTPS over TLS/SSL uses port 443.",
    "keyFormulaOrNote": "Core Networking Concept: Application Layer"
  },
  {
    "id": "cn-q23",
    "subject": "cn",
    "topic": "Application Layer",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Which DNS record type maps a domain name to an IPv4 address?",
    "options": [
      "AAAA Record",
      "A Record",
      "CNAME Record",
      "MX Record"
    ],
    "correctAnswer": 1,
    "explanation": "An \"A\" record maps hostname to IPv4; \"AAAA\" maps to IPv6; \"CNAME\" maps alias to canonical name; \"MX\" maps mail servers.",
    "keyFormulaOrNote": "Core Networking Concept: Application Layer"
  },
  {
    "id": "cn-q24",
    "subject": "cn",
    "topic": "Application Layer",
    "difficulty": "easy",
    "examTags": [
      "TCS NQT"
    ],
    "question": "In DHCP, what is the correct sequence of messages exchanged between client and server?",
    "options": [
      "DORA: Discover, Offer, Request, Acknowledge",
      "RODA: Request, Offer, Discover, Ack",
      "ODRA: Offer, Discover, Request, Ack",
      "ADRO: Ack, Discover, Request, Offer"
    ],
    "correctAnswer": 0,
    "explanation": "DHCP follows the DORA sequence: DHCP Discover (broadcast), DHCP Offer (server), DHCP Request (client selection), DHCP Ack (server confirmation).",
    "keyFormulaOrNote": "Core Networking Concept: Application Layer"
  },
  {
    "id": "cn-q25",
    "subject": "cn",
    "topic": "Transport Layer & TCP",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #25: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q26",
    "subject": "cn",
    "topic": "Data Link Framing",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #26: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q27",
    "subject": "cn",
    "topic": "Network Routing",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #27: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q28",
    "subject": "cn",
    "topic": "DNS & HTTP",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #28: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q29",
    "subject": "cn",
    "topic": "Network Security",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #29: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q30",
    "subject": "cn",
    "topic": "IP Addressing & CIDR",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #30: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q31",
    "subject": "cn",
    "topic": "Transport Layer & TCP",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #31: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q32",
    "subject": "cn",
    "topic": "Data Link Framing",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #32: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q33",
    "subject": "cn",
    "topic": "Network Routing",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #33: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q34",
    "subject": "cn",
    "topic": "DNS & HTTP",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #34: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q35",
    "subject": "cn",
    "topic": "Network Security",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #35: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q36",
    "subject": "cn",
    "topic": "IP Addressing & CIDR",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #36: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q37",
    "subject": "cn",
    "topic": "Transport Layer & TCP",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #37: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q38",
    "subject": "cn",
    "topic": "Data Link Framing",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #38: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q39",
    "subject": "cn",
    "topic": "Network Routing",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #39: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q40",
    "subject": "cn",
    "topic": "DNS & HTTP",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #40: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q41",
    "subject": "cn",
    "topic": "Network Security",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #41: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q42",
    "subject": "cn",
    "topic": "IP Addressing & CIDR",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #42: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q43",
    "subject": "cn",
    "topic": "Transport Layer & TCP",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #43: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q44",
    "subject": "cn",
    "topic": "Data Link Framing",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #44: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q45",
    "subject": "cn",
    "topic": "Network Routing",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #45: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q46",
    "subject": "cn",
    "topic": "DNS & HTTP",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #46: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q47",
    "subject": "cn",
    "topic": "Network Security",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #47: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q48",
    "subject": "cn",
    "topic": "IP Addressing & CIDR",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #48: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q49",
    "subject": "cn",
    "topic": "Transport Layer & TCP",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #49: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q50",
    "subject": "cn",
    "topic": "Data Link Framing",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #50: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q51",
    "subject": "cn",
    "topic": "Network Routing",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #51: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q52",
    "subject": "cn",
    "topic": "DNS & HTTP",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #52: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q53",
    "subject": "cn",
    "topic": "Network Security",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #53: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q54",
    "subject": "cn",
    "topic": "IP Addressing & CIDR",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #54: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q55",
    "subject": "cn",
    "topic": "Transport Layer & TCP",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #55: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q56",
    "subject": "cn",
    "topic": "Data Link Framing",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #56: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q57",
    "subject": "cn",
    "topic": "Network Routing",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #57: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q58",
    "subject": "cn",
    "topic": "DNS & HTTP",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #58: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q59",
    "subject": "cn",
    "topic": "Network Security",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #59: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q60",
    "subject": "cn",
    "topic": "IP Addressing & CIDR",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #60: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q61",
    "subject": "cn",
    "topic": "Transport Layer & TCP",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #61: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q62",
    "subject": "cn",
    "topic": "Data Link Framing",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #62: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q63",
    "subject": "cn",
    "topic": "Network Routing",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #63: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q64",
    "subject": "cn",
    "topic": "DNS & HTTP",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #64: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q65",
    "subject": "cn",
    "topic": "Network Security",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #65: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q66",
    "subject": "cn",
    "topic": "IP Addressing & CIDR",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #66: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q67",
    "subject": "cn",
    "topic": "Transport Layer & TCP",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #67: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q68",
    "subject": "cn",
    "topic": "Data Link Framing",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #68: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q69",
    "subject": "cn",
    "topic": "Network Routing",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #69: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q70",
    "subject": "cn",
    "topic": "DNS & HTTP",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #70: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q71",
    "subject": "cn",
    "topic": "Network Security",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #71: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q72",
    "subject": "cn",
    "topic": "IP Addressing & CIDR",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #72: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q73",
    "subject": "cn",
    "topic": "Transport Layer & TCP",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #73: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q74",
    "subject": "cn",
    "topic": "Data Link Framing",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #74: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q75",
    "subject": "cn",
    "topic": "Network Routing",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #75: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q76",
    "subject": "cn",
    "topic": "DNS & HTTP",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #76: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q77",
    "subject": "cn",
    "topic": "Network Security",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #77: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q78",
    "subject": "cn",
    "topic": "IP Addressing & CIDR",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #78: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q79",
    "subject": "cn",
    "topic": "Transport Layer & TCP",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #79: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q80",
    "subject": "cn",
    "topic": "Data Link Framing",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #80: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q81",
    "subject": "cn",
    "topic": "Network Routing",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #81: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q82",
    "subject": "cn",
    "topic": "DNS & HTTP",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #82: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q83",
    "subject": "cn",
    "topic": "Network Security",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #83: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q84",
    "subject": "cn",
    "topic": "IP Addressing & CIDR",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #84: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q85",
    "subject": "cn",
    "topic": "Transport Layer & TCP",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #85: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q86",
    "subject": "cn",
    "topic": "Data Link Framing",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #86: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q87",
    "subject": "cn",
    "topic": "Network Routing",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #87: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q88",
    "subject": "cn",
    "topic": "DNS & HTTP",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #88: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q89",
    "subject": "cn",
    "topic": "Network Security",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #89: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q90",
    "subject": "cn",
    "topic": "IP Addressing & CIDR",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #90: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q91",
    "subject": "cn",
    "topic": "Transport Layer & TCP",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #91: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q92",
    "subject": "cn",
    "topic": "Data Link Framing",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #92: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q93",
    "subject": "cn",
    "topic": "Network Routing",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #93: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q94",
    "subject": "cn",
    "topic": "DNS & HTTP",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #94: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q95",
    "subject": "cn",
    "topic": "Network Security",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #95: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q96",
    "subject": "cn",
    "topic": "IP Addressing & CIDR",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #96: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q97",
    "subject": "cn",
    "topic": "Transport Layer & TCP",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #97: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q98",
    "subject": "cn",
    "topic": "Data Link Framing",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #98: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q99",
    "subject": "cn",
    "topic": "Network Routing",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #99: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q100",
    "subject": "cn",
    "topic": "DNS & HTTP",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #100: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q101",
    "subject": "cn",
    "topic": "Network Security",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #101: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q102",
    "subject": "cn",
    "topic": "IP Addressing & CIDR",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #102: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q103",
    "subject": "cn",
    "topic": "Transport Layer & TCP",
    "difficulty": "easy",
    "examTags": [
      "Campus Placement"
    ],
    "question": "Networking Deep Concept #103: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q104",
    "subject": "cn",
    "topic": "Data Link Framing",
    "difficulty": "medium",
    "examTags": [
      "TCS NQT"
    ],
    "question": "Networking Deep Concept #104: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  },
  {
    "id": "cn-q105",
    "subject": "cn",
    "topic": "Network Routing",
    "difficulty": "hard",
    "examTags": [
      "GATE CS"
    ],
    "question": "Networking Deep Concept #105: What is the maximum throughput achievable in Stop-and-Wait protocol if frame size is L, round-trip time is RTT, and transmission delay is T_t?",
    "options": [
      "L / (T_t + 2 * T_prop)",
      "L / RTT",
      "Bandwidth * RTT",
      "2 * L / T_t"
    ],
    "correctAnswer": 0,
    "explanation": "In Stop-and-Wait, efficiency eta = T_t / (T_t + 2 * T_prop). Maximum throughput = eta * Bandwidth = (L / T_t) * (T_t / (T_t + 2 * T_prop)) = L / (T_t + 2 * T_prop).",
    "keyFormulaOrNote": "Stop-and-wait efficiency eta = 1 / (1 + 2a) where a = T_prop / T_t."
  }
];
