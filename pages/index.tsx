{ useRef, useState } from "react"; type Msg = { role: "user" | "assistant"; content: string };
export default function Home() { const [msgs, setMsgs] = useState<Msg[]>([ { role: "assistant", content: "Welcome to Althea Chat — a quiet place to reflect. What would help: reflection, focus, or a gentle check‑in?" } ]); const [input, setInput] = useState(""); const [sending, setSending] = useState(false); const outRef = useRef(null);

async function send() { const text = input.trim(); if (!text || sending) return; const history = [...msgs, { role: "user", content: text }]; setMsgs(history); setInput(""); setSending(true);



const res = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ messages: history })
});
const reader = res.body!.getReader();
const decoder = new TextDecoder();
let acc = "";
setMsgs(h => [...h, { role: "assistant", content: "" }]);
for (;;) {
  const { value, done } = await reader.read();
  if (done) break;
  acc += decoder.decode(value);
  setMsgs(h => {
    const copy = [...h];
    copy[copy.length - 1] = { role: "assistant", content: acc };
    return copy;
  });
  outRef.current?.scrollTo(0, outRef.current.scrollHeight);
}
setSending(false);
}

return ( <div style={{ background:"#000", color:"#ddd", minHeight:"100vh", display:"grid", gridTemplateRows:"1fr auto", fontFamily:"Inter, system-ui" }}> <div ref={outRef} style={{ padding:24, overflowY:"auto" }}> <h1 style={{ color:"#b18ae6", margin:0 }}>Althea Chat — Test {msgs.map((m,i)=>( <div key={i} style={{ margin:"12px 0", maxWidth:720 }}> <div style={{ fontSize:12, color:m.role==="assistant"?"#b18ae6":"#9aa0a6", marginBottom:6 }}>{m.role} <div style={{ whiteSpace:"pre-wrap", lineHeight:1.6 }}>{m.content} ))} <div style={{ display:"flex", gap:8, padding:16, borderTop:"1px solid #1b1b1b" }}> <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Type here…" style={{ flex:1, padding:12, borderRadius:10, background:"#0b0b0b", border:"1px solid #202020", color:"#eee" }} /> <button onClick={send} disabled={sending} style={{ background:"#b18ae6", color:"#000", fontWeight:700, padding:"12px 16px", border:"none", borderRadius:10 }}> {sending ? "…" : "Send"} ); }
