import { notFound } from "next/navigation";
import { NovyaPage } from "@/components/novya/router";
import { isNovyaRoute } from "@/lib/novya-routes";
export default async function Page({params}:{params:Promise<{novya:string[]}>}){
 const {novya:parts}=await params;
 if(!isNovyaRoute(parts))notFound();
 return <NovyaPage parts={parts}/>;
}
