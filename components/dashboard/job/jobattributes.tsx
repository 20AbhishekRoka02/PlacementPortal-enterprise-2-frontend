"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type JobAttribute = {
  pk: number;
  attribute_id: number | null;
  name: string;
  data_type: string;
  required: boolean;
  visible_to_company: boolean;
  filterable: boolean;
  order: number;
};

type AttributeDefinition = {
  pk: number;
  name: string;
  data_type: string;
};

type JobAttributesProps = {
  attributes: JobAttribute[];
  addAttribute: () => number;
  updateAttribute: (
    pk: number,
    field: keyof JobAttribute,
    value: string | number | boolean | null
  ) => void;
  removeAttribute: (pk: number) => void;
};

function getList(payload: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(payload)) return payload as Array<Record<string, unknown>>;

  if (payload && typeof payload === "object") {
    const response = payload as { data?: unknown; results?: unknown };
    if (Array.isArray(response.data)) return response.data as Array<Record<string, unknown>>;
    if (Array.isArray(response.results)) return response.results as Array<Record<string, unknown>>;
  }

  return [];
}

function getErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") return "Unable to create attribute.";

  const errors = payload as Record<string, unknown>;
  const summary = errors.message ?? errors.detail;
  if (typeof summary === "string") return summary;

  return Object.entries(errors)
    .map(([field, messages]) => {
      const value = Array.isArray(messages) ? messages.join(", ") : String(messages);
      return `${field}: ${value}`;
    })
    .join("; ") || "Unable to create attribute.";
}

