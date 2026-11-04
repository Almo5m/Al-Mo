// أي مكوّن يقدر يطلب حركة من الروبوت بـ robotDo("Think") مثلًا، والروبوت بيسمع ويشغّلها.
export type RobotAction = "Idle" | "Wave" | "Point" | "Talk" | "Think" | "Success" | "Error" | "Surprised" | "WakeUp";

const EVENT = "almo-robot";

export function robotDo(action: RobotAction): void {
  window.dispatchEvent(new CustomEvent<RobotAction>(EVENT, { detail: action }));
}

export function onRobot(fn: (action: RobotAction) => void): () => void {
  const handler = (e: Event) => fn((e as CustomEvent<RobotAction>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
