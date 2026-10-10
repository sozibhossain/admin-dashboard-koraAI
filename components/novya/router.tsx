"use client";
import { resources } from "@/lib/novya-pages";
import { ResourceList, ResourceDetail, ResourceForm } from "./resource";
import { ModuleOverview, RecruitingPage, HealthRiskPage, BillingPage, SystemHealthPage } from "./module-overview";
import { TasksPage } from "./tasks";
import { WorkflowsPage } from "./workflows";
import { WorkflowRuns } from "./workflow-runs";
import { SettingsPage } from "./settings";
import { KoraChat, KoraBrain, KoraSources } from "./kora";
import { CalendarPage } from "./calendar";
import { ProfilePage } from "./profile";
import { LiveSessionPage } from "./live-session";
import { OrganizationCreate } from "./organization-form";
import { LiveOrganization } from "./live-organization";
import { LiveChannels } from "./live-channels";
import { LiveChannelPage } from "./live-channel";
import { OrganizationEdit } from "./organization-edit";
import { PerformancePage,AbsencePage,OnboardingPage } from "./team-pages";
import { KoraFolders } from "./kora-folders";
import { ApprovalList } from "./approval-list";
import { CustomerPages } from "./customer-pages";
import { ManagementPage } from "./management-pages";
import { OrganizationRecord } from "./organization-record";
import { KoraInvestigations, KoraInvestigationDetail, KoraCases, KoraActions, KoraHistory } from "./kora-records";
import { KoraKnowledge } from "./kora-knowledge";
export function NovyaPage({ parts }: {
    parts: string[];
}) {
    const root = parts[0];
    if(root==="management"&&parts.length===1)return <ManagementPage mode="overview"/>;
    if(root==="management"&&["health-risk","plans-billing","activity"].includes(parts[1]))return <ManagementPage key={parts[1]} mode={parts[1] as "health-risk"|"plans-billing"|"activity"}/>;
    if(root==="management"&&parts[1]==="organizations"&&!parts[2])return <ManagementPage mode="organizations"/>;
    if(root==="management"&&parts[1]==="organizations"&&parts[2]&&parts[2]!=="create"&&parts[3]!=="edit")return <OrganizationRecord key={parts.join("/")} id={parts[2]} tab={parts[3]}/>;
    if (root === "management" && parts[1] === "customers") return <CustomerPages key={parts.join("/")} parts={parts.slice(2)}/>;
    if(parts.join("/")==="live-view/channels")return <LiveChannels/>;
    if (root === "kora" && parts[1] === "folders") return <KoraFolders key={parts.join("/")} id={parts[2] === "create" ? undefined : parts[2]} form={parts[2] === "create" || parts[3] === "edit"}/>;
    if (root === "kora" && parts[1] === "investigations" && !parts[3]) return parts[2] && parts[2] !== "create" ? <KoraInvestigationDetail key={parts[2]} id={parts[2]}/> : <KoraInvestigations key={parts.join("/")} create={parts[2] === "create"}/>;
    if (root === "kora" && parts[1] === "cases") return <KoraCases key={parts.join("/")} id={parts[2]}/>;
    if (root === "kora" && parts[1] === "actions") return <KoraActions key={parts.join("/")} id={parts[2]}/>;
    if (root === "kora" && parts[1] === "history") return <KoraHistory/>;
    if (root === "kora" && parts[1] === "knowledge") return <KoraKnowledge key={parts.join("/")} id={parts[2] === "create" ? undefined : parts[2]} form={parts[2] === "create" || parts[3] === "edit"}/>;
    if(parts.length===2&&root==="team"){if(parts[1]==="performance")return <PerformancePage/>;if(parts[1]==="time-absence")return <AbsencePage/>;if(parts[1]==="onboarding")return <OnboardingPage/>;}
    if(root==="approvals"&&parts[1]==="all"&&!parts[2])return <ApprovalList/>;
    if (root === "management" && parts[1] === "organizations" && parts[2] && parts[3] === "edit") return <OrganizationEdit id={parts[2]}/>;
    if (root === "live-view" && parts[1] === "channels" && parts[2]) return <LiveChannelPage channel={parts[2]}/>;
    if (root === "live-view" && parts[1] === "organizations" && parts[2]) return <LiveOrganization id={parts[2]}/>;
    if (parts.join("/") === "management/organizations/create") return <OrganizationCreate/>;
    if (root === "live-view" && parts[1] === "conversations" && parts[2]) return <LiveSessionPage id={parts[2]}/>;
    if (root === "profile") return <ProfilePage/>;
    if (root === "tasks")
        return <TasksPage parts={parts.slice(1)}/>;
    if(root==="workflows"&&parts[1]==="runs"&&!parts[2])return <WorkflowRuns/>;
    if (root === "workflows")
        return <WorkflowsPage parts={parts.slice(1)}/>;
    if (root === "settings")
        return <SettingsPage key={parts.join("/")} parts={parts.slice(1)}/>;
    if (root === "calendar")
        return <CalendarPage />;
    if (root === "system-health")
        return <SystemHealthPage parts={parts.slice(1)}/>;
    if (root === "kora" && parts.length === 1)
        return <KoraChat />;
    if (root === "kora" && parts[1] === "conversations")
        return <KoraChat key={parts[2]} id={parts[2]}/>;
    if (root === "kora" && parts[1] === "brain")
        return <KoraBrain />;
    if (root === "kora" && parts[1] === "sources")
        return <KoraSources />;
    if (["management", "team", "approvals", "live-view"].includes(root) && parts.length === 1)
        return <ModuleOverview module={root as "management" | "team" | "approvals" | "live-view"}/>;
    if (root === "management" && parts[1] === "health-risk")
        return <HealthRiskPage />;
    if (root === "management" && parts[1] === "plans-billing")
        return <BillingPage />;
    if (root === "team" && parts[1] === "recruiting")
        return <RecruitingPage />;
    const isApproval = root === "approvals";
    const base = isApproval ? "approvals" : parts.slice(0, 2).join("/");
    const resource = resources[isApproval ? "approvals/all" : base];
    if (!resource)
        return null;
    const tail = isApproval ? (parts[1] === "all" ? parts.slice(2) : parts.slice(1)) : parts.slice(2);
    if (tail[0] === "create")
        return <ResourceForm resource={resource} base={base}/>;
    if (tail[0] && tail[1] === "edit")
        return <ResourceForm key={tail[0]} resource={resource} base={base} id={tail[0]}/>;
    if (tail[0])
        return <ResourceDetail key={parts.join("/")} resource={resource} base={isApproval ? "approvals/all" : base} id={tail[0]} tab={tail[1]}/>;
    return <ResourceList resource={resource} base={base}/>;
}
