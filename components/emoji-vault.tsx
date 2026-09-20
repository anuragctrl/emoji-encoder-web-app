'use client'

import { useMemo, useState } from 'react'
import { ArrowLeftRight, Check, Clipboard, Copy, LockKeyhole, RotateCcw, ShieldCheck, Sparkles, WandSparkles } from 'lucide-react'

const EMOJIS = ['😀','😂','🥰','😎','🤔','👍','👏','😅','🤝','🎉','🔥','💯','🚀','👀','🥹','❤️','⭐','✨','🎯','🧠','🔐','🦄','🐱','🐶','🍀','🌸','⚡','🎵','☕']
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const VS = 0xfe00
const VSS = 0xe0100

type Mode = 'encode' | 'decode'

function toVariation(byte: number) { return String.fromCodePoint(byte < 16 ? VS + byte : VSS + byte - 16) }
function fromVariation(codePoint: number) {
  if (codePoint >= VS && codePoint <= VS + 15) return codePoint - VS
  if (codePoint >= VSS && codePoint <= VSS + 239) return codePoint - VSS + 16
  return null
}
function encode(text: string, carrier: string) { return carrier + Array.from(new TextEncoder().encode(text), toVariation).join('') }
function decode(text: string) {
  const bytes: number[] = []
  for (const character of Array.from(text)) {
    const byte = fromVariation(character.codePointAt(0) ?? 0)
    if (byte === null && bytes.length) break
    if (byte !== null) bytes.push(byte)
  }
  return new TextDecoder().decode(new Uint8Array(bytes))
}

export function EmojiVault() {
  const [mode, setMode] = useState<Mode>('encode')
  const [carrier, setCarrier] = useState('😀')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const inputLabel = mode === 'encode' ? 'Your message' : 'Encoded emoji'
  const outputLabel = mode === 'encode' ? 'Hidden output' : 'Decoded message'
  const resultHint = useMemo(() => mode === 'encode' ? 'Your encoded emoji will appear here...' : 'Decoded text will appear here...', [mode])

  function changeMode(nextMode: Mode) { setMode(nextMode); setInput(''); setOutput(''); setError(''); setCopied(false) }
  function convert() {
    setError(''); setCopied(false)
    if (!input.trim()) { setError(mode === 'encode' ? 'Enter a message first.' : 'Paste an encoded emoji first.'); return }
    try {
      const result = mode === 'encode' ? encode(input, carrier) : decode(input)
      if (mode === 'decode' && !result) { setError('No hidden message was detected.'); return }
      setOutput(result)
    } catch { setError('Unable to process this message.') }
  }
  async function copyOutput() {
    if (!output) return
    try { await navigator.clipboard.writeText(output); setCopied(true); window.setTimeout(() => setCopied(false), 1400) }
    catch { setError('Copy failed. Select and copy the output manually.') }
  }

  return (
    <main className="vault-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <div className="vault-container">
        <header className="hero">
          <div>
            <div className="eyebrow"><span className="status-dot" /> Browser-only utility</div>
            <h1>Emoji<span>Vault</span></h1>
            <p>Hide a message inside an everyday emoji using invisible Unicode variation selectors. Private, playful, and entirely local to your browser.</p>
          </div>
          <div className="security-note"><LockKeyhole size={16} /><div><strong>Unicode payload</strong><span>Obfuscation, not encryption.</span></div></div>
        </header>

        <section className="workspace" aria-label="Emoji encoder">
          <div className="mode-tabs" role="tablist">
            <button className={mode === 'encode' ? 'active' : ''} onClick={() => changeMode('encode')} role="tab" aria-selected={mode === 'encode'}><WandSparkles size={16} /> Encode message</button>
            <button className={mode === 'decode' ? 'active' : ''} onClick={() => changeMode('decode')} role="tab" aria-selected={mode === 'decode'}><RotateCcw size={16} /> Decode message</button>
          </div>
          <div className="editor-grid">
            <section className="editor-panel">
              <div className="field-heading"><label htmlFor="message">{inputLabel}</label><span>{input.length.toLocaleString()} chars</span></div>
              <textarea id="message" value={input} onChange={(event) => setInput(event.target.value)} placeholder={mode === 'encode' ? 'Type a secret message...' : 'Paste the encoded emoji...'} />
              {mode === 'encode' && <div className="picker"><div className="picker-title"><Sparkles size={15} /> Choose a carrier</div><div className="emoji-grid">{EMOJIS.map((emoji) => <button key={emoji} className={carrier === emoji ? 'selected' : ''} onClick={() => setCarrier(emoji)} aria-label={`Use ${emoji}`}>{emoji}</button>)}</div><div className="alphabet">{LETTERS.map((letter) => <button key={letter} className={carrier === letter ? 'selected' : ''} onClick={() => setCarrier(letter)}>{letter}</button>)}</div><div className="selected-carrier">Selected carrier <strong>{carrier}</strong></div></div>}
            </section>
            <div className="swap-column"><button className="round-button" onClick={() => { const next = mode === 'encode' ? 'decode' : 'encode'; setMode(next); setInput(output); setOutput(''); setError('') }} aria-label="Move output to input"><ArrowLeftRight size={18} /></button></div>
            <section className="editor-panel output-panel">
              <div className="field-heading"><label htmlFor="result">{outputLabel}</label><button className="copy-button" onClick={copyOutput} disabled={!output}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}</button></div>
              <textarea id="result" value={output} readOnly placeholder={resultHint} />
              <div className="action-row"><button className="primary-button" onClick={convert}>{mode === 'encode' ? 'Encode message' : 'Decode message'} <ArrowLeftRight size={16} /></button><button className="clear-button" onClick={() => { setInput(''); setOutput(''); setError('') }} aria-label="Clear all"><RotateCcw size={17} /></button></div>
              {error && <p className="error-message" role="alert">{error}</p>}
            </section>
          </div>
        </section>

        <div className="feature-grid"><article><span className="feature-icon cyan"><Sparkles size={17} /></span><div><strong>Invisible payload</strong><p>UTF-8 bytes hide after the visible carrier emoji.</p></div></article><article><span className="feature-icon violet"><Clipboard size={17} /></span><div><strong>Copy-safe</strong><p>Looks like an ordinary emoji in a message.</p></div></article><article><span className="feature-icon green"><ShieldCheck size={17} /></span><div><strong>No storage</strong><p>Everything runs locally in your browser.</p></div></article></div>
        <footer>EmojiVault <span>•</span> A tiny privacy-first text utility</footer>
      </div>
    </main>
  )
}

export default EmojiVault
