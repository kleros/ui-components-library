// Recipe: a searchable, paginated evidence list with loading and empty states and a submit modal.
// Copy into your app and replace `fetchEvidence` / `submitEvidence` with your data layer.
import { useEffect, useState } from "react";
import { AlertMessage, Button, Card, FileUploader, Modal, Searchbar, StandardPagination, TextArea, TextField } from "@kleros/ui-components-library";
import { AddressDisplay, EmptyState, Skeleton } from "@kleros/ui-components-library/kit";

type Evidence = { id: string; title: string; description: string; sender: string };
const PAGE_SIZE = 5;

async function fetchEvidence(): Promise<Evidence[]> {
  return [{ id: "1", title: "Delivery receipt", description: "Signed on 3 May.", sender: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed" }];
}
async function submitEvidence(_e: { title: string; description: string; file?: File }): Promise<void> {}

export default function EvidenceList() {
  const [items, setItems] = useState<Evidence[]>();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File>();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");

  useEffect(() => {
    fetchEvidence().then(setItems);
  }, []);

  const filtered = (items ?? []).filter((e) => e.title.toLowerCase().includes(query.toLowerCase()));
  const numPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const shown = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function onSubmit() {
    setStatus("sending");
    try {
      await submitEvidence({ title, description, file });
      setStatus("sent");
      setIsOpen(false);
    } catch {
      setStatus("failed");
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-end gap-4">
        <Searchbar aria-label="Search evidence" placeholder="Search" value={query} onChange={(v) => { setQuery(v); setPage(1); }} />
        <Button text="Submit evidence" onPress={() => setIsOpen(true)} />
      </div>
      {status === "sent" && <AlertMessage variant="success" title="Evidence submitted" msg="It will appear once indexed." />}

      {items === undefined ? (
        <Skeleton className="h-20 w-full" count={3} />
      ) : shown.length === 0 ? (
        <EmptyState title="No evidence yet" description="Be the first to submit evidence." />
      ) : (
        shown.map((e) => (
          <Card key={e.id} className="flex h-auto w-full flex-col gap-2 p-4">
            <h3 className="text-klerosUIComponentsPrimaryText font-semibold">{e.title}</h3>
            <p className="text-klerosUIComponentsSecondaryText text-sm">{e.description}</p>
            <AddressDisplay address={e.sender} />
          </Card>
        ))
      )}
      {numPages > 1 && <StandardPagination currentPage={page} numPages={numPages} callback={setPage} />}

      <Modal isOpen={isOpen} onOpenChange={setIsOpen} ariaLabel="Submit evidence" className="flex flex-col gap-4 p-6">
        <TextField label="Title" value={title} onChange={setTitle} />
        <TextArea label="Description" value={description} onChange={setDescription} />
        <FileUploader callback={setFile} selectedFile={file} msg="PDF or image, up to 10 MB." variant="info" />
        {status === "failed" && <AlertMessage variant="error" title="Could not submit" msg="Try again." />}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" text="Cancel" onPress={() => setIsOpen(false)} />
          <Button text="Submit" isDisabled={!title} isLoading={status === "sending"} onPress={onSubmit} />
        </div>
      </Modal>
    </section>
  );
}
