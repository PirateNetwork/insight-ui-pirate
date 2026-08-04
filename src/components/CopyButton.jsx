import {useState} from 'react';

// Replaces the legacy clipCopy directive, which used ZeroClipboard (a
// Flash-based clipboard shim) - Flash was removed from all browsers
// around 2020/2021, so that directive has been silently non-functional
// for years. navigator.clipboard is the real, currently-working API.
export default function CopyButton({text}) {
  const [copied, setCopied] = useState(false);

  function onClick() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <span className="btn-copy" onClick={onClick} style={{cursor: 'pointer'}}>
      {copied && (
        <div className="tooltip fade right in">
          <div className="tooltip-arrow" />
          <div className="tooltip-inner">Copied!</div>
        </div>
      )}
    </span>
  );
}
