"use client";
import { useEffect,useState } from "react";
import { RecordData } from "@/lib/novya";
export function useGrantValidity(access:RecordData|undefined){
  const [now,setNow]=useState(()=>Date.now());
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(timer);},[]);
  return !!access?.allowed&&new Date(String(access.expiresAt)).getTime()>now;
}
