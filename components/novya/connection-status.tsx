"use client";
import { useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { WifiOff, RefreshCw } from "lucide-react";
const subscribeOnline=(callback:()=>void)=>{window.addEventListener("online",callback);window.addEventListener("offline",callback);return()=>{window.removeEventListener("online",callback);window.removeEventListener("offline",callback);};};
export function ConnectionStatus(){
  const cache=useQueryClient();
  const online=useSyncExternalStore(subscribeOnline,()=>navigator.onLine,()=>true);
  const failedRefresh=useSyncExternalStore(callback=>cache.getQueryCache().subscribe(callback),()=>cache.getQueryCache().getAll().filter(q=>q.getObserversCount()>0&&q.state.data!==undefined&&q.state.status==="error").length,()=>0);
  if(online&&!failedRefresh)return null;
  return <div className="nv-connection-notice" role="status"><WifiOff size={16}/><div><strong>{online?"Showing previously loaded data":"You are offline"}</strong><p>{online?"The latest refresh failed. Values may have changed since they were loaded.":"Cached values may be out of date. Changes need an internet connection."}</p></div>{online&&<button className="nv-button" onClick={()=>cache.refetchQueries({type:"active"})}><RefreshCw size={13}/>Refresh data</button>}</div>;
}
