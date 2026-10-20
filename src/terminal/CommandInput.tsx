import { useLayoutEffect, useRef, useState } from "react";
import type { ComponentProps, Ref } from "react";

type Props = Omit<ComponentProps<"input">, "ref"> & {
  ref: Ref<HTMLInputElement>;
  value: string;
  caret: number;
  focused: boolean;
};

// The real <input> is transparent and sits over a mirror that draws the text and
// the █ cursor at the caret (INPUT-8). The input keeps focus, keyboard, IME and a11y.
export function CommandInput({
  ref,
  value,
  caret,
  focused,
  ...inputProps
}: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  // Horizontal scroll of the single-line input, kept so the cursor stays visible.
  const [offset, setOffset] = useState(0);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const anchor = anchorRef.current;
    const cursor = cursorRef.current;
    if (!box || !anchor || !cursor) return;
    const x = anchor.offsetLeft;
    const right = x + cursor.offsetWidth;
    const width = box.clientWidth;
    setOffset((prev) => {
      if (x < prev) return x;
      if (right > prev + width) return right - width;
      return Math.min(prev, Math.max(0, right - width));
    });
  }, [value, caret]);

  // Keep the native input scrolled the same way, so clicks land on the right character.
  useLayoutEffect(() => {
    const input = boxRef.current?.querySelector("input");
    if (input) input.scrollLeft = offset;
  }, [offset]);

  return (
    <div ref={boxRef} className="relative min-w-0 flex-1 overflow-hidden">
      <div
        data-testid="input-mirror"
        aria-hidden="true"
        className="pointer-events-none whitespace-pre"
        style={{ transform: `translateX(${-offset}px)` }}
      >
        {value.slice(0, caret)}
        {/* Zero-width anchor: the block overlays the character at the caret. */}
        <span ref={anchorRef} className="relative">
          <span
            ref={cursorRef}
            data-testid="terminal-cursor"
            data-state={focused ? "solid" : "hollow"}
            className={
              focused
                ? "absolute top-0 left-0 animate-blink motion-reduce:animate-none"
                : "absolute top-0 left-0 text-transparent outline outline-1 -outline-offset-1 outline-fg"
            }
          >
            █
          </span>
        </span>
        {value.slice(caret)}
      </div>
      <input
        ref={ref}
        type="text"
        value={value}
        aria-label="Terminal input"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        className="absolute inset-0 w-full bg-transparent text-transparent caret-transparent outline-none"
        {...inputProps}
      />
    </div>
  );
}
