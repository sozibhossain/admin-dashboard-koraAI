"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string; disabled: boolean; group?: string };
const EMPTY = "__nv_empty_option__";
function optionText(node: React.ReactNode): string {
  return React.Children.toArray(node).map(child => React.isValidElement<{ children?: React.ReactNode }>(child) ? optionText(child.props.children) : String(child)).join("");
}
function collectOptions(children: React.ReactNode, group?: string): Option[] {
  return React.Children.toArray(children).flatMap(child => {
    if (!React.isValidElement<React.OptionHTMLAttributes<HTMLOptionElement> & { label?: string }>(child)) return [];
    if (child.type === "option") {
      const label = child.props.label || optionText(child.props.children);
      return [{ value: String(child.props.value ?? label), label, disabled: !!child.props.disabled, group }];
    }
    return collectOptions(child.props.children, child.type === "optgroup" ? child.props.label : group);
  });
}

/** A styled, portaled picker retaining native select events and form validation. */
export function DashboardSelect({ children, value, defaultValue, onChange, className, style, id, name, required, disabled, onInvalid, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const options = React.useMemo(() => collectOptions(children), [children]);
  const [localValue, setLocalValue] = React.useState(String(defaultValue ?? options.find(o => !o.disabled)?.value ?? ""));
  const [invalid, setInvalid] = React.useState(false);
  const native = React.useRef<HTMLSelectElement>(null), trigger = React.useRef<HTMLButtonElement>(null);
  const current = value === undefined ? localValue : String(value);
  const selected = options.find(o => o.value === current) || options[0];
  React.useEffect(() => {
    const form = native.current?.form;
    const reset = () => {setLocalValue(String(defaultValue ?? options[0]?.value ?? ""));setInvalid(false);};
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [defaultValue, options]);
  return <>
    <select {...props} ref={native} className="nv-select-native" aria-hidden="true" tabIndex={-1} id={id ? `${id}-native` : undefined} name={name} required={required} disabled={disabled} value={current} onChange={event => {setLocalValue(event.target.value);onChange?.(event);}} onInvalid={event => {event.preventDefault();setInvalid(true);trigger.current?.focus();onInvalid?.(event);}}>{children}</select>
    <SelectPrimitive.Root value={selected?.value === "" ? EMPTY : selected?.value || EMPTY} disabled={disabled} onValueChange={next => {
      const nextValue = next === EMPTY ? "" : next;
      setLocalValue(nextValue);setInvalid(false);
      if (native.current) {native.current.value = nextValue;native.current.dispatchEvent(new Event("change",{bubbles:true}));}
    }}>
      <SelectPrimitive.Trigger ref={trigger} id={id} title={props.title} aria-label={props["aria-label"] || props.title || name || selected?.label} aria-labelledby={props["aria-labelledby"]} aria-required={required} aria-invalid={invalid || props["aria-invalid"]} className={cn("nv-select-trigger nv-select-control",className)} style={style}>
        <SelectPrimitive.Value>{selected?.label || "Select…"}</SelectPrimitive.Value><SelectPrimitive.Icon><ChevronDown size={14}/></SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal><SelectPrimitive.Content className="nv-menu-panel nv-select-panel" position="popper" sideOffset={6} collisionPadding={12}>
        <SelectPrimitive.ScrollUpButton className="nv-select-scroll"><ChevronUp size={14}/></SelectPrimitive.ScrollUpButton>
        <SelectPrimitive.Viewport className="nv-menu-viewport">{options.map((option,i) => <React.Fragment key={`${option.value}-${i}`}>
          {option.group && option.group !== options[i-1]?.group && <div className="nv-menu-label">{option.group}</div>}
          <SelectPrimitive.Item className="nv-menu-item nv-select-option" value={option.value === "" ? EMPTY : option.value} disabled={option.disabled} textValue={option.label}><SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText><SelectPrimitive.ItemIndicator className="nv-menu-check"><Check size={14}/></SelectPrimitive.ItemIndicator></SelectPrimitive.Item>
        </React.Fragment>)}</SelectPrimitive.Viewport>
        <SelectPrimitive.ScrollDownButton className="nv-select-scroll"><ChevronDown size={14}/></SelectPrimitive.ScrollDownButton>
      </SelectPrimitive.Content></SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  </>;
}
