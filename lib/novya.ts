import api from "./axios";
export type RecordData = Record<string, unknown>;
export function recordValue(record: RecordData, key: string): unknown {
    if (Object.prototype.hasOwnProperty.call(record, key)) return record[key];
    return key.split(".").reduce<unknown>((value, part) => value && typeof value === "object" ? (value as RecordData)[part] : undefined, record);
}
export type ApiResult<T = RecordData> = {
    data: T;
    meta?: {
        total?: number;
        pages?: number;
        page?: number;
        counts?: Record<string,number>;
        eventsToday?: number;
        dueToday?: number;
        overdue?: number;
        tabs?: Record<string,number>;
    };
    message?: string;
};
export const novya = {
    get: async <T = RecordData>(path: string, params?: RecordData): Promise<ApiResult<T>> => (await api.get(`/novya${path}`, { params })).data,
    post: async <T = RecordData>(path: string, data: RecordData): Promise<ApiResult<T>> => (await api.post(`/novya${path}`, data)).data,
    patch: async <T = RecordData>(path: string, data: RecordData): Promise<ApiResult<T>> => (await api.patch(`/novya${path}`, data)).data,
    put: async <T = RecordData>(path: string, data: RecordData): Promise<ApiResult<T>> => (await api.put(`/novya${path}`, data)).data,
    remove: async (path: string) => (await api.delete(`/novya${path}`)).data,
};
export function display(value: unknown): string {
    if (value == null || value === "")
        return "—";
    if (typeof value === "boolean")
        return value ? "Enabled" : "Disabled";
    if (Array.isArray(value))
        return value.map(display).join(", ");
    if (typeof value === "object") {
        const row = value as RecordData;
        return display(row.name ?? row.title ?? row.email ?? row.label ?? row.code ?? "—");
    }
    return String(value).replace(/_/g, " ");
}
export function rowsOf(value: unknown): RecordData[] {
    if (Array.isArray(value))
        return value.filter((v): v is RecordData => !!v && typeof v === "object");
    return [];
}
export function errorMessage(error: unknown): string {
    const e = error as {
        response?: {
            status?: number;
            data?: {
                message?: string;
            };
        };
        message?: string;
    };
    if (e.response?.status === 403 && /tenant access|access grant/i.test(e.response.data?.message??""))return e.response.data!.message!;
    if (e.response?.status === 403)
        return "Your role does not have permission to access this information.";
    return e.response?.data?.message ?? e.message ?? "Unable to load data. Please try again.";
}
