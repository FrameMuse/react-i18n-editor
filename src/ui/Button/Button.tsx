import "./Button.scss"

import { MouseEvent, MouseEventHandler, useState } from "react"

import { classMerge, modifiedClass } from "@/utils/react"

import { ButtonBaseProps } from "./Button.types"

interface ButtonProps extends ButtonBaseProps {
  type?: "reset" | "submit"
  disabled?: boolean
  /**
   * If `onClick` returns promise, the button will be blocked until resolved.
   */
  await?: boolean
  pending?: boolean
  onClick?: MouseEventHandler<HTMLButtonElement>
}

function Button(props: ButtonProps) {
  const [pending, setPending] = useState(false)
  async function onClick(event: MouseEvent<HTMLButtonElement>) {
    if (props.await) {
      await onClickPromise(event)
    } else {
      props.onClick?.(event)
    }
  }
  async function onClickPromise(event: MouseEvent<HTMLButtonElement>) {
    setPending(true)
    try {
      await props.onClick?.(event)
    } finally {
      setPending(false)
    }
  }

  const modifiers: string[] = []
  if (props.color) modifiers.push(props.color)
  if (props.size) modifiers.push(props.size)

  if (props.outline) modifiers.push("outline")
  if (props.squared) modifiers.push("squared")

  if (pending || props.pending) modifiers.push("pending", "disabled")

  return (
    <button className={classMerge(modifiedClass("button", ...modifiers), props.className)} type={props.type || "button"} disabled={props.disabled || pending} onClick={onClick}>
      <div className="button__text">{props.children}</div>
      <div className="button__loader">
        Loading...
      </div>
    </button>
  )
}

export default Button
