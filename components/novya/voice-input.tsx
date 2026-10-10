"use client";
import { useEffect,useRef,useState,useSyncExternalStore } from "react";
import { Mic,MicOff } from "lucide-react";
type Recognition = { lang:string;interimResults:boolean;onresult:((event:{results:ArrayLike<ArrayLike<{transcript:string}>>})=>void)|null;onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void;abort:()=>void };
type SpeechWindow = Window & { SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition };
const subscribe=()=>()=>{};
const speechAvailable=()=>!!((window as SpeechWindow).SpeechRecognition??(window as SpeechWindow).webkitSpeechRecognition);
export function VoiceInput({onTranscript,compact=false}:{onTranscript:(text:string)=>void;compact?:boolean}){
 const supported=useSyncExternalStore(subscribe,speechAvailable,()=>false);const [listening,setListening]=useState(false),[error,setError]=useState("");const recognition=useRef<Recognition|null>(null);
 useEffect(()=>()=>recognition.current?.abort(),[]);
 function toggle(){if(listening){recognition.current?.stop();return;}const Constructor=(window as SpeechWindow).SpeechRecognition??(window as SpeechWindow).webkitSpeechRecognition;if(!Constructor)return;const r=new Constructor();r.lang=navigator.language||"en-US";r.interimResults=false;r.onresult=e=>{onTranscript(Array.from(e.results).map(result=>result[0].transcript).join(" "));};r.onend=()=>setListening(false);r.onerror=e=>{setError(e.error==="not-allowed"?"Microphone access was not granted.":"Voice input could not start. You can type your message.");setListening(false);};recognition.current=r;setError("");try{r.start();setListening(true);}catch{setError("Voice input could not start.");}}
 return <div className={`nv-voice-controls ${compact?"nv-voice-compact":""}`}><button type="button" aria-label={listening?"Stop listening":"Start voice input"} className={`nv-button ${listening?"nv-button-danger":""}`} disabled={!supported} onClick={toggle}>{listening?<MicOff size={16}/>:<Mic size={16}/>} <span className={compact?"sr-only":""}>{listening?"Stop listening":"Start voice input"}</span></button><p>{supported?"Speak, then review your message before sending.":"Voice input is unavailable in this browser. You can type below."}</p>{error&&<p className="nv-error-text">{error}</p>}</div>;
}
