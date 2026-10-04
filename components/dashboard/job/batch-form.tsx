"use client";

import { useEffect, useState } from "react";

import { Plus, X, Check } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface Batch {
  id: number;
  course_name?: string;
  course?: string | {
    name?: string;
    course_name?: string;
    title?: string;
  };
  name?: string;
  start_year: string;
  end_year: string;
}

function getBatchLabel(batch: Batch) {
  const courseName =
    batch.course_name ||
    (typeof batch.course === "string"
      ? batch.course
      : batch.course?.course_name || batch.course?.name || batch.course?.title) ||
    batch.name;

  return courseName || "Unnamed batch";
}

interface BatchFormProps {
  onBatchSelect: (batches: Batch[]) => void;
}

export default function BatchForm({
  onBatchSelect,
}: BatchFormProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<Batch[]>([]);
  const [showBatchForm, setShowBatchForm] = useState(false);

  const [batchForm, setBatchForm] = useState({
    course_name: "",
    start_year: "",
    end_year: "",
  });

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await fetch("/api/batches", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch batches.");
        }

        const payload: unknown = await response.json();
        const list = Array.isArray(payload)
          ? payload
          : payload && typeof payload === "object" && "data" in payload && Array.isArray(payload.data)
            ? payload.data
            : payload && typeof payload === "object" && "results" in payload && Array.isArray(payload.results)
              ? payload.results
              : [];

        setBatches(list as Batch[]);
      } catch (error) {
        console.error("Unable to load batches:", error);
      }
    };

    fetchBatches();
  }, []);

  const handleAddBatch = () => {
    setShowBatchForm((prev) => !prev);
  };

  const handleBatchSubmit = () => {
    const newBatch: Batch = {
      id: Date.now(),
      course_name: batchForm.course_name,
      start_year: batchForm.start_year,
      end_year: batchForm.end_year,
    };

    // Add the new batch to available batches
    setBatches((prev) => [...prev, newBatch]);

    // Reset form
    setBatchForm({
      course_name: "",
      start_year: "",
      end_year: "",
    });

    setShowBatchForm(false);
  };

  const handleBatchSelect = (batch: Batch) => {
    const alreadySelected = selectedBatches.some(
      (selected) => selected.id === batch.id
    );

    let updatedBatches: Batch[];

    if (alreadySelected) {
      // Remove batch
      updatedBatches = selectedBatches.filter(
        (selected) => selected.id !== batch.id
      );
    } else {
      // Add batch
      updatedBatches = [...selectedBatches, batch];
    }

    setSelectedBatches(updatedBatches);

    // Send selected batches to parent
    onBatchSelect(updatedBatches);
  };

  const handleRemoveBatch = (batchId: number) => {
    const updatedBatches = selectedBatches.filter(
      (batch) => batch.id !== batchId
    );

    setSelectedBatches(updatedBatches);

    onBatchSelect(updatedBatches);
  };

  return (
    <div className="relative">
      {/* Selected batches + dropdown + add button */}
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-[400px] min-h-10 justify-start h-auto"
            >
              <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto">
                {selectedBatches.length === 0 && (
                  <span className="text-muted-foreground">
                    Select batches
                  </span>
                )}

                {selectedBatches.map((batch) => (
                  <span
                    key={batch.id}
                    className="flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-sm"
                  >
                    {getBatchLabel(batch)}

                    <span
                      role="button"
                      tabIndex={0}
                      className="ml-1 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveBatch(batch.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </span>
                ))}
              </div>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-[400px] p-2"
            align="start"
          >
            <div className="space-y-1">
              {batches.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">
                  No batches added yet.
                </p>
              ) : (
                batches.map((batch) => {
                  const isSelected = selectedBatches.some(
                    (selected) => selected.id === batch.id
                  );

                  return (
                    <button
                      key={batch.id}
                      type="button"
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
                      onClick={() => handleBatchSelect(batch)}
                    >
                      <span>
                        {getBatchLabel(batch)}
                      </span>

                      {isSelected && (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Add Batch Button */}
        <Button
          type="button"
          onClick={handleAddBatch}
          variant="outline"
          className="h-10 w-10 shrink-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Add Batch Form Overlay */}
      {showBatchForm && (
        <Card className="absolute left-0 top-full z-50 mt-2  w-[400px] shadow-xl">
          <CardHeader>
            <CardTitle>Add Batch</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              {/* Course Name */}
              <Input
                placeholder="Course Name"
                value={batchForm.course_name}
                onChange={(e) =>
                  setBatchForm((prev) => ({
                    ...prev,
                    course_name: e.target.value,
                  }))
                }
                required
              />

              {/* Start Year */}
              <Input
                type="number"
                placeholder="Start Year"
                value={batchForm.start_year}
                onChange={(e) =>
                  setBatchForm((prev) => ({
                    ...prev,
                    start_year: e.target.value,
                  }))
                }
                required
              />

              {/* End Year */}
              <Input
                type="number"
                placeholder="End Year"
                value={batchForm.end_year}
                onChange={(e) =>
                  setBatchForm((prev) => ({
                    ...prev,
                    end_year: e.target.value,
                  }))
                }
                required
              />

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleBatchSubmit}
                >
                  Submit
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBatchForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
