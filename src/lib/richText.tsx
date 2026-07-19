import React from "react";
import { fixWidows } from "@/lib/typografie";

/**
 * Tiny safe inline rich-text renderer used for product descriptions.
 *
 * Supported markers (admin toolbar inserts them around selections):
 *   **bold text**
 *   *italic text*
 *   [lg]bigger text[/lg]
 *   [sm]smaller text[/sm]
 *
 * Plain text is escaped — markers are the only HTML produced — so admin
 * input cannot inject arbitrary markup. Line breaks are preserved.
 */

type Node = string | JSX.Element;

const wrap = (
  text: string,
  regex: RegExp,
  render: (inner: Node[], key: string) => JSX.Element,
): Node[] => {
  // Operate on arrays of nodes so each pass nests further.
  const apply = (nodes: Node[]): Node[] =>
    nodes.flatMap((node, i) => {
      if (typeof node !== "string") return [node];
      const out: Node[] = [];
      let last = 0;
      let m: RegExpExecArray | null;
      const r = new RegExp(regex.source, regex.flags.includes("g") ? regex.flags : regex.flags + "g");
      while ((m = r.exec(node)) !== null) {
        if (m.index > last) out.push(node.slice(last, m.index));
        out.push(render([m[1]], `${i}-${m.index}`));
        last = m.index + m[0].length;
      }
      if (last < node.length) out.push(node.slice(last));
      return out.length > 0 ? out : [node];
    });
  return apply([text]);
};

const renderLine = (line: string, key: string): JSX.Element => {
  let nodes: Node[] = [line];
  // Order matters: longer/greedier patterns first.
  nodes = wrap(line, /\[lg\]([\s\S]+?)\[\/lg\]/g, (inner, k) => (
    <span key={`lg-${k}`} className="text-lg">{inner}</span>
  ));
  nodes = nodes.flatMap((n, i) =>
    typeof n === "string"
      ? wrap(n, /\[sm\]([\s\S]+?)\[\/sm\]/g, (inner, k) => (
          <span key={`sm-${i}-${k}`} className="text-sm">{inner}</span>
        ))
      : [n],
  );
  nodes = nodes.flatMap((n, i) =>
    typeof n === "string"
      ? wrap(n, /\*\*([\s\S]+?)\*\*/g, (inner, k) => (
          <strong key={`b-${i}-${k}`} className="font-semibold text-foreground">{inner}</strong>
        ))
      : [n],
  );
  nodes = nodes.flatMap((n, i) =>
    typeof n === "string"
      ? wrap(n, /(?<!\*)\*(?!\*)([\s\S]+?)(?<!\*)\*(?!\*)/g, (inner, k) => (
          <em key={`i-${i}-${k}`} className="italic">{inner}</em>
        ))
      : [n],
  );
  return <React.Fragment key={key}>{nodes}</React.Fragment>;
};

export const RichText: React.FC<{ text: string; className?: string; as?: keyof JSX.IntrinsicElements }> = ({
  text,
  className,
  as: Tag = "span",
}) => {
  const lines = (text ?? "").split("\n");
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {renderLine(fixWidows(line), `l-${i}`)}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </Tag>
  );
};

/**
 * Strip rich-text markers so values can be used in plain-text contexts
 * (meta description, search index, image alt etc).
 */
export const stripRichMarkers = (text: string): string =>
  (text ?? "")
    .replace(/\[\/?(lg|sm)\]/g, "")
    .replace(/\*\*/g, "")
    .replace(/(?<!\*)\*(?!\*)/g, "");
