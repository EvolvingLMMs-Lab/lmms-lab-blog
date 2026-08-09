export interface HackingLine {
  text: string
  color?: 'green' | 'red' | 'yellow' | 'cyan' | 'white'
  /** Extra ms to linger after this line appears (0 = normal flow) */
  pause?: number
}

const sshLines: HackingLine[] = [
  { text: '$ ssh -p 2222 root@10.0.13.37' },
  { text: 'Connecting to 10.0.13.37:2222...', pause: 400 },
  { text: 'Authenticating with public key "id_rsa"...', pause: 300 },
  { text: 'Last login: Thu Jan 01 00:00:00 1970 from 127.0.0.1' },
  { text: 'Welcome to Neural Core v4.2.0 (GNU/Linux 6.6.6-amd64)', color: 'green', pause: 200 },
]

const hexDumpLines: HackingLine[] = [
  { text: '0x00000000  4d 5a 90 00 03 00 00 00  04 00 00 00 ff ff 00 00', color: 'cyan' },
  { text: '0x00000010  b8 00 00 00 00 00 00 00  40 00 00 00 00 00 00 00', color: 'cyan' },
  { text: '0x00000020  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00', color: 'cyan' },
  { text: '0x00000030  00 00 00 00 00 00 00 00  00 00 00 00 e8 00 00 00', color: 'cyan' },
  { text: '[*] Analyzing binary structure...', pause: 500 },
]

const errorLines: HackingLine[] = [
  { text: 'ERROR: Segmentation fault (core dumped)', color: 'red', pause: 600 },
  { text: 'WARN: Buffer overflow detected at 0xDEADBEEF', color: 'yellow', pause: 350 },
  { text: 'FATAL: Kernel panic - not syncing: corrupted stack', color: 'red', pause: 700 },
  { text: 'ERROR: Permission denied (publickey,gssapi-keyex)', color: 'red', pause: 400 },
]

const successLines: HackingLine[] = [
  { text: '[OK] Firewall rules updated', color: 'green' },
  { text: '[OK] Encryption layer established (AES-256-GCM)', color: 'green', pause: 250 },
  { text: '[OK] Tunnel established -> 10.0.13.37:443', color: 'green' },
  { text: '[OK] Payload delivered successfully', color: 'green', pause: 400 },
]

const portScanLines: HackingLine[] = [
  { text: '$ nmap -sV -O 10.0.13.37' },
  { text: 'Starting Nmap 7.94 ( https://nmap.org )', pause: 300 },
  { text: 'PORT     STATE SERVICE    VERSION' },
  { text: '22/tcp   open  ssh        OpenSSH 9.6', color: 'green' },
  { text: '80/tcp   open  http       nginx 1.25.4', color: 'green' },
  { text: '443/tcp  open  ssl/http   nginx 1.25.4', color: 'green' },
  { text: '3306/tcp closed mysql', color: 'red', pause: 500 },
  { text: '8080/tcp filtered http-proxy', color: 'yellow' },
]

const miscLines: HackingLine[] = [
  { text: '$ cat /etc/shadow | head -3' },
  { text: 'root:$6$rAnD0m$hAsH:19847:0:99999:7:::' },
  { text: '$ python3 exploit.py --target 10.0.13.37', pause: 250 },
  { text: '[*] Initializing exploit framework...', pause: 450 },
  { text: '[*] Sending shellcode (487 bytes)...', pause: 600 },
  { text: '[+] Shell spawned! (uid=0)', color: 'green', pause: 350 },
  { text: '$ whoami && id' },
  { text: 'root', color: 'green', pause: 300 },
  { text: 'uid=0(root) gid=0(root) groups=0(root)' },
  { text: '$ uname -a' },
  { text: 'Linux neuralcore 6.6.6-amd64 #1 SMP x86_64 GNU/Linux' },
]

const GARBLE_CHARS = '░▒▓█▄▀▐▌╔╗╚╝║═╬┼┤├┴┬─│¤§¶†‡∞≈≠±×÷«»¿¡'

function garbledLine(): HackingLine {
  const len = 30 + Math.floor(Math.random() * 40)
  let text = ''
  for (let i = 0; i < len; i++) {
    text += GARBLE_CHARS[Math.floor(Math.random() * GARBLE_CHARS.length)]
  }
  const colors: HackingLine['color'][] = ['green', 'cyan', 'red', 'yellow']
  return { text, color: colors[Math.floor(Math.random() * colors.length)] }
}

const allPools = [sshLines, hexDumpLines, errorLines, successLines, portScanLines, miscLines]

export function getRandomHackingSequence(count: number): HackingLine[] {
  // Pick 2-3 random pools and concatenate
  const shuffled = [...allPools].sort(() => Math.random() - 0.5)
  const picked = shuffled.slice(0, 2 + Math.floor(Math.random() * 2))
  const pool = picked.flat()

  const result: HackingLine[] = []
  for (let i = 0; i < count; i++) {
    result.push(pool[i % pool.length])
  }

  // Inject garbled lines (~30% of lines get corrupted/replaced)
  for (let i = 0; i < result.length; i++) {
    if (Math.random() < 0.3) {
      result.splice(i, 0, garbledLine())
    }
  }

  return result.slice(0, count)
}