export function JobAttributes({
  attributes,
  addAttribute,
  updateAttribute,
  removeAttribute,
}: JobAttributesProps) {
  const [definitions, setDefinitions] = useState<AttributeDefinition[]>([]);
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customAttributeTarget, setCustomAttributeTarget] = useState<number | null>(null);
  const [customName, setCustomName] = useState("");
  const [customDataType, setCustomDataType] = useState("text");
  const [creatingCustom, setCreatingCustom] = useState(false);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await fetch("/api/jobattributes", {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to fetch job attributes.");

        const payload: unknown = await response.json();
        const fetchedDefinitions = getList(payload).map((item, index) => ({
          pk: Number(item.pk ?? item.id ?? Date.now() + index),
          name: String(item.name ?? ""),
          data_type: String(item.data_type ?? item.datatype ?? "text"),
        }));
        setDefinitions(fetchedDefinitions);
      } catch (error) {
        console.error("Unable to load job attributes:", error);
      }
    };

    fetchAttributes();
  }, []);

  const handleAddAttribute = () => {
    addAttribute();
  };

  const handleSelectAttribute = (rowId: number, definitionId: string) => {
    const definition = definitions.find((item) => item.pk.toString() === definitionId);
    if (!definition) return;

    updateAttribute(rowId, "attribute_id", definition.pk);
    updateAttribute(rowId, "name", definition.name);
    updateAttribute(rowId, "data_type", definition.data_type);
  };

  const handleCreateCustomAttribute = async () => {
    const name = customName.trim();
    if (!name) {
      toast.error("Enter an attribute name.");
      return;
    }

    setCreatingCustom(true);
    const temporaryId = Date.now();

    try {
      const response = await fetch("/api/jobattributes", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: temporaryId,
          name,
          data_type: customDataType,
          slug: name,
        }),
      });

      const payload: unknown = await response.json();
      if (!response.ok) throw new Error(getErrorMessage(payload));

      const responseObject =
        payload && typeof payload === "object"
          ? (payload as Record<string, unknown>)
          : {};
      const rawDefinition =
        responseObject.data && typeof responseObject.data === "object"
          ? (responseObject.data as Record<string, unknown>)
          : responseObject;
      const newDefinition: AttributeDefinition = {
        pk: Number(rawDefinition.pk ?? rawDefinition.id ?? temporaryId),
        name: String(rawDefinition.name ?? name),
        data_type: String(rawDefinition.data_type ?? rawDefinition.datatype ?? customDataType),
      };

      setDefinitions((current) => [
        ...current.filter((item) => item.pk !== newDefinition.pk),
        newDefinition,
      ]);

      if (customAttributeTarget !== null) {
        updateAttribute(customAttributeTarget, "attribute_id", newDefinition.pk);
        updateAttribute(customAttributeTarget, "name", newDefinition.name);
        updateAttribute(customAttributeTarget, "data_type", newDefinition.data_type);
      }

      setCustomName("");
      setCustomDataType("text");
      setShowCustomForm(false);
      setCustomAttributeTarget(null);
      toast.success("Custom attribute created.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create attribute.");
    } finally {
      setCreatingCustom(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Attributes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Select attributes for this job. Add a custom attribute if it is not listed.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {showCustomForm && (
          <div className="rounded-lg border bg-background p-4 shadow-sm">
            <h3 className="mb-3 font-medium">Create Custom Attribute</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                autoFocus
                placeholder="Attribute name"
                value={customName}
                onChange={(event) => setCustomName(event.target.value)}
              />
              <Select value={customDataType} onValueChange={setCustomDataType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select data type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="integer">Integer</SelectItem>
                  <SelectItem value="decimal">Decimal</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="enum">Enum</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCustomForm(false)}
                disabled={creatingCustom}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleCreateCustomAttribute}
                disabled={creatingCustom || !customName.trim()}
              >
                {creatingCustom ? "Creating..." : "Create Attribute"}
              </Button>
            </div>
          </div>
        )}

        {attributes.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            No job attributes selected yet.
          </div>
        ) : (
          <div className="space-y-4">
            {attributes.map((attribute) => {
              const alreadySelected = new Set(
                attributes
                  .filter((item) => item.pk !== attribute.pk)
                  .map((item) => item.attribute_id)
                  .filter((id): id is number => id !== null)
              );

              return (
                <div key={attribute.pk} className="rounded-lg border p-4">
                  <div className="grid gap-4 md:grid-cols-[1fr_200px_auto]">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Attribute Name</label>
                      <div className="flex gap-2">
                        <Select
                          value={attribute.attribute_id?.toString() ?? ""}
                          onValueChange={(value) => handleSelectAttribute(attribute.pk, value)}
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select an attribute" />
                          </SelectTrigger>
                          <SelectContent>
                            {definitions
                              .filter(
                                (definition) =>
                                  !alreadySelected.has(definition.pk) ||
                                  definition.pk === attribute.attribute_id
                              )
                              .map((definition) => (
                                <SelectItem key={definition.pk} value={definition.pk.toString()}>
                                  {definition.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          aria-label="Create custom attribute"
                          title="Create custom attribute"
                          onClick={() => {
                            setCustomAttributeTarget(attribute.pk);
                            setShowCustomForm(true);
                          }}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Data Type</label>
                      <Input value={attribute.data_type} readOnly />
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Remove attribute"
                        onClick={() => removeAttribute(attribute.pk)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={attribute.required}
                        onCheckedChange={(checked) =>
                          updateAttribute(attribute.pk, "required", checked === true)
                        }
                      />
                      <label className="text-sm">Required</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={attribute.visible_to_company}
                        onCheckedChange={(checked) =>
                          updateAttribute(attribute.pk, "visible_to_company", checked === true)
                        }
                      />
                      <label className="text-sm">Visible to Company</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={attribute.filterable}
                        onCheckedChange={(checked) =>
                          updateAttribute(attribute.pk, "filterable", checked === true)
                        }
                      />
                      <label className="text-sm">Filterable</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-sm">Order</label>
                      <Input
                        type="number"
                        min={0}
                        value={attribute.order}
                        onChange={(event) =>
                          updateAttribute(attribute.pk, "order", Number(event.target.value))
                        }
                        className="w-20"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center">
          <Button type="button" variant="outline" onClick={handleAddAttribute}>
            <Plus className="size-4" />
            Add Attribute
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
