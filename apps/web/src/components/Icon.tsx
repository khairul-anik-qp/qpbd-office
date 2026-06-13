import type { SVGProps } from "react";
import { REQUEST_TYPE_ICONS, type RequestType } from "@office/shared";
import { ICON_REGISTRY, type IconName } from "@/icons/material-symbols";

// Single swap point: to move off Material Symbols (e.g. Wick wm-*/wc-*),
// repoint ICON_REGISTRY — callers and the shared name maps stay unchanged.

export interface IconProps extends SVGProps<SVGSVGElement> {
  /** Material Symbols name, e.g. UI_ICONS.accept ("check_circle"). */
  name: IconName;
}

export function Icon({ name, ...props }: IconProps) {
  const Glyph = ICON_REGISTRY[name];
  return <Glyph {...props} />;
}

export interface TypeIconProps extends SVGProps<SVGSVGElement> {
  type: RequestType;
}

/** Icon for a request type, via shared REQUEST_TYPE_ICONS. */
export function TypeIcon({ type, ...props }: TypeIconProps) {
  const name = REQUEST_TYPE_ICONS[type] as IconName;
  // Spread first: SVGProps carries an optional `name`, so it must not clobber ours.
  return <Icon {...props} name={name} />;
}
