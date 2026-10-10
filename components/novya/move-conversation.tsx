"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Folder, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { novya, RecordData, display, errorMessage } from "@/lib/novya";
import { SearchField } from "./primitives";
import { KoraFolderDialog } from "./kora-folder-dialog";
export function MoveConversation({ id, folders, current }: { id: string; folders: RecordData[]; current?: string }) {
  const [open, setOpen] = useState(false), [search, setSearch] = useState(""), [create, setCreate] = useState(false);
  const cache = useQueryClient();
  const move = useMutation({ mutationFn: (folderId: string | null) => novya.patch(`/kora/conversations/${id}`, { folder_id: folderId }), onSuccess: () => { cache.invalidateQueries({ queryKey: ["novya", "kora"] }); setOpen(false); } });
  return <><button className="nv-button" onClick={() => { move.reset(); setSearch(""); setOpen(true); }}><Folder size={14}/>Move to folder</button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="nv-dialog kr-dialog kr-folder-dialog"><DialogTitle>Move to folder</DialogTitle><DialogDescription>Choose where this conversation should appear.</DialogDescription><SearchField value={search} onChange={setSearch} placeholder="Search folders…"/><div className="nv-stack mt-4">{folders.filter(folder => String(folder.name).toLowerCase().includes(search.toLowerCase())).map(folder => <button className="nv-list-item w-full text-left" key={String(folder._id)} disabled={move.isPending || current === String(folder._id)} onClick={() => move.mutate(String(folder._id))}><Folder size={15}/><strong className="flex-1">{display(folder.name)}</strong><span>{display(folder.conversationCount)}</span></button>)}</div><button className="nv-button mt-4" disabled={move.isPending || !current} onClick={() => move.mutate(null)}>Remove from folder</button><button className="nv-button mt-4" onClick={() => setCreate(true)}><Plus size={13}/>Create new folder</button>{move.error && <p className="nv-error-text">{errorMessage(move.error)}</p>}<button className="nv-button mt-4" onClick={() => setOpen(false)}>Cancel</button></DialogContent></Dialog><KoraFolderDialog open={create} onOpenChange={setCreate} onCreated={folder => move.mutate(String(folder._id))}/></>;
}
