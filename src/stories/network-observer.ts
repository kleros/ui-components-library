/** Side effects recorded during a story, and controlled fetch responses. */
export const observed = {
  dialogs: [] as string[],
  opened: [] as string[],
  requests: [] as string[],
  /** Worker script URLs, including URLs found inside `blob:` worker sources. */
  workers: [] as string[],
  workerScans: [] as Promise<void>[],
  blobs: new Map<string, Blob>(),
  unloads: 0,
  startHref: "",
  /** Controlled `fetch` outcomes by request URL suffix. */
  stubs: new Map<string, () => Promise<Response>>(),
};

/** Same-origin, `blob:` and `data:` URLs never leave this machine. */
export const isLocalRequest = (raw: string): boolean => {
  try {
    const { origin, protocol } = new URL(raw, window.location.href);
    return (
      origin === window.location.origin ||
      protocol === "blob:" ||
      protocol === "data:"
    );
  } catch {
    return false;
  }
};

/** URLs in a `srcset`/`imagesrcset` value. A URL may itself contain commas
 * (`data:`), so candidates are split per the HTML parsing rules. */
export const srcsetUrls = (srcset: string): string[] => {
  const urls: string[] = [];
  let i = 0;
  while (i < srcset.length) {
    while (i < srcset.length && /[\s,]/.test(srcset[i])) i++;
    const start = i;
    while (i < srcset.length && !/\s/.test(srcset[i])) i++;
    const raw = srcset.slice(start, i);
    let end = raw.length;
    while (end > 0 && raw[end - 1] === ",") end--;
    const url = raw.slice(0, end);
    if (url === raw) while (i < srcset.length && srcset[i] !== ",") i++;
    if (url) urls.push(url);
  }
  return urls;
};

/** Quoted absolute or protocol-relative URLs in a script's source. */
const scriptUrls = (source: string): string[] =>
  Array.from(
    source.matchAll(/["'`]([a-z][\w+.-]*:\/\/[^"'`\s]+|\/\/[^"'`\s]+)["'`]/gi),
    (match) => match[1],
  );

/** Records a worker's script URL. A `blob:` worker's source is scanned for the
 * URLs it imports, since its own requests are invisible to the page. */
const recordWorkerScript = (scriptUrl: string | URL) => {
  const url = new URL(scriptUrl, window.location.href).href;
  if (!url.startsWith("blob:")) {
    observed.workers.push(url);
    return;
  }
  const blob = observed.blobs.get(url);
  if (!blob) {
    observed.workers.push(`unscanned:${url}`);
    return;
  }
  observed.workerScans.push(
    blob.text().then((source) => {
      observed.workers.push(...scriptUrls(source));
    }),
  );
};

// `image`, `use` and `feImage` are SVG elements.
const LOADING_ELEMENTS =
  "img, embed, object, iframe, source, video, audio, script, link, image, use, feImage";

const LOADING_ATTRIBUTES = ["src", "data", "href", "xlink:href", "poster"];

const SRCSET_ATTRIBUTES = ["srcset", "imagesrcset"];

/** Loading-element properties whose setter starts a request, including on
 * elements never attached to the document (`new Image().src = ...`). */
const LOADING_PROPERTIES: [{ prototype: object }, string][] = [
  [HTMLImageElement, "src"],
  [HTMLImageElement, "srcset"],
  [HTMLSourceElement, "src"],
  [HTMLSourceElement, "srcset"],
  [HTMLScriptElement, "src"],
  [HTMLIFrameElement, "src"],
  [HTMLEmbedElement, "src"],
  [HTMLObjectElement, "data"],
  [HTMLMediaElement, "src"],
  [HTMLVideoElement, "poster"],
  [HTMLLinkElement, "href"],
  [HTMLLinkElement, "imageSrcset"],
];

/** The URLs an element attribute value refers to. */
const attributeUrls = (name: string, value: string): string[] =>
  SRCSET_ATTRIBUTES.includes(name.toLowerCase()) ? srcsetUrls(value) : [value];

/** Records dialogs, `window.open`, page unloads, fetch/XHR targets, URLs set on
 * loading elements and worker scripts until the story ends, then restores the
 * originals. */
