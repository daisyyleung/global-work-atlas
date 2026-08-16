export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'htmlFor') node.htmlFor = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key === 'on') Object.entries(value).forEach(([event, handler]) => node.addEventListener(event, handler));
    else if (key === 'attrs') Object.entries(value).forEach(([attr, attrValue]) => { if (attrValue === undefined || attrValue === null || attrValue === false) return; if (attrValue === true) node.setAttribute(attr, ''); else node.setAttribute(attr, String(attrValue)); });
    else if (key in node && !key.startsWith('aria-')) node[key] = value;
    else node.setAttribute(key, String(value));
  }
  for (const child of (Array.isArray(children) ? children : [children])) if (child !== null && child !== undefined) node.append(child.nodeType ? child : document.createTextNode(String(child)));
  return node;
}

export function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }
export function text(value) { return document.createTextNode(String(value ?? '')); }

export function button(label, onClick, props = {}) {
  return el('button', { type: 'button', class: 'button', text: label, on: { click: onClick }, ...props });
}

export function field(label, control, hint = '') {
  const id = control.id || `field-${Math.random().toString(36).slice(2)}`;
  control.id = id;
  return el('label', { class: 'field' }, [el('span', { class: 'field-label', text: label }), control, hint ? el('span', { class: 'field-hint', text: hint }) : null]);
}

export function selectControl(options, value = '') {
  const select = el('select');
  for (const option of options) select.append(el('option', { value: option.value, text: option.label }));
  select.value = value;
  return select;
}

export function announce(message) {
  const live = document.querySelector('[data-live-region]');
  if (live) live.textContent = message;
}
