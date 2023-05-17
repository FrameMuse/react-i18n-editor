import "./Textarea.scss"

import _ from "lodash"
import { TextareaHTMLAttributes } from "react"
import { classMerge } from "utils/react"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { }

function Textarea(props: TextareaProps) {
  return (
    <label className="textarea">
      {props.children && (
        <div className="textarea__label">{props.children}{props.required && "*"}</div>
      )}
      <textarea {..._.omit(props, "children")} className={classMerge("textarea__appearance", props.className)} />
    </label>
  )
}

export default Textarea