export const startObservers = () => {
  observed.dialogs = [];
  observed.opened = [];
  observed.requests = [];
  observed.workers = [];
  observed.workerScans = [];
  observed.blobs.clear();
  observed.unloads = 0;
  observed.stubs.clear();
  performance.clearResourceTimings();

  const originals = {
    alert: window.alert,
    confirm: window.confirm,
    prompt: window.prompt,
    open: window.open,
    fetch: window.fetch,
    xhrOpen: XMLHttpRequest.prototype.open,
    Worker: window.Worker,
    createObjectURL: URL.createObjectURL,
    setAttribute: Element.prototype.setAttribute,
    properties: LOADING_PROPERTIES.map(
      ([owner, name]) =>
        [
          owner.prototype,
          name,
          Object.getOwnPropertyDescriptor(owner.prototype, name),
        ] as const,
    ),
  };
  window.alert = (message?: unknown) => {
    observed.dialogs.push(`alert:${String(message)}`);
  };
  window.confirm = (message?: string) => {
    observed.dialogs.push(`confirm:${String(message)}`);
    return false;
  };
  window.prompt = (message?: string) => {
    observed.dialogs.push(`prompt:${String(message)}`);
    return null;
  };
  window.open = (url?: string | URL) => {
    observed.opened.push(String(url));
    return null;
  };
  window.fetch = (input, init) => {
    const url = input instanceof Request ? input.url : String(input);
    observed.requests.push(url);
    for (const [suffix, respond] of observed.stubs) {
      if (url.endsWith(suffix)) return respond();
    }
    return originals.fetch.call(window, input, init);
  };
  XMLHttpRequest.prototype.open = function (
    this: XMLHttpRequest,
    method: string,
    url: string | URL,
    ...rest: [boolean?, string?, string?]
  ) {
    observed.requests.push(String(url));
    return (originals.xhrOpen as (...args: unknown[]) => void).call(
      this,
      method,
      url,
      ...rest,
    );
  };
  Element.prototype.setAttribute = function (
    this: Element,
    name: string,
    value: string,
  ) {
    const attr = name.toLowerCase();
    if (
      [...LOADING_ATTRIBUTES, ...SRCSET_ATTRIBUTES].includes(attr) &&
      this.matches(LOADING_ELEMENTS)
    ) {
      observed.requests.push(...attributeUrls(attr, String(value)));
    }
    return originals.setAttribute.call(this, name, value);
  };
  for (const [prototype, name, descriptor] of originals.properties) {
    if (!descriptor?.set) continue;
    const set = descriptor.set;
    Object.defineProperty(prototype, name, {
      ...descriptor,
      set(this: Element, value: unknown) {
        observed.requests.push(...attributeUrls(name, String(value)));
        set.call(this, value);
      },
    });
  }
  URL.createObjectURL = (obj: Blob | MediaSource) => {
    const url = originals.createObjectURL.call(URL, obj);
    if (obj instanceof Blob) observed.blobs.set(url, obj);
    return url;
  };
  window.Worker = class extends originals.Worker {
    constructor(scriptUrl: string | URL, options?: WorkerOptions) {
      recordWorkerScript(scriptUrl);
      super(scriptUrl, options);
    }
  };
  const onBeforeUnload = () => {
    observed.unloads += 1;
  };
  window.addEventListener("beforeunload", onBeforeUnload);
  observed.startHref = window.location.href;

  return () => {
    window.alert = originals.alert;
    window.confirm = originals.confirm;
    window.prompt = originals.prompt;
    window.open = originals.open;
    window.fetch = originals.fetch;
    XMLHttpRequest.prototype.open = originals.xhrOpen;
    window.Worker = originals.Worker;
    URL.createObjectURL = originals.createObjectURL;
    Element.prototype.setAttribute = originals.setAttribute;
    for (const [prototype, name, descriptor] of originals.properties) {
      if (descriptor) Object.defineProperty(prototype, name, descriptor);
    }
    window.removeEventListener("beforeunload", onBeforeUnload);
    if (window.location.href !== observed.startHref) {
      history.replaceState(history.state, "", observed.startHref);
    }
  };
};

/** Fails on any worker script that is not local. */
export const expectLocalWorkerScripts = async () => {
  await Promise.all(observed.workerScans);
  const remote = observed.workers.filter((url) => !isLocalRequest(url));
  if (remote.length > 0) {
    throw new Error(`Non-local worker scripts: ${remote.join(", ")}`);
  }
};

/** URLs in the loading attributes of loading elements under `root`. */
export const scannedUrls = (root: ParentNode): string[] =>
  Array.from(root.querySelectorAll(LOADING_ELEMENTS)).flatMap((el) =>
    [...LOADING_ATTRIBUTES, ...SRCSET_ATTRIBUTES].flatMap((attr) => {
      const value = el.getAttribute(attr);
      return value ? attributeUrls(attr, value) : [];
    }),
  );

/** Non-local URLs in resource timing, fetch/XHR and loading elements. A load
 * made without a hooked setter or `setAttribute`, such as `new Audio(url)` or
 * an `<img>` in detached `innerHTML`, is seen only once it completes. */
export const remoteRequests = (): string[] => {
  const loaded = performance
    .getEntriesByType("resource")
    .map((entry) => entry.name);
  return [...loaded, ...observed.requests, ...scannedUrls(document)].filter(
    (url) => !isLocalRequest(url),
  );
};

/** Fails on any non-local URL in resource timing, fetch/XHR, worker scripts or
 * a loading element's attributes, and on any dialog, `window.open` or unload. */
export const expectOnlyLocalRequests = async () => {
  await expectLocalWorkerScripts();
  const remote = remoteRequests();
  if (remote.length > 0) {
    throw new Error(`Non-local requests: ${remote.join(", ")}`);
  }
  if (observed.dialogs.length > 0) {
    throw new Error(`Dialogs: ${observed.dialogs.join(", ")}`);
  }
  if (observed.opened.length > 0) {
    throw new Error(`window.open: ${observed.opened.join(", ")}`);
  }
  if (observed.unloads > 0) {
    throw new Error(`beforeunload events: ${observed.unloads}`);
  }
};

/** Runs after each story's play, so a failure is reported on that story. */
export const expectStoryStayedPut = async () => {
  if (window.location.href !== observed.startHref) {
    throw new Error(`Story navigated away to ${window.location.href}`);
  }
  await expectOnlyLocalRequests();
};
