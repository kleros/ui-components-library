// Recipe: a searchable, paginated evidence list with loading, error and empty states (QueryState) and a submit modal.
// Copy into your app and replace `fetchEvidence` / `submitEvidence` with your data layer. With a query library, pass
// its isLoading, isPending, isError and data to QueryState, and its refetch as onRetry, instead of the state kept here.
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertMessage, Button, Card, FileUploader, Modal, Searchbar, StandardPagination, TextArea, TextField } from "@kleros/ui-components-library";
import { AddressDisplay, FormStack, QueryState, Section, Skeleton } from "@kleros/ui-components-library/kit";

type Evidence = { id: string; title: string; description: string; sender: string };
const PAGE_SIZE = 5;

function fetchEvidence(): Promise<Evidence[]> {
  return Promise.resolve([
    { id: "1", title: "Delivery receipt", description: "Signed on 3 May.", sender: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed" },
  ]);
}
function submitEvidence(_e: { title: string; description: string; file?: File }): Promise<void> {
  return Promise.resolve(); // your API or contract call
}

export default function EvidenceList() {
  const [items, setItems] = useState<Evidence[]>();
  const [isError, setIsError] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File>();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  // Loads the list; a rejected fetch shows QueryState's error, whose Retry runs this again. Only the latest request
  // sets the rows or the error, so an earlier one that settles late (StrictMode's second mount, a Retry) is dropped.
  // Indexed data can hold a null whatever its type says (a nullable subgraph field, untyped JSON): normalise the
  // fields the list reads, so one bad item cannot blank the list.
  const latest = useRef(0);
  const load = useCallback(() => {
    const request = ++latest.current;
    setIsError(false);
    fetchEvidence()
      .then((rows) => {
        if (request !== latest.current) return;
        setItems(rows.map((e) => ({ ...e, title: e.title ?? "", sender: e.sender ?? "" })));
      })
      .catch(() => {
        if (request === latest.current) setIsError(true);
      });
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const filtered = (items ?? []).filter((e) => e.title.toLowerCase().includes(query.toLowerCase()));
  const numPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // The core Button's isLoading only shows a spinner: the button stays pressable, so a submission in flight disables
  // it and this ref drops a second press that lands before the re-render.
  const sending = useRef(false);
  // While a submission is pending the modal cannot close (Cancel is disabled and Escape does nothing) and its fields
  // are locked: a failure shows in the modal, and a success closes it and clears the fields that were sent. Closing
  // at other times drops a failed status, so the modal opens again without the old error.
  const close = () => {
    if (sending.current) return;
    setIsOpen(false);
    setStatus((s) => (s === "failed" ? "idle" : s));
  };

  async function onSubmit() {
    if (sending.current) return;
    sending.current = true;
    setStatus("sending");
    try {
      await submitEvidence({ title, description, file });
      setStatus("sent");
      setIsOpen(false);
      setTitle("");
      setDescription("");
      setFile(undefined);
    } catch {
      setStatus("failed");
    } finally {
      sending.current = false;
    }
  }

  return (
    <Section title="Evidence" actions={<Button text="Submit evidence" onPress={() => setIsOpen(true)} />}>
      <Searchbar aria-label="Search evidence" placeholder="Search" value={query} onChange={(v) => { setQuery(v); setPage(1); }} />
      {status === "sent" && <AlertMessage variant="success" title="Evidence submitted" msg="It will appear once indexed." />}

      <QueryState isLoading={items === undefined && !isError} isError={isError} data={shown} onRetry={load}
        loading={<Skeleton className="h-20 w-full" count={3} />}
        empty={query ? { title: "No matching evidence", description: "Try another search." }
          : { title: "No evidence yet", description: "Be the first to submit evidence." }}>
        {(rows) => rows.map((e) => (
          <Card key={e.id} fluid className="flex flex-col gap-2 p-4">
            <h3 className="text-klerosUIComponentsPrimaryText font-semibold">{e.title}</h3>
            <p className="text-klerosUIComponentsSecondaryText text-sm">{e.description}</p>
            {e.sender && <AddressDisplay address={e.sender} />}
          </Card>
        ))}
      </QueryState>
      {numPages > 1 && <StandardPagination currentPage={page} numPages={numPages} callback={setPage} />}

      <Modal isOpen={isOpen} onOpenChange={(o) => (o ? setIsOpen(true) : close())} ariaLabel="Submit evidence" fluid
        className="p-6">
        <FormStack
          actions={
            <>
              <Button variant="secondary" text="Cancel" isDisabled={status === "sending"} onPress={close} />
              <Button text="Submit" isDisabled={!title || status === "sending"} isLoading={status === "sending"}
                onPress={onSubmit} />
            </>
          }
        >
          <TextField label="Title" value={title} onChange={setTitle} isDisabled={status === "sending"}
            className="w-full" />
          <TextArea label="Description" value={description} onChange={setDescription}
            isDisabled={status === "sending"} className="w-full" inputProps={{ className: "w-full" }} />
          <FileUploader callback={setFile} selectedFile={file} isDisabled={status === "sending"}
            msg="PDF or image, up to 10 MB." variant="info" />
          {status === "failed" && <AlertMessage variant="error" title="Could not submit" msg="Try again." />}
        </FormStack>
      </Modal>
    </Section>
  );
}
