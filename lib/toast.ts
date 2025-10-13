// Simple global toast bus for client-side use
type ToastKind = "success" | "error" | "info";
type ToastMsg = { id: number; kind: ToastKind; text: string };

const bus =
  typeof window !== "undefined"
    ? ((window as any).__toast_bus ||= new EventTarget())
    : undefined;

let id = 1;

export const toast = {
  success(text: string) {
    bus?.dispatchEvent(new CustomEvent("toast", { detail: { id: id++, kind: "success", text } as ToastMsg }));
  },
  error(text: string) {
    bus?.dispatchEvent(new CustomEvent("toast", { detail: { id: id++, kind: "error", text } as ToastMsg }));
  },
  info(text: string) {
    bus?.dispatchEvent(new CustomEvent("toast", { detail: { id: id++, kind: "info", text } as ToastMsg }));
  }
};

export function subscribeToast(cb: (t: ToastMsg) => void) {
  if (!bus) return () => {};
  const handler = (e: any) => cb(e.detail);
  bus.addEventListener("toast", handler);
  return () => bus.removeEventListener("toast", handler);
}
